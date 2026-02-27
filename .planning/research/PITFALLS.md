# Pitfalls Research

**Domain:** Offline-first desktop personal finance (Tauri + Rust + React + SQLite)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Balance Drift from Non-Atomic Financial Writes

**What goes wrong:**
Account balances diverge from the transaction/debt history after create/update/delete flows fail mid-operation.

**Why it happens:**
Balance updates are derived side effects. If transaction row changes and balance mutation are not in one DB transaction, partial writes occur.

**How to avoid:**
Wrap every financial mutation in a single SQL transaction. Enforce invariant checks (`account.balance == recomputed ledger`) in service-level tests and periodic reconciliation command.

**Warning signs:**
Users report "impossible" balances; edit/delete of one transaction changes balance unexpectedly; debt installment payment and generated expense are out of sync.

**Phase to address:**
Fase 1 (Core financiero), reinforced in Fase 2 (Deudas y tarjetas), validated in Fase 6 (Testing).

---

### Pitfall 2: Precision Loss in Currency and Interest Calculations

**What goes wrong:**
Consolidated totals, debt projections, or conversions show cent-level errors that accumulate over time.

**Why it happens:**
Mixing integer minor units with floating-point fields (`REAL` rates) and ad-hoc rounding rules across frontend/backend.

**How to avoid:**
Define one numeric policy: amounts in integer minor units, rates in fixed-precision decimal strategy (or scaled integers), and one shared rounding policy per currency. Centralize conversions in backend service only.

**Warning signs:**
Repeated convert-then-reconvert changes value; monthly debt totals do not match sum of installments; dashboard and transaction totals disagree.

**Phase to address:**
Fase 1 (amount handling baseline), Fase 2 (installments), Fase 5 (exchange rates and consolidation), Fase 3 (dashboard aggregations).

---

### Pitfall 3: Multi-Currency Consolidation with Missing or Stale Rates

**What goes wrong:**
Global balance and analytics become misleading because some account values are silently converted with outdated or absent exchange rates.

**Why it happens:**
Rates are manual-entry and time-dependent; missing-rate scenarios are easy to ignore in UI/queries.

**How to avoid:**
Require explicit rate date selection for consolidated views, block "final" totals when required pairs are missing, and surface unconverted amounts as first-class warnings.

**Warning signs:**
Consolidated total changes unexpectedly without new transactions; same date range yields different totals depending on navigation path; hidden fallback rates.

**Phase to address:**
Fase 5 (multi-moneda), with dashboard handling in Fase 3 and final QA in Fase 6.

---

### Pitfall 4: Recurring Transaction Duplication at Startup

**What goes wrong:**
Opening the app multiple times (or after clock/date anomalies) creates duplicate recurring entries.

**Why it happens:**
`process_recurring` runs at startup and can be non-idempotent if "generated occurrence" state is not tracked safely.

**How to avoid:**
Process recurrence in DB transaction with deterministic occurrence keys (rule_id + due_date), unique constraints, and "catch-up loop" logic that advances `next_date` safely.

**Warning signs:**
Two identical recurring transactions on same day; next due date jumps incorrectly; recurring toast counts inconsistent with created rows.

**Phase to address:**
Fase 5 (Transacciones recurrentes), regression-tested in Fase 6.

---

### Pitfall 5: Migration Drift and Schema/Doc Mismatch

**What goes wrong:**
Roadmap features are implemented against documented tables/columns that do not actually exist in runtime DB.

**Why it happens:**
Manual migration registration and semicolon-split execution increase omission risk; docs evolve faster than applied migrations.

**How to avoid:**
Adopt authoritative migration source checks (CI script verifying docs/schema parity), transactional migration engine, and migration coverage tests.

**Warning signs:**
"No such table/column" during feature work; docs mention entities absent in DB; fresh install differs from long-lived DB behavior.

**Phase to address:**
Fase 1 (before large feature expansion), hardened in Fase 6 (testing and quality gates).

---

### Pitfall 6: Slow Queries as Transaction History Grows

**What goes wrong:**
Filtering, description search, and dashboard charts become laggy with 500+ records and degrade further with normal daily use.

**Why it happens:**
General indexes do not support substring search well; heavy aggregations run directly against raw transaction tables without pre-aggregation strategy.

**How to avoid:**
Add query budgets, EXPLAIN-based verification, FTS5 for search, and summary tables/materialized aggregates for dashboard periods.

**Warning signs:**
Typing in search causes UI stalls; dashboard period switch blocks interaction; high CPU on simple filters.

**Phase to address:**
Fase 3 (dashboard aggregations), Fase 4 (autocomplete search), performance hardening in Fase 6.

---

### Pitfall 7: Unsafe Import/Export Semantics

**What goes wrong:**
Import causes silent duplication, broken references, or irreversible data loss (replace mode) without recovery.

**Why it happens:**
Large cross-table dataset operations are complex; weak validation/version checks and non-transactional replace flows are dangerous.

**How to avoid:**
Use strict schema versioning, preflight validation report, transaction-wrapped import, backup checkpoint before replace, and post-import integrity checks.

**Warning signs:**
Record counts change unexpectedly after import; orphaned tag/category links; user cannot reconcile pre/post totals.

**Phase to address:**
Fase 6 (Export/Import and edge-case handling).

---

### Pitfall 8: Theme-First UI Reducing Financial Readability

**What goes wrong:**
Stylized Lovecraft/retro visuals reduce legibility of amounts, status colors, and dense tables, causing user mistakes.

**Why it happens:**
Strong visual identity can overshadow contrast, hierarchy, and numeric readability requirements of finance workflows.

**How to avoid:**
Set non-negotiable usability constraints (contrast thresholds, tabular numerals, clear income/expense semantics), and validate with task-based UX checks.

**Warning signs:**
Users misread negative/positive values; frequent correction edits; dashboard insights require extra clicks to interpret.

**Phase to address:**
Fase 1 (base UI system), refined in Fase 3 (charts), polished in Fase 6.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Recompute and persist `accounts.balance` without periodic reconciliation | Fast reads and simple UI rendering | Drift risk across edit/delete/debt flows | Only if automated invariant checks run in CI and at runtime diagnostics |
| Keep using manual migration registry and statement splitting | Minimal setup overhead | Partial migration failures and schema drift | MVP only; replace before Fase 3 data complexity |
| Build dashboard directly from ad-hoc queries only | Faster initial feature delivery | Performance collapse as data grows | Acceptable before 500 transactions with explicit performance guardrails |
| Implement exchange conversion logic in frontend and backend separately | Rapid UI iteration | Rounding inconsistencies and duplicate logic bugs | Never |
| Add heavy visual effects globally by default | Immediate thematic impact | Input latency/readability degradation | Only if effects are toggleable and disabled in dense financial views |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| React -> Tauri `invoke` command calls | Untyped payload/result contracts between TS and Rust | Define shared DTOs/schemas, validate at boundaries, map typed errors |
| SQLite migration boot process | Running non-transactional migrations at startup with weak failure recovery | Execute each migration atomically and fail with clear recovery path |
| Native file dialogs for export/import | Treating selected path and file content as trusted input | Validate extension/content/schema/version and sanitize overwrite workflow |
| D3 with React state updates | Re-rendering full SVG tree on every filter change | Memoize transformed datasets and isolate imperative D3 layers |
| Global keyboard shortcuts in desktop app | Triggering shortcuts while typing in form fields | Scope shortcuts by focus/context and provide conflict-safe handling |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `%term%` search on `transactions.description` without FTS | Transaction list lag on text filter | Add SQLite FTS5 virtual table and query routing | Usually noticeable around 5k-20k transactions depending hardware |
| Full recomputation for every dashboard widget | Period switch freezes and long loading states | Pre-aggregate by month/category and cache date-range slices | Often visible around 1k+ transactions with multi-widget redraw |
| Startup recurrence processing scanning all rules naively | Slow app open and duplicate edge cases | Index by `is_active,next_date` and process due rules idempotently | Breaks as recurring rules and missed periods accumulate |
| Excessive chart effects and unthrottled resize handlers | Fan noise, dropped frames, janky interactions | Throttle resize, reduce animation cost, virtualize dense lists | Appears quickly on low-power Linux laptops |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Leaving financial DB unencrypted at rest by default | Device compromise or backup leak exposes full finance history | Offer optional at-rest encryption and document threat model clearly |
| Over-broad Tauri capabilities (opener/dialog/fs scope) | Malicious renderer path can access or open unsafe resources | Minimize capabilities and enforce explicit allowlists |
| Relaxed CSP in desktop renderer | Increased exploit blast radius if UI content is compromised | Set restrictive CSP aligned with local-only assets and required schemes |
| Importing arbitrary JSON without strict validation | Data poisoning, crashes, inconsistent financial records | Schema-validate and reject unknown/invalid structures before write |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hidden assumptions in automatic balance updates | User loses trust in totals | Show balance impact preview in create/edit/delete confirmations |
| Debt progress lacks "why changed" traceability | Hard to audit monthly commitments | Add installment timeline with generated transaction links |
| Consolidated currency total shown as single "truth" with missing rates | False confidence in net worth | Display confidence/warning state and per-currency breakdown |
| Overloaded transaction form (tags + autocomplete + recurrence) | Slower data entry and more mistakes | Progressive disclosure: essential fields first, advanced controls collapsed |
| Color-only status cues for income/expense/alerts | Misread values and accessibility issues | Combine color with symbols/labels and tabular numeric emphasis |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Transaction CRUD:** Often missing balance reconciliation after edit/delete edge paths - verify invariant checks pass on every mutation.
- [ ] **Debt payments:** Often missing idempotency for "pay installment" - verify double-submit cannot create duplicate expenses.
- [ ] **Multi-currency dashboard:** Often missing missing-rate handling - verify totals are blocked or clearly partial when rates are absent.
- [ ] **Autocomplete:** Often missing latency/debounce safeguards - verify rapid typing does not flood backend commands.
- [ ] **Recurring transactions:** Often missing duplicate protection on startup - verify unique occurrence constraints and replay safety.
- [ ] **Import/Replace:** Often missing recovery guarantees - verify automatic backup and rollback on validation/runtime failure.
- [ ] **Visual polish:** Often missing accessibility checks - verify contrast and numeric readability in all themed states.
- [ ] **Migration updates:** Often missing fresh-install verification - verify new DB bootstrap equals expected schema on CI.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Balance drift detected in production data | HIGH | Run reconciliation tool, log diff per account, repair in transaction with audit trail, add failing regression test |
| Duplicate recurring transactions | MEDIUM | Identify duplicates by rule/date key, reverse duplicates with compensating entries, patch idempotency logic |
| Bad import corrupted references | HIGH | Restore pre-import backup, ship integrity checker, rerun import with strict validator |
| Missing/stale exchange rate caused wrong reporting | MEDIUM | Recompute affected consolidated reports by date, mark prior snapshots as provisional, add required-rate gate |
| Dashboard/search performance regression | MEDIUM | Capture slow query plan, add indexes/FTS/aggregates, release migration and benchmark guardrail |
| Theme reduced readability | LOW | Roll back problematic style tokens, ship "high readability" toggle, rerun UX checks |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Balance Drift from Non-Atomic Financial Writes | Fase 1, Fase 2, Fase 6 | Mutation integration tests assert account balance equals recomputed ledger after create/edit/delete/pay |
| Precision Loss in Currency and Interest Calculations | Fase 1, Fase 2, Fase 5 | Golden tests for rounding and cross-currency conversions; dashboard totals match backend fixtures |
| Multi-Currency Consolidation with Missing or Stale Rates | Fase 5, Fase 3, Fase 6 | Missing-rate scenario visibly flagged and excluded/blocked from final consolidated total |
| Recurring Transaction Duplication at Startup | Fase 5, Fase 6 | Repeated startup simulation produces exactly one occurrence per due period |
| Migration Drift and Schema/Doc Mismatch | Fase 1, Fase 6 | CI check compares declared schema/docs against fresh DB bootstrap |
| Slow Queries as Transaction History Grows | Fase 3, Fase 4, Fase 6 | Performance test with 500+ and 5k+ records stays under response budget |
| Unsafe Import/Export Semantics | Fase 6 | Import preflight rejects invalid payloads; replace flow restores from checkpoint on failure |
| Theme-First UI Reducing Financial Readability | Fase 1, Fase 3, Fase 6 | UX pass confirms contrast/readability and error-rate on core finance tasks |

## Sources

- `docs/FEATURES.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/ROADMAP.md`
- `.planning/PROJECT.md`
- `.planning/codebase/CONCERNS.md`

---
*Pitfalls research for: Necronomics (offline desktop personal finance)*
*Researched: 2026-02-27*
