let S = 200;      // pixels per unit (set to fit the panels)
const PLANE = SAND, ACTIVE = LINE_ACTIVE;
const LW = 1, LW_POLY = 4; // line widths
const DEPTH = 4;  // island depth at the center, in level units
const SCALE = 0.15; // the one size knob, in every mode: the lattice's average spacing as a fraction of the panel size (the flowers scale with it)
const FILL = 0.75; // tile size as a fraction of the size that tiles with no gaps
const SYM_GAP = 0.7;  // symplectic: the polar bodies as a fraction of the tiles (1: they touch)
const SEL_R = 7, SEL_HIT = 12; // selector radius and hit distance (px)
const SINGLE_PANEL = ['polar']; // modes with just the one panel: no second panel, and no selector (magnifying glass)

let pts = [];
let hov = [], drag = null; // hov: [{i, s}], drag: {hits, c0, p0}
let zoom1 = 1, zoom2 = 1, panX = 0, panY = 0;   // scroll zooms the panel under the mouse (the first about the cursor, the second about 0); drag pans the first
let S1 = 200, S2 = 200, OX = 0, OY = 0, panDrag = null;
let latO = [0, 0];   // the lattice point that stays fixed: the lattice scales about the mouse when zooming
// the active panel's view: pixels per unit and the pixel offset of 0 from the panel center
// the center of the first panel's view is locked inside the body K: the hexagon of the face lines, or the 2n-ellipse in limit mode.
// If panning or zooming would take it outside, it is moved radially back onto the boundary.
const viewInside = z => (modeSel.value() === 'limit' ? limBody().F(z[0], z[1]) < 0 : pts.map(dual).every(([a, b]) => Math.abs(a * z[0] + b * z[1]) < 1));
const clampPan = () => {
  const c = [-panX / S1, panY / S1];                         // the world point at the center of the panel
  if (viewInside(c)) return;
  let lo = 0, hi = 1;                                       // the origin is inside K: bisect along the ray to c
  for (let i = 0; i < 30; i++) { const mid = 0.5 * (lo + hi); if (viewInside([c[0] * mid, c[1] * mid])) lo = mid; else hi = mid; }
  panX = -c[0] * lo * S1; panY = c[1] * lo * S1;
};
const usePanel = n => { if (n === 1) { S = S1; OX = panX; OY = panY; } else { S = S2; OX = 0; OY = 0; } };
let PW, PH, stacked; // panel size; the first panel (hexagon) is top-left, the second (comparison shape)
                     // is to its right, or below it when stacked (whichever makes the panels squarer)
let glG, sh;        // WEBGL buffer that the island scene is rendered into, and its shader
let mReady = false, mTex, mShader;   // the lens-height texture and the pass that fills it
let gxTex, gTex, jTex, invTex, jShader, invShader, gData, tablesK = 0;   // symplectic mode: g table, J_k table, its inverse, and the k they hold
let hintRow;   // the instructions; for the two-panel modes only (the single-panel ones have no magnifier)
const HINTS = {
  lines: 'drag the lines to change K  ·  scroll/drag to move camera  ·  click/drag magnifier to move focus  ·  shift click to summon magnifier',
  limit: 'drag the foci to change K  ·  double-click to add / remove a pair of foci  ·  scroll/drag to move camera  ·  click/drag magnifier to move focus  ·  shift click to summon magnifier',
};
let modeSel, kSlider, kOut, kRow; // mode: 'polar' tiles with the dual, 'non-polar' with the hexagon itself,
                      // 'approximate' with level sets of rho; kSlider: k = 10^value in rho
let sel = [0.25, 0.15], dragSel = false; // selector (may leave the hexagon)
let tSlider, tOut, tRow, playBtn, polarBox, polarRow;   // symplectic mode: t moves each point eta linearly to Phi(eta); outlines of the polar body Phi(D_x)
let playing = false, playS = 0, playDir = 1, playLast = 0;   // the animation of t (see startPlay)

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  pts = [0, 1, 2].map(i => {
    const t = (i * PI) / 3 + 0.3, r = [1, 1.15, 0.9][i];
    return [r * Math.cos(t), r * Math.sin(t)];
  });
  modeSel = createSelect();
  modeSel.option('polar'); modeSel.option('non-polar'); modeSel.option('approximate'); modeSel.option('symplectic'); modeSel.option('lens approximate'); modeSel.option('limit');
  modeSel.changed(() => redraw());
  const modeRow = uiRow(modeSel);
  if (window.FIXED_MODE) { modeSel.selected(FIXED_MODE); modeRow.style.display = 'none'; }   // one mode per page (see load.js)
  kSlider = createSlider(0, 2, 1, 0.001).style('width', '160px');
  kOut = uiReadout();
  kRow = uiRow(kSlider, kOut);
  kSlider.input(() => redraw());
  tSlider = createSlider(0, 1, 1, 0.001).style('width', '160px');
  tOut = uiReadout();
  playBtn = createButton('▶ play');
  tRow = uiRow(tSlider, tOut, playBtn);
  tSlider.input(() => { stopPlay(); redraw(); });   // dragging the slider takes over from the animation
  playBtn.mousePressed(() => (playing ? stopPlay() : startPlay()));
  polarBox = createCheckbox('outline the polar body', false);
  polarRow = uiRow(polarBox);
  polarBox.changed(() => redraw());
  hintRow = uiHint(HINTS.lines);
  alloc();
  noLoop();
}

// Play button: t sweeps 0 -> 1 -> 0 -> ..., t = (1 - cos(pi s)) / 2 for s moving at a constant speed up and down between 0 and 1,
// so it eases in and out at both extremes (as in ../radial density/sketch.js)
const PLAY_SECONDS = 4;   // one sweep, 0 -> 1
function startPlay() {
  playS = Math.acos(1 - 2 * tSlider.value()) / Math.PI;
  if (playS >= 1) playDir = -1; else if (playS <= 0) playDir = 1;
  playing = true; playLast = performance.now();
  playBtn.html('⏸ pause');
  requestAnimationFrame(playStep);
}
function stopPlay() {
  if (!playing) return;
  playing = false;
  playBtn.html('▶ play');
}
function playStep(now) {
  if (!playing) return;
  playS += playDir * Math.min(0.1, (now - playLast) / 1000) / PLAY_SECONDS;   // (a long pause, e.g. a hidden tab, is not caught up)
  playLast = now;
  if (playS >= 1) { playS = 1; playDir = -1; } else if (playS <= 0) { playS = 0; playDir = 1; }
  tSlider.value((1 - Math.cos(Math.PI * playS)) / 2);
  redraw();
  requestAnimationFrame(playStep);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); alloc(); redraw(); }

function layout() {
  const sp = splitRect({ x: 0, y: 0, w: width, h: height });
  if (single()) { stacked = false; PW = width; PH = height; }
  else { stacked = sp.stacked; PW = sp.rects[0].w; PH = sp.rects[0].h; }
  S1 = Math.min(PW, PH) / 3 * zoom1; S2 = Math.min(PW, PH) / 3 * zoom2;
  clampPan(); usePanel(1);
}

function alloc() {
  layout();
  glG = createGraphics(width, height, WEBGL);
  glG.pixelDensity(1);
  sh = glG.createShader(VERT_GLSL, FRAG);
  mTex = glG.createFramebuffer({ width: LENS_N, height: 1, density: 1, format: FLOAT, channels: RGBA, depth: false, antialias: false, textureFiltering: LINEAR });
  mShader = glG.createShader(VERT_GLSL, M_PASS_FRAG); mReady = false;   // rendered by renderGL
  const fbo = (w, h, o) => glG.createFramebuffer({ width: w, height: h, density: 1, format: FLOAT, channels: RGBA, depth: false, antialias: false, ...o });
  gTex = null; gxTex = null; tablesK = 0;                                          // uploaded and rendered lazily by ensureSymTables
  jTex = fbo(SYM.NA, SYM.NC, { textureFiltering: LINEAR });   // read with texelFetch by the inverse pass, filtered by sympNt
  invTex = fbo(SYM.NA, SYM.NV, { textureFiltering: LINEAR });
  jShader = glG.createShader(VERT_GLSL, J_PASS_FRAG); invShader = glG.createShader(VERT_GLSL, INV_PASS_FRAG);
}

const single = () => SINGLE_PANEL.includes(modeSel.value());
const toPx = ([x, y]) => [PW / 2 + OX + x * S, PH / 2 + OY - y * S];
const toZ = (px, py) => [(px - PW / 2 - OX) / S, (PH / 2 + OY - py) / S];
const inFirst = () => mouseX < PW && mouseY < PH; // mouse is in the first (hexagon) panel

// b_i = p_i / |p_i|^2; the hexagon is {x : |<x, b_i>| <= 1}
const gauge = (x, y, B) => Math.max(...B.map(([a, b]) => Math.abs(x * a + y * b)));

// ---- GLSL ----
// The whole picture is one fragment shader. Pixels in the first panel (top-left) are the left panel: the base island
// (the hexagon K) with, on top, the small tiles. A pixel first finds the lattice point c whose tile
// contains it (the tile gauge of p - c is smallest), and shades the tile's island there. Tiles
// are transparent outside their shore. The right panel is a single island.
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform float uPW, uPH, uS, uS2, uDepth, uFill, uSc, uK, uOutW;
uniform vec2 uOff;              // pan of the first panel, in pixels (y down)
uniform int uMode, uNE, uPNE, uStack, uPolar;   // uPolar: outline the polar bodies (symplectic mode)  // mode: 0 polar, 1 non-polar, 2 approximate, 3 symplectic, 4 lens, 5 limit
uniform vec2 uSel, uL0, uL1, uLO;   // uLO: the lattice point that stays fixed
uniform vec2 uKB[120];          // limit mode: the supporting hyperplanes b_j of K; the symmetric gauge is max_j |<b_j, x>|
uniform sampler2D uGx;          // lens approximate mode: |g|^2 (R) continued a little past the lens boundary, symExt of symplectic.js; g: lens -> unit disc
${SYMPLECTIC_GLSL}
uniform vec3 uE[6], uPE[6];    // edges (nx, ny, h) of a tile (about its center) and of the right panel's shape
${ISLAND_GLSL}
${FLOWER_GLSL}
${POLY_GLSL}

// limit mode: the gauge of K and -K together, for the island
float limitGauge(vec2 p) {
  float g = 0.0;
  for (int j = 0; j < 120; j++) g = max(g, abs(dot(uKB[j], p)));
  return g;
}

float gaugeK(vec2 p) { return uMode == 5 ? limitGauge(p) : gaugeB(p); }

float edgeGauge(vec3 e[6], int n, vec2 q) {
  float g = -1e9;
  for (int i = 0; i < 6; i++) if (i < n) g = max(g, dot(e[i].xy, q) / e[i].z);
  return g;
}

// lens approximate mode: at the real point x (a_j = <b_j, x>) and the imaginary part e (c_j = <b_j, e>), the point a_j + i c_j lies in the lens
// for all j exactly when e is in D_x, and the L^2k approximation of D_x is {F <= 1} with F = sum_j |g(a_j + i c_j)|^2k, g: lens -> unit disc.
// N = F^(1/2k) (1 on the boundary of {F <= 1}; k <= 0 stands for k = infinity, max_j |g(a_j + i c_j)|, whose unit ball is D_x itself).
const float GNC = ${SYM.NC}.0, GGC = ${SYM.GC};
float gAbs2(float a, float c) {   // |g(a + ic)|^2, bilinear in the table; continued a little past the lens, then held at 1.21 (also beyond the table)
  c = abs(c);
  if (abs(a) >= SGA || c >= GGC) return 1.21;
  float fi = (a + SGA) / (2.0 * SGA) * (SNA - 1.0), fj = c / GGC * (GNC - 1.0);
  int i = int(floor(fi)), j = int(floor(fj));
  float u = fi - float(i), v = fj - float(j);
  float g00 = texelFetch(uGx, ivec2(i, j), 0).x, g10 = texelFetch(uGx, ivec2(i + 1, j), 0).x;
  float g01 = texelFetch(uGx, ivec2(i, j + 1), 0).x, g11 = texelFetch(uGx, ivec2(i + 1, j + 1), 0).x;
  return mix(mix(g00, g10, u), mix(g01, g11, u), v);
}
// With outside set, the real point x may leave the hexagon (e = 0): there |g(a_j)| is continued by |a_j|, so that N (and with it the shading of the
// ocean around the island) keeps growing smoothly outward.
float lensApproxN(vec2 x, vec2 e, float k, bool outside) {
  float l[MAX_B], m = -1e30;
  for (int i = 0; i < MAX_B; i++) {
    if (i >= uNB) break;
    float a = dot(uB[i], x);
    l[i] = log((outside && abs(a) >= SGA ? a * a : gAbs2(a, dot(uB[i], e))) + 1e-30);
    m = max(m, l[i]);
  }
  if (k <= 0.0) return exp(0.5 * m);
  float t = 0.0;
  for (int i = 0; i < MAX_B; i++) { if (i >= uNB) break; t += exp(k * (l[i] - m)); }
  return exp(0.5 * (m + log(t) / k));
}

// the norm whose unit ball is the island, at the real point x and the imaginary part s (modes 2, 3, 4)
float modeN(vec2 x, vec2 s) { return uMode == 4 ? lensApproxN(x, s, uK, false) : uMode == 3 ? sympNt(x, s, uT) : approxN(x, s, uK); }   // approxN: rho^(1/2k), uK <= 0 is k = infinity
bool normMode() { return uMode == 2 || uMode == 3 || uMode == 4; }   // approximate, symplectic and lens approximate modes: the big island is the L^2k ball
float baseN(vec2 p) { return uMode == 4 ? lensApproxN(p, vec2(0.0), uK, true) : approxN(vec2(0.0), p, uK); }

// 0 at a jump of the field s = uDepth (N - 1). In symplectic mode the only jumps are to the ocean value N = 3 (N is capped below that
// elsewhere, see normN in symplectic.js), while the field itself can be very steep at the shore (t = 0, large k): only those count.
float noJump(float s) {
  float d = max(abs(dFdx(s)), abs(dFdy(s)));
  return uMode == 3 ? step(s + d, 1.75 * uDepth) : step(d, 1.5);
}

void main() {
  // the first panel is top-left; the second is to its right, or below it when stacked
  bool right = uStack == 1 ? gl_FragCoord.y < uPH : gl_FragCoord.x >= uPW;
  vec2 q = right ? (uStack == 1 ? gl_FragCoord.xy : vec2(gl_FragCoord.x - uPW, gl_FragCoord.y))
                 : (uStack == 1 ? vec2(gl_FragCoord.x, gl_FragCoord.y - uPH) : gl_FragCoord.xy);
  vec2 cen = 0.5 * vec2(uPW, uPH) + (right ? vec2(0.0) : vec2(uOff.x, -uOff.y));
  vec2 p = (q - cen) / (right ? uS2 : uS);

  // base island: the hexagon (left), or the comparison shape (right)
  float s; bool beach = false, landLevels = false;
  if (!right) { s = uDepth * ((normMode() ? baseN(p) : gaugeK(p)) - 1.0); landLevels = true; }  // L^2k norm when rounding; contours on the land too
  else if (uMode >= 2) { s = uDepth * (modeN(uSel, p) - 1.0); landLevels = true; }
  else s = uDepth * (edgeGauge(uPE, uPNE, p) - 1.0);
  float gs = length(vec2(dFdx(s), dFdy(s)));
  // the left panel is the island colormap, the right panel (and the tiles) the flower colormap
  // right panel background: flat, the left island's background color (no contours) at the selector
  vec3 flatBg = islandColor(uDepth * ((normMode() ? baseN(uSel) : gaugeK(uSel)) - 1.0), false);
  vec3 col = right ? (s > 0.0 ? flatBg : flowerColor(s)) : islandColor(s, beach);
  vec4 ct = right ? flowerContour(s, gs, landLevels) : islandContour(s, gs, landLevels);
  if (uMode != 4) ct.a *= noJump(s);    // no lines at jumps of the field (the edge of the image of Phi; lens approximate has none)
  if ((uMode == 3 || uMode == 4) && right) ct.a *= step(s, 0.05);   // symplectic and lens approximate: only the unit ball {F <= 1}, no levels beyond it
  col = mix(col, ct.rgb, ct.a);

  // tiles: which lattice cell is p in?
  float det = uL0.x * uL1.y - uL0.y * uL1.x;
  if (abs(det) < 1e-12) det = 1.0;
  vec2 pl = p - uLO;
  vec2 t0 = floor(vec2(pl.x * uL1.y - pl.y * uL1.x, uL0.x * pl.y - uL0.y * pl.x) / det + 0.5);
  float best = 1e9;
  vec2 c = vec2(0.0);
  for (int di = -2; di <= 2; di++)
    for (int dj = -2; dj <= 2; dj++) {
      vec2 cc = uLO + (t0.x + float(di)) * uL0 + (t0.y + float(dj)) * uL1;
      float g = edgeGauge(uE, uNE, p - cc);
      if (g < best) { best = g; c = cc; }
    }
  float gt = best / uFill;
  float st = uDepth * (gt - 1.0);
  if (uMode == 3) st = uDepth * (modeN(c, (p - c) / uSc) - 1.0);          // symplectic: the whole polar cell, not shrunk by FILL
  else if (uMode >= 2) st = max(st, uDepth * (modeN(c, (p - c) / uSc) - 1.0));
  // transparent above the shore (past its border): coverage from distance to the shore, in pixels
  float gst = max(length(vec2(dFdx(st), dFdy(st))), 1e-6);
  float jumpOk = uMode == 4 ? 1.0 : noJump(st);   // jumps of the field are not shorelines (lens approximate has none)
  float a = clamp(0.5 - st / gst + 0.5 * FL_BORDER_W, 0.0, 1.0);
  a *= step(gt, uMode == 3 ? 1.0 / uFill : 1.0 + 0.5 * (1.0 / uFill - 1.0));   // no seam artifacts at cell boundaries
  a *= step(normMode() ? baseN(c) : gaugeK(c), 1.0 - 1e-9) * step(0.5, float(uNE)) * (right ? 0.0 : 1.0);
  a *= jumpOk;
  vec3 tcol = mix(flowerColor(min(st, 0.0)), FL_LINE, flowerBorder(st, gst));
  col = mix(col, tcol, a);

  // symplectic: sand outline of the polar body conv{+-b_j}, scaled by pi/4 (J_k(a + i m(a)) / k -> pi/4: the image of D_x as k -> infinity)
  if (uMode == 3 && uPolar == 1) {
    float pg = polarGauge((right ? p : (p - c) / uSc) / PI4);
    float cov = lineCover(abs(pg - 1.0) / max(length(vec2(dFdx(pg), dFdy(pg))), 1e-6), 1.5);
    if (!right) cov *= step(baseN(c), 1.0 - 1e-9) * step(0.5, float(uNE));
    col = mix(col, SAND, cov);
  }

  // sand outline of the big island's shore
  if (!right) col = mix(col, SAND, lineCover(abs(s) / max(gs, 1e-6), uOutW) * step(abs(s), 0.5));

  if (right && uMode == 5) col = flatBg;          // limit mode: the right panel is a flat background; its curves are drawn on the CPU
  outColor = vec4(col, 1.0);
}`;

// outward unit normal and distance from the center of each edge of a counterclockwise polygon
// about the origin, as a flat [nx, ny, h, ...] padded to 6 edges
function edges(P) {
  const out = [];
  P.forEach((a, i) => {
    const b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], r = Math.hypot(dx, dy);
    const n = [dy / r, -dx / r];
    out.push(n[0], n[1], a[0] * n[0] + a[1] * n[1]);
  });
  while (out.length < 18) out.push(0, 0, 1);
  return out;
}

// k = 10^slider, rounded; all the way to the right is k = infinity (returned as 0)
const kFinite = () => window.K_EXACT || Math.round(10 ** kSlider.value());   // (window.K_EXACT: a non-integer k, for recording smooth sweeps)
const kValue = () => kSlider.value() >= kSlider.elt.max ? 0 : kFinite();
const MODES = ['polar', 'non-polar', 'approximate', 'symplectic', 'lens approximate', 'limit'];

// the height m(a) of the lens above Re = a (used by the symplectic tables), for a = i / (LENS_N - 1) in [0, 1], rendered into mTex by a GLSL pass.
// The lens boundary is the image of the unit circle: Re = 1 - 2 theta / pi, Im = (8/pi^2) int_0^theta (1/2) ln cot(t/2) dt.
const M_PASS_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  float a = (gl_FragCoord.x - 0.5) / ${LENS_N - 1}.0, theta = 1.5707963267948966 * (1.0 - a);
  const int N = 4000;
  float h = theta / float(N), acc = 0.0;
  for (int i = 0; i < N; i++) acc += 0.5 * log(1.0 / tan(0.5 * (float(i) + 0.5) * h));
  outColor = vec4(0.8105694691387022 * acc * h, 0.0, 0.0, 1.0);
}`;

// the |g|^2 table (symplectic.js), uploaded once: used by the symplectic mode's tables and by lens approximate mode directly
function ensureG() {
  if (gTex) return;
  gData = gData || buildGTable();
  gTex = glG.createFramebuffer({ width: SYM.NA, height: SYM.NC, density: 1, format: FLOAT, channels: RGBA, depth: false, antialias: false, textureFiltering: NEAREST });
  gTex.loadPixels(); gTex.pixels.set(gData); gTex.updatePixels();
  gxTex = glG.createFramebuffer({ width: SYM.NA, height: SYM.NC, density: 1, format: FLOAT, channels: RGBA, depth: false, antialias: false, textureFiltering: NEAREST });
  gxTex.loadPixels(); gxTex.pixels.set(symExt); gxTex.updatePixels();
  tablesK = 0;
}

// symplectic mode: upload the g table once, and render J_k and its inverse (two GLSL passes) whenever k changes
function ensureSymTables(k) {
  ensureG();
  if (tablesK === k) return;
  const dc = SYM.GC / (SYM.NC - 1);
  glG.blendMode(REPLACE);      // the tables are data: no alpha blending (alpha = 0 rows would otherwise keep, and accumulate onto, the old values)
  jTex.begin(); glG.shader(jShader);
  jShader.setUniform('uG', gTex); jShader.setUniform('uM', mTex); jShader.setUniform('uK', k); jShader.setUniform('uDc', dc);
  glG.noStroke(); glG.rect(0, 0, 1, 1); jTex.end();
  invTex.begin(); glG.shader(invShader);
  invShader.setUniform('uJ', jTex); invShader.setUniform('uM', mTex); invShader.setUniform('uK', k); invShader.setUniform('uDc', dc);
  glG.noStroke(); glG.rect(0, 0, 1, 1); invTex.end();
  glG.blendMode(BLEND);
  tablesK = k;
}

// the three faces with the best-conditioned pair first (sympN solves for the third)
function bestFaces(B) {
  let best = [0, 1, 2], d = -1;
  [[0, 1, 2], [0, 2, 1], [1, 2, 0]].forEach(p => { const c = Math.abs(B[p[0]][0] * B[p[1]][1] - B[p[0]][1] * B[p[1]][0]); if (c > d) { d = c; best = p; } });
  return best.map(i => B[i]);
}

function renderGL() {
  const symplectic = modeSel.value() === 'symplectic';
  const { cell: cell0, L: L0 } = tiling(symplectic || modeSel.value() === 'lens approximate'), shape = panelShape();       // symplectic and lens approximate modes are laid out on the polar lattice
  // rescale the lattice (and the flowers with it) so its average spacing sqrt|det| is SCALE of the panel on the screen, at any zoom
  const det0 = L0 ? Math.abs(L0[0][0] * L0[1][1] - L0[0][1] * L0[1][0]) : 0;
  const lam = det0 > 1e-12 ? (window.FLOWER_SCALE || SCALE) * Math.min(PW, PH) / S1 / Math.sqrt(det0) : 1;   // (window.FLOWER_SCALE: for recordings)
  // symplectic: the flowers keep their size (FILL lam) but the lattice is tightened so that neighbouring polar bodies, outlined at
  // (pi/4) FILL lam conv{+-b_j}, almost touch (the cell lamL conv{+-b_j} tiles the plane)
  const lamL = symplectic ? FILL * lam * Math.PI / 4 / SYM_GAP : lam;
  const cell = cell0.map(q => [q[0] * lamL, q[1] * lamL]), L = L0 && L0.map(l => [l[0] * lamL, l[1] * lamL]);
  const det = L ? L[0][0] * L[1][1] - L[0][1] * L[1][0] : 0;
  if (!mReady) { mTex.begin(); glG.shader(mShader); glG.noStroke(); glG.rect(0, 0, 1, 1); mTex.end(); mReady = true; }
  if (symplectic) ensureSymTables(kFinite());
  if (modeSel.value() === 'lens approximate') ensureG();
  glG.shader(sh);
  sh.setUniform('uPW', PW); sh.setUniform('uPH', PH); sh.setUniform('uStack', stacked ? 1 : 0); sh.setUniform('uS', S1); sh.setUniform('uS2', S2); sh.setUniform('uOff', [panX, panY]);
  setFlowerUniforms(sh);
  sh.setUniform('uOutW', LW_POLY); sh.setUniform('uDepth', DEPTH); sh.setUniform('uFill', FILL); sh.setUniform('uSc', FILL * lam); sh.setUniform('uLO', latO);
  sh.setUniform('uK', symplectic ? kFinite() : kValue());  // 0 stands for infinity (not in symplectic mode: k = 100 at the right end)
  sh.setUniform('uGx', gxTex || invTex); sh.setUniform('uInv', invTex); sh.setUniform('uJt', jTex);
  sh.setUniform('uT', tSlider.value()); sh.setUniform('uPolar', symplectic && polarBox.checked() ? 1 : 0); sh.setUniform('uBs', bestFaces(pts.map(dual)).flat());
  sh.setUniform('uMode', MODES.indexOf(modeSel.value()));
  const pu = polyUniforms(pts.map(dual)); sh.setUniform('uB', pu.uB); sh.setUniform('uNB', pu.uNB);
  sh.setUniform('uSel', sel);
  sh.setUniform('uL0', L && Math.abs(det) > 1e-9 ? L[0] : [1, 0]);
  sh.setUniform('uL1', L && Math.abs(det) > 1e-9 ? L[1] : [0, 1]);
  const limit = modeSel.value() === 'limit';
  sh.setUniform('uNE', L && Math.abs(det) > 1e-9 && !limit ? cell.length : 0);
  sh.setUniform('uKB', limDualFlat());
  sh.setUniform('uE', edges(cell));
  sh.setUniform('uPNE', shape.length);
  sh.setUniform('uPE', edges(shape));
  glG.noStroke();
  glG.rect(0, 0, glG.width, glG.height);
}

function draw() {
  if (!width || !height) return;
  if (glG.width !== width || glG.height !== height) alloc();
  layout();
  const approx = modeSel.value() === 'approximate', symp = modeSel.value() === 'symplectic', lensApprox = modeSel.value() === 'lens approximate', k = symp ? kFinite() : kValue();
  const limit = modeSel.value() === 'limit';
  kRow.style.display = approx || symp || lensApprox ? '' : 'none';
  hintRow.style.display = single() ? 'none' : '';
  hintRow.firstChild.textContent = modeSel.value() === 'limit' ? HINTS.limit : HINTS.lines;
  kOut.html('k = ' + (k ? k : '∞'));
  tRow.style.display = polarRow.style.display = symp ? '' : 'none';
  tOut.html('t = ' + tSlider.value().toFixed(2));
  renderGL();
  background(0);
  image(glG, 0, 0);

  drawingContext.save();
  drawingContext.beginPath(); drawingContext.rect(0, 0, PW, PH); drawingContext.clip();

  // lines through ±p_i perpendicular to p_i (not in limit mode, which has its own body K)
  const D = 2 * (PW + PH) / S;
  if (limit) limDrawLeft();
  else drawLines(pts, toPx, D, hov, drag);

  // selector
  // a magnifying glass centered on the selected point: translucent lens, ring and handle in deep blue
  const [sx, sy] = toPx(sel), hx = sx + SEL_R * 0.7071, hy = sy + SEL_R * 0.7071;
  strokeCap(ROUND);
  drawingContext.setLineDash([]);
  if (!single()) {
    stroke(FOAM); strokeWeight(7); line(hx, hy, hx + 9, hy + 9);
    stroke(OCEAN1); strokeWeight(3.5); line(hx, hy, hx + 9, hy + 9);
    noFill(); stroke(FOAM); strokeWeight(4); circle(sx, sy, 2 * SEL_R + 1);       // white rim outside the dark ring
    noFill(); stroke(OCEAN1); strokeWeight(2); circle(sx, sy, 2 * SEL_R);          // dark ring: the lens inside it is left clear
  }
  restoreContext();

  if (limit) {                                  // right panel: the pictures at the selector's p, at actual size
    push(); translate(stacked ? 0 : PW, stacked ? PH : 0); usePanel(2);
    drawingContext.beginPath(); drawingContext.rect(0, 0, PW, PH); drawingContext.clip();
    limDrawRight(sel);
    pop(); usePanel(1);
  }

  if (single()) return;
  stroke(PLANE); strokeWeight(LW);
  if (stacked) line(0, PH, width, PH); else line(PW, 0, PW, height);
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

// A tile P is a centrally symmetric hexagon with vertices v_0..v_5 by angle (v_{k+3} = -v_k); it
// tiles the plane by the lattice L spanned by v_2 - v_0 and v_3 - v_1. P is drawn as the convex hull
// of the v's.
//   polar:     P = conv{±b_i}, the dual of the hexagon K = {|<x, b_i>| <= 1}; v = ±b_i. A v inside the
//              hull (redundant constraint) is moved radially onto its boundary before computing L, so
//              P is a parallelogram and L is continuous in the hexagon. Only the direction of the
//              redundant b_i matters.
//   non-polar: P = K itself; v = intersections of consecutive edge lines of K. A redundant face is
//              first moved in until it touches K (its support line, which passes through a corner),
//              so its two intersections land on that corner. L is then continuous in the hexagon,
//              and the distance of a redundant face has no effect at all.
function tiling(forcePolar = false) {
  const B = pts.map(dual);
  const byAngle = P => P.sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  let v, cell;
  if (forcePolar || modeSel.value() === 'polar') { // 'non-polar', 'approximate', 'symplectic' and 'lens approximate' use the hexagon's lattice
    v = byAngle(B.flatMap(([a, b]) => [[a, b], [-a, -b]]));
    cell = hull(v);
    v = v.map(p => cell.includes(p) ? p : radial(p, cell));
  } else {
    cell = hull(polygon(1e3));
    const n = byAngle(B.flatMap(([a, b]) => [[a, b], [-a, -b]])).map(([a, b]) => {
      // tighten the face to the support line of K: <x, n> = h with n a unit normal, h = max over K
      const r = Math.hypot(a, b) || 1e-12, u = [a / r, b / r];
      const h = Math.max(...cell.map(q => q[0] * u[0] + q[1] * u[1]));
      return [u[0] / h, u[1] / h];
    });
    v = n.map((p, k) => {
      const q = n[(k + 1) % 6], det = p[0] * q[1] - p[1] * q[0] || 1e-12;
      return [(q[1] - p[1]) / det, (p[0] - q[0]) / det];
    });
  }
  return { cell, L: [sub(v[2], v[0]), sub(v[3], v[1])] };
}

// the point where the ray from the origin through p meets the boundary of the convex polygon C
function radial(p, C) {
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  for (let i = 0; i < C.length; i++) {
    const a = C[i], d = [C[(i + 1) % C.length][0] - a[0], C[(i + 1) % C.length][1] - a[1]];
    const den = cross(d, p);
    if (Math.abs(den) < 1e-12) continue;
    const t = -cross(a, p) / den;
    const s = ((a[0] + t * d[0]) * p[0] + (a[1] + t * d[1]) * p[1]) / (p[0] * p[0] + p[1] * p[1]);
    if (t >= -1e-9 && t <= 1 + 1e-9 && s > 0) return [s * p[0], s * p[1]];
  }
  return p;
}

// convex hull (counterclockwise, collinear points dropped) by Andrew's monotone chain
function hull(P) {
  P = [...P].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const eps = 1e-9 * Math.max(1, ...P.map(p => Math.hypot(...p))) ** 2;
  const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const half = Q => {
    const h = [];
    for (const p of Q) {
      while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= eps) h.pop();
      h.push(p);
    }
    return h.slice(0, -1);
  };
  return [...half(P), ...half([...P].reverse())];
}

// the polygon shown in the right panel: the dual conv{±b_i} (polar) or the hexagon itself (non-polar)
function panelShape() {
  return modeSel.value() === 'polar'
    ? hull(pts.map(dual).flatMap(([a, b]) => [[a, b], [-a, -b]]))
    : hull(polygon(1e3));
}

const hit = () => (modeSel.value() === 'limit' ? [] : hitLines(pts, toZ(mouseX, mouseY), LINE_HIT / S));

// scroll wheel / pinch zooms the panel under the mouse
function mouseWheel(e) {
  if (!onCanvas(e)) return;
  zoomBy(Math.exp(-e.delta * 0.0015));
  return false;
}

// zoom the panel under the mouse by f: the first about the cursor, the second about 0
function zoomBy(f) {
  const clamp = z => Math.min(40, Math.max(0.2, z));
  if (inFirst()) {
    usePanel(1);
    const z = toZ(mouseX, mouseY), z0 = zoom1;
    zoom1 = clamp(zoom1 * f); layout();
    const r = z0 / zoom1;                                                       // the lattice scales by this factor about the mouse
    latO = [z[0] + (latO[0] - z[0]) * r, z[1] + (latO[1] - z[1]) * r];
    panX = mouseX - PW / 2 - z[0] * S; panY = mouseY - PH / 2 + z[1] * S;     // keep the point under the cursor fixed
    clampPan(); usePanel(1);                                                    // ... unless that takes the center out of K
  } else zoom2 = clamp(zoom2 * f);
  redraw();
}

// touch (../../libraries/sketch-touch.js): one finger drags a line, the magnifying glass or a focus;
// two fingers pan the first panel and pinch to zoom
function touchGrab() {
  if (!inFirst()) return false;
  const [sx, sy] = toPx(sel);
  return (modeSel.value() === 'limit' && !!limHit(mouseX, mouseY)) || (!single() && Math.hypot(mouseX - sx, mouseY - sy) < SEL_HIT * touchHit) || hit().length > 0;
}
function touchPinch(f, dx, dy) {
  if (inFirst()) { panX += dx; panY += dy; clampPan(); usePanel(1); }
  zoomBy(f);
}

const onCanvas = e => !e || e.target.tagName === 'CANVAS';

function mouseMoved() {
  if (modeSel.value() === 'limit') { const h = inFirst() ? limHit(mouseX, mouseY) : null; if (limKey(h) !== limKey(limHover)) { limHover = h; redraw(); } return; }
  const h = inFirst() ? hit() : [];
  if (lineKey(h) !== lineKey(hov)) { hov = h; redraw(); }
}
function mousePressed(e) {
  const [sx, sy] = toPx(sel);
  limDrag = modeSel.value() === 'limit' && onCanvas(e) && inFirst() ? limHit(mouseX, mouseY) : null;
  dragSel = !single() && !limDrag && onCanvas(e) && inFirst() && Math.hypot(mouseX - sx, mouseY - sy) < SEL_HIT * touchHit;
  // shift click summons the magnifier. The click's own shiftKey, not keyIsDown(SHIFT): p5 only learns Shift is up from a keyup,
  // which is lost if the key is let go while the drag is outside the sketch, and then every click would summon it
  if (!single() && !limDrag && onCanvas(e) && inFirst() && e && e.shiftKey) { sel = toZ(mouseX, mouseY); dragSel = true; }
  const hits = onCanvas(e) && inFirst() && !dragSel ? hit() : [];
  drag = hits.length ? startLineDrag(pts, hits, toZ(mouseX, mouseY)) : null;
  panDrag = onCanvas(e) && inFirst() && !limDrag && !dragSel && !drag ? { mx: mouseX, my: mouseY, px: panX, py: panY } : null;   // drag empty space to pan
  redraw();
}
function mouseDragged(e) {
  // a drag let go outside the sketch never sends it a mouseup: the next move, with no button down, ends the drag
  if (e && e.buttons === 0 && (limDrag || dragSel || panDrag || drag)) { mouseReleased(); return; }
  if (limDrag) { limDragTo(toZ(mouseX, mouseY)); redraw(); return; }
  if (dragSel) { sel = toZ(mouseX, mouseY); redraw(); return; }
  if (panDrag) { panX = panDrag.px + mouseX - panDrag.mx; panY = panDrag.py + mouseY - panDrag.my; clampPan(); usePanel(1); redraw(); return; }
  if (!drag) return;
  pts = dragLines(pts, drag, toZ(mouseX, mouseY));
  redraw();
}
function mouseReleased() { drag = null; dragSel = false; limDrag = null; panDrag = null; redraw(); }
function doubleClicked(e) {   // limit mode: double-click a focus to remove its pair, or empty space to add a pair
  if (modeSel.value() !== 'limit' || !onCanvas(e) || !inFirst()) return;
  limDoubleClick(mouseX, mouseY, toZ(mouseX, mouseY));
  redraw();
}
