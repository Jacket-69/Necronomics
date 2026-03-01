---
phase: 04-debts
plan: 03
status: completed
commit: 8103dbf
---

# Plan 04-03 Summary: Debts Page UI

## What was built
- **InstallmentRow.tsx**: Single installment row with derived status badges (pagado=green, pendiente=neutral, vencido=red); "Pagar" button on pending/overdue; formatted dates and amounts
- **DebtDetail.tsx**: Expanded view fetching full DebtWithInstallments on mount; progress bar (paid/total); summary stats (remaining amount, next due date); scrollable installment list; refreshKey prop for re-fetch after payment
- **DebtCard.tsx**: Expandable accordion card; collapsed header shows description, account name, mini progress bar, remaining amount, monthly payment, interest rate, completed badge; edit/delete buttons with stopPropagation; lucide-react icons (ChevronDown/Up, Pencil, Trash2)
- **CreditUtilization.tsx**: Per-account credit utilization bars with color coding (green <60%, orange 60-80%, red >80%); stats grid: saldo actual, compromisos pendientes, limite, disponible; hidden when no credit card accounts
- **ProjectionTable.tsx**: 6-month payment projection table; dynamic columns from unique debts; formatted month names (YYYY-MM -> "Mar 2026"); total column in chartreuse; horizontal scroll for many debts; empty state message
- **DebtsPage.tsx**: Main page composing all components; useEffect fetches debts/utilizations/projections/accounts/currencies/categories on mount; expandable single-card pattern; modal handlers for create/edit/delete/mark-paid; toast notifications
- **App.tsx**: Added "Deudas" nav link and /debts route

## Key decisions
- Single expanded debt card at a time (expandedDebtId state)
- DebtDetail uses refreshKey prop pattern for refetch after mark-paid
- Overdue status derived client-side from dueDate < today (no backend dependency)
- Credit utilization calculation includes both currentBalance and remainingDebtCommitments
- Projection table columns are dynamic based on which debts have pending installments

## Verification
- `npx tsc --noEmit` passes clean
- `cargo check` passes (no regressions)
- Navigation includes "Deudas" link routing to DebtsPage
- All components use consistent Lovecraftian dark theme (#0a0f06, #111a0a, #2a3518, #4a5d23, #7fff00)
