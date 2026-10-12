// Polar product P × P° in R^2_x × R^2_p, where P = {x : |<x, b_i>| <= 1} and P° = conv(±b_i).
// Its 2-skeleton is projected onto a plane chosen by four Grassmannian selectors:
// selector k sits at (<e_k, u>, <e_k, v>), where (u, v) is an orthonormal frame of the screen plane.

// Both colors come from the presets in ../island.js (GREEN0, FLOWER_EDGE, FLOWER_CENTER), so editing those updates this sketch.
const PINK_MIX = 0.5;   // 0: the flower's edge color .. 1: its center color
const PINK_SAT = 0.5;   // extra saturation: how far each channel moves from the gray average (0: none)
const saturate = (c, k) => { const g = (c[0] + c[1] + c[2]) / 3; return c.map(x => x + (x - g) * k); };
const GREEN = GREEN0, BLUE = saturate(mix(FLOWER_EDGE, FLOWER_CENTER, PINK_MIX), PINK_SAT), BG = OCEAN1, INK = SAND;
const SEL_COLORS = [GREEN, GREEN, BLUE, BLUE];
const FACE_COLORS = [GREEN, BLUE, INK]; // P × {w}, {v} × P°, edge × edge
const HIT = 14;      // hit radius (px)
const THICK = 6;     // extra edge width of a face seen edge-on (px)
const FILL_A = 150;  // fill alpha of a face seen edge-on
const CUT = 0.9999;  // feasibility cutoff for held selectors

let sel = [];              // 4 rows [x, y]
let editor;                // the polar polygon editor (../polar polygon/polar.js)
let poly = null;           // {faces, R}
let drag = null;           // {i}: dragging selector i
let disk, view, panels;   // panels: the polyhedra, the view circle, the dual selector

function setup() {
  createCanvas(windowWidth, windowHeight);
  sel = [0.3, 2.4, 3.6, 5.6].map(t => [0.7 * Math.cos(t), 0.7 * Math.sin(t)]);
  orthonormalize([]);
  editor = new PolarEditor({ colorP: GREEN, colorDual: BLUE, colorInk: INK, onChange: ed => (poly = build(ed.V, ed.W)) });
  layout();
  uiHint('drag the selectors to choose the plane  ·  drag ±bᵢ to change P  ·  double-click to add / remove bᵢ');
  noLoop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); layout(); redraw(); }

// left panel: the polyhedra; right panel: the view circle and the dual selector (P°), split again the same way
function layout() {
  const [left, right] = splitRect({ x: 0, y: 0, w: width, h: height }).rects;
  const [top, bottom] = splitRect(right).rects;
  panels = [left, top, bottom];
  disk = { cx: top.x + top.w / 2, cy: top.y + top.h / 2, r: Math.min(top.w, top.h) * 0.38 };
  editor.rect = bottom;
  editor.halfWidth = 1.8 / 0.84; // fit ±1.8 units in the middle 84% of the window
  view = { cx: left.x + left.w / 2, cy: left.y + left.h / 2, r: Math.min(left.w, left.h) * 0.44 };
}

/////////////////////////
// GEOMETRY
/////////////////////////

// 2-faces of P × P°, from the vertices V of P and W of P° (V_j is dual to the edge W_j W_{j+1})
function build(V, W) {
  const n = W.length;
  const unit = ([a, b]) => { const r = Math.hypot(a, b); return [a / r, b / r]; };
  const X = ([a, b]) => [a, b, 0, 0], Pm = ([a, b]) => [0, 0, a, b];
  const pt = (i, j) => [...V[i % n], ...W[j % n]];
  const faces = [];
  for (let j = 0; j < n; j++) // P × {W_j}
    faces.push({ fam: 0, pts: V.map((_, i) => pt(i, j)), e: [1, 0, 0, 0], f: [0, 1, 0, 0] });
  for (let i = 0; i < n; i++) // {V_i} × P°
    faces.push({ fam: 1, pts: W.map((_, j) => pt(i, j)), e: [0, 0, 1, 0], f: [0, 0, 0, 1] });
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) // edge × edge
    faces.push({
      fam: 2, pts: [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)],
      e: X(unit([V[(i + 1) % n][0] - V[i][0], V[(i + 1) % n][1] - V[i][1]])),
      f: Pm(unit([W[(j + 1) % n][0] - W[j][0], W[(j + 1) % n][1] - W[j][1]])),
    });
  const R = Math.max(...V.flatMap(v => W.map(w => Math.hypot(...v, ...w))));
  return { faces, R };
}

/////////////////////////
// GRASSMANNIAN SELECTORS
/////////////////////////

// symmetric 2x2 [[a, b], [b, d]] -> g(it), via its eigendecomposition
function symFn([[a, b], [, d]], g) {
  const m = (a + d) / 2, r = Math.hypot((a - d) / 2, b);
  const l1 = m + r, l2 = m - r;
  let ex = 1, ey = 0;
  if (r > 1e-12) {
    const p = [b, l1 - a], q = [l1 - d, b];
    [ex, ey] = Math.hypot(...p) > Math.hypot(...q) ? p : q;
    const s = Math.hypot(ex, ey); ex /= s; ey /= s;
  }
  const g1 = g(l1), g2 = g(l2);
  return [[g1 * ex * ex + g2 * ey * ey, (g1 - g2) * ex * ey], [(g1 - g2) * ex * ey, g1 * ey * ey + g2 * ex * ex]];
}
const mul = (A, B) => [0, 1].map(i => [0, 1].map(j => A[i][0] * B[0][j] + A[i][1] * B[1][j]));
const gram = rows => rows.reduce((G, [x, y]) => [[G[0][0] + x * x, G[0][1] + x * y], [G[1][0] + x * y, G[1][1] + y * y]], [[0, 0], [0, 0]]);

// Move the free rows as little as possible (in L^2) so that the frame is orthonormal again, holding the rows in `held`.
// Free rows A go to A H with H = G^½ (G^½ AᵀA G^½)^-½ G^½, where G = I - (held gram).
function orthonormalize(held) {
  let G0 = gram(held.map(k => sel[k]));
  const top = (G0[0][0] + G0[1][1]) / 2 + Math.hypot((G0[0][0] - G0[1][1]) / 2, G0[0][1]);
  if (top > CUT) {
    const s = Math.sqrt(CUT / top);
    for (const k of held) sel[k] = [sel[k][0] * s, sel[k][1] * s];
    G0 = gram(held.map(k => sel[k]));
  }
  const free = [0, 1, 2, 3].filter(k => !held.includes(k));
  const G = [[1 - G0[0][0], -G0[0][1]], [-G0[1][0], 1 - G0[1][1]]];
  const sG = symFn(G, l => Math.sqrt(Math.max(l, 0)));
  const C = mul(mul(sG, gram(free.map(k => sel[k]))), sG);
  const iC = symFn(C, l => 1 / Math.sqrt(Math.max(l, 0) + 1e-10));
  const Hm = mul(mul(sG, iC), sG);
  const next = free.map(k => { const [x, y] = sel[k]; return [x * Hm[0][0] + y * Hm[1][0], x * Hm[0][1] + y * Hm[1][1]]; });
  if (next.flat().every(Number.isFinite)) free.forEach((k, j) => (sel[k] = next[j]));
}

/////////////////////////
// DRAWING
/////////////////////////

function draw() {
  background(BG);
  drawProjection();
  drawDisk();
  editor.draw();
  stroke(INK[0], INK[1], INK[2], 120); strokeWeight(1);
  for (const { x, y, w, h } of panels.slice(1)) { line(x, y, x + w, y); line(x, y, x, y + h); }
}

function drawProjection() {
  if (!poly) return;
  const u = sel.map(r => r[0]), v = sel.map(r => r[1]);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const s = view.r / poly.R;
  const px = X => [view.cx + s * dot(u, X), view.cy - s * dot(v, X)];

  // a ∈ [0, 1]: angle between the face and the screen, as a fraction of a right angle
  const items = poly.faces.map(F => {
    const det = dot(u, F.e) * dot(v, F.f) - dot(u, F.f) * dot(v, F.e);
    return { F, a: Math.acos(Math.min(1, Math.abs(det))) / HALF_PI };
  }).sort((p, q) => p.a - q.a);

  // faces fade in as they turn toward the screen, their edges as they turn away
  const shape = F => { beginShape(); for (const X of F.pts) vertex(...px(X)); endShape(CLOSE); };
  noStroke();
  for (const { F, a } of items) {
    const c = FACE_COLORS[F.fam];
    fill(c[0], c[1], c[2], FILL_A * (1 - a));
    shape(F);
  }
  noFill(); strokeJoin(ROUND);
  // sand edges first, so the green and blue edges sit on top
  for (const { F, a } of [...items.filter(i => i.F.fam === 2), ...items.filter(i => i.F.fam !== 2)]) {
    const c = FACE_COLORS[F.fam];
    stroke(c[0], c[1], c[2], 255 * a ** 2);
    strokeWeight(1 + THICK * a ** 4);
    shape(F);
  }
}

function drawDisk() {
  const { cx, cy, r } = disk;
  noFill(); stroke(INK); strokeWeight(2);
  circle(cx, cy, 2 * r);
  sel.forEach(([x, y], k) => {
    const c = mix(SEL_COLORS[k], [255, 255, 255], 0.4);
    stroke(c); strokeWeight(2);
    line(cx + r * x, cy - r * y, cx - r * x, cy + r * y);
  });
  sel.forEach(([x, y], k) => {
    const c = SEL_COLORS[k], hot = drag && drag.i === k;
    stroke(255); strokeWeight(hot ? 2.5 : 1.5); fill(c);
    circle(cx + r * x, cy - r * y, hot ? 18 : 14);
  });
}

/////////////////////////
// MOUSE INTERACTION
/////////////////////////

const onCanvas = e => !e || e.target.tagName === 'CANVAS';

// touch (../../libraries/sketch-touch.js): one finger drags a selector or a handle
function touchGrab() {
  const nearSel = sel.some(([x, y]) => dist(mouseX, mouseY, disk.cx + disk.r * x, disk.cy - disk.r * y) < HIT * touchHit);
  return nearSel || (editor.contains(mouseX, mouseY) && !!editor.hitHandle(mouseX, mouseY));
}

function mousePressed(e) {
  drag = null;
  if (!onCanvas(e)) return;
  if (dist(mouseX, mouseY, disk.cx, disk.cy) < disk.r + 2 * HIT) {
    // closest selector
    let bd = Infinity;
    sel.forEach(([x, y], k) => {
      const d = dist(mouseX, mouseY, disk.cx + disk.r * x, disk.cy - disk.r * y);
      if (d < bd) { bd = d; drag = { i: k }; }
    });
  } else editor.pressed(mouseX, mouseY);
  redraw();
}

function mouseDragged() {
  if (!drag) { if (editor.dragged(mouseX, mouseY)) redraw(); return; }
  let x = (mouseX - disk.cx) / disk.r, y = (disk.cy - mouseY) / disk.r;
  const m = Math.hypot(x, y);
  if (m > 1) { x /= m; y /= m; }
  sel[drag.i] = [x, y];
  orthonormalize([drag.i]);
  redraw();
}

function mouseReleased() {
  if (drag) orthonormalize([]);
  drag = null;
  editor.released();
  redraw();
}

// double-clicking a selector snaps the plane onto its own space: the other color's selectors go to zero
function snapToSpace(k) {
  const own = k < 2 ? [0, 1] : [2, 3], other = k < 2 ? [2, 3] : [0, 1];
  for (const j of other) sel[j] = [0, 0];
  if (Math.hypot(...sel[own[0]], ...sel[own[1]]) < 1e-6) { sel[own[0]] = [1, 0]; sel[own[1]] = [0, 1]; }
  orthonormalize(other);
}

function doubleClicked(e) {
  if (!onCanvas(e)) return;
  const k = sel.findIndex(([x, y]) => dist(mouseX, mouseY, disk.cx + disk.r * x, disk.cy - disk.r * y) < HIT * touchHit);
  if (k >= 0) { snapToSpace(k); drag = null; redraw(); return; }
  if (editor.doubleClicked(mouseX, mouseY)) redraw();
}
