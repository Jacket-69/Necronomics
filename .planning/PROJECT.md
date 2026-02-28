# Necronomics

## What This Is

Necronomics is a Linux desktop personal-finance application built with Tauri v2 (Rust) and React, designed for real daily use with a distinct Lovecraftian + retro-2000s visual identity. It centralizes account, transaction, debt, and dashboard workflows in a single offline-first app. The initial codebase already provides the technical foundation; the next work delivers full financial functionality and polished UX.

## Core Value

Give the user precise, trustworthy control over personal money flows and debt commitments in one fast, private, offline desktop app.

## Requirements

### Validated

- ✓ Tauri + React desktop runtime starts successfully on Linux with required WebKit compatibility flags — existing
- ✓ Local SQLite persistence is initialized at startup with migration tracking and seed data (currencies/categories) — existing
- ✓ Base repository/tooling foundation is in place (Rust/TypeScript toolchains, lint/format, Tailwind pipeline, project structure) — existing
- ✓ Initial visual/theming assets pipeline exists (custom fonts, global styles, design documentation) — existing
- ✓ Account CRUD lifecycle (cash, bank, credit_card) with create/edit/delete/archive — Phase 1
- ✓ Category and subcategory management with Lucide icons, tabbed layout, and context menu — Phase 2
- ✓ Category business rules: single-level nesting, type cascade, transaction-link deletion guard — Phase 2

### Active

- [ ] User can manage transactions with complete CRUD and reliable automatic balance updates.
- [ ] User can search, filter, sort, and paginate transactions to inspect spending/income patterns quickly.
- [ ] User can track installment debts tied to credit cards, including remaining cuotas, available credit, and payment projections.
- [ ] User can use a dashboard with custom D3 visualizations that explain financial behavior over time.
- [ ] User can work with multiple currencies (CLP, USD, EUR, JPY, CNY), including exchange-rate management and consolidated views.
- [ ] User can speed up capture flows via transaction autocomplete, tags, and recurring transaction support.
- [ ] User can export/import Necronomics data safely for backup and portability.
- [ ] User can operate a cohesive themed UX (Lovecraft + retro web) across all modules with responsive desktop behavior.

### Out of Scope

- Cloud sync and external SaaS dependency — the product is intentionally offline-first and local-only.
- Multi-user collaboration and shared ledgers — current target is single-user personal use.
- Mobile-native app distribution — current scope is Linux desktop first.
- Automatic bank account aggregation/scraping — not required for the current roadmap and privacy-first baseline.

## Context

This project is driven by personal use: the user needs concrete, detailed financial tracking with high trust in calculations, especially for debt/card control and historical analysis. Existing documentation under `docs/` provides a complete product direction (vision, prioritized features, architecture, database design, and milestone roadmap). The codebase map confirms a brownfield foundation: runtime/bootstrap and persistence are real, while domain features still need implementation. The experience direction is as important as functionality: charts should be custom and thematic, not generic widgets.

## Constraints

- **Platform**: Linux desktop (Tauri v2) — the app is intended to feel native and run reliably in this environment.
- **Data Model**: SQLite local database only — guarantees offline use and data privacy.
- **Privacy**: No mandatory cloud/network dependency — user financial data stays on-device.
- **Financial Precision**: Monetary operations must avoid floating-point drift — use decimal-safe representations and deterministic calculations.
- **Design Direction**: Preserve Lovecraftian + retro-2000s identity — visual consistency is a hard product requirement.
- **Scope Control**: Prioritize P0/P1 roadmap items before broadening to speculative features — maintain delivery focus.

## Key Decisions

| Decision                                                                                                            | Rationale                                                                               | Outcome             |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| Build as Tauri desktop app (Rust backend + React frontend)                                                          | Need native-like performance, local filesystem/DB control, and lightweight distribution | — Pending           |
| Keep architecture offline-first and local-only                                                                      | Financial privacy and availability without internet are core product principles         | — Pending           |
| Use SQLite + migrations as persistence backbone                                                                     | Simple, portable, robust local data layer for personal finance workflows                | — Pending           |
| Treat docs (`PROJECT_VISION`, `FEATURES`, `ARCHITECTURE`, `ROADMAP`) as source of truth for planning initialization | Documentation already defines scope and sequencing in detail                            | — Pending           |
| Continue from existing foundation as brownfield                                                                     | Fase 0 artifacts already exist and should be leveraged, not re-planned from scratch     | — Pending           |
| sqlx runtime queries (not compile-time macros)                                                                      | Flexibility for runtime SQL without build-time database dependency                      | Working — Phase 1   |
| Dual rename pattern for Rust keyword fields (`#[sqlx(rename)]` + `#[serde(rename)]`)                                | Rust `type` keyword collision with DB column names                                      | Working — Phase 1   |
| react-hook-form + zodResolver for form validation                                                                   | Consistent, typed form handling across all CRUD modals                                  | Working — Phase 1,2 |
| Zustand store per domain (accounts, categories)                                                                     | Simple state management following same pattern across modules                           | Working — Phase 1,2 |
| Static Lucide icon map (~35 icons) for dynamic rendering                                                            | Reliable icon rendering from string names without dynamic imports                       | Working — Phase 2   |
| Business rules in Tauri command layer, queries as simple data access                                                | Clean separation: queries are reusable, commands enforce domain logic                   | Working — Phase 2   |

---

_Last updated: 2026-02-28 after Phase 2_
