# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- React component files use `PascalCase` (`src/App.tsx`), while entry/config files are lowercase (`src/main.tsx`, `vite.config.ts`).
- CSS files use lowercase names under `src/styles/` (`src/styles/globals.css`, `src/styles/fonts.css`).
- Rust module and function files follow `snake_case` and `mod.rs` module roots (`src-tauri/src/db/mod.rs`, `src-tauri/src/services/mod.rs`, `src-tauri/src/commands/mod.rs`).
- SQL migration files use numeric prefixes plus `snake_case` (`src-tauri/src/db/migrations/001_initial_schema.sql`).

**Functions:**
- TypeScript currently uses functional components as arrow functions (`const App = () => { ... }` in `src/App.tsx`).
- Rust functions use `snake_case`, including async setup and DB helpers (`init_database`, `create_pool`, `run_migrations` in `src-tauri/src/lib.rs` and `src-tauri/src/db/mod.rs`).
- No async prefix naming convention is used; async status is conveyed by `async fn`.

**Variables:**
- TypeScript variables and JSX style keys are `camelCase` (`minHeight`, `backgroundColor` in `src/App.tsx`).
- Rust locals are `snake_case` (`app_data_dir`, `db_path`, `db_url` in `src-tauri/src/db/mod.rs`).
- Environment variable keys are uppercase string literals (`"GDK_BACKEND"`, `"WEBKIT_DISABLE_DMABUF_RENDERER"` in `src-tauri/src/main.rs`).

**Types:**
- TypeScript custom types/interfaces are not yet present in `src/` implementation files.
- Rust type names and imported types use `PascalCase` (`SqlitePool`, `SqlitePoolOptions` in `src-tauri/src/db/mod.rs`).
- Rust crate guidance in `CLAUDE.md` expects `PascalCase` for structs/enums/traits and no `unwrap()` in production paths.

## Code Style

**Formatting:**
- Prettier is configured in `.prettierrc` with `semi: true`, `trailingComma: "es5"`, `singleQuote: false`, `printWidth: 100`, `tabWidth: 2`.
- TypeScript/TSX matches that style (double quotes, semicolons, trailing commas) in `src/main.tsx` and `vite.config.ts`.
- CSS currently uses 4-space indentation in `src/styles/globals.css` and `src/styles/fonts.css` (manual style differs from Prettier `tabWidth: 2`).
- Rust formatting is governed by `src-tauri/rustfmt.toml` (`max_width = 100`, `tab_spaces = 4`).

**Linting:**
- ESLint is configured in `eslint.config.js` with `@eslint/js`, `typescript-eslint`, and `eslint-config-prettier`.
- `@typescript-eslint/no-explicit-any` is enforced as `error`; `no-unused-vars` allows underscore-prefixed args.
- Lint command is `npm run lint` from `package.json`, scoped to `src/`.
- Rust static lint posture is set in `src-tauri/Cargo.toml` under `[lints.clippy]` (`all`, `pedantic`, `unwrap_used = "warn"`, `expect_used = "warn"`).

## Import Organization

**Order:**
1. External packages first (`react`, `react-dom`, `@vitejs/plugin-react`, `@tailwindcss/vite` in `src/main.tsx` and `vite.config.ts`).
2. Relative internal imports second (`./App`, `./styles/globals.css` in `src/main.tsx`).
3. Rust uses module declarations at crate root (`mod commands; mod db; mod services;` in `src-tauri/src/lib.rs`).
4. Type-only imports are not used yet in current `src/` files.

**Grouping:**
- TypeScript import groups are generally compact with minimal blank-line separation in this early codebase.
- No enforced alphabetical sorting rule is visible in config.

**Path Aliases:**
- No path aliases are configured in `tsconfig.json`; imports are relative.
- Build tooling uses standard Vite/TS module resolution (`moduleResolution: "bundler"` in `tsconfig.json`).

## Error Handling

**Patterns:**
- Rust backend favors `Result<T, E>` and `?` propagation in data/setup flows (`create_pool` and `run_migrations` in `src-tauri/src/db/mod.rs`).
- Startup boundaries use fail-fast `expect(...)` with explicit messages (`src-tauri/src/lib.rs` and `src-tauri/src/main.rs`).
- Non-critical setup steps may intentionally ignore errors (`fs::create_dir_all(app_data_dir).ok()` in `src-tauri/src/db/mod.rs`).

**Error Types:**
- Data-layer functions return concrete DB errors (`Result<SqlitePool, sqlx::Error>` in `src-tauri/src/db/mod.rs`).
- Higher-level initialization uses erased trait objects (`Result<(), Box<dyn std::error::Error>>` in `src-tauri/src/lib.rs`).
- Frontend currently has no explicit try/catch conventions because business logic is not yet implemented in `src/`.

## Logging

**Framework:**
- No dedicated logging framework is configured in current dependencies (`package.json`, `src-tauri/Cargo.toml`).
- Rust currently uses `println!` for migration application visibility (`src-tauri/src/db/mod.rs`).

**Patterns:**
- Operational comments and fail-fast messages carry context (e.g., environment workaround comments in `src-tauri/src/main.rs`).
- Console logging is not used in current TypeScript source (`src/App.tsx`, `src/main.tsx`).

## Comments

**When to Comment:**
- Rust code comments explain platform/runtime rationale rather than syntax (`src-tauri/src/main.rs` and `src-tauri/src/lib.rs`).
- SQL files include header comments to describe migration intent (`src-tauri/src/db/migrations/001_initial_schema.sql`).

**JSDoc/TSDoc:**
- Rust uses `///` doc comments for public functions (`src-tauri/src/lib.rs`, `src-tauri/src/db/mod.rs`).
- TypeScript files currently do not use TSDoc due minimal component surface (`src/App.tsx`).

**TODO Comments:**
- A single HTML TODO is present in `README.md` for adding screenshot/gif.
- No structured TODO format (owner/issue ID) is enforced yet.

## Function Design

**Size:**
- Functions are currently short and focused (`main` in `src-tauri/src/main.rs`, `App` in `src/App.tsx`).
- DB setup keeps helper responsibilities separated (`create_pool` vs `run_migrations` in `src-tauri/src/db/mod.rs`).

**Parameters:**
- Rust functions accept typed inputs rather than generic maps (`app: &tauri::AppHandle`, `pool: &SqlitePool`).
- TypeScript currently has no parameter-heavy exported functions in `src/`.

**Return Values:**
- Rust setup functions return explicit `Ok(())` on success and early-fail via `?`.
- React root component returns JSX directly and exports default component.

## Module Design

**Exports:**
- Frontend app shell uses default export (`export default App;` in `src/App.tsx`).
- Rust module boundaries are explicit via `mod` declarations and `pub` functions (`pub fn run()` in `src-tauri/src/lib.rs`).

**Barrel Files:**
- Rust uses `mod.rs` as module entry points in `src-tauri/src/commands/mod.rs`, `src-tauri/src/services/mod.rs`, and `src-tauri/src/db/queries/mod.rs`.
- Frontend does not currently use `index.ts` barrel exports in `src/`.

---

*Convention analysis: 2026-02-27*
*Update when patterns change*
