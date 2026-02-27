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
