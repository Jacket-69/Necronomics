# Phase 1: Accounts - Research

**Researched:** 2026-02-27
**Domain:** Full-stack account CRUD — Tauri v2 IPC commands, sqlx queries, React forms with validation, Zustand store, responsive list UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Account creation flow**
- Use a single "New account" form with account type selected inside the form.
- Show or hide type-specific fields dynamically when account type changes.
- Default new account currency to the configured base currency.
- After successful creation, redirect to accounts list view.

**Edit and type-specific rules**
- Account type is locked after creation.
- Account name and currency remain editable.
- Credit-card accounts must always have credit limit and billing day in create and edit flows.
- Validation runs on field blur and also includes a submit-level error summary.
- If legacy credit-card data is missing required fields, block save until the fields are fixed.

**Delete/archive confirmation behavior**
- Provide both archive and permanent delete actions; archive is the primary destructive path.
- Permanent delete requires typed confirmation.
- If an account has transaction history, permanent delete is blocked; archive remains available.
- After archive/delete action, return to accounts list and show success toast.

**Accounts list presentation**
- Use a dense table on desktop and stacked cards on mobile.
- Default sort is by account type, then account name.
- Display current balance right-aligned with strong visual emphasis and currency symbol.
- Show inline quick actions (edit/archive) plus overflow menu for additional actions.

### Claude's Discretion
- Exact copywriting for labels, helper text, and validation strings.
- Visual styling details (spacing, typography scale, iconography).
- Precise breakpoint behavior for desktop table to mobile card transitions.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACCT-01 | User can create an account as cash, bank, or credit card with name and currency. | Tauri command `create_account` + sqlx INSERT + React form with RHF/Zod + account type selector with dynamic field rendering |
| ACCT-02 | User can edit account details; credit-card accounts require editable credit limit and billing day. | Tauri command `update_account` + sqlx UPDATE + same form reused in edit mode with type locked; conditional required fields for credit_card |
| ACCT-03 | User can delete or archive an account only after explicit confirmation. | Two-path modal: archive sets `is_active=0`; permanent delete blocked if transactions exist (FK check); typed confirmation input for hard delete |
| ACCT-04 | User can view current balance for each account. | `balance` column already in `accounts` table as INTEGER (minor currency unit); Tauri command `list_accounts` returns balance; formatter maps to display string |
</phase_requirements>

---

## Summary

Phase 1 delivers the foundational account lifecycle — create, read, update, delete/archive — for three account types (cash, bank, credit_card). The database schema is **already complete** (`accounts` table in migration `001_initial_schema.sql`) with all required columns: `name`, `type`, `currency_id`, `balance`, `credit_limit`, `billing_day`, `is_active`. No schema migration is needed for this phase; the task is wiring the IPC layer, business logic, and UI.

The stack for this phase is: **Rust Tauri commands → sqlx queries → TypeScript `invoke` wrappers → Zustand account store → React pages/components with react-hook-form + Zod**. Several frontend dependencies declared in `docs/ARCHITECTURE.md` are not yet installed (`zustand`, `react-router`, `react-hook-form`, `zod`, `@hookform/resolvers`). The first task of this phase must install them.

The most important design constraint is **conditional required fields**: `credit_limit` and `billing_day` are only required for `credit_card` type. This must be enforced both in the Zod schema (using `.superRefine` or `.discriminatedUnion`) and in the Rust command (returning a typed error if a credit_card account is missing these values). The second critical constraint is **hard-delete blocking**: if an account has any rows in `transactions`, permanent delete must be refused — archive is the only path.

**Primary recommendation:** Build the Rust command layer first (commands + queries + models), then wire the Zustand store, then build the UI layer. This order matches the data flow and ensures IPC contracts are stable before UI work begins.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sqlx` | 0.8 (already in Cargo.toml) | Async SQLite queries with compile-time verification | Already chosen; provides type-safe `query_as!` / `query!` macros |
| `serde` + `serde_json` | 1 (already in Cargo.toml) | Serialize Rust structs to JSON for Tauri IPC | Required by Tauri command system |
| `uuid` | 1 (already in Cargo.toml) | Generate `id` values for new accounts | Already chosen; use `Uuid::new_v4().to_string()` |
| `@tauri-apps/api` | 2.10.1 (already in package.json) | `invoke()` to call Rust commands from frontend | Only Tauri-sanctioned IPC method |
| `zustand` | 5.x (NOT installed) | Client-side account store | Chosen in ARCHITECTURE.md; minimal boilerplate, no Provider |
| `react-router` | 7.x (NOT installed) | Page routing (AccountsPage, NewAccountPage, EditAccountPage) | Chosen in ARCHITECTURE.md; v7 supports React 19 |
| `react-hook-form` | 7.x (NOT installed) | Form state + per-field validation | Chosen in ARCHITECTURE.md; uncontrolled inputs, minimal re-renders |
| `zod` | 3.x (NOT installed) | Schema definition + TypeScript type inference | Chosen in ARCHITECTURE.md; integrates with RHF via resolver |
| `@hookform/resolvers` | 3.x (NOT installed) | Bridge between RHF and Zod | Required to use `zodResolver` with RHF |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `chrono` | 0.4 (already in Cargo.toml) | Date handling in Rust if needed | Not needed for Phase 1 (no date fields on accounts) |
| `rust_decimal` | 1 (already in Cargo.toml) | Monetary arithmetic | Not needed for Phase 1; balance stored as INTEGER, no arithmetic required in account commands |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-hook-form` | Controlled inputs with useState | RHF is already decided; controlled inputs would cause full re-renders on every keystroke |
| `zod` | Manual validation | Zod already decided; provides schema-inferred types used as ground truth |
| `zustand` | React Context + useReducer | Zustand already decided; no Provider wrapping needed |

**Installation (run once before any implementation):**
```bash
npm install zustand react-router @hookform/resolvers zod react-hook-form
```
> Note: `react-router` v7 ships as a single package; do not install `react-router-dom` separately — it is included.

---

## Architecture Patterns

### Recommended Project Structure

New files/directories this phase creates (relative to project root):

```
src-tauri/src/
├── commands/
│   └── accounts.rs          # Tauri IPC handlers: create, list, get, update, archive, delete
├── db/
│   ├── models.rs            # Account, AccountRow structs
│   └── queries/
│       └── accounts.rs      # All SQL for accounts entity
└── services/
    └── (no service needed for Phase 1 — commands call queries directly)

src/
├── pages/
│   └── AccountsPage.tsx     # List view (table + cards)
├── components/
│   └── accounts/
│       ├── AccountForm.tsx       # Shared create/edit form
│       ├── AccountList.tsx       # Desktop table + mobile cards
│       ├── AccountCard.tsx       # Single card (mobile)
│       ├── AccountRow.tsx        # Single table row (desktop)
│       └── ConfirmDeleteModal.tsx  # Archive/delete confirmation
├── stores/
│   └── accountStore.ts      # Zustand store for accounts
├── lib/
│   ├── tauri.ts             # invoke wrappers (typed)
│   └── formatters.ts        # formatCurrency, formatAccountType
└── types/
    └── index.ts             # Account, AccountType, Currency types
```

### Pattern 1: Tauri Command with SqlitePool State

Every Rust command accesses the pool via `tauri::State<'_, SqlitePool>`. The pool is already registered in `lib.rs` via `app.manage(pool)`.

```rust
// Source: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/calling-rust.mdx
// src-tauri/src/commands/accounts.rs

use sqlx::SqlitePool;
use tauri::State;
use crate::db::queries::accounts;
use crate::db::models::Account;

#[tauri::command]
pub async fn list_accounts(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Account>, String> {
    accounts::get_all(&pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_account(
    pool: State<'_, SqlitePool>,
    name: String,
    account_type: String,
    currency_id: String,
    credit_limit: Option<i64>,
    billing_day: Option<i32>,
) -> Result<Account, String> {
    // Validate credit_card requirements before DB call
    if account_type == "credit_card" {
        if credit_limit.is_none() || billing_day.is_none() {
            return Err("credit_card accounts require credit_limit and billing_day".into());
        }
    }
    accounts::create(&pool, name, account_type, currency_id, credit_limit, billing_day)
        .await
        .map_err(|e| e.to_string())
}
```

Commands must be registered in `lib.rs` `invoke_handler`:
```rust
// lib.rs — add to generate_handler! after all commands defined
.invoke_handler(tauri::generate_handler![
    commands::accounts::list_accounts,
    commands::accounts::create_account,
    commands::accounts::get_account,
    commands::accounts::update_account,
    commands::accounts::archive_account,
    commands::accounts::delete_account,
])
```

All commands are registered in a SINGLE `invoke_handler` call — calling it multiple times overwrites previous registrations (verified in Tauri docs).

### Pattern 2: sqlx Query Without Macros

The project uses `include_str!` migrations without `sqlx::query!` compile-time checking (no `DATABASE_URL` env var set). Use runtime `sqlx::query_as` pattern:

```rust
// src-tauri/src/db/queries/accounts.rs
use sqlx::SqlitePool;
use crate::db::models::Account;

pub async fn get_all(pool: &SqlitePool) -> Result<Vec<Account>, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        "SELECT id, name, type, currency_id, balance, credit_limit, billing_day, is_active, created_at
         FROM accounts
         WHERE is_active = 1
         ORDER BY type, name"
    )
    .fetch_all(pool)
    .await
}

pub async fn check_has_transactions(pool: &SqlitePool, account_id: &str) -> Result<bool, sqlx::Error> {
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM transactions WHERE account_id = ?"
    )
    .bind(account_id)
    .fetch_one(pool)
    .await?;
    Ok(count.0 > 0)
}
```

The `Account` struct must `#[derive(sqlx::FromRow, serde::Serialize, serde::Deserialize)]` for `query_as` and Tauri IPC serialization to work:

```rust
// src-tauri/src/db/models.rs
#[derive(Debug, sqlx::FromRow, serde::Serialize, serde::Deserialize)]
pub struct Account {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub account_type: String,    // "type" is a Rust keyword — rename in serde
    pub currency_id: String,
    pub balance: i64,
    pub credit_limit: Option<i64>,
    pub billing_day: Option<i32>,
    pub is_active: i32,          // SQLite stores booleans as INTEGER
    pub created_at: String,
}
```

> **Critical:** The column name `type` is a Rust keyword. Map it with `#[sqlx(rename = "type")]` or alias in SQL: `type AS account_type`.

### Pattern 3: Typed invoke Wrapper (Frontend)

```typescript
// Source: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/calling-rust.mdx
// src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/core';
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types';

export const accountApi = {
  list: (): Promise<Account[]> =>
    invoke('list_accounts'),

  create: (input: CreateAccountInput): Promise<Account> =>
    invoke('create_account', {
      name: input.name,
      accountType: input.accountType,
      currencyId: input.currencyId,
      creditLimit: input.creditLimit ?? null,
      billingDay: input.billingDay ?? null,
    }),

  update: (id: string, input: UpdateAccountInput): Promise<Account> =>
    invoke('update_account', { id, ...input }),

  archive: (id: string): Promise<void> =>
    invoke('archive_account', { id }),

  delete: (id: string): Promise<void> =>
    invoke('delete_account', { id }),
};
```

> **Tauri IPC naming:** Rust parameter `snake_case` is automatically converted to `camelCase` on the JS side. Verify by testing both; when in doubt, match exactly what Tauri sends.

### Pattern 4: Zustand Account Store

```typescript
// Source: https://context7.com/pmndrs/zustand/llms.txt
// src/stores/accountStore.ts
import { create } from 'zustand';
import { accountApi } from '../lib/tauri';
import type { Account } from '../types';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (input: CreateAccountInput) => Promise<Account>;
  updateAccount: (id: string, input: UpdateAccountInput) => Promise<Account>;
  archiveAccount: (id: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>()((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountApi.list();
      set({ accounts, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addAccount: async (input) => {
    const account = await accountApi.create(input);
    set((state) => ({ accounts: [...state.accounts, account] }));
    return account;
  },

  archiveAccount: async (id) => {
    await accountApi.archive(id);
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }));
  },
}));
```

### Pattern 5: react-hook-form with Zod + Conditional Required Fields

The credit_card conditional validation is the hardest part of the form logic. Use `.superRefine` to conditionally require fields:

```typescript
// Source: https://context7.com/react-hook-form/react-hook-form/llms.txt + https://context7.com/colinhacks/zod/llms.txt
// src/components/accounts/AccountForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  accountType: z.enum(['cash', 'bank', 'credit_card']),
  currencyId: z.string().min(1, 'La moneda es requerida'),
  creditLimit: z.number().positive('Debe ser mayor que 0').optional(),
  billingDay: z.number().int().min(1).max(31).optional(),
}).superRefine((data, ctx) => {
  if (data.accountType === 'credit_card') {
    if (!data.creditLimit) {
      ctx.addIssue({ code: 'custom', path: ['creditLimit'], message: 'Requerido para tarjeta de crédito' });
    }
    if (!data.billingDay) {
      ctx.addIssue({ code: 'custom', path: ['billingDay'], message: 'Requerido para tarjeta de crédito' });
    }
  }
});

type AccountFormData = z.infer<typeof accountSchema>;

const AccountForm = ({ onSubmit, defaultValues, isEdit }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    mode: 'onBlur',          // Validate on blur per user decision
    defaultValues,
  });

  const accountType = watch('accountType');
  const isCreditCard = accountType === 'credit_card';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... name, accountType (locked if isEdit), currencyId fields ... */}
      {isCreditCard && (
        <>
          <input type="number" {...register('creditLimit', { valueAsNumber: true })} />
          {errors.creditLimit && <span>{errors.creditLimit.message}</span>}
          <input type="number" {...register('billingDay', { valueAsNumber: true })} />
          {errors.billingDay && <span>{errors.billingDay.message}</span>}
        </>
      )}
      {/* Error summary at submit level */}
      {Object.keys(errors).length > 0 && (
        <div role="alert">
          {Object.values(errors).map((e, i) => <p key={i}>{e?.message}</p>)}
        </div>
      )}
      <button type="submit" disabled={isSubmitting}>Guardar</button>
    </form>
  );
};
```

### Pattern 6: Archive vs Delete Confirmation Modal

```typescript
// src/components/accounts/ConfirmDeleteModal.tsx
// Two states: 'archive' (primary) and 'delete' (secondary, blocked if has transactions)
// For 'delete': render a text input requiring the user to type the account name before enabling confirm button
const [typedName, setTypedName] = useState('');
const canDelete = typedName === account.name;
```

### Anti-Patterns to Avoid

- **`unwrap()` in Rust commands:** The codebase lints for this (`unwrap_used = "warn"`). Always use `?` or `.map_err(|e| e.to_string())`.
- **`f64` for monetary amounts:** `balance`, `credit_limit` are `i64` (integer minor units). Never use floats. The `rust_decimal` crate is available but not needed for read-only balance display.
- **Multiple `invoke_handler` calls:** Only one `invoke_handler` is allowed; the last one wins and overwrites previous registrations. All commands go in one `generate_handler![]`.
- **Controlled inputs for large forms:** Use RHF's `register()` pattern (uncontrolled) to avoid full re-renders on keystroke.
- **Hardcoded currency symbols in components:** Pull from the `currencies` table data (already seeded). The `Account` type should include currency info joined from DB, or currencies should be available in a separate store slice.
- **Showing archived accounts in list:** The `list_accounts` query must filter `WHERE is_active = 1`. Don't filter on the frontend.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation functions + state | `react-hook-form` + `zod` | Edge cases in blur/submit sequencing, error message deduplication, async validation timing |
| Conditional required fields | `if (type === 'credit_card') validate()` in onSubmit | Zod `.superRefine()` | Integrates with RHF field-level errors, works on blur not just submit |
| Client state management | `useState` + prop drilling | Zustand store | Store is the single source of truth after IPC calls; prop drilling breaks when modal and list need same data |
| UUID generation | Custom ID function | `uuid::Uuid::new_v4()` already in Cargo.toml | UUIDs are globally unique; custom IDs risk collisions |
| Submit-level error summary | Parse error object manually | `useFormState` hook from RHF | Subscribes only to errors, no extra re-renders |

**Key insight:** The IPC boundary (Tauri invoke) is the hardest part to test manually. Keeping validation in Zod (frontend) and duplicating critical rules in Rust (backend) ensures correctness regardless of which side is called.

---

## Common Pitfalls

### Pitfall 1: `type` is a Rust keyword

**What goes wrong:** `#[derive(sqlx::FromRow)]` on a struct with a field named `type` fails to compile.
**Why it happens:** `type` is a reserved keyword in Rust.
**How to avoid:** Either rename the struct field (`account_type`) with `#[serde(rename = "type")]` and `#[sqlx(rename = "type")]`, or alias in SQL: `SELECT type AS account_type FROM accounts`.
**Warning signs:** Compile error mentioning `unexpected token 'type'` in the model struct.

### Pitfall 2: Commands not registered in `invoke_handler`

**What goes wrong:** Frontend calls `invoke('create_account')` and gets `command not found` error.
**Why it happens:** The `commands/accounts.rs` module is created but the commands are not added to `generate_handler![]` in `lib.rs`.
**How to avoid:** After creating any new command function, immediately add it to the handler list. Also ensure `mod accounts;` is declared in `commands/mod.rs` and `pub mod commands;` is in `lib.rs`.
**Warning signs:** Tauri runtime error "unknown command" even though Rust compiled successfully.

### Pitfall 3: Permanent delete not guarded by transaction check

**What goes wrong:** User can permanently delete an account that has transactions, orphaning transaction rows (or violating FK if `ON DELETE RESTRICT`).
**Why it happens:** The accounts table doesn't have `ON DELETE CASCADE` for transactions — this is intentional. Transactions must be preserved.
**How to avoid:** In `delete_account` command: query `SELECT COUNT(*) FROM transactions WHERE account_id = ?` before deleting. Return error if count > 0. The UI should also call `get_account_transaction_count` before showing the delete button, to disable it proactively.
**Warning signs:** SQLite foreign key error "FOREIGN KEY constraint failed" when deleting.

### Pitfall 4: Balance displaying as raw integer

**What goes wrong:** Balance shows as `150000` instead of `$1.500` (CLP) or `$1,500.00` (USD).
**Why it happens:** Balance is stored as integer minor units. Display requires dividing by `10^decimal_places` and formatting with locale/currency rules.
**How to avoid:** Implement `formatCurrency(amount: number, currencyCode: string): string` in `src/lib/formatters.ts`. CLP has 0 decimal places (no division needed), USD/EUR/CNY have 2, JPY has 0.
**Warning signs:** Balances displaying without decimal formatting or as raw integers.

### Pitfall 5: Missing `pub mod accounts;` declarations

**What goes wrong:** Rust compiler error `module accounts not found` even though the file exists.
**Why it happens:** Rust modules must be explicitly declared in their parent `mod.rs`.
**How to avoid:** After creating `commands/accounts.rs`, add `pub mod accounts;` to `commands/mod.rs`. Same pattern for `db/queries/accounts.rs` in `db/queries/mod.rs` and `db/models.rs` in `db/mod.rs`.
**Warning signs:** `error[E0583]: file not found for module` at compile time.

### Pitfall 6: react-router not yet installed

**What goes wrong:** `import { useNavigate } from 'react-router'` fails at runtime.
**Why it happens:** `zustand`, `react-router`, `react-hook-form`, `zod`, `@hookform/resolvers` are listed in `docs/ARCHITECTURE.md` but are NOT in the current `package.json`. They are not installed.
**How to avoid:** First task of the phase: `npm install zustand react-router @hookform/resolvers zod react-hook-form`.
**Warning signs:** Module not found errors for any of those packages immediately when Phase 1 begins.

### Pitfall 7: `is_active` as `i32` vs `bool` in SQLite

**What goes wrong:** Trying to use `bool` in the `Account` struct for `is_active` fails with sqlx since SQLite stores booleans as INTEGER.
**Why it happens:** SQLite has no native boolean type; sqlx maps `bool` only if the column type hint matches.
**How to avoid:** Define `is_active: i32` in the Rust struct. Convert to `bool` when needed: `account.is_active != 0`.
**Warning signs:** `sqlx::Error::ColumnDecode` at runtime when fetching accounts.

---

## Code Examples

Verified patterns from official sources:

### Full Command Registration Flow (Rust)

```rust
// Source: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/calling-rust.mdx
// src-tauri/src/commands/mod.rs
pub mod accounts;

// src-tauri/src/lib.rs  (add to existing run() function)
.invoke_handler(tauri::generate_handler![
    commands::accounts::list_accounts,
    commands::accounts::create_account,
    commands::accounts::get_account,
    commands::accounts::update_account,
    commands::accounts::archive_account,
    commands::accounts::delete_account,
])
```

### Frontend Type Definitions

```typescript
// src/types/index.ts
export type AccountType = 'cash' | 'bank' | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currencyId: string;
  balance: number;       // integer minor units
  creditLimit: number | null;
  billingDay: number | null;
  isActive: number;      // 1 or 0 from SQLite
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  accountType: AccountType;
  currencyId: string;
  creditLimit?: number;
  billingDay?: number;
}

export interface UpdateAccountInput {
  name?: string;
  currencyId?: string;
  creditLimit?: number;
  billingDay?: number;
}
```

> **Tauri serialization note:** Rust `snake_case` field names become `camelCase` in the JSON Tauri sends to the frontend by default (via serde). Verify the actual serialized field names match what TypeScript expects, or add `#[serde(rename_all = "camelCase")]` to the Rust struct.

### Currency Formatter

```typescript
// src/lib/formatters.ts
const CURRENCY_CONFIG: Record<string, { symbol: string; decimals: number }> = {
  CLP: { symbol: '$', decimals: 0 },
  USD: { symbol: 'US$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  CNY: { symbol: '¥', decimals: 2 },
};

export const formatCurrency = (minorUnits: number, currencyCode: string): string => {
  const config = CURRENCY_CONFIG[currencyCode] ?? { symbol: '', decimals: 2 };
  const amount = minorUnits / Math.pow(10, config.decimals);
  return `${config.symbol}${amount.toLocaleString('es-CL', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tauri v1 `tauri::command` with `allowlist` in config | Tauri v2 uses capability-based permissions; `invoke` works the same | Tauri 2.0 stable (Sep 2024) | No impact for Phase 1 — we use `invoke()` which is unchanged |
| `react-router-dom` as separate package | `react-router` v7 is a unified package | React Router 7.0 (Nov 2024) | Install `react-router`, not `react-router-dom` |
| Zod v3 (stable) | Zod v4 released Feb 2025, breaking changes in some APIs | Zod 4.0 | Use Zod v3 (`"zod": "^3"`) for stability; v4 has breaking API changes and is still settling |

**Deprecated/outdated:**
- `react-router-dom`: Merged into `react-router` in v7; installing `react-router-dom` separately is unnecessary and may cause version conflicts.
- `sqlx::query!` macro: Requires `DATABASE_URL` at compile time. The project uses runtime `query_as` pattern instead — this is intentional and correct for the current setup.

---

## Open Questions

1. **Serde rename_all convention on Account struct**
   - What we know: Rust uses `snake_case`; TypeScript expects `camelCase`; Tauri serializes with serde
   - What's unclear: Whether `#[serde(rename_all = "camelCase")]` is already applied globally or needs to be added per struct
   - Recommendation: Add `#[serde(rename_all = "camelCase")]` to all models in `db/models.rs`. Then verify the `type` field rename works correctly alongside `rename_all`.

2. **Router setup location and navigation shell**
   - What we know: Phase 1 needs navigation between AccountsList and AccountForm views. The global layout (sidebar, header) is deferred to Phase 8 (UX Foundations).
   - What's unclear: Whether to build a minimal placeholder shell in Phase 1 or just render AccountsPage directly in App.tsx without routing.
   - Recommendation: Set up `react-router` `createBrowserRouter` in Phase 1 with at minimum two routes (`/accounts` and `/accounts/new`). Skip sidebar/header for now — just a content area. This avoids rewriting navigation logic in Phase 8.

3. **Base currency for "default currency" on new account form**
   - What we know: CONTEXT.md says "default new account currency to the configured base currency." Settings/base currency is Phase 6.
   - What's unclear: Where the base currency preference is stored before Phase 6 builds it.
   - Recommendation: Hardcode default to `'cur_clp'` (CLP) in Phase 1. The settings store in Phase 6 will expose this preference; update the default then.

---

## Sources

### Primary (HIGH confidence)
- `/tauri-apps/tauri-docs` (Context7) — command registration, State<SqlitePool> pattern, invoke_handler, frontend invoke
- `/pmndrs/zustand` (Context7) — async store actions, slices pattern, TypeScript typing
- `/react-hook-form/react-hook-form` (Context7) — useForm, zodResolver, mode: 'onBlur', error summary
- `/colinhacks/zod` (Context7) — object schema, superRefine, optional fields, z.infer
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/src-tauri/src/db/migrations/001_initial_schema.sql` — accounts table schema (confirmed complete)
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/src-tauri/Cargo.toml` — confirmed installed Rust deps
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/package.json` — confirmed missing frontend deps

### Secondary (MEDIUM confidence)
- `docs/ARCHITECTURE.md` — project-specific library choices; describes structure and frontend stack
- `docs/DESIGN_SYSTEM.md` — design tokens, component patterns (buttons, inputs, tables, cards, modals)

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via Context7 official docs; package.json and Cargo.toml inspected directly
- Architecture: HIGH — pattern derived from actual existing code + official Tauri/Zustand/RHF docs
- Pitfalls: HIGH — pitfalls 1, 2, 3, 5, 6 verified against actual project files; pitfalls 4 and 7 verified against schema and sqlx behavior

**Research date:** 2026-02-27
**Valid until:** 2026-03-29 (stable stack; 30 days)
