use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Represents an account entity from the `accounts` table.
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: String,
    pub name: String,
    /// Mapped from the `type` column (Rust keyword). Use sqlx rename + serde rename.
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub account_type: String,
    pub currency_id: String,
    pub balance: i64,
    pub credit_limit: Option<i64>,
    pub billing_day: Option<i32>,
    pub is_active: i32,
    pub created_at: String,
}

/// Represents a category entity from the `categories` table.
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    /// Mapped from the `type` column (Rust keyword). Use sqlx rename + serde rename.
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub category_type: String,
    pub icon: Option<String>,
    pub parent_id: Option<String>,
    pub is_active: i32,
    pub created_at: String,
}

/// Represents a currency entity from the `currencies` table.
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Currency {
    pub id: String,
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub decimal_places: i32,
    pub created_at: String,
}

/// Represents a transaction entity from the `transactions` table.
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub account_id: String,
    pub category_id: String,
    pub amount: i64,
    /// Mapped from the `type` column (Rust keyword). Use sqlx rename + serde rename.
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub description: String,
    pub date: String,
    pub notes: Option<String>,
    pub created_at: String,
}

/// Filter parameters for listing transactions with dynamic conditions.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionFilter {
    pub account_id: Option<String>,
    pub category_id: Option<String>,
    pub transaction_type: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub amount_min: Option<i64>,
    pub amount_max: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

/// A generic paginated result wrapper.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResult<T>
where
    T: Serialize,
{
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

/// Balance information for a single account.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountBalance {
    pub account_id: String,
    pub account_name: String,
    pub balance: i64,
    pub currency_code: String,
}

/// Consolidated balance summary across all active accounts.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BalanceSummary {
    pub accounts: Vec<AccountBalance>,
    pub consolidated_total: Option<i64>,
    pub base_currency_code: String,
}
