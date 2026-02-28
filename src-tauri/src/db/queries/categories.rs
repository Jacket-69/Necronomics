use sqlx::SqlitePool;

use crate::db::models::Category;

/// Get all active categories, ordered by type, parents first, then by name.
pub async fn get_all(pool: &SqlitePool) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>(
        "SELECT id, name, type, icon, parent_id, is_active, created_at
         FROM categories
         WHERE is_active = 1
         ORDER BY type, parent_id IS NOT NULL, name",
    )
    .fetch_all(pool)
    .await
}

/// Get a single category by ID.
pub async fn get_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>(
        "SELECT id, name, type, icon, parent_id, is_active, created_at
         FROM categories
         WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

/// Create a new category and return it.
pub async fn create(
    pool: &SqlitePool,
    id: &str,
    name: &str,
    category_type: &str,
    icon: Option<&str>,
    parent_id: Option<&str>,
) -> Result<Category, sqlx::Error> {
    sqlx::query(
        "INSERT INTO categories (id, name, type, icon, parent_id)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(id)
    .bind(name)
    .bind(category_type)
    .bind(icon)
    .bind(parent_id)
    .execute(pool)
    .await?;

    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Update a category's mutable fields and return it.
pub async fn update(
    pool: &SqlitePool,
    id: &str,
    name: Option<&str>,
    category_type: Option<&str>,
    icon: Option<Option<&str>>,
    parent_id: Option<Option<&str>>,
) -> Result<Category, sqlx::Error> {
    let existing = get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)?;

    let final_name = name.unwrap_or(&existing.name);
    let final_type = category_type.unwrap_or(&existing.category_type);
    let final_icon = match icon {
        Some(v) => v,
        None => existing.icon.as_deref(),
    };
    let final_parent_id = match parent_id {
        Some(v) => v,
        None => existing.parent_id.as_deref(),
    };

    sqlx::query(
        "UPDATE categories
         SET name = ?, type = ?, icon = ?, parent_id = ?
         WHERE id = ?",
    )
    .bind(final_name)
    .bind(final_type)
    .bind(final_icon)
    .bind(final_parent_id)
    .bind(id)
    .execute(pool)
    .await?;

    get_by_id(pool, id)
        .await?
        .ok_or_else(|| sqlx::Error::RowNotFound)
}

/// Delete a category permanently.
pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Get all subcategories of a parent category.
pub async fn get_subcategories(
    pool: &SqlitePool,
    parent_id: &str,
) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>(
        "SELECT id, name, type, icon, parent_id, is_active, created_at
         FROM categories
         WHERE parent_id = ?",
    )
    .bind(parent_id)
    .fetch_all(pool)
    .await
}

/// Check if a category has any linked transactions.
pub async fn has_transactions(pool: &SqlitePool, category_id: &str) -> Result<bool, sqlx::Error> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM transactions WHERE category_id = ?")
        .bind(category_id)
        .fetch_one(pool)
        .await?;
    Ok(count.0 > 0)
}

/// Count the number of transactions linked to a category.
pub async fn count_transactions(pool: &SqlitePool, category_id: &str) -> Result<i64, sqlx::Error> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM transactions WHERE category_id = ?")
        .bind(category_id)
        .fetch_one(pool)
        .await?;
    Ok(count.0)
}

/// Update the type of all subcategories of a parent category.
pub async fn update_subcategory_types(
    pool: &SqlitePool,
    parent_id: &str,
    new_type: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE categories SET type = ? WHERE parent_id = ?")
        .bind(new_type)
        .bind(parent_id)
        .execute(pool)
        .await?;
    Ok(())
}
