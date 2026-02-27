# Stack Research

**Domain:** Offline-first Linux desktop personal finance app (single-user, local SQLite)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tauri | 2.10.x | Desktop runtime, IPC bridge, packaging | Best fit for lightweight Linux desktop delivery with Rust safety and local-first architecture. |
| Rust | edition 2021 (stable toolchain) | Backend commands, business logic, persistence layer | Strong typing and performance for financial rules, debt projections, and deterministic calculations. |
| SQLx + SQLite | sqlx 0.8.x + SQLite local DB | Data access and migrations | Compile-time checked SQL, low operational overhead, and ideal portability for offline personal finance. |
| React | 19.0.0 | Desktop UI composition | Mature component model with strong ecosystem support for forms, state, and complex dashboard screens. |
| TypeScript | 5.8.3 | Frontend type safety | Reduces UI/domain mismatch bugs across transaction/debt workflows and IPC payloads. |
| Tailwind CSS | 4.1.8 | Design system implementation | Fast tokenized styling while keeping full control over Lovecraft + retro visual identity. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | 7.x | Route structure for dashboard/transactions/debts/settings | Use immediately for phase-level module navigation and deep linking. |
| zustand | 5.x | Lightweight client state management | Use for filter state, pagination, dashboard period selection, and modal/form coordination. |
| react-hook-form | 7.x | Transaction/debt/account forms | Use for fast forms with controlled validation and low render churn. |
| zod | 3.x | Frontend schema validation | Use for runtime-safe form parsing and IPC input guards before invoke calls. |
| d3 | 7.9.x | Custom finance visualizations | Use for donut, bars, line, and treemap charts required by product vision. |
| rust_decimal | 1.x | Exact monetary arithmetic | Use for all money fields and calculations (never float). |
| chrono | 0.4.x | Date/time handling | Use for installment schedules, date filters, and monthly aggregations. |
| uuid | 1.x | Stable identifiers | Use for entity IDs when records are created client-side or backend-side. |
| thiserror | 2.x | Typed backend error modeling | Use when command surface expands to keep errors explicit and testable. |
| tracing + tracing-subscriber | 0.1.x + 0.3.x | Structured logging/diagnostics | Use for command-level observability and debugging financial calculation issues. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9 + typescript-eslint 8 + Prettier 3 | TS/React quality gates | Keep current config; add stricter rules for money/date conversion boundaries. |
| Vitest 2.x + Testing Library 16.x | Frontend unit/component tests | Add for stores, formatters, filters, and form behavior before shipping P0/P1 features. |
| cargo test + sqlx migrations tests | Backend correctness tests | Add domain tests for balance updates, debt installments, and exchange conversions. |
| lefthook or husky + lint-staged | Pre-commit automation | Run lint/test subsets on commit to prevent regression drift. |

## Installation

```bash
# Frontend core
npm install react-router-dom@7 zustand@5 react-hook-form@7 zod@3 d3@7

# Frontend testing
npm install -D vitest@2 @testing-library/react@16 @testing-library/user-event@14 jsdom@25

# Backend supporting crates
cargo add thiserror@2 tracing@0.1 tracing-subscriber@0.3
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| SQLx + handwritten SQL | Prisma | Use Prisma only if team velocity on schema churn outweighs runtime size/startup costs and you accept less SQL-level control. |
| Zustand | Redux Toolkit | Use Redux Toolkit if multi-user sync/event workflows are introduced and state orchestration becomes significantly more complex. |
| D3 | ECharts | Use ECharts if rapid dashboard shipping matters more than fully custom thematic visuals. |
| Tauri | Electron | Use Electron only if you must reuse Node-only desktop modules not available in Rust/Tauri ecosystem. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `f32`/`f64` for money | Rounding drift breaks trust in balances, cuotas, and conversions | `rust_decimal::Decimal` and explicit quantization rules |
| Generic chart wrappers as primary layer | Limits visual identity and custom interaction required by vision | Native D3 composition with reusable chart primitives |
| Heavy UI kits as base design system | Fights product identity and increases override complexity | Custom UI components on Tailwind tokens |
| Mixing DB ownership between Rust and frontend adapters | Creates integrity and migration drift risk | Single DB authority in Rust command/service layer |

## Stack Patterns by Variant

**If strict offline-only remains the product rule:**
- Keep exchange rates manual-entry first.
- Use deterministic local jobs only (no background network fetchers).

**If optional online exchange-rate sync is later approved:**
- Add a Rust service adapter with explicit user opt-in and local cache TTL.
- Keep app usable with stale rates; never hard-fail core flows due to network.

**If data volume grows (100k+ transactions):**
- Add indexed query plans, FTS for descriptions, and list virtualization in UI.
- Keep aggregation work in SQL/Rust instead of client-side JS loops.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `tauri@2.x` (Rust crate) | `@tauri-apps/api@2.x`, `@tauri-apps/cli@2.x` | Keep Tauri major versions aligned across Rust and npm packages. |
| `react@19.0.0` | `react-dom@19.0.0`, `@types/react@19.x`, `@types/react-dom@19.x` | Pin matching major/minor to avoid type/runtime mismatch. |
| `vite@6.3.5` | `@vitejs/plugin-react@4.5.2`, `typescript@5.8.3` | Current project pins are compatible; update together during upgrades. |
| `sqlx@0.8.x` | `tokio@1.x`, `sqlite` backend | Preserve sqlx migration discipline and query parameterization. |

## Implementation Plan (Stack Adoption Order)

1. Stabilize backend domain base:
- Add `thiserror` and `tracing` first.
- Define shared Rust domain types for money/date/error envelopes.

2. Stabilize frontend domain base:
- Add `react-router-dom`, `zustand`, `react-hook-form`, `zod`.
- Establish typed IPC client wrappers and shared DTO schemas.

3. Deliver P0 financial integrity:
- Build accounts/categories/transactions with SQLx transaction boundaries.
- Enforce decimal-safe math and invariant tests for balance recalculation.

4. Deliver P0 debt engine:
- Implement installment lifecycle and auto-transaction generation in Rust service layer.
- Add command-level tests for edge cases (partial pay, final installment closure).

5. Deliver analytics layer:
- Introduce D3 chart primitives after summary/aggregation commands are stable.
- Keep chart transforms thin; aggregation stays server-side.

6. Add verification gates before each milestone close:
- Frontend: Vitest + Testing Library for critical forms and filters.
- Backend: `cargo test` for financial invariants and migration safety.

## Sources

- `.planning/PROJECT.md` - Scope, constraints, and active requirements
- `docs/PROJECT_VISION.md` - Product goals, UX direction, and offline/privacy principles
- `docs/FEATURES.md` - P0/P1/P2 functional requirements by module
- `docs/ARCHITECTURE.md` - Intended crates/packages and architecture boundaries
- `docs/ROADMAP.md` - Delivery sequencing and implementation priorities
- `.planning/codebase/STACK.md` - Current pinned versions and runtime/tooling baseline
- `package.json` - Actual frontend dependency versions in repository
- `src-tauri/Cargo.toml` - Actual backend crate versions in repository

---
*Stack research for: Offline-first personal finance desktop app*
*Researched: 2026-02-27*
