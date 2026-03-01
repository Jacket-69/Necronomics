-- Create installments table for per-installment debt tracking
CREATE TABLE installments (
    id TEXT PRIMARY KEY,
    debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    actual_payment_date TEXT,
    transaction_id TEXT REFERENCES transactions(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(debt_id, installment_number)
);

CREATE INDEX idx_installments_debt ON installments(debt_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
