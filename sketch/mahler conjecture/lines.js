// Draggable lines <x, p_i> = ±|p_i|^2 (through ±p_i, perpendicular to p_i), shared by the sketches that edit a polygon
// {x : |<x, b_i>| <= 1} through its lines, p_i = b_i / |b_i|^2. A hit is {i, s}: the line through s p_i.
// Needs ../../libraries/sketch-touch.js (touchHit) and island.js (SAND). Used with p5 in global mode.

const LINE_COLOR = SAND, LINE_ACTIVE = [255, 170, 60];
const LINE_HIT = 6;     // hit distance (px)
const LW_LINE = 1, LW_LINE_HOT = 2;

// b_i = p_i / |p_i|^2 (and back)
const dual = ([a, b]) => { const r = a * a + b * b + 1e-12; return [a / r, b / r]; };

const lineKey = hs => hs.map(h => h.i + ':' + h.s).join();

// all lines through s p_i (s = ±1) within tol (units) of the point m
function hitLines(pts, m, tol) {
  const hs = [];
  pts.forEach(([a, b], i) => {
    const r = Math.hypot(a, b);
    if (!r) return;
    const t = (m[0] * a + m[1] * b) / r;
    for (const s of [1, -1]) if (Math.abs(t - s * r) < tol * touchHit) hs.push({ i, s });
  });
  return hs;
}

// begin dragging the lines in hits, grabbed at the point c0
const startLineDrag = (pts, hits, c0) => ({ hits, c0, p0: hits.map(h => pts[h.i]) });

// new p_i with the dragged ones moved: p = p0 * m / c0 as complex numbers (rotate and scale about 0
// so that the grabbed point follows the mouse m)
function dragLines(pts, drag, m) {
  const [cx, cy] = drag.c0, c2 = cx * cx + cy * cy;
  if (c2 < 1e-12) return pts;
  const qx = (m[0] * cx + m[1] * cy) / c2, qy = (m[1] * cx - m[0] * cy) / c2;
  const out = pts.slice();
  drag.hits.forEach((h, j) => {
    const [px, py] = drag.p0[j];
    out[h.i] = [px * qx - py * qy, px * qy + py * qx];
  });
  return out;
}

// draw the lines (toPx maps units to px, D is a half-length in units); hov: hits to thicken, drag: {hits} to color
function drawLines(pts, toPx, D, hov, drag) {
  pts.forEach(([a, b], i) => {
    const r = Math.hypot(a, b) || 1, dx = -b / r, dy = a / r;
    for (const s of [1, -1]) {
      const on = hs => !!hs && hs.some(h => h.i === i && h.s === s);
      stroke(drag && drag.hits.some(h => h.i === i) ? LINE_ACTIVE : LINE_COLOR);
      strokeWeight(on(hov) || (drag && on(drag.hits)) ? LW_LINE_HOT : LW_LINE);
      line(...toPx([s * a - D * dx, s * b - D * dy]), ...toPx([s * a + D * dx, s * b + D * dy]));
    }
  });
}
