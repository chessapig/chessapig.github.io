const S = 120;    // pixels per unit
const PLANE = SAND;
const LW_POLY = 4; // polygon line width

let pts = [];
let hov = [], drag = null; // hov: [{i, s}], drag: {hits, c0, p0}
let bg, kSlider, kOut, dirty = true;   // bg: the island, painted by POLY_ISLAND_FRAG (../island.js)

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  pts = [0, 1, 2].map(i => [Math.cos(i * PI / 3), Math.sin(i * PI / 3)]);   // a regular hexagon
  kSlider = createSlider(0, 2, 0, 0.001).style('width', '160px');
  kOut = uiReadout();
  uiRow(kSlider, kOut);
  uiHint('drag the lines to change K  ·  double click to add/remove lines');
  kSlider.input(() => { dirty = true; redraw(); });
  alloc();
  noLoop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); alloc(); dirty = true; redraw(); }

function alloc() {
  if (bg) bg.g.remove();
  bg = shaderLayer(width, height, POLY_ISLAND_FRAG);
  dirty = true;
}

const toPx = ([x, y]) => [width / 2 + x * S, height / 2 - y * S];
const toZ = (px, py) => [(px - width / 2) / S, (height / 2 - py) / S];


function draw() {
  const k = Math.round(10 ** kSlider.value());
  if (!width || !height) return;
  if (bg.g.width !== width || bg.g.height !== height) alloc();
  if (dirty) { field(k); dirty = false; }
  image(bg.g, 0, 0);
  kOut.html('k = ' + k);

  // planes through ±p_i perpendicular to p_i
  const D = 2 * (width + height) / S;
  drawLines(pts, toPx, D, hov, drag);

  // polygon {x : |<x, b_i>| <= 1}
  stroke(PLANE); strokeWeight(LW_POLY); strokeJoin(ROUND); noFill();
  beginShape();
  for (const q of polygon(D)) vertex(...toPx(q));
  endShape(CLOSE);
}

// clip a square of half-width D by the half-planes ±<x, b_i> <= 1
function polygon(D) {
  let P = [[-D, -D], [D, -D], [D, D], [-D, D]];
  for (const [a, b] of pts.map(dual)) {
    for (const s of [1, -1]) {
      const h = q => 1 - s * (q[0] * a + q[1] * b);
      const out = [];
      P.forEach((q, j) => {
        const r = P[(j + 1) % P.length], hq = h(q), hr = h(r);
        if (hq >= 0) out.push(q);
        if ((hq >= 0) !== (hr >= 0)) { const t = hq / (hq - hr); out.push([q[0] + t * (r[0] - q[0]), q[1] + t * (r[1] - q[1])]); }
      });
      P = out;
    }
  }
  return P;
}

// the island of log(sum_i <x, b_i>^(2k)) / sqrt(k)
function field(k) {
  paintShader(bg, { uSize: [width, height], uS: S, uK: k, ...polyUniforms(pts.map(dual)) });
}

const hit = () => hitLines(pts, toZ(mouseX, mouseY), LINE_HIT / S);

const onCanvas = e => !e || e.target.tagName === 'CANVAS';

// touch (../../libraries/sketch-touch.js, ../lines.js): one finger drags a line
function touchGrab() { return hit().length > 0; }

function mouseMoved() {
  const h = hit();
  if (lineKey(h) !== lineKey(hov)) { hov = h; redraw(); }
}
function mousePressed(e) {
  const hits = onCanvas(e) ? hit() : [];
  drag = hits.length ? startLineDrag(pts, hits, toZ(mouseX, mouseY)) : null;
  redraw();
}
function mouseDragged() {
  if (!drag) return;
  pts = dragLines(pts, drag, toZ(mouseX, mouseY));
  dirty = true; redraw();
}
function mouseReleased() { drag = null; redraw(); }
function doubleClicked(e) {
  if (!onCanvas(e)) return;
  const hs = hit();
  if (hs.length) [...new Set(hs.map(h => h.i))].sort((a, b) => b - a).forEach(i => pts.splice(i, 1));
  else pts.push(toZ(mouseX, mouseY));
  drag = null; hov = []; dirty = true;
  redraw();
}
