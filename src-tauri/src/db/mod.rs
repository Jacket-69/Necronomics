pub mod models;
pub mod queries;

use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::fs;
use std::path::PathBuf;

/// Initialize the SQLite database connection pool.
/// Creates the database file if it doesn't exist.
pub async fn create_pool(app_data_dir: &PathBuf) -> Result<SqlitePool, sqlx::Error> {
    fs::create_dir_all(app_data_dir).ok();
    let db_path = app_data_dir.join("necronomics.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Enable WAL mode for better concurrency
    sqlx::query("PRAGMA journal_mode=WAL;")
        .execute(&pool)
        .await?;

    // Enable foreign keys
    sqlx::query("PRAGMA foreign_keys=ON;")
        .execute(&pool)
        .await?;

    Ok(pool)
}

/// Run all pending migrations in order.
/// Creates the `_migrations` tracking table if it doesn't exist.
pub async fn run_migrations(pool: &SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
    // Create migrations tracking table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
    )
    .execute(pool)
    .await?;

    // Migration files embedded at compile time
    let migrations: Vec<(&str, &str)> = vec![
        (
            "001_initial_schema",
            include_str!("migrations/001_initial_schema.sql"),
        ),
        (
            "002_seed_currencies",
            include_str!("migrations/002_seed_currencies.sql"),
        ),
        (
            "003_seed_categories",
            include_str!("migrations/003_seed_categories.sql"),
        ),
        (
            "004_migrate_category_icons",
            include_str!("migrations/004_migrate_category_icons.sql"),
        ),
        (
            "005_create_installments",
            include_str!("migrations/005_create_installments.sql"),
        ),
    ];

    for (name, sql) in migrations {
        // Check if migration has already been applied
        let applied: Option<(i64,)> = sqlx::query_as("SELECT id FROM _migrations WHERE name = ?")
            .bind(name)
            .fetch_optional(pool)
            .await?;

        if applied.is_none() {
            // Execute migration SQL (may contain multiple statements)
            let statements: Vec<&str> = sql
                .split(';')
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .collect();

            for statement in statements {
                sqlx::query(statement).execute(pool).await?;
            }

            // Record migration as applied
            sqlx::query("INSERT INTO _migrations (name) VALUES (?)")
                .bind(name)
                .execute(pool)
                .await?;

            println!("Applied migration: {name}");
        }
    }

    Ok(())
}
