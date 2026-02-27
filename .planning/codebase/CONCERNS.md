# Codebase Concerns

**Analysis Date:** 2026-02-27

## Tech Debt

**Documentation and implementation drift:**
- Issue: Product docs describe a much larger system than what is currently implemented.
- Files: `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, `src-tauri/src/commands/mod.rs`, `src-tauri/src/services/mod.rs`, `src-tauri/src/db/queries/mod.rs`, `src/App.tsx`.
- Why: Phase-0 scaffolding was documented aggressively before feature delivery.
- Impact: Planning and onboarding decisions can be based on nonexistent modules/endpoints, increasing rework risk.
- Fix approach: Add an "implemented today" status section per doc and link each roadmap item to shipped files.

**Custom migration engine instead of transactional migration framework:**
- Issue: Migrations are manually tracked and executed by splitting SQL text on semicolons.
- Files: `src-tauri/src/db/mod.rs`, `src-tauri/src/db/migrations/*.sql`.
- Why: Fast bootstrapping with minimal dependencies.
- Impact: Fragile execution semantics, difficult rollback, and manual bookkeeping for every new migration.
- Fix approach: Use `sqlx::migrate!` (or equivalent) with transactional execution and migration checksum validation.

**Duplicated font declarations and styling strategy drift:**
- Issue: Font-face declarations exist in two files, while `App` still uses inline styles instead of design tokens.
- Files: `src/styles/globals.css`, `src/styles/fonts.css`, `src/App.tsx`, `docs/DESIGN_SYSTEM.md`.
- Why: Early prototyping before component system and tokenization.
- Impact: Style updates are error-prone and theme consistency will degrade as UI grows.
- Fix approach: Keep font declarations in one stylesheet and move app styles to tokenized CSS/Tailwind utilities.

## Known Bugs

**Startup can hard-crash on environment or DB init errors:**
- Symptoms: App exits immediately instead of showing a recoverable error state.
- Trigger: Failure resolving app data dir or any migration/setup error.
- Files: `src-tauri/src/lib.rs`.
- Workaround: None in-app; user must inspect logs and retry.
- Root cause: Multiple `.expect(...)` calls in startup path.
- Blocked by: Missing global error/reporting layer in app bootstrap.

**Non-atomic migration application can leave DB in partial state:**
- Symptoms: After a failed migration, reruns can fail with "already exists" style SQL errors.
- Trigger: Any SQL error while iterating statements in a migration file.
- Files: `src-tauri/src/db/mod.rs`.
- Workaround: Manual DB cleanup.
- Root cause: Statements execute individually without transaction wrapping; migration is only marked after all statements complete.

**Wayland and non-X11 environments are forced onto X11 path:**
- Symptoms: Launch failures or degraded rendering on systems without working X11/XWayland setup.
- Trigger: App startup on constrained or non-Linux environments.
- Files: `src-tauri/src/main.rs`.
- Workaround: User-level env overrides before launch.
- Root cause: Unconditional `GDK_BACKEND=x11` and WebKit renderer overrides.

## Security Considerations

**Content Security Policy disabled:**
- Risk: If renderer content is ever compromised, relaxed CSP increases exploit surface.
- Files: `src-tauri/tauri.conf.json`.
- Current mitigation: Desktop-local app context only.
- Recommendations: Replace `"csp": null` with explicit restrictive CSP aligned to local assets and required Tauri schemes.

**Broad opener capability without explicit narrowing:**
- Risk: Opening untrusted URLs/files via default opener permissions can increase phishing or local-exec risk from renderer context.
- Files: `src-tauri/capabilities/default.json`, `src-tauri/Cargo.toml`.
- Current mitigation: No custom command surface yet.
- Recommendations: Restrict opener scope and add URL allowlist validation before any opener call is exposed.

**Financial data stored in plaintext SQLite by default:**
- Risk: Local compromise or backup leakage exposes full personal finance history.
- Files: `src-tauri/src/db/mod.rs`.
- Current mitigation: None visible in code (no encryption-at-rest layer).
- Recommendations: Add SQLCipher or file-level encryption option and document threat model/tradeoffs.

## Performance Bottlenecks

**Migration execution performs one roundtrip per SQL statement on startup:**
- Problem: Startup cost grows linearly with statement count across all pending migrations.
- Measurement: Current schema already executes dozens of individual statements in `001` + seeds.
- Cause: `split(';')` + per-statement `sqlx::query(...).execute(...)` loop.
- Improvement path: Execute each migration in a single transaction and batch statements where possible.

**Description search index will not help common substring filters:**
- Problem: Planned free-text search can degrade to full table scans as transactions grow.
- Measurement: Only `idx_transactions_description` exists; no FTS table or trigram strategy.
- Files: `src-tauri/src/db/migrations/001_initial_schema.sql`, `docs/ROADMAP.md`.
- Cause: Standard B-tree index is weak for `%term%` search patterns.
- Improvement path: Add SQLite FTS5 virtual table for `transactions.description` and route search there.

**Connection pool cap may bottleneck bursty command workloads:**
- Problem: Concurrent command handling can queue behind `max_connections(5)`.
- Measurement: Pool is hard-coded to 5 connections.
- Files: `src-tauri/src/db/mod.rs`.
- Cause: Conservative default with no workload-based tuning.
- Improvement path: Make pool sizing configurable and benchmark realistic command bursts.

## Fragile Areas

**Manual migration registry is easy to forget when adding files:**
- Why fragile: New SQL files must be added in code manually.
- Common failures: Migration file exists on disk but is never executed.
- Files: `src-tauri/src/db/mod.rs`, `src-tauri/src/db/migrations/`.
- Safe modification: Add migration integration test that asserts disk migrations match registered list.
- Test coverage: No automated tests present.

**Schema and docs are already diverging on table set:**
- Why fragile: Docs reference `recurring_transactions`, but schema migration does not create it.
- Common failures: Future features built from docs may fail at runtime on missing table.
- Files: `docs/DATABASE.md`, `src-tauri/src/db/migrations/001_initial_schema.sql`.
- Safe modification: Make docs generated from migration source-of-truth or add schema verification script.
- Test coverage: No schema parity check exists.

**Current app surface is a placeholder UI with no backend command wiring:**
- Why fragile: Future merge work will combine large frontend/backend additions at once instead of incrementally.
- Common failures: Integration regressions when first real commands/routes are introduced.
- Files: `src/App.tsx`, `src-tauri/src/commands/mod.rs`, `src-tauri/src/lib.rs`.
- Safe modification: Introduce one vertical slice (single command + single page) before broad module expansion.
- Test coverage: No E2E or integration tests.

## Scaling Limits

**Single local SQLite file architecture:**
- Current capacity: Suitable for single-user desktop usage and moderate transaction volume.
- Limit: Heavy analytics/search and large historical datasets will increase query latency and vacuum/maintenance costs.
- Symptoms at limit: Slower dashboard queries, longer startup migration checks, UI stutter during heavy reads.
- Scaling path: Add summary tables/materialized aggregates, FTS for search, and archival strategy by date range.

**No background job layer for future recurring tasks/import/export:**
- Current capacity: All future work implied to execute in command path.
- Limit: Long-running imports/recomputations will block user interactions.
- Symptoms at limit: UI freezes/timeouts for expensive operations.
- Scaling path: Add job queue/background worker model with progress events.

## Dependencies at Risk

**Rust dependency graph is not lockfile-pinned in repo:**
- Risk: Builds can drift over time and differ across machines.
- Files: `src-tauri/Cargo.toml` (no committed `Cargo.lock` observed).
- Impact: Non-reproducible behavior and harder incident rollback.
- Migration plan: Commit `Cargo.lock` for app reproducibility and enforce it in CI.

**Exact frontend pinning without update workflow:**
- Risk: Security/bugfix patches can lag when all packages are hard-pinned.
- Files: `package.json`, `package-lock.json`.
- Impact: Known issues may persist longer than necessary.
- Migration plan: Add scheduled dependency update cadence with smoke tests.

## Missing Critical Features

**No command/API surface implemented yet:**
- Problem: Core finance workflows cannot run.
- Files: `src-tauri/src/commands/mod.rs`, `src-tauri/src/lib.rs`.
- Current workaround: None; only DB initialization runs.
- Blocks: Accounts/categories/transactions/debts/dashboard roadmap items.
- Implementation complexity: High (requires backend commands, typed payloads, frontend stores/pages).

**No routing/state/forms stack integrated despite roadmap expectations:**
- Problem: UI is a static landing component only.
- Files: `src/App.tsx`, `src/main.tsx`, `docs/ROADMAP.md`.
- Current workaround: None.
- Blocks: Multi-page flows, CRUD forms, filters, and dashboard visualizations.
- Implementation complexity: Medium to high.

## Test Coverage Gaps

**Zero automated test suite detected:**
- What's not tested: Backend migration behavior, DB invariants, frontend rendering, and integration paths.
- Files: entire repo (no `*.test.*`/`*.spec.*` files found).
- Risk: Regressions likely once command/UI code begins landing.
- Priority: High.
- Difficulty to test: Low to medium (start with migration tests + one Tauri command integration test).

**No CI workflow to enforce quality gates:**
- What's not tested: Lint/build/check on pull requests.
- Files: no `.github/workflows/*` present.
- Risk: Broken builds can merge unnoticed.
- Priority: High.
- Difficulty to test: Low.

*Concerns audit: 2026-02-27*
*Update as issues are fixed or new ones discovered*
