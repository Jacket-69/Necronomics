# Phase 3: Transactions and Balances - Research

**Researched:** 2026-02-28
**Domain:** Transaction CRUD, paginated/filtered/sorted table, deterministic balance calculation
**Confidence:** HIGH

## Summary

Phase 3 adds the core financial data layer — transactions — and wires up deterministic balance calculations. The existing codebase already has the `transactions` table with proper indices (`idx_transactions_date`, `idx_transactions_category`, `idx_transactions_account`, `idx_transactions_type`, `idx_transactions_description`) and the `exchange_rates` table for currency conversion. The `accounts.balance` column (INTEGER, minor units) already exists and defaults to 0. No new migration is needed for core schema — the tables and indices are ready.

The backend pattern is fully established: `db/queries/` module for raw SQL, `commands/` module for Tauri IPC handlers with business validation, `db/models.rs` for `#[derive(FromRow, Serialize, Deserialize)]` structs. The frontend pattern is equally clear: Zustand stores with try/catch and optimistic updates, `lib/tauri.ts` for typed invoke wrappers, modal-based forms with react-hook-form + zod + zodResolver, and page components that orchestrate modals/toasts/loading/error states.

**Primary recommendation:** Follow established patterns exactly. The main new complexity is building a dynamic SQL query (filtering, sorting, pagination) with `sqlx::QueryBuilder` on the backend, and managing filter/pagination/search state in the transaction Zustand store on the frontend.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Modal-based form (consistent with categories pattern, not dedicated page)
- Income/expense selection via toggle buttons at the top of the form — two prominent buttons, selected one highlighted
- Amount entry in human-readable format — user types '15000' for CLP, '29.99' for USD; app converts to minor units internally based on currency decimal config
- Field order: Type toggle > Amount > Account > Category > Date > Description
- Date field preselected to current date (TXN-04)
- Description is optional free text
- Collapsible filter bar above the table — expands/collapses to show filter controls for date range, type, category, account, and min/max amount
- Classic page-number pagination with prev/next controls
- Live text search with debounce — results update as user types
- All key columns sortable (TXN-08)
- Type implied by amount color: green for income, red for expense
- Balances visible on both the accounts page (per-account, already exists) and the transactions page (summary header)
- Transactions page header shows a summary with per-account balances in their native currencies plus a consolidated total converted to base currency (CLP default)
- Animated transition/flash on balance numbers after transaction mutations — draws attention to the change
- Balance updates are deterministic: recalculated after every create, edit, or delete
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                         | Research Support                                                                                                          |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| TXN-01 | Create transaction with amount, type, account, category, date, optional description | Modal form pattern from categories; backend command with validation; amount conversion from human-readable to minor units |
| TXN-02 | Edit existing transaction                                                           | Same modal form in edit mode; update command recalculates balance delta                                                   |
| TXN-03 | Delete transaction after confirmation                                               | Delete modal pattern from categories; reverse balance on delete                                                           |
| TXN-04 | Current date preselected on new transaction form                                    | Default form value set to `new Date().toISOString().split('T')[0]`                                                        |
| TXN-05 | Paginated transaction table                                                         | Backend LIMIT/OFFSET with total count; frontend page-number pagination controls                                           |
| TXN-06 | Filter by date range, type, category, account, min/max amount                       | Dynamic WHERE clause via `sqlx::QueryBuilder`; collapsible filter bar UI                                                  |
| TXN-07 | Search by description text                                                          | SQL `LIKE '%term%'` on description column (already indexed); debounced input on frontend                                  |
| TXN-08 | Sort by key columns                                                                 | Dynamic ORDER BY via QueryBuilder; sort state in store                                                                    |
| BAL-01 | Balances update deterministically after transaction create/edit/delete              | SQL UPDATE accounts.balance in same transaction as INSERT/UPDATE/DELETE; recalculate from SUM or delta-based              |
| BAL-02 | Consolidated total in base currency using stored exchange rates                     | Query exchange_rates table for latest rate per currency pair; convert and sum in Rust command                             |

</phase_requirements>

## Standard Stack

### Core (Already in Project)

| Library             | Version | Purpose                                              | Why Standard                                                              |
| ------------------- | ------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| sqlx                | 0.8     | SQLite queries, QueryBuilder for dynamic SQL         | Already used for accounts/categories; runtime queries pattern established |
| tauri               | 2       | IPC commands between Rust backend and React frontend | Project framework                                                         |
| react-hook-form     | 7.71    | Form state management with validation                | Already used in CategoryFormModal                                         |
| zod                 | 4.3     | Schema validation for form data                      | Already used with zodResolver                                             |
| @hookform/resolvers | 5.2     | zodResolver adapter                                  | Already in project                                                        |
| zustand             | 5.0     | Frontend state management                            | Already used for accounts/categories stores                               |
| react-router        | 7.13    | Routing with query params for per-account filtering  | Already used, supports `useSearchParams`                                  |
| lucide-react        | 0.575   | Icons for sort indicators, filter controls           | Already in project                                                        |
| chrono              | 0.4     | Date parsing/formatting in Rust                      | Already in Cargo.toml                                                     |
| uuid                | 1       | Transaction ID generation                            | Already in Cargo.toml                                                     |

### Supporting (No New Dependencies Needed)

No new libraries required. The existing stack covers all needs:

- Dynamic SQL: `sqlx::QueryBuilder<Sqlite>` (already available)
- Date handling frontend: native `<input type="date" />` (no date picker library needed)
- Debounce: simple `setTimeout`-based custom hook (~5 lines) — no library needed
- Number formatting: existing `formatCurrency` in `lib/formatters.ts`
- Animation: CSS transitions with `transition` property for balance flash effect

### Alternatives Considered

| Instead of                   | Could Use              | Tradeoff                                                                                 |
| ---------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| Custom debounce hook         | lodash.debounce        | Adding a dependency for 5 lines of code; not worth it                                    |
| Native `<input type="date">` | react-datepicker       | Extra dependency; native input is sufficient for desktop Linux                           |
| Manual pagination state      | TanStack Table         | Heavy library for a single table; manual state is simpler and matches existing patterns  |
| Delta-based balance updates  | Full SUM recalculation | Delta is faster but SUM is more robust against data corruption; see Architecture section |

## Architecture Patterns

### Recommended Project Structure

```
src-tauri/src/
├── commands/
│   ├── transactions.rs    # Tauri commands: create/update/delete/list transactions
│   └── mod.rs             # Add: pub mod transactions;
├── db/
│   ├── models.rs          # Add: Transaction struct, TransactionFilter, PaginatedResult
│   ├── queries/
│   │   ├── transactions.rs # SQL queries with QueryBuilder for dynamic filtering
│   │   └── mod.rs         # Add: pub mod transactions;
│   └── migrations/        # No new migration needed — schema exists
└── services/
    └── mod.rs             # Balance calculation service (optional, can stay in commands)

src/
├── components/
│   └── transactions/
│       ├── TransactionFormModal.tsx    # Create/edit modal (follows CategoryFormModal pattern)
│       ├── DeleteTransactionModal.tsx  # Confirm delete (follows DeleteCategoryModal pattern)
│       ├── TransactionTable.tsx        # Paginated, sortable table
│       ├── TransactionRow.tsx          # Single row component
│       ├── TransactionFilters.tsx      # Collapsible filter bar
│       ├── BalanceSummary.tsx          # Header with per-account + consolidated balances
│       └── Pagination.tsx             # Page number controls
├── pages/
│   └── TransactionsPage.tsx           # Orchestrates all transaction components
├── stores/
│   └── transactionStore.ts            # Zustand store with filters, pagination, sort state
├── lib/
│   └── tauri.ts                       # Add: transactionApi object
└── types/
    └── index.ts                       # Add: Transaction, TransactionFilter, PaginatedResult types
```

### Pattern 1: Dynamic SQL Query Building with sqlx::QueryBuilder

**What:** Build SELECT queries at runtime based on active filters, sort column, sort direction, and pagination.
**When to use:** Any list endpoint with user-controlled filtering/sorting/pagination.

```rust
// Source: sqlx docs - QueryBuilder with Sqlite
use sqlx::{QueryBuilder, Sqlite, SqlitePool, FromRow};

#[derive(FromRow, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub account_id: String,
    pub category_id: String,
    pub amount: i64,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub description: String,
    pub date: String,
    pub notes: Option<String>,
    pub created_at: String,
}

pub async fn list_filtered(
    pool: &SqlitePool,
    account_id: Option<&str>,
    category_id: Option<&str>,
    transaction_type: Option<&str>,
    date_from: Option<&str>,
    date_to: Option<&str>,
    amount_min: Option<i64>,
    amount_max: Option<i64>,
    search: Option<&str>,
    sort_by: &str,
    sort_dir: &str,
    page: i64,
    page_size: i64,
) -> Result<(Vec<Transaction>, i64), sqlx::Error> {
    // Base query
    let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
        "SELECT id, account_id, category_id, amount, type, description, date, notes, created_at FROM transactions WHERE 1=1"
    );

    // Dynamic WHERE clauses
    if let Some(aid) = account_id {
        builder.push(" AND account_id = ").push_bind(aid.to_string());
    }
    if let Some(cid) = category_id {
        builder.push(" AND category_id = ").push_bind(cid.to_string());
    }
    if let Some(t) = transaction_type {
        builder.push(" AND type = ").push_bind(t.to_string());
    }
    if let Some(df) = date_from {
        builder.push(" AND date >= ").push_bind(df.to_string());
    }
    if let Some(dt) = date_to {
        builder.push(" AND date <= ").push_bind(dt.to_string());
    }
    if let Some(min) = amount_min {
        builder.push(" AND amount >= ").push_bind(min);
    }
    if let Some(max) = amount_max {
        builder.push(" AND amount <= ").push_bind(max);
    }
    if let Some(s) = search {
        builder.push(" AND description LIKE ").push_bind(format!("%{s}%"));
    }

    // Count query (clone before adding ORDER BY / LIMIT)
    // Note: QueryBuilder doesn't impl Clone, so build count query separately
    // ... build a separate count QueryBuilder with same WHERE conditions

    // ORDER BY (validated against whitelist to prevent injection)
    let valid_columns = ["date", "amount", "description", "type", "created_at"];
    let col = if valid_columns.contains(&sort_by) { sort_by } else { "date" };
    let dir = if sort_dir == "ASC" { "ASC" } else { "DESC" };
    builder.push(format!(" ORDER BY {col} {dir}"));

    // LIMIT / OFFSET
    let offset = (page - 1) * page_size;
    builder.push(" LIMIT ").push_bind(page_size);
    builder.push(" OFFSET ").push_bind(offset);

    let rows = builder.build_query_as::<Transaction>()
        .fetch_all(pool)
        .await?;

    Ok((rows, total_count))
}
```

**Key detail:** `QueryBuilder` does NOT implement `Clone`, so to get both the filtered count and the filtered page, either:

1. Build the WHERE conditions string once, then use it in two separate queries (recommended)
2. Run a COUNT query first with same filter params, then run the paginated SELECT

### Pattern 2: Deterministic Balance Updates via SQL Transaction

**What:** Wrap transaction mutations + balance updates in a single SQLite transaction to ensure atomicity.
**When to use:** Every create, edit, and delete of a transaction.

```rust
// Approach: SUM-based recalculation (robust, simple, fast enough for personal finance)
pub async fn create_transaction_and_update_balance(
    pool: &SqlitePool,
    txn: &NewTransaction,
) -> Result<Transaction, sqlx::Error> {
    let mut db_txn = pool.begin().await?;

    // Insert the transaction
    sqlx::query("INSERT INTO transactions (id, account_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(&txn.id)
        .bind(&txn.account_id)
        .bind(&txn.category_id)
        .bind(txn.amount)
        .bind(&txn.transaction_type)
        .bind(&txn.description)
        .bind(&txn.date)
        .execute(&mut *db_txn)
        .await?;

    // Recalculate balance from all transactions for this account
    sqlx::query(
        "UPDATE accounts SET balance = (
            SELECT COALESCE(
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0
            )
            FROM transactions WHERE account_id = ?
        ) WHERE id = ?"
    )
    .bind(&txn.account_id)
    .bind(&txn.account_id)
    .execute(&mut *db_txn)
    .await?;

    db_txn.commit().await?;

    // Return the created transaction
    get_by_id(pool, &txn.id).await?.ok_or(sqlx::Error::RowNotFound)
}
```

**Why SUM over delta:** For a personal finance app with at most thousands of transactions per account, SUM is negligible in cost and guarantees the balance is always correct even if data was manually modified. Delta-based is an optimization for high-volume systems.

### Pattern 3: Human-Readable Amount to Minor Units Conversion

**What:** Convert user-entered decimal amounts (e.g., "29.99") to integer minor units (2999) based on currency `decimal_places`.
**When to use:** In the create/update transaction command, before storing the amount.

```rust
/// Convert a human-readable amount string to minor units integer.
/// e.g., "29.99" with decimal_places=2 → 2999
/// e.g., "15000" with decimal_places=0 → 15000
pub fn to_minor_units(amount: f64, decimal_places: i32) -> i64 {
    let factor = 10_f64.powi(decimal_places);
    (amount * factor).round() as i64
}
```

On the frontend, the form sends the human-readable amount as a float/string. The backend command fetches the account's currency `decimal_places` and converts.

Alternatively, do the conversion on the frontend before invoking:

```typescript
const toMinorUnits = (amount: number, decimalPlaces: number): number => {
  return Math.round(amount * Math.pow(10, decimalPlaces));
};
```

**Recommendation:** Do conversion on the frontend (TypeScript side) because:

1. The currency info is already available in the account store
2. Keeps the backend command accepting a clean `i64` amount (consistent with how `balance` is stored)
3. Avoids floating point transmission issues

### Pattern 4: Paginated Response Type

**What:** Wrap list results with pagination metadata.
**When to use:** Any paginated list endpoint.

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResult<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}
```

```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Pattern 5: Transaction Store with Filter/Pagination/Sort State

**What:** Zustand store that holds both the data and the query parameters, re-fetching when params change.
**When to use:** The transaction list page.

```typescript
interface TransactionFilters {
  accountId: string | null;
  categoryId: string | null;
  type: "income" | "expense" | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  search: string;
  sortBy: string;
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number;
}

interface TransactionState {
  transactions: Transaction[];
  total: number;
  totalPages: number;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  // ... CRUD methods
}
```

### Pattern 6: Balance Summary with Currency Consolidation

**What:** A dedicated Tauri command that returns per-account balances and a consolidated total in base currency.
**When to use:** The transactions page header and accounts page.

```rust
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BalanceSummary {
    pub accounts: Vec<AccountBalance>,
    pub consolidated_total: i64,
    pub base_currency_code: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountBalance {
    pub account_id: String,
    pub account_name: String,
    pub balance: i64,
    pub currency_code: String,
}
```

For BAL-02, the consolidation logic:

1. Fetch all active accounts with their balances and currency codes
2. For each non-base-currency account, look up the latest exchange rate from `exchange_rates` table
3. Convert balance to base currency units, sum all

**Important:** Exchange rates may not exist yet (Phase 6 handles CURR-04). For Phase 3, handle the case where no exchange rate is found: either skip the account in consolidation or show "N/A" — the consolidated total should only include accounts with known rates plus base-currency accounts.

### Anti-Patterns to Avoid

- **Storing amount as float:** Always use integer minor units (already established in schema). Never use REAL/float for monetary values.
- **Client-side balance calculation:** Balance must be recalculated server-side in an atomic SQL transaction. Never trust frontend-computed balances.
- **Unbounded queries:** Always enforce pagination limits. Default page_size should be 20-50, with a max cap (e.g., 100).
- **Dynamic column names from user input in ORDER BY:** Whitelist valid column names. Never interpolate user strings into ORDER BY.
- **Recalculating all account balances on every mutation:** Only recalculate the affected account's balance.

## Don't Hand-Roll

| Problem                                     | Don't Build                | Use Instead                                      | Why                                              |
| ------------------------------------------- | -------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Form validation                             | Custom validation logic    | zod schema + react-hook-form + zodResolver       | Already established pattern; handles edge cases  |
| SQL injection prevention in dynamic queries | String concatenation       | `sqlx::QueryBuilder::push_bind`                  | Parameterized queries are the only safe approach |
| State management                            | Custom context/reducer     | Zustand store (established pattern)              | Consistent with accounts/categories              |
| Date formatting/parsing                     | Manual string manipulation | `chrono` (Rust), native Date API (TS)            | Edge cases with timezone, locale                 |
| Currency formatting                         | Custom formatter           | Existing `formatCurrency` in `lib/formatters.ts` | Already handles all 5 currencies                 |

**Key insight:** This phase has zero new library needs. Every tool required is already in the project. The complexity is in wiring existing patterns together for a more data-heavy domain.

## Common Pitfalls

### Pitfall 1: Floating Point in Amount Handling

**What goes wrong:** User enters "29.99", it becomes 29.989999999... in float, gets stored as 2998 instead of 2999.
**Why it happens:** IEEE 754 floating point representation.
**How to avoid:** Use `Math.round(amount * Math.pow(10, decimalPlaces))` — the `.round()` corrects sub-cent drift. In Rust, `(amount * factor).round() as i64`.
**Warning signs:** Off-by-one cent errors in balances.

### Pitfall 2: Race Condition on Balance Updates

**What goes wrong:** Two rapid transaction creates read the same balance, both compute delta, one overwrites the other.
**Why it happens:** Non-atomic read-modify-write.
**How to avoid:** Use SUM-based recalculation inside a SQL transaction (`pool.begin()` / `db_txn.commit()`). The SUM always produces the correct result regardless of concurrent writes.
**Warning signs:** Balance drifts over time, doesn't match manual sum of transactions.

### Pitfall 3: QueryBuilder Cannot Be Cloned

**What goes wrong:** Trying to reuse a `QueryBuilder` for both COUNT and SELECT queries fails because `QueryBuilder<Sqlite>` doesn't implement `Clone`.
**Why it happens:** QueryBuilder owns its bind arguments.
**How to avoid:** Either build the WHERE clause as a string + Vec of params and apply to both builders, or make a helper function that accepts params and returns either a count or a data query. Simplest approach: accept filter params in a struct and call two separate functions — `count_filtered(pool, &filters)` and `list_filtered(pool, &filters)`.
**Warning signs:** Compile error on `.clone()`.

### Pitfall 4: Pagination Off-By-One

**What goes wrong:** Page 1 shows offset 1 instead of 0, missing the first record. Or `totalPages` calculation is wrong for exact multiples.
**Why it happens:** Confusion between 0-indexed and 1-indexed pages.
**How to avoid:** Convention: pages are 1-indexed on the API. `offset = (page - 1) * page_size`. `total_pages = (total + page_size - 1) / page_size` (ceiling division).
**Warning signs:** First record never appears, or last page shows extra empty rows.

### Pitfall 5: Filter State Resets Page Number

**What goes wrong:** User is on page 3, changes a filter, still on page 3 but new filter only has 1 page of results — shows empty.
**Why it happens:** Filters change the result count but page wasn't reset.
**How to avoid:** In `setFilters`, always reset `page` to 1 when any filter other than page changes.
**Warning signs:** Empty table after changing filters despite matching records existing.

### Pitfall 6: Missing Exchange Rates for Consolidation

**What goes wrong:** No exchange rate exists for USD→CLP, `consolidated_total` crashes or shows wrong value.
**Why it happens:** Phase 6 (Currency and Settings) handles exchange rate CRUD. In Phase 3, rates may not exist.
**How to avoid:** Handle gracefully — only include accounts with available rates in consolidation. Show a warning indicator for accounts without rates. Or: seed default exchange rates in a migration for Phase 3 use.
**Warning signs:** Panic/error when opening transactions page with multi-currency accounts.

### Pitfall 7: Description Field Schema Mismatch

**What goes wrong:** The DB schema has `description TEXT NOT NULL` but the CONTEXT.md says "Description is optional free text."
**Why it happens:** Schema was designed before the UX decision.
**How to avoid:** Either add a migration to make `description` nullable (`ALTER TABLE transactions ADD COLUMN` won't work for making nullable in SQLite — need to handle as default empty string), or treat empty string as "no description" at the application level. **Recommendation:** Use empty string `""` as the default — `NOT NULL DEFAULT ''` — simpler than schema migration.
**Warning signs:** Insert fails when user doesn't enter a description.

## Code Examples

### Transaction Struct (Rust)

```rust
// src-tauri/src/db/models.rs
#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub account_id: String,
    pub category_id: String,
    pub amount: i64,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub description: String,
    pub date: String,
    pub notes: Option<String>,
    pub created_at: String,
}
```

### Transaction Types (TypeScript)

```typescript
// src/types/index.ts
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number; // already in minor units
  transactionType: TransactionType;
  description: string;
  date: string;
}

export interface UpdateTransactionInput {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  transactionType?: TransactionType;
  description?: string;
  date?: string;
}

export interface TransactionFilters {
  accountId: string | null;
  categoryId: string | null;
  transactionType: TransactionType | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  search: string;
  sortBy: string;
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Debounce Hook (TypeScript)

```typescript
// src/lib/hooks.ts
import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
```

### Amount Conversion (TypeScript)

```typescript
// src/lib/formatters.ts — add to existing file
export const toMinorUnits = (amount: number, decimalPlaces: number): number => {
  return Math.round(amount * Math.pow(10, decimalPlaces));
};

export const fromMinorUnits = (minorUnits: number, decimalPlaces: number): number => {
  return decimalPlaces === 0 ? minorUnits : minorUnits / Math.pow(10, decimalPlaces);
};
```

### Balance Flash Animation (CSS)

```css
/* Brief flash when balance changes */
@keyframes balance-flash {
  0% {
    color: #7fff00;
    text-shadow: 0 0 8px rgba(127, 255, 0, 0.6);
  }
  100% {
    color: #c4d4a0;
    text-shadow: none;
  }
}

.balance-updated {
  animation: balance-flash 0.8s ease-out;
}
```

### Filter Struct (Rust)

```rust
// src-tauri/src/db/models.rs
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionFilter {
    pub account_id: Option<String>,
    pub category_id: Option<String>,
    pub transaction_type: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub amount_min: Option<i64>,
    pub amount_max: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}
```

## State of the Art

| Old Approach                         | Current Approach                      | When Changed    | Impact                                          |
| ------------------------------------ | ------------------------------------- | --------------- | ----------------------------------------------- |
| `sqlx::query()` string concatenation | `sqlx::QueryBuilder` with `push_bind` | sqlx 0.6+       | Safe dynamic queries without SQL injection risk |
| `serde(error_map)` in Zod            | `message` param in Zod v4             | Zod v4 (2025)   | Already adopted in project per STATE.md         |
| React Router v5 `useHistory`         | React Router v7 `useSearchParams`     | React Router v7 | Needed for `?account=:id` query param filtering |

**Deprecated/outdated:**

- `sqlx::query!` macro: Not used in this project (runtime queries preferred per STATE.md decision)
- `zod.errorMap`: Replaced by `message` param in Zod v4 (already adopted)

## Open Questions

1. **Description column NOT NULL vs optional**

   - What we know: DB schema has `description TEXT NOT NULL`, CONTEXT.md says "Description is optional free text"
   - What's unclear: Whether to add a migration or use empty string convention
   - Recommendation: Use empty string `""` as default when user leaves description blank. No migration needed. The NOT NULL constraint stays, empty string means "no description."

2. **Exchange rate availability for BAL-02**

   - What we know: `exchange_rates` table exists but Phase 6 handles CURR-04 (exchange rate CRUD). No rates may exist yet.
   - What's unclear: Should Phase 3 seed default rates, or handle missing rates gracefully?
   - Recommendation: Handle missing rates gracefully. Show consolidated total for base-currency accounts only. Show "—" or a note for accounts without exchange rates. This is more honest and avoids hardcoding rates that may be wrong.

3. **Sidebar implementation**
   - What we know: CONTEXT.md says "Transacciones gets its own top-level sidebar entry" but no sidebar component exists yet (UX-01 is Phase 8)
   - What's unclear: Whether to build a minimal sidebar now or just add the route
   - Recommendation: Add the `/transactions` route and navigation. A proper sidebar is Phase 8 (UX Foundations). For now, add a minimal nav/tab bar similar to existing top-level navigation, or a simple link. Don't build the full sidebar.

## Sources

### Primary (HIGH confidence)

- Codebase exploration — existing patterns in `src-tauri/src/commands/`, `src-tauri/src/db/`, `src/stores/`, `src/components/categories/`, `src/lib/tauri.ts`
- `/websites/rs_sqlx_sqlx` (Context7) — QueryBuilder API, push_bind, build_query_as, separated method for dynamic WHERE
- SQLite schema in `001_initial_schema.sql` — transactions table with indices, exchange_rates table, accounts.balance column

### Secondary (MEDIUM confidence)

- `/websites/rs_sqlx` (Context7) — query macro patterns, bind parameter syntax for SQLite
- React Router v7 docs — useSearchParams for query parameter filtering

### Tertiary (LOW confidence)

- None — all findings verified against codebase or Context7

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — entire stack already in project, zero new dependencies
- Architecture: HIGH — follows established patterns from Phase 1 and 2, verified with Context7 for QueryBuilder API
- Pitfalls: HIGH — based on known SQLite/sqlx behaviors and common pagination/float issues

**Research date:** 2026-02-28
**Valid until:** 2026-03-28 (stable — no fast-moving dependencies)
