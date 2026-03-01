---
phase: 04-debts
plan: 02
status: completed
commit: 8103dbf
---

# Plan 04-02 Summary: Debt Store and Modals

## What was built
- **debtStore.ts**: Zustand store with debts, creditUtilizations, projections state; filters (accountId, isActive=true, search); actions: fetchDebts, setFilters, resetFilters, createDebt, updateDebt, deleteDebt, getDebtDetail, markInstallmentPaid, fetchCreditUtilizations, fetchProjections
- **DebtFormModal.tsx**: Create/edit modal with react-hook-form + zod validation; 8 fields (account, description, amount, installments, monthly payment, interest rate, start date, notes); edit mode disables structural fields; amount conversion to minor units; dirty state guard
- **MarkPaidModal.tsx**: Category picker modal for marking installments as paid; filters expense categories with parent>child hierarchy; loading/error states; calls onConfirm(categoryId) on confirmation

## Key decisions
- Store is non-paginated (debts are typically small lists)
- Default filter isActive=true shows only active debts
- creditUtilizations and projections loaded independently with separate fetch methods
- DebtFormModal in edit mode only allows description, interestRate, notes editing
- MarkPaidModal requires expense category selection before confirming

## Verification
- `npx tsc --noEmit` passes clean
- All components follow established modal and styling patterns
