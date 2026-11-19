'use strict';
// su3.js — the Veronese conic ν(CP¹) ⊂ CP², moved by M ∈ SU(3) and drawn through the toric moment map.
// Drag anywhere to move M: the drag is shared among the three root SU(2) subgroups by a partition of unity on the
// screen (see planeWeights). Mounts into the element #su3_sketch. A second figure, #su3_weights (if present), shows
// those weights ρ_i as an OKLab blend of the corner colours.
(() => {
const PARENT = 'su3_sketch', HAS_MAIN = !!document.getElementById(PARENT);   // the weights figure alone skips the samples
const TAU = Math.PI * 2, S3 = Math.sqrt(3), SQ2 = Math.SQRT2;
const V = [[0, -1], [-S3 / 2, 0.5], [S3 / 2, 0.5]];   // moment triangle corners, screen frame (y down)

// ===================== 3×3 complex matrices, as 18 reals (row-major, re/im interleaved) =====================
function eye() { const M = new Float64Array(18); M[0] = M[8] = M[16] = 1; return M; }
function matmul(X, Y) {
  const Z = new Float64Array(18);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let re = 0, im = 0;
    for (let k = 0; k < 3; k++) {
      const a = (i * 3 + k) * 2, b = (k * 3 + j) * 2;
      re += X[a] * Y[b] - X[a + 1] * Y[b + 1];
      im += X[a] * Y[b + 1] + X[a + 1] * Y[b];
    }
    Z[(i * 3 + j) * 2] = re; Z[(i * 3 + j) * 2 + 1] = im;
  }
  return Z;
}
function expm(M) {                                   // scaling and squaring with a Taylor series
  let nrm = 0; for (let i = 0; i < 18; i++) nrm = Math.max(nrm, Math.abs(M[i]));
  nrm *= 3;
  let s = 0; while (nrm > 0.25) { nrm /= 2; s++; }
  const sc = Math.pow(2, -s), X = M.map(v => v * sc);
  let R = eye(), T = eye();
  for (let k = 1; k <= 12; k++) { T = matmul(T, X); for (let i = 0; i < 18; i++) { T[i] /= k; R[i] += T[i]; } }
  for (let i = 0; i < s; i++) R = matmul(R, R);
  return R;
}
function cmul(ar, ai, br, bi) { return [ar * br - ai * bi, ar * bi + ai * br]; }
function det3(M) {
  const e = (i, j) => [M[(i * 3 + j) * 2], M[(i * 3 + j) * 2 + 1]];
  const perms = [[0, 1, 2, 1], [1, 2, 0, 1], [2, 0, 1, 1], [0, 2, 1, -1], [1, 0, 2, -1], [2, 1, 0, -1]];
  let re = 0, im = 0;
  for (const [a, b, c, s] of perms) {
    const x = e(0, a), y = e(1, b), z = e(2, c);
    let t = cmul(x[0], x[1], y[0], y[1]); t = cmul(t[0], t[1], z[0], z[1]);
    re += s * t[0]; im += s * t[1];
  }
  return [re, im];
}
function reunitarize(M) {                            // Gram–Schmidt on the columns, then a phase so det = 1
  for (let j = 0; j < 3; j++) {
    for (let p = 0; p < j; p++) {
      let re = 0, im = 0;
      for (let i = 0; i < 3; i++) {
        const a = (i * 3 + p) * 2, b = (i * 3 + j) * 2;
        re += M[a] * M[b] + M[a + 1] * M[b + 1]; im += M[a] * M[b + 1] - M[a + 1] * M[b];
      }
      for (let i = 0; i < 3; i++) {
        const a = (i * 3 + p) * 2, b = (i * 3 + j) * 2;
        M[b] -= re * M[a] - im * M[a + 1]; M[b + 1] -= re * M[a + 1] + im * M[a];
      }
    }
    let n = 0;
    for (let i = 0; i < 3; i++) { const b = (i * 3 + j) * 2; n += M[b] * M[b] + M[b + 1] * M[b + 1]; }
    n = Math.sqrt(n);
    for (let i = 0; i < 3; i++) { const b = (i * 3 + j) * 2; M[b] /= n; M[b + 1] /= n; }
  }
  const d = det3(M), ph = -Math.atan2(d[1], d[0]) / 3, c = Math.cos(ph), s = Math.sin(ph);
  for (let k = 0; k < 18; k += 2) { const r = M[k], i = M[k + 1]; M[k] = r * c - i * s; M[k + 1] = r * s + i * c; }
}
// Haar-random element of SU(3): Gram–Schmidt on a complex Gaussian matrix
function gauss() { let u = 0; while (u === 0) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random()); }
function randomSU3() { const M = new Float64Array(18); for (let i = 0; i < 18; i++) M[i] = gauss(); reunitarize(M); return M; }

// ===================== CP¹ = S²: a (φ, θ) grid and random samples =====================
// spinor (w₁, w₂) of a point of S² (inverse Hopf map), written as 4 reals at out[o..o+3]
function spinorOf(X, Y, Z, out, o) {
  if (Z > -0.5) {
    const a = Math.sqrt((1 + Z) / 2);
    out[o] = a; out[o + 1] = 0; out[o + 2] = X / (2 * a); out[o + 3] = Y / (2 * a);
  } else {
    const b = Math.sqrt((1 - Z) / 2);
    out[o] = X / (2 * b); out[o + 1] = -Y / (2 * b); out[o + 2] = b; out[o + 3] = 0;
  }
}
const NP = 360, NT = 181;                            // grid includes both poles
const GN = NP * NT, GW = new Float64Array(4 * GN);   // spinors at the grid vertices
if (HAS_MAIN) for (let j = 0; j < NT; j++) for (let i = 0; i < NP; i++) {
  const th = Math.PI * j / (NT - 1), ph = TAU * i / NP;
  spinorOf(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th), GW, 4 * (j * NP + i));
}
function gridCoords(X, Y, Z) {                       // grid cell of a point of S², with bilinear weights
  let u = Math.atan2(Y, X) / TAU * NP; if (u < 0) u += NP;
  const i0 = Math.floor(u) % NP, fx = u - Math.floor(u);
  const v = Math.acos(Math.max(-1, Math.min(1, Z))) / Math.PI * (NT - 1);
  const j0 = Math.min(NT - 2, Math.floor(v)), fy = v - j0;
  return [j0 * NP + i0, j0 * NP + (i0 + 1) % NP, fx, fy];
}
// ===================== OKLab (perceptually uniform colour) =====================
const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
function srgbToOklab(hex) {
  const n = parseInt(hex.slice(1), 16), r = toLin(n >> 16), g = toLin((n >> 8) & 255), b = toLin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function oklabToSRGB(L, a, b) {                      // out-of-gamut colours are clipped
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  return lin.map(c => { c = Math.max(0, Math.min(1, c)); return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055); });
}
// domain colouring of CP¹ in OKLCH: hue = arg(w₂/w₁), lightness rising from one pole to the other, constant chroma
const oklchToSRGB = (L, C, h) => oklabToSRGB(L, C * Math.cos(h), C * Math.sin(h));
function domainColor(X, Y, Z) {
  const lr = 0.5 * Math.log(Math.max(1e-12, 1 - Z) / Math.max(1e-12, 1 + Z));
  return oklchToSRGB(0.68 + 0.2 * Math.tanh(lr / 1.6), 0.12, Math.atan2(Y, X));
}
// NM uniform random points of CP¹. Each frame μ(M ν(w)) is computed exactly at the grid vertices and
// interpolated to the samples.
const NM = 200000;
const MOM = { kA: new Int32Array(NM), kB: new Int32Array(NM), fx: new Float32Array(NM), fy: new Float32Array(NM),
  r: new Uint8Array(NM), g: new Uint8Array(NM), b: new Uint8Array(NM) };
if (HAS_MAIN) for (let k = 0; k < NM; k++) {
  const z = 2 * Math.random() - 1, ph = TAU * Math.random(), r = Math.sqrt(1 - z * z), x = r * Math.cos(ph), y = r * Math.sin(ph);
  const g = gridCoords(x, y, z); MOM.kA[k] = g[0]; MOM.kB[k] = g[1]; MOM.fx[k] = g[2]; MOM.fy[k] = g[3];
  const c = domainColor(x, y, z); MOM.r[k] = c[0]; MOM.g[k] = c[1]; MOM.b[k] = c[2];
}

// ===================== the matrix M and the corner trackballs =====================
// Ball i collects η ∈ su(2) ≅ ℝ³, acting on SU(3) through the copy of su(2) on the two coordinates other than i
// (so it fixes vertex e_i), with the Cartan direction on z:
//   ι_i(η) = [[i η_z, η_x + i η_y], [−η_x + i η_y, −i η_z]],   M ← exp(Σ ι_i(η_i)) M.
// Each ball's quaternion is turned by exp(η_i) too, only to draw the ball.
let M = randomSU3();
const TB_PAIRS = [[1, 2], [2, 0], [0, 1]];
const TB = [0, 1, 2].map(() => ({ q: [1, 0, 0, 0], eta: [0, 0, 0], alpha: 0.12 }));
const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qconj = a => [a[0], -a[1], -a[2], -a[3]];
const qnorm = a => { const n = Math.hypot(...a); return a.map(v => v / n); };
function su2Embed(i, nx, ny, nz) {
  const E = new Float64Array(18), [j, k] = TB_PAIRS[i], set = (r, c, re, im) => { E[(r * 3 + c) * 2] = re; E[(r * 3 + c) * 2 + 1] = im; };
  set(j, j, 0, nz); set(j, k, nx, ny); set(k, j, -nx, ny); set(k, k, 0, -nz);
  return E;
}
function addEta(i, e) {
  const t = TB[i], n = Math.hypot(e[0], e[1], e[2]);
  if (n < 1e-12) return;
  t.eta[0] += e[0]; t.eta[1] += e[1]; t.eta[2] += e[2];
  const s = Math.sin(n) / n;
  t.q = qnorm(qmul([Math.cos(n), e[0] * s, e[1] * s, e[2] * s], t.q));
}
// sensitivity: the virtual trackball's radius in units of half the triangle's edge length
const TB_RADIUS = 0.7;
// a drag step (dx, dy) shared among the balls with weights w: each gets w_i of η = ½ (ẑ × d)/r
function weightedDrag(w, dx, dy) {
  const r = TB_RADIUS * S3 * triGeom().R / 2, e = [dy / (2 * r), dx / (2 * r), 0];
  for (let i = 0; i < 3; i++) if (w[i] > 0) addEta(i, [w[i] * e[0], w[i] * e[1], 0]);
}
function applyTrackballs() {                         // M ← exp(Σ ι_i(η_i)) M; true if M moved
  const xi = new Float64Array(18);
  let any = false;
  for (let i = 0; i < 3; i++) {
    const e = TB[i].eta;
    if (e[0] === 0 && e[1] === 0 && e[2] === 0) continue;
    const L = su2Embed(i, e[0], e[1], e[2]);
    for (let k = 0; k < 18; k++) xi[k] += L[k];
    TB[i].eta = [0, 0, 0]; any = true;
  }
  if (any) { M = matmul(expm(xi), M); reunitarize(M); }
  return any;
}

// ===================== the partition of unity on the screen =====================
//   g_i = λ_j λ_k + ε (1 − λ_i)²,   ρ_i = g_i / (g₀ + g₁ + g₂)
// ρ_i is 1 on the edge opposite corner i and 0 at corner i. Outside the triangle a point takes the weights of the
// boundary point on the ray from the centroid through it.
const W_EPS = 0.03;
function barycentric(T, x, y) {                      // in the triangle of geometry T = { R, cx, cy }
  const P = V.map(v => [T.cx + T.R * v[0], T.cy + T.R * v[1]]);
  const d = (P[1][1] - P[2][1]) * (P[0][0] - P[2][0]) + (P[2][0] - P[1][0]) * (P[0][1] - P[2][1]);
  const l0 = ((P[1][1] - P[2][1]) * (x - P[2][0]) + (P[2][0] - P[1][0]) * (y - P[2][1])) / d;
  const l1 = ((P[2][1] - P[0][1]) * (x - P[2][0]) + (P[0][0] - P[2][0]) * (y - P[2][1])) / d;
  return [l0, l1, 1 - l0 - l1];
}
function rho(l) {                                    // the weights at barycentric coordinates l
  let t = 1;
  for (const v of l) if (v < 0) t = Math.min(t, (1 / 3) / (1 / 3 - v));
  const lt = l.map(v => 1 / 3 + t * (v - 1 / 3));
  const g = TB_PAIRS.map(([j, k], i) => lt[j] * lt[k] + W_EPS * (1 - lt[i]) * (1 - lt[i]));
  const s = g[0] + g[1] + g[2];
  return g.map(v => v / s);
}
const planeWeights = (x, y) => rho(barycentric(triGeom(), x, y));

// ===================== layout, theme, input =====================
const TH = {                                         // matches the site's dark theme
  muted: '#a8957f', line: [84, 73, 63],
  axes: ['#e56b6f', '#7fc96b', '#a58fd6'],
};
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
let W = 300, H = 300, ctx = null;
const TB_R = 0.13;                                   // ball radius, as a fraction of the triangle's circumradius
function triGeom() {                                 // the largest triangle that fits, with room for the balls
  const pad = 12, gap = 6, rb = TB_R, avail = H - 2 * pad;
  const R = Math.max(30, Math.min((W - 2 * pad - S3 * gap) / (S3 * (1 + rb) + 2 * rb), (avail - 1.5 * gap) / (1.5 + 3.5 * rb)));
  const up = R * (1 + 2 * rb) + gap, down = R * (0.5 + 1.5 * rb) + gap / 2;
  return { R, cx: W / 2, cy: pad + up + (avail - up - down) / 2 };
}
function tbGeom(i) {                                 // just past corner i, on the ray from the centroid
  const T = triGeom(), r = TB_R * T.R, off = T.R + r + 6;
  return { cx: T.cx + off * V[i][0], cy: T.cy + off * V[i][1], r };
}
let gesture = null, needsDraw = true;
function attachInput(el) {
  const xy = e => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  el.addEventListener('pointerdown', e => {
    const [x, y] = xy(e);
    gesture = { w: planeWeights(x, y), x, y };
    el.style.cursor = 'grabbing';
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* synthetic pointers cannot be captured */ }
    e.preventDefault();
  });
  el.addEventListener('pointermove', e => {
    if (!gesture) return;
    const [x, y] = xy(e);
    gesture.w = planeWeights((x + gesture.x) / 2, (y + gesture.y) / 2);   // weights at the step's midpoint
    weightedDrag(gesture.w, x - gesture.x, y - gesture.y);
    gesture.x = x; gesture.y = y;
  });
  const end = () => { gesture = null; el.style.cursor = 'grab'; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.style.cursor = 'grab';
}

// ===================== drawing =====================
// Samples are splatted into per-pixel colour sums at device resolution and drawn as emitted light with 'lighter':
// 255 (1 − e^(−k Σ c)) per channel.
const DOT = 1.6;                                     // point size, css px
const MR = { cv: null, cx: null, img: null, W: 0, H: 0, sr: null, sg: null, sb: null, sw: null, mux: new Float32Array(GN), muy: new Float32Array(GN) };
function splat(T) {
  const dpr = window.devicePixelRatio || 1, Wd = Math.max(1, Math.round(W * dpr)), Hd = Math.max(1, Math.round(H * dpr));
  if (MR.W !== Wd || MR.H !== Hd) {
    MR.W = Wd; MR.H = Hd; MR.cv = document.createElement('canvas'); MR.cv.width = Wd; MR.cv.height = Hd;
    MR.cx = MR.cv.getContext('2d'); MR.img = MR.cx.createImageData(Wd, Hd);
    MR.sr = new Float32Array(Wd * Hd); MR.sg = new Float32Array(Wd * Hd); MR.sb = new Float32Array(Wd * Hd); MR.sw = new Float32Array(Wd * Hd);
  }
  // μ(M ν(w)) at the grid vertices, in device pixels; ν(w₁, w₂) = (w₁², √2 w₁w₂, w₂²)
  const g = M, mux = MR.mux, muy = MR.muy;
  const ox = T.cx * dpr, oy = T.cy * dpr, Rd = T.R * dpr;
  const ax = Rd * V[0][0], ay = Rd * V[0][1], bx = Rd * V[1][0], by = Rd * V[1][1], qx = Rd * V[2][0], qy = Rd * V[2][1];
  for (let k = 0; k < GN; k++) {
    const o = 4 * k, a = GW[o], b = GW[o + 1], c = GW[o + 2], d = GW[o + 3];
    const v0r = a * a - b * b, v0i = 2 * a * b, v1r = SQ2 * (a * c - b * d), v1i = SQ2 * (a * d + b * c), v2r = c * c - d * d, v2i = 2 * c * d;
    const z0r = g[0] * v0r - g[1] * v0i + g[2] * v1r - g[3] * v1i + g[4] * v2r - g[5] * v2i, z0i = g[0] * v0i + g[1] * v0r + g[2] * v1i + g[3] * v1r + g[4] * v2i + g[5] * v2r;
    const z1r = g[6] * v0r - g[7] * v0i + g[8] * v1r - g[9] * v1i + g[10] * v2r - g[11] * v2i, z1i = g[6] * v0i + g[7] * v0r + g[8] * v1i + g[9] * v1r + g[10] * v2i + g[11] * v2r;
    const z2r = g[12] * v0r - g[13] * v0i + g[14] * v1r - g[15] * v1i + g[16] * v2r - g[17] * v2i, z2i = g[12] * v0i + g[13] * v0r + g[14] * v1i + g[15] * v1r + g[16] * v2i + g[17] * v2r;
    const m0 = z0r * z0r + z0i * z0i, m1 = z1r * z1r + z1i * z1i, m2 = z2r * z2r + z2i * z2i, s = 1 / (m0 + m1 + m2);
    mux[k] = ox + (m0 * ax + m1 * bx + m2 * qx) * s; muy[k] = oy + (m0 * ay + m1 * by + m2 * qy) * s;
  }
  // each sample is a square dot DOT css px wide (at least 2 device px)
  const { sr, sg, sb, sw } = MR, sz = Math.max(2, Math.round(DOT * dpr)), h0 = sz >> 1;
  sr.fill(0); sg.fill(0); sb.fill(0); sw.fill(0);
  for (let k = 0; k < NM; k++) {
    const kA = MOM.kA[k], kB = MOM.kB[k], fx = MOM.fx[k], fy = MOM.fy[k];
    const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
    const px = ((w00 * mux[kA] + w10 * mux[kB] + w01 * mux[kA + NP] + w11 * mux[kB + NP]) | 0) - h0;
    const py = ((w00 * muy[kA] + w10 * muy[kB] + w01 * muy[kA + NP] + w11 * muy[kB + NP]) | 0) - h0;
    const x0 = Math.max(0, px), x1 = Math.min(Wd, px + sz), y1 = Math.min(Hd, py + sz);
    const r = MOM.r[k], gg = MOM.g[k], bb = MOM.b[k];
    for (let y = Math.max(0, py); y < y1; y++) for (let x = x0, p = y * Wd + x0; x < x1; x++, p++) {
      sr[p] += r; sg[p] += gg; sb[p] += bb; sw[p] += 1;
    }
  }
  const data = MR.img.data, kk = 0.45 / 255 / sz;   // dimmer per pixel as dots grow, so dense regions don't wash out
  for (let p = 0; p < Wd * Hd; p++) {
    const w = sw[p], o = 4 * p;
    if (w === 0) { data[o + 3] = 0; continue; }
    data[o] = 255 * (1 - Math.exp(-kk * sr[p])); data[o + 1] = 255 * (1 - Math.exp(-kk * sg[p])); data[o + 2] = 255 * (1 - Math.exp(-kk * sb[p]));
    data[o + 3] = 255;
  }
  MR.cx.putImageData(MR.img, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(MR.cv, 0, 0, W, H);
  ctx.restore();
}
// a trackball: a flat disc with three great circles turned by q_i (front halves solid, back halves faint). Balls
// rest faded; during a drag ball i shows at opacity 0.12 + 0.88 ρ_i (its share of the drag).
function drawTrackball(i) {
  const { cx, cy, r } = tbGeom(i), t = TB[i], q = t.q, A = t.alpha;
  ctx.globalAlpha = A;
  ctx.fillStyle = rgba(TH.line, 1); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  const rot = v => { const u = qmul(qmul(q, [0, v[0], v[1], v[2]]), qconj(q)); return [u[1], u[2], u[3]]; };
  for (let a = 0; a < 3; a++) {
    for (const front of [false, true]) {
      ctx.strokeStyle = TH.axes[a]; ctx.globalAlpha = A * (front ? 0.95 : 0.25); ctx.lineWidth = front ? 1.6 : 1; ctx.beginPath();
      let pen = false;
      for (let s = 0; s <= 64; s++) {
        const th = TAU * s / 64, c = Math.cos(th), sn = Math.sin(th);
        const v = rot(a === 0 ? [0, c, sn] : a === 1 ? [c, 0, sn] : [c, sn, 0]);
        if ((v[2] >= 0) === front) { const X = cx + r * v[0], Y = cy - r * v[1]; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; } else pen = false;
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = A; ctx.strokeStyle = TH.muted; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
}
function draw() {
  const T = triGeom(), P = V.map(v => [T.cx + T.R * v[0], T.cy + T.R * v[1]]);
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1]); ctx.lineTo(P[2][0], P[2][1]); ctx.closePath();
  ctx.fillStyle = rgba(TH.line, 0.45); ctx.fill();
  ctx.strokeStyle = TH.muted; ctx.lineWidth = 1; ctx.stroke();
  splat(T);
  for (let i = 0; i < 3; i++) drawTrackball(i);
}

if (HAS_MAIN) new p5(p => {
  const size = () => { const el = document.getElementById(PARENT); W = el.clientWidth; H = el.clientHeight; };
  p.setup = () => {
    size();
    const c = p.createCanvas(W, H);
    c.parent(PARENT);
    ctx = p.drawingContext;
    attachInput(c.elt);
  };
  p.windowResized = () => { size(); p.resizeCanvas(W, H); needsDraw = true; };
  p.draw = () => {
    if (applyTrackballs()) needsDraw = true;
    for (let i = 0; i < 3; i++) {                    // ease each ball's opacity toward its share of the drag
      const t = TB[i], target = gesture ? 0.12 + 0.88 * gesture.w[i] : 0.12;
      if (Math.abs(target - t.alpha) > 0.003) { t.alpha += (target - t.alpha) * 0.25; needsDraw = true; }
    }
    if (needsDraw) { draw(); needsDraw = false; }
  };
});

// ===================== the weights figure =====================
// Corner i in colour c_i; each point of the plane in the OKLab blend Σ ρ_i c_i, so the region where a drag turns S_i
// (the SU(2) fixing corner i) takes corner i's colour. Hovering corner i shows ρ_i alone: c_i blended with the page
// background by ρ_i.
const PAGE_BG = '#2c2621', HOVER_R = 48;   // px around each corner dot that counts as hovering it
const WF = { el: null, cv: null, T: null, Wd: 0, Hd: 0, dpr: 1, imgs: {}, hover: -1 };
function weightsImage(mode) {                        // mode −1: all three weights; mode i: ρ_i alone (cached)
  if (WF.imgs[mode]) return WF.imgs[mode];
  const { Wd, Hd, dpr, T } = WF, lab = TH.axes.map(srgbToOklab), bg = srgbToOklab(PAGE_BG);
  const img = new ImageData(Wd, Hd), data = img.data;
  for (let py = 0; py < Hd; py++) for (let px = 0; px < Wd; px++) {
    const w = rho(barycentric(T, (px + 0.5) / dpr, (py + 0.5) / dpr)), col = [0, 0, 0];
    for (let k = 0; k < 3; k++) col[k] = mode < 0 ? w[0] * lab[0][k] + w[1] * lab[1][k] + w[2] * lab[2][k]
      : w[mode] * lab[mode][k] + (1 - w[mode]) * bg[k];
    const rgb = oklabToSRGB(col[0], col[1], col[2]), o = 4 * (py * Wd + px);
    data[o] = rgb[0]; data[o + 1] = rgb[1]; data[o + 2] = rgb[2]; data[o + 3] = 255;
  }
  return (WF.imgs[mode] = img);
}
const cornerPoints = () => V.map(v => [WF.T.cx + WF.T.R * v[0], WF.T.cy + WF.T.R * v[1]]);
function renderWeights() {
  const c = WF.cv.getContext('2d'), P = cornerPoints();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.putImageData(weightsImage(WF.hover), 0, 0);
  c.setTransform(WF.dpr, 0, 0, WF.dpr, 0, 0);
  c.beginPath(); c.moveTo(P[0][0], P[0][1]); c.lineTo(P[1][0], P[1][1]); c.lineTo(P[2][0], P[2][1]); c.closePath();
  c.strokeStyle = '#e6cfb3'; c.lineWidth = 1.5; c.stroke();
  P.forEach(([x, y], i) => {
    c.beginPath(); c.arc(x, y, WF.hover === i ? 10 : 8, 0, TAU);
    c.fillStyle = TH.axes[i]; c.fill(); c.strokeStyle = WF.hover === i ? '#e6cfb3' : PAGE_BG; c.lineWidth = 2; c.stroke();
  });
}
function layoutWeights() {
  // ?poster (_tools/make-posters.py): headless Chrome lays out a shorter viewport than it captures, so go square
  const el = WF.el, Wc = el.clientWidth, poster = /[?&]poster\b/.test(location.search);
  const Hc = poster ? Math.max(Wc, el.clientHeight) : el.clientHeight, dpr = window.devicePixelRatio || 1, pad = 22;
  if (!WF.cv) {
    WF.cv = document.createElement('canvas'); WF.cv.style.display = 'block'; el.appendChild(WF.cv);
    const pick = e => {                                // the corner under the pointer, or −1
      const r = WF.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      return cornerPoints().findIndex(([px, py]) => Math.hypot(x - px, y - py) < HOVER_R);
    };
    const set = h => { if (h !== WF.hover) { WF.hover = h; WF.cv.style.cursor = h >= 0 ? 'pointer' : 'default'; renderWeights(); } };
    // mouse: hover a corner. Touch (no hover): tap a corner to select it, tap it again or anywhere else to clear.
    const touch = e => e.pointerType !== 'mouse';
    WF.cv.addEventListener('pointermove', e => { if (!touch(e)) set(pick(e)); });
    WF.cv.addEventListener('pointerleave', e => { if (!touch(e)) set(-1); });
    WF.cv.addEventListener('pointerdown', e => {
      if (!touch(e)) return;
      const h = pick(e);
      set(h === WF.hover ? -1 : h);
    });
  }
  WF.Wd = Math.round(Wc * dpr); WF.Hd = Math.round(Hc * dpr); WF.dpr = dpr; WF.imgs = {};
  WF.cv.width = WF.Wd; WF.cv.height = WF.Hd; WF.cv.style.width = Wc + 'px'; WF.cv.style.height = Hc + 'px';
  const R = Math.min((Wc - 2 * pad) / S3, (Hc - 2 * pad) / 1.5);
  WF.T = { R, cx: Wc / 2, cy: Hc / 2 + R / 4 };      // centre the triangle's bounding box vertically
  renderWeights();
}
WF.el = document.getElementById('su3_weights');
if (WF.el) {
  let timer = null;
  layoutWeights();
  new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(layoutWeights, 100); }).observe(WF.el);
}
})();
