/* ===========================================
   Actividad 18 — Arte Fractal (p5.js)
   - Modo 1: Triángulo de Sierpinski (recursivo)
   - Modo 2: Conjunto de Mandelbrot (plano complejo)
   Interactividad solicitada en la consigna:
   • Personalización de color y profundidad
   • Zoom y navegación en Mandelbrot
   =========================================== */

// ---- Estado global
let mode = "sierpinski"; // "sierpinski" | "mandelbrot"
let depth = 5;            // Profundidad Sierpinski
let paletteIndex = 0;     // Para alternar paletas
let cnv;

// ---- Paletas simples para jugar
const palettes = [
  (t) => color(30 + 225 * t, 180 * (1 - t), 255 * t),        // gradiente cálido
  (t) => color(120 * (1 - t), 220 * t, 255 * (0.4 + 0.6*t)), // azul verdoso
  (t) => color(255 * t, 120 * (1 - t), 200),                 // magentas
];

// ---- Vista Mandelbrot
let view = {
  cx: -0.5,  // centro x en plano complejo
  cy: 0.0,   // centro y en plano complejo
  scale: 3.0, // ancho del plano complejo visible
  maxIter: 120
};
let isDragging = false;
let lastMouse;

// ============ p5 ============

function setup() {
  cnv = createCanvas(900, 560);
  cnv.parent("canvas-holder");
  pixelDensity(1); // más rápido para fractales
  noLoop();

  // Botones
  select("#btnSierpinski").mousePressed(() => { mode = "sierpinski"; redraw(); });
  select("#btnMandelbrot").mousePressed(() => { mode = "mandelbrot"; redraw(); });
  select("#btnReset").mousePressed(resetView);
  select("#btnColor").mousePressed(nextPalette);
}

function windowResized() {
  // Intento mantener tamaño estable visual, pero adaptado al contenedor
  const holder = document.getElementById("canvas-holder");
  const w = holder.clientWidth || 900;
  const h = Math.max(420, Math.round(w * 0.62));
  resizeCanvas(w, h);
  redraw();
}

function draw() {
  if (mode === "sierpinski") {
    drawSierpinski();
  } else {
    drawMandelbrot();
  }
  drawHUD();
}

// ============ Sierpinski ============

function drawSierpinski() {
  background(10);
  noStroke();
  // Triángulo base
  const p1 = createVector(width * 0.5, 30);
  const p2 = createVector(30, height - 30);
  const p3 = createVector(width - 30, height - 30);
  sierpinski(depth, p1, p2, p3);
}

function sierpinski(d, a, b, c) {
  if (d === 0) {
    // Color por área (aprox: altura normalizada)
    const t = constrain((c.y - a.y) / height, 0, 1);
    fill(palettes[paletteIndex](t));
    triangle(a.x, a.y, b.x, b.y, c.x, c.y);
    return;
  }
  const ab = p5.Vector.add(a, b).mult(0.5);
  const bc = p5.Vector.add(b, c).mult(0.5);
  const ca = p5.Vector.add(c, a).mult(0.5);
  sierpinski(d - 1, a, ab, ca);
  sierpinski(d - 1, ab, b, bc);
  sierpinski(d - 1, ca, bc, c);
}

// ============ Mandelbrot ============

function drawMandelbrot() {
  loadPixels();
  const W = width;
  const H = height;

  const xmin = view.cx - view.scale / 2;
  const xmax = view.cx + view.scale / 2;
  const aspect = H / W;
  const ymin = view.cy - (view.scale * aspect) / 2;
  const ymax = view.cy + (view.scale * aspect) / 2;

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      // Mapeo a plano complejo
      const a0 = map(x, 0, W, xmin, xmax);
      const b0 = map(y, 0, H, ymin, ymax);

      let a = 0, b = 0;
      let n = 0;
      while (n < view.maxIter) {
        const aa = a * a - b * b + a0;
        const bb = 2 * a * b + b0;
        a = aa;
        b = bb;
        if (a * a + b * b > 4) break;
        n++;
      }
      const idx = 4 * (x + y * W);

      let col;
      if (n === view.maxIter) {
        col = color(0); // interior: negro
      } else {
        // Suavizado simple
        const smooth = n - Math.log(Math.log(a * a + b * b)) / Math.log(2.0);
        const t = constrain(smooth / view.maxIter, 0, 1);
        col = palettes[paletteIndex](t);
      }
      pixels[idx] = red(col);
      pixels[idx + 1] = green(col);
      pixels[idx + 2] = blue(col);
      pixels[idx + 3] = 255;
    }
  }
  updatePixels();
}

// ============ Interacción ============

function keyPressed() {
  if (key === '1') { mode = "sierpinski"; redraw(); }
  if (key === '2') { mode = "mandelbrot"; redraw(); }

  if (mode === "sierpinski") {
    if (key === 'W' || key === 'w') { depth = min(depth + 1, 9); redraw(); }
    if (key === 'S' || key === 's') { depth = max(depth - 1, 0); redraw(); }
  }

  if (key === 'R' || key === 'r') { resetView(); }
}

function mousePressed() {
  if (mode === "mandelbrot") {
    isDragging = true;
    lastMouse = createVector(mouseX, mouseY);
  } else {
    // En Sierpinski usamos el click para alternar paleta
    nextPalette();
  }
}

function mouseDragged() {
  if (mode !== "mandelbrot" || !isDragging) return;

  // Mover el centro según arrastre
  const W = width;
  const H = height;
  const dx = (mouseX - lastMouse.x) / W * view.scale;
  const dy = (mouseY - lastMouse.y) / W * view.scale; // usar W para mantener proporción
  view.cx -= dx;
  view.cy -= dy;
  lastMouse.set(mouseX, mouseY);
  redraw();
}

function mouseReleased() {
  isDragging = false;
}

function mouseWheel(e) {
  if (mode !== "mandelbrot") return;
  // Zoom hacia el mouse: convertimos el punto a coords complejas
  const zoomFactor = e.delta > 0 ? 1.15 : 1 / 1.15;

  const W = width;
  const H = height;
  const xmin = view.cx - view.scale / 2;
  const ymin = view.cy - (view.scale * H / W) / 2;
  const ax = map(mouseX, 0, W, xmin, xmin + view.scale);
  const ay = map(mouseY, 0, H, ymin, ymin + view.scale * H / W);

  view.cx = ax + (view.cx - ax) * zoomFactor;
  view.cy = ay + (view.cy - ay) * zoomFactor;
  view.scale *= zoomFactor;
  view.maxIter = floor(constrain(view.maxIter * (e.delta > 0 ? 0.98 : 1.02), 60, 500));
  redraw();
}

function nextPalette() {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  redraw();
}

function resetView() {
  if (mode === "mandelbrot") {
    view = { cx: -0.5, cy: 0.0, scale: 3.0, maxIter: 120 };
  } else {
    depth = 5;
  }
  redraw();
}

// HUD
function drawHUD() {
  noStroke();
  fill(0, 120);
  rect(10, height - 70, 320, 60, 8);

  fill(255);
  textSize(12);
  textLeading(16);
  const lines = [
    `Modo: ${mode === 'sierpinski' ? 'Sierpinski (W/S profundidad)' : 'Mandelbrot (Rueda/Arrastrar)'}`,
    `Profundidad: ${depth} | Iteraciones: ${view.maxIter}`,
    `Paleta: ${paletteIndex + 1}/${palettes.length}  ·  R para reiniciar`,
  ];
  let y = height - 50;
  for (const ln of lines) {
    text(ln, 20, y);
    y += 16;
  }
}
