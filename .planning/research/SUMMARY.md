# Project Research Summary

**Project:** Necronomics
**Domain:** Offline-first Linux desktop personal finance application
**Researched:** 2026-02-27
**Confidence:** HIGH

## Executive Summary

Necronomics is a local-first desktop ledger focused on trustworthy money tracking, debt/installment control, and thematic analytics. Research across stack, features, architecture, and pitfalls converges on one core principle: financial correctness must be implemented and verified before visualization, automation, or UX acceleration.

The recommended implementation pattern is a Tauri (Rust) + React + SQLite monolith with strict command-service-repository boundaries. Monetary rules and cross-entity side effects (balance updates, installment payments, recurring generation, currency conversion) should stay in Rust service transactions; frontend remains orchestration and presentation.

The main delivery risk is silent data integrity drift (non-atomic writes, precision inconsistency, stale/missing FX assumptions, recurring duplication). Mitigation is phase ordering plus guardrails: transactional invariants first, explicit numeric policy, missing-rate handling, idempotent recurring keys, and hard quality gates before archive.

## Key Findings

### Recommended Stack

Use the current Tauri v2 + Rust + SQLx/SQLite + React/TypeScript base as the permanent architecture. It already matches product constraints (Linux desktop, offline-only, privacy-first) and minimizes operational burden while preserving high control over financial logic.

Keep the frontend modular with `react-router-dom`, `zustand`, `react-hook-form`, and `zod`; keep backend correctness with `rust_decimal`, typed errors, and command/service tests. Use D3 only after stable read models exist.

**Core technologies:**
- Tauri + Rust: desktop runtime and trusted finance domain layer - strongest fit for local-first deterministic behavior.
- SQLx + SQLite: persistence and migrations - low overhead with explicit SQL control and portability.
- React + TypeScript: UI composition and typed contracts - fast iteration with safer command payload boundaries.

### Expected Features

Launch scope is clear: users must reliably manage accounts/categories/transactions/debts and read meaningful dashboard summaries, including multi-currency consolidated views with explicit rate handling. Differentiators (themed D3, autocomplete, recurring automation) are valuable but depend on ledger correctness.

**Must have (table stakes):**
- Account/category/transaction CRUD with deterministic automatic balance updates.
- Debt/installment lifecycle tied to credit-card behavior.
- Transaction filtering/search/pagination and practical dashboard summaries.
- Multi-currency display plus manual FX for consolidated totals.

**Should have (competitive):**
- Thematic D3 dashboard interactions.
- Autocomplete, tags, and recurring transaction automation.
- Utilization/projection views for debt risk awareness.

**Defer (v2+):**
- Budget/goals engine and advanced analytics (heatmaps/sankey).
- Optional cloud/sync or external bank integrations.

### Architecture Approach

Use a layered monolith: React pages/components/stores -> typed invoke wrappers -> Tauri commands -> Rust domain services -> SQLx query modules -> SQLite migrations. Keep writes transactional, keep read models purpose-built for dashboard performance, and keep DB ownership exclusively in Rust.

**Major components:**
1. Presentation layer (React pages + stores) - input capture, state orchestration, rendering.
2. Application/domain layer (Tauri commands + Rust services) - validation, invariants, multi-step financial rules.
3. Persistence layer (SQLx queries + migrations + SQLite) - authoritative storage, atomic writes, and upgrade safety.

### Critical Pitfalls

1. **Balance drift from non-atomic writes** - enforce single-transaction mutations and reconciliation tests.
2. **Precision loss in money/rate math** - use one numeric policy (minor units/decimal strategy) and centralize conversions in backend.
3. **Missing/stale FX rates in consolidated totals** - require explicit rate-date handling and block or mark partial totals.
4. **Recurring duplication on startup** - enforce idempotent occurrence keys and unique constraints.
5. **Migration/schema drift** - make migrations authoritative, verifiable, and tested against fresh bootstrap.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Ledger Integrity
**Rationale:** Every downstream feature depends on trusted balances and deterministic writes.
**Delivers:** Accounts/categories/transactions CRUD, transactional balance recalculation, baseline UI shell/forms.
**Addresses:** Core table-stakes finance flows.
**Avoids:** Balance drift, early precision inconsistencies, migration drift.

### Phase 2: Debt and Credit Workflows
**Rationale:** Debt/installment logic is core value and depends on stable transaction invariants.
**Delivers:** Debt lifecycle, installment payments, linked expense generation, card-utilization basics.
**Uses:** Rust domain services + SQLx transactions.
**Implements:** Command-service-repository debt vertical slice.

### Phase 3: Dashboard Read Models and Analytics
**Rationale:** Visualization should follow proven write-model correctness.
**Delivers:** Aggregation commands, summary widgets, initial D3 charts, query/index performance baseline.

### Phase 4: Capture Productivity Layer
**Rationale:** Speed features are safer once base flows and data volume exist.
**Delivers:** Tags, autocomplete, search hardening (including FTS path if needed), keyboard workflow improvements.

### Phase 5: Multi-Currency and Recurring Automation
**Rationale:** Both are high-value/high-risk due to precision, idempotency, and temporal rules.
**Delivers:** Exchange-rate management, consolidated portfolio logic, recurring rule engine with safe catch-up.

### Phase 6: Portability and Quality Hardening
**Rationale:** Import/export and release confidence require mature integrity checks.
**Delivers:** Export/import with validation and rollback safety, reconciliation tooling, perf/UX/accessibility regression suite.

### Phase Ordering Rationale

- Ledger correctness precedes debt, analytics, and automation because all depend on trustworthy balances.
- Architecture boundaries (command -> service -> repository) align naturally with vertical phase delivery.
- Highest-impact risks are mitigated early (atomicity, precision), while complex integrations are delayed until core behavior is stable.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** D3 rendering strategy vs React updates and aggregation/query budgets under realistic volume.
- **Phase 5:** Fixed policy for FX precision/rounding and recurring idempotency under missed-startup scenarios.
- **Phase 6:** Import/export versioning, merge semantics, and recovery guarantees for corrupted payloads.

Phases with standard patterns (skip research-phase):
- **Phase 1:** CRUD + transactional invariants on Tauri/Rust/SQLite are established patterns.
- **Phase 2:** Installment lifecycle as service-layer orchestration is straightforward once Phase 1 is stable.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct fit to constraints; already partially implemented in codebase. |
| Features | MEDIUM | Priorities are clear, but exact UX scope for v1.x may shift during delivery. |
| Architecture | HIGH | Layered monolith and boundaries are coherent with project shape and dependencies. |
| Pitfalls | HIGH | Risks are concrete, recurrent in finance apps, and map cleanly to mitigation phases. |

**Overall confidence:** HIGH

### Gaps to Address

- FX policy details (rate source precedence, rounding mode by currency/date): finalize before Phase 5 implementation.
- Performance thresholds (acceptable latency for filters/dashboard): define explicit budgets before Phase 3 completion.
- Import conflict policy (merge vs replace edge behavior): lock specification before Phase 6 execution.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` - stack selection, compatibility, and adoption order.
- `.planning/research/FEATURES.md` - feature tiers, dependency graph, and launch scope.
- `.planning/research/ARCHITECTURE.md` - layered architecture and build order.
- `.planning/research/PITFALLS.md` - failure modes and prevention mapping.
- `.planning/PROJECT.md` - project constraints and active requirements.

### Secondary (MEDIUM confidence)
- `docs/FEATURES.md` - detailed product feature descriptions.
- `docs/ARCHITECTURE.md` - target internal boundaries and module intent.
- `docs/ROADMAP.md` - milestone/phase ordering context.
- `docs/DATABASE.md` - schema expectations and data semantics.

### Tertiary (LOW confidence)
- None.

---
*Research completed: 2026-02-27*
*Ready for roadmap: yes*
