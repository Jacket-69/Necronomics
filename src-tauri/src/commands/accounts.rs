use sqlx::SqlitePool;
use tauri::State;

use crate::db::models::{Account, Currency};
use crate::db::queries::accounts;

/// List all active accounts, ordered by type then name.
#[tauri::command]
pub async fn list_accounts(pool: State<'_, SqlitePool>) -> Result<Vec<Account>, String> {
    accounts::get_all(&pool).await.map_err(|e| e.to_string())
}

/// Get a single account by ID.
#[tauri::command]
pub async fn get_account(pool: State<'_, SqlitePool>, id: String) -> Result<Account, String> {
    accounts::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Cuenta no encontrada: {id}"))
}

/// Create a new account. Validates credit_card required fields.
#[tauri::command]
pub async fn create_account(
    pool: State<'_, SqlitePool>,
    name: String,
    account_type: String,
    currency_id: String,
    credit_limit: Option<i64>,
    billing_day: Option<i32>,
) -> Result<Account, String> {
    // Validate credit_card required fields
    if account_type == "credit_card" {
        if credit_limit.is_none() {
            return Err("El limite de credito es requerido para tarjetas de credito".into());
        }
        if billing_day.is_none() {
            return Err("El dia de facturacion es requerido para tarjetas de credito".into());
        }
    }

    let id = uuid::Uuid::new_v4().to_string();
    accounts::create(
        &pool,
        &id,
        &name,
        &account_type,
        &currency_id,
        credit_limit,
        billing_day,
    )
    .await
    .map_err(|e| e.to_string())
}

/// Update an existing account. Type is locked after creation.
#[tauri::command]
pub async fn update_account(
    pool: State<'_, SqlitePool>,
    id: String,
    name: Option<String>,
    currency_id: Option<String>,
    credit_limit: Option<i64>,
    billing_day: Option<i32>,
) -> Result<Account, String> {
    // Fetch existing account to validate credit_card constraints
    let existing = accounts::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Cuenta no encontrada: {id}"))?;

    // For credit_card accounts, ensure credit_limit and billing_day remain present
    if existing.account_type == "credit_card" {
        let final_credit_limit = credit_limit.or(existing.credit_limit);
        let final_billing_day = billing_day.or(existing.billing_day);

        if final_credit_limit.is_none() {
            return Err("El limite de credito es requerido para tarjetas de credito".into());
        }
        if final_billing_day.is_none() {
            return Err("El dia de facturacion es requerido para tarjetas de credito".into());
        }
    }

    accounts::update(
        &pool,
        &id,
        name.as_deref(),
        currency_id.as_deref(),
        credit_limit,
        billing_day,
    )
    .await
    .map_err(|e| e.to_string())
}

/// Archive an account (soft delete).
#[tauri::command]
pub async fn archive_account(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    accounts::archive(&pool, &id)
        .await
        .map_err(|e| e.to_string())
}

/// Permanently delete an account. Blocked if transactions exist.
#[tauri::command]
pub async fn delete_account(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let has_txns = accounts::has_transactions(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    if has_txns {
        return Err("No se puede eliminar una cuenta con transacciones. Use archivar.".into());
    }

    accounts::delete(&pool, &id)
        .await
        .map_err(|e| e.to_string())
}

/// List all available currencies.
#[tauri::command]
pub async fn list_currencies(pool: State<'_, SqlitePool>) -> Result<Vec<Currency>, String> {
    sqlx::query_as::<_, Currency>(
        "SELECT id, code, name, symbol, decimal_places, created_at FROM currencies ORDER BY code",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}
