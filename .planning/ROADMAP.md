# Roadmap: Necronomics v1

**Defined:** 2026-02-27
**Source of truth:** v1 requirements in `.planning/REQUIREMENTS.md`

## Coverage Summary

- Total phases: 8
- v1 requirements: 43
- v1 requirements assigned to phases: 43
- Coverage validation: 100% (43/43)
- Assignment rule: each v1 requirement appears in exactly one phase

## Phases

### Phase 1: Accounts
**Goal:** Deliver complete account lifecycle management for cash, bank, and credit-card accounts.

**Requirement IDs:** ACCT-01, ACCT-02, ACCT-03, ACCT-04

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Foundation: frontend deps, TypeScript types, Rust backend commands
- [ ] 01-02-PLAN.md — Zustand store, React Router, accounts list page
- [ ] 01-03-PLAN.md — Account form (create/edit), delete/archive modal, lifecycle verification

**Observable success criteria:**
- User can create cash, bank, and credit-card accounts with required fields.
- User can edit account details, including credit limit and billing day for credit cards.
- Deleting or archiving an account requires explicit confirmation.
- Account list shows current balance per account.

### Phase 2: Categories
**Goal:** Deliver category and subcategory management with transaction-link integrity rules.

**Requirement IDs:** CATE-01, CATE-02, CATE-03, CATE-04

**Observable success criteria:**
- User can create income and expense categories.
- User can create and persist subcategories under parent categories.
- User can edit category name, type, and parent assignment.
- Category deletion is blocked when linked transactions exist.

### Phase 3: Transactions and Balances
**Goal:** Deliver transaction CRUD and transaction-led deterministic balance calculations.

**Requirement IDs:** TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06, TXN-07, TXN-08, BAL-01, BAL-02

**Observable success criteria:**
- User can create, edit, and delete transactions with required fields and confirmation on delete.
- New transaction form opens with current date preselected.
- Transaction table supports pagination, filters, text search, and sortable key columns.
- Account balances update deterministically after every transaction mutation.
- App shows consolidated total in configured base currency using stored exchange rates.

### Phase 4: Debts
**Goal:** Deliver installment debt workflows tied to credit-card behavior and projections.

**Requirement IDs:** DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, DEBT-06, DEBT-07

**Observable success criteria:**
- User can create installment debts linked to credit-card accounts with all required debt fields.
- Debt detail view shows paid vs pending installments and remaining amount.
- User can mark installments as paid and state persists correctly.
- Installment due status advances automatically based on date rules.
- Credit-card views show used vs available credit plus projected monthly installment commitments.

### Phase 5: Dashboard
**Goal:** Deliver dashboard snapshots for current financial position and recent activity.

**Requirement IDs:** DASH-01, DASH-02, DASH-03, DASH-04

**Observable success criteria:**
- Main dashboard shows consolidated total balance.
- Main dashboard shows current-month income versus expense.
- Main dashboard shows top spending categories for current month.
- Main dashboard shows recent-transactions panel.

### Phase 6: Currency and Settings
**Goal:** Deliver multi-currency operation, exchange-rate maintenance, and base localization settings for v1.

**Requirement IDs:** CURR-01, CURR-02, CURR-03, CURR-04, CONF-01

**Observable success criteria:**
- User can create/use accounts in CLP, USD, EUR, JPY, and CNY.
- Monetary values are formatted according to each currency.
- Base currency is configurable and defaults to CLP.
- User can create and maintain manual exchange rates with effective dates.
- UI language is Spanish across v1 scope.

### Phase 7: Data Portability
**Goal:** Deliver safe full-data export/import flows with validation and confirmation controls.

**Requirement IDs:** DATA-01, DATA-02, DATA-03, DATA-04

**Observable success criteria:**
- User can export complete app data to Necronomics JSON including schema/app version and export timestamp.
- Import is blocked unless payload validation passes.
- User can import in merge mode.
- User can import in replace mode only after explicit confirmation.

### Phase 8: UX Foundations
**Goal:** Deliver shared UX primitives and visual baseline required across core modules.

**Requirement IDs:** UX-01, UX-02, UX-03, UX-04, UX-05

**Observable success criteria:**
- Persistent sidebar provides navigation to core modules.
- Header always reflects current module/page context.
- CRUD flows surface clear success/error feedback.
- Async operations show explicit loading states.
- Core modules present a cohesive Lovecraftian + retro-2000s theme.

## Requirement Coverage Matrix

| Phase | Requirement count | Requirement IDs |
|------|--------------------|-----------------|
| Phase 1: Accounts | 4 | ACCT-01, ACCT-02, ACCT-03, ACCT-04 |
| Phase 2: Categories | 4 | CATE-01, CATE-02, CATE-03, CATE-04 |
| Phase 3: Transactions and Balances | 10 | TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06, TXN-07, TXN-08, BAL-01, BAL-02 |
| Phase 4: Debts | 7 | DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, DEBT-06, DEBT-07 |
| Phase 5: Dashboard | 4 | DASH-01, DASH-02, DASH-03, DASH-04 |
| Phase 6: Currency and Settings | 5 | CURR-01, CURR-02, CURR-03, CURR-04, CONF-01 |
| Phase 7: Data Portability | 4 | DATA-01, DATA-02, DATA-03, DATA-04 |
| Phase 8: UX Foundations | 5 | UX-01, UX-02, UX-03, UX-04, UX-05 |
| Total | 43 | 43/43 assigned exactly once |

---
*Last updated: 2026-02-27 after Phase 1 planning*
