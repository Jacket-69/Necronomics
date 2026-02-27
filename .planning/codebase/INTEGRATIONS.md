# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**Payment Processing:**
- None implemented in current codebase.
  - Evidence: no Stripe/PayPal/etc dependencies in `package.json` or `src-tauri/Cargo.toml`

**Email/SMS:**
- None implemented in current codebase.
  - Evidence: no email/SMS SDK usage in `src/` or `src-tauri/src/`

**External APIs:**
- No outbound HTTP API integrations at runtime.
  - Evidence: no HTTP clients (`fetch`, `axios`, `reqwest`) referenced in `src/` or `src-tauri/src/`
- OS-level opener integration via Tauri plugin (opens links/files with system handlers).
  - Integration method: Tauri plugin capability + runtime registration
  - Auth: none
  - Evidence: `src-tauri/src/lib.rs` (`.plugin(tauri_plugin_opener::init())`), `src-tauri/capabilities/default.json` (`"opener:default"`), dependency declarations in `package.json` and `src-tauri/Cargo.toml`

## Data Storage

**Databases:**
- SQLite (local file, embedded app database)
  - Connection: generated from app data directory path (`sqlite:<app_data_dir>/necronomics.db?mode=rwc`)
  - Client: `sqlx` + `SqlitePool` (`src-tauri/src/db/mod.rs`)
  - Migrations: SQL files embedded and executed from `src-tauri/src/db/migrations/001_initial_schema.sql`, `002_seed_currencies.sql`, `003_seed_categories.sql`
  - Migration tracking table: `_migrations` created in `src-tauri/src/db/mod.rs`

**File Storage:**
- Local filesystem only
  - App database file in OS app data directory (`src-tauri/src/db/mod.rs`)
  - Static assets bundled from `public/assets/` and consumed by frontend CSS (`src/styles/globals.css`, `src/styles/fonts.css`)
  - No cloud object storage SDKs detected

**Caching:**
- None configured (no Redis/memcached/in-memory cache layer found)

## Authentication & Identity

**Auth Provider:**
- None implemented (no auth SDK, JWT/OAuth middleware, or identity service references)

**OAuth Integrations:**
- None configured

## Monitoring & Observability

**Error Tracking:**
- No external error tracker configured (no Sentry/Bugsnag/etc dependencies or DSN env usage)

**Analytics:**
- No analytics integration configured (no Mixpanel/GA/PostHog/etc dependencies)

**Logs:**
- Local stdout logging only (`println!` during migration application in `src-tauri/src/db/mod.rs`)
- No centralized logging service integration detected

## CI/CD & Deployment

**Hosting:**
- Desktop distribution via Tauri bundling, not hosted web infrastructure
  - Build pipeline entrypoints: `npm run tauri build` and `npm run tauri dev` in `package.json`
  - Bundle/app metadata: `src-tauri/tauri.conf.json`

**CI Pipeline:**
- No CI workflow config found in repository (`.github/workflows/` not present)
- No deployment secrets configuration tracked in repo files

## Environment Configuration

**Development:**
- Required env vars: none mandatory for current runtime features
- Optional vars:
  - `TAURI_DEV_HOST` used by `vite.config.ts` for dev-server host/HMR wiring
- Local runtime flags are set in code (not user-supplied secrets):
  - `GDK_BACKEND`
  - `WEBKIT_DISABLE_DMABUF_RENDERER`
  - `WEBKIT_DISABLE_COMPOSITING_MODE`
  - Evidence: `src-tauri/src/main.rs`
- Secret files are intentionally excluded from git (`.gitignore` includes `.env` and `.env.*`)

**Staging:**
- Not defined (no separate staging config files or environment overlays found)

**Production:**
- No external secret manager integration defined in-repo
- Deployment is desktop packaging; persistent data remains local SQLite in user app-data path

## Webhooks & Callbacks

**Incoming:**
- None (no webhook endpoints or signature verification logic present)

**Outgoing:**
- None (no webhook dispatch clients or retry logic present)

---

*Integration audit: 2026-02-27*
*Update when adding/removing external services*
