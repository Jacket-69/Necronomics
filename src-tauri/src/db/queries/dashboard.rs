use sqlx::SqlitePool;

/// Fetch all transactions for the current month with their currency code.
/// Returns (amount, type, currency_code) tuples.
pub async fn get_monthly_transactions(
    pool: &SqlitePool,
) -> Result<Vec<(i64, String, String)>, sqlx::Error> {
    sqlx::query_as::<_, (i64, String, String)>(
        "SELECT t.amount, t.type, cur.code as currency_code
         FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         JOIN currencies cur ON a.currency_id = cur.id
         WHERE t.date >= date('now', 'start of month')
           AND t.date < date('now', 'start of month', '+1 month')",
    )
    .fetch_all(pool)
    .await
}

/// Fetch expense transactions for the current month with parent category rollup.
/// Returns (category_id, category_name, amount, currency_code) — one row per transaction.
/// Grouping and currency conversion happen in the command layer.
pub async fn get_category_spending(
    pool: &SqlitePool,
) -> Result<Vec<(String, String, i64, String)>, sqlx::Error> {
    sqlx::query_as::<_, (String, String, i64, String)>(
        "SELECT
           COALESCE(parent.id, c.id) as category_id,
           COALESCE(parent.name, c.name) as category_name,
           t.amount,
           cur.code as currency_code
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         LEFT JOIN categories parent ON c.parent_id = parent.id
         JOIN accounts a ON t.account_id = a.id
         JOIN currencies cur ON a.currency_id = cur.id
         WHERE t.type = 'expense'
           AND t.date >= date('now', 'start of month')
           AND t.date < date('now', 'start of month', '+1 month')",
    )
    .fetch_all(pool)
    .await
}

/// Fetch the 10 most recent transactions with joined account, category, and currency info.
/// Returns tuples to avoid needing FromRow on the display struct.
pub async fn get_recent_transactions(
    pool: &SqlitePool,
) -> Result<Vec<(String, String, String, i64, String, String, String, String)>, sqlx::Error> {
    sqlx::query_as::<_, (String, String, String, i64, String, String, String, String)>(
        "SELECT
           t.id, a.name, c.name, t.amount, t.type, t.description, t.date, cur.code
         FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         JOIN categories c ON t.category_id = c.id
         JOIN currencies cur ON a.currency_id = cur.id
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT 10",
    )
    .fetch_all(pool)
    .await
}

/// Get the current month number (1-12) and year.
pub async fn get_current_month_info(pool: &SqlitePool) -> Result<(i32, i32), sqlx::Error> {
    sqlx::query_as::<_, (i32, i32)>(
        "SELECT CAST(strftime('%m', 'now') AS INTEGER), CAST(strftime('%Y', 'now') AS INTEGER)",
    )
    .fetch_one(pool)
    .await
}
