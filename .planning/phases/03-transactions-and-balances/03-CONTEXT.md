# Phase 3: Transactions and Balances - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver transaction CRUD (create, edit, delete) with a full-featured transaction table (pagination, filters, text search, sortable columns) and deterministic balance calculations that update after every transaction mutation. Consolidated total in base currency using stored exchange rates.

Requirements: TXN-01 through TXN-08, BAL-01, BAL-02.

</domain>

<decisions>
## Implementation Decisions

### Transaction form flow

- Modal-based form (consistent with categories pattern, not dedicated page)
- Income/expense selection via toggle buttons at the top of the form — two prominent buttons, selected one highlighted
- Amount entry in human-readable format — user types '15000' for CLP, '29.99' for USD; app converts to minor units internally based on currency decimal config
- Field order: Type toggle > Amount > Account > Category > Date > Description
- Date field preselected to current date (TXN-04)
- Description is optional free text

### Table layout and filtering

- Collapsible filter bar above the table — expands/collapses to show filter controls for date range, type, category, account, and min/max amount
- Classic page-number pagination with prev/next controls
- Live text search with debounce — results update as user types
- All key columns sortable (TXN-08)
- Type implied by amount color: green for income, red for expense

### Balance display and consolidation

- Balances visible on both the accounts page (per-account, already exists) and the transactions page (summary header)
- Transactions page header shows a summary with per-account balances in their native currencies plus a consolidated total converted to base currency (CLP default)
- Animated transition/flash on balance numbers after transaction mutations — draws attention to the change
- Balance updates are deterministic: recalculated after every create, edit, or delete

### Transaction-account navigation

- Both a global /transactions page and per-account filtered views
- Clicking an account in the accounts list navigates to /transactions?account=:id — reuses the global page with filter pre-applied
- "Transacciones" gets its own top-level sidebar entry
- "Nueva Transaccion" button in the transactions page header — always visible, primary action

### Claude's Discretion

- Table column selection and density (which columns visible by default, spacing)
- Loading skeleton design for table and filters
- Error state handling patterns
- Exact debounce timing for live search
- Delete confirmation modal design (follow existing patterns)
- Sort direction indicators and default sort order
- Filter control UI components (dropdowns, date pickers, etc.)

</decisions>

<specifics>
## Specific Ideas

- Transaction form follows the modal pattern from categories, not the dedicated-page pattern from accounts
- Toggle buttons for type selection should feel like a segmented control — clear which is active
- The balance animation after mutations should be subtle but noticeable (brief flash/highlight, not distracting)
- Per-account view is not a separate page — it's the global transactions page with the account filter pre-applied via URL query parameter
- Categories phase already has placeholder columns ("Transacciones" count and "Total" amount hardcoded to 0 and —) that will need real data once transactions exist

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-transactions-and-balances_
_Context gathered: 2026-02-27_
