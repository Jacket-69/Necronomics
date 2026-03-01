# Phase 1: Accounts - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver complete account lifecycle management for cash, bank, and credit-card accounts: create, edit, confirm delete/archive actions, and show current balance per account.

</domain>

<decisions>
## Implementation Decisions

### Account creation flow
- Use a single "New account" form with account type selected inside the form.
- Show or hide type-specific fields dynamically when account type changes.
- Default new account currency to the configured base currency.
- After successful creation, redirect to accounts list view.

### Edit and type-specific rules
- Account type is locked after creation.
- Account name and currency remain editable.
- Credit-card accounts must always have credit limit and billing day in create and edit flows.
- Validation runs on field blur and also includes a submit-level error summary.
- If legacy credit-card data is missing required fields, block save until the fields are fixed.

### Delete/archive confirmation behavior
- Provide both archive and permanent delete actions; archive is the primary destructive path.
- Permanent delete requires typed confirmation.
- If an account has transaction history, permanent delete is blocked; archive remains available.
- After archive/delete action, return to accounts list and show success toast.

### Accounts list presentation
- Use a dense table on desktop and stacked cards on mobile.
- Default sort is by account type, then account name.
- Display current balance right-aligned with strong visual emphasis and currency symbol.
- Show inline quick actions (edit/archive) plus overflow menu for additional actions.

### Claude's Discretion
- Exact copywriting for labels, helper text, and validation strings.
- Visual styling details (spacing, typography scale, iconography).
- Precise breakpoint behavior for desktop table to mobile card transitions.

</decisions>

<specifics>
## Specific Ideas

No external product references were provided; decisions are explicit and implementation-oriented.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-accounts*
*Context gathered: 2026-02-27*
