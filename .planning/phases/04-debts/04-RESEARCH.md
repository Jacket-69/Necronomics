# Phase 4: Debts - Research

**Researched:** 2026-02-28
**Domain:** Installment debt tracking, credit utilization, payment projections
**Confidence:** HIGH

## Summary

Phase 4 adds installment debt management to Necronomics. The core challenge is a new `installments` table with per-installment tracking (due dates, paid/pending/overdue status), auto-creation of expense transactions when marking installments as paid, credit utilization calculations for credit-card accounts, and a 6-month payment projection table. The existing codebase provides strong patterns: atomic SQL transactions for balance updates, QueryBuilder for dynamic filtering, PaginatedResult for lists, react-hook-form+zod for forms, and Zustand per-domain stores.

The `debts` table already exists in the schema with `paid_installments` as a simple counter. The CONTEXT.md specifies individual installment records in a new `installments` table, so the `paid_installments` column on `debts` becomes a computed value (or is removed/ignored). A new migration (005) is needed for the `installments` table.

**Primary recommendation:** Follow the transaction CRUD pattern exactly. Add a migration for `installments`, create `debts` queries + commands modules, wire Tauri commands, then build the frontend with accordion-style expandable cards and the established modal form pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Individual installment records in a new `installments` table (one row per cuota with due_date, status, actual_payment_date) -- not a simple counter
- Marking an installment as paid auto-creates an expense transaction in the linked account
- User is prompted to select a category each time they mark an installment as paid
- Due dates are tied to the credit card's billing_day (not the debt's start_date). For non-credit-card accounts, fall back to start_date day-of-month
- Overdue status is determined automatically by comparing due_date to current date
- Display: progress bar (e.g., 4/12 cuotas) at the top of the expanded card, plus a scrollable list of individual installments with status badges (pagado/pendiente/vencido)
- Used vs available credit is shown on the Debts page only (not duplicated on Accounts page)
- Credit utilization shows both the account's current balance (total owed) AND the sum of remaining active debt commitments -- separately displayed for a complete picture
- Debts can be linked to any account type, not restricted to credit cards -- covers personal loans, bank credit lines, etc.
- Credit utilization summary only applies to credit-card accounts (accounts with credit_limit)
- 6-month lookahead table with per-debt columns and a monthly total column
- Each debt gets its own column so users see exactly which debts contribute to each month's commitment
- Table rows are months, columns are debts + total
- Debt list uses expandable cards (accordion-style) -- clicking a debt expands inline to show installment detail, no page navigation
- Rich card summary visible before expanding: description, linked account name, progress bar (X/Y), remaining amount, monthly payment, interest rate, next due date
- Debt create/edit uses modal form, consistent with Account and Transaction form modals (react-hook-form + zod pattern)
- Status badges for installments: pagado (green), pendiente (neutral), vencido (red/warning)
- Chilean cuotas model: installments follow the credit card billing cycle

### Claude's Discretion
- Whether to show interest separately or just the total monthly_payment in the projection table (lean toward showing the actual amount that leaves the pocket)
- Where to place credit utilization summary and projection table relative to the debt list (top of page vs tabs) -- choose what works best with the expandable card layout
- Loading skeleton and error state designs
- Exact progress bar visual style within the Lovecraftian aesthetic

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEBT-01 | User can create an installment debt with total amount, installment count, installment amount, interest rate, start date, and linked credit-card account. | Debt create command + modal form. New migration for installments table. Auto-generate installment rows on debt creation. |
| DEBT-02 | User can view paid versus pending installments for each debt. | Expandable card with installment list. Status badges (pagado/pendiente/vencido). Progress bar (X/Y cuotas). |
| DEBT-03 | User can mark an installment as paid manually. | Mark-as-paid command: updates installment status, auto-creates expense transaction atomically. Category picker in mark-paid flow. |
| DEBT-04 | User sees due installment status advance automatically by date rules. | Frontend computes overdue by comparing due_date < today. No cron needed -- derive on read. |
| DEBT-05 | User can view remaining amount to pay for each debt. | Computed from SUM of pending installment amounts. Displayed in card summary. |
| DEBT-06 | User can view used versus available credit for each credit-card account. | Credit utilization section on Debts page. Query accounts with credit_limit, show balance vs limit vs remaining debt commitments. |
| DEBT-07 | User can view projected monthly installment commitments for upcoming months. | 6-month projection table. Query pending installments grouped by month. Per-debt columns + total column. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sqlx | (existing) | SQLite queries and migrations | Already used throughout project |
| tauri | v2 (existing) | IPC commands | Already used throughout project |
| react-hook-form | (existing) | Form state management | Established pattern in all form modals |
| zod | v4 (existing) | Schema validation | Established pattern in all form modals |
| zustand | (existing) | State management | One store per domain pattern |
| react-router | (existing) | Routing | NavLink + Routes pattern |
| lucide-react | (existing) | Icons | Static icon map pattern established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid | (existing Rust) | Generate IDs for debts and installments | On create commands |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Individual installment rows | Simple counter on debts table | Counter is simpler but loses per-installment tracking (dates, status, payment history) -- user chose individual rows |
| Cron/scheduled job for overdue | Derive on read | No background process needed, compute overdue status by comparing due_date < current_date at query/render time |

**Installation:** No new dependencies needed. All libraries are already in the project.

## Architecture Patterns

### Recommended Project Structure
```
src-tauri/src/
├── commands/debts.rs      # Business logic + Tauri commands
├── db/queries/debts.rs    # Simple data access queries
├── db/models.rs           # Add Debt, Installment, DebtFilter structs
├── db/migrations/005_create_installments.sql  # New migration

src/
├── types/index.ts         # Add Debt, Installment, DebtFilter types
├── lib/tauri.ts           # Add debtApi invoke wrappers
├── stores/debtStore.ts    # Zustand store for debts
├── pages/DebtsPage.tsx    # Main debts page
├── components/debts/
│   ├── DebtCard.tsx        # Expandable accordion card (collapsed summary)
│   ├── DebtDetail.tsx      # Expanded view: installment list + progress
│   ├── DebtFormModal.tsx   # Create/edit debt modal
│   ├── InstallmentRow.tsx  # Single installment with status badge
│   ├── MarkPaidModal.tsx   # Category picker + confirm for mark-as-paid
│   ├── CreditUtilization.tsx  # Credit card utilization summary
│   └── ProjectionTable.tsx    # 6-month lookahead table
```

### Pattern 1: Migration for Installments Table
**What:** New SQLite migration creating the `installments` table linked to `debts`
**When to use:** Phase initialization
**Example:**
```sql
-- 005_create_installments.sql
CREATE TABLE installments (
    id TEXT PRIMARY KEY,
    debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    actual_payment_date TEXT,
    transaction_id TEXT REFERENCES transactions(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(debt_id, installment_number)
);

CREATE INDEX idx_installments_debt ON installments(debt_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
```

**Key design decisions:**
- `status` stores 'pending' or 'paid' only in the DB. 'overdue' is derived at read time by comparing due_date < today for pending installments.
- `transaction_id` links to the auto-created expense transaction for audit trail.
- `ON DELETE CASCADE` ensures deleting a debt cleans up installments.
- `amount` is per-installment (equals debt.monthly_payment) stored as INTEGER in minor units.

### Pattern 2: Atomic Mark-as-Paid with Transaction Creation
**What:** Marking an installment as paid creates an expense transaction atomically
**When to use:** When user clicks "mark as paid" on a pending installment
**Example:**
```rust
// In commands/debts.rs
pub async fn mark_installment_paid(
    pool: State<'_, SqlitePool>,
    installment_id: String,
    category_id: String,
) -> Result<Installment, String> {
    // 1. Fetch installment + debt + account in one go
    // 2. Validate: installment is pending, account is active, category matches expense type
    // 3. Begin SQL transaction
    // 4. Insert expense transaction (reuse transaction creation pattern)
    // 5. Update installment: status='paid', actual_payment_date=today, transaction_id=new_txn_id
    // 6. Recalculate account balance (reuse recalculate_account_balance pattern)
    // 7. Commit
}
```

### Pattern 3: Due Date Calculation from Billing Day
**What:** Installment due dates follow credit card billing cycle
**When to use:** When auto-generating installment rows on debt creation
**Example:**
```rust
fn calculate_due_dates(
    start_date: &str,       // Debt start date (YYYY-MM-DD)
    billing_day: Option<i32>, // From credit card account, or None
    total_installments: i32,
) -> Vec<String> {
    // If billing_day exists (credit card): use billing_day as day-of-month
    // If no billing_day (other accounts): use day-of-month from start_date
    // Generate N dates, one per month, advancing from start_date
    // Handle month-end edge cases (e.g., billing_day=31 in February → use last day)
}
```

### Pattern 4: Expandable Card (Accordion)
**What:** Debt list shows collapsed cards that expand inline to show installment detail
**When to use:** DebtsPage main list
**Example:**
```typescript
// DebtCard.tsx - collapsed state shows summary, expanded shows DebtDetail
const DebtCard = ({ debt, isExpanded, onToggle }: Props) => {
  return (
    <div onClick={onToggle}>
      {/* Always visible: description, account, progress, remaining, monthly, rate, next due */}
      <DebtCardSummary debt={debt} />
      {isExpanded && <DebtDetail debt={debt} installments={debt.installments} />}
    </div>
  );
};
```

### Anti-Patterns to Avoid
- **Storing overdue status in the database:** Overdue is a derived state from due_date < today. Storing it creates stale data that needs a cron job to update. Derive on read instead.
- **Using paid_installments counter on debts table:** The user chose individual installment rows. The counter should be computed from COUNT(installments WHERE status='paid'), not maintained separately.
- **Creating transactions outside the mark-paid flow:** Transaction auto-creation must be atomic with the installment status update. Never create the transaction separately.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date arithmetic (month advancement) | Custom date math | chrono crate (already in Rust ecosystem) | Month-end edge cases, leap years |
| Form validation | Manual validation | zod schemas + react-hook-form (established) | Consistent with existing forms |
| Dynamic SQL filtering | String concatenation | QueryBuilder + push_bind (established) | SQL injection prevention |
| Balance updates | Manual arithmetic | SUM-based UPDATE pattern (established) | Drift-free, always correct |

**Key insight:** Every pattern needed for debts already exists in the transactions/accounts implementation. The debt commands follow the same atomic transaction pattern, the queries follow the same QueryBuilder pattern, and the UI follows the same modal+store pattern.

## Common Pitfalls

### Pitfall 1: Orphaned Installments on Debt Deletion
**What goes wrong:** Deleting a debt leaves orphaned installment rows
**Why it happens:** Missing CASCADE or manual cleanup
**How to avoid:** Use `ON DELETE CASCADE` on the foreign key. Also consider what happens to auto-created transactions -- they should remain (they represent real money movement).
**Warning signs:** Installment count queries return unexpected numbers

### Pitfall 2: Double Balance Updates on Mark-as-Paid
**What goes wrong:** Balance gets updated twice if both the installment update and the transaction insertion independently trigger recalculation
**Why it happens:** If the recalculate_account_balance is called by both the mark_installment_paid command and a trigger
**How to avoid:** Only call recalculate_account_balance once, in the mark_installment_paid command's SQL transaction, after both the transaction INSERT and installment UPDATE are done.
**Warning signs:** Account balance is double the expected change after marking paid

### Pitfall 3: Month-End Date Overflow
**What goes wrong:** billing_day=31 produces invalid dates in months with fewer days
**Why it happens:** Naive date arithmetic (just adding 1 to month)
**How to avoid:** Use chrono's NaiveDate and clamp to last day of month. For billing_day=31 in February, use Feb 28/29.
**Warning signs:** Panics or errors in installment generation for billing_day > 28

### Pitfall 4: Overdue Status Not Refreshing
**What goes wrong:** Installments that pass their due date still show as "pendiente" instead of "vencido"
**Why it happens:** Status stored as 'pending' and never updated
**How to avoid:** Derive overdue at read/render time. In Rust: return status as-is from DB ('pending'/'paid'), let frontend compare due_date < today to show 'vencido' badge. Or derive in the SQL query itself with CASE WHEN.
**Warning signs:** Old installments still showing as pending weeks after due date

### Pitfall 5: Projection Table Column Explosion
**What goes wrong:** If a user has many debts, the projection table becomes too wide
**Why it happens:** One column per active debt
**How to avoid:** Horizontal scroll on the table. Consider showing max 5-6 debt columns + total. Or use responsive truncation.
**Warning signs:** Table overflows page width

## Code Examples

### Debt Rust Model
```rust
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Debt {
    pub id: String,
    pub account_id: String,
    pub description: String,
    pub original_amount: i64,
    pub total_installments: i32,
    pub paid_installments: i32,  // Computed from installments table
    pub monthly_payment: i64,
    pub interest_rate: f64,
    pub start_date: String,
    pub is_active: i32,
    pub notes: Option<String>,
    pub created_at: String,
}
```

### Installment Rust Model
```rust
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Installment {
    pub id: String,
    pub debt_id: String,
    pub installment_number: i32,
    pub due_date: String,
    pub amount: i64,
    pub status: String,  // 'pending' or 'paid'
    pub actual_payment_date: Option<String>,
    pub transaction_id: Option<String>,
    pub created_at: String,
}
```

### Credit Utilization Query
```rust
// For credit card accounts only (those with credit_limit)
pub async fn get_credit_utilization(
    pool: &SqlitePool,
    account_id: &str,
) -> Result<CreditUtilization, sqlx::Error> {
    // 1. Get account balance and credit_limit
    // 2. Get SUM of remaining installment amounts for active debts linked to this account
    // 3. Return: balance (current owed), remaining_commitments, credit_limit, available
}
```

### Projection Query
```rust
// 6-month lookahead: pending installments grouped by month and debt
pub async fn get_payment_projections(
    pool: &SqlitePool,
) -> Result<Vec<MonthlyProjection>, sqlx::Error> {
    // SELECT debt_id, strftime('%Y-%m', due_date) as month, SUM(amount) as total
    // FROM installments
    // WHERE status = 'pending'
    //   AND due_date >= date('now')
    //   AND due_date < date('now', '+6 months')
    // GROUP BY debt_id, month
    // ORDER BY month, debt_id
}
```

### TypeScript Debt Types
```typescript
export interface Debt {
  id: string;
  accountId: string;
  description: string;
  originalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  isActive: number;
  notes: string | null;
  createdAt: string;
}

export interface Installment {
  id: string;
  debtId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: "pending" | "paid";
  actualPaymentDate: string | null;
  transactionId: string | null;
  createdAt: string;
}

export type InstallmentDisplayStatus = "pagado" | "pendiente" | "vencido";
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| paid_installments counter on debts table | Individual installment rows with status tracking | This phase (user decision) | Per-installment tracking, audit trail via transaction_id |
| Credit utilization on Accounts page | Credit utilization on Debts page only | This phase (user decision) | Single location for debt-related info |

## Open Questions

1. **debts.paid_installments column**
   - What we know: The existing schema has `paid_installments INTEGER NOT NULL DEFAULT 0` on the debts table
   - What's unclear: Whether to keep it as a denormalized cache or drop it
   - Recommendation: Keep it and update it as a computed value when marking installments paid. It's useful for quick queries without joining installments. Update it atomically in the mark-as-paid SQL transaction.

2. **Projection table: monthly_payment vs computed installment amounts**
   - What we know: Debts have a `monthly_payment` field, and installments have individual `amount` fields
   - What's unclear: Whether to use the debt's monthly_payment or SUM(installment.amount) for projections
   - Recommendation: Use SUM(installment.amount) grouped by month from the installments table. This is more accurate since it reflects the actual pending amounts.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src-tauri/src/commands/transactions.rs` -- atomic balance update pattern
- Existing codebase analysis: `src-tauri/src/db/queries/transactions.rs` -- QueryBuilder + apply_filters pattern
- Existing codebase analysis: `src-tauri/src/db/models.rs` -- Rust model + serde patterns
- Existing codebase analysis: `src/types/index.ts` -- TypeScript type patterns
- Existing codebase analysis: `src/stores/transactionStore.ts` -- Zustand store pattern
- Existing codebase analysis: `src/lib/tauri.ts` -- API invoke wrapper pattern
- Existing codebase analysis: `001_initial_schema.sql` -- debts table and accounts table schemas

### Secondary (MEDIUM confidence)
- chrono crate for date arithmetic -- widely used in Rust ecosystem

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- follows established patterns from Phases 1-3 exactly
- Pitfalls: HIGH -- identified from analyzing existing transaction/balance code patterns

**Research date:** 2026-02-28
**Valid until:** 2026-03-28 (stable -- no external library changes expected)
