// Domains D symmetric about the x axis, spanning x in [-1, 1]. For each, phi: D -> unit disc is the conformal map
// with phi(0) = 0 (the inverse of g: disc -> D). Density k^2 |phi|^(2k-2) |phi'|^2 on D (= Δ|phi|^(2k) / 4, area form of phi^k),
// and J_k(x + i y) = int_0^y k^2 |phi|^(2k-2) |phi'|^2 dt.
// The conformal map is shown by the images under g of radial lines of the disc.
// The slider t deforms the picture by (x, y) -> (x, (1 - t) y + t 4 J_k(x, y) / (pi k)) (odd in y; J_k is constant above D, where the density
// is 0): the columns x = const stay put and every column is stretched monotonically, so the shading is pushed forward column by column
// (see draw), and the lines are mapped point by point.
// A page can set (see disc.html, disc-map.html, ti2.html, ti2-map.html):
//   window.FIXED_SHAPE   a name from SHAPES, to show just that shape, without the selector
//   window.HIDE_MAP      leave out the slider t and the checkbox (just the domain);  window.HIDE_SPLIT: leave out only the checkbox
//   window.DEFAULT_K, window.DEFAULT_T   where the sliders start (default k = 1, t = 0)
//   window.PLAY_BUTTON   a play button next to the slider t, which sweeps t back and forth with easing at the ends
//   window.CONST_BORDER  always draw the border as a constant-width stroke (no band of varying width, even at t = 0)
//   window.BAND_MAX     width in px of the widest part of the harmonic-measure band (default 20 k / 100, so it only shows for large k)
//   window.VIEW_CY       height of the origin as a fraction of the page (default 0.55, below the controls; 0.5 when they are outside the frame)
//   window.VIEW_SCALE    pixels per unit as a fraction of the smaller side, so that [-1, 1] spans 2 VIEW_SCALE of it (default 0.4: 80%)
const BG = OCEAN1;
const NRAYS = 48; // radial lines
const RAY_N = 80; // points along each radial line
const RAY_FADE = 0.5;   // radial lines fade out toward the center, below this |z|, like (|z| / RAY_FADE)^2: all the lines overlap there, so a gentle fade piles up into a bright spot
const BORDER_W = 3;     // sand border along the boundary of D (px), hiding the staircase edge of the pixel grid
const RAY_W0 = 1, RAY_W1 = 0.5;   // radial line width (px): RAY_W0 + RAY_W1 log10(k), so they stay visible at large k
const RAY_A = 40;       // their opacity in the middle, rising to 255 at the boundary (like |z|^RAY_POW)
const RAY_POW = 6;
const CIRC_N = 10;      // the circles |w| = (m / CIRC_N)^(1/k), m = 1 .. CIRC_N - 1 (evenly spaced in |w|^k), pulled back to D by g
const CIRC_M = 360;     // intervals on the upper half of each circle (the lower half is its mirror image); the angles cluster toward 0 and pi, where the circle meets the x axis
const circTh = j => Math.PI / 2 * (1 - Math.cos(Math.PI * j / CIRC_M));
const CIRC_W = 1.5, CIRC_A = 230;   // width (px) and opacity of the circles
const CIRC_COLOR = mix(GREEN1, [0, 0, 0], 0.6);   // darker than the darkest of the density fill, so they show everywhere
const NB = 720;   // boundary samples
const A = 1.31102877714606;   // int_0^1 (1 - t^4)^(-1/2) dt
const A6 = 1.112912674522306; // int_0^1 (1 - t^6)^(-1/3) dt
const SQRT3 = Math.sqrt(3);
const CATALAN = 0.915965594177219;

// F(w) = (8/pi^2) sum (-1)^l w^(2l+1) / (2l+1)^2 = (8/pi^2) Ti_2(w), F' = (8/pi^2) arctan(w) / w, F(1) = 8 G / pi^2, F(i) = i.
// g = (i / T) F / F(1) is F rotated by 90 degrees and normalized to span [-1, 1], with T = pi^2 / (8 G) = F(i) / F(1) = 1.3469:
// g' = i arctan(w) / (T G w), so 1/g' = -i T G w / arctan(w).
// The upper boundary g(e^(i th)), th in [0, pi/2], is tabulated once, sorted by |x|, to give the height of D at each x.
const T_ATAN = Math.PI * Math.PI / (8 * CATALAN);
let atanTop = null;
function atanTopAt(x) {
  if (!atanTop) {
    atanTop = [];
    for (let i = 0; i <= 800; i++) {
      const ray = rayImage(Math.PI / 2 * i / 800, SHAPES[SHAPES.length - 1]), [px, py] = ray[ray.length - 1];
      atanTop.push([Math.abs(px), py]);
    }
    atanTop.sort((p, q) => p[0] - q[0]);          // |x| increasing from 0 to 1
  }
  x = Math.abs(x);
  let lo = 0, hi = atanTop.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (atanTop[mid][0] < x) lo = mid; else hi = mid; }
  const [x0, y0] = atanTop[lo], [x1, y1] = atanTop[hi], t = x0 === x1 ? 0 : (x - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}

// Polygons: 1/g' = K (1 + s z^n)^m, and phi solves dphi/dr = w / g'(phi) along rays from 0.
// Lenses: g(z) = tanh(a artanh z), so phi(w) = tanh(artanh(w) / a) in closed form.
const lens = (name, a) => {
  const al = a * Math.PI / 2, c = 1 / Math.tan(al), R = 1 / Math.sin(al);
  return { name, lens: a, top: x => Math.sqrt(R * R - x * x) - c };
};
const SHAPES = [
  { name: 'Disc', K: 1, n: 1, s: 0, m: 0, top: x => Math.sqrt(Math.max(0, 1 - x * x)) },
  { name: 'Square', K: A / Math.SQRT2, n: 4, s: 1, m: 1 / 2, top: () => 1 },
  { name: 'Diamond', K: A, n: 4, s: -1, m: 1 / 2, top: x => 1 - Math.abs(x) },
  { name: 'Hexagon', K: A6, n: 6, s: -1, m: 1 / 3, top: x => Math.abs(x) <= 0.5 ? SQRT3 / 2 : SQRT3 * (1 - Math.abs(x)) },
  lens('Lens (120°)', 2 / 3),
  { name: 'Ti₂ lens', atan: true, K: CATALAN, top: atanTopAt },
];

let playBtn, playing = false, playS = 0, playDir = 1, playLast = 0;   // the animation of t (see startPlay)
let splitBox, kSlider, tSlider, shapeSel, kOut, tOut, img, img2, S;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  kSlider = createSlider(0, 2, window.DEFAULT_K ? Math.log10(window.DEFAULT_K) : 0, 0.001).style('width', '160px');
  kOut = uiReadout();
  uiRow(kSlider, kOut);
  kSlider.input(() => redraw());
  tSlider = createSlider(0, 1, window.DEFAULT_T || 0, 0.001).style('width', '160px');
  tOut = uiReadout();
  playBtn = window.PLAY_BUTTON ? createButton('▶ play') : null;
  uiRow(...(playBtn ? [tSlider, tOut, playBtn] : [tSlider, tOut]));
  tSlider.input(() => { stopPlay(); redraw(); });   // dragging the slider takes over from the animation
  if (playBtn) playBtn.mousePressed(() => (playing ? stopPlay() : startPlay()));
  splitBox = createCheckbox('lower half: the domain, upper half: its image at t = 1', false);
  uiRow(splitBox);
  splitBox.changed(() => redraw());
  if (window.HIDE_MAP) { tSlider.elt.parentElement.style.display = 'none'; }
  if (window.HIDE_MAP || window.HIDE_SPLIT) splitBox.elt.parentElement.style.display = 'none';
  shapeSel = createSelect();
  uiRow(shapeSel);
  for (const sh of SHAPES) shapeSel.option(sh.name);
  shapeSel.changed(() => redraw());
  if (window.FIXED_SHAPE) { shapeSel.selected(FIXED_SHAPE); shapeSel.style('display', 'none'); }
  noLoop();
}

// Play button: t sweeps 0 -> 1 -> 0 -> ..., t = (1 - cos(pi s)) / 2 for s moving at a constant speed up and down between 0 and 1, so it
// eases in and out at both extremes (the speed of t is 0 there). s is kept apart from the slider, which only has steps of 0.001.
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

function windowResized() { resizeCanvas(windowWidth, windowHeight); redraw(); }

// K (1 + s z^n)^m, principal branch (Re(1 + s z^n) > 0 on the disc), z = (x, y)
function field(x, y, sh) {
  if (sh.atan) {                      // -i T G z / arctan(z)
    if (x * x + y * y < 1e-16) return [0, -T_ATAN * sh.K];
    const ar = 0.5 * Math.atan2(2 * x, 1 - x * x - y * y);
    const ai = -0.25 * Math.log(((1 - y) * (1 - y) + x * x) / ((1 + y) * (1 + y) + x * x));
    const q = ar * ar + ai * ai;
    const fr = sh.K * (x * ar + y * ai) / q, fi = sh.K * (y * ar - x * ai) / q;
    return [T_ATAN * fi, -T_ATAN * fr];
  }
  let pr = 1, pi = 0;
  for (let i = 0; i < sh.n; i++) { const t = pr * x - pi * y; pi = pr * y + pi * x; pr = t; }
  const wr = 1 + sh.s * pr, wi = sh.s * pi;
  const r = Math.pow(Math.hypot(wr, wi), sh.m), th = sh.m * Math.atan2(wi, wr);
  return [sh.K * r * Math.cos(th), sh.K * r * Math.sin(th)];
}

// phi(w) and |phi'(w)|^2 = |1/g'(phi)|^2 for a polygon, by RK4 on dphi/ds = w / g'(phi), phi(0) = 0, s in [0, 1]
function phiPoly(wx, wy, sh) {
  const n = 16, dt = 1 / n;
  let x = 0, y = 0;
  const F = (px, py) => { const [a, b] = field(px, py, sh); return [wx * a - wy * b, wx * b + wy * a]; };
  for (let i = 0; i < n; i++) {
    const k1 = F(x, y);
    const k2 = F(x + dt / 2 * k1[0], y + dt / 2 * k1[1]);
    const k3 = F(x + dt / 2 * k2[0], y + dt / 2 * k2[1]);
    const k4 = F(x + dt * k3[0], y + dt * k3[1]);
    x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  }
  const [a, b] = field(x, y, sh);
  return [x, y, a * a + b * b];
}

// phi(w) = (rho^(1/a) - 1) / (rho^(1/a) + 1), rho = (1 + w) / (1 - w); |phi'|^2 = |1 - phi^2|^2 / (a^2 |1 - w^2|^2)
function phiLens(wx, wy, a) {
  const dr = 1 - wx, den = dr * dr + wy * wy;
  const rr = ((1 + wx) * dr - wy * wy) / den, ri = 2 * wy / den;
  const m = Math.pow(Math.hypot(rr, ri), 1 / a), th = Math.atan2(ri, rr) / a;
  const er = m * Math.cos(th), ei = m * Math.sin(th);
  const d2 = (er + 1) * (er + 1) + ei * ei;
  const x = (er * er + ei * ei - 1) / d2, y = 2 * ei / d2;
  const zr = 1 - (x * x - y * y), zi = -2 * x * y;           // 1 - phi^2
  const qr = 1 - (wx * wx - wy * wy), qi = -2 * wx * wy;     // 1 - w^2
  return [x, y, (zr * zr + zi * zi) / (a * a * (qr * qr + qi * qi))];
}

// k^2 |phi|^(2k-2) |phi'|^2: the pullback by phi of the area form of w -> w^k (k-to-1), total area k pi over D.
// It depends on w only through the baked values rho2 = |phi(w)|^2 and d2 = |phi'(w)|^2.
const densBaked = (rho2, d2, k) => { const v = k * k * Math.pow(rho2, k - 1) * d2; return isFinite(v) ? v : 0; };

// Boundary of D: points g(e^(i th)) and |phi'|^2 = |1/g'|^2 there (the density just inside D is k^2 |phi'|^2, since |phi| = 1)
function boundary(sh) {
  const pts = [];
  for (let i = 0; i < NB; i++) {
    const th = 2 * Math.PI * i / NB, ray = rayImage(th, sh), [x, y] = ray[ray.length - 1];
    const zx = (1 - 1e-6) * Math.cos(th), zy = (1 - 1e-6) * Math.sin(th);
    let d2;
    if (sh.lens) {
      const zr = 1 - (zx * zx - zy * zy), zi = -2 * zx * zy, qr = 1 - (x * x - y * y), qi = -2 * x * y;
      d2 = (zr * zr + zi * zi) / (sh.lens * sh.lens * (qr * qr + qi * qi));
    } else { const [a, b] = field(zx, zy, sh); d2 = a * a + b * b; }
    pts.push([x, y, isFinite(d2) ? d2 : 0]);
  }
  return pts;
}

// Everything that depends on the shape but not on k is computed once per shape and canvas scale:
// (|phi|^2, |phi'|^2) on the pixel grid and on the grid used for J_k, and the images of the radial lines.
// J_k(x, y) = int_0^y density(x, t) dt, for the lines, the shading and the border, all by one quadrature: NX + 1 columns x_i = colX(i) and NTC + 1 nodes
// up each column, t_j = top (1 - (1 - j/NTC)^TP) (the substitution clusters the nodes toward the top of D, where the density is a spike of width ~ 1/k for large k).
const NX = 400, NTC = 240, TP = 4;
const colX = i => -Math.cos(Math.PI * i / NX);   // the x of column i, from -1 to 1, clustered toward +-1 (where J_k(x, top(x)) changes fastest)
const baked = {};
function bake(sh, R) {
  const c = baked[sh.name];
  if (c && c.R === R) return c;
  let hmax = 0;
  for (let i = 0; i <= 200; i++) hmax = Math.max(hmax, sh.top(-1 + i / 100));
  const RH = Math.ceil(R * hmax) + 1, d = 2 * R + 1, h = 2 * RH + 1;   // pixel grid covers x in [-1, 1], y in [-hmax, hmax]
  const pix = { rho2: new Float64Array(d * h), d2: new Float64Array(d * h), inside: new Uint8Array(d * h) };
  const phiAt = (x, y) => { const [px, py, q] = sh.lens ? phiLens(x, y, sh.lens) : phiPoly(x, y, sh); return [px * px + py * py, q]; };
  for (let j = 0; j < h; j++)
    for (let i = 0; i < d; i++) {
      const x = (i - R) / R, y = (RH - j) / R, n = j * d + i;
      if (Math.abs(x) >= 1 || Math.abs(y) >= sh.top(x)) continue;
      pix.inside[n] = 1;
      [pix.rho2[n], pix.d2[n]] = phiAt(x, y);
    }
  // the density at the nodes of each column (it does not depend on k; draw integrates it)
  const col = { top: new Float64Array(NX + 1), rho2: new Float64Array((NX + 1) * (NTC + 1)), d2: new Float64Array((NX + 1) * (NTC + 1)) };
  for (let i = 0; i <= NX; i++) {
    const x = colX(i);
    col.top[i] = sh.top(x);
    for (let j = 0; j <= NTC; j++) [col.rho2[i * (NTC + 1) + j], col.d2[i * (NTC + 1) + j]] = phiAt(x, col.top[i] * (1 - Math.pow(1 - j / NTC, TP)));
  }
  const rays = [];
  for (let m = 0; m < NRAYS; m++) rays.push(rayImage(2 * Math.PI * m / NRAYS, sh));
  const bnd = boundary(sh);
  let maxPhi = 0;   // max of |phi'| on the boundary, i.e. of the harmonic measure density (up to 1/2 pi)
  for (const p of bnd) maxPhi = Math.max(maxPhi, Math.sqrt(p[2]));
  // the rays at the angles circTh(j), for the circles |w| = rho of the unit disc pulled back to D, g(rho e^(i th)), th in [0, pi]: see circleAt
  const fine = [];
  for (let j = 0; j <= CIRC_M; j++) fine.push(rayImage(circTh(j), sh));
  // g(conj z) is the mirror image of g(z) in the x axis for most shapes, but in the y axis for the Ti2 lens (its g is rotated by 90 degrees):
  // theta = 0 lands on the x axis in the first case, so the circles' other half is the mirror image in that axis
  const mirror = Math.abs(fine[0][RAY_N][1]) < 1e-6 ? 'y' : 'x';
  return baked[sh.name] = { R, RH, d, h, pix, col, rays, fine, mirror, bnd, maxPhi };
}

// Points g(s e^(i th)), s = 1 - v^2, along a ray of the disc, v from 1 to ~0 (the substitution tames the
// (1 - s)^(-m) singularity of g' at vertex rays). Polygons: integrate g' = 1/field; lenses: closed form.
function rayImage(th, sh) {
  const n = RAY_N, pts = [], c = Math.cos(th), sn = Math.sin(th);
  if (sh.lens) {
    for (let i = 0; i <= n; i++) {
      const v = 1 - (1 - 1e-3) * i / n, s = 1 - v * v, zx = s * c, zy = s * sn;
      const dr = 1 - zx, den = dr * dr + zy * zy;
      const rr = ((1 + zx) * dr - zy * zy) / den, ri = 2 * zy / den;
      const m = Math.pow(Math.hypot(rr, ri), sh.lens), t = Math.atan2(ri, rr) * sh.lens;
      const pr = m * Math.cos(t), pi = m * Math.sin(t), d2 = (pr + 1) * (pr + 1) + pi * pi;
      pts.push([(pr * pr + pi * pi - 1) / d2, 2 * pi / d2]);
    }
    return pts;
  }
  let gx = 0, gy = 0, prev = null;
  const integrand = v => {            // 2 v e^(i th) / field(z), z = s e^(i th)
    const s = 1 - v * v, [a, b] = field(s * c, s * sn, sh), q = a * a + b * b;
    const fr = (a * c + b * sn) / q, fi = (a * sn - b * c) / q; // e^(i th) conj(field) / |field|^2
    return [2 * v * fr, 2 * v * fi];
  };
  pts.push([0, 0]);
  for (let i = 0; i < n; i++) {
    const v0 = 1 - (1 - 1e-3) * i / n, v1 = 1 - (1 - 1e-3) * (i + 1) / n, vm = (v0 + v1) / 2;
    const f = integrand(vm);
    gx += f[0] * (v0 - v1); gy += f[1] * (v0 - v1);
    pts.push([gx, gy]);
  }
  return pts;
}

// g(rho e^(i circTh(j))), j = 0 .. CIRC_M, by interpolating along the finely sampled rays (rayImage's point j is at
// |z| = 1 - v_j^2, v_j = 1 - (1 - 1e-3) j / RAY_N)
function circleAt(fine, rho) {
  const u = (1 - Math.sqrt(1 - rho)) / (1 - 1e-3) * RAY_N, j = Math.min(RAY_N - 1, Math.floor(u)), f = u - j;
  return fine.map(ray => [ray[j][0] + f * (ray[j + 1][0] - ray[j][0]), ray[j][1] + f * (ray[j + 1][1] - ray[j][1])]);
}

// A closed polyline P of pixel points moved d pixels out (the exact offset of every segment, with mitered corners: a vertex moves by
// d (n1 + n2) / (1 + n1 . n2) for the unit outward normals n1, n2 of its two segments), so a stroke of width 2 d on the result has the
// polyline as its inner edge. The side that is out comes from the orientation of the polyline.
function offsetOut(P, d) {
  const Q = P.filter((p, i) => Math.hypot(p[0] - P[(i + P.length - 1) % P.length][0], p[1] - P[(i + P.length - 1) % P.length][1]) > 1e-6);   // no repeated points
  const n = Q.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const p = Q[i], q = Q[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }
  const sg = area > 0 ? 1 : -1;   // pixel coordinates (y down): positive area is clockwise on the screen
  const nrm = Q.map((p, i) => {   // outward unit normal of the segment from p to the next point
    const q = Q[(i + 1) % n], l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [sg * (q[1] - p[1]) / l, -sg * (q[0] - p[0]) / l];
  });
  return Q.map((p, i) => {
    const a = nrm[(i + n - 1) % n], b = nrm[i];
    let mx = a[0] + b[0], my = a[1] + b[1];
    const den = Math.max(1 + a[0] * b[0] + a[1] * b[1], 0.25);   // cap the miter at a sharp corner
    mx /= den; my /= den;
    return [p[0] + d * mx, p[1] + d * my];
  });
}

function draw() {
  const k = Math.round(Math.pow(10, kSlider.value()));
  const sh = SHAPES.find(s => s.name === shapeSel.value());
  background(BG);
  S = Math.min(width, height) * (window.VIEW_SCALE || 0.4);   // pixels per unit: [-1, 1] spans 2 VIEW_SCALE of the smaller side
  const cx = width / 2, cy = height * (window.VIEW_CY || 0.55);   // 0.55 leaves room for the controls overlaid at the top
  const R = Math.round(S), bk = bake(sh, R), d = bk.d, h = bk.h, RH = bk.RH, { rho2, d2, inside } = bk.pix;
  S = R;

  // density plot on D
  if (!img || img.width !== d || img.height !== h) img = createImage(d, h);
  img.loadPixels();
  const val = new Float64Array(d * h);
  let top = 0;
  for (let n = 0; n < d * h; n++)
    if (inside[n]) { const v = val[n] = densBaked(rho2[n], d2[n], k); if (v > top) top = v; }
  for (let n = 0; n < d * h; n++) {
    if (!inside[n]) { img.pixels[4 * n + 3] = 0; continue; }
    const c = mix(GREEN1, GREEN0, val[n] / top);
    img.pixels[4 * n] = c[0]; img.pixels[4 * n + 1] = c[1]; img.pixels[4 * n + 2] = c[2]; img.pixels[4 * n + 3] = 255;
  }
  img.updatePixels();

  // The whole picture after the map (x, y) -> (x, ymap(x, y)) at t (t = 0: the domain itself, with the harmonic-measure band).
  const scene = t => {
    const c4 = 4 / (Math.PI * k);
    let ymap = (x, y) => y, RH2 = RH, Jc = null;
    if (t > 0) {
      // J_k(x, y): the integral of the density up the vertical segment from (x, 0), by the trapezoid rule on the NTC + 1 baked nodes of the
      // column (t_j = top (1 - (1 - j/NTC)^TP), in the variable u = j/NTC), interpolated linearly between nodes and between columns
      Jc = new Float32Array((NX + 1) * (NTC + 1));
      for (let i = 0; i <= NX; i++) {
        const top = bk.col.top[i];
        if (top === 0) continue;
        const o = i * (NTC + 1), f = j => densBaked(bk.col.rho2[o + j], bk.col.d2[o + j], k);
        let acc = 0, prev = f(0), tPrev = 0;
        for (let j = 1; j <= NTC; j++) {
          const fj = f(j), tj = top * (1 - Math.pow(1 - j / NTC, TP));
          acc += 0.5 * (prev + fj) * (tj - tPrev);
          Jc[o + j] = acc; prev = fj; tPrev = tj;
        }
      }
      const Jcol = (i, ay) => {
        const top = bk.col.top[i];
        if (top === 0) return 0;
        if (ay >= top) return Jc[i * (NTC + 1) + NTC];
        const fj = NTC * (1 - Math.pow(1 - ay / top, 1 / TP)), j0 = Math.min(NTC - 1, Math.floor(fj)), o = i * (NTC + 1) + j0;
        return Jc[o] + (fj - j0) * (Jc[o + 1] - Jc[o]);
      };
      // Between columns (i = NX acos(-x) / pi) we interpolate at the same height relative to the top of D, y / top(x), not the same y: the
      // density is a spike along the boundary for large k, which follows top(x) from column to column (at the same y it would be crossed)
      const Jat = (x, ay) => {
        const tx = sh.top(Math.max(-1, Math.min(1, x)));
        if (!(tx > 0)) return 0;
        const rel = Math.min(1, ay / tx);
        const fx = NX * Math.acos(Math.max(-1, Math.min(1, -x))) / Math.PI, i0 = Math.min(NX - 1, Math.floor(fx)), a = fx - i0;
        return Jcol(i0, rel * bk.col.top[i0]) * (1 - a) + Jcol(i0 + 1, rel * bk.col.top[i0 + 1]) * a;
      };
      const Jt = new Float32Array(d * h);   // J_k at the pixel rows of the upper half (row RH is y = 0)
      for (let i = 0; i < d; i++) for (let j = 0; j < RH; j++) Jt[j * d + i] = Jat((i - R) / R, (RH - j) / R);
      ymap = (x, y) => { const ay = Math.abs(y); return Math.sign(y) * ((1 - t) * ay + t * c4 * Jat(x, ay)); };

      // push the shading forward: in the column i the rows j = RH, RH - 1, ... (y increasing) go to Y_j = (1 - t) y_j + t c4 J_j, which is
      // non-decreasing, so each destination row takes the color interpolated at its preimage (two pointers up the column); mirrored below the axis
      let ymax = 0;
      for (let i = 0; i < d; i++) ymax = Math.max(ymax, (1 - t) * RH / R + t * c4 * Jt[i]);
      RH2 = Math.ceil(R * ymax) + 1;
      const h2 = 2 * RH2 + 1;
      if (!img2 || img2.width !== d || img2.height !== h2) img2 = createImage(d, h2);
      img2.loadPixels();
      img2.pixels.fill(0);
      for (let i = 0; i < d; i++) {
        const Y = j => (1 - t) * (RH - j) / R + t * c4 * Jt[j * d + i];
        let sj = RH;
        for (let r = 0; r <= RH2; r++) {
          const Yd = r / R;
          while (sj > 0 && Y(sj - 1) <= Yd) sj--;
          if (sj === 0 || !inside[sj * d + i]) continue;
          let v = val[sj * d + i];
          if (inside[(sj - 1) * d + i]) { const y0 = Y(sj), y1 = Y(sj - 1); v += (Yd - y0) / Math.max(y1 - y0, 1e-12) * (val[(sj - 1) * d + i] - v); }
          const col = mix(GREEN1, GREEN0, v / top);
          for (const rr of [RH2 - r, RH2 + r]) {
            const n = 4 * (rr * d + i);
            img2.pixels[n] = col[0]; img2.pixels[n + 1] = col[1]; img2.pixels[n + 2] = col[2]; img2.pixels[n + 3] = 255;
          }
        }
      }
      img2.updatePixels();
      image(img2, cx - R, cy - RH2);
    } else image(img, cx - R, cy - RH);
    const P = (x, y) => [cx + x * S, cy - ymap(x, y) * S];   // a point of the picture, after the map

    // The boundary is not pushed forward: its image is the curve (x, (1 - t) top(x) + t 4 J_k(x, top(x)) / (pi k)) by the same quadrature as the lines,
    // and the pieces drawn along it are made on the CPU with their own widths in pixels, so the map does not stretch them.
    const border = [];   // the closed curve, counterclockwise: the boundary of D at t = 0
    if (t === 0) for (const [x, y] of bk.bnd) border.push([x, y]);
    else {
      const up = i => [colX(i), (1 - t) * bk.col.top[i] + t * c4 * Jc[i * (NTC + 1) + NTC]];   // the top of column i, by the same quadrature as the lines
      border.push([1, 0]);
      for (let i = NX; i >= 0; i--) border.push(up(i));
      border.push([-1, 0]);
      for (let i = 0; i <= NX; i++) { const [x, y] = up(i); border.push([x, -y]); }
    }
    if (t === 0 && !window.CONST_BORDER) {
      // Band outside D: the harmonic measure of D from 0, i.e. the pushforward of d(theta)/2pi under theta -> g(e^(i theta)),
      // whose density with respect to arc length is |phi'|/(2 pi) on the boundary. Normalized by its maximum and scaled so the widest point is 20 k / 100 pixels, so it only shows for large k.
      // (For t > 0 the border is just the constant-width stroke below.)
      const bnd = bk.bnd, outer = [];
      for (let i = 0; i < NB; i++) {
        const p = bnd[(i + 1) % NB], q = bnd[(i + NB - 1) % NB], tx = p[0] - q[0], ty = p[1] - q[1], l = Math.hypot(tx, ty) || 1;
        const w = (window.BAND_MAX || 20 * k / 100) * Math.sqrt(bnd[i][2]) / bk.maxPhi / S;   // outward normal of a counterclockwise curve is (ty, -tx)
        outer.push([bnd[i][0] + ty / l * w, bnd[i][1] - tx / l * w]);
      }
      noStroke(); fill(...SAND);
      beginShape();
      for (const [x, y] of outer) vertex(cx + x * S, cy - y * S);
      beginContour();
      for (let i = NB - 1; i >= 0; i--) vertex(cx + bnd[i][0] * S, cy - bnd[i][1] * S);
      endContour();
      endShape(CLOSE);
    }

    // images under g of the circles |w| = const of the unit disc (evenly spaced in |w|^k), carried along the map like everything else
    noFill(); strokeWeight(CIRC_W); strokeJoin(ROUND);
    stroke(CIRC_COLOR[0], CIRC_COLOR[1], CIRC_COLOR[2], CIRC_A);
    for (let m = 1; m < CIRC_N; m++) {
      const half = circleAt(bk.fine, Math.pow(m / CIRC_N, 1 / k)).map(([x, y]) => P(x, y));   // theta in [0, pi]; the rest is its mirror image
      beginShape();
      for (const [px, py] of half) vertex(px, py);
      for (let j = CIRC_M - 1; j >= 1; j--) vertex(bk.mirror === 'y' ? half[j][0] : 2 * cx - half[j][0], bk.mirror === 'y' ? 2 * cy - half[j][1] : half[j][1]);
      endShape(CLOSE);
    }

    // images of the disc's radial lines under g, fading out toward the center (the point s of a ray is |z| = 1 - v^2, v from 1 down);
    // the opacity goes from the plain fade at t = 0 to |w|^k (w = z the point of the disc, so the lines show where the density sits) at t = 1
    // (flat caps — p5 calls them SQUARE: round caps overlap where consecutive segments meet, which doubles the opacity there and shows as dots)
    noFill(); strokeWeight(RAY_W0 + RAY_W1 * Math.log10(k)); strokeCap(SQUARE);
    for (const ray of bk.rays) {
      for (let i = 1; i < ray.length; i++) {
        const vm = 1 - (1 - 1e-3) * (i - 0.5) / RAY_N, r = 1 - vm * vm;   // |z| at the middle of the segment
        const plain = (RAY_A + (255 - RAY_A) * r ** RAY_POW) * Math.min(1, (r / RAY_FADE) ** 2);   // the opacity of the domain's picture
        stroke(SAND[0], SAND[1], SAND[2], (1 - t) * plain + t * 255 * r ** k);   // as t grows, |w|^k (w = z, the point of the disc) takes over
        line(...P(ray[i - 1][0], ray[i - 1][1]), ...P(ray[i][0], ray[i][1]));
      }
    }

    strokeCap(ROUND);
    // sand border of constant width, just outside the boundary (the stroke's inner edge is the boundary itself, so it covers no edges of the picture)
    const ring = offsetOut(border.map(([x, y]) => [cx + x * S, cy - y * S]), BORDER_W / 2);
    stroke(SAND[0], SAND[1], SAND[2]); strokeWeight(BORDER_W); strokeJoin(MITER);
    beginShape();
    for (const [px, py] of ring) vertex(px, py);
    endShape(CLOSE);
  };

  // The checkbox draws the lower half at t = 0 and the upper half at t = 1, each clipped to its half of the picture.
  const split = !window.HIDE_MAP && !window.HIDE_SPLIT && splitBox.checked();
  if (split) {
    for (const [tv, y0, y1] of [[1, 0, cy], [0, cy, height]]) {
      drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(0, y0, width, y1 - y0); drawingContext.clip();
      scene(tv);
      restoreContext();
    }
  } else scene(window.HIDE_MAP ? 0 : tSlider.value());

  kOut.html('k = ' + k);
  tOut.html(split ? 't = 0 | 1' : 't = ' + (window.HIDE_MAP ? 0 : tSlider.value()).toFixed(2));
  if (split) tSlider.attribute('disabled', ''); else tSlider.elt.removeAttribute('disabled');
}
