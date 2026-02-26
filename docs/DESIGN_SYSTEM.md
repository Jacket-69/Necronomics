# Sistema de Diseno - Necronomics

> La estetica es una fusion de horror cosmico Lovecraftiano con el diseno web retro de los anos 2000.

## Paleta de colores

### Colores primarios (Moss/Vomit Green)
```
--eldritch-900: #0a0f06    (Fondo mas oscuro, el vacio)
--eldritch-800: #1a2410    (Fondo de paneles)
--eldritch-700: #2a3a1a    (Fondo de tarjetas)
--eldritch-600: #3a4d20    (Bordes activos)
--eldritch-500: #4a5d23    (Color principal - moss green)
--eldritch-400: #6b7c3e    (Texto secundario, iconos)
--eldritch-300: #8a9a5b    (Texto hover)
--eldritch-200: #a8b878    (Texto principal)
--eldritch-100: #c4d4a0    (Texto destacado)
--eldritch-glow: #7fff00   (Glow para acentos - chartreuse)
```

### Colores secundarios
```
--void-dark: #050505        (Negro puro para contraste)
--parchment: #d4c5a9        (Para textos especiales, estilo pergamino)
--parchment-dark: #8a7d65   (Pergamino oscurecido)
--blood: #8b1a1a            (Alertas, deudas, gastos grandes)
--blood-glow: #ff2020       (Glow rojo para advertencias)
--deep-purple: #1a0a2e      (Acentos de vacio cosmico)
--tentacle: #2d4a1a         (Verde oscuro para decoraciones organicas)
```

### Colores funcionales
```
--income: #4a9a4a           (Verde positivo para ingresos)
--expense: #9a4a4a          (Rojo apagado para gastos)
--neutral: #6b7c3e          (Operaciones neutras)
--warning: #9a7a2a          (Advertencias)
--debt: #8b1a1a             (Deudas activas)
```

## Tipografia

### Fuentes
```
- Titulos/Headers: "Cinzel Decorative" (serif gotica, evoca lo arcano)
  Fallback: "Cinzel", "Georgia", serif

- Subtitulos: "Cinzel" (version limpia para subtitulos)
  Fallback: "Georgia", serif

- Cuerpo/UI: "Share Tech Mono" (monospace legible, vibe retro-tech)
  Fallback: "Courier New", monospace

- Numeros financieros: "JetBrains Mono" (monospace optimizada para numeros)
  Fallback: "Consolas", monospace
```

### Escala tipografica
```
--text-xs: 0.75rem     (12px - labels menores)
--text-sm: 0.875rem    (14px - texto secundario)
--text-base: 1rem      (16px - texto principal)
--text-lg: 1.25rem     (20px - subtitulos de seccion)
--text-xl: 1.5rem      (24px - titulos de pagina)
--text-2xl: 2rem       (32px - titulo de la app)
--text-3xl: 2.5rem     (40px - numeros destacados en dashboard)
```

## Efectos visuales

### Retro 2000s
- **Bordes biselados**: `border: 2px outset` en botones y paneles, simulando el look de Windows 98/2000
- **Fondos con textura**: Texturas sutiles de papel viejo o piedra como background de paneles
- **Separadores ornamentados**: Lineas decorativas con motivos tentaculares entre secciones
- **Sombras duras**: Box-shadows sin blur para ese look plano de los 2000s: `box-shadow: 3px 3px 0 #0a0f06`
- **Cursores custom**: Cursor tematico (una daga o simbolo arcano)
- **Barras de scroll custom**: Estilizadas con el tema verde musgo
- **Tabla con bordes**: Las tablas de datos usan bordes visibles estilo HTML clasico

### Lovecraftiano
- **Glow verde**: `text-shadow: 0 0 10px #7fff00` en elementos interactivos y al hover
- **Efecto de tentaculos**: SVG decorativos en esquinas de paneles y como separadores
- **Runas/simbolos**: Iconografia custom basada en simbolos arcanos
- **Fondo animado**: Particulas flotantes sutiles (como esporas o estrellas lejanas)
- **Transiciones organicas**: Ease-in-out con timing suave, como si los elementos "crecieran"
- **Efecto de pergamino**: Bordes rasgados en tarjetas importantes
- **Efecto scanline**: Overlay sutil de lineas horizontales simulando un CRT antiguo

### Animaciones
```css
/* Glow pulsante para elementos importantes */
@keyframes eldritch-pulse {
    0%, 100% { text-shadow: 0 0 5px var(--eldritch-glow); }
    50% { text-shadow: 0 0 20px var(--eldritch-glow), 0 0 40px var(--eldritch-500); }
}

/* Entrada de elementos - emerge de la oscuridad */
@keyframes emerge {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Scanline overlay */
@keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}
```

## Componentes UI

### Botones
- **Primario**: Fondo `--eldritch-500`, borde `outset`, hover con glow verde
- **Secundario**: Fondo transparente, borde `--eldritch-600`, hover cambia fondo
- **Peligro**: Fondo `--blood`, glow rojo en hover
- **Todos**: Fuente monospace, texto uppercase, letter-spacing amplio

### Tarjetas (Cards)
- Fondo `--eldritch-800` con borde `1px solid --eldritch-600`
- Header con fondo ligeramente mas claro
- Sombra dura: `4px 4px 0 --void-dark`
- Decoracion de tentaculo SVG en la esquina superior derecha (sutil)

### Inputs
- Fondo `--eldritch-900`, borde `1px inset --eldritch-600`
- Al focus: borde cambia a `--eldritch-glow` con sutil glow
- Placeholder en `--eldritch-400`
- Fuente monospace

### Tablas
- Header con fondo `--eldritch-700`, fuente Cinzel
- Filas alternadas: `--eldritch-800` y `--eldritch-900`
- Hover de fila: fondo `--eldritch-700` con transicion suave
- Bordes visibles entre celdas (estilo HTML clasico)
- Montos de ingreso en `--income`, gastos en `--expense`

### Sidebar
- Fondo `--eldritch-900` con borde derecho ornamentado
- Items del menu con icono arcano + texto
- Item activo con glow verde lateral
- Logo "Necronomics" en Cinzel Decorative con glow

### Modal
- Overlay oscuro semi-transparente con efecto de "niebla"
- Contenido con borde ornamentado
- Entrada con animacion `emerge`

## Layout

### Estructura principal
```
+------+----------------------------------+
|      |          Header Bar              |
| Side |----------------------------------+
| bar  |                                  |
|      |         Contenido               |
|      |         Principal               |
|      |                                  |
|      |                                  |
+------+----------------------------------+
```

- Sidebar fija a la izquierda (~220px)
- Header con titulo de pagina, fecha y acciones rapidas
- Area de contenido con scroll independiente
- Sin footer (el sidebar contiene todo lo necesario)

## Iconografia

Usar una combinacion de:
- Iconos custom SVG con estetica Lovecraftiana para la navegacion principal
- Una libreria de iconos base (Lucide Icons) para iconos funcionales
- Decoraciones SVG de tentaculos, ojos, runas como elementos ambientales
