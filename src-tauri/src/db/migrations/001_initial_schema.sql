-- Initial schema for Necronomics
-- Creates all 8 core tables with indices

CREATE TABLE currencies (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    decimal_places INTEGER NOT NULL DEFAULT 2,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card')),
    currency_id TEXT NOT NULL REFERENCES currencies(id),
    balance INTEGER NOT NULL DEFAULT 0,
    credit_limit INTEGER,
    billing_day INTEGER CHECK (billing_day BETWEEN 1 AND 31),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    parent_id TEXT REFERENCES categories(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(name, parent_id, type)
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    category_id TEXT NOT NULL REFERENCES categories(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_description ON transactions(description);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#4a5d23',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE transaction_tags (
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

CREATE TABLE debts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    description TEXT NOT NULL,
    original_amount INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    paid_installments INTEGER NOT NULL DEFAULT 0,
    monthly_payment INTEGER NOT NULL,
    interest_rate REAL NOT NULL DEFAULT 0.0,
    start_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_debts_account ON debts(account_id);
CREATE INDEX idx_debts_active ON debts(is_active);

CREATE TABLE exchange_rates (
    id TEXT PRIMARY KEY,
    from_currency_id TEXT NOT NULL REFERENCES currencies(id),
    to_currency_id TEXT NOT NULL REFERENCES currencies(id),
    rate REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(from_currency_id, to_currency_id, date)
);

CREATE INDEX idx_exchange_rates_date ON exchange_rates(date);
