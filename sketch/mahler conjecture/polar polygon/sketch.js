// A symmetric polygon K = {x : |<x, b_i>| <= 1} (left) and its polar K° = conv(±b_i) (right), side by side.
// K is drawn with the lines <x, b_i> = ±1 (through ±p_i, p_i = b_i / |b_i|^2), dragged as in "Lp bounds" (../lines.js);
// K° has a marker at each ±b_i (its partner at -b_i moves with it). Both edit the same b_i.
// Double-click a line or a marker to remove it, or empty space to add one.
// Hovering a line or a marker highlights the same b_i in the other picture.
// Both islands are colored by their gauge: the left by the island colormap (no beach) with level sets of the gauge,
// the right by the flower colormap with an ocean background and level sets of the gauge.

const HALF = 2;          // units from the center to the nearer side of a panel
const DEPTH = 4;         // island depth at the center (gauge 0), in elevation units
const MAXP = 32;         // most pairs (the shader holds 2 MAXP corners per polygon)
const MIN_R = 0.2;       // |b_i| stays in [MIN_R, 1 / MIN_R], so neither polygon gets too big
const MARGIN = 8;        // markers stay this far inside their panel (px)
const HIT = 12;          // marker hit distance (px)
const MARK_R = 5;
const LW_EDGE = 3, LW_EDGE_HOT = 4.5, LW_EDGE_DRAG = 6;   // the parts of the lines that bound K: plain, hovered, dragged (px)

let bs = [];             // the b_i (each stands for ±b_i)
let poly = [null, null]; // counterclockwise corners of K and K°
let hov = null;          // {panel: 0, kind: 'lines', hits} | {panel: 1, kind: 'marker', i, s}
let drag = null;         // {panel: 0, hits, c0, p0} (a line drag) | {panel: 1, i, s} (dragging the marker s b_i)
let PW, PH, S, stacked;
let glG, sh;

// ---- geometry ----

const clampR = ([a, b]) => {
  const r = Math.hypot(a, b), t = r < 1e-12 ? 0 : constrain(r, MIN_R, 1 / MIN_R) / r;
  return r < 1e-12 ? [MIN_R, 0] : [a * t, b * t];
};

// set the b_i if they give a bounded K; returns whether they did
function setBs(m) {
  if (m.length > MAXP) return false;
  m = m.map(clampR);
  const pp = PolarEditor.polar(m);   // W = conv(±b_i) = K°, V = its polar K
  if (!pp) return false;
  bs = m; poly = [pp.V, pp.W];
  return true;
}


// ---- layout ----

function layout() {
  const sp = splitRect({ x: 0, y: 0, w: width, h: height });
  stacked = sp.stacked; PW = sp.rects[0].w; PH = sp.rects[0].h;
  S = Math.min(PW, PH) / 2 / HALF;
}

const origin = n => (n === 0 ? [0, 0] : stacked ? [0, PH] : [PW, 0]);
const toPx = (n, [x, y]) => { const [ox, oy] = origin(n); return [ox + PW / 2 + x * S, oy + PH / 2 - y * S]; };
const toZ = (n, px, py) => { const [ox, oy] = origin(n); return [(px - ox - PW / 2) / S, (oy + PH / 2 - py) / S]; };
const panelAt = (mx, my) => (stacked ? (my >= PH ? 1 : 0) : (mx >= PW ? 1 : 0));

// ---- GLSL ----
// One fragment shader for both panels. The gauge of each polygon is max_j <x, w_j> over the corners
// w_j of the other one (K = {x : <x, w> <= 1 for the corners w of K°}, and the other way round).

const VERT = `#version 300 es
in vec3 aPosition;
void main() {
  vec4 p = vec4(aPosition, 1.0);
  p.xy = p.xy * 2.0 - 1.0;
  gl_Position = p;
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform float uPW, uPH, uS, uH, uDens, uDepth;
uniform int uStack;
uniform vec2 uC0[${2 * MAXP}], uC1[${2 * MAXP}];   // corners of K and of K°
uniform int uN0, uN1;
${ISLAND_GLSL}
${FLOWER_GLSL}

float gauge(vec2 c[${2 * MAXP}], int n, vec2 p) {
  float g = 0.0;
  for (int j = 0; j < ${2 * MAXP}; j++) if (j < n) g = max(g, dot(c[j], p));
  return g;
}

void main() {
  vec2 q = vec2(gl_FragCoord.x, uH * uDens - gl_FragCoord.y) / uDens;   // css px, y down
  bool right = uStack == 1 ? q.y >= uPH : q.x >= uPW;
  if (right) q -= uStack == 1 ? vec2(0.0, uPH) : vec2(uPW, 0.0);
  vec2 p = vec2(q.x - 0.5 * uPW, 0.5 * uPH - q.y) / uS;

  float s = uDepth * ((right ? gauge(uC0, uN0, p) : gauge(uC1, uN1, p)) - 1.0);
  float gs = length(vec2(dFdx(s), dFdy(s))) * uDens;   // per css px
  vec3 col;
  vec4 ct;
  if (!right) {
    col = islandColor(s, false);
    ct = islandContour(s, gs, true);
  } else {
    col = s > 0.0 ? islandColor(s, false) : flowerColor(s);
    ct = flowerContour(s, gs, true);
  }
  ct.a *= step(floor(s / H + 0.5), 0.0);                // level sets on the land only: a plain ocean
  col = mix(col, ct.rgb, ct.a);
  outColor = vec4(col, 1.0);
}`;

function renderGL() {
  const d = pixelDensity();
  if (!glG || glG.width !== width || glG.height !== height || glG.pixelDensity() !== d) {
    if (glG) glG.remove();
    glG = createGraphics(width, height, WEBGL);
    glG.pixelDensity(d);
    sh = glG.createShader(VERT, FRAG);
  }
  const flat = P => { const a = P.flat(); while (a.length < 4 * MAXP) a.push(0); return a; };
  glG.shader(sh);
  sh.setUniform('uPW', PW); sh.setUniform('uPH', PH); sh.setUniform('uS', S); sh.setUniform('uH', height);
  sh.setUniform('uDens', d); sh.setUniform('uDepth', DEPTH); sh.setUniform('uStack', stacked ? 1 : 0);
  sh.setUniform('uC0', flat(poly[0])); sh.setUniform('uN0', poly[0].length);
  sh.setUniform('uC1', flat(poly[1])); sh.setUniform('uN1', poly[1].length);
  setFlowerUniforms(sh);
  glG.noStroke();
  glG.rect(0, 0, glG.width, glG.height);
}

// ---- p5 ----

function setup() {
  createCanvas(windowWidth, windowHeight);
  setBs([0, 1, 2].map(k => {
    const t = k * Math.PI / 3 + 0.3, r = [1, 1.15, 0.9][k];
    return [r * Math.cos(t), r * Math.sin(t)];
  }));
  layout();
  uiHint("Click and drag points / lines, double click to add a new pair of points / lines. ");
  noLoop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); layout(); redraw(); }

// what is highlighted: the lines of K ({i, s}) and the markers of K° (indices i, both signs)
function highlights() {
  const h = { lines: [], marks: new Set(), lineDrag: null };
  if (drag && drag.panel === 0) { h.lineDrag = drag; drag.hits.forEach(l => h.marks.add(l.i)); }
  else if (drag) { h.lineDrag = { hits: [{ i: drag.i, s: 1 }, { i: drag.i, s: -1 }] }; h.marks.add(drag.i); }
  else if (hov && hov.kind === 'lines') { h.lines = hov.hits; hov.hits.forEach(l => h.marks.add(l.i)); }
  else if (hov && hov.kind === 'marker') { h.lines = [{ i: hov.i, s: 1 }, { i: hov.i, s: -1 }]; h.marks.add(hov.i); }
  return h;
}

function draw() {
  layout();
  renderGL();
  image(glG, 0, 0, width, height);
  const h = highlights();
  for (const n of [0, 1]) {
    const [ox, oy] = origin(n);
    drawingContext.save();
    drawingContext.beginPath(); drawingContext.rect(ox, oy, PW, PH); drawingContext.clip();
    strokeCap(ROUND); strokeJoin(ROUND);
    if (n === 0) drawK(h); else drawKPolar(h);
    restoreContext();
  }
  stroke(SAND); strokeWeight(1);
  if (stacked) line(0, PH, width, PH); else line(PW, 0, PW, height);
  noStroke(); fill(SAND[0], SAND[1], SAND[2], 200); textSize(48); textAlign(LEFT, TOP);
  text('K', 14, 12); text('K°', origin(1)[0] + 14, origin(1)[1] + 12);
}

function drawK(h) {
  drawLines(bs.map(dual), z => toPx(0, z), 2 * (PW + PH) / S, h.lines, h.lineDrag);
  // the edges of K, thicker, each on the line <x, s b_i> = 1 (colored and thickened with it)
  const V = poly[0], on = (hs, i, s) => !!hs && hs.some(l => l.i === i && l.s === s);
  V.forEach((a, k) => {
    const b = V[(k + 1) % V.length];
    let i = -1, sg = 1;
    bs.forEach(([x, y], j) => {
      const ta = a[0] * x + a[1] * y, tb = b[0] * x + b[1] * y;
      if (Math.abs(Math.abs(ta) - 1) < 1e-6 && Math.abs(ta - tb) < 1e-6) { i = j; sg = Math.sign(ta); }
    });
    const dragged = h.lineDrag && h.lineDrag.hits.some(l => l.i === i);
    stroke(dragged ? LINE_ACTIVE : LINE_COLOR);
    strokeWeight(dragged ? LW_EDGE_DRAG : on(h.lines, i, sg) ? LW_EDGE_HOT : LW_EDGE);
    line(...toPx(0, a), ...toPx(0, b));
  });
}

function drawKPolar(h) {
  // markers at ±b_i, 1.5 times the size when highlighted, filled with the active color while dragged
  stroke(OCEAN1); strokeWeight(1.5);
  bs.forEach((p, i) => {
    const on = h.marks.has(i);
    fill(on && h.lineDrag ? LINE_ACTIVE : SAND);
    [1, -1].forEach(s => circle(...toPx(1, [s * p[0], s * p[1]]), 2 * MARK_R * (on ? 1.5 : 1)));
  });
}

// ---- mouse ----

function hitTest(mx, my) {
  const n = panelAt(mx, my);
  if (n === 0) {
    const hits = hitLines(bs.map(dual), toZ(0, mx, my), LINE_HIT / S);
    return hits.length ? { panel: 0, kind: 'lines', hits } : null;
  }
  let best = null, bd = HIT * touchHit;
  bs.forEach((p, i) => [1, -1].forEach(s => {
    const d = dist(mx, my, ...toPx(1, [s * p[0], s * p[1]]));
    if (d < bd) { bd = d; best = { panel: 1, kind: 'marker', i, s }; }
  }));
  return best;
}

const onCanvas = e => !e || e.target.tagName === 'CANVAS';
const hovKey = h => (!h ? '' : h.kind === 'lines' ? 'L' + lineKey(h.hits) : h.kind + h.i);

// touch (../../libraries/sketch-touch.js): one finger drags a line or a marker
function touchGrab() { return !!hitTest(mouseX, mouseY); }

function mouseMoved() {
  const h = hitTest(mouseX, mouseY);
  if (hovKey(h) !== hovKey(hov)) { hov = h; redraw(); }
}

function mousePressed(e) {
  if (!onCanvas(e)) return;
  const h = hitTest(mouseX, mouseY);
  if (h && h.kind === 'lines') drag = { panel: 0, ...startLineDrag(bs.map(dual), h.hits, toZ(0, mouseX, mouseY)) };
  else if (h && h.kind === 'marker') drag = { panel: 1, i: h.i, s: h.s };
  else drag = null;
  redraw();
}

function mouseDragged() {
  if (!drag) return;
  if (drag.panel === 0) setBs(dragLines(bs.map(dual), drag, toZ(0, mouseX, mouseY)).map(dual));
  else {
    const [ox, oy] = origin(1);
    const z = toZ(1, constrain(mouseX, ox + MARGIN, ox + PW - MARGIN), constrain(mouseY, oy + MARGIN, oy + PH - MARGIN));
    const m = bs.slice();
    m[drag.i] = [drag.s * z[0], drag.s * z[1]];
    setBs(m);
  }
  redraw();
}

function mouseReleased() {
  if (!drag) return;
  drag = null;
  hov = hitTest(mouseX, mouseY);
  redraw();
}

// double-click a line or a marker to remove it, or empty space to add one
function doubleClicked(e) {
  if (!onCanvas(e)) return;
  const h = hitTest(mouseX, mouseY), n = panelAt(mouseX, mouseY), z = toZ(n, mouseX, mouseY);
  if (h && h.kind === 'lines') { const del = new Set(h.hits.map(l => l.i)); setBs(bs.filter((_, i) => !del.has(i))); }
  else if (h && h.kind === 'marker') setBs(bs.filter((_, i) => i !== h.i));
  else if (Math.hypot(...z) > 1e-6) setBs([...bs, n === 0 ? dual(z) : z]);
  drag = null;
  hov = hitTest(mouseX, mouseY);
  redraw();
}
