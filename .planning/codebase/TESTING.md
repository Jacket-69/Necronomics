# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Runner:**
- No JavaScript/TypeScript test runner is currently configured in `package.json` (no `test` script and no Jest/Vitest dependency).
- No Rust test modules or `#[test]` functions are present under `src-tauri/src/`.
- No dedicated test config files exist (for example, no `vitest.config.*`, `jest.config.*`, or Playwright config in repository root).

**Assertion Library:**
- No assertion library is currently in use because there are no in-repo automated tests.
- Existing quality checks rely on compile/lint tooling rather than test assertions.

**Run Commands:**
```bash
npm run lint                                         # Frontend static checks (`eslint src/`)
npm run build                                        # TypeScript compile + Vite build validation
cargo clippy --manifest-path src-tauri/Cargo.toml   # Rust linting (configured in Cargo lints)
cargo test --manifest-path src-tauri/Cargo.toml     # Command available, but currently no tests to execute
```

## Test File Organization

**Location:**
- No files matching `*.test.*` or `*.spec.*` were found in `src/` or `src-tauri/src/`.
- There is no `tests/` or `__tests__/` directory in current repository layout.

**Naming:**
- No established naming convention yet for unit, integration, or e2e tests because test files are absent.
- Planning docs indicate future Rust unit/integration tests in `docs/ROADMAP.md` (Fase 6), but these are not implemented yet.

**Structure:**
```
src/
  App.tsx
  main.tsx
  styles/
    globals.css
    fonts.css

src-tauri/src/
  main.rs
  lib.rs
  db/
    mod.rs
    queries/mod.rs
    migrations/*.sql
  commands/mod.rs
  services/mod.rs
```

## Test Structure

**Suite Organization:**
```typescript
// Current state: no describe()/it() test suites exist in repository source files.
// No example test suite is available yet to infer preferred structure.
```

**Patterns:**
- No shared setup/teardown hooks (`beforeEach`, `afterEach`, Rust fixtures) are implemented yet.
- No documented arrange/act/assert convention is enforceable from current code.
- Verification today is mostly manual plus lint/build checks (see `docs/ROADMAP.md` verification items).

## Mocking

**Framework:**
- No mocking framework is configured in JavaScript (`vi`, `jest.mock`) or Rust (`mockall`, custom doubles).
- No dependency-injection based mock seams are present in current modules.

**Patterns:**
```typescript
// Not applicable in current codebase: there are no active test files and no mock usage patterns to mirror.
```

**What to Mock:**
- Not yet established.
- Candidate future targets (once tests are added): Tauri command boundaries and DB access in `src-tauri/src/db/mod.rs`.

**What NOT to Mock:**
- Not yet established.
- Candidate future baseline: keep pure formatting/mapping logic unmocked once utility modules are introduced in `src/`.

## Fixtures and Factories

**Test Data:**
```typescript
// No fixture or factory utilities exist yet.
// No shared test-data module is present under `src/` or `src-tauri/`.
```

**Location:**
- No `tests/fixtures/`, `tests/factories/`, or equivalent directories exist.
- Seed SQL files in `src-tauri/src/db/migrations/002_seed_currencies.sql` and `003_seed_categories.sql`
  are runtime bootstrap data, not test fixtures.

## Coverage

**Requirements:**
- No line/branch coverage target is defined in current CI/tooling files.
- No gating rule blocks merges/builds on coverage percentage.

**Configuration:**
- No coverage tool configuration is present (no nyc/c8/Vitest/Jest coverage setup).
- No Rust coverage setup (`grcov`, `tarpaulin`) is configured in repository scripts.

**View Coverage:**
```bash
# No coverage command is currently available in package.json or Cargo scripts.
```

## Test Types

**Unit Tests:**
- None implemented yet in `src/` or `src-tauri/src/`.
- Planned in `docs/ROADMAP.md` for Rust financial logic (balance, conversion, installment logic).

**Integration Tests:**
- None implemented yet.
- Planned roadmap item references Rust command integration against in-memory DB (`docs/ROADMAP.md`).

**E2E Tests:**
- No E2E framework dependency is currently installed.
- No desktop UI automation harness is present for Tauri flows.

## Common Patterns

**Async Testing:**
```typescript
// No async test examples exist in current codebase.
```

**Error Testing:**
```typescript
// No error assertion patterns are established yet because test suites are not implemented.
```

**Snapshot Testing:**
- Not used.
- No snapshot directories (for example, `__snapshots__/`) exist.

---

*Testing analysis: 2026-02-27*
*Update when test patterns change*
