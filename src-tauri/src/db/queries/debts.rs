use sqlx::sqlite::Sqlite;
use sqlx::{QueryBuilder, SqlitePool};

use crate::db::models::{Debt, DebtFilter, Installment};

/// Get a single debt by ID with computed paid_installments from installments table.
pub async fn get_debt_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Debt>, sqlx::Error> {
    sqlx::query_as::<_, Debt>(
        "SELECT d.id, d.account_id, d.description, d.original_amount, d.total_installments,
                (SELECT COUNT(*) FROM installments WHERE debt_id = d.id AND status = 'paid') as paid_installments,
                d.monthly_payment, d.interest_rate, d.start_date, d.is_active, d.notes, d.created_at
         FROM debts d
         WHERE d.id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

/// List debts with dynamic filtering and computed paid_installments.
pub async fn list_debts(
    pool: &SqlitePool,
    filter: &DebtFilter,
) -> Result<Vec<Debt>, sqlx::Error> {
    let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
        "SELECT d.id, d.account_id, d.description, d.original_amount, d.total_installments,
                (SELECT COUNT(*) FROM installments WHERE debt_id = d.id AND status = 'paid') as paid_installments,
                d.monthly_payment, d.interest_rate, d.start_date, d.is_active, d.notes, d.created_at
         FROM debts d WHERE 1=1",
    );

    if let Some(ref account_id) = filter.account_id {
        builder
            .push(" AND d.account_id = ")
            .push_bind(account_id.clone());
    }
    if let Some(is_active) = filter.is_active {
        builder
            .push(" AND d.is_active = ")
            .push_bind(if is_active { 1 } else { 0 });
    }
    if let Some(ref search) = filter.search {
        let pattern = format!("%{search}%");
        builder.push(" AND d.description LIKE ").push_bind(pattern);
    }

    builder.push(" ORDER BY d.created_at DESC");

    builder.build_query_as::<Debt>().fetch_all(pool).await
}

/// Create a new debt row.
pub async fn create_debt(
    pool: &SqlitePool,
    id: &str,
    account_id: &str,
    description: &str,
    original_amount: i64,
    total_installments: i32,
    monthly_payment: i64,
    interest_rate: f64,
    start_date: &str,
    notes: Option<&str>,
) -> Result<Debt, sqlx::Error> {
    sqlx::query(
        "INSERT INTO debts (id, account_id, description, original_amount, total_installments, paid_installments, monthly_payment, interest_rate, start_date, notes)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)",
    )
    .bind(id)
    .bind(account_id)
    .bind(description)
    .bind(original_amount)
    .bind(total_installments)
    .bind(monthly_payment)
    .bind(interest_rate)
    .bind(start_date)
    .bind(notes)
    .execute(pool)
    .await?;

    get_debt_by_id(pool, id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

/// Delete a debt by ID. CASCADE handles installments.
pub async fn delete_debt(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM debts WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// List all installments for a given debt, ordered by installment number.
pub async fn list_installments_for_debt(
    pool: &SqlitePool,
    debt_id: &str,
) -> Result<Vec<Installment>, sqlx::Error> {
    sqlx::query_as::<_, Installment>(
        "SELECT id, debt_id, installment_number, due_date, amount, status, actual_payment_date, transaction_id, created_at
         FROM installments
         WHERE debt_id = ?
         ORDER BY installment_number ASC",
    )
    .bind(debt_id)
    .fetch_all(pool)
    .await
}

/// Get a single installment by ID.
pub async fn get_installment_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Option<Installment>, sqlx::Error> {
    sqlx::query_as::<_, Installment>(
        "SELECT id, debt_id, installment_number, due_date, amount, status, actual_payment_date, transaction_id, created_at
         FROM installments
         WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

/// Get the account name for a debt (joins debts with accounts).
pub async fn get_account_name_for_debt(
    pool: &SqlitePool,
    debt_id: &str,
) -> Result<String, sqlx::Error> {
    let row: (String,) = sqlx::query_as(
        "SELECT a.name FROM accounts a JOIN debts d ON a.id = d.account_id WHERE d.id = ?",
    )
    .bind(debt_id)
    .fetch_one(pool)
    .await?;
    Ok(row.0)
}
