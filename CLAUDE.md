# Necronomics

App de finanzas personales de escritorio para Linux con estetica Lovecraftiana y retro 2000s.

## Stack

- **Backend**: Rust (Tauri v2)
- **Frontend**: React 19 + TypeScript
- **Base de datos**: SQLite (via sqlx en Rust)
- **Graficos**: D3.js
- **Estilos**: TailwindCSS v4 + CSS custom para efectos retro
- **State**: Zustand
- **Build**: Vite

## Convenciones

### Rust (src-tauri/)
- Usar `snake_case` para funciones, variables y modulos
- Usar `PascalCase` para structs, enums y traits
- Manejar errores con `Result<T, E>` y el patron `?`, nunca `unwrap()` en produccion
- Documentar funciones publicas con `///`
- Comandos Tauri en `src-tauri/src/commands/`

### TypeScript (src/)
- Usar `camelCase` para variables y funciones
- Usar `PascalCase` para componentes React y tipos/interfaces
- No usar `any`, siempre tipar explicitamente
- Componentes funcionales con arrow functions
- Un componente por archivo

### General
- Commits en ingles, con prefijos: feat, fix, refactor, docs, style, test, chore
- Idioma de la UI: Espanol
- Idioma del codigo: Ingles (nombres de variables, funciones, etc.)
- Monedas soportadas: CLP, USD, EUR, JPY, CNY
- Export/Import solo en formato propio JSON de la app
