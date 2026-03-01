---
phase: 04-debts
verified: 2026-02-28T22:30:00Z
status: gaps_found
score: 16/18 must-haves verified
re_verification: false
gaps:
  - truth: "Migration 005 is wired into the migration runner so installments table is created at runtime"
    status: failed
    reason: "Migration file 005_create_installments.sql exists but is NOT included in the migrations vector in src-tauri/src/db/mod.rs — the installments table will never be created, blocking all debt functionality at runtime"
    artifacts:
      - path: "src-tauri/src/db/mod.rs"
        issue: "migrations vector only includes 001-004; missing entry for 005_create_installments"
    missing:
      - "Add ('005_create_installments', include_str!('migrations/005_create_installments.sql')) to the migrations vector in src-tauri/src/db/mod.rs"
  - truth: "Collapsed debt card shows next due date"
    status: partial
    reason: "DebtCard.computeNextDueDate() always returns null; next due date is only visible in expanded DebtDetail view, not in collapsed card summary"
    artifacts:
      - path: "src/components/debts/DebtCard.tsx"
        issue: "computeNextDueDate() returns null unconditionally (lines 42-47); collapsed view never shows next due date"
    missing:
      - "Either derive next due date from debt data in the collapsed card, or fetch it from the backend (debt list query could include next_due_date)"
human_verification:
  - test: "Navigate to Deudas page, create a debt, expand it, and verify installment status badges"
    expected: "Debt card expands to show installments with pagado/pendiente/vencido badges"
    why_human: "Visual rendering, color-coded badges, and UI layout cannot be verified programmatically"
  - test: "Mark an installment as paid and verify state updates"
    expected: "Category picker modal opens, after confirming payment the installment shows 'pagado', progress bar updates, and a corresponding expense transaction is created"
    why_human: "End-to-end flow across modal + store + backend + DB requires runtime"
  - test: "Create a credit-card account with debts and verify credit utilization section"
    expected: "Credit utilization bar with saldo actual, compromisos pendientes, limite, disponible"
    why_human: "Requires specific test data and visual verification"
  - test: "Verify Lovecraftian dark theme consistency across all debt components"
    expected: "Consistent colors (#0a0f06, #111a0a, #2a3518, #4a5d23, #7fff00), Share Tech Mono font, Cinzel Decorative headers"
    why_human: "Visual appearance cannot be verified programmatically"
---

# Phase 4: Debts Verification Report

**Phase Goal:** Deliver installment debt workflows tied to credit-card behavior and projections.
**Verified:** 2026-02-28T22:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                                                         | Status     | Evidence                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Backend can create a debt and auto-generate all installment rows with correct due dates derived from billing_day or start_date                | ✓ VERIFIED | commands/debts.rs:76-201 — create_debt generates UUIDs, computes due dates via calculate_due_dates() with billing_day-aware clamping using chrono, inserts debt + all installments in atomic transaction                          |
| 2   | Backend can list debts with computed paid_installments count from the installments table                                                      | ✓ VERIFIED | queries/debts.rs:21-50 — list_debts uses subquery `(SELECT COUNT(*) FROM installments WHERE debt_id = d.id AND status = 'paid') as paid_installments`                                                                             |
| 3   | Backend can list installments for a given debt with status and dates                                                                          | ✓ VERIFIED | queries/debts.rs:96-109 — list_installments_for_debt selects all fields ORDER BY installment_number ASC                                                                                                                           |
| 4   | Backend can mark an installment as paid, atomically creating an expense transaction and recalculating account balance                         | ✓ VERIFIED | commands/debts.rs:306-419 — mark_installment_paid: validates installment/debt/account/category, begins transaction, inserts expense, updates installment status, recalculates balance, updates paid_installments counter, commits |
| 5   | Backend can return credit utilization (balance, remaining commitments, credit_limit) for credit-card accounts                                 | ✓ VERIFIED | commands/debts.rs:422-464 — queries credit-card accounts, computes remaining_debt_commitments from pending installments, returns CreditUtilization structs                                                                        |
| 6   | Backend can return 6-month payment projections grouped by month and debt                                                                      | ✓ VERIFIED | commands/debts.rs:467-510 — SQL groups pending installments by month/debt for next 6 months, builds Vec<MonthlyProjection>                                                                                                        |
| 7   | TypeScript types for Debt, Installment, CreditUtilization, MonthlyProjection match Rust serde shapes exactly                                  | ✓ VERIFIED | types/index.ts:132-213 — all interfaces match Rust structs with camelCase field names matching serde(rename_all = "camelCase")                                                                                                    |
| 8   | Zustand debtStore manages debt list, loading state, error state, and filter state                                                             | ✓ VERIFIED | stores/debtStore.ts — full state: debts, isLoading, error, filters, creditUtilizations, projections with all CRUD actions                                                                                                         |
| 9   | DebtFormModal creates a new debt with all required fields                                                                                     | ✓ VERIFIED | DebtFormModal.tsx — 8 fields (accountId, description, originalAmount, totalInstallments, monthlyPayment, interestRate, startDate, notes), converts to minor units, calls createDebt                                               |
| 10  | DebtFormModal validates inputs with zod schema before submission                                                                              | ✓ VERIFIED | DebtFormModal.tsx:10-37 — zod schema with min(1) required, refine for > 0 on numeric fields, zodResolver in useForm                                                                                                               |
| 11  | MarkPaidModal prompts user to select an expense category before marking installment as paid                                                   | ✓ VERIFIED | MarkPaidModal.tsx — filters categories to expense type, groups by parent/child, requires selection before confirming                                                                                                              |
| 12  | After creating a debt or marking an installment paid, the store refetches the debt list                                                       | ✓ VERIFIED | debtStore.ts:83-87 (createDebt refetches), 104-110 (markInstallmentPaid refetches)                                                                                                                                                |
| 13  | User can see a list of debts as expandable cards showing description, account, progress bar, remaining amount, monthly payment, interest rate | ✓ VERIFIED | DebtCard.tsx — collapsed header shows description, accountName, mini progress bar, remaining amount, cuota amount, interest rate %. BUT see Truth #15 for missing next due date.                                                  |
| 14  | User can expand a debt card to see all installments with status badges (pagado/pendiente/vencido)                                             | ✓ VERIFIED | DebtCard.tsx:206-213 — expanded state renders DebtDetail; InstallmentRow.tsx:10-14 — derives display status; lines 82-91 render status badges with correct colors                                                                 |
| 15  | Collapsed debt card shows next due date                                                                                                       | ⚠️ PARTIAL | DebtCard.tsx:42-47 — computeNextDueDate() always returns null; next due date only visible in expanded DebtDetail view, not in collapsed summary                                                                                   |
| 16  | Overdue installments (due_date < today AND status pending) display vencido badge automatically                                                | ✓ VERIFIED | InstallmentRow.tsx:10-14 — getDisplayStatus compares dueDate string < today string (ISO format comparison works correctly)                                                                                                        |
| 17  | User can see credit utilization for credit-card accounts                                                                                      | ✓ VERIFIED | CreditUtilization.tsx — renders per-account utilization bars, saldo actual, compromisos pendientes, limite, disponible                                                                                                            |
| 18  | User can see a 6-month projection table with per-debt columns and monthly total                                                               | ✓ VERIFIED | ProjectionTable.tsx — dynamic columns from unique debts, month formatting, total column, empty state message                                                                                                                      |
| 19  | Navigation bar includes Deudas link and route is wired in App.tsx                                                                             | ✓ VERIFIED | App.tsx:13 — navLinks includes { to: "/debts", label: "Deudas" }; line 55 — `<Route path="/debts" element={<DebtsPage />} />`                                                                                                     |

**Score:** 16/18 truths fully verified (1 failed, 1 partial)

### Required Artifacts

| Artifact                                                  | Expected                 | Status                 | Details                                                                                                                                    |
| --------------------------------------------------------- | ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src-tauri/src/db/migrations/005_create_installments.sql` | installments table DDL   | ✓ VERIFIED (17 lines)  | CREATE TABLE with FK, CASCADE, CHECK constraint, unique constraint, 3 indexes                                                              |
| `src-tauri/src/db/models.rs`                              | Debt/Installment models  | ✓ VERIFIED (224 lines) | 9 debt-related structs with correct derives and serde rename_all                                                                           |
| `src-tauri/src/db/queries/debts.rs`                       | CRUD queries             | ✓ VERIFIED (138 lines) | 7 query functions with computed paid_installments subquery                                                                                 |
| `src-tauri/src/commands/debts.rs`                         | 8 Tauri commands         | ✓ VERIFIED (510 lines) | create_debt, update_debt, delete_debt, list_debts, get_debt_detail, mark_installment_paid, get_credit_utilization, get_payment_projections |
| `src-tauri/src/lib.rs`                                    | Commands registered      | ✓ VERIFIED             | Lines 46-53: all 8 debt commands in generate_handler!                                                                                      |
| `src-tauri/src/db/mod.rs`                                 | Migration 005 registered | 🛑 NOT WIRED           | migrations vector only has 001-004; 005 missing                                                                                            |
| `src/types/index.ts`                                      | Debt TS types            | ✓ VERIFIED (213 lines) | 11 debt-related interfaces/types                                                                                                           |
| `src/lib/tauri.ts`                                        | debtApi wrappers         | ✓ VERIFIED (120 lines) | 8 invoke wrappers with correct types                                                                                                       |
| `src/stores/debtStore.ts`                                 | Zustand store            | ✓ VERIFIED (130 lines) | Full state, filters, 10 actions, refetch-after-mutation                                                                                    |
| `src/components/debts/DebtFormModal.tsx`                  | Create/edit modal        | ✓ VERIFIED (439 lines) | Zod validation, 8 fields, edit mode disables structural fields, dirty guard, amount conversion                                             |
| `src/components/debts/MarkPaidModal.tsx`                  | Category picker modal    | ✓ VERIFIED (224 lines) | Expense category filter, parent>child hierarchy, loading/error states                                                                      |
| `src/pages/DebtsPage.tsx`                                 | Main page                | ✓ VERIFIED (309 lines) | Composes all components, useEffect fetches all data, modals wired, toast notifications                                                     |
| `src/components/debts/DebtCard.tsx`                       | Expandable card          | ⚠️ PARTIAL (216 lines) | Collapsed summary complete except next due date (always null)                                                                              |
| `src/components/debts/DebtDetail.tsx`                     | Expanded detail          | ✓ VERIFIED (157 lines) | Progress bar, summary stats, scrollable installment list, refreshKey for refetch                                                           |
| `src/components/debts/InstallmentRow.tsx`                 | Installment row          | ✓ VERIFIED (116 lines) | Status derivation, badges with correct colors, Pagar button on pending/overdue                                                             |
| `src/components/debts/CreditUtilization.tsx`              | Credit utilization       | ✓ VERIFIED (140 lines) | Per-account bars, color-coded, stats grid, hidden when empty                                                                               |
| `src/components/debts/ProjectionTable.tsx`                | Projection table         | ✓ VERIFIED (177 lines) | Dynamic columns, month formatting, total column, empty state                                                                               |
| `src/App.tsx`                                             | Route + nav link         | ✓ VERIFIED (61 lines)  | "Deudas" nav link + /debts route                                                                                                           |

### Key Link Verification

| From               | To                    | Via                               | Status               | Details                                                                                                                                                            |
| ------------------ | --------------------- | --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| commands/debts.rs  | queries/debts.rs      | `queries::debts::` function calls | ✓ WIRED              | get_debt_by_id, list_debts, delete_debt, list_installments_for_debt, get_installment_by_id, get_account_name_for_debt all called                                   |
| commands/debts.rs  | models.rs             | Debt/Installment model imports    | ✓ WIRED              | Line 5-8: imports CreditUtilization, CreateDebtInput, Debt, DebtFilter, DebtProjectionEntry, DebtWithInstallments, Installment, MonthlyProjection, UpdateDebtInput |
| commands/debts.rs  | pool.begin()/commit() | Atomic transactions               | ✓ WIRED              | create_debt (line 122+174), mark_installment_paid (line 371+412)                                                                                                   |
| src/lib/tauri.ts   | invoke()              | debtApi wrappers                  | ✓ WIRED              | 8 invoke calls matching 8 registered Tauri commands                                                                                                                |
| migration 005      | debts table           | FK reference                      | ✓ VERIFIED (in file) | `REFERENCES debts(id) ON DELETE CASCADE`                                                                                                                           |
| **migration 005**  | **db/mod.rs**         | **include_str! entry**            | 🛑 **NOT WIRED**     | **Migration file exists but not in migrations vector**                                                                                                             |
| debtStore.ts       | debtApi               | invoke wrappers                   | ✓ WIRED              | Lines 66, 84, 90, 96, 101, 105, 115, 123                                                                                                                           |
| DebtFormModal.tsx  | debtStore             | useDebtStore                      | ✓ WIRED              | Line 5 import, line 52 destructure createDebt/updateDebt                                                                                                           |
| MarkPaidModal.tsx  | debtApi               | markInstallmentPaid               | ✓ WIRED (indirect)   | MarkPaidModal calls onConfirm prop → DebtsPage passes handleMarkPaidConfirm → calls store.markInstallmentPaid                                                      |
| DebtsPage.tsx      | debtStore             | useDebtStore                      | ✓ WIRED              | Line 2 import, line 13-24 destructure all needed state/actions                                                                                                     |
| DebtDetail.tsx     | debtApi.getDetail     | Direct API call                   | ✓ WIRED              | Line 2 import, line 31 `debtApi.getDetail(debtId)`                                                                                                                 |
| InstallmentRow.tsx | status derivation     | due_date < today                  | ✓ WIRED              | Lines 10-14: getDisplayStatus with ISO date string comparison                                                                                                      |
| App.tsx            | DebtsPage             | Route + NavLink                   | ✓ WIRED              | Line 7 import, line 13 nav link, line 55 route                                                                                                                     |

### Requirements Coverage

| Requirement | Source Plan  | Description                                                                                 | Status                   | Evidence                                                                                                                                                    |
| ----------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEBT-01     | 04-01, 04-02 | User can create an installment debt with all required fields and linked credit-card account | ⚠️ BLOCKED               | Backend command works (commands/debts.rs), form modal works (DebtFormModal.tsx), but migration 005 not wired so installments table doesn't exist at runtime |
| DEBT-02     | 04-03        | User can view paid vs pending installments for each debt                                    | ⚠️ BLOCKED               | DebtDetail.tsx + InstallmentRow.tsx correctly show installments with status badges, but runtime blocked by migration 005                                    |
| DEBT-03     | 04-02, 04-03 | User can mark an installment as paid manually                                               | ⚠️ BLOCKED               | mark_installment_paid command + MarkPaidModal fully implemented, but runtime blocked by migration 005                                                       |
| DEBT-04     | 04-03        | User sees due installment status advance automatically by date rules                        | ✓ SATISFIED (code-level) | InstallmentRow.tsx:10-14 derives "vencido" from dueDate < today; no backend dependency needed                                                               |
| DEBT-05     | 04-03        | User can view remaining amount to pay for each debt                                         | ✓ SATISFIED (code-level) | DebtCard.tsx:39-40 computes remaining from (total - paid) \* monthlyPayment; DebtDetail.tsx:124 shows remainingAmount from backend                          |
| DEBT-06     | 04-03        | User can view used vs available credit for credit-card accounts                             | ⚠️ BLOCKED               | CreditUtilization.tsx renders correctly, get_credit_utilization command works, but runtime blocked by migration 005                                         |
| DEBT-07     | 04-03        | User can view projected monthly installment commitments                                     | ⚠️ BLOCKED               | ProjectionTable.tsx renders correctly, get_payment_projections command works, but runtime blocked by migration 005                                          |

**Note:** All DEBT requirements are **code-correct** but **runtime-blocked** because the installments table migration (005) is not registered in the migration runner. This is a single-fix blocker.

### Anti-Patterns Found

| File                              | Line     | Pattern                                    | Severity   | Impact                                                                       |
| --------------------------------- | -------- | ------------------------------------------ | ---------- | ---------------------------------------------------------------------------- |
| src-tauri/src/db/mod.rs           | 48-65    | Migration 005 not in vector                | 🛑 Blocker | Installments table never created; all debt features fail at runtime          |
| src/components/debts/DebtCard.tsx | 42-47    | `computeNextDueDate()` always returns null | ⚠️ Warning | Collapsed card never shows next due date, only "Completada" badge or nothing |
| src/stores/debtStore.ts           | 118, 127 | `console.error` in non-critical paths      | ℹ️ Info    | Acceptable for non-critical fetch failures (credit utilization, projections) |

### Human Verification Required

### 1. Full Debt Lifecycle

**Test:** Navigate to Deudas, create a debt with a credit-card account (12 installments), expand the card, verify installments, mark one as paid, verify state updates.
**Expected:** Debt appears with progress bar, installments show pagado/pendiente/vencido badges, marking paid creates expense transaction, progress bar updates.
**Why human:** End-to-end flow across UI + store + backend + DB requires runtime testing.

### 2. Credit Utilization Display

**Test:** Create a credit-card account with credit_limit, create debts against it, navigate to Deudas page.
**Expected:** Credit utilization section at top shows saldo actual, compromisos pendientes, limite, disponible with color-coded bar.
**Why human:** Requires specific test data setup and visual verification.

### 3. Projection Table Accuracy

**Test:** Create multiple debts with different installment schedules, verify projection table.
**Expected:** 6-month table with per-debt columns and correct monthly totals.
**Why human:** Requires data setup and visual verification of table layout.

### 4. Visual Theme Consistency

**Test:** Review all debt components for consistent Lovecraftian dark theme.
**Expected:** Consistent colors (#0a0f06, #111a0a, #2a3518, #4a5d23, #7fff00), Share Tech Mono font, Cinzel Decorative headers.
**Why human:** Visual appearance verification.

### Gaps Summary

**Two gaps were identified:**

1. **🛑 BLOCKER: Migration 005 not registered in migration runner** — The installments table migration file (`005_create_installments.sql`) exists with correct DDL, but it is not included in the `migrations` vector in `src-tauri/src/db/mod.rs`. This means the installments table will never be created when the app runs. **All debt functionality will fail at runtime** because every debt command references the installments table. This is a single-line fix: add `("005_create_installments", include_str!("migrations/005_create_installments.sql"))` to the vector.

2. **⚠️ PARTIAL: Collapsed debt card missing next due date** — The `computeNextDueDate()` function in `DebtCard.tsx` always returns `null`. The next due date is only shown in the expanded `DebtDetail` view. The success criterion specifies the collapsed card should show next due date. This could be fixed by either: (a) deriving from start_date + paidInstallments, or (b) adding next_due_date to the debt list query response.

**Root cause:** Both gaps are related to incomplete wiring — the pieces exist but aren't connected. The migration blocker is particularly impactful because it prevents all DEBT requirements from working at runtime.

---

_Verified: 2026-02-28T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
