# Necronomics - Vision del Proyecto

> "That is not dead which can eternal lie, and with strange aeons even debt may die."

## Que es Necronomics?

Una aplicacion de escritorio de finanzas personales para Linux con una identidad visual unica: estetica Lovecraftiana combinada con el diseno retro de las paginas web de los 2000s. Construida con Tauri v2 (Rust) y React, es rapida, ligera y funciona completamente offline.

## Problema que resuelve

Llevar un control real y detallado de las finanzas personales:
- Saber exactamente en que se gasta cada peso
- Visualizar patrones de gasto e ingreso en el tiempo
- Controlar deudas de tarjetas de credito (cuotas, cupo, etc.)
- Tener toda la informacion financiera en un solo lugar, sin depender de servicios en la nube

## Pilares del proyecto

### 1. Precision en el tracking
Cada transaccion tiene categoria, subcategoria y descripcion unica. Un "completo" no es solo "comida", es un item identificable con historial propio.

### 2. Visualizacion poderosa
Dashboards con graficos D3.js completamente custom, tematizados con la estetica del proyecto. No graficos genericos: graficos que cuenten una historia visual.

### 3. Control de deudas
Seguimiento completo de tarjetas de credito: cuotas restantes, cupo disponible, proyeccion de pagos, alertas.

### 4. Multi-moneda
Soporte nativo para 5 monedas: CLP, USD, EUR, JPY, CNY. Con tipo de cambio configurable.

### 5. Identidad unica
No es "otra app de finanzas". La estetica Lovecraftiana + retro 2000s la hace memorable e inmediatamente reconocible en un portafolio.

## Usuario objetivo

El desarrollador del proyecto (uso personal), con potencial de expansion. La app debe ser lo suficientemente robusta para uso diario real.

## Principios de diseno

- **Offline-first**: Todo funciona sin conexion a internet
- **Privacidad total**: Los datos nunca salen del dispositivo
- **Rendimiento**: Gracias a Tauri + Rust, la app debe sentirse nativa
- **Experiencia unica**: Cada interaccion debe reforzar la tematica Lovecraftiana
