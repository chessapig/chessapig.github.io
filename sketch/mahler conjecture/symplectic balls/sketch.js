// A surface M = F(R^2) in R^3 (left) and the graph of 1 - |F|^2 over a flat ocean at height 0 (right).
// F sends the circle of radius r to a tennis ball curve on the sphere of radius r:
//   F(r, theta) = r gamma_b(theta),  gamma_b = ((1 - b) cos t + b cos 3t, (1 - b) sin t - b sin 3t, 2 sqrt(b (1 - b)) sin 2t),
// which has |gamma_b| = 1, with b = B r^4 / (R0^4 + r^4) rising from a flat circle at the middle, steeply around r = R0,
// to the seam b = B far out. So |F| = r, and the level sets of |F| on M are tennis ball curves. The steep rise makes
// the unit level set nonconvex in the normal coordinates below.
// M is drawn in geodesic normal coordinates at 0: u = rho (cos phi, sin phi) is the point at distance rho along the
// geodesic leaving 0 in direction phi (exp_0, a diffeomorphism since M is negatively curved). The geodesics are
// integrated in the (x, y) chart above, baked ahead of time into expmap.js (which also holds the parameters below); each mesh vertex u
// carries its chart point (x, y) as a texture coordinate, where the shaders evaluate F and the flow. The right panel is
// the graph over u.
// (b < 1 everywhere, so the chart is all of R^2.)
// Both use the island colormap of ../island.js with elevation s = K (|F|^2 - 1), so the island is
// F^-1(unit ball) and its shore is the preimage of the unit sphere.
// Points whose downward gradient flow of |F|^2 (for the metric pulled back from R^3) reaches |F|^2 <= e = min(0.01, a / 50)
// by time t = log(a^2 / e) / 4 are drawn in the flower colormap with the level sets of |F(phi_t(x))|^2 (phi_t the flow), i.e.
// those near the origin pulled back by the flow, and a specular highlight; the left panel shows the sphere |F| = a.
// The mesh of (x, y) is a p5 buildGeometry; the vertex shader evaluates F, the normal, s and the flow at each
// vertex, and the fragment shader colors the interpolated elevations and draws their level sets.
// Drag to turn both panels, scroll to zoom (on a touch screen: two fingers); the play button sweeps a from 0 to 1 (eased)
// over and over. The controls are made with ../../libraries/sketch-ui.js.

// the surface and mesh parameters the exponential map was baked with (expmap.js)
const { B, R0, RMAX, NR, NT } = EXPMAP;   // seam amplitude far out, where the seam rises, length of the geodesics, mesh radii, rays

const K = 3;                // elevation units per unit of |F|^2
const FLOW_H = 0.025, FLOW_MAX = 60;   // flow: largest RK4 step, most steps (so t <= FLOW_H FLOW_MAX)
const FLOW_DEPTH = 4;       // flower elevation at the center: FLOW_DEPTH (|F(phi_t)|^2 / e - 1)
const SPEC = 0.3, SHINE = 60;    // specular strength, exponent
const A_LINE_W = 2.5;        // width of the level set |F| = a (css px)
const LAND_LINE_GAIN = 2.5;  // land level sets: opacity multiplier over island.js's (this sketch only)
const CUT = 1.1;           // the left panel is cut off where |F| > CUT
const SCAP = 3;             // the ocean is colored no deeper than this elevation
const FOV = 0.6;            // field of view across the shorter side of a panel (rad)
const SPIN = 0.01;          // rotation per px dragged
const SWEEP = 6;            // seconds for the play button to take a from 0 to 1
const HOLD = 1.8;           // extra seconds of ease-in as a leaves 0

let yaw = -1.2, pitch = -1.35, dist = 8;   // shared camera of both panels
let playing = null;          // the last animation frame's time while the a sweep plays
let panels = [], gfx = [], drag = null;
let aSlider, aOut, playBtn;   // controls

const aVal = () => aSlider.value();   // radius of the ball
const eVal = () => Math.max(1e-6, Math.min(0.01, aVal() / 50));   // kept positive, so a = 0 gives t = 0, not NaN
const tVal = () => Math.max(0, 0.25 * Math.log(aVal() ** 2 / eVal()));

// F in the chart (x, y), as in F_GLSL below
function Fof(x, y) {
  const r = Math.hypot(x, y);
  if (r < 1e-12) return [0, 0, 0];
  const t = Math.atan2(y, x), b = (B * r ** 4) / (R0 ** 4 + r ** 4), a = 1 - b;
  return [r * (a * Math.cos(t) + b * Math.cos(3 * t)), r * (a * Math.sin(t) - b * Math.sin(3 * t)), 2 * r * Math.sqrt(a * b) * Math.sin(2 * t)];
}

// ---- matrices (column-major) ----

const M4 = {
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  },
  persp(fy, asp, n, f) {
    const t = 1 / Math.tan(fy / 2);
    return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
  },
  rotX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
  rotZ(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
  trans(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); },
  scale(r) { return new Float32Array([r, 0, 0, 0, 0, r, 0, 0, 0, 0, r, 0, 0, 0, 0, 1]); },
};

// ---- GLSL ----

// F and its Jacobian
const F_GLSL = `
vec3 Fof(vec2 p) {
  float r = length(p);
  if (r < 1e-12) return vec3(0.0);
  float t = atan(p.y, p.x), r4 = r * r * r * r, b = ${glf(B)} * r4 / (${glf(R0 ** 4)} + r4), a = 1.0 - b;
  return r * vec3(a * cos(t) + b * cos(3.0 * t), a * sin(t) - b * sin(3.0 * t), 2.0 * sqrt(a * b) * sin(2.0 * t));
}
float F2(vec2 p) { vec3 F = Fof(p); return dot(F, F); }
// dF/dx, dF/dy by central differences
void jac(vec2 p, out vec3 Fx, out vec3 Fy) {
  const float h = 1e-3;
  Fx = (Fof(p + vec2(h, 0.0)) - Fof(p - vec2(h, 0.0))) / (2.0 * h);
  Fy = (Fof(p + vec2(0.0, h)) - Fof(p - vec2(0.0, h))) / (2.0 * h);
}
`;

// Downward gradient flow of |F|^2 for the pullback metric g = J^T J (J = DF): -g^-1 grad |F|^2 = -2 (J^T J)^-1 J^T F.
// Needs F_GLSL.
const FLOW_GLSL = `
uniform float uT, uE;
vec2 flowV(vec2 p) {
  vec3 Fx, Fy, F = Fof(p);
  jac(p, Fx, Fy);
  float a = dot(Fx, Fx), b = dot(Fx, Fy), c = dot(Fy, Fy);
  vec2 d = 2.0 * vec2(dot(Fx, F), dot(Fy, F));
  return -vec2(c * d.x - b * d.y, a * d.y - b * d.x) / (a * c - b * b);
}
// |F|^2 at the end of the flow from p for time uT (RK4)
float flowPsi(vec2 p) {
  int n = int(ceil(uT / ${glf(FLOW_H)}));
  float h = uT / float(max(n, 1));
  for (int i = 0; i < ${FLOW_MAX}; i++) {
    if (i >= n) break;
    vec2 k1 = flowV(p), k2 = flowV(p + 0.5 * h * k1), k3 = flowV(p + 0.5 * h * k2), k4 = flowV(p + h * k3);
    p += h / 6.0 * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
  }
  return F2(p);
}
// flower elevation of psi = |F(phi_t(x))|^2: 0 on psi = e, -FLOW_DEPTH at psi = 0 (clamped above)
float flowElev(float psi) { return ${glf(FLOW_DEPTH)} * (clamp(psi / uE, 0.0, 4.0) - 1.0); }
`;

// The surface: aPosition = (x, y, 0) is a point of the mesh of the disc of radius RMAX. uMode 0 draws F(x, y), uMode 1 draws (x, y, max(1 - |F|^2, 0)):
// the ocean is the plane z = 0. Either way the vertex carries the island elevation vS = K (|F|^2 - 1) of (x, y) and the
// flower elevation vS2 of where the flow takes it (vS2 <= 0 is the flower region).
const SURF_VERT = `#version 300 es
precision highp float;
in vec3 aPosition;   // normal coordinates (u, 0)
in vec2 aTexCoord;   // its chart point (x, y)
in vec3 aNormal;     // normal of the graph of 1 - |F|^2 over u
uniform mat4 uMVP;
uniform int uMode;
uniform float uK;
out float vS, vS2;
out vec3 vN, vP;
${F_GLSL}
${FLOW_GLSL}
void main() {
  vec2 p = aTexCoord;
  vec3 F = Fof(p), Fx, Fy, pos;
  jac(p, Fx, Fy);
  float q = dot(F, F);
  if (uMode == 0) { pos = F; vN = cross(Fx, Fy); }
  else { pos = vec3(aPosition.xy, max(1.0 - q, 0.0)); vN = aNormal; }
  vS = uK * (q - 1.0);
  vS2 = flowElev(flowPsi(p));
  vP = pos;
  gl_Position = uMVP * vec4(pos, 1.0);
}`;

const SURF_FRAG = `#version 300 es
precision highp float;
in float vS, vS2;
in vec3 vN, vP;
uniform float uDens, uSCap, uA2, uCut2;
uniform vec3 uEye;
out vec4 outColor;
${ISLAND_GLSL}
${FLOWER_GLSL}
void main() {
  if (vS > ${glf(K)} * (uCut2 - 1.0)) discard;   // |F|^2 > uCut2
  float gs = length(vec2(dFdx(vS), dFdy(vS))) * uDens;      // |grad| per css px
  float g2 = length(vec2(dFdx(vS2), dFdy(vS2))) * uDens;
  vec3 n = normalize(vN), L = normalize(vec3(0.4, 0.3, 1.0)), v = normalize(uEye - vP);
  if (dot(n, v) < 0.0) n = -n;
  vec3 col;
  if (vS2 <= 0.0) {   // flower colors and level sets, with a specular highlight
    col = flowerColor(vS2) * (0.6 + 0.4 * max(dot(n, L), 0.0));
    vec4 ct = flowerContour(vS2, g2, true);
    col = mix(col, ct.rgb, ct.a) + ${glf(SPEC)} * pow(max(dot(n, normalize(L + v)), 0.0), ${glf(SHINE)});
  } else {
    col = islandColor(min(vS, uSCap), true) * (0.55 + 0.45 * abs(dot(n, L)));   // capped so the ocean shows on the background
    vec4 ct = islandContour(vS, gs, true);
    if (vS < 0.0) ct.a = min(1.0, ct.a * ${glf(LAND_LINE_GAIN)});
    col = mix(col, ct.rgb, ct.a);
  }
  // the level set |F| = a, i.e. vS = K (a^2 - 1), in white
  float d = abs(vS - ${glf(K)} * (uA2 - 1.0)) / max(gs, 1e-6);   // css px
  col = mix(col, vec3(1.0), lineCover(d, ${glf(A_LINE_W)}));
  outColor = vec4(col, 1.0);
}`;

// The sphere |F| = a (uMVP scales the unit sphere), translucent, brighter toward its silhouette.
const SPHERE_VERT = `#version 300 es
precision highp float;
in vec3 aPosition;
uniform mat4 uMVP, uView;
out vec3 vN;
void main() { vN = mat3(uView) * aPosition; gl_Position = uMVP * vec4(aPosition, 1.0); }`;

const SPHERE_FRAG = `#version 300 es
precision highp float;
in vec3 vN;
out vec4 outColor;
void main() {
  float rim = 1.0 - abs(normalize(vN).z);
  float al = 0.05 + 0.35 * rim * rim * rim;
  outColor = vec4(vec3(al), al);   // premultiplied, as p5 blends
}`;

// ---- layout ----

// two panels side by side, or stacked if that keeps them closer to square; each is a WEBGL graphics with its own
// shaders and mesh (inset 1 px for the dividers)
function layout() {
  const stacked = Math.abs(Math.log(width / (height / 2))) < Math.abs(Math.log(width / 2 / height));
  panels = [0, 1].map(i => stacked
    ? { x: 0, y: Math.round((i * height) / 2), w: width, h: Math.round(((i + 1) * height) / 2) - Math.round((i * height) / 2) }
    : { x: Math.round((i * width) / 2), y: 0, w: Math.round(((i + 1) * width) / 2) - Math.round((i * width) / 2), h: height });
  gfx.forEach(g => g.pg.remove());
  gfx = panels.map(P => {
    const pg = createGraphics(P.w - 2, P.h - 2, WEBGL);
    pg.setAttributes('antialias', true);
    return { pg, surf: pg.createShader(SURF_VERT, SURF_FRAG), sphere: pg.createShader(SPHERE_VERT, SPHERE_FRAG), mesh: null };
  });
  rebuild();
}

// ---- geodesic normal coordinates ----

// the chart points of the mesh, pts[j][i] = exp_0(rho_i (cos phi_j, sin phi_j)), from expmap.js
// (base64 little-endian float32, packed as d[2 (j (NR + 1) + i) + {0, 1}])
function loadExpMap() {
  const d = new Float32Array(Uint8Array.from(atob(EXPMAP.data), c => c.charCodeAt(0)).buffer);
  return Array.from({ length: NT + 1 }, (_, j) => Array.from({ length: NR + 1 }, (_, i) => [d[2 * (j * (NR + 1) + i)], d[2 * (j * (NR + 1) + i) + 1]]));
}

// polar mesh of normal coordinates |u| <= RMAX, one triangle strip per ring; each vertex has its chart point as uv and
// the normal (grad_u |F|^2, 1) of the graph of 1 - |F|^2 over u (or (0, 0, 1) in the ocean)
function buildMesh(pg, pts) {
  const q = pts.map(ray => ray.map(([x, y]) => { const F = Fof(x, y); return F[0] ** 2 + F[1] ** 2 + F[2] ** 2; }));
  const dr = RMAX / NR, dp = TWO_PI / NT;
  const pt = (i, j) => {
    const rho = i * dr, ph = j * dp, c = Math.cos(ph), sn = Math.sin(ph);
    let n = [0, 0, 1];
    if (i > 0 && q[j][i] < 1) {
      const qr = (q[j][Math.min(i + 1, NR)] - q[j][i - 1]) / ((Math.min(i + 1, NR) - (i - 1)) * dr);
      const qp = (q[(j + 1) % NT][i] - q[(j + NT - 1) % NT][i]) / (2 * dp * rho);
      n = [qr * c - qp * sn, qr * sn + qp * c, 1];
    }
    pg.normal(...n);
    pg.vertex(rho * c, rho * sn, 0, ...pts[j][i]);
  };
  pg.textureMode(NORMAL);   // keep uv as given
  return pg.buildGeometry(() => {
    for (let i = 0; i < NR; i++) {
      pg.beginShape(TRIANGLE_STRIP);
      for (let j = 0; j <= NT; j++) { pt(i, j); pt(i + 1, j); }
      pg.endShape();
    }
  });
}

// both meshes, from the exponential map (loaded once)
let expPts = null;
function rebuild() {
  if (!expPts) expPts = loadExpMap();
  gfx.forEach(g => { g.mesh = buildMesh(g.pg, expPts); });
}

// ---- p5 ----

function setup() {
  createCanvas(windowWidth, windowHeight);
  layout();
  noLoop();

  aSlider = createSlider(0, 1, 0.75, 0.001).style('width', '140px');
  aOut = uiReadout();
  playBtn = createButton('▶ play');
  uiRow(aSlider, aOut, playBtn);
  aOut.html('a = ' + aVal().toFixed(2));
  const setA = a => { aSlider.value(a); aOut.html('a = ' + aVal().toFixed(2)); redrawSoon(); };
  aSlider.input(() => setA(aVal()));

  // play: a sweeps from 0 to 1 in SWEEP + HOLD seconds, then snaps back to 0 and repeats. Its speed rises smoothly
  // (half a cosine) for SWEEP / 2 + HOLD seconds and falls smoothly for SWEEP / 2, so it lingers near a = 0, not a = 1.
  // Playing starts from the slider's a.
  const T1 = SWEEP / 2 + HOLD, T2 = SWEEP / 2, VMAX = 2 / (T1 + T2);
  const ease = tau => tau < T1
    ? (VMAX / 2) * (tau - (T1 / Math.PI) * Math.sin((Math.PI * tau) / T1))
    : (VMAX / 2) * (T1 + (tau - T1) + (T2 / Math.PI) * Math.sin((Math.PI * (tau - T1)) / T2));
  // the time at which ease reaches a (ease is increasing)
  const easeInv = a => { let lo = 0, hi = T1 + T2; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (ease(m) < a) lo = m; else hi = m; } return lo; };
  let tau = 0;
  const step = now => {
    if (playing === null) return;
    tau += Math.min(now - playing, 250) / 1000;   // capped, so a hidden tab doesn't jump
    if (tau >= T1 + T2) tau = 0;
    playing = now;
    setA(Math.min(1, ease(tau)));
    requestAnimationFrame(step);
  };
  playBtn.mousePressed(() => {
    playing = playing === null ? performance.now() : null;
    playBtn.html(playing === null ? '▶ play' : '❚❚ pause');
    if (playing !== null) {
      tau = aVal() >= 1 ? 0 : easeInv(aVal());
      requestAnimationFrame(step);
    }
  });
}

// ---- input ----
// Mouse: drag to turn both panels, scroll to zoom. Touch (../../libraries/sketch-touch.js): one finger scrolls the
// page, two fingers turn the panels and pinch to zoom.

const onCanvas = e => !e || e.target.tagName === 'CANVAS';
const turn = (dx, dy) => { yaw += dx * SPIN; pitch = Math.max(-Math.PI, Math.min(0, pitch + dy * SPIN)); };
const zoom = f => { dist = Math.max(2.5, Math.min(20, dist * f)); };

function mousePressed(e) { drag = onCanvas(e) ? { x: mouseX, y: mouseY } : null; }
function mouseDragged() {
  if (!drag) return;
  turn(mouseX - drag.x, mouseY - drag.y);
  drag = { x: mouseX, y: mouseY };
  redrawSoon();
}
function mouseReleased() { drag = null; }
function mouseWheel(e) {
  if (!onCanvas(e)) return;
  zoom(Math.exp(e.delta * 0.001));
  redrawSoon();
  return false;
}
function touchPinch(f, dx, dy) { turn(dx, dy); zoom(1 / f); redrawSoon(); }

function windowResized() { resizeCanvas(windowWidth, windowHeight); layout(); redraw(); }

function draw() {
  background(128);
  panels.forEach((P, i) => {
    drawPanel(i);
    image(gfx[i].pg, P.x + 1, P.y + 1);
  });
}

// panel 0: the surface F(R^2), panel 1: the graph of 1 - |F|^2
function drawPanel(mode) {
  const { pg, surf, sphere, mesh } = gfx[mode];
  const rot = M4.mul(M4.rotX(pitch), M4.rotZ(yaw)), view = M4.mul(M4.trans(0, 0, -dist), rot);
  const eye = [rot[2], rot[6], rot[10]].map(c => c * dist);   // rot^T (0, 0, dist)
  const asp = pg.width / pg.height, fy = asp < 1 ? 2 * Math.atan(Math.tan(FOV / 2) / asp) : FOV;
  const mvp = M4.mul(M4.persp(fy, asp, 0.1, 100), view);

  pg.background(...OCEAN1);
  pg.noStroke();
  pg.shader(surf);
  surf.setUniform('uMVP', mvp);
  surf.setUniform('uMode', mode);
  surf.setUniform('uK', K);
  surf.setUniform('uT', tVal());
  surf.setUniform('uE', eVal());
  surf.setUniform('uEye', eye);
  surf.setUniform('uDens', pg.pixelDensity());
  surf.setUniform('uSCap', SCAP);
  surf.setUniform('uA2', aVal() ** 2);
  surf.setUniform('uCut2', mode === 0 ? CUT * CUT : 1e30);
  setFlowerUniforms(surf);
  pg.model(mesh);

  if (mode === 0) {
    const gl = pg.drawingContext;
    gl.depthMask(false);
    pg.shader(sphere);
    sphere.setUniform('uMVP', M4.mul(mvp, M4.scale(aVal())));
    sphere.setUniform('uView', view);
    pg.sphere(1, 48, 32);
    gl.depthMask(true);
  }
}
