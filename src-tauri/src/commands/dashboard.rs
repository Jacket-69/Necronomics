use std::collections::HashMap;

use sqlx::SqlitePool;
use tauri::State;

use crate::db::models::{
    AccountBalance, BalanceSummary, CategorySpending, DashboardData, MonthlyIncomeExpense,
    RecentTransaction,
};
use crate::db::queries::dashboard;

/// Map a month number (1-12) to its Spanish name.
fn spanish_month_name(month: i32) -> &'static str {
    match month {
        1 => "Enero",
        2 => "Febrero",
        3 => "Marzo",
        4 => "Abril",
        5 => "Mayo",
        6 => "Junio",
        7 => "Julio",
        8 => "Agosto",
        9 => "Septiembre",
        10 => "Octubre",
        11 => "Noviembre",
        12 => "Diciembre",
        _ => "Desconocido",
    }
}

/// Pre-fetch all latest exchange rates to base currency into a HashMap.
/// Key: from_currency_code, Value: rate to base currency.
async fn fetch_exchange_rates(
    pool: &SqlitePool,
    base_cur_id: &str,
) -> Result<HashMap<String, f64>, String> {
    let rows: Vec<(String, f64)> = sqlx::query_as(
        "SELECT c.code, er.rate
         FROM exchange_rates er
         JOIN currencies c ON er.from_currency_id = c.id
         WHERE er.to_currency_id = ?
           AND er.date = (SELECT MAX(date) FROM exchange_rates er2
                           WHERE er2.from_currency_id = er.from_currency_id
                             AND er2.to_currency_id = er.to_currency_id)",
    )
    .bind(base_cur_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().collect())
}

/// Convert an amount from a given currency to the base currency using pre-fetched rates.
fn convert_to_base(
    amount: i64,
    currency_code: &str,
    base_code: &str,
    rates: &HashMap<String, f64>,
) -> Option<i64> {
    if currency_code == base_code {
        Some(amount)
    } else {
        rates.get(currency_code).map(|rate| {
            #[allow(clippy::cast_precision_loss)]
            let converted = (amount as f64 * rate).round() as i64;
            converted
        })
    }
}

/// Get all dashboard data in a single IPC call: balance summary, monthly income/expense,
/// top spending categories, and recent transactions.
#[tauri::command]
pub async fn get_dashboard_data(pool: State<'_, SqlitePool>) -> Result<DashboardData, String> {
    let base_cur_id = "cur_clp";

    // Get base currency code
    let base_currency_code: String =
        sqlx::query_as::<_, (String,)>("SELECT code FROM currencies WHERE id = ?")
            .bind(base_cur_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| e.to_string())?
            .map(|(code,)| code)
            .unwrap_or_else(|| "CLP".to_string());

    // Pre-fetch exchange rates for all currency conversions
    let rates = fetch_exchange_rates(pool.inner(), base_cur_id).await?;

    // ── Balance Summary ──────────────────────────────────────────────
    let accounts: Vec<(String, String, i64, String)> = sqlx::query_as(
        "SELECT a.id, a.name, a.balance, c.code
         FROM accounts a
         JOIN currencies c ON a.currency_id = c.id
         WHERE a.is_active = 1",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    let account_balances: Vec<AccountBalance> = accounts
        .iter()
        .map(|(id, name, balance, code)| AccountBalance {
            account_id: id.clone(),
            account_name: name.clone(),
            balance: *balance,
            currency_code: code.clone(),
        })
        .collect();

    let mut consolidated: i64 = 0;
    let mut has_any = false;

    for (_, _, balance, currency_code) in &accounts {
        if let Some(converted) =
            convert_to_base(*balance, currency_code, &base_currency_code, &rates)
        {
            consolidated += converted;
            has_any = true;
        }
    }

    let balance_summary = BalanceSummary {
        accounts: account_balances,
        consolidated_total: if has_any { Some(consolidated) } else { None },
        base_currency_code: base_currency_code.clone(),
    };

    // ── Monthly Income / Expense ─────────────────────────────────────
    let monthly_txns = dashboard::get_monthly_transactions(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    let (month_num, year) = dashboard::get_current_month_info(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    let mut income: i64 = 0;
    let mut expense: i64 = 0;

    for (amount, txn_type, currency_code) in &monthly_txns {
        if let Some(converted) =
            convert_to_base(*amount, currency_code, &base_currency_code, &rates)
        {
            match txn_type.as_str() {
                "income" => income += converted,
                "expense" => expense += converted,
                _ => {}
            }
        }
    }

    let monthly_income_expense = MonthlyIncomeExpense {
        income,
        expense,
        month_name: spanish_month_name(month_num).to_string(),
        year,
    };

    // ── Top Spending Categories ──────────────────────────────────────
    let category_rows = dashboard::get_category_spending(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    // Group by category_id, converting each amount to base currency
    let mut category_map: HashMap<String, (String, i64)> = HashMap::new();

    for (cat_id, cat_name, amount, currency_code) in &category_rows {
        if let Some(converted) =
            convert_to_base(*amount, currency_code, &base_currency_code, &rates)
        {
            let entry = category_map
                .entry(cat_id.clone())
                .or_insert_with(|| (cat_name.clone(), 0));
            entry.1 += converted;
        }
    }

    // Sort descending by amount
    let mut sorted_categories: Vec<(String, String, i64)> = category_map
        .into_iter()
        .map(|(id, (name, amount))| (id, name, amount))
        .collect();
    sorted_categories.sort_by(|a, b| b.2.cmp(&a.2));

    // Calculate total spending for percentage
    let total_spending: i64 = sorted_categories.iter().map(|(_, _, amt)| amt).sum();

    // Build top 5 + "Otros"
    let mut top_categories: Vec<CategorySpending> = Vec::new();

    if total_spending > 0 {
        let top_count = sorted_categories.len().min(5);
        let mut otros_amount: i64 = 0;

        for (i, (cat_id, cat_name, amount)) in sorted_categories.iter().enumerate() {
            if i < top_count {
                #[allow(clippy::cast_precision_loss)]
                let percentage = (*amount as f64 / total_spending as f64) * 100.0;
                top_categories.push(CategorySpending {
                    category_id: cat_id.clone(),
                    category_name: cat_name.clone(),
                    amount: *amount,
                    percentage,
                });
            } else {
                otros_amount += amount;
            }
        }

        if otros_amount > 0 {
            #[allow(clippy::cast_precision_loss)]
            let percentage = (otros_amount as f64 / total_spending as f64) * 100.0;
            top_categories.push(CategorySpending {
                category_id: "otros".to_string(),
                category_name: "Otros".to_string(),
                amount: otros_amount,
                percentage,
            });
        }
    }

    // ── Recent Transactions ──────────────────────────────────────────
    let recent_rows = dashboard::get_recent_transactions(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    let recent_transactions: Vec<RecentTransaction> = recent_rows
        .into_iter()
        .map(
            |(
                id,
                account_name,
                category_name,
                amount,
                transaction_type,
                description,
                date,
                currency_code,
            )| {
                RecentTransaction {
                    id,
                    account_name,
                    category_name,
                    amount,
                    transaction_type,
                    description,
                    date,
                    currency_code,
                }
            },
        )
        .collect();

    Ok(DashboardData {
        balance_summary,
        monthly_income_expense,
        top_categories,
        recent_transactions,
    })
}
