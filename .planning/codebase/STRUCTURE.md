# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```text
Necronomics/
├── .planning/                 # Generated planning/mapping artifacts
├── docs/                      # Product and technical documentation (+ diagrams)
│   └── diagrams/              # SVG architecture/data-model diagrams
├── public/                    # Static assets served by Vite/Tauri WebView
│   └── assets/fonts/          # Bundled local font files
├── src/                       # React frontend source (currently minimal)
│   └── styles/                # Global CSS and font declarations
├── src-tauri/                 # Rust/Tauri desktop backend
│   ├── src/                   # Rust runtime code
│   │   ├── commands/          # IPC command module boundary (stub)
│   │   ├── db/                # DB pool + migrations + query namespace
│   │   └── services/          # Business-service module boundary (stub)
│   ├── capabilities/          # Tauri capability definitions
│   └── icons/                 # App icons for packaging targets
├── index.html                 # Web entry HTML for Vite
├── package.json               # Node scripts and frontend dependencies
├── vite.config.ts             # Vite config (Tauri-aware dev setup)
└── tsconfig.json              # TypeScript project config
```

## Directory Purposes

**`src/`:**
- Purpose: WebView UI source for the desktop app.
- Contains: `App.tsx`, `main.tsx`, `vite-env.d.ts`, and `styles/*.css`.
- Key files: `src/main.tsx` (React mount), `src/App.tsx` (current UI), `src/styles/globals.css`.
- Subdirectories: Only `src/styles/` currently exists; planned feature folders are not present yet.

**`src-tauri/src/`:**
- Purpose: Native backend runtime and persistence bootstrap.
- Contains: Startup code, DB layer, module stubs for commands/services.
- Key files: `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `src-tauri/src/db/mod.rs`.
- Subdirectories: `commands/`, `services/`, `db/queries/`, `db/migrations/`.

**`src-tauri/src/db/migrations/`:**
- Purpose: Versioned SQL schema and seed data.
- Contains: `001_initial_schema.sql`, `002_seed_currencies.sql`, `003_seed_categories.sql`.
- Key files: `001_initial_schema.sql` defines core tables and indexes.
- Subdirectories: None.

**`docs/`:**
- Purpose: Human-readable project planning and design documentation.
- Contains: `ARCHITECTURE.md`, `DATABASE.md`, `DESIGN_SYSTEM.md`, `FEATURES.md`, `PROJECT_VISION.md`, `ROADMAP.md`.
- Key files: `docs/ROADMAP.md` reflects planned phases beyond current code.
- Subdirectories: `docs/diagrams/` with architecture/data-flow/entity diagrams.

**`public/assets/fonts/`:**
- Purpose: Locally shipped fonts used by global CSS.
- Contains: Cinzel Decorative, Share Tech Mono, JetBrains Mono `.woff2` files.
- Key files: Files referenced from `src/styles/globals.css` and `src/styles/fonts.css`.
- Subdirectories: `cinzel-decorative/`, `share-tech-mono/`, `jetbrains-mono/`.

## Key File Locations

**Entry Points:**
- `src-tauri/src/main.rs`: Native process entry and Linux WebKit env setup.
- `src-tauri/src/lib.rs`: Tauri builder, plugin registration, DB init.
- `src/main.tsx`: Frontend entrypoint mounting React root.

**Configuration:**
- `package.json`: Node scripts (`dev`, `build`, `tauri`, `lint`) and JS dependencies.
- `src-tauri/tauri.conf.json`: Tauri app metadata, window settings, dev/build hooks.
- `src-tauri/Cargo.toml`: Rust dependencies and clippy lint policy.
- `vite.config.ts`: Vite server settings aligned with Tauri ports.
- `tsconfig.json` and `tsconfig.node.json`: TypeScript compile/check settings.
- `eslint.config.js`: TypeScript ESLint rules, ignoring `src-tauri/`.

**Core Logic:**
- `src-tauri/src/db/mod.rs`: SQLite pool creation + migration runner.
- `src-tauri/src/db/migrations/*.sql`: Database schema and initial seed data.
- `src/App.tsx`: Current UI render logic (placeholder landing view).

**Testing:**
- No `tests/` directory or test files are present in the current repository snapshot.

**Documentation:**
- `README.md`: Setup, stack summary, and high-level structure.
- `docs/*.md`: Detailed product/architecture/database references.

## Naming Conventions

**Files:**
- Rust modules use `mod.rs` within each module directory (`commands/mod.rs`, `services/mod.rs`).
- SQL migrations use numeric prefixes: `NNN_description.sql` in `src-tauri/src/db/migrations/`.
- React component file uses PascalCase (`src/App.tsx`); config/style files use lowercase/kebab style (`vite.config.ts`, `globals.css`).

**Directories:**
- Lowercase directory names with hyphenated compounds where needed (`src-tauri`, `share-tech-mono`).
- Asset collections grouped under semantic buckets (`public/assets/fonts/...`).

**Special Patterns:**
- Top-level docs are uppercase snake-like names (`PROJECT_VISION.md`, `DESIGN_SYSTEM.md`).
- Tauri-specific code is isolated under `src-tauri/` and excluded from frontend linting.

## Where to Add New Code

**New Tauri Command (IPC):**
- Primary code: `src-tauri/src/commands/`.
- Database access/query helpers: `src-tauri/src/db/queries/`.
- Business logic orchestration: `src-tauri/src/services/`.
- Registration wiring: `src-tauri/src/lib.rs`.

**New Frontend Feature:**
- Implementation: add feature modules under `src/` (for example `src/components/`, `src/pages/`, `src/stores/`) as the project grows.
- Shared styling: `src/styles/`.
- Static assets: `public/assets/`.

**New Schema Change:**
- Migration SQL: `src-tauri/src/db/migrations/` with next numeric prefix.
- Migration execution is automatic through existing runner in `src-tauri/src/db/mod.rs`.

**New Documentation:**
- User/developer docs: `docs/`.
- Architecture diagrams: `docs/diagrams/`.

## Special Directories

**`.planning/`:**
- Purpose: Generated planning/context artifacts (including codebase map docs).
- Source: Maintained by GSD workflow agents.
- Committed: Intended to be committed in this project workflow.

**`src-tauri/icons/`:**
- Purpose: Packaging icons for desktop targets.
- Source: Scaffolded/generated by Tauri tooling.
- Committed: Yes.

**Build Outputs (not in repo tree):**
- Purpose: Generated artifacts.
- Source: Vite and Cargo builds (`dist/`, `target/`).
- Committed: No, excluded via `.gitignore`.

---

*Structure analysis: 2026-02-27*
*Update when directory structure changes*
