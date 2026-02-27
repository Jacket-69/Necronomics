# Architecture Research

**Domain:** Offline-first Linux desktop personal finance (Tauri v2 + React + Rust + SQLite)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (React + Vite)                     │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ Dashboard   │  │ Transactions│  │ Debts       │  │ Settings         │ │
│  │ Page        │  │ Page        │  │ Page        │  │ Page             │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬────────┘ │
│         │                │                │                   │          │
│  ┌──────▼────────────────▼────────────────▼───────────────────▼────────┐ │
│  │ UI Components + Zustand Stores + Form Validation (zod/rhf)          │ │
│  └──────────────────────────────┬───────────────────────────────────────┘ │
├─────────────────────────────────┴──────────────────────────────────────────┤
│                  App Boundary (Tauri IPC Commands in Rust)                │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ accounts    │  │ transactions│  │ debts       │  │ exchange/export  │ │
│  │ commands    │  │ commands    │  │ commands    │  │ commands         │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬────────┘ │
│         │                │                │                   │          │
│  ┌──────▼────────────────▼────────────────▼───────────────────▼────────┐ │
│  │ Domain Services (balance rules, installments, conversion, recurring)│ │
│  └──────────────────────────────┬───────────────────────────────────────┘ │
├─────────────────────────────────┴──────────────────────────────────────────┤
│                 Persistence Layer (sqlx + SQLite + migrations)            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐                   │
│  │ query mods  │  │ migration   │  │ necronomics.db   │                   │
│  │ per entity  │  │ runner      │  │ (local app data) │                   │
│  └─────────────┘  └─────────────┘  └──────────────────┘                   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| React feature pages | Render workflows and collect user input | Route-based pages with local composition (`Dashboard`, `Transactions`, `Debts`, `Settings`) |
| UI and state layer | Keep UX consistent and drive request lifecycle | Shared UI primitives + Zustand stores + `react-hook-form` + `zod` |
| Tauri command layer | Stable API boundary between UI and domain | `#[tauri::command]` handlers grouped by bounded context |
| Domain service layer | Enforce finance invariants and multi-step rules | Rust services for balance updates, debt installment lifecycle, recurring processing |
| Query/repository layer | Encapsulate SQL and table-level access | `sqlx` query modules by entity (`accounts`, `transactions`, `debts`, etc.) |
| Migration and bootstrap layer | Initialize DB safely and deterministically | Sequential SQL migrations + `_migrations` tracker at startup |
| Local SQLite datastore | Source of truth for all finance records | One per-user DB file in app data directory, WAL + foreign keys |

## Recommended Project Structure

```
src/
├── pages/                    # Route-level screens and composition
│   ├── DashboardPage.tsx     # Analytics and summary widgets
│   ├── TransactionsPage.tsx  # Register, filter, and inspect transactions
│   ├── DebtsPage.tsx         # Installment debt tracking
│   └── SettingsPage.tsx      # Accounts, categories, exchange rates, import/export
├── components/               # Reusable UI and feature widgets
│   ├── ui/                   # Primitive themed controls (button, modal, table, inputs)
│   ├── layout/               # Shell/sidebar/header
│   ├── transactions/         # Transaction-specific widgets
│   ├── debts/                # Debt-specific widgets
│   └── dashboard/            # D3 chart wrappers and metric cards
├── stores/                   # Zustand stores per bounded context
├── lib/                      # Tauri invoke client, formatters, constants, utilities
├── types/                    # Shared frontend contracts
└── styles/                   # Global theme tokens and visual identity

src-tauri/src/
├── commands/                 # IPC command modules per context
├── services/                 # Domain rules and orchestrations
├── db/
│   ├── queries/              # SQL access by aggregate/entity
│   ├── migrations/           # Versioned schema and seed SQL
│   └── mod.rs                # Pool setup, pragmas, migration runner
├── lib.rs                    # Tauri builder + state wiring + startup jobs
└── main.rs                   # OS/runtime entrypoint and env workarounds
```

### Structure Rationale

- **`src-tauri/src/commands/` + `services/` + `db/queries/`:** Clear application boundary keeps UI thin and preserves domain invariants in Rust.
- **`src/stores/` split by feature context:** Prevents global state sprawl and keeps fetch/filter/pagination behavior isolated per module.
- **Route-centric pages with feature component folders:** Supports staged delivery from core CRUD to dashboard and debt workflows without constant refactors.

## Architectural Patterns

### Pattern 1: Command-Service-Repository Split

**What:** Each IPC command validates input and delegates business rules to a service, which composes repository/query calls.
**When to use:** All write operations and complex reads.
**Trade-offs:** More files/indirection, but much safer finance logic and testability.

**Example:**
```typescript
// Frontend invoke wrapper stays thin.
export async function createTransaction(input: CreateTransactionInput) {
  return invoke("create_transaction", { input });
}
```

### Pattern 2: Transactional Finance Invariants

**What:** Multi-step money operations execute atomically (e.g., transaction write + account balance update).
**When to use:** Any workflow that changes balances, debt installment counters, or recurring materialization.
**Trade-offs:** Slightly more backend complexity, but prevents silent data drift.

**Example:**
```typescript
// Conceptual invariant, implemented in Rust/sqlx transaction:
// 1) insert transaction
// 2) update account.balance (+income / -expense)
// 3) commit or rollback all
```

### Pattern 3: Read-Model Aggregation for Dashboard (CQRS-lite)

**What:** Keep write model normalized; build dedicated aggregation queries for dashboard and charts.
**When to use:** Summary cards, monthly comparisons, category breakdowns, balance history.
**Trade-offs:** More query maintenance, but faster UI and cleaner responsibilities.

## Data Flow

### Request Flow

```
[User Action]
    ↓
[React Form/Table] → [Store Action] → [Tauri Command] → [Domain Service] → [SQL Query]
    ↓                    ↓                ↓                 ↓                ↓
[UI Update]        [Optimistic/UI state] [Validation]   [Rules + Tx]   [SQLite Commit]
```

### State Management

```
[SQLite (source of truth)]
    ↓ (command/query responses)
[Zustand Store per module]
    ↓ (subscribe/select)
[Components]
    ↑
[User events: filter/sort/paginate/create/edit/delete]
```

### Key Data Flows

1. **Transaction lifecycle:** Create/update/delete transaction triggers deterministic account balance recalculation (apply/revert/apply pattern).
2. **Debt installment payment:** `pay_installment` updates debt progress and emits linked expense transaction in same business flow.
3. **Recurring execution on startup:** App boot checks due recurring rules (`next_date <= today`), creates transactions, advances schedule.
4. **Consolidated dashboard:** Raw amounts stay in native account currency; conversion service maps to main currency for portfolio views.

## Recommended Build Order (Greenfield -> Brownfield)

1. **Stabilize brownfield baseline (already present):** Keep startup, migration runner, and DB seeds as immutable base contracts.
2. **Establish backend vertical slice first:** Implement `accounts` + `categories` + `transactions` commands/services/queries with money-safe invariants and integration tests.
3. **Ship functional CRUD UI on top of stable IPC:** Build Settings and Transactions pages with filtering/pagination and robust form validation.
4. **Add debt module as dependent bounded context:** Implement debts only after transaction invariants are reliable, because installment payment creates transactions.
5. **Introduce dashboard read models next:** Add aggregation commands and D3 views once sufficient historical data exists from prior modules.
6. **Layer productivity features:** Add autocomplete + tags after base transaction UX is stable.
7. **Implement cross-currency and automation:** Add exchange-rate management and recurring generation after core CRUD and debt lifecycles are proven.
8. **Finalize with portability and hardening:** Export/import, global shortcuts, error boundaries, and full test pass.

**Dependency rule:** Never build visualization or automation before transaction correctness is locked; every later module depends on trustworthy ledger behavior.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single-process desktop monolith is ideal; optimize correctness and UX, not distribution complexity. |
| 1k-100k users | Still local-first by user-device; optimize query indices, pagination, and chart aggregation efficiency. |
| 100k+ users | If future cloud sync is added, keep current offline core and introduce sync adapter/event log boundary instead of rewriting domain services. |

### Scaling Priorities

1. **First bottleneck:** Expensive filtered transaction queries and dashboard aggregations; fix with targeted indexes/materialized summary queries.
2. **Second bottleneck:** Frontend render load for large tables/charts; fix with virtualized tables, memoized selectors, and chart data downsampling.

## Anti-Patterns

### Anti-Pattern 1: Floating-Point Money Math

**What people do:** Store/compute amounts with `f64`/`number` directly.
**Why it's wrong:** Rounding drift corrupts balances and debt projections.
**Do this instead:** Persist integer minor units in DB and use decimal-safe conversion/formatting boundaries.

### Anti-Pattern 2: Business Rules in React Components

**What people do:** Encode balance/debt side effects in frontend handlers.
**Why it's wrong:** Duplicated logic, hard-to-test invariants, inconsistent results across screens.
**Do this instead:** Centralize finance rules in Rust services and expose only intention-level commands to UI.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Local filesystem (backup/import) | Tauri file dialog + JSON serialization | Must support safe merge/replace semantics with schema version metadata. |
| Optional FX API (future) | Adapter service writing into `exchange_rates` | Keep optional; app remains usable offline when unavailable. |
| OS-level keyboard shortcuts | Tauri/global shortcut integration | Must avoid conflicts and remain toggleable/testable. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React pages ↔ Zustand stores | Direct function calls/selectors | UI orchestration only; no persistence logic here. |
| Zustand stores ↔ Tauri commands | Typed invoke wrappers | Keep command contracts stable and versioned via shared types. |
| Commands ↔ Services | Rust function calls | Command layer handles validation/mapping; service layer enforces invariants. |
| Services ↔ Query modules | Repository/query API + SQL transactions | Domain operations that affect balances/debts should be atomic. |
| Migration runner ↔ SQLite schema | Ordered SQL files + `_migrations` table | Forward-only migrations for safe upgrades in user data directories. |

## Sources

- `.planning/PROJECT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/ROADMAP.md`
- `.planning/codebase/ARCHITECTURE.md`

---
*Architecture research for: Necronomics desktop finance domain*
*Researched: 2026-02-27*
