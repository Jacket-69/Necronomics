use sqlx::sqlite::Sqlite;
use sqlx::{QueryBuilder, SqlitePool};

use crate::db::models::{Transaction, TransactionFilter};

/// Apply shared WHERE clauses from a `TransactionFilter` to a `QueryBuilder`.
/// This avoids code duplication between `count_filtered` and `list_filtered`.
fn apply_filters(builder: &mut QueryBuilder<'_, Sqlite>, filter: &TransactionFilter) {
    if let Some(ref account_id) = filter.account_id {
        builder
            .push(" AND account_id = ")
            .push_bind(account_id.clone());
    }
    if let Some(ref category_id) = filter.category_id {
        builder
            .push(" AND category_id = ")
            .push_bind(category_id.clone());
    }
    if let Some(ref transaction_type) = filter.transaction_type {
        builder
            .push(" AND type = ")
            .push_bind(transaction_type.clone());
    }
    if let Some(ref date_from) = filter.date_from {
        builder.push(" AND date >= ").push_bind(date_from.clone());
    }
    if let Some(ref date_to) = filter.date_to {
        builder.push(" AND date <= ").push_bind(date_to.clone());
    }
    if let Some(amount_min) = filter.amount_min {
        builder.push(" AND amount >= ").push_bind(amount_min);
    }
    if let Some(amount_max) = filter.amount_max {
        builder.push(" AND amount <= ").push_bind(amount_max);
    }
    if let Some(ref search) = filter.search {
        let pattern = format!("%{search}%");
        builder.push(" AND description LIKE ").push_bind(pattern);
    }
}

/// Get a single transaction by ID.
pub async fn get_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Transaction>, sqlx::Error> {
    sqlx::query_as::<_, Transaction>(
        "SELECT id, account_id, category_id, amount, type, description, date, notes, created_at
         FROM transactions
         WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

/// Create a new transaction and return it.
pub async fn create(
    pool: &SqlitePool,
    id: &str,
    account_id: &str,
    category_id: &str,
    amount: i64,
    transaction_type: &str,
    description: &str,
    date: &str,
) -> Result<Transaction, sqlx::Error> {
    sqlx::query(
        "INSERT INTO transactions (id, account_id, category_id, amount, type, description, date)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id)
    .bind(account_id)
    .bind(category_id)
    .bind(amount)
    .bind(transaction_type)
    .bind(description)
    .bind(date)
    .execute(pool)
    .await?;

    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Update all fields of a transaction and return it.
pub async fn update(
    pool: &SqlitePool,
    id: &str,
    account_id: &str,
    category_id: &str,
    amount: i64,
    transaction_type: &str,
    description: &str,
    date: &str,
) -> Result<Transaction, sqlx::Error> {
    sqlx::query(
        "UPDATE transactions
         SET account_id = ?, category_id = ?, amount = ?, type = ?, description = ?, date = ?
         WHERE id = ?",
    )
    .bind(account_id)
    .bind(category_id)
    .bind(amount)
    .bind(transaction_type)
    .bind(description)
    .bind(date)
    .bind(id)
    .execute(pool)
    .await?;

    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Delete a transaction by ID.
pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM transactions WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Count transactions matching the given filter criteria.
pub async fn count_filtered(
    pool: &SqlitePool,
    filter: &TransactionFilter,
) -> Result<i64, sqlx::Error> {
    let mut builder: QueryBuilder<Sqlite> =
        QueryBuilder::new("SELECT COUNT(*) FROM transactions WHERE 1=1");

    apply_filters(&mut builder, filter);

    let row: (i64,) = builder.build_query_as().fetch_one(pool).await?;
    Ok(row.0)
}

/// List transactions matching the given filter criteria with sorting and pagination.
pub async fn list_filtered(
    pool: &SqlitePool,
    filter: &TransactionFilter,
) -> Result<Vec<Transaction>, sqlx::Error> {
    let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
        "SELECT id, account_id, category_id, amount, type, description, date, notes, created_at
         FROM transactions WHERE 1=1",
    );

    apply_filters(&mut builder, filter);

    // ORDER BY with whitelist validation to prevent SQL injection
    let valid_columns = ["date", "amount", "description", "type", "created_at"];
    let sort_by = filter
        .sort_by
        .as_deref()
        .filter(|col| valid_columns.contains(col))
        .unwrap_or("date");
    let sort_dir = filter
        .sort_dir
        .as_deref()
        .filter(|dir| *dir == "ASC" || *dir == "DESC")
        .unwrap_or("DESC");

    // Safe to use format! here because both values are validated against whitelists
    builder.push(format!(" ORDER BY {sort_by} {sort_dir}"));

    // Pagination
    let page_size = filter.page_size.unwrap_or(20);
    let page = filter.page.unwrap_or(1);
    let offset = (page - 1) * page_size;

    builder.push(" LIMIT ").push_bind(page_size);
    builder.push(" OFFSET ").push_bind(offset);

    builder
        .build_query_as::<Transaction>()
        .fetch_all(pool)
        .await
}

/// Get the account_id for a given transaction (helper for balance recalculation).
pub async fn get_account_id_for_transaction(
    pool: &SqlitePool,
    transaction_id: &str,
) -> Result<String, sqlx::Error> {
    let row: (String,) = sqlx::query_as("SELECT account_id FROM transactions WHERE id = ?")
        .bind(transaction_id)
        .fetch_one(pool)
        .await?;
    Ok(row.0)
}
