use sqlx::{Sqlite, SqlitePool};
use tauri::State;

use crate::db::models::{
    AccountBalance, BalanceSummary, PaginatedResult, Transaction, TransactionFilter,
};
use crate::db::queries::transactions;

/// Recalculate and update an account's balance based on the sum of its transactions.
/// Must be called within an active SQL transaction.
async fn recalculate_account_balance(
    db_txn: &mut sqlx::Transaction<'_, Sqlite>,
    account_id: &str,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE accounts SET balance = (
            SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
            FROM transactions WHERE account_id = ?
         ) WHERE id = ?",
    )
    .bind(account_id)
    .bind(account_id)
    .execute(&mut **db_txn)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Create a new transaction and atomically update the account balance.
#[tauri::command]
pub async fn create_transaction(
    pool: State<'_, SqlitePool>,
    account_id: String,
    category_id: String,
    amount: i64,
    transaction_type: String,
    description: String,
    date: String,
) -> Result<Transaction, String> {
    // Validate amount
    if amount <= 0 {
        return Err("El monto debe ser mayor a 0".into());
    }

    // Validate date is non-empty
    if date.is_empty() {
        return Err("La fecha es obligatoria".into());
    }

    // Validate transaction type
    if transaction_type != "income" && transaction_type != "expense" {
        return Err("El tipo de transaccion debe ser 'income' o 'expense'".into());
    }

    // Validate account exists and is active
    let account: Option<(String, i32)> =
        sqlx::query_as("SELECT id, is_active FROM accounts WHERE id = ?")
            .bind(&account_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

    match account {
        None => return Err(format!("Cuenta no encontrada: {account_id}")),
        Some((_, is_active)) if is_active != 1 => {
            return Err("No se puede agregar transacciones a una cuenta archivada".into());
        }
        _ => {}
    }

    // Validate category exists and is active
    let category: Option<(String, String, i32)> =
        sqlx::query_as("SELECT id, type, is_active FROM categories WHERE id = ?")
            .bind(&category_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

    match category {
        None => return Err(format!("Categoria no encontrada: {category_id}")),
        Some((_, _, is_active)) if is_active != 1 => {
            return Err("No se puede usar una categoria inactiva".into());
        }
        Some((_, cat_type, _)) if cat_type != transaction_type => {
            return Err(format!(
                "El tipo de transaccion '{transaction_type}' no coincide con el tipo de categoria '{cat_type}'"
            ));
        }
        _ => {}
    }

    let id = uuid::Uuid::new_v4().to_string();

    // Atomic: insert transaction + recalculate balance
    let mut db_txn = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO transactions (id, account_id, category_id, amount, type, description, date)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&account_id)
    .bind(&category_id)
    .bind(amount)
    .bind(&transaction_type)
    .bind(&description)
    .bind(&date)
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    recalculate_account_balance(&mut db_txn, &account_id).await?;

    db_txn.commit().await.map_err(|e| e.to_string())?;

    transactions::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Transaccion creada pero no encontrada".into())
}

/// Update an existing transaction and atomically recalculate affected account balances.
#[tauri::command]
pub async fn update_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
    account_id: Option<String>,
    category_id: Option<String>,
    amount: Option<i64>,
    transaction_type: Option<String>,
    description: Option<String>,
    date: Option<String>,
) -> Result<Transaction, String> {
    // Fetch existing transaction
    let existing = transactions::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Transaccion no encontrada: {id}"))?;

    let final_account_id = account_id.as_deref().unwrap_or(&existing.account_id);
    let final_category_id = category_id.as_deref().unwrap_or(&existing.category_id);
    let final_amount = amount.unwrap_or(existing.amount);
    let final_type = transaction_type
        .as_deref()
        .unwrap_or(&existing.transaction_type);
    let final_description = description.as_deref().unwrap_or(&existing.description);
    let final_date = date.as_deref().unwrap_or(&existing.date);

    // Validate amount if provided
    if final_amount <= 0 {
        return Err("El monto debe ser mayor a 0".into());
    }

    // Validate type if provided
    if final_type != "income" && final_type != "expense" {
        return Err("El tipo de transaccion debe ser 'income' o 'expense'".into());
    }

    let old_account_id = existing.account_id.clone();
    let account_changed = final_account_id != old_account_id;

    // Atomic: update transaction + recalculate balance(s)
    let mut db_txn = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE transactions
         SET account_id = ?, category_id = ?, amount = ?, type = ?, description = ?, date = ?
         WHERE id = ?",
    )
    .bind(final_account_id)
    .bind(final_category_id)
    .bind(final_amount)
    .bind(final_type)
    .bind(final_description)
    .bind(final_date)
    .bind(&id)
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    // Recalculate old account balance
    recalculate_account_balance(&mut db_txn, &old_account_id).await?;

    // If account changed, also recalculate new account balance
    if account_changed {
        recalculate_account_balance(&mut db_txn, final_account_id).await?;
    }

    db_txn.commit().await.map_err(|e| e.to_string())?;

    transactions::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Transaccion actualizada pero no encontrada".into())
}

/// Delete a transaction and atomically recalculate the account balance.
#[tauri::command]
pub async fn delete_transaction(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    // Fetch existing to get account_id
    let existing = transactions::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Transaccion no encontrada: {id}"))?;

    let account_id = existing.account_id;

    // Atomic: delete transaction + recalculate balance
    let mut db_txn = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM transactions WHERE id = ?")
        .bind(&id)
        .execute(&mut *db_txn)
        .await
        .map_err(|e| e.to_string())?;

    recalculate_account_balance(&mut db_txn, &account_id).await?;

    db_txn.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

/// List transactions with dynamic filtering, sorting, and pagination.
#[tauri::command]
pub async fn list_transactions(
    pool: State<'_, SqlitePool>,
    filter: TransactionFilter,
) -> Result<PaginatedResult<Transaction>, String> {
    let page = filter.page.unwrap_or(1);
    let page_size = filter.page_size.unwrap_or(20);

    let total = transactions::count_filtered(&pool, &filter)
        .await
        .map_err(|e| e.to_string())?;
    let data = transactions::list_filtered(&pool, &filter)
        .await
        .map_err(|e| e.to_string())?;

    let total_pages = if total == 0 {
        0
    } else {
        (total + page_size - 1) / page_size
    };

    Ok(PaginatedResult {
        data,
        total,
        page,
        page_size,
        total_pages,
    })
}

/// Get a balance summary for all active accounts with optional currency consolidation.
#[tauri::command]
pub async fn get_balance_summary(
    pool: State<'_, SqlitePool>,
    base_currency_id: Option<String>,
) -> Result<BalanceSummary, String> {
    // Fetch all active accounts with their currency code
    let accounts: Vec<(String, String, i64, String)> = sqlx::query_as(
        "SELECT a.id, a.name, a.balance, c.code
         FROM accounts a
         JOIN currencies c ON a.currency_id = c.id
         WHERE a.is_active = 1",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    let account_balances: Vec<AccountBalance> = accounts
        .iter()
        .map(|(id, name, balance, code)| AccountBalance {
            account_id: id.clone(),
            account_name: name.clone(),
            balance: *balance,
            currency_code: code.clone(),
        })
        .collect();

    // Determine base currency
    let base_cur_id = base_currency_id.unwrap_or_else(|| "cur_clp".to_string());

    // Get base currency code
    let base_currency_code: String =
        sqlx::query_as::<_, (String,)>("SELECT code FROM currencies WHERE id = ?")
            .bind(&base_cur_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?
            .map(|(code,)| code)
            .unwrap_or_else(|| "CLP".to_string());

    // Calculate consolidated total
    let mut consolidated: i64 = 0;
    let mut has_any = false;

    for (_, _, balance, currency_code) in &accounts {
        if *currency_code == base_currency_code {
            consolidated += balance;
            has_any = true;
        } else {
            // Look up exchange rate from account currency to base currency
            let rate: Option<(f64,)> = sqlx::query_as(
                "SELECT rate FROM exchange_rates
                 WHERE from_currency_id = (SELECT id FROM currencies WHERE code = ?)
                   AND to_currency_id = ?
                 ORDER BY date DESC LIMIT 1",
            )
            .bind(currency_code)
            .bind(&base_cur_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

            if let Some((rate_val,)) = rate {
                #[allow(clippy::cast_precision_loss)]
                let converted = (*balance as f64 * rate_val).round() as i64;
                consolidated += converted;
                has_any = true;
            }
            // If no rate found, skip this account in consolidation
        }
    }

    let consolidated_total = if has_any { Some(consolidated) } else { None };

    Ok(BalanceSummary {
        accounts: account_balances,
        consolidated_total,
        base_currency_code,
    })
}
