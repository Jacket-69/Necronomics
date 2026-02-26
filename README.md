# Necronomics

> *"That is not dead which can eternal lie, and with strange aeons even debt may die."*

A personal finance desktop app for Linux with a Lovecraftian horror aesthetic and retro 2000s web design. Built with Tauri v2 (Rust) and React.

<!-- TODO: Add screenshot/gif here once UI is ready -->
<!-- ![Necronomics Screenshot](docs/screenshots/dashboard.png) -->

## Features

- **Transaction tracking** — Log income and expenses with hierarchical categories, tags, and detailed descriptions
- **Debt management** — Track credit card installments, remaining balance, available credit, and payment projections
- **Interactive dashboards** — Custom D3.js charts themed with eldritch aesthetics (donut, bar, line, treemap)
- **Multi-currency** — Support for CLP, USD, EUR, JPY, and CNY with manual exchange rates
- **Smart autocomplete** — Suggestions based on transaction history frequency
- **Export/Import** — Backup and restore your data in the app's own JSON format
- **Fully offline** — All data stays local in SQLite. No cloud, no tracking, no elder gods watching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | [Tauri v2](https://v2.tauri.app/) (Rust) |
| Frontend | React 19 + TypeScript |
| Database | SQLite (via sqlx) |
| Charts | D3.js |
| Styling | TailwindCSS v4 + custom CSS |
| State management | Zustand |
| Build tool | Vite |

## Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v20+)
- [Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/)

On Arch-based distros (CachyOS, EndeavourOS, Manjaro, etc.):

```bash
sudo pacman -S webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module gtk3 librsvg libvips
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jacket/Necronomics.git
cd Necronomics

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
Necronomics/
├── src-tauri/          # Rust backend (Tauri commands, services, database)
├── src/                # React frontend (components, pages, stores)
├── public/             # Static assets (fonts, images)
└── docs/               # Project documentation
    ├── PROJECT_VISION.md
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── DESIGN_SYSTEM.md
    ├── FEATURES.md
    └── ROADMAP.md
```

## Design Philosophy

Necronomics combines **Lovecraftian cosmic horror** with **retro 2000s web design** to create a unique visual identity:

- Moss green color palette with chartreuse glow accents
- Gothic serif headers (Cinzel Decorative) with monospace body text (Share Tech Mono)
- Beveled borders, hard shadows, and CRT scanline effects
- Tentacle SVG decorations and eldritch iconography
- Themed UI feedback ("Your ritual has been completed" instead of "Transaction saved")

## License

[MIT](LICENSE)
