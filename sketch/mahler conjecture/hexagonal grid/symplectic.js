// Symplectic mode, on the CPU (no inverse of the symplectomorphism is needed).
//
//   h(z) = -i F(-i z) = -(8/pi^2) chi_2(z) maps the unit disc onto the "lens"; g is its inverse.
//   Only |g| and |g'| are used (the sign of h does not matter: g is odd).
//   Table (once):  |g|^2 and |g'|^2 on a grid in (a, c) = (Re, Im) of the lens, from the ODE
//                  dz/dc = i / h'(z) along each vertical line a = const, started at the real solution of h(z) = a.
//   Per k:         J_k(a + ic) = k^2 int_0^c |g(a + it)|^(2k-2) |g'(a + it)|^2 dt (trapezoid sums) and |g|^(2k).
//   For a real point x and its faces b_j (a_j = <b_j, x>), with c_j = <b_j, eta>:
//     D_x        = {eta : a_j + i c_j in the lens for all j}, the intersection of the strips |c_j| < m(a_j),
//     Phi(eta)   = (1/k) sum_j J_k(a_j + i c_j) b_j      -- applied forward to D_x and to level sets drawn in eta,
//     F          = sum_j |g(a_j + i c_j)|^(2k)           -- its level set F = 1 in eta, pushed forward by Phi.
const LENS_N = 1024;   // samples of the lens height m(a), a in [0, 1] (lens mode, and the symplectic tables)
const SYM = { NA: 1024, NC: 512, NV: 512, GA: 0.999, GC: 0.743 };   // table size (a, c), rows of the inverse table, |Re| range, height range
const SYM_C = 8 / (Math.PI * Math.PI);

// artanh of the complex number x + iy, as [re, im]
const symAtanh = (x, y) => {
  const d = (1 - x) * (1 - x) + y * y;
  return [0.25 * Math.log(((1 - x * x - y * y) ** 2 + 4 * y * y) / (d * d)), 0.5 * Math.atan2(2 * y, 1 - x * x - y * y)];
};
// dz/dc = i z / (C artanh z)   (h' = C artanh(z) / z)
const symRhs = (x, y) => {
  if (x * x + y * y < 1e-12) return [0, 1 / SYM_C];
  const [ar, ai] = symAtanh(x, y), m = SYM_C * (ar * ar + ai * ai);
  // z / artanh z = z conj(artanh z) / |artanh z|^2, then times i / C
  const pr = (x * ar + y * ai) / m, pi = (y * ar - x * ai) / m;
  return [-pi, pr];
};

// the RGBA32F table, row j = c_j = GC j / (NC - 1), column i = a_i = -GA + 2 GA i / (NA - 1):
// R = |g|^2, G = |g'|^2, A = 1 inside the lens (else 0 and R = 9).
// symExt (a second table, same layout, A = 1 everywhere so that nothing is lost where the table above has A = 0): R = |g|^2 continued a little past the
// lens boundary (to |g| = 1.1, then held at 1.1^2: N is flat in the ocean, with no jump anywhere), so that lens approximate mode's N = F^(1/2k) is continuous
let symExt = null;
function buildGTable() {
  const { NA, NC, GA, GC } = SYM, out = new Float32Array(NA * NC * 4), dc = GC / (NC - 1);
  symExt = new Float32Array(NA * NC * 4);
  // real solution z(a) of h(z) = a for a >= 0: dz/da = z / (C atanh z)
  const half = NA / 2, z0 = new Float64Array(NA);
  let z = 0, aPrev = 0;
  for (let i = half; i < NA; i++) {
    const a = -GA + 2 * GA * i / (NA - 1), n = 20, h = (a - aPrev) / n;
    const f = u => (u < 1e-6 ? 1 / SYM_C : u / (SYM_C * 0.5 * Math.log((1 + u) / (1 - u))));
    for (let s = 0; s < n; s++) {
      const k1 = f(z), k2 = f(z + 0.5 * h * k1), k3 = f(z + 0.5 * h * k2), k4 = f(z + h * k3);
      z += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
    }
    aPrev = a; z0[i] = z; z0[NA - 1 - i] = -z;
  }
  for (let i = 0; i < NA; i++) {
    let x = z0[i], y = 0, alive = true, ext = true;
    for (let j = 0; j < NC; j++) {
      if (j > 0 && ext) {
        const h = dc / 2;
        for (let s = 0; s < 2; s++) {
          const [a1, b1] = symRhs(x, y), [a2, b2] = symRhs(x + 0.5 * h * a1, y + 0.5 * h * b1);
          const [a3, b3] = symRhs(x + 0.5 * h * a2, y + 0.5 * h * b2), [a4, b4] = symRhs(x + h * a3, y + h * b3);
          x += h / 6 * (a1 + 2 * a2 + 2 * a3 + a4); y += h / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
        }
      }
      const r2 = x * x + y * y, k = 4 * (j * NA + i);
      alive = alive && r2 < 0.999995 ** 2 && isFinite(r2);
      ext = ext && r2 < 1.21 && isFinite(r2);   // only a little past the lens boundary (|g| < 1.1): further out the continuation can wrap back inside the disc
      symExt[k] = ext ? r2 : 1.21; symExt[k + 3] = 1;
      if (alive) {
        const [ar, ai] = symAtanh(x, y);
        out[k] = r2; out[k + 1] = r2 < 1e-12 ? 1 / (SYM_C * SYM_C) : r2 / (SYM_C * SYM_C * (ar * ar + ai * ai)); out[k + 3] = 1;
      } else { out[k] = 9; out[k + 1] = 0; out[k + 3] = 0; }
    }
  }
  return out;
}


// the height of the lens above Re = a: the lens boundary is the image of the unit circle, Re = 1 - 2 theta / pi,
// Im = (8/pi^2) int_0^theta (1/2) ln cot(t/2) dt
function symLensHeight(a) {
  const theta = (Math.PI / 2) * (1 - Math.min(Math.abs(a), 1)), N = 400;
  let acc = 0;
  for (let i = 0; i < N; i++) {                          // t = theta u^2 smooths the log singularity at t = 0
    const u = (i + 0.5) / N;
    acc += 0.5 * Math.log(1 / Math.tan(0.5 * theta * u * u)) * 2 * theta * u / N;
  }
  return SYM_C * acc;
}

// ---- tables for one k ----
const symCPU = { g: null, k: 0, J: null, GK: null, M: null };   // |g|^2 table, and per k: J_k, |g|^2k, lens height m(a_i)
function symTables(k) {
  const { NA, NC, GC } = SYM, T = symCPU;
  if (!T.g) T.g = buildGTable();
  if (T.k === k) return T;
  const dc = GC / (NC - 1), g = T.g;
  T.J = new Float32Array(NA * NC); T.GK = new Float32Array(NA * NC); T.M = new Float32Array(NA);
  const dens = (r2, g2) => (k === 1 ? 1 : Math.pow(r2, k - 1)) * g2;
  for (let i = 0; i < NA; i++) {
    let acc = 0, prev = dens(g[4 * i], g[4 * i + 1]), last = 0, gk = 0;
    for (let j = 0; j < NC; j++) {
      const q = 4 * (j * NA + i);
      if (g[q + 3] > 0.5) {
        if (j > 0) { const d = dens(g[q], g[q + 1]); acc += 0.5 * dc * (prev + d); prev = d; last = j; }
        gk = Math.pow(g[q], k);
      }
      T.J[j * NA + i] = k * k * acc;                       // J and |g|^2k are frozen beyond the lens boundary
      T.GK[j * NA + i] = gk;
    }
    // the lens boundary lies between rows `last` and `last + 1`: extend J linearly to the true height m(a) (the integrand
    // is not small there), by one row so that interpolation stays linear up to the boundary
    const mTrue = symLensHeight((i / (NA - 1) * 2 - 1) * SYM.GA);
    if (last + 1 < NC) for (let j = last + 1; j < NC; j++) T.J[j * NA + i] = k * k * (acc + prev * dc);
    T.M[i] = Math.max(mTrue, last * dc);
  }
  T.k = k;
  return T;
}

// bilinear samples at a + ic (c >= 0): J_k, |g|^2k and the lens height m(a); results in symOut
const symOut = { J: 0, GK: 0, m: 0 };
function symSample(T, a, c) {
  const { NA, NC, GA, GC } = SYM;
  const fi = Math.min(NA - 1.000001, Math.max(0, (a + GA) / (2 * GA) * (NA - 1))), i = Math.floor(fi), u = fi - i;
  const fj = Math.min(NC - 1.000001, Math.max(0, c / GC * (NC - 1))), j = Math.floor(fj), v = fj - j;
  const p = j * NA + i, bil = A => (A[p] * (1 - u) + A[p + 1] * u) * (1 - v) + (A[p + NA] * (1 - u) + A[p + NA + 1] * u) * v;
  symOut.J = bil(T.J); symOut.GK = bil(T.GK); symOut.m = T.M[i] * (1 - u) + T.M[i + 1] * u;
  return symOut;
}

// ---- exact data along one vertical line, for the jewel at actual size ----
// J_k(a + ic), |g(a + ic)|^2k for c from 0 to the lens height m(a): RK4 on (z, J) with dz/dc = i z / (C artanh z),
// dJ/dc = k^2 |g|^(2k-2) |g'|^2, started at the real solution of h(z) = |a| (g is odd, J is even in a).
function symFiber(a, k, n = 3000) {
  a = Math.abs(a);
  let z = 0;
  if (a > 1e-12) {                                           // real solution: dz/da = z / (C atanh z)
    const f = u => (u < 1e-6 ? 1 / SYM_C : u / (SYM_C * 0.5 * Math.log((1 + u) / (1 - u)))), h = a / 4000;
    for (let i = 0; i < 4000; i++) {
      const k1 = f(z), k2 = f(z + 0.5 * h * k1), k3 = f(z + 0.5 * h * k2), k4 = f(Math.min(0.9999999, z + h * k3));
      z = Math.min(0.9999999, z + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4));
    }
  }
  const m = symLensHeight(a), dc = m / n, J = new Float64Array(n + 1), GK = new Float64Array(n + 1);
  let x = z, y = 0, acc = 0;
  const dens = (px, py) => {
    const r2 = px * px + py * py;
    if (r2 < 1e-12) return (k === 1 ? 1 : 0) / (SYM_C * SYM_C);
    const [ar, ai] = symAtanh(px, py), g2 = r2 / (SYM_C * SYM_C * (ar * ar + ai * ai));
    return (k === 1 ? 1 : Math.pow(r2, k - 1)) * g2;
  };
  const rhs = (px, py, jj) => { const [dx, dy] = symRhs(px, py); return [dx, dy, k * k * dens(px, py)]; };
  GK[0] = Math.pow(x * x + y * y, k);
  for (let i = 1; i <= n; i++) {
    if (x * x + y * y < 0.9999999 ** 2) {
      const h = dc, [a1, b1, c1] = rhs(x, y), [a2, b2, c2] = rhs(x + 0.5 * h * a1, y + 0.5 * h * b1);
      const [a3, b3, c3] = rhs(x + 0.5 * h * a2, y + 0.5 * h * b2), [a4, b4, c4] = rhs(x + h * a3, y + h * b3);
      x += h / 6 * (a1 + 2 * a2 + 2 * a3 + a4); y += h / 6 * (b1 + 2 * b2 + 2 * b3 + b4); acc += h / 6 * (c1 + 2 * c2 + 2 * c3 + c4);
    }
    J[i] = acc; GK[i] = Math.pow(Math.min(1, x * x + y * y), k);
  }
  return { m, dc, n, J, GK };
}
function fibSample(f, c) {
  const u = Math.min(f.n - 1e-9, Math.max(0, c / f.dc)), i = Math.floor(u), w = u - i;
  symOut.J = f.J[i] * (1 - w) + f.J[i + 1] * w; symOut.GK = f.GK[i] * (1 - w) + f.GK[i + 1] * w; symOut.m = f.m;
  return symOut;
}

// The jewel of the real point x with faces B = [[b_j]] (3 of them). The domain in the fiber is the L^2k approximation of the
// lens intersection, D = {eta : F(eta) = sum_j |g(a_j + i c_j)|^2k <= 1} (cut off by the lens intersection where F stays < 1):
// `D` is its boundary (closed polyline in eta) and `img` its image under Phi, which is the level set F = 1 in s; `lens` is the
// lens intersection itself, `polar` the vertices of the (scaled) polar body, Phi and the strip half-widths m_j. Everything is in the unscaled eta / s planes.
function symJewel(x, B, k, nr = 240, nb = 40, precise = false, refine = 0.03, levels = [], levelStep = 0.075) {
  const a = B.map(b => b[0] * x[0] + b[1] * x[1]);
  if (a.some(v => Math.abs(v) >= SYM.GA)) return null;
  // precise: exact fibers (RK4 along each vertical line) instead of the table, for the jewel at actual size
  const T = precise ? null : symTables(k), fib = precise ? a.map(v => symFiber(v, k)) : null;
  const smp = (j, c) => (precise ? fibSample(fib[j], c) : symSample(T, a[j], c));
  const m = a.map((v, j) => smp(j, 0).m * 0.999999);
  if (m.some(v => v < 1e-3)) return null;
  // D_x: a big square clipped by the strips |<b_j, eta>| <= m_j
  let P = [[-9, -9], [9, -9], [9, 9], [-9, 9]];
  B.forEach((b, j) => [1, -1].forEach(s => {
    const h = q => m[j] - s * (q[0] * b[0] + q[1] * b[1]), out = [];
    P.forEach((q, i) => {
      const r = P[(i + 1) % P.length], hq = h(q), hr = h(r);
      if (hq >= 0) out.push(q);
      if ((hq >= 0) !== (hr >= 0)) { const t = hq / (hq - hr); out.push([q[0] + t * (r[0] - q[0]), q[1] + t * (r[1] - q[1])]); }
    });
    P = out;
  }));
  const phi = eta => {                                       // Phi_k^x(eta) = (1/k) sum_j J_k(a_j + i c_j) b_j
    let sx = 0, sy = 0;
    B.forEach((b, j) => {
      const c = b[0] * eta[0] + b[1] * eta[1], J = smp(j, Math.min(Math.abs(c), m[j])).J / k * Math.sign(c);
      sx += J * b[0]; sy += J * b[1];
    });
    return [sx, sy];
  };
  // The level set F = 1: each term |g(a_j + i c_j)|^2k grows with |c_j|, so F grows along every ray from eta = 0; on the ray
  // eta = rho u find F = 1 by bisection on rho (or stop at the boundary of D_x if F is still < 1 there).
  const etaAt = (ph, target = 1) => {
    const u = [Math.cos(ph), Math.sin(ph)], cu = B.map(b => b[0] * u[0] + b[1] * u[1]);
    let rmax = Infinity;
    cu.forEach((v, j) => { if (Math.abs(v) > 1e-12) rmax = Math.min(rmax, m[j] / Math.abs(v)); });
    const Fr = rho => { let f = 0; cu.forEach((v, j) => { f += smp(j, Math.min(Math.abs(rho * v), m[j])).GK; }); return f; };
    let rho = rmax;
    if (Fr(rmax) > target) { let lo = 0, hi = rmax; for (let it = 0; it < 44; it++) { const mid = 0.5 * (lo + hi); if (Fr(mid) < target) lo = mid; else hi = mid; } rho = 0.5 * (lo + hi); }
    return [rho * u[0], rho * u[1]];
  };
  // Phi is very steep near the lens boundary, so the image of equal angular steps jumps around: refine adaptively, inserting the
  // midpoint angle wherever neighbouring points are far apart in eta or in Phi(eta) (up to 9 passes and 6000 points)
  const curve = (target, tol) => {
    let ang = Array.from({ length: nr + 1 }, (_, r) => 2 * Math.PI * r / nr);
    let eta = ang.map(p => etaAt(p, target)), im = eta.map(phi);
    for (let pass = 0; pass < 9 && ang.length < 6000; pass++) {
      const A = [ang[0]], E = [eta[0]], I = [im[0]];
      let added = false;
      for (let i = 0; i + 1 < ang.length; i++) {
        const far = Math.hypot(im[i + 1][0] - im[i][0], im[i + 1][1] - im[i][1]) > tol || Math.hypot(eta[i + 1][0] - eta[i][0], eta[i + 1][1] - eta[i][1]) > tol;
        if (far && ang[i + 1] - ang[i] > 1e-6) { const ph = 0.5 * (ang[i] + ang[i + 1]), e = etaAt(ph, target); A.push(ph); E.push(e); I.push(phi(e)); added = true; }
        A.push(ang[i + 1]); E.push(eta[i + 1]); I.push(im[i + 1]);
      }
      ang = A; eta = E; im = I;
      if (!added) break;
    }
    return { eta, img: im };
  };
  const { eta: level, img } = curve(1, refine);
  // level sets F = (1 + n H / depth)^2k, n = 0 (the shore), -1, -2, ... as in the island colormap, pushed forward (coarser)
  const levelCurves = levels.map(n => ({ n, img: curve(Math.pow(1 + n * levelStep, 2 * k), refine * 2).img }));
  // the polar body of K, scaled appropriately: the vertices +-(J_k(a_j + i m_j)/k) b_j are the images of the lens boundary on each face axis
  const polar = B.flatMap((b, j) => { const J = smp(j, m[j]).J / k; return [[J * b[0], J * b[1]], [-J * b[0], -J * b[1]]]; });
  return { D: level, img, lens: P, phi, m, polar, etaAt, levelCurves };
}


// ---- GLSL: F at a pixel, without inverting Phi in 2D ----
// With c_j = <b_j, eta> and u_j = J_k(a_j + i c_j)/k, s = Phi(eta) = sum_j u_j b_j and F = sum_j G_j(u_j), where G_j(u) is
// |g|^2k at the c_j with J_k/k = u. Each face is a monotone 1D function of u. For faces b_1, b_2, b_3 = l_1 b_1 + l_2 b_2:
//   u_1 = w_1 - l_1 u_3, u_2 = w_2 - l_2 u_3  with (w_1, w_2) = [b_1 b_2]^-1 s, and eta exists iff c_3 = l_1 c_1 + l_2 c_2,
//   i.e. R(u_3) = C_3(u_3) - l_1 C_1(u_1) - l_2 C_2(u_2) = 0, where C_j(u) = c_j. R' = C_3' + l_1^2 C_1' + l_2^2 C_2' > 0,
//   so the root is unique and found by bisection (no root: s is outside the image of Phi).
// Tables (rendered by the passes below, indexed by a = Re and f = u / U(a), U(a) = J_k(a + i m(a))/k):
//   jTex(a_i, c_j):  R = J_k, G = |g|^2k, B = index of the last row inside the lens, A = 1 inside the lens
//                    (rows beyond the lens boundary hold the end value J_k(a + i m(a)), extended by a linear tail)
//   invTex(a_i, f):  R = c, G = |g|^2k, B = U(a), A = m(a)

// Pass 1: J_k by a trapezoid sum over the |g|^2, |g'|^2 table (uG), one texel per (a_i, c_j)
const J_PASS_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uG, uM;      // the g table, and the lens heights m(a), a = i / (LN - 1)
uniform float uK, uDc;
const float LN = ${LENS_N}.0;
const float SNA = ${SYM.NA}.0, SGA = ${SYM.GA};
float dens(vec4 g) { return (uK <= 1.0 ? 1.0 : pow(max(g.x, 1e-30), uK - 1.0)) * g.y; }   // |g|^(2k-2) |g'|^2
void main() {
  ivec2 ij = ivec2(gl_FragCoord.xy);
  float a = abs(-SGA + 2.0 * SGA * float(ij.x) / (SNA - 1.0));
  float mTrue = a >= 0.9999 ? 0.0 : texture(uM, vec2((a * (LN - 1.0) + 0.5) / LN, 0.5)).r;
  float accJ = 0.0, accAll = 0.0, dPrev = dens(texelFetch(uG, ivec2(ij.x, 0), 0));
  int last = 0;
  for (int r = 1; r < ${SYM.NC}; r++) {
    vec4 g = texelFetch(uG, ivec2(ij.x, r), 0);
    if (g.w < 0.5) break;
    float d = dens(g);
    float step = 0.5 * uDc * (dPrev + d);
    accAll += step;
    if (r <= ij.y) accJ += step;
    dPrev = d; last = r;
  }
  if (ij.y <= last) {
    vec4 g = texelFetch(uG, ij, 0);
    outColor = vec4(uK * uK * accJ, pow(max(g.x, 1e-30), uK), float(last), 1.0);
  } else {
    // beyond the lens boundary: the end value, J_k(a + i m(a)) = k^2 (all + dens at the last row * (m - last dc))
    outColor = vec4(uK * uK * (accAll + dPrev * max(mTrue - float(last) * uDc, 0.0)), 1.0, float(last), 0.0);
  }
}`;

// Pass 2: invert J_k along each column: for f in [0, 1] find c with J_k(a + ic) = f J_end(a)
const INV_PASS_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uJ, uM;
uniform float uK, uDc;
const float LN = ${LENS_N}.0;
const float SNA = ${SYM.NA}.0, SGA = ${SYM.GA};
void main() {
  ivec2 ij = ivec2(gl_FragCoord.xy);
  float f = float(ij.y) / ${SYM.NV - 1}.0;
  float a = abs(-SGA + 2.0 * SGA * float(ij.x) / (SNA - 1.0));
  float mTrue = a >= 0.9999 ? 0.0 : texture(uM, vec2((a * (LN - 1.0) + 0.5) / LN, 0.5)).r;
  float Jend = texelFetch(uJ, ivec2(ij.x, ${SYM.NC - 1}), 0).r;
  int last = int(texelFetch(uJ, ivec2(ij.x, 0), 0).z + 0.5);
  vec4 gl = texelFetch(uJ, ivec2(ij.x, last), 0);
  float Jt = f * Jend, c, G;
  if (Jt >= gl.x) {                                     // in the tail between the last row and the lens boundary
    float w = (Jt - gl.x) / max(Jend - gl.x, 1e-12), cl = float(last) * uDc;
    c = cl + w * max(mTrue - cl, 0.0);
    G = mix(gl.y, 1.0, w);
  } else {                                              // binary search: the last row j with J(j) <= Jt
    int lo = 0, hi = last;
    for (int it = 0; it < 10; it++) {
      if (hi - lo <= 1) break;
      int mid = (lo + hi) / 2;
      if (texelFetch(uJ, ivec2(ij.x, mid), 0).x <= Jt) lo = mid; else hi = mid;
    }
    vec4 g0 = texelFetch(uJ, ivec2(ij.x, lo), 0), g1 = texelFetch(uJ, ivec2(ij.x, min(lo + 1, last)), 0);
    // (geometric, as jmix in SYMPLECTIC_GLSL: log J is close to linear in c where J is steep)
    float w = g0.x > 1e-30 && g1.x > g0.x * (1.0 + 1e-6) ? log(max(Jt, g0.x) / g0.x) / log(g1.x / g0.x) : (Jt - g0.x) / max(g1.x - g0.x, 1e-12);
    w = clamp(w, 0.0, 1.0);
    c = (float(lo) + w) * uDc;
    G = mix(g0.y, g1.y, w);
  }
  outColor = vec4(c, G, Jend / uK, mTrue);
}`;

// Used by the main shader (needs uBs[3] = the three faces, the best-conditioned pair first, uK and the samplers uInv, uJt; uT for sympNt).
const SYMPLECTIC_GLSL = `
uniform sampler2D uInv;
uniform vec2 uBs[3];
const float SNA = ${SYM.NA}.0, SNV = ${SYM.NV}.0, SGA = ${SYM.GA};

// N = F^(1/2k), F = sum_j |g(a_j + i c_j)|^2k, in log space (as lensApproxN): |g|^2k itself underflows to 0 at large k where |g| is small
float gAbs2(float a, float c);   // |g(a + ic)|^2, from the uGx table (defined in sketch.js)
float normN(vec3 a, vec3 c) {
  vec3 l = vec3(log(gAbs2(a.x, c.x) + 1e-30), log(gAbs2(a.y, c.y) + 1e-30), log(gAbs2(a.z, c.z) + 1e-30));
  float m = max(l.x, max(l.y, l.z));
  vec3 e = exp(uK * (l - m));
  float lnF = uK * m + log(e.x + e.y + e.z);
  // outside the ball, 1 + ln F / 2k + 20 (ln F)^2 instead of F^(1/2k) = 1 + ln F / 2k + ...: at large k, F^(1/2k) is barely above 1 all
  // over the corners of D_x (F ~ 2 there), and their thin images under Psi_t (spikes) would be drawn as shoreline. It has the same value
  // and slope at the shore (F = 1), so the anti-aliased shoreline is the same width on both sides.
  return lnF > 0.0 ? min(1.0 + 0.5 * lnF / uK + 20.0 * lnF * lnF, 2.5) : exp(0.5 * lnF / uK);   // (capped below the ocean's 3, see noJump)
}

// (c, |g|^2k, U, m) at the real part a and the fraction f = u / U(a) of the way to the lens boundary
vec4 invlook(float a, float f) {
  return texture(uInv, vec2(((a + SGA) / (2.0 * SGA) * (SNA - 1.0) + 0.5) / SNA, (clamp(f, 0.0, 1.0) * (SNV - 1.0) + 0.5) / SNV));
}

// N = F^(1/2k), F = sum_j |g(a_j + i c_j)|^2k, at the real point x and the imaginary part s = Phi_k^x(eta); 3.0 (ocean) where s is not in the image of Phi
float sympN(vec2 x, vec2 s) {
  float a[3]; vec4 h[3];
  for (int j = 0; j < 3; j++) {
    a[j] = dot(uBs[j], x);
    if (abs(a[j]) >= SGA) return 3.0;
    h[j] = invlook(a[j], 0.0);
    if (h[j].z < 1e-5) return 3.0;
  }
  mat2 M = mat2(uBs[0], uBs[1]);
  if (abs(determinant(M)) < 1e-6) return 3.0;
  mat2 Mi = inverse(M);
  vec2 w = Mi * s, l = Mi * uBs[2];
  // the u_3 for which every u_j stays in [-U_j, U_j]
  float lo = -h[2].z, hi = h[2].z;
  for (int j = 0; j < 2; j++) {
    float U = h[j].z;
    if (abs(l[j]) > 1e-9) {
      float t0 = (w[j] - U) / l[j], t1 = (w[j] + U) / l[j];
      lo = max(lo, min(t0, t1)); hi = min(hi, max(t0, t1));
    } else if (abs(w[j]) > U) return 3.0;
  }
  if (lo > hi) return 3.0;
  // C_j(u) = c_j with J_k(a_j + i c_j)/k = u (odd in u); R is increasing in u_3
  #define CJ(j, u) (sign(u) * invlook(a[j], abs(u) / h[j].z).x)
  float R_lo = CJ(2, lo) - l.x * CJ(0, w.x - l.x * lo) - l.y * CJ(1, w.y - l.y * lo);
  float R_hi = CJ(2, hi) - l.x * CJ(0, w.x - l.x * hi) - l.y * CJ(1, w.y - l.y * hi);
  if (R_lo > 1e-4 || R_hi < -1e-4) return 3.0;
  for (int it = 0; it < 26; it++) {
    float mid = 0.5 * (lo + hi);
    float R = CJ(2, mid) - l.x * CJ(0, w.x - l.x * mid) - l.y * CJ(1, w.y - l.y * mid);
    if (R < 0.0) lo = mid; else hi = mid;
  }
  float u3 = 0.5 * (lo + hi), u1 = w.x - l.x * u3, u2 = w.y - l.y * u3;
  return normN(vec3(a[0], a[1], a[2]), vec3(CJ(0, u1), CJ(1, u2), CJ(2, u3)));
}

// ---- the animation: s = Psi_t(eta) = (1 - t) eta + t Phi(eta), each point moving linearly from eta to Phi(eta) ----
// Psi_t is the gradient of the strictly convex E = (1 - t) |eta|^2 / 2 + t Q(eta), Q = sum_j H_j(c_j) / k with H_j' = J_k(a_j + i c_j),
// so for t < 1 it is one-to-one on the whole plane, and eta is the minimum of E(eta) - <s, eta>. Nested bisection finds it: with
// eta = al p + be q (p, q orthonormal), the be-derivative <Psi_t(eta) - s, q> increases with be, and at the minimizing be*(al) the
// al-derivative <Psi_t(eta) - s, p> increases with al (it is the derivative of the convex min over be). (Newton's method is unreliable
// here: at large k, J_k is nearly a step function of c.) eta outside D_x: s is outside the image of D_x.
uniform sampler2D uJt;         // the J_k table (jTex, linear filtering): R = J_k, G = |g|^2k, held at the end values past the lens
uniform float uT;
const float SNC = ${SYM.NC}.0, SGC = ${SYM.GC};
// J between two rows: at large k, J grows like exp(2 k kappa c) in the last few rows below the lens boundary, so it is interpolated
// geometrically (log J linear in c); linear interpolation there leaves kinks that make the shore wobble
float jmix(float J0, float J1, float v) { return J0 > 1e-30 && J1 > 1e-30 ? J0 * pow(J1 / J0, v) : mix(J0, J1, v); }
vec2 jlook(float a, float c) {   // (J_k(a + ic) / k, odd in c;  0)
  float fi = clamp((a + SGA) / (2.0 * SGA) * (SNA - 1.0), 0.0, SNA - 1.001), fj = min(abs(c) / SGC, 1.0) * (SNC - 1.0);
  int i = int(fi), j = min(int(fj), int(SNC) - 2);
  float u = fi - float(i), v = fj - float(j);
  float J0 = jmix(texelFetch(uJt, ivec2(i, j), 0).x, texelFetch(uJt, ivec2(i, j + 1), 0).x, v);
  float J1 = jmix(texelFetch(uJt, ivec2(i + 1, j), 0).x, texelFetch(uJt, ivec2(i + 1, j + 1), 0).x, v);
  return vec2(sign(c) * mix(J0, J1, u) / uK, 0.0);
}
vec2 psiRes(vec3 a, vec2 e, vec2 s, float t) {   // Psi_t(e) - s
  vec2 r = (1.0 - t) * e - s;
  for (int j = 0; j < 3; j++) r += t * jlook(a[j], dot(uBs[j], e)).x * uBs[j];
  return r;
}
float sympNt(vec2 x, vec2 s, float t) {
  if (t >= 0.999) return sympN(x, s);
  vec3 a, m;
  for (int j = 0; j < 3; j++) {
    a[j] = dot(uBs[j], x);
    if (abs(a[j]) >= SGA) return 3.0;
    vec4 h = invlook(a[j], 0.0);
    if (h.z < 1e-5) return 3.0;
    m[j] = h.w;
  }
  // R: a little more than the radius of D_x (its vertices are where two of the strip edges c_i = +-m_i, c_j = +-m_j meet)
  float R = 0.0;
  for (int i = 0; i < 3; i++) {
    mat2 M = transpose(mat2(uBs[i], uBs[(i + 1) % 3]));
    if (abs(determinant(M)) < 1e-9) continue;
    mat2 Mi = inverse(M);
    R = max(R, max(length(Mi * vec2(m[i], m[(i + 1) % 3])), length(Mi * vec2(m[i], -m[(i + 1) % 3]))));
  }
  R *= 1.05;
  vec2 p = normalize(uBs[0]), q = vec2(-p.y, p.x);
  float alo = -R, ahi = R, be = 0.0;
  vec2 r;
  for (int it = 0; it < 18; it++) {
    float al = 0.5 * (alo + ahi), blo = -R, bhi = R;
    for (int jt = 0; jt < 18; jt++) {
      be = 0.5 * (blo + bhi);
      if (dot(psiRes(a, al * p + be * q, s, t), q) < 0.0) blo = be; else bhi = be;
    }
    be = 0.5 * (blo + bhi);
    r = psiRes(a, al * p + be * q, s, t);
    if (dot(r, p) < 0.0) alo = al; else ahi = al;
  }
  vec2 e = 0.5 * (alo + ahi) * p + be * q;
  // no cut-off at the edge of D_x: |g| is continued a little past the lens (as in lens approximate), so N rises smoothly through 1 there
  // and the shore is not broken up where {F <= 1} nearly fills D_x (large k)
  vec3 c = vec3(dot(uBs[0], e), dot(uBs[1], e), dot(uBs[2], e));
  return normN(a, c);
}

// J_k(a + i m(a)) / k -> pi/4 as k -> infinity (the mass k^2 |g|^(2k-2) |g'|^2 piles up at the lens boundary, and
// |g'| / (2 cos(angle of the boundary)) = pi/4 all along it): the polar body is outlined at that scale
const float PI4 = 0.7853981633974483;

// the gauge of the polar body conv{+-b_j}: the l^1 atomic norm min sum_j |l_j| over sum_j l_j b_j = p, attained with one l_j = 0
// (a vertex of the linear program)
float polarGauge(vec2 p) {
  float g = 1e9;
  for (int i = 0; i < 3; i++) {
    mat2 M = mat2(uBs[i], uBs[(i + 1) % 3]);
    if (abs(determinant(M)) > 1e-9) { vec2 l = inverse(M) * p; g = min(g, abs(l.x) + abs(l.y)); }
  }
  return g;
}
`;
