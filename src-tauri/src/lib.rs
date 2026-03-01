mod commands;
mod db;
mod services;

use tauri::Manager;

/// Initialize the database during app setup.
/// Creates the SQLite database and runs all pending migrations.
async fn init_database(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let pool = db::create_pool(&app_data_dir).await?;
    db::run_migrations(&pool).await?;

    // Store the pool in Tauri's managed state for later use
    app.manage(pool);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::accounts::list_accounts,
            commands::accounts::get_account,
            commands::accounts::create_account,
            commands::accounts::update_account,
            commands::accounts::archive_account,
            commands::accounts::delete_account,
            commands::accounts::list_currencies,
            commands::categories::list_categories,
            commands::categories::get_category,
            commands::categories::create_category,
            commands::categories::update_category,
            commands::categories::delete_category,
            commands::transactions::create_transaction,
            commands::transactions::update_transaction,
            commands::transactions::delete_transaction,
            commands::transactions::list_transactions,
            commands::transactions::get_balance_summary,
            commands::debts::create_debt,
            commands::debts::update_debt,
            commands::debts::delete_debt,
            commands::debts::list_debts,
            commands::debts::get_debt_detail,
            commands::debts::mark_installment_paid,
            commands::debts::get_credit_utilization,
            commands::debts::get_payment_projections,
            commands::dashboard::get_dashboard_data,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                init_database(&handle)
                    .await
                    .expect("failed to initialize database");
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
