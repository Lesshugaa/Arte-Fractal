# Actividad 18 — Arte Fractal (Sierpinski + Mandelbrot)

Proyecto web en HTML + CSS + JavaScript (p5.js) que implementa dos fractales:
- Triángulo de Sierpinski (recursivo, 2D).
- Conjunto de Mandelbrot (plano complejo, con zoom y arrastre).

## Estructura
.
├─ index.html
├─ styles.css
└─ script.js

## Requisitos
Navegador moderno. No requiere instalación: p5.js se carga por CDN.

## Cómo ejecutar
1) Descargar la carpeta y abrir `index.html` en el navegador.
2) Opcional: servir con Live Server de VSCode para mejor rendimiento.

## Controles
- 1: Sierpinski
- 2: Mandelbrot
- W / S: Subir o bajar la profundidad en Sierpinski
- Rueda del mouse: Zoom (Mandelbrot)
- Arrastrar con el mouse: Mover vista (Mandelbrot)
- Click: Cambiar paleta de colores
- R: Reiniciar la vista/valores

## Personalización sugerida
- Cambiar paletas en `script.js` (arreglo `palettes`).
- Ajustar profundidad máxima o iteraciones.
- Modificar tamaños/colores en `styles.css`.

## Créditos
Actividad alineada con los objetivos didácticos y consignas de la materia (fractal 2D, Mandelbrot, personalización e interactividad).
