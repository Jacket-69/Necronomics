# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- TypeScript 5.8.3 - Frontend application code in `src/` (see `package.json`, `tsconfig.json`, `src/App.tsx`, `src/main.tsx`)
- Rust edition 2021 - Desktop backend/runtime and database bootstrap in `src-tauri/src/` (see `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`)
- SQL (SQLite dialect) - Schema and seed migrations in `src-tauri/src/db/migrations/*.sql`

**Secondary:**
- CSS (Tailwind v4 + custom styles) - Styling in `src/styles/globals.css` and `src/styles/fonts.css`
- JSON - App/tooling config in `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`, `tsconfig.json`, `package.json`

## Runtime

**Environment:**
- Tauri v2 desktop runtime - Native shell + WebView app runtime (`src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`)
- Node.js 20+ for frontend toolchain/dev server (documented in `README.md`; used by `vite`/`@tauri-apps/cli` scripts in `package.json`)
- Rust stable toolchain for backend build/run (`README.md`, `src-tauri/Cargo.toml`)

**Package Manager:**
- npm (lockfile-based workflow)
- Lockfile: `package-lock.json` present (`lockfileVersion: 3`)

## Frameworks

**Core:**
- Tauri v2 (`tauri` crate + `@tauri-apps/cli`) - Desktop app framework and bundling (`src-tauri/Cargo.toml`, `package.json`)
- React 19.0.0 - Frontend UI (`package.json`, `src/main.tsx`, `src/App.tsx`)
- sqlx 0.8 + SQLite - Async DB access and migration execution (`src-tauri/Cargo.toml`, `src-tauri/src/db/mod.rs`)

**Testing:**
- No automated test framework currently configured (no test scripts/deps in `package.json`, no test modules in `src/` or `src-tauri/src/`)

**Build/Dev:**
- Vite 6.3.5 + `@vitejs/plugin-react` 4.5.2 - Frontend dev/build pipeline (`vite.config.ts`, `package.json`)
- TypeScript 5.8.3 - Type checking/compilation (`package.json`, `tsconfig.json`)
- TailwindCSS 4.1.8 via `@tailwindcss/vite` - CSS pipeline (`package.json`, `vite.config.ts`, `src/styles/globals.css`)
- ESLint 9.28.0 + typescript-eslint 8.33.1 + Prettier 3.5.3 - Lint/format tooling (`eslint.config.js`, `.prettierrc`, `package.json`)

## Key Dependencies

**Critical:**
- `tauri` (Rust, v2) - Application shell/runtime bootstrap (`src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`)
- `react`/`react-dom` 19.0.0 - UI runtime (`package.json`, `src/main.tsx`)
- `sqlx` 0.8 (`runtime-tokio`, `sqlite`) - SQLite pooling/queries/migrations (`src-tauri/Cargo.toml`, `src-tauri/src/db/mod.rs`)
- `tokio` 1 (`full`) - Async runtime for backend DB/init tasks (`src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`)
- `tailwindcss` 4.1.8 + `@tailwindcss/vite` 4.1.8 - Styling pipeline (`package.json`, `vite.config.ts`, `src/styles/globals.css`)

**Infrastructure:**
- `@tauri-apps/api` 2.10.1 - Frontend bridge package for Tauri APIs (`package.json`)
- `tauri-plugin-opener` / `@tauri-apps/plugin-opener` - OS opener integration (`src-tauri/Cargo.toml`, `package.json`, `src-tauri/src/lib.rs`, `src-tauri/capabilities/default.json`)
- `serde`/`serde_json` - Serialization support in backend layer (`src-tauri/Cargo.toml`)
- `chrono`, `uuid`, `rust_decimal` - Domain/data utilities declared for finance backend (`src-tauri/Cargo.toml`)

## Configuration

**Environment:**
- Optional dev host override via `TAURI_DEV_HOST` in `vite.config.ts`
- Runtime backend flags are set programmatically in `src-tauri/src/main.rs` (`GDK_BACKEND`, `WEBKIT_DISABLE_DMABUF_RENDERER`, `WEBKIT_DISABLE_COMPOSITING_MODE`)
- `.env` files are ignored by git (`.gitignore`), but no required runtime env vars are currently referenced in code

**Build:**
- `vite.config.ts` - Vite server/build behavior for Tauri
- `tsconfig.json` and `tsconfig.node.json` - TS compiler settings
- `eslint.config.js` and `.prettierrc` - Linting/formatting rules
- `src-tauri/tauri.conf.json` - Tauri app metadata/build/bundle settings
- `src-tauri/Cargo.toml` - Rust dependencies and lint settings

## Platform Requirements

**Development:**
- Linux desktop environment currently targeted/documented (webkit/GTK prerequisites listed in `README.md`)
- Requires both Node.js (frontend toolchain) and Rust (Tauri backend), per `README.md` and project scripts in `package.json`

**Production:**
- Desktop binary bundles produced by Tauri (`npm run tauri build` via `package.json`; bundle targets configured in `src-tauri/tauri.conf.json`)
- App persists data locally in SQLite under the OS app data directory (implemented in `src-tauri/src/db/mod.rs`)

---

*Stack analysis: 2026-02-27*
*Update after major dependency changes*
