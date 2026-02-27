# Requirements: Necronomics

**Defined:** 2026-02-27
**Core Value:** Give the user precise, trustworthy control over personal money flows and debt commitments in one fast, private, offline desktop app.

## v1 Requirements

### Accounts

- [ ] **ACCT-01**: User can create an account as cash, bank, or credit card with name and currency.
- [ ] **ACCT-02**: User can edit account details; credit-card accounts require editable credit limit and billing day.
- [ ] **ACCT-03**: User can delete or archive an account only after explicit confirmation.
- [ ] **ACCT-04**: User can view current balance for each account.

### Categories

- [ ] **CATE-01**: User can create a category classified as income or expense.
- [ ] **CATE-02**: User can create a subcategory under a parent category.
- [ ] **CATE-03**: User can edit category name, type, and parent.
- [ ] **CATE-04**: User cannot delete a category that is linked to existing transactions.

### Transactions

- [ ] **TXN-01**: User can create a transaction with amount, type (income/expense), account, category, date, and optional description.
- [ ] **TXN-02**: User can edit an existing transaction.
- [ ] **TXN-03**: User can delete an existing transaction after confirmation.
- [ ] **TXN-04**: User sees the current date preselected when opening the new transaction form.
- [ ] **TXN-05**: User can view transactions in a paginated table.
- [ ] **TXN-06**: User can filter transactions by date range, type, category, account, and min/max amount.
- [ ] **TXN-07**: User can search transactions by description text.
- [ ] **TXN-08**: User can sort the transaction table by key columns.

### Balances

- [ ] **BAL-01**: User sees account balances update automatically and deterministically after transaction create, edit, and delete.
- [ ] **BAL-02**: User can view a consolidated total in the configured base currency using stored exchange rates.

### Debts

- [ ] **DEBT-01**: User can create an installment debt with total amount, installment count, installment amount, interest rate, start date, and linked credit-card account.
- [ ] **DEBT-02**: User can view paid versus pending installments for each debt.
- [ ] **DEBT-03**: User can mark an installment as paid manually.
- [ ] **DEBT-04**: User sees due installment status advance automatically by date rules.
- [ ] **DEBT-05**: User can view remaining amount to pay for each debt.
- [ ] **DEBT-06**: User can view used versus available credit for each credit-card account.
- [ ] **DEBT-07**: User can view projected monthly installment commitments for upcoming months.

### Dashboard

- [ ] **DASH-01**: User sees consolidated total balance on the main dashboard.
- [ ] **DASH-02**: User sees current-month income versus expense on the main dashboard.
- [ ] **DASH-03**: User sees top spending categories for the current month on the main dashboard.
- [ ] **DASH-04**: User sees a recent-transactions panel on the main dashboard.

### Currency and Settings

- [ ] **CURR-01**: User can work with CLP, USD, EUR, JPY, and CNY as account currencies.
- [ ] **CURR-02**: User sees monetary values formatted correctly for each currency.
- [ ] **CURR-03**: User can set a base currency; default is CLP.
- [ ] **CURR-04**: User can enter and maintain manual exchange rates with effective dates.
- [ ] **CONF-01**: User uses the app in Spanish in v1 (Spanish-only UI scope).

### Data Portability

- [ ] **DATA-01**: User can export all application data to Necronomics JSON format including schema/app version and export timestamp.
- [ ] **DATA-02**: User can import Necronomics JSON only after validation passes.
- [ ] **DATA-03**: User can import using merge mode.
- [ ] **DATA-04**: User can import using replace mode after explicit confirmation.

### UX Foundations

- [ ] **UX-01**: User can navigate core modules from a persistent sidebar.
- [ ] **UX-02**: User sees current module/page context in the header.
- [ ] **UX-03**: User receives success and error feedback for create, edit, and delete actions.
- [ ] **UX-04**: User sees loading states during asynchronous operations.
- [ ] **UX-05**: User experiences a cohesive Lovecraftian + retro-2000s visual theme across core modules.

## v2 Requirements

### Transactions and Productivity

- **TAG-01**: User can assign multiple color-coded tags to a transaction.
- **TAG-02**: User can filter transactions by tags.
- **AUTO-01**: User gets transaction autocomplete suggestions from history.
- **AUTO-02**: User can apply a suggestion to autofill category and amount.
- **REC-01**: User can create recurring transaction rules (weekly/biweekly/monthly).
- **REC-02**: User can manage active recurring rules.
- **KEY-01**: User can use keyboard shortcuts for high-frequency actions.

### Dashboard and Analytics

- **CHRT-01**: User can view themed D3 donut chart for spending distribution.
- **CHRT-02**: User can view themed D3 bar chart for income versus expense trends.
- **CHRT-03**: User can view themed D3 line chart for balance evolution.
- **CHRT-04**: User can view themed D3 treemap for category hierarchy spend.
- **CHRT-05**: User can view advanced analytics (heatmap, sankey, month-over-month comparative views).

### Debt Enhancements

- **ALRT-01**: User sees alerts when card utilization exceeds configured threshold (default 80%).
- **ALRT-02**: User sees upcoming debt due warnings.

### Currency Enhancements

- **FX-01**: User can store and inspect exchange-rate history over time.
- **FX-02**: User can visualize exchange-rate trends.

### Portability and Personalization

- **DATA-05**: User can export filtered transaction subsets.
- **THEM-01**: User can switch among additional Lovecraft theme variants.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mandatory cloud sync/account login | Conflicts with offline-first and privacy-first core product value |
| Automatic bank scraping/aggregation | High integration and maintenance complexity; not required for v1 validation |
| Multi-user collaboration/shared ledgers | v1 targets single-user personal finance workflows |
| Mobile-native app distribution | Current committed platform is Linux desktop |
| Full budgeting/goals engine in v1 | Deferred until tracking/debt correctness is stable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACCT-01 | Phase 1: Accounts | Pending |
| ACCT-02 | Phase 1: Accounts | Pending |
| ACCT-03 | Phase 1: Accounts | Pending |
| ACCT-04 | Phase 1: Accounts | Pending |
| CATE-01 | Phase 2: Categories | Pending |
| CATE-02 | Phase 2: Categories | Pending |
| CATE-03 | Phase 2: Categories | Pending |
| CATE-04 | Phase 2: Categories | Pending |
| TXN-01 | Phase 3: Transactions and Balances | Pending |
| TXN-02 | Phase 3: Transactions and Balances | Pending |
| TXN-03 | Phase 3: Transactions and Balances | Pending |
| TXN-04 | Phase 3: Transactions and Balances | Pending |
| TXN-05 | Phase 3: Transactions and Balances | Pending |
| TXN-06 | Phase 3: Transactions and Balances | Pending |
| TXN-07 | Phase 3: Transactions and Balances | Pending |
| TXN-08 | Phase 3: Transactions and Balances | Pending |
| BAL-01 | Phase 3: Transactions and Balances | Pending |
| BAL-02 | Phase 3: Transactions and Balances | Pending |
| DEBT-01 | Phase 4: Debts | Pending |
| DEBT-02 | Phase 4: Debts | Pending |
| DEBT-03 | Phase 4: Debts | Pending |
| DEBT-04 | Phase 4: Debts | Pending |
| DEBT-05 | Phase 4: Debts | Pending |
| DEBT-06 | Phase 4: Debts | Pending |
| DEBT-07 | Phase 4: Debts | Pending |
| DASH-01 | Phase 5: Dashboard | Pending |
| DASH-02 | Phase 5: Dashboard | Pending |
| DASH-03 | Phase 5: Dashboard | Pending |
| DASH-04 | Phase 5: Dashboard | Pending |
| CURR-01 | Phase 6: Currency and Settings | Pending |
| CURR-02 | Phase 6: Currency and Settings | Pending |
| CURR-03 | Phase 6: Currency and Settings | Pending |
| CURR-04 | Phase 6: Currency and Settings | Pending |
| CONF-01 | Phase 6: Currency and Settings | Pending |
| DATA-01 | Phase 7: Data Portability | Pending |
| DATA-02 | Phase 7: Data Portability | Pending |
| DATA-03 | Phase 7: Data Portability | Pending |
| DATA-04 | Phase 7: Data Portability | Pending |
| UX-01 | Phase 8: UX Foundations | Pending |
| UX-02 | Phase 8: UX Foundations | Pending |
| UX-03 | Phase 8: UX Foundations | Pending |
| UX-04 | Phase 8: UX Foundations | Pending |
| UX-05 | Phase 8: UX Foundations | Pending |

## Coverage

- v1 requirements: 43 total
- v1 requirements with traceability rows: 43
- v1 requirements assigned to concrete roadmap phase: 43
- v1 requirements pending roadmap assignment (Phase `TBD`): 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap traceability assignment*
