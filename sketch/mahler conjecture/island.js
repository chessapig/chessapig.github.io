// Shared island coloring and level-set drawing, on the CPU (drawIsland, contour) and in GLSL (below).
// v is a grid of values on an nx-by-ny lattice with spacing G px; the shore is v = 0, land is v < 0.

const H = 0.3;      // level spacing
const NL = 14;      // levels on each side
const FADE = 1.6;   // level fade length
const SHORE = 0.6;  // sand band width
const LEVEL_W = 1.2; // level line width

const OCEAN0 = [70, 170, 215], OCEAN1 = [5, 25, 70];
const SAND = [236, 216, 160];
const GREEN0 = [120, 185, 85], GREEN1 = [20, 60, 25];

// Split a rect {x, y, w, h} into two equal panels, side by side or stacked, whichever makes the panels squarer.
//   -> {stacked, rects: [first, second]}  (first is left / top)
function splitRect({ x, y, w, h }) {
  const side = (w / 2) / h, stack = w / (h / 2);   // aspect ratio of a panel
  const stacked = Math.abs(Math.log(stack)) < Math.abs(Math.log(side));
  const pw = stacked ? w : Math.floor(w / 2), ph = stacked ? Math.floor(h / 2) : h;
  return { stacked, rects: [{ x, y, w: pw, h: ph }, stacked ? { x, y: y + ph, w: pw, h: ph } : { x: x + pw, y, w: pw, h: ph }] };
}
// drawingContext.restore() puts the canvas's stroke and fill back, but p5 keeps its own copy of the last colors it set and skips
// setting an unchanged one, so after a plain restore() the next frame's first stroke(c) can silently stay at the restored color
// (black). Use this in place of drawingContext.restore().
function restoreContext(ctx = drawingContext) {
  ctx.restore();
  _renderer._cachedFillStyle = _renderer._cachedStrokeStyle = null;
}

const FOAM = [255, 255, 255], RIDGE = [40, 90, 35];   // level line colors: sea, land (the beach too)

let BEACH = true;  // false: no sand band; land is green right up to the shore

const mix = (c0, c1, t) => [0, 1, 2].map(i => c0[i] + (c1[i] - c0[i]) * t);
const depth = d => 1 - Math.exp(-d / 2.5);

function shade(s, empty) {
  if (empty || s > 0) return mix(OCEAN0, OCEAN1, empty ? 1 : depth(s));
  if (!BEACH) return mix(GREEN0, GREEN1, depth(-s));
  if (s > -SHORE) return SAND;
  const t = Math.min(1, (-s - SHORE) / 0.15);
  return mix(SAND, mix(GREEN0, GREEN1, depth(-s - SHORE)), t);
}

// Fill img from v and draw it with its level sets onto gfx (a p5.Graphics, or window in global mode).
function drawIsland(gfx, img, v, nx, ny, G, empty, landLevels = true) {
  img.loadPixels();
  for (let n = 0; n < nx * ny; n++) {
    const c = shade(v[n], empty);
    img.pixels[4 * n] = c[0]; img.pixels[4 * n + 1] = c[1];
    img.pixels[4 * n + 2] = c[2]; img.pixels[4 * n + 3] = 255;
  }
  img.updatePixels();
  gfx.image(img, 0, 0, nx * G, ny * G);

  if (empty) return;
  gfx.strokeWeight(LEVEL_W);
  for (let n = NL; n >= (landLevels ? -NL : 0); n--) {
    const L = n * H, a = 255 * Math.exp(-Math.abs(L) / FADE);
    const c = L >= 0 ? FOAM : RIDGE;
    gfx.stroke(c[0], c[1], c[2], a);
    contour(gfx, v, nx, ny, G, L);
  }
}

// Marching squares: draw the level set v = L with gfx's current stroke.
function contour(gfx, v, nx, ny, G, L) {
  const lerpPt = (x0, y0, a, x1, y1, b) => {
    const t = a / (a - b);
    return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)];
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = v[j * nx + i] - L, b = v[j * nx + i + 1] - L;
      const c = v[(j + 1) * nx + i + 1] - L, d = v[(j + 1) * nx + i] - L;
      if ((a > 0) === (b > 0) && (b > 0) === (c > 0) && (c > 0) === (d > 0)) continue;
      const x = i * G, y = j * G;
      const e = [];
      if ((a > 0) !== (b > 0)) e.push(lerpPt(x, y, a, x + G, y, b));
      if ((b > 0) !== (c > 0)) e.push(lerpPt(x + G, y, b, x + G, y + G, c));
      if ((c > 0) !== (d > 0)) e.push(lerpPt(x + G, y + G, c, x, y + G, d));
      if ((d > 0) !== (a > 0)) e.push(lerpPt(x, y + G, d, x, y, a));
      if (e.length === 2) gfx.line(...e[0], ...e[1]);
      else if (e.length === 4) {
        const m = (a + b + c + d) / 4;
        if ((m > 0) === (a > 0)) { gfx.line(...e[0], ...e[1]); gfx.line(...e[2], ...e[3]); }
        else { gfx.line(...e[0], ...e[3]); gfx.line(...e[1], ...e[2]); }
      }
    }
  }
}

// ---- GLSL (ES 3.00) version of the shading above, to paste into a fragment shader ----
// ISLAND_GLSL defines the same colors and level spacing as the JS above (interpolated from it, so
// they stay in sync) and two functions, which need a float "elevation" f (shore at f = 0, land < 0):
//   vec3 islandColor(float s, bool beach)  -- ocean / (sand) / green gradient
//   vec4 islandContour(float f, float gradLen, bool landLevels)  -- rgb + coverage of the nearest
//        level set. gradLen is |grad f| per pixel (length(vec2(dFdx(f), dFdy(f)))); the distance
//        to the level is |f - L| / |grad f| pixels, so lines have constant pixel thickness.
//   vec3 islandShade(float f, bool beach, bool landLevels)  -- islandColor with islandContour on top
//   float lineCover(float d, float w)  -- coverage of a pixel d px from the middle of a line w px wide
const glf = x => Number.isInteger(x) ? x.toFixed(1) : String(x);
const glv3 = c => `vec3(${c.map(x => glf(x / 255)).join(', ')})`;
const ISLAND_GLSL = `
const float H = ${glf(H)};
const float NLV = ${glf(NL)};
const float FADE = ${glf(FADE)};
const float SHORE = ${glf(SHORE)};
const float LEVEL_W = ${glf(LEVEL_W)};
const vec3 OCEAN0 = ${glv3(OCEAN0)}, OCEAN1 = ${glv3(OCEAN1)};
const vec3 SAND = ${glv3(SAND)};
const vec3 GREEN0 = ${glv3(GREEN0)}, GREEN1 = ${glv3(GREEN1)};
const vec3 FOAM = ${glv3(FOAM)}, RIDGE = ${glv3(RIDGE)};

float islandDepth(float d) { return 1.0 - exp(-d / 2.5); }

float lineCover(float d, float w) { return 1.0 - smoothstep(0.5 * w - 0.5, 0.5 * w + 0.5, d); }

vec3 islandColor(float s, bool beach) {
  if (s > 0.0) return mix(OCEAN0, OCEAN1, islandDepth(s));
  if (!beach) return mix(GREEN0, GREEN1, islandDepth(-s));
  if (s > -SHORE) return SAND;
  float t = min(1.0, (-s - SHORE) / 0.15);
  return mix(SAND, mix(GREEN0, GREEN1, islandDepth(-s - SHORE)), t);
}

vec4 islandContour(float f, float gradLen, bool landLevels) {
  float n = clamp(floor(f / H + 0.5), landLevels ? -NLV : 0.0, NLV);
  float L = n * H;
  float cover = lineCover(abs(f - L) / max(gradLen, 1e-6), LEVEL_W);
  vec3 c = L >= 0.0 ? FOAM : RIDGE;
  cover *= step(abs(f), (NLV + 0.5) * H);   // no lines beyond the last level (or at jumps in f)
  return vec4(c, cover * exp(-abs(L) / FADE));
}

vec3 islandShade(float f, bool beach, bool landLevels) {
  vec4 c = islandContour(f, length(vec2(dFdx(f), dFdy(f))), landLevels);
  return mix(islandColor(f, beach), c.rgb, c.a);
}
`;

// ---- "flower" colormap (GLSL) ----
// Land from dark red at the shore to cream at the center, lavender lines, and a sea that reuses
// the island's green gradient.
// There is no beach.
// The shore has a thin dark border, and contours use the same dark color on both sides of it.
// Needs ISLAND_GLSL's constants and islandDepth. Functions, with f as above:
//   vec3 flowerColor(float s)
//   float flowerBorder(float f, float gradLen)              -- coverage of the shore border only
//   vec4 flowerContour(float f, float gradLen, bool landLevels)  -- border + level sets, one color
const FLOWER_BORDER_W = 2;   // px
const FLOWER_EDGE = [124, 9, 9], FLOWER_CENTER = [248, 245, 226];      // dark red at the shore .. cream at the center
const FLOWER_SEA0 = GREEN0, FLOWER_SEA1 = GREEN1;                    // the island's green gradient, light .. dark
const FLOWER_LINE = [216, 187, 236];                                  // lavender
const FLOWER_GLSL = `
const float FL_BORDER_W = ${glf(FLOWER_BORDER_W)};
uniform vec3 FL_EDGE, FL_CENTER, FL_LINE;   // set with setFlowerUniforms
const vec3 FL_SEA0 = ${glv3(FLOWER_SEA0)}, FL_SEA1 = ${glv3(FLOWER_SEA1)};

vec3 flowerColor(float s) {
  if (s > 0.0) return mix(FL_SEA0, FL_SEA1, islandDepth(s));
  return mix(FL_EDGE, FL_CENTER, islandDepth(-s));
}

float flowerBorder(float f, float gradLen) {
  return lineCover(abs(f) / max(gradLen, 1e-6), FL_BORDER_W);
}

vec4 flowerContour(float f, float gradLen, bool landLevels) {
  float n = clamp(floor(f / H + 0.5), landLevels ? -NLV : 0.0, NLV);
  if (n == 0.0) return vec4(FL_LINE, flowerBorder(f, gradLen));
  float cover = lineCover(abs(f - n * H) / max(gradLen, 1e-6), LEVEL_W);
  cover *= step(abs(f), (NLV + 0.5) * H);
  return vec4(FL_LINE, cover * exp(-abs(n * H) / FADE));
}
`;

// Set the flower colors (0-255 rgb arrays; any left out default to the FLOWER_* constants above).
const setFlowerUniforms = (shader, c = {}) => {
  shader.setUniform('FL_EDGE', (c.edge || FLOWER_EDGE).map(x => x / 255));
  shader.setUniform('FL_CENTER', (c.center || FLOWER_CENTER).map(x => x / 255));
  shader.setUniform('FL_LINE', (c.line || FLOWER_LINE).map(x => x / 255));
};

// ---- the symmetric polygon and its L^2k norms (GLSL) ----
// K = {x : |<b_i, x>| <= 1} for the uNB vectors uB[i] (set uB to the flattened b_i, at most MAX_B of them).
// For z = x + i y, l_i(z) = <b_i, z> has |l_i|^2 = <b_i, x>^2 + <b_i, y>^2, and rho(z) = sum_i |l_i(z)|^2k.
//   float gaugeB(vec2 x)                  -- max_i |<b_i, x>|, the gauge of K
//   float logRho(vec2 x, vec2 y, float k)  -- log rho, by log-sum-exp
//   float approxN(vec2 x, vec2 y, float k) -- rho^(1/2k); k <= 0 stands for k = infinity, max_i |l_i|
const MAX_B = 32;
const POLY_GLSL = `
const int MAX_B = ${MAX_B};
uniform vec2 uB[MAX_B];
uniform int uNB;

float gaugeB(vec2 x) {
  float g = 0.0;
  for (int i = 0; i < MAX_B; i++) { if (i >= uNB) break; g = max(g, abs(dot(uB[i], x))); }
  return g;
}

float logRho(vec2 x, vec2 y, float k) {
  float l[MAX_B], m = -1e30;
  for (int i = 0; i < MAX_B; i++) {
    if (i >= uNB) break;
    float a = dot(uB[i], x), c = dot(uB[i], y);
    l[i] = k * log(a * a + c * c + 1e-30);
    m = max(m, l[i]);
  }
  float t = 0.0;
  for (int i = 0; i < MAX_B; i++) { if (i >= uNB) break; t += exp(l[i] - m); }
  return m + log(t);
}

float approxN(vec2 x, vec2 y, float k) {
  if (k > 0.0) return exp(logRho(x, y, k) / (2.0 * k));
  float g = 0.0;
  for (int i = 0; i < MAX_B; i++) { if (i >= uNB) break; g = max(g, length(vec2(dot(uB[i], x), dot(uB[i], y)))); }
  return g;
}
`;

// ---- full-canvas shader layers ----
// A fragment shader paints a whole WEBGL buffer (gl_FragCoord is in pixels, y up), which is then drawn like an image.
//   shaderLayer(w, h, frag)   -- {g, sh}: the buffer and the shader
//   paintShader(layer, u)     -- set the uniforms u = {name: value} and paint; returns the buffer
const VERT_GLSL = `#version 300 es
in vec3 aPosition;
void main() {
  vec4 p = vec4(aPosition, 1.0);
  p.xy = p.xy * 2.0 - 1.0;
  gl_Position = p;
}`;

// For 3D shapes (model(), beginShape) in a WEBGL buffer: passes each point's position, before the
// camera and model transforms, to the fragment shader as vPos.
const MODEL_VERT_GLSL = `#version 300 es
in vec3 aPosition;
uniform mat4 uModelViewMatrix, uProjectionMatrix;
out vec3 vPos;
void main() {
  vPos = aPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`;

function shaderLayer(w, h, frag) {
  const g = createGraphics(w, h, WEBGL);
  g.pixelDensity(1);
  return { g, sh: g.createShader(VERT_GLSL, frag) };
}

function paintShader({ g, sh }, u) {
  g.shader(sh);
  for (const name in u) sh.setUniform(name, u[name]);
  g.noStroke();
  g.rect(0, 0, g.width, g.height);
  return g;
}

// The island of log(rho(x)) / sqrt(k) on the real plane, uS px per unit about the center of the buffer
// (the CPU picture drawIsland made from that grid). With no b_i, the plane is deep ocean.
const POLY_ISLAND_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uSize;
uniform float uS, uK;
${ISLAND_GLSL}
${POLY_GLSL}
void main() {
  if (uNB == 0) { outColor = vec4(OCEAN1, 1.0); return; }
  vec2 x = (gl_FragCoord.xy - 0.5 * uSize) / uS;
  outColor = vec4(islandShade(logRho(x, vec2(0.0), uK) / sqrt(uK), ${BEACH}, true), 1.0);
}`;

// uniforms for POLY_GLSL from a list of b_i (padded, so the array is always set in full)
const polyUniforms = B => {
  B = B.slice(0, MAX_B);
  return { uB: [...B.flat(), ...new Array(2 * (MAX_B - B.length)).fill(0)], uNB: B.length };
};
