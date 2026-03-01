use chrono::{Datelike, NaiveDate};
use sqlx::{Sqlite, SqlitePool};
use tauri::State;

use crate::db::models::{
    CreditUtilization, CreateDebtInput, Debt, DebtFilter, DebtProjectionEntry, DebtWithInstallments,
    Installment, MonthlyProjection, UpdateDebtInput,
};
use crate::db::queries::debts;

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

/// Calculate due dates for installments based on billing_day or start_date day-of-month.
fn calculate_due_dates(
    start_date: &str,
    billing_day: Option<i32>,
    total_installments: i32,
) -> Result<Vec<String>, String> {
    let start = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")
        .map_err(|e| format!("Fecha de inicio invalida: {e}"))?;

    let day = billing_day.unwrap_or(start.day() as i32);
    let mut dates = Vec::new();

    for i in 1..=total_installments {
        // Calculate target month by adding i months from start
        let months_offset = start.month0() as i32 + i;
        let target_year = start.year() + (months_offset / 12);
        let target_month = (months_offset % 12) + 1;

        // Clamp day to last day of target month
        let last_day = last_day_of_month(target_year, target_month as u32);
        let clamped_day = (day as u32).min(last_day);

        let date = NaiveDate::from_ymd_opt(target_year, target_month as u32, clamped_day)
            .ok_or_else(|| format!("No se pudo calcular fecha para cuota {i}"))?;

        dates.push(date.format("%Y-%m-%d").to_string());
    }

    Ok(dates)
}

/// Get the last day of a given month/year.
fn last_day_of_month(year: i32, month: u32) -> u32 {
    // Get the first day of the next month and subtract one day
    if month == 12 {
        NaiveDate::from_ymd_opt(year + 1, 1, 1)
    } else {
        NaiveDate::from_ymd_opt(year, month + 1, 1)
    }
    .map(|d| d.pred_opt().map(|p| p.day()).unwrap_or(28))
    .unwrap_or(28)
}

/// Create a new debt and auto-generate all installment rows.
#[tauri::command]
pub async fn create_debt(
    pool: State<'_, SqlitePool>,
    input: CreateDebtInput,
) -> Result<DebtWithInstallments, String> {
    // Validate inputs
    if input.description.is_empty() {
        return Err("La descripcion es obligatoria".into());
    }
    if input.original_amount <= 0 {
        return Err("El monto original debe ser mayor a 0".into());
    }
    if input.total_installments <= 0 {
        return Err("El numero de cuotas debe ser mayor a 0".into());
    }
    if input.monthly_payment <= 0 {
        return Err("El monto por cuota debe ser mayor a 0".into());
    }
    if input.start_date.is_empty() {
        return Err("La fecha de inicio es obligatoria".into());
    }

    // Validate account exists and is active
    let account: Option<(String, String, i32, Option<i32>)> = sqlx::query_as(
        "SELECT id, name, is_active, billing_day FROM accounts WHERE id = ?",
    )
    .bind(&input.account_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    let (_, account_name, is_active, billing_day) = match account {
        None => return Err(format!("Cuenta no encontrada: {}", input.account_id)),
        Some(a) => a,
    };

    if is_active != 1 {
        return Err("No se puede crear deudas en una cuenta archivada".into());
    }

    // Calculate due dates
    let due_dates =
        calculate_due_dates(&input.start_date, billing_day, input.total_installments)?;

    let debt_id = uuid::Uuid::new_v4().to_string();

    // Begin atomic transaction
    let mut db_txn = pool.begin().await.map_err(|e| e.to_string())?;

    // Insert debt
    sqlx::query(
        "INSERT INTO debts (id, account_id, description, original_amount, total_installments, paid_installments, monthly_payment, interest_rate, start_date, notes)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)",
    )
    .bind(&debt_id)
    .bind(&input.account_id)
    .bind(&input.description)
    .bind(input.original_amount)
    .bind(input.total_installments)
    .bind(input.monthly_payment)
    .bind(input.interest_rate)
    .bind(&input.start_date)
    .bind(input.notes.as_deref())
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    // Insert all installment rows
    let mut installments = Vec::new();
    for (i, due_date) in due_dates.iter().enumerate() {
        let inst_id = uuid::Uuid::new_v4().to_string();
        let number = (i + 1) as i32;

        sqlx::query(
            "INSERT INTO installments (id, debt_id, installment_number, due_date, amount, status)
             VALUES (?, ?, ?, ?, ?, 'pending')",
        )
        .bind(&inst_id)
        .bind(&debt_id)
        .bind(number)
        .bind(due_date)
        .bind(input.monthly_payment)
        .execute(&mut *db_txn)
        .await
        .map_err(|e| e.to_string())?;

        installments.push(Installment {
            id: inst_id,
            debt_id: debt_id.clone(),
            installment_number: number,
            due_date: due_date.clone(),
            amount: input.monthly_payment,
            status: "pending".to_string(),
            actual_payment_date: None,
            transaction_id: None,
            created_at: String::new(), // Will be set by DB default
        });
    }

    db_txn.commit().await.map_err(|e| e.to_string())?;

    // Fetch the created debt with computed paid_installments
    let debt = debts::get_debt_by_id(&pool, &debt_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Deuda creada pero no encontrada".to_string())?;

    // Fetch installments from DB to get proper created_at
    let installments = debts::list_installments_for_debt(&pool, &debt_id)
        .await
        .map_err(|e| e.to_string())?;

    let next_due_date = installments.first().map(|i| i.due_date.clone());
    let remaining_amount: i64 = installments
        .iter()
        .filter(|i| i.status == "pending")
        .map(|i| i.amount)
        .sum();

    Ok(DebtWithInstallments {
        debt,
        installments,
        account_name,
        next_due_date,
        remaining_amount,
    })
}

/// Update an existing debt (metadata fields only).
#[tauri::command]
pub async fn update_debt(
    pool: State<'_, SqlitePool>,
    id: String,
    input: UpdateDebtInput,
) -> Result<Debt, String> {
    // Verify debt exists
    let existing = debts::get_debt_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Deuda no encontrada: {id}"))?;

    let final_description = input.description.as_deref().unwrap_or(&existing.description);
    let final_interest_rate = input.interest_rate.unwrap_or(existing.interest_rate);
    let final_is_active = input
        .is_active
        .map(|b| if b { 1 } else { 0 })
        .unwrap_or(existing.is_active);
    let final_notes = input.notes.as_deref().or(existing.notes.as_deref());

    sqlx::query(
        "UPDATE debts SET description = ?, interest_rate = ?, is_active = ?, notes = ? WHERE id = ?",
    )
    .bind(final_description)
    .bind(final_interest_rate)
    .bind(final_is_active)
    .bind(final_notes)
    .bind(&id)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    debts::get_debt_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Deuda actualizada pero no encontrada".into())
}

/// Delete a debt. CASCADE handles installments. Auto-created transactions remain.
#[tauri::command]
pub async fn delete_debt(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let _existing = debts::get_debt_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Deuda no encontrada: {id}"))?;

    debts::delete_debt(&pool, &id)
        .await
        .map_err(|e| e.to_string())
}

/// List debts with optional filtering.
#[tauri::command]
pub async fn list_debts(
    pool: State<'_, SqlitePool>,
    filter: DebtFilter,
) -> Result<Vec<Debt>, String> {
    debts::list_debts(&pool, &filter)
        .await
        .map_err(|e| e.to_string())
}

/// Get full debt detail with installments for expanded card view.
#[tauri::command]
pub async fn get_debt_detail(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<DebtWithInstallments, String> {
    let debt = debts::get_debt_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Deuda no encontrada: {id}"))?;

    let installments = debts::list_installments_for_debt(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    let account_name = debts::get_account_name_for_debt(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    let next_due_date = installments
        .iter()
        .find(|i| i.status == "pending")
        .map(|i| i.due_date.clone());

    let remaining_amount: i64 = installments
        .iter()
        .filter(|i| i.status == "pending")
        .map(|i| i.amount)
        .sum();

    Ok(DebtWithInstallments {
        debt,
        installments,
        account_name,
        next_due_date,
        remaining_amount,
    })
}

/// Mark an installment as paid, atomically creating an expense transaction.
#[tauri::command]
pub async fn mark_installment_paid(
    pool: State<'_, SqlitePool>,
    installment_id: String,
    category_id: String,
) -> Result<Installment, String> {
    // Fetch installment
    let installment = debts::get_installment_by_id(&pool, &installment_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Cuota no encontrada: {installment_id}"))?;

    if installment.status == "paid" {
        return Err("Esta cuota ya fue pagada".into());
    }

    // Fetch debt for account_id and description
    let debt = debts::get_debt_by_id(&pool, &installment.debt_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Deuda no encontrada para esta cuota".to_string())?;

    // Validate account is active
    let account: Option<(i32,)> =
        sqlx::query_as("SELECT is_active FROM accounts WHERE id = ?")
            .bind(&debt.account_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

    match account {
        None => return Err("Cuenta no encontrada".into()),
        Some((is_active,)) if is_active != 1 => {
            return Err("No se puede registrar pagos en una cuenta archivada".into());
        }
        _ => {}
    }

    // Validate category exists, is active, and is expense type
    let category: Option<(String, i32)> =
        sqlx::query_as("SELECT type, is_active FROM categories WHERE id = ?")
            .bind(&category_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

    match category {
        None => return Err(format!("Categoria no encontrada: {category_id}")),
        Some((_, is_active)) if is_active != 1 => {
            return Err("No se puede usar una categoria inactiva".into());
        }
        Some((cat_type, _)) if cat_type != "expense" => {
            return Err("La categoria debe ser de tipo 'expense' para pagos de cuotas".into());
        }
        _ => {}
    }

    let txn_id = uuid::Uuid::new_v4().to_string();
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let txn_description = format!(
        "Pago cuota {} - {}",
        installment.installment_number, debt.description
    );

    // Begin atomic transaction
    let mut db_txn = pool.begin().await.map_err(|e| e.to_string())?;

    // 1. Insert expense transaction
    sqlx::query(
        "INSERT INTO transactions (id, account_id, category_id, amount, type, description, date)
         VALUES (?, ?, ?, ?, 'expense', ?, ?)",
    )
    .bind(&txn_id)
    .bind(&debt.account_id)
    .bind(&category_id)
    .bind(installment.amount)
    .bind(&txn_description)
    .bind(&today)
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    // 2. Update installment status
    sqlx::query(
        "UPDATE installments SET status = 'paid', actual_payment_date = ?, transaction_id = ? WHERE id = ?",
    )
    .bind(&today)
    .bind(&txn_id)
    .bind(&installment_id)
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    // 3. Recalculate account balance
    recalculate_account_balance(&mut db_txn, &debt.account_id).await?;

    // 4. Update paid_installments counter on debts table
    sqlx::query(
        "UPDATE debts SET paid_installments = (SELECT COUNT(*) FROM installments WHERE debt_id = ? AND status = 'paid') WHERE id = ?",
    )
    .bind(&installment.debt_id)
    .bind(&installment.debt_id)
    .execute(&mut *db_txn)
    .await
    .map_err(|e| e.to_string())?;

    db_txn.commit().await.map_err(|e| e.to_string())?;

    // Fetch updated installment
    debts::get_installment_by_id(&pool, &installment_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Cuota actualizada pero no encontrada".into())
}

/// Get credit utilization for all credit-card accounts.
#[tauri::command]
pub async fn get_credit_utilization(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<CreditUtilization>, String> {
    // Fetch all active credit-card accounts with credit_limit
    let accounts: Vec<(String, String, i64, i64)> = sqlx::query_as(
        "SELECT id, name, balance, credit_limit
         FROM accounts
         WHERE type = 'credit_card' AND is_active = 1 AND credit_limit IS NOT NULL",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    let mut utilizations = Vec::new();

    for (account_id, account_name, balance, credit_limit) in accounts {
        // Get remaining debt commitments for this account
        let remaining: (i64,) = sqlx::query_as(
            "SELECT COALESCE(SUM(i.amount), 0)
             FROM installments i
             JOIN debts d ON i.debt_id = d.id
             WHERE d.account_id = ? AND d.is_active = 1 AND i.status = 'pending'",
        )
        .bind(&account_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        let available_credit = credit_limit - balance;

        utilizations.push(CreditUtilization {
            account_id,
            account_name,
            credit_limit,
            current_balance: balance,
            remaining_debt_commitments: remaining.0,
            available_credit,
        });
    }

    Ok(utilizations)
}

/// Get 6-month payment projections grouped by month and debt.
#[tauri::command]
pub async fn get_payment_projections(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<MonthlyProjection>, String> {
    // Query pending installments for active debts, due in next 6 months
    let rows: Vec<(String, String, String, i64)> = sqlx::query_as(
        "SELECT i.debt_id, d.description, strftime('%Y-%m', i.due_date) as month, SUM(i.amount) as total
         FROM installments i
         JOIN debts d ON i.debt_id = d.id
         WHERE i.status = 'pending'
           AND i.due_date >= date('now')
           AND i.due_date < date('now', '+6 months')
           AND d.is_active = 1
         GROUP BY i.debt_id, d.description, month
         ORDER BY month, d.description",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    // Group by month
    let mut projections: Vec<MonthlyProjection> = Vec::new();

    for (debt_id, description, month, amount) in rows {
        let entry = DebtProjectionEntry {
            debt_id,
            debt_description: description,
            amount,
        };

        if let Some(proj) = projections.iter_mut().find(|p| p.month == month) {
            proj.total += amount;
            proj.debts.push(entry);
        } else {
            projections.push(MonthlyProjection {
                month: month.clone(),
                debts: vec![entry],
                total: amount,
            });
        }
    }

    Ok(projections)
}
