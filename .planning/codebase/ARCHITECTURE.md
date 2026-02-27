# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Desktop shell (Tauri v2) with a thin React frontend and Rust-owned persistence bootstrap.

**Key Characteristics:**
- Single desktop process model: WebView UI + Rust host process.
- Backend-first persistence initialization in app setup.
- SQLite schema/migrations embedded at compile time via `include_str!`.
- Current frontend is static and does not yet invoke IPC commands.

## Layers

**Desktop Bootstrap Layer:**
- Purpose: Start the native app and initialize runtime environment.
- Contains: App startup, environment flags, Tauri builder setup.
- Location: `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`.
- Depends on: Tauri runtime, database layer.
- Used by: OS process launch (`tauri dev` / bundled binary).

**Persistence Infrastructure Layer:**
- Purpose: Create SQLite pool and apply migrations/seeds.
- Contains: Connection pool setup, PRAGMA tuning, migration tracker logic.
- Location: `src-tauri/src/db/mod.rs`, `src-tauri/src/db/migrations/*.sql`.
- Depends on: `sqlx`, filesystem access to app data directory.
- Used by: Bootstrap setup in `src-tauri/src/lib.rs`.

**Domain/API Surface Layer (Scaffolded):**
- Purpose: Intended location for IPC commands, business services, and query modules.
- Contains: Module stubs only (no concrete handlers/services yet).
- Location: `src-tauri/src/commands/mod.rs`, `src-tauri/src/services/mod.rs`, `src-tauri/src/db/queries/mod.rs`.
- Depends on: Persistence layer.
- Used by: Future frontend invoke calls.

**Presentation Layer:**
- Purpose: Render desktop UI in WebView.
- Contains: React root mounting, one static `App` component, global styles/fonts.
- Location: `src/main.tsx`, `src/App.tsx`, `src/styles/globals.css`, `src/styles/fonts.css`.
- Depends on: React runtime and static assets under `public/assets/fonts`.
- Used by: Vite dev server / built frontend loaded by Tauri.

## Data Flow

**Desktop Startup + DB Initialization:**

1. User runs `npm run tauri dev` (or launches bundled app).
2. Tauri executes frontend build/dev hooks from `src-tauri/tauri.conf.json`.
3. Rust entrypoint `src-tauri/src/main.rs` sets Linux WebKit environment overrides.
4. `necronomics_lib::run()` in `src-tauri/src/lib.rs` builds the Tauri app.
5. `setup` runs `init_database`, resolves app data dir, calls `db::create_pool`.
6. `db::run_migrations` applies SQL files from `src-tauri/src/db/migrations/` and records them in `_migrations`.
7. `SqlitePool` is attached to managed app state via `app.manage(pool)`.
8. Frontend mounts from `src/main.tsx` and renders the static `App` UI.

**State Management:**
- Persistent state: SQLite file `necronomics.db` in Tauri app data directory (outside repo).
- In-process backend state: shared `SqlitePool` managed by Tauri.
- Frontend state: no global store yet; render-time static component tree.

## Key Abstractions

**Tauri Managed State (`SqlitePool`):**
- Purpose: Central database access object shared across command handlers.
- Examples: `app.manage(pool)` in `src-tauri/src/lib.rs`.
- Pattern: Dependency injection via Tauri state container.

**Embedded Migration Set:**
- Purpose: Version and apply schema/seeds without external migration binaries.
- Examples: `include_str!("migrations/001_initial_schema.sql")`, `002_seed_currencies.sql`, `003_seed_categories.sql` in `src-tauri/src/db/mod.rs`.
- Pattern: Ordered migration runner with `_migrations` bookkeeping table.

**Frontend Single-Root App Component:**
- Purpose: Current placeholder UI shell.
- Examples: `src/App.tsx` rendered by `src/main.tsx`.
- Pattern: Minimal React function component.

## Entry Points

**Native Entry Point:**
- Location: `src-tauri/src/main.rs`
- Triggers: OS process startup via Tauri runner.
- Responsibilities: Set runtime env flags, call library `run()`.

**Tauri Runtime Entry Point:**
- Location: `src-tauri/src/lib.rs`
- Triggers: Called by native main.
- Responsibilities: Build app, initialize DB, install plugins.

**Frontend Entry Point:**
- Location: `src/main.tsx`
- Triggers: WebView page load.
- Responsibilities: Mount React tree and apply global styles.

## Error Handling

**Strategy:** Fail-fast during startup; propagate lower-level DB errors with `Result` and escalate with `expect` in setup.

**Patterns:**
- `?` propagation in `create_pool` / migration execution (`src-tauri/src/db/mod.rs`).
- Hard failure on unresolved app data dir and DB init failure (`expect` in `src-tauri/src/lib.rs`).
- No explicit frontend error boundary yet.

## Cross-Cutting Concerns

**Platform Compatibility:**
- Linux-specific WebKit/X11 workarounds in `src-tauri/src/main.rs` (`GDK_BACKEND`, `WEBKIT_DISABLE_*`).

**Schema Integrity:**
- Foreign key enforcement and WAL mode enabled in `src-tauri/src/db/mod.rs`.

**Build Orchestration:**
- Frontend and desktop build coupling defined in `src-tauri/tauri.conf.json` (`beforeDevCommand`, `beforeBuildCommand`, `frontendDist`).

**Visual Theming:**
- Global font-face/theme styles in `src/styles/globals.css` and `src/styles/fonts.css` backed by `public/assets/fonts/*`.

---

*Architecture analysis: 2026-02-27*
*Update when major patterns change*
