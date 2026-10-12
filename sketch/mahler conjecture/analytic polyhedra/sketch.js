const S = 120;    // pixels per unit
const G = 2;      // grid step (px) for tracing the level set rho = lambda
const R = 8;      // hit radius (px)

let pts = [];
let drag = -1;
const COLORS = [[0, 0, 0], [210, 30, 40]];
const pick = () => (Math.random() < 0.5 ? 0 : 1);
const FLOW = [255, 150, 40]; // flowed level set
const NF = 60; // RK4 steps
const NC = 1000; // points on the flowed curve
const MAX_P = 32;   // dots the shader holds
const ZERO_W = 1.5; // width of the curves |P_c| = 1 (px)
let gfx, nx, ny, v, kSlider, lSlider, kOut, lOut;   // gfx: the island and the curves |P_c| = 1, painted by FRAG
                                                     // v: the field on the grid, filled in on demand by around0

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  pts = [[-0.3, 0], [0.3, 0], [0, 0.35]].map(z => [...z, pick(), 1]);
  kSlider = createSlider(0, 2, 0, 0.001).style('width', '160px');
  kOut = uiReadout();
  uiRow(kSlider, kOut);
  kSlider.input(redraw);
  lSlider = createSlider(-4, 1, -1, 0.001).style('width', '160px'); // log10 lambda
  lOut = uiReadout();
  uiRow(lSlider, lOut);
  lSlider.input(redraw);
  alloc();
  noLoop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); alloc(); redraw(); }

function alloc() {
  nx = Math.ceil(width / G) + 1; ny = Math.ceil(height / G) + 1;
  v = new Float64Array(nx * ny);
  if (gfx) gfx.g.remove();
  gfx = shaderLayer(width, height, FRAG);
}

// The island of log(sum_c |P_c|^(2k)) / sqrt(k) (f below), with the curves |P_c| = 1 in the colors of their dots.
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uSize;
uniform float uS, uK;
uniform int uNP;
uniform vec2 uP[${MAX_P}];    // the dots a_j
uniform vec2 uPW[${MAX_P}];   // (w_j, c_j): weight and color of each dot
uniform vec3 uCol[2];         // the two colors (0-1)
uniform vec2 uUsed;           // 1 if the color has dots
${ISLAND_GLSL}

// g below: log|P_c(z)|^2, P_c(z) = z prod_{dots of color c} sqrt(w_j) (z - a_j)
float g(vec2 z, float c) {
  float s = log(dot(z, z) + 1e-30);
  for (int j = 0; j < ${MAX_P}; j++) {
    if (j >= uNP) break;
    vec2 d = z - uP[j];
    if (uPW[j].y == c) s += log(uPW[j].x * dot(d, d) + 1e-30);
  }
  return s;
}

float zeroLine(float f) { return lineCover(abs(f) / max(length(vec2(dFdx(f), dFdy(f))), 1e-6), ${ZERO_W.toFixed(1)}); }

void main() {
  if (uNP == 0) { outColor = vec4(OCEAN1, 1.0); return; }
  vec2 z = (gl_FragCoord.xy - 0.5 * uSize) / uS;
  float g0 = g(z, 0.0), g1 = g(z, 1.0);
  float l0 = uUsed.x > 0.5 ? uK * g0 : -1e30, l1 = uUsed.y > 0.5 ? uK * g1 : -1e30, m = max(l0, l1);
  vec3 col = islandShade((m + log(exp(l0 - m) + exp(l1 - m))) / sqrt(uK), ${BEACH}, true);
  col = mix(col, uCol[0], uUsed.x * zeroLine(g0));
  col = mix(col, uCol[1], uUsed.y * zeroLine(g1));
  outColor = vec4(col, 1.0);
}`;

// the dots as FRAG's uniforms, padded to MAX_P
function dotUniforms(k) {
  const P = pts.slice(0, MAX_P), pad = A => [...A.flat(), ...new Array(2 * (MAX_P - A.length)).fill(0)];
  return {
    uSize: [width, height], uS: S, uK: k, uNP: P.length,
    uP: pad(P.map(p => [p[0], p[1]])), uPW: pad(P.map(p => [p[3], p[2]])),
    uCol: COLORS.flat().map(x => x / 255), uUsed: [0, 1].map(c => (used().includes(c) ? 1 : 0)),
  };
}

const toPx = ([x, y]) => [width / 2 + x * S, height / 2 - y * S];
const toZ = (px, py) => [(px - width / 2) / S, (height / 2 - py) / S];

// log|P_c(z)|^2, P_c(z) = z prod_{dots of color c} sqrt(w_j) (z - a_j)
function g(x, y, c) {
  let s = Math.log(x * x + y * y + 1e-300);
  for (const [a, b, d, w] of pts) if (d === c) s += Math.log(w * ((x - a) ** 2 + (y - b) ** 2) + 1e-300);
  return s;
}
const used = () => [0, 1].filter(c => pts.some(p => p[2] === c));

// log(sum_c |P_c(z)|^(2k))
function f(px, py, k) {
  const [x, y] = toZ(px, py);
  const l = used().map(c => k * g(x, y, c));
  const m = Math.max(...l);
  let s = 0;
  for (const t of l) s += Math.exp(t - m);
  return m + Math.log(s);
}

// rho = sum_c |F_c|^2 with F_c = P_c^k holomorphic. Then grad rho = 2 sum_c F_c conj(F_c') and lap rho = 4 sum_c |F_c'|^2,
// so the gradient of rho for the metric (lap rho)|dz|^2 is
//   grad rho / lap rho = sum_c |P_c|^(2k) conj(D_c) / (2k sum_c |P_c|^(2k) |D_c|^2),  D_c = P_c'/P_c = 1/z + sum_j 1/(z - a_j).
// The |P_c|^(2k) are scaled by their largest to stay finite.
function vel(x, y, k) {
  const cs = used(), l = cs.map(c => k * g(x, y, c)), m = Math.max(...l);
  let nx = 0, ny = 0, den = 0;
  cs.forEach((c, i) => {
    const r0 = x * x + y * y + 1e-300;
    let dx = x / r0, dy = -y / r0; // 1/z
    for (const [a, b, d] of pts) if (d === c) { const r = (x - a) ** 2 + (y - b) ** 2 + 1e-300; dx += (x - a) / r; dy -= (y - b) / r; }
    const w = Math.exp(l[i] - m);
    nx += w * dx; ny -= w * dy; den += w * (dx * dx + dy * dy);
  });
  return [nx / (2 * k * den), ny / (2 * k * den)];
}

// Resample a closed polyline to NC points equally spaced in arclength.
function resample(P) {
  const n = P.length, cum = [0];
  for (let i = 0; i < n; i++) cum.push(cum[i] + Math.hypot(P[(i + 1) % n][0] - P[i][0], P[(i + 1) % n][1] - P[i][1]));
  const len = cum[n], Q = [];
  if (!len) return P;
  for (let j = 0, i = 0; j < NC; j++) {
    const s = (len * j) / NC;
    while (cum[i + 1] < s) i++;
    const t = (s - cum[i]) / (cum[i + 1] - cum[i] || 1), a = P[i], b = P[(i + 1) % n];
    Q.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
  }
  return Q;
}

// Flow a closed curve for time T under the gradient above: an RK4 step for every point,
// then resample by arclength.
function flow(P, k, T) {
  const h = T / NF;
  P = resample(P);
  for (let j = 0; j < NF; j++) {
    P = resample(P.map(([x, y]) => {
      const [ax, ay] = vel(x, y, k), [bx, by] = vel(x + (h / 2) * ax, y + (h / 2) * ay, k);
      const [cx, cy] = vel(x + (h / 2) * bx, y + (h / 2) * by, k), [dx, dy] = vel(x + h * cx, y + h * cy, k);
      return [x + (h / 6) * (ax + 2 * bx + 2 * cx + dx), y + (h / 6) * (ay + 2 * by + 2 * cy + dy)];
    }));
  }
  return P;
}

// Chain marching-squares segments [x0, y0, x1, y1] into closed loops; return the longest.
function chain(segs) {
  const key = (x, y) => Math.round(x * 1e4) + ',' + Math.round(y * 1e4);
  const at = new Map();
  segs.forEach((s, i) => {
    for (const e of [0, 2]) { const kk = key(s[e], s[e + 1]); if (!at.has(kk)) at.set(kk, []); at.get(kk).push(i); }
  });
  const used = new Uint8Array(segs.length);
  let best = [];
  for (let i0 = 0; i0 < segs.length; i0++) {
    if (used[i0]) continue;
    const L = [];
    let i = i0, x = segs[i0][0], y = segs[i0][1];
    while (i >= 0 && !used[i]) {
      used[i] = 1;
      const s = segs[i], fwd = key(s[0], s[1]) === key(x, y);
      L.push([x, y]);
      [x, y] = fwd ? [s[2], s[3]] : [s[0], s[1]];
      i = (at.get(key(x, y)) || []).find(j => !used[j]) ?? -1;
    }
    if (L.length > best.length) best = L;
  }
  return best;
}

// v, with every grid node outside the component of {v < L} containing the origin raised above L,
// so the level set v = L is drawn only around the zero at 0. v = f / sqrt(k) is only computed on that
// component and its edge (v is NaN where it has not been computed yet).
function around0(L, k) {
  const val = n => (Number.isNaN(v[n]) ? (v[n] = f((n % nx) * G, Math.floor(n / nx) * G, k) / Math.sqrt(k)) : v[n]);
  const w = new Float64Array(nx * ny).fill(L + 1), i0 = Math.round(width / 2 / G), j0 = Math.round(height / 2 / G);
  const stack = [j0 * nx + i0];
  while (stack.length) {
    const n = stack.pop(), i = n % nx, j = (n - i) / nx;
    if (i < 0 || j < 0 || i >= nx || j >= ny || w[n] < L || val(n) >= L) continue;
    w[n] = v[n];
    if (i > 0) stack.push(n - 1);
    if (i < nx - 1) stack.push(n + 1);
    if (j > 0) stack.push(n - nx);
    if (j < ny - 1) stack.push(n + nx);
  }
  return w;
}

function draw() {
  const k = Math.round(10 ** kSlider.value());
  image(paintShader(gfx, dotUniforms(k)), 0, 0);
  v.fill(NaN);

  kOut.html('k = ' + k);
  lOut.html('λ = ' + (10 ** lSlider.value()).toPrecision(2));

  // level set rho = lambda (dashed) and its image under the gradient flow
  if (pts.length) {
    const lam = 10 ** lSlider.value(), segs = [];
    contour({ line: (...q) => segs.push(q) }, around0(Math.log(lam) / Math.sqrt(k), k), nx, ny, G, Math.log(lam) / Math.sqrt(k));
    const C = flow(chain(segs).map(q => toZ(...q)), k, -Math.log(lam));
    stroke(FLOW); noFill();
    drawingContext.setLineDash([6, 5]); strokeWeight(1.5);
    for (const q of segs) line(...q);
    drawingContext.setLineDash([]); strokeWeight(3);
    beginShape(); for (const q of C) vertex(...toPx(q)); endShape(CLOSE);
  }

  noStroke();
  for (const p of pts) { const [u, w] = toPx(p); fill(COLORS[p[2]]); circle(u, w, size(p)); }
}

const size = p => constrain(8 * Math.sqrt(p[3]), 3, 40);

function hit() {
  for (let k = pts.length - 1; k >= 0; k--) {
    const [u, w] = toPx(pts[k]);
    if (dist(mouseX, mouseY, u, w) < Math.max(R * touchHit, size(pts[k]) / 2)) return k;
  }
  return -1;
}

const onCanvas = e => !e || e.target.tagName === 'CANVAS';

function mousePressed(e) { drag = onCanvas(e) ? hit() : -1; }
function mouseDragged() { if (drag >= 0) { pts[drag] = [...toZ(mouseX, mouseY), pts[drag][2], pts[drag][3]]; redraw(); } }
function mouseReleased() { drag = -1; }
function doubleClicked(e) {
  if (!onCanvas(e)) return;
  const k = hit();
  if (k >= 0) pts.splice(k, 1);
  else pts.push([...toZ(mouseX, mouseY), pick(), 1]);
  redraw();
}
function mouseWheel(e) {
  const k = hit();
  if (k < 0) return;
  pts[k][3] *= Math.exp(-e.delta * 0.002);
  redraw();
  return false;
}

// touch (../../libraries/sketch-touch.js): one finger drags a dot, pinching on a dot changes its weight
function touchGrab() { return hit() >= 0; }
function touchPinch(f) {
  const k = hit();
  if (k < 0) return;
  pts[k][3] *= f;
  redraw();
}
