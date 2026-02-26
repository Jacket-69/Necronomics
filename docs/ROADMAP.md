# Roadmap de Desarrollo

## Fase 0 - Fundacion ✅
> Configurar el proyecto, tooling, estructura base y base de datos. Al terminar, la app compila y abre una ventana vacia con la DB lista.

### Proyecto y tooling
- [x] Inicializar repositorio git + `.gitignore` (node_modules, target, *.db, .env)
- [x] Inicializar proyecto Tauri v2 con template React + TypeScript + Vite (`npm create tauri-app@latest`)
- [x] Configurar TailwindCSS v4 en el proyecto Vite
- [x] Configurar ESLint + Prettier para TypeScript/React
- [x] Configurar `clippy` y `rustfmt` para Rust (agregar `rustfmt.toml` y reglas clippy en `Cargo.toml`)
- [x] Configurar permisos/capabilities de Tauri v2 en `src-tauri/capabilities/`

### Estructura de directorios
- [x] Crear estructura backend: `src-tauri/src/{commands, services, db/queries, db/migrations}/` con archivos `mod.rs`
- [x] Crear estructura frontend: `src/{components/ui, components/layout, pages, hooks, stores, lib, types, styles}/`
- [x] Crear directorio de assets: `public/assets/{fonts, images}/`

### Base de datos
- [x] Agregar dependencias Rust: `sqlx` (sqlite, runtime-tokio), `serde`, `chrono`, `uuid`, `rust_decimal`
- [x] Implementar sistema de migraciones (tabla `_migrations` + ejecucion secuencial al iniciar)
- [x] Migracion `001_initial_schema.sql`: crear las 8 tablas (currencies, accounts, categories, transactions, tags, transaction_tags, debts, exchange_rates) con todos los indices
- [x] Migracion `002_seed_currencies.sql`: insertar CLP, USD, EUR, JPY, CNY con symbol y decimal_places correctos
- [x] Migracion `003_seed_categories.sql`: insertar categorias por defecto:
  - Expense: Alimentacion (Supermercado, Comida Rapida, Restaurant, Delivery), Transporte (Micro/Metro, Uber/Taxi, Bencina), Vivienda (Arriendo, Servicios Basicos, Internet), Entretenimiento (Streaming, Juegos, Salidas), Salud (Farmacia, Consulta Medica), Educacion, Ropa, Otros
  - Income: Sueldo (Sueldo Base, Bonos, Horas Extra), Freelance, Inversiones, Otros

### Fuentes
- [x] Descargar e incluir fuentes en `public/assets/fonts/`: Cinzel Decorative (headers), Share Tech Mono (cuerpo), JetBrains Mono (numeros)
- [x] Configurar `@font-face` en CSS global

### Verificacion
- [x] `cargo build` exitoso en `src-tauri/`
- [x] `npm run tauri dev` abre una ventana con la DB creada y seeds aplicados
- [x] Verificar en SQLite que las tablas y seeds existen (`sqlite3 <path> ".tables"`)

### Notas de implementacion
- **CachyOS/Wayland**: Se requiere forzar `GDK_BACKEND=x11` y deshabilitar aceleracion HW de webkit2gtk (`WEBKIT_DISABLE_DMABUF_RENDERER=1`, `WEBKIT_DISABLE_COMPOSITING_MODE=1`) en `main.rs`
- **Versiones fijadas**: Todas las dependencias npm pinneadas a versiones exactas (Vite 6.3.5, React 19.0.0, TailwindCSS 4.1.8) para estabilidad

**Entregable**: App Tauri que abre una ventana, DB con schema completo, seeds de monedas y categorias, fuentes cargadas, linters configurados. ✅ Completado 2025-02-26

---

## Fase 1 - Core financiero
> CRUD completo de cuentas, categorias y transacciones. Layout principal con tema visual base.

### Tema visual base
- [ ] Definir tokens CSS custom (variables de color, spacing, tipografia) segun DESIGN_SYSTEM.md
- [ ] Configurar Tailwind theme extend con los tokens del proyecto (colores eldritch, fuentes, sombras)
- [ ] Implementar componentes UI base: Button (primario, secundario, peligro), Input, Select, Card, Table (con filas alternadas), Modal con overlay
- [ ] Implementar sistema de toasts tematizados para feedback (exito, error, warning)
- [ ] Implementar dialogo de confirmacion reutilizable ("Seguro que deseas invocar este ritual?")

### Layout principal
- [ ] Componente Shell: Sidebar fija (220px) + Header + Content area con scroll
- [ ] Sidebar: logo Necronomics en Cinzel Decorative, items de navegacion (Dashboard, Transacciones, Deudas, Configuracion)
- [ ] Header: titulo de pagina actual + fecha
- [ ] Configurar react-router con las 4 rutas principales

### Backend - Cuentas
- [ ] Comando `create_account`: nombre, tipo (cash/bank/credit_card), currency_id, credit_limit (solo credit_card), billing_day
- [ ] Comando `list_accounts`: retorna todas las cuentas activas con su balance y moneda
- [ ] Comando `update_account`: editar nombre, credit_limit, billing_day, is_active
- [ ] Comando `delete_account`: soft delete (is_active = 0), solo si no tiene transacciones asociadas. Si tiene, retornar error explicativo

### Backend - Categorias
- [ ] Comando `create_category`: nombre, tipo (income/expense), icono, parent_id opcional
- [ ] Comando `list_categories`: retorna arbol jerarquico (padres con hijos anidados)
- [ ] Comando `update_category`: editar nombre, icono, is_active
- [ ] Comando `delete_category`: soft delete, solo si no tiene transacciones asociadas

### Backend - Transacciones
- [ ] Comando `create_transaction`: account_id, category_id, amount, type, description, date, notes. Al crear: actualizar balance de la cuenta (+amount si income, -amount si expense)
- [ ] Comando `update_transaction`: al editar, revertir el efecto en balance de la cuenta original, luego aplicar el nuevo monto/tipo/cuenta
- [ ] Comando `delete_transaction`: revertir el efecto en el balance de la cuenta, luego eliminar
- [ ] Comando `list_transactions`: paginado (page + page_size), con filtros opcionales:
  - Rango de fechas (date_from, date_to)
  - Tipo (income/expense)
  - category_id
  - account_id
  - Monto minimo/maximo
  - Busqueda por descripcion (LIKE)
  - Ordenamiento por columna + direccion (ASC/DESC)
- [ ] Comando `get_transaction`: detalle de una transaccion por id

### Frontend - Cuentas y Categorias
- [ ] Pagina de Configuracion: seccion de cuentas con tabla + boton crear + modal de creacion/edicion
- [ ] Pagina de Configuracion: seccion de categorias mostrando arbol jerarquico + CRUD en modal
- [ ] Selector de moneda al crear cuenta (dropdown con las 5 monedas)

### Frontend - Transacciones
- [ ] Zustand store para transacciones: lista, filtros activos, paginacion, loading state
- [ ] Pagina de Transacciones: tabla con columnas (fecha, descripcion, categoria, cuenta, monto, tipo)
- [ ] Montos formateados segun moneda: CLP y JPY sin decimales, USD/EUR/CNY con 2 decimales, con simbolo
- [ ] Ingresos en color `--income`, gastos en color `--expense`
- [ ] Barra de filtros: date range picker, dropdown tipo, dropdown categoria, dropdown cuenta, input de monto min/max, busqueda por descripcion
- [ ] Paginacion en la tabla (anterior/siguiente + indicador de pagina)
- [ ] Ordenamiento clickeando en headers de columnas
- [ ] Boton "Nueva transaccion" abre modal con formulario (react-hook-form + zod):
  - Tipo (toggle income/expense)
  - Monto (input numerico)
  - Cuenta (select)
  - Categoria (select jerarquico: muestra "Alimentacion > Comida Rapida")
  - Descripcion (input texto libre)
  - Fecha (date picker, default hoy)
  - Notas (textarea opcional)
- [ ] Editar transaccion: click en fila abre modal con datos pre-cargados
- [ ] Eliminar transaccion: boton con dialogo de confirmacion, luego toast de exito

### Verificacion
- [ ] Crear 2+ cuentas (una en CLP, una en USD), verificar que aparecen con formato correcto
- [ ] Crear 10+ transacciones variadas, verificar que los balances se actualizan correctamente
- [ ] Filtrar por cada criterio y verificar resultados
- [ ] Editar una transaccion y verificar que el balance se recalcula
- [ ] Eliminar una transaccion y verificar balance

**Entregable**: App funcional con tema Lovecraftiano base. Se pueden gestionar cuentas, categorias y transacciones con filtros, paginacion y feedback visual. Los montos se muestran correctamente segun moneda.

---

## Fase 2 - Deudas y tarjetas
> Modulo de seguimiento de deudas en cuotas y estado de tarjetas de credito.

### Backend - Deudas
- [ ] Comando `create_debt`: account_id (debe ser credit_card), description, original_amount, total_installments, monthly_payment, interest_rate, start_date. Calcular y validar: monthly_payment * total_installments >= original_amount
- [ ] Comando `list_debts`: filtrar por account_id, is_active. Incluir campos calculados: cuotas restantes, monto restante, fecha proxima cuota
- [ ] Comando `get_debt`: detalle completo con calendario de cuotas (fechas de cada cuota, pagada si/no)
- [ ] Comando `pay_installment`: marca la siguiente cuota como pagada + crea una transaccion de tipo expense en la cuenta asociada (categoria "Pago Cuota" o similar). Actualiza paid_installments += 1. Si paid_installments == total_installments, marcar debt como is_active = 0
- [ ] Comando `update_debt`: editar description, notes
- [ ] Comando `delete_debt`: solo si tiene 0 cuotas pagadas, si no retornar error
- [ ] Comando `get_account_credit_summary`: para una tarjeta, retorna credit_limit, total comprometido en deudas activas, cupo disponible, total mensual en cuotas

### Frontend - Pagina de Deudas
- [ ] Zustand store para deudas: lista, filtro por tarjeta, loading state
- [ ] Vista principal: lista de tarjetas de credito como cards, cada una muestra:
  - Nombre de la tarjeta
  - Barra de progreso de cupo: usado vs disponible (verde si < 50%, amarillo 50-80%, rojo > 80%)
  - Total mensual comprometido en cuotas
  - Cantidad de deudas activas
- [ ] Click en tarjeta: expande/navega a lista de deudas activas de esa tarjeta
- [ ] Cada deuda muestra: descripcion, cuotas pagadas/total (ej: "3/12"), monto cuota, monto restante, barra de progreso
- [ ] Boton "Pagar cuota" por deuda: dialogo de confirmacion, al confirmar ejecuta pay_installment (crea transaccion automaticamente)
- [ ] Modal de creacion de deuda: account_id (solo tarjetas), descripcion, monto total, cuotas, monto cuota (auto-calculado o manual), tasa interes, fecha inicio
- [ ] Vista de detalle de deuda: calendario visual de cuotas (tabla con fecha, monto, estado pagado/pendiente)

### Frontend - Proyeccion
- [ ] Widget de proyeccion: tabla con los proximos 6 meses, mostrando cuanto se pagara en cuotas por mes
- [ ] Alerta visual en el sidebar si alguna tarjeta supera 80% de cupo (indicador rojo en el item "Deudas")

### Verificacion
- [ ] Crear una tarjeta con limite de credito, agregar 3+ deudas en cuotas
- [ ] Pagar cuotas y verificar que: paid_installments incrementa, se crea transaccion, balance de cuenta cambia
- [ ] Verificar que el cupo disponible se calcula correctamente
- [ ] Verificar alerta visual al superar 80% de cupo
- [ ] Verificar que al pagar todas las cuotas, la deuda se marca inactiva

**Entregable**: Modulo de deudas completo. Pagar cuota genera transaccion automatica. Vista de tarjetas con cupo, progreso de deudas y proyeccion de pagos.

---

## Fase 3 - Dashboard y graficos D3
> Dashboard principal con metricas y 4 graficos D3 tematizados.

### Backend - Agregaciones
- [ ] Comando `get_dashboard_summary`: balance total por cuenta, total ingresos del mes, total gastos del mes, diferencia (ahorro del mes)
- [ ] Comando `get_expenses_by_category`: totales agrupados por categoria para un rango de fechas, con subcategorias. Para el donut y treemap
- [ ] Comando `get_monthly_comparison`: ingresos vs gastos agrupados por mes para los ultimos N meses. Para el grafico de barras
- [ ] Comando `get_balance_history`: balance diario/semanal/mensual en un rango de fechas. Para el grafico de linea
- [ ] Comando `get_recent_transactions`: ultimas 10 transacciones. Para el widget de recientes
- [ ] Comando `get_top_expenses`: top 5 categorias de gasto del mes actual

### Frontend - Dashboard layout
- [ ] Pagina de Dashboard como pagina principal (ruta `/`)
- [ ] Layout de grid responsive: widgets de metricas arriba, graficos en medio, recientes abajo
- [ ] Selector de periodo: "Este mes", "Ultimo mes", "Ultimos 3 meses", "Este ano", rango custom con date pickers
- [ ] Zustand store para dashboard: periodo seleccionado, datos de cada widget, loading states

### Frontend - Widgets de metricas
- [ ] Card de balance total (suma de todas las cuentas, convertido a moneda principal)
- [ ] Card de ingresos del periodo (con flecha de tendencia vs periodo anterior)
- [ ] Card de gastos del periodo (con flecha de tendencia vs periodo anterior)
- [ ] Card de ahorro del periodo (ingresos - gastos)
- [ ] Top 5 categorias de gasto: mini lista con icono + nombre + monto + porcentaje del total

### Frontend - Graficos D3
- [ ] Grafico de donut: distribucion de gastos por categoria. Hover muestra tooltip con nombre + monto + porcentaje. Click en segmento filtra la tabla de recientes. Colores del tema eldritch
- [ ] Grafico de barras agrupadas: ingresos (verde) vs gastos (rojo) por mes, ultimos 12 meses. Hover muestra tooltip con valores exactos. Eje X = meses, Eje Y = monto
- [ ] Grafico de linea: evolucion del balance en el tiempo. Area rellena semi-transparente debajo. Puntos en cada data point con tooltip. Linea con glow verde sutil
- [ ] Treemap: desglose jerarquico de gastos. Primer nivel = categorias, click para drill-down a subcategorias. Tamano proporcional al monto. Tooltip con nombre + monto
- [ ] Todos los graficos: animacion de entrada, responsive al tamano del contenedor, paleta de colores del tema

### Frontend - Transacciones recientes
- [ ] Widget de tabla compacta: ultimas 10 transacciones con fecha, descripcion, categoria, monto (coloreado por tipo)
- [ ] Click en una transaccion navega a la pagina de transacciones con esa transaccion seleccionada

### Verificacion
- [ ] Dashboard carga correctamente con 0 transacciones (estados vacios)
- [ ] Agregar 50+ transacciones variadas en distintos meses/categorias y verificar que todos los graficos reflejan los datos
- [ ] Cambiar selector de periodo y verificar que todos los widgets se actualizan
- [ ] Verificar tooltips e interactividad en cada grafico
- [ ] Verificar que los graficos se ven bien en la ventana a distintos tamanos

**Entregable**: Dashboard completo con 4 graficos D3 interactivos y tematizados, metricas de resumen, selector de periodo y transacciones recientes.

---

## Fase 4 - Autocomplete y tags
> Mejoras de UX en el flujo de registro de transacciones.

### Backend - Autocomplete
- [ ] Comando `get_suggestions`: recibe texto parcial (min 2 caracteres), retorna top 10 descripciones mas frecuentes que matchean (LIKE texto%), con su category_id y monto mas comun asociado
- [ ] Indice en transactions(description) ya existe desde Fase 0

### Frontend - Autocomplete
- [ ] Componente Autocomplete: input con dropdown de sugerencias debajo
- [ ] Debounce de 300ms antes de llamar al backend
- [ ] Al seleccionar sugerencia: auto-rellena descripcion, categoria y monto
- [ ] Navegacion con teclado: flechas arriba/abajo + Enter para seleccionar + Esc para cerrar
- [ ] Integrar en el formulario de nueva/editar transaccion (reemplazar el input de descripcion actual)

### Backend - Tags
- [ ] Comando `create_tag`: nombre, color hex
- [ ] Comando `list_tags`: todos los tags ordenados por nombre
- [ ] Comando `delete_tag`: eliminar tag y sus relaciones en transaction_tags
- [ ] Comando `set_transaction_tags`: recibe transaction_id + lista de tag_ids, reemplaza los tags actuales
- [ ] Comando `list_transactions` (actualizar): agregar filtro opcional por tag_ids, incluir tags en el response de cada transaccion

### Frontend - Tags
- [ ] Componente TagSelector: input que muestra tags como chips/badges, con color. Click para agregar, X para quitar. Dropdown con tags disponibles
- [ ] Integrar TagSelector en formulario de transaccion (crear y editar)
- [ ] Mostrar tags como badges en la tabla de transacciones
- [ ] Agregar filtro por tag en la barra de filtros de transacciones
- [ ] Pagina de configuracion: seccion de gestion de tags (CRUD + color picker)

### Verificacion
- [ ] Crear 20+ transacciones con descripciones repetidas, verificar que el autocomplete sugiere correctamente
- [ ] Verificar que al seleccionar sugerencia se auto-rellenan los campos
- [ ] Crear tags, asignar a transacciones, filtrar por tag
- [ ] Verificar que eliminar un tag no afecta las transacciones (solo se quita la relacion)

**Entregable**: Autocomplete funcional que agiliza el registro. Sistema de tags completo con filtrado.

---

## Fase 5 - Multi-moneda y transacciones recurrentes
> Soporte completo multi-moneda y automatizacion de transacciones periodicas.

### Backend - Tipos de cambio
- [ ] Comando `set_exchange_rate`: from_currency, to_currency, rate, date. Crea o actualiza (upsert por unique constraint)
- [ ] Comando `get_exchange_rate`: retorna el rate mas reciente entre 2 monedas
- [ ] Comando `list_exchange_rates`: historial de rates para un par de monedas
- [ ] Comando `convert_amount`: amount, from_currency, to_currency. Usa el rate mas reciente disponible. Retorna error si no hay rate

### Frontend - Multi-moneda
- [ ] Pagina de Configuracion: seccion "Tipos de cambio" con tabla de rates actuales entre todas las monedas
- [ ] Formulario para ingresar/actualizar tipo de cambio: seleccionar par de monedas + rate + fecha
- [ ] En la pagina de Configuracion: selector de "Moneda principal" (la moneda en la que se muestra el balance consolidado)
- [ ] Dashboard: balance total consolidado convierte todas las cuentas a moneda principal usando rates vigentes. Si no hay rate para alguna moneda, mostrar warning con el monto sin convertir
- [ ] En todas las vistas de monto: mostrar indicador de moneda (ej: "$15.000 CLP", "US$50,00")

### Backend - Transacciones recurrentes
- [ ] Nueva tabla `recurring_transactions`: id, account_id, category_id, amount, type, description, frequency (weekly/biweekly/monthly), next_date, is_active, created_at
- [ ] Migracion `004_recurring_transactions.sql`
- [ ] Comando `create_recurring`: crear regla de recurrencia
- [ ] Comando `list_recurring`: listar recurrencias activas
- [ ] Comando `update_recurring`: editar o desactivar
- [ ] Comando `delete_recurring`: eliminar regla
- [ ] Servicio `process_recurring`: al iniciar la app, revisar recurrencias donde next_date <= hoy. Por cada una: crear transaccion, calcular siguiente next_date segun frequency. Ejecutar al startup en `lib.rs`

### Frontend - Transacciones recurrentes
- [ ] Pagina de Configuracion: seccion "Transacciones recurrentes" con tabla de reglas activas
- [ ] Modal de creacion: mismos campos que transaccion + selector de frecuencia (semanal, quincenal, mensual) + fecha de inicio
- [ ] Indicador en transacciones generadas automaticamente (badge "Recurrente" o icono)
- [ ] Al abrir la app: si se generaron transacciones recurrentes, mostrar toast informativo ("Se registraron 3 transacciones recurrentes")

### Verificacion
- [ ] Ingresar tipos de cambio entre CLP y USD, verificar conversion correcta
- [ ] Tener cuentas en 2+ monedas, verificar balance consolidado en dashboard
- [ ] Verificar warning si falta rate para alguna moneda
- [ ] Crear recurrencia mensual, simular avance de fecha (o cambiar next_date manual), verificar que se genera la transaccion al abrir la app
- [ ] Verificar que las recurrencias no generan transacciones duplicadas

**Entregable**: Multi-moneda funcional con conversion y balance consolidado. Transacciones recurrentes se generan automaticamente.

---

## Fase 6 - Export/Import, polish y testing
> Funcionalidades finales, pulido visual y aseguramiento de calidad.

### Export/Import
- [ ] **Backend**: Comando `export_data`: serializa toda la DB a JSON con metadata (version del schema, fecha, conteo de registros por tabla). Usa dialogo nativo de Tauri para elegir donde guardar el archivo
- [ ] **Backend**: Comando `import_data`: lee JSON, valida estructura y version, ofrece 2 modos:
  - Merge: agrega registros nuevos (por id), no sobreescribe existentes
  - Replace: elimina todo y reemplaza (con confirmacion doble)
- [ ] **Frontend**: Seccion Export/Import en Configuracion con botones y seleccion de modo

### Atajos de teclado
- [ ] Ctrl+N: abre modal de nueva transaccion (desde cualquier pagina)
- [ ] Ctrl+D: navega a dashboard
- [ ] Ctrl+T: navega a transacciones
- [ ] Ctrl+E: abre dialogo de export
- [ ] Esc: cierra modal/dropdown activo
- [ ] Registrar atajos de forma global con hook reutilizable

### Polish visual Lovecraftiano
- [ ] Efecto scanline CRT sutil como overlay global (CSS animation, toggleable)
- [ ] Decoraciones SVG de tentaculos en esquinas de Cards y bordes del Sidebar
- [ ] Glow pulsante en el logo y elementos interactivos al hover
- [ ] Sombras duras estilo 2000s en todos los paneles
- [ ] Cursores custom tematizados
- [ ] Barras de scroll estilizadas con tema verde musgo
- [ ] Animaciones de entrada (emerge) al navegar entre paginas
- [ ] Estados vacios tematizados ("No hay transacciones en este grimorio..." etc.)
- [ ] Loading state tematizado (ojo de Cthulhu pulsante o similar)

### Manejo de errores y edge cases
- [ ] Error boundary global en React con pagina de error tematizada
- [ ] Manejo de errores en todos los invoke(): mostrar toast con mensaje descriptivo
- [ ] Validar formularios client-side con zod antes de enviar al backend
- [ ] Manejar caso de DB corrupta o inaccesible al startup

### Testing
- [ ] Tests unitarios en Rust: funciones de calculo de balance, conversion de moneda, logica de cuotas
- [ ] Tests de integracion en Rust: comandos principales contra DB en memoria
- [ ] Verificacion manual completa: recorrer todos los flujos documentados en FEATURES.md

### Verificacion final
- [ ] Recorrer todos los features P0 y P1 de FEATURES.md y verificar que funcionan
- [ ] Probar con dataset grande (500+ transacciones) y verificar rendimiento
- [ ] Verificar que la app funciona correctamente en CachyOS con diferentes tamanos de ventana
- [ ] Build de produccion: `npm run tauri build`, verificar tamano del binario y que ejecuta correctamente

**Entregable**: App completa, pulida y testeada. Lista para uso diario y para portafolio. Binario de produccion generado.

---

## Futuro (post v1.0)

Ideas para considerar despues de la primera version estable:

- Graficos avanzados D3 (heatmap de gastos, diagrama sankey de flujo de dinero)
- Reportes mensuales/anuales exportables a PDF
- Presupuestos por categoria (limite mensual con alerta)
- Metas de ahorro con tracking visual
- Tema alternativo "Void" (purpura + negro)
- Notificaciones de escritorio (recordatorio de cuotas, etc.)
- API de tipos de cambio automatica (fetch al abrir la app)
- Comparacion mes a mes con graficos superpuestos
