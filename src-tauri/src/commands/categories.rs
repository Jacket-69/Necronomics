use sqlx::SqlitePool;
use tauri::State;

use crate::db::models::Category;
use crate::db::queries::categories;

/// List all active categories, ordered by type, parents first, then by name.
#[tauri::command]
pub async fn list_categories(pool: State<'_, SqlitePool>) -> Result<Vec<Category>, String> {
    categories::get_all(&pool).await.map_err(|e| e.to_string())
}

/// Get a single category by ID.
#[tauri::command]
pub async fn get_category(pool: State<'_, SqlitePool>, id: String) -> Result<Category, String> {
    categories::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Categoria no encontrada: {id}"))
}

/// Create a new category. If parent_id is provided, inherits type from parent.
#[tauri::command]
pub async fn create_category(
    pool: State<'_, SqlitePool>,
    name: String,
    category_type: String,
    icon: Option<String>,
    parent_id: Option<String>,
) -> Result<Category, String> {
    let mut final_type = category_type;

    // Validate parent if provided
    if let Some(ref pid) = parent_id {
        let parent = categories::get_by_id(&pool, pid)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| format!("Categoria padre no encontrada: {pid}"))?;

        // Enforce single-level nesting: parent must not have a parent itself
        if parent.parent_id.is_some() {
            return Err(
                "No se puede crear una subcategoria de otra subcategoria (solo un nivel de anidamiento permitido)".into(),
            );
        }

        // Inherit type from parent
        final_type = parent.category_type;
    }

    let id = uuid::Uuid::new_v4().to_string();
    categories::create(
        &pool,
        &id,
        &name,
        &final_type,
        icon.as_deref(),
        parent_id.as_deref(),
    )
    .await
    .map_err(|e| e.to_string())
}

/// Update an existing category with business rule enforcement.
#[tauri::command]
pub async fn update_category(
    pool: State<'_, SqlitePool>,
    id: String,
    name: Option<String>,
    category_type: Option<String>,
    icon: Option<String>,
    parent_id: Option<String>,
) -> Result<Category, String> {
    let existing = categories::get_by_id(&pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Categoria no encontrada: {id}"))?;

    let subcategories = categories::get_subcategories(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    // Type change logic
    if let Some(ref new_type) = category_type {
        if *new_type != existing.category_type {
            // Check if this category itself has transactions
            let has_txns = categories::has_transactions(&pool, &id)
                .await
                .map_err(|e| e.to_string())?;
            if has_txns {
                return Err(
                    "No se puede cambiar el tipo de una categoria con transacciones vinculadas"
                        .into(),
                );
            }

            // Check if any subcategory has transactions
            for sub in &subcategories {
                let sub_has_txns = categories::has_transactions(&pool, &sub.id)
                    .await
                    .map_err(|e| e.to_string())?;
                if sub_has_txns {
                    return Err(
                        "No se puede cambiar el tipo de una categoria con transacciones vinculadas"
                            .into(),
                    );
                }
            }

            // Cascade type change to subcategories
            if !subcategories.is_empty() {
                categories::update_subcategory_types(&pool, &id, new_type)
                    .await
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    // Parent change logic
    if let Some(ref new_parent_id) = parent_id {
        // Cannot move a parent category (one that has subcategories) under another
        if !subcategories.is_empty() {
            return Err("No se puede mover una categoria padre a otra categoria".into());
        }

        // The new parent must exist and must be a root category
        if !new_parent_id.is_empty() {
            let new_parent = categories::get_by_id(&pool, new_parent_id)
                .await
                .map_err(|e| e.to_string())?
                .ok_or_else(|| format!("Categoria padre no encontrada: {new_parent_id}"))?;

            if new_parent.parent_id.is_some() {
                return Err(
                    "No se puede crear una subcategoria de otra subcategoria (solo un nivel de anidamiento permitido)".into(),
                );
            }

            // Enforce same-type constraint
            let effective_type = category_type.as_deref().unwrap_or(&existing.category_type);
            if new_parent.category_type != effective_type {
                return Err(
                    "El tipo de la subcategoria debe coincidir con el tipo de la categoria padre"
                        .into(),
                );
            }
        }
    }

    // Build the update with Option<Option<&str>> for nullable fields
    let icon_update: Option<Option<&str>> = Some(icon.as_deref());
    let parent_update: Option<Option<&str>> = if parent_id.is_some() {
        Some(parent_id.as_deref())
    } else {
        None
    };

    categories::update(
        &pool,
        &id,
        name.as_deref(),
        category_type.as_deref(),
        icon_update,
        parent_update,
    )
    .await
    .map_err(|e| e.to_string())
}

/// Delete a category. Blocked if it or its subcategories have transactions.
#[tauri::command]
pub async fn delete_category(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    // Check if the category itself has transactions
    let txn_count = categories::count_transactions(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    if txn_count > 0 {
        return Err(format!(
            "Esta categoria tiene {txn_count} transacciones vinculadas. Reasigna las transacciones a otra categoria antes de eliminar."
        ));
    }

    // If category is a parent, check all subcategories
    let subcategories = categories::get_subcategories(&pool, &id)
        .await
        .map_err(|e| e.to_string())?;

    for sub in &subcategories {
        let sub_txn_count = categories::count_transactions(&pool, &sub.id)
            .await
            .map_err(|e| e.to_string())?;

        if sub_txn_count > 0 {
            return Err(format!(
                "La subcategoria '{}' tiene {} transacciones vinculadas. Reasigna las transacciones a otra categoria antes de eliminar.",
                sub.name, sub_txn_count
            ));
        }
    }

    // Delete subcategories first, then the parent
    for sub in &subcategories {
        categories::delete(&pool, &sub.id)
            .await
            .map_err(|e| e.to_string())?;
    }

    categories::delete(&pool, &id)
        .await
        .map_err(|e| e.to_string())
}
