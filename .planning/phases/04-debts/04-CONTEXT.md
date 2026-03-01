# Phase 4: Debts - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver installment debt management tied to accounts (primarily credit cards but not restricted). Users can create debts with installment schedules, track paid vs pending installments, mark payments (which auto-create transactions), view credit utilization per card, and see projected monthly commitments for the next 6 months. Requirements: DEBT-01 through DEBT-07.

</domain>

<decisions>
## Implementation Decisions

### Installment tracking
- Individual installment records in a new `installments` table (one row per cuota with due_date, status, actual_payment_date) — not a simple counter
- Marking an installment as paid auto-creates an expense transaction in the linked account
- User is prompted to select a category each time they mark an installment as paid
- Due dates are tied to the credit card's billing_day (not the debt's start_date). For non-credit-card accounts, fall back to start_date day-of-month
- Overdue status is determined automatically by comparing due_date to current date
- Display: progress bar (e.g., 4/12 cuotas) at the top of the expanded card, plus a scrollable list of individual installments with status badges (pagado/pendiente/vencido)

### Credit card integration
- Used vs available credit is shown on the Debts page only (not duplicated on Accounts page)
- Credit utilization shows both the account's current balance (total owed) AND the sum of remaining active debt commitments — separately displayed for a complete picture
- Debts can be linked to any account type, not restricted to credit cards — covers personal loans, bank credit lines, etc.
- Credit utilization summary only applies to credit-card accounts (accounts with credit_limit)

### Payment projections
- 6-month lookahead table with per-debt columns and a monthly total column
- Each debt gets its own column so users see exactly which debts contribute to each month's commitment
- Table rows are months, columns are debts + total

### Claude's Discretion
- Whether to show interest separately or just the total monthly_payment in the projection table (lean toward showing the actual amount that leaves the pocket)
- Where to place credit utilization summary and projection table relative to the debt list (top of page vs tabs) — choose what works best with the expandable card layout
- Loading skeleton and error state designs
- Exact progress bar visual style within the Lovecraftian aesthetic

</decisions>

<specifics>
## Specific Ideas

- Debt list uses expandable cards (accordion-style) — clicking a debt expands inline to show installment detail, no page navigation
- Rich card summary visible before expanding: description, linked account name, progress bar (X/Y), remaining amount, monthly payment, interest rate, next due date
- Debt create/edit uses modal form, consistent with Account and Transaction form modals (react-hook-form + zod pattern)
- Status badges for installments: pagado (green), pendiente (neutral), vencido (red/warning)
- Chilean cuotas model: installments follow the credit card billing cycle

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `debts` table already exists in 001_initial_schema.sql with: id, account_id, description, original_amount, total_installments, paid_installments, monthly_payment, interest_rate, start_date, is_active, notes
- Credit card accounts already have `credit_limit` and `billing_day` fields
- Transaction CRUD with atomic balance updates (pool.begin()/commit() pattern) — reusable for auto-creating payment transactions
- react-hook-form + zodResolver pattern established across Account and Transaction forms
- Zustand store pattern per domain (accountStore, categoryStore, transactionStore)
- Modal form pattern: overlay + centered box + dirty-state guard + form-level error
- Static Lucide icon map for dynamic icon rendering
- Pagination, filtering, and sortable table components from Phase 3

### Established Patterns
- Rust: queries module (simple data access) + commands module (business rules + validation)
- TS: typed invoke wrappers with filter object pattern
- PaginatedResult<T> generic struct for paginated endpoints
- QueryBuilder with push_bind for dynamic SQL filtering
- Sort column whitelist prevents SQL injection in ORDER BY
- Balance recalculation via SUM-based UPDATE (always correct, no drift)
- NavLink navigation bar in App.tsx for all pages

### Integration Points
- New `installments` table needed (migration) — linked to debts table
- `debts` table may need schema adjustments (e.g., category_id field removal since category is per-payment)
- NavLink bar needs new "Deudas" entry
- New Zustand debtStore following existing store patterns
- Transaction auto-creation hooks into existing transaction commands

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-debts*
*Context gathered: 2026-02-28*
