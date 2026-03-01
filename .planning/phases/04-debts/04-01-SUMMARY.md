---
phase: 04-debts
plan: 01
status: completed
commit: 9c73532
---

# Plan 04-01 Summary: Debt Data Layer

## What was built
- **Migration 005_create_installments.sql**: Installments table with FK to debts, status CHECK constraint, unique(debt_id, installment_number), indexes on debt_id/status/due_date
- **Rust models** (models.rs): Debt, Installment, DebtFilter, DebtWithInstallments, CreditUtilization, DebtProjectionEntry, MonthlyProjection, CreateDebtInput, UpdateDebtInput
- **Rust queries** (queries/debts.rs): get_debt_by_id (with computed paid_installments subquery), list_debts (QueryBuilder dynamic filtering), create_debt, delete_debt, list_installments_for_debt, get_installment_by_id, get_account_name_for_debt
- **Rust commands** (commands/debts.rs): 8 Tauri commands — create_debt, update_debt, delete_debt, list_debts, get_debt_detail, mark_installment_paid, get_credit_utilization, get_payment_projections
- **TypeScript types** (types/index.ts): Debt, Installment, DebtWithInstallments, CreateDebtInput, UpdateDebtInput, DebtFilter, CreditUtilization, DebtProjectionEntry, MonthlyProjection, InstallmentStatus, InstallmentDisplayStatus
- **TypeScript API** (lib/tauri.ts): debtApi with 8 invoke wrappers

## Key decisions
- paid_installments computed via SQL subquery (never stale)
- Overdue status derived at read time from due_date < today
- create_debt atomically generates all installment rows with billing_day-aware due dates
- mark_installment_paid atomically creates expense transaction, updates installment, recalculates balance
- Due dates use month-end clamping (billing_day=31 in Feb -> Feb 28/29)

## Verification
- `cargo check` passes (warnings only, no errors)
- `npx tsc --noEmit` passes clean
