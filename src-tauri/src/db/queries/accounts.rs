use sqlx::SqlitePool;

use crate::db::models::Account;

/// Get all active accounts, ordered by type then name.
pub async fn get_all(pool: &SqlitePool) -> Result<Vec<Account>, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        "SELECT id, name, type, currency_id, balance, credit_limit, billing_day, is_active, created_at
         FROM accounts
         WHERE is_active = 1
         ORDER BY type, name",
    )
    .fetch_all(pool)
    .await
}

/// Get a single account by ID (active or not).
pub async fn get_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Account>, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        "SELECT id, name, type, currency_id, balance, credit_limit, billing_day, is_active, created_at
         FROM accounts
         WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

/// Create a new account and return it.
pub async fn create(
    pool: &SqlitePool,
    id: &str,
    name: &str,
    account_type: &str,
    currency_id: &str,
    credit_limit: Option<i64>,
    billing_day: Option<i32>,
) -> Result<Account, sqlx::Error> {
    sqlx::query(
        "INSERT INTO accounts (id, name, type, currency_id, credit_limit, billing_day)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(id)
    .bind(name)
    .bind(account_type)
    .bind(currency_id)
    .bind(credit_limit)
    .bind(billing_day)
    .execute(pool)
    .await?;

    // Return the newly created account
    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Update an account's mutable fields and return it.
/// Does NOT allow changing `type` (locked after creation).
pub async fn update(
    pool: &SqlitePool,
    id: &str,
    name: Option<&str>,
    currency_id: Option<&str>,
    credit_limit: Option<i64>,
    billing_day: Option<i32>,
) -> Result<Account, sqlx::Error> {
    // Fetch the existing account to preserve unchanged fields
    let existing = get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)?;

    let final_name = name.unwrap_or(&existing.name);
    let final_currency = currency_id.unwrap_or(&existing.currency_id);
    let final_credit_limit = if credit_limit.is_some() {
        credit_limit
    } else {
        existing.credit_limit
    };
    let final_billing_day = if billing_day.is_some() {
        billing_day
    } else {
        existing.billing_day
    };

    sqlx::query(
        "UPDATE accounts
         SET name = ?, currency_id = ?, credit_limit = ?, billing_day = ?
         WHERE id = ?",
    )
    .bind(final_name)
    .bind(final_currency)
    .bind(final_credit_limit)
    .bind(final_billing_day)
    .bind(id)
    .execute(pool)
    .await?;

    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Archive an account (soft delete: set is_active = 0).
pub async fn archive(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE accounts SET is_active = 0 WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Permanently delete an account.
pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM accounts WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Check if an account has any linked transactions.
pub async fn has_transactions(pool: &SqlitePool, account_id: &str) -> Result<bool, sqlx::Error> {
    let count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM transactions WHERE account_id = ?")
            .bind(account_id)
            .fetch_one(pool)
            .await?;
    Ok(count.0 > 0)
}
