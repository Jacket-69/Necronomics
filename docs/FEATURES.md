# Features - Necronomics

Prioridades: **P0** = MVP imprescindible | **P1** = Importante post-MVP | **P2** = Nice-to-have

---

## Modulo: Transacciones

### [P0] Registro de transacciones
- Crear transaccion con: monto, tipo (ingreso/gasto), cuenta, categoria, descripcion, fecha
- Editar y eliminar transacciones existentes
- Descripcion libre para identificacion unica ("Completo en fuente alemana", "Sueldo Enero")
- Seleccion de fecha con date picker (default: hoy)

### [P0] Categorias jerarquicas
- Categorias de primer nivel (Alimentacion, Transporte, Entretenimiento, etc.)
- Subcategorias (Alimentacion > Comida Rapida, Alimentacion > Supermercado)
- Cada categoria marcada como ingreso o gasto
- CRUD completo de categorias

### [P0] Listado y filtros
- Tabla de transacciones con paginacion
- Filtros por: rango de fechas, tipo, categoria, cuenta, monto minimo/maximo
- Busqueda por descripcion
- Ordenamiento por columnas

### [P1] Tags/Etiquetas
- Agregar multiples tags a una transaccion
- Filtrar transacciones por tags
- Tags con color personalizado
- Ejemplo: "urgente", "regalo", "trabajo", "fin de semana"

### [P1] Autocomplete inteligente
- Al escribir la descripcion, sugerir basado en historial de transacciones previas
- Sugerencia incluye la categoria y monto mas frecuente asociado
- Al seleccionar una sugerencia, auto-rellenar categoria y monto
- Ranking por frecuencia de uso

### [P1] Transacciones recurrentes
- Marcar una transaccion como recurrente (mensual, quincenal, semanal)
- Generacion automatica en la fecha correspondiente
- Gestion de recurrencias activas

---

## Modulo: Cuentas

### [P0] Gestion de cuentas
- Crear cuentas: efectivo, cuenta bancaria, tarjeta de credito
- Cada cuenta asociada a una moneda
- Ver balance actual de cada cuenta
- Tarjetas de credito: definir limite de credito y dia de facturacion

### [P0] Balance automatico
- El balance se actualiza automaticamente al registrar transacciones
- Vista de balance total consolidado (convertido a moneda base del usuario)

---

## Modulo: Deudas y Tarjetas de Credito

### [P0] Registro de deudas en cuotas
- Crear deuda: monto total, numero de cuotas, monto por cuota, tasa de interes
- Asociar a una cuenta (tarjeta de credito)
- Fecha de inicio

### [P0] Seguimiento de cuotas
- Ver cuotas pagadas vs pendientes
- Marcar cuotas como pagadas (manual o automatico por fecha)
- Ver monto total restante por pagar

### [P1] Dashboard de tarjetas
- Cupo utilizado vs cupo disponible (barra visual)
- Listado de deudas activas por tarjeta
- Proyeccion de pagos futuros (calendario de cuotas)
- Total mensual comprometido en cuotas

### [P1] Alertas de deudas
- Indicador visual cuando una tarjeta supera el 80% de cupo
- Destacar deudas proximas a vencer

---

## Modulo: Dashboard y Graficos

### [P0] Dashboard principal
- Resumen de balance total
- Ingresos vs gastos del mes actual
- Top 5 categorias de gasto del mes
- Transacciones recientes (ultimas 5-10)

### [P1] Graficos D3.js
- **Grafico de torta/donut**: Distribucion de gastos por categoria
- **Grafico de barras**: Ingresos vs gastos por mes (ultimos 12 meses)
- **Grafico de linea**: Evolucion del balance en el tiempo
- **Treemap**: Desglose jerarquico de gastos (categoria > subcategoria)
- Todos tematizados con colores y estetica Lovecraftiana

### [P2] Graficos avanzados
- Heatmap de gastos por dia de la semana / hora
- Comparacion mes actual vs mes anterior
- Tendencia de gasto por categoria en el tiempo
- Grafico de sankey: flujo de dinero (ingresos -> categorias de gasto)

---

## Modulo: Multi-moneda

### [P0] Soporte basico
- 5 monedas: CLP, USD, EUR, JPY, CNY
- Cada cuenta en su moneda
- Mostrar montos con formato correcto segun moneda

### [P1] Tipo de cambio
- Tabla de tipos de cambio con fecha
- Ingreso manual de tipo de cambio
- Conversion entre monedas para vista consolidada

### [P2] Historial de tipo de cambio
- Registro historico de tipos de cambio
- Graficos de evolucion del tipo de cambio

---

## Modulo: Export/Import

### [P1] Exportacion
- Exportar todos los datos a formato JSON propio de Necronomics
- Exportar transacciones filtradas
- Incluir metadata (version, fecha de exportacion)

### [P1] Importacion
- Importar desde archivo JSON de Necronomics
- Validacion de datos antes de importar
- Opcion de merge (agregar) o replace (reemplazar todo)

---

## Modulo: Configuracion

### [P0] Configuracion basica
- Moneda principal (default: CLP)
- Idioma de la UI (espanol por defecto, solo espanol en MVP)

### [P1] Personalizacion
- Categorias por defecto vs custom
- Configurar cuentas

### [P2] Temas
- Variaciones del tema Lovecraftiano (mas verde, mas purpura, mas rojo)

---

## UX General

### [P0] Navegacion
- Sidebar con acceso a todos los modulos
- Header con contexto de la pagina actual

### [P0] Retroalimentacion
- Feedback visual al crear/editar/eliminar (toasts tematicos)
- Confirmacion antes de eliminar datos
- Estados de carga tematizados

### [P1] Atajos de teclado
- Ctrl+N: Nueva transaccion
- Ctrl+D: Ir a dashboard
- Ctrl+E: Exportar
- Esc: Cerrar modales
