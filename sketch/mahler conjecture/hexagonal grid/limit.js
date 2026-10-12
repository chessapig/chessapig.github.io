// Limit mode: a convex body K, the 2n-ellipse {x : sum_i |x - f_i| <= d} whose 2n foci are +-v_i (n draggable points v_i and their
// negatives; d = 2 sum |v_i| + LIM_MARGIN n, so the origin is always inside), its supporting hyperplanes b (<b, x> <= 1 tangent to K), and at
// each point p of K, the pink curve:
//   the curve    c(b) = b / V(<b, p>) over the supporting hyperplanes b,
//   its convex hull; the b whose points c(b) lie on the exterior of that hull; and the convex hull of those b (the pink curve).
// V(t) is the profile of F(D) (the vertically oriented lens, the image of the unit disc under F): the x value of its rightmost
// point on the horizontal line y = t. It is the lens height m of symplectic.js: V(t) = m(|t|), V(0) = 8G/pi^2, V(+-1) = 0.
// The points p lie on a triangular lattice, deformed like the pink shapes: a circle packing mapped by the eigenbasis (r_i, sqrt(l_i))
// of the second moments of the dual curve {b}, so that the pink shapes pack. The shore is the part of K where the curve c(b) is not
// convex (some of its points are inside its hull).

const LIM_MARGIN = 0.55;                                    // how far the level set d lies above the value at the origin, per pair of foci (smaller: a smaller K)
let limFoci = [[0.7, 0.2], [-0.2, 0.65]];      // the two draggable points v_i; the foci are +-v_i, four points in all
let limDrag = null, limHover = null;                       // { i: handle, mode: 'move' } of the dragged / hovered handle (handle 2i is v_i, 2i + 1 is -v_i)

// V(t) = m(|t|), tabulated once
let limTab = null;
function lensV(t) {
  if (!limTab) { limTab = new Float64Array(2050); for (let i = 0; i <= 2048; i++) limTab[i] = symLensHeight(i / 2048); }
  t = Math.abs(t);
  if (t >= 1) return 0;
  const x = t * 2048, i = Math.floor(x);
  return limTab[i] * (1 - (x - i)) + limTab[i + 1] * (x - i);
}

// K: the 2n-ellipse F(x) = sum |x - f_i| - d <= 0. F is convex and F(0) < 0, so along each ray from the origin F has one root rho(phi);
// there the outward normal is grad F, and the supporting hyperplane is b = n / <n, x>. The samples (x_j, b_j) are taken at equal steps
// of the ray angle phi.
const limNB = 120;                                          // directions for the shader's gauge
let limBodyCache = { key: '', body: null };
function limBody(V = limFoci) {
  const key = JSON.stringify(V);
  if (V === limFoci && limBodyCache.key === key) return limBodyCache.body;
  const foci = V.flatMap(v => [v, [-v[0], -v[1]]]), d = foci.reduce((t, f) => t + Math.hypot(f[0], f[1]), 0) + LIM_MARGIN * V.length;
  const F = (x, y) => { let t = -d; for (const f of foci) t += Math.hypot(x - f[0], y - f[1]); return t; };
  const body = { ok: V.length > 0, foci, d, F, samples: {} };
  body.at = phi => {                                        // the boundary point and the supporting hyperplane in the ray direction phi
    const c = Math.cos(phi), s = Math.sin(phi);
    let lo = 0, hi = (d + foci.reduce((t, f) => t + Math.hypot(f[0], f[1]), 0)) / foci.length;
    for (let it = 0; it < 44; it++) { const mid = 0.5 * (lo + hi); if (F(mid * c, mid * s) < 0) lo = mid; else hi = mid; }
    const rho = 0.5 * (lo + hi), x = [rho * c, rho * s];
    let gx = 0, gy = 0;
    for (const f of foci) { const dx = x[0] - f[0], dy = x[1] - f[1], r = Math.hypot(dx, dy) + 1e-12; gx += dx / r; gy += dy / r; }
    const gn = Math.hypot(gx, gy), t = (gx * x[0] + gy * x[1]) / gn;
    return { x, b: [gx / gn / t, gy / gn / t] };
  };
  if (V === limFoci) limBodyCache = { key, body };
  return body;
}
const limSamples = (body, n) => body.samples[n] || (body.samples[n] = Array.from({ length: n }, (_, j) => body.at(2 * Math.PI * j / n)));
const limBoundary = (body, n = 360) => limSamples(body, n).map(q => q.x);
const limDualSamples = (body, n) => limSamples(body, n).map(q => q.b);

// the symmetric gauge max_b |<b, x>|: p lies in K and -K, so every fiber exists, iff it is < 1
function limGaugeSym(body, x, n = 120) {
  let g = 0;
  for (const b of limDualSamples(body, n)) g = Math.max(g, Math.abs(b[0] * x[0] + b[1] * x[1]));
  return g;
}

// the second moments of the dual curve {b} (weighted by its arclength): C = int b b^T ds / int ds = R diag(l_1, l_2) R^T, with
// eigenvectors r_1, r_2. The pink shapes are (close to) the dual curve scaled by alpha: semi-axes alpha sqrt(2 l_i) along r_i, a
// circle deformed by T = alpha sqrt(2) R diag(sqrt(l_1), sqrt(l_2)) R^T. The same T applied to a triangular circle packing packs the
// pink shapes.
function limMoments(body, n = 360) {
  const B = limDualSamples(body, n);
  let cxx = 0, cxy = 0, cyy = 0, w = 0;
  for (let i = 0; i < n; i++) {
    const a = B[i], b = B[(i + 1) % n], ds = Math.hypot(b[0] - a[0], b[1] - a[1]), m = [0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1])];
    cxx += ds * m[0] * m[0]; cxy += ds * m[0] * m[1]; cyy += ds * m[1] * m[1]; w += ds;
  }
  cxx /= w; cxy /= w; cyy /= w;
  const th = 0.5 * Math.atan2(2 * cxy, cxx - cyy), c = Math.cos(th), s = Math.sin(th);
  return { r1: [c, s], r2: [-s, c], l1: cxx * c * c + 2 * cxy * c * s + cyy * s * s, l2: cxx * s * s - 2 * cxy * c * s + cyy * c * c };
}

// the curve c(b) at p, and its hull, and the pink curve; null where p is not in K and -K
function limCurve(p, body, n) {
  const curve = [];
  const B = limDualSamples(body, n);
  for (let i = 0; i < n; i++) {
    const b = B[i], a = b[0] * p[0] + b[1] * p[1];
    if (Math.abs(a) >= 0.9995) return null;
    const V = Math.max(lensV(a), 1e-3), c = [b[0] / V, b[1] / V]; c.b = b;          // remember which hyperplane b the point came from
    curve.push(c);
  }
  return curve;
}
function limPicture(p, body = limBody(), n = 240) {
  if (!body.ok) return null;
  const curve = limCurve(p, body, n);
  if (!curve) return null;
  const H = hull(curve);                                    // the points c(b) on the exterior of the hull ...
  const bhull = hull(H.map(c => c.b));                      // ... and the convex hull of their b: the pink curve
  return { curve, hull: H, bhull };
}

// is the curve c(b) at p convex (every turn has the same sign)?
function limConvex(p, body, n = 180) {
  const c = limCurve(p, body, n);
  if (!c) return false;
  let scale = 0; c.forEach(q => { scale += Math.hypot(q[0], q[1]); }); scale /= n;
  const tol = -1e-7 * scale * scale;
  for (let i = 0; i < n; i++) {
    const a = c[i], b = c[(i + 1) % n], d = c[(i + 2) % n];
    if ((b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0]) < tol) return false;
  }
  return true;
}

// the shore: along each ray from the origin, the radius where the curve first fails to be convex (the band up to the end of the
// region where every fiber exists), cached per body
let limShoreCache = { key: '', ring: null };
function limShore(body) {
  const key = JSON.stringify(limFoci);
  if (limShoreCache.key === key) return limShoreCache.ring;
  const NR = 72, outer = [], inner = [];
  for (let j = 0; j < NR; j++) {
    const th = 2 * Math.PI * j / NR, u = [Math.cos(th), Math.sin(th)];
    let lo = 0, hi = 0.9995 / limGaugeSym(body, u, 240);                  // the radius where the fibers stop existing
    outer.push([hi * u[0], hi * u[1]]);
    if (limConvex([hi * 0.999 * u[0], hi * 0.999 * u[1]], body)) { inner.push([hi * u[0], hi * u[1]]); continue; }
    for (let it = 0; it < 10; it++) { const mid = 0.5 * (lo + hi); if (limConvex([mid * u[0], mid * u[1]], body)) lo = mid; else hi = mid; }
    inner.push([0.5 * (lo + hi) * u[0], 0.5 * (lo + hi) * u[1]]);
  }
  limShoreCache = { key, ring: { outer, inner } };
  return limShoreCache.ring;
}

// ---- drawing (p5): the pink curve is rendered like the flower island, placed at `base` (the base point p) and scaled by `scale` ----
// Its level sets are those of its gauge function g (the Minkowski functional about the origin, the base point): the nested copies t B of
// the body B, t = 1 + n H / DEPTH (n = 0 is the shore, drawn with the thick border), colored by elevation DEPTH (g - 1) in the flower
// colormap, light edge to deep center.
const flowerRGB = L => { const d = 1 - Math.exp(L / 2.5); return [0, 1, 2].map(i => FLOWER_EDGE[i] + (FLOWER_CENTER[i] - FLOWER_EDGE[i]) * d); };
const LIM_LEVELS = 12;
function limDraw(pic, scale, base, w) {
  if (!pic) return;
  const lin = FLOWER_LINE;
  strokeJoin(ROUND);
  const band = (t, L, wt, alpha) => {
    fill(...flowerRGB(L)); stroke(lin[0], lin[1], lin[2], alpha); strokeWeight(wt);
    beginShape(); pic.bhull.forEach(q => vertex(...toPx([base[0] + scale * t * q[0], base[1] + scale * t * q[1]]))); endShape(CLOSE);
  };
  band(1, -H / 2, 1.6 * w, 255);                                              // the shore, gauge = 1
  for (let n = -1; n >= -LIM_LEVELS; n--) band(1 + n * H / DEPTH, (n - 0.5) * H, 0.5 * w, 140);   // inner level sets, outer to inner
}

// Only the lattice points in view are drawn; their pictures are cached.
let limPicCache = { key: '', map: new Map() };
function limPicAt(p, body) {
  const key = JSON.stringify(limFoci);
  if (limPicCache.key !== key || limPicCache.map.size > 4000) limPicCache = { key, map: new Map() };
  const k = p[0].toFixed(6) + ',' + p[1].toFixed(6);
  if (!limPicCache.map.has(k)) limPicCache.map.set(k, limPicture(p, body, 120));
  return limPicCache.map.get(k);
}
let limMomentsCache = { key: '', m: null };
function limGrid() {
  const body = limBody(), items = [];
  if (!body.ok) return { items, alpha: 0.05 };
  const key = JSON.stringify(limFoci);
  if (limMomentsCache.key !== key) limMomentsCache = { key, m: limMoments(body) };
  const m = limMomentsCache.m, T1 = Math.sqrt(2 * m.l1), T2 = Math.sqrt(2 * m.l2);              // semi-axes of the dual ellipse, along r_1, r_2
  // the lattice (and the shapes with it) is rescaled so that its average spacing sqrt|det| is SCALE of the panel on the screen,
  // whatever K and the zoom: a big K does not fill the screen with many tiny copies of its polar
  const w = SCALE * Math.min(PW, PH) / S, alpha = w / Math.sqrt(2 * Math.sqrt(3) * T1 * T2);
  // circle packing (radius 1): centers 2 e_1 and 2 (e_1 / 2 + sqrt(3) / 2 e_2); deformed by T (shape semi-axes alpha T_i)
  const L0 = [2 * alpha * T1 * m.r1[0], 2 * alpha * T1 * m.r1[1]];
  const L1 = [2 * alpha * (0.5 * T1 * m.r1[0] + 0.5 * Math.sqrt(3) * T2 * m.r2[0]), 2 * alpha * (0.5 * T1 * m.r1[1] + 0.5 * Math.sqrt(3) * T2 * m.r2[1])];
  const det = L0[0] * L1[1] - L0[1] * L1[0];
  if (Math.abs(det) < 1e-12) return { items, alpha };
  // the part of the lattice in view: the corners of the panel, in lattice coordinates (i, j) relative to latO
  const corners = [toZ(0, 0), toZ(PW, 0), toZ(0, PH), toZ(PW, PH)], pad = 1.5;
  const ij = z => [((z[0] - latO[0]) * L1[1] - (z[1] - latO[1]) * L1[0]) / det, (L0[0] * (z[1] - latO[1]) - L0[1] * (z[0] - latO[0])) / det];
  const c = corners.map(ij), i0 = Math.floor(Math.min(...c.map(q => q[0])) - pad), i1 = Math.ceil(Math.max(...c.map(q => q[0])) + pad);
  const j0 = Math.floor(Math.min(...c.map(q => q[1])) - pad), j1 = Math.ceil(Math.max(...c.map(q => q[1])) + pad);
  if ((i1 - i0) * (j1 - j0) > 40000) return { items, alpha };
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const p = [latO[0] + i * L0[0] + j * L1[0], latO[1] + i * L0[1] + j * L1[1]];
    const pic = limPicAt(p, body);
    if (pic) items.push({ p, pic });
  }
  return { items, alpha };
}

// the shore, in sand, like the beach of the island: the band between the radius where the curve stops being convex and the edge
function limDrawShore(body) {
  const ring = limShore(body);
  noStroke(); fill(SAND[0], SAND[1], SAND[2], 235);
  beginShape(); ring.outer.forEach(q => vertex(...toPx(q))); beginContour(); [...ring.inner].reverse().forEach(q => vertex(...toPx(q))); endContour(); endShape(CLOSE);
}

function limDrawLeft() {
  const body = limBody();
  if (!body.ok) return;
  limDrawShore(body);
  const { items, alpha } = limGrid();
  items.forEach(({ p, pic }) => limDraw(pic, 0.9 * alpha, p, 0.7));          // scaled by 0.9: gaps between neighbours
  // K, and its foci +-v_i as handles
  noFill(); stroke(FOAM); strokeWeight(2.5); strokeJoin(ROUND);
  beginShape(); limBoundary(body).forEach(q => vertex(...toPx(q))); endShape(CLOSE);
  body.foci.forEach((f, h) => {
    const [x, y] = toPx(f), hot = limHover && limHover.i === h || limDrag && limDrag.i === h || limDrag && limDrag.i >> 1 === h >> 1 || limHover && limHover.i >> 1 === h >> 1;
    fill(hot ? ACTIVE : OCEAN1); stroke(FOAM); strokeWeight(2); circle(x, y, 11);
  });
}
function limDrawRight(p) {
  const pic = limPicture(p, limBody(), 480);
  if (pic) limDraw(pic, 1, [0, 0], 2);
}

// ---- dragging the four foci: handle 2i is v_i, handle 2i + 1 is -v_i (dragging either moves the pair) ----
function limHit(mx, my) {
  let best = null, bd = 12 * touchHit;
  limBody().foci.forEach((f, h) => { const [x, y] = toPx(f), d = Math.hypot(mx - x, my - y); if (d < bd) { bd = d; best = { i: h, mode: 'move' }; } });
  return best;
}
const limKey = h => (h ? h.i + h.mode : '');
// double-click (px) a focus to remove its pair, or empty space to add the pair +-z there; at least one pair stays
function limDoubleClick(mx, my, z) {
  const h = limHit(mx, my);
  if (!h) limFoci.push(z);
  else if (limFoci.length > 1) limFoci.splice(h.i >> 1, 1);
  limDrag = limHover = null;
}
function limDragTo(z) {
  if (!limDrag) return;
  limFoci[limDrag.i >> 1] = limDrag.i & 1 ? [-z[0], -z[1]] : z;
}

// the b_j at limNB directions, for the shader's gauge max_j |<b_j, x>|: [bx, by, ...]
function limDualFlat() {
  const out = [];
  limDualSamples(limBody(), limNB).forEach(b => out.push(b[0], b[1]));
  return out;
}
