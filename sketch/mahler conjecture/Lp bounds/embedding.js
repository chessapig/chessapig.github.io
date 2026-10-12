const S = 100;    // pixels per unit (left panel)
const PLANE = SAND, DIVIDER = [128, 128, 128];
const LW_POLY = 4; // polygon line width
const NT = 360;   // cone: points on its curve, evenly spaced in arc length
const RMAX = 1.5; // surface is cut off at this radius
const SPHERE = [255, 255, 255, 55], SPHERE_EDGE = [255, 255, 255, 140]; // unit sphere fill, outline
const SPIN = 0.01; // rotation per px dragged

let pts = [];
let hov = [], drag = null, spin = null; // hov: [{i, s}], drag: {hits, c0, p0}, spin: last mouse
let yaw = -Math.PI / 4, pitch = -0.6; // looking down (1, 1, 1)
let Lp, Rp, size = ''; // panels {x, y, w, h}; canvas size they were made for
let bg, gl, kSlider, kOut, dirty = true, dirty3 = true;   // bg: the left island, painted by POLY_ISLAND_FRAG (../island.js)
let coneSh, cone, octant;   // the 3D view (gl): CONE_FRAG, the cone and the octant geometry

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  pts = [1, 1.25, 0.85].map((r, i) => {
    const t = 0.3 + (i * TWO_PI) / 3;
    return [r * Math.cos(t), r * Math.sin(t)];
  });
  kSlider = createSlider(0, 2, 0, 0.001).style('width', '160px');
  kOut = uiReadout();
  uiRow(kSlider, kOut);
  uiHint('drag the lines to change K  ·  drag to rotate 3D panel');
  kSlider.input(() => { dirty = true; redrawSoon(); });
  noLoop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); alloc(); redraw(); }

// side by side when wide, stacked when tall
function alloc() {
  size = width + 'x' + height;
  const side = width >= height;
  Lp = side ? { x: 0, y: 0, w: Math.floor(width / 2), h: height } : { x: 0, y: 0, w: width, h: Math.floor(height / 2) };
  Rp = side ? { x: Lp.w, y: 0, w: width - Lp.w, h: height } : { x: 0, y: Lp.h, w: width, h: height - Lp.h };
  if (bg) bg.g.remove();
  if (gl) gl.remove();
  bg = shaderLayer(Lp.w, Lp.h, POLY_ISLAND_FRAG);
  gl = createGraphics(Rp.w, Rp.h, WEBGL); gl.pixelDensity(1);
  coneSh = gl.createShader(MODEL_VERT_GLSL, CONE_FRAG);
  cone = null; buildOctant();
  dirty = true;
}

const toPx = ([x, y]) => [Lp.x + Lp.w / 2 + x * S, Lp.y + Lp.h / 2 - y * S];
const toZ = (px, py) => [(px - Lp.x - Lp.w / 2) / S, (Lp.y + Lp.h / 2 - py) / S];
const inside = (P, x, y) => x >= P.x && x < P.x + P.w && y >= P.y && y < P.y + P.h;

// b_i = p_i / |p_i|^2

function draw() {
  if (!width || !height) return;
  if (size !== width + 'x' + height) alloc();
  const k = Math.round(10 ** kSlider.value());
  if (dirty) { field(k); buildCone(k); dirty = false; dirty3 = true; }
  if (dirty3) { view(k); dirty3 = false; }
  image(bg.g, Lp.x, Lp.y);
  image(gl, Rp.x, Rp.y);

  drawingContext.save();
  drawingContext.beginPath(); drawingContext.rect(Lp.x, Lp.y, Lp.w, Lp.h); drawingContext.clip();

  // planes through ±p_i perpendicular to p_i
  const D = 2 * (width + height) / S;
  drawLines(pts, toPx, D, hov, drag);

  // polygon {x : |<x, b_i>| <= 1}
  stroke(PLANE); strokeWeight(LW_POLY); strokeJoin(ROUND); noFill();
  beginShape();
  for (const q of polygon(D)) vertex(...toPx(q));
  endShape(CLOSE);
  restoreContext();

  stroke(DIVIDER); strokeWeight(2);
  if (Rp.x > 0) line(Rp.x, 0, Rp.x, height); else line(0, Rp.y, width, Rp.y);
  kOut.html('k = ' + k);
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
  paintShader(bg, { uSize: [Lp.w, Lp.h], uS: S, uK: k, ...polyUniforms(pts.map(dual)) });
}

// The image of x -> (|<x, b_i>|^k)_i is the cone over the curve u(th) = y(th) / |y(th)|, th in [0, 2pi),
// where y(th) is the image of the unit vector at angle th. |y|^2 = sum_i <x, b_i>^(2k), so the point r u(th)
// gets the same color and level sets as the plane does where that sum is r^2: elevation 2 log(r) / sqrt(k).
// The cone is a fan of flat triangles from the apex, built once per k and b_i (buildCone); CONE_FRAG colors
// each pixel from its distance to the apex, and turning the view only redraws it (view).
const CONE_FRAG = `#version 300 es
precision highp float;
in vec3 vPos;
out vec4 outColor;
uniform float uSc, uRk;   // pixels per unit, sqrt(k)
${ISLAND_GLSL}
void main() {
  outColor = vec4(islandShade(2.0 * log(length(vPos) / uSc + 1e-30) / uRk, ${BEACH}, true), 1.0);
}`;

const coneScale = () => (Math.min(Rp.w, Rp.h) * 0.45) / RMAX;   // pixels per unit
const P3 = (u, r) => { const sc = coneScale(); return [u[0] * r * sc, -u[2] * r * sc, u[1] * r * sc]; }; // y3 up

// u(th), the unit vector along (|<e_th, b_i>|^k)_i
function uAt(th, B, k) {
  const c = Math.cos(th), s = Math.sin(th);
  const l = B.map(([a, b]) => k * Math.log(Math.abs(c * a + s * b) + 1e-300));
  const m = Math.max(...l), e = l.map(t => Math.exp(t - m));
  const z = Math.hypot(...e);
  return e.map(t => t / z);
}

// NT + 1 points of the closed curve u, evenly spaced in arc length (u(th + pi) = u(th), so th in [0, pi] is the whole curve).
// For large k, u sits near an axis for most th and crosses a face of the octant within a window of th of width ~ 1/k,
// so the th steps are first halved until consecutive points are within CHORD of each other, then the curve is resampled.
function conePoints(B, k) {
  const N0 = 128, CHORD = 0.005, DEPTH = 16;
  const d = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]));
  const ths = [0], us = [uAt(0, B, k)];
  const refine = (t0, u0, t1, u1, depth) => {
    if (depth < DEPTH && d(u0, u1) > CHORD) {
      const tm = (t0 + t1) / 2, um = uAt(tm, B, k);
      refine(t0, u0, tm, um, depth + 1); refine(tm, um, t1, u1, depth + 1);
    } else { ths.push(t1); us.push(u1); }
  };
  for (let i = 1; i <= N0; i++) {
    const t1 = (PI * i) / N0;
    refine(ths[ths.length - 1], us[us.length - 1], t1, uAt(t1, B, k), 0);
  }
  const cum = [0];
  for (let i = 1; i < us.length; i++) cum.push(cum[i - 1] + d(us[i - 1], us[i]));
  const L = cum[cum.length - 1], U = [];
  for (let n = 0, j = 0; n <= NT; n++) {
    const s = (L * n) / NT;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    U.push(uAt(ths[j] + f * (ths[j + 1] - ths[j]), B, k));
  }
  return U;
}

function buildCone(k) {
  const U = conePoints(pts.map(dual), k);
  if (cone) gl.freeGeometry(cone);
  cone = gl.buildGeometry(() => {
    gl.beginShape(TRIANGLES);
    for (let i = 0; i < NT; i++) { gl.vertex(0, 0, 0); gl.vertex(...P3(U[i], RMAX)); gl.vertex(...P3(U[i + 1], RMAX)); }
    gl.endShape();
  });
}

// the translucent positive octant of the unit sphere (fixed, so built once per buffer). It is drawn with fill(SPHERE):
// colors kept in the geometry would be blended as if opaque.
const NA = 24, oct = (a, b) => [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
function buildOctant() {
  octant = gl.buildGeometry(() => {
    gl.beginShape(TRIANGLES);
    for (let i = 0; i < NA; i++) {
      for (let j = 0; j < NA; j++) {
        const a0 = (HALF_PI * i) / NA, a1 = (HALF_PI * (i + 1)) / NA, b0 = (HALF_PI * j) / NA, b1 = (HALF_PI * (j + 1)) / NA;
        for (const [a, b] of [[a0, b0], [a1, b0], [a1, b1], [a0, b0], [a1, b1], [a0, b1]]) gl.vertex(...P3(oct(a, b), 1));
      }
    }
    gl.endShape();
  });
  octant.vertexColors = [];
}

function view(k) {
  gl.push();
  gl.background(...OCEAN1);
  gl.rotateX(pitch); gl.rotateY(yaw);
  gl.translate(...P3([1, 1, 1], -0.5)); // center on the octant

  gl.noStroke();
  gl.shader(coneSh);
  coneSh.setUniform('uSc', coneScale()); coneSh.setUniform('uRk', Math.sqrt(k));
  gl.model(cone);
  gl.resetShader();

  // positive axes
  gl.stroke(255, 255, 255, 90); gl.strokeWeight(1);
  for (const e of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) gl.line(...P3(e, 0), ...P3(e, RMAX));

  // the octant, drawn without writing depth so everything behind shows through
  const ctx = gl.drawingContext;
  ctx.depthMask(false);
  gl.noStroke(); gl.fill(...SPHERE);
  gl.model(octant);
  ctx.depthMask(true);

  // its edges on the coordinate planes
  gl.noFill(); gl.stroke(...SPHERE_EDGE); gl.strokeWeight(1.5);
  for (const f of [t => [Math.cos(t), Math.sin(t), 0], t => [0, Math.cos(t), Math.sin(t)], t => [Math.sin(t), 0, Math.cos(t)]]) {
    gl.beginShape();
    for (let i = 0; i <= NA; i++) gl.vertex(...P3(f((HALF_PI * i) / NA), 1));
    gl.endShape();
  }
  gl.pop();
}

const hit = () => (inside(Lp, mouseX, mouseY) ? hitLines(pts, toZ(mouseX, mouseY), LINE_HIT / S) : []);

const onCanvas = e => !e || e.target.tagName === 'CANVAS';

// touch (../../libraries/sketch-touch.js): one finger drags a line or spins the 3D view
function touchGrab() { return hit().length > 0 || inside(Rp, mouseX, mouseY); }

function mouseMoved() {
  const h = hit();
  if (lineKey(h) !== lineKey(hov)) { hov = h; redrawSoon(); }
}
function mousePressed(e) {
  if (!onCanvas(e)) return;
  const hits = hit();
  drag = hits.length ? startLineDrag(pts, hits, toZ(mouseX, mouseY)) : null;
  spin = inside(Rp, mouseX, mouseY) ? [mouseX, mouseY] : null;
  redraw();
}
function mouseDragged() {
  if (spin) {
    yaw += (mouseX - spin[0]) * SPIN;
    pitch = constrain(pitch - (mouseY - spin[1]) * SPIN, -HALF_PI, HALF_PI);
    spin = [mouseX, mouseY];
    dirty3 = true; redrawSoon();
    return;
  }
  if (!drag) return;
  pts = dragLines(pts, drag, toZ(mouseX, mouseY));
  dirty = true; redrawSoon();
}
function mouseReleased() { drag = spin = null; redraw(); }
