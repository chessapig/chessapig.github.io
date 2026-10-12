// A symmetric polygon P = {x : |<x, b_i>| <= 1} and its polar P° = conv(±b_i), edited by dragging the handles ±b_i.
// Drawn into a rectangle of a p5 sketch (global mode); the host forwards mouse events and gets onChange calls.
//
//   const ed = new PolarEditor({ rect: { x, y, w, h }, onChange: ed => ... });
//   ed.V, ed.W: counterclockwise vertices of P and P° (null if P is unbounded)

class PolarEditor {
  constructor(options = {}) {
    const defaults = {
      rect: { x: 0, y: 0, w: 100, h: 100 },
      bs: [0, 1, 2].map(k => [Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3)]), // P and P° are hexagons
      halfWidth: 1.8,             // units from the center to the nearer side of rect
      colorP: [40, 165, 70],      // P
      colorDual: [70, 170, 215],  // P° and the handles
      colorInk: [236, 216, 160],  // axes
      hit: 14,                    // handle hit radius (px)
      margin: 8,                  // handles stay this far inside rect (px)
      onChange: () => {},
    };
    Object.assign(this, defaults, options);
    this.drag = null; // {i, s}: dragging the handle s b_i
    this.update(this.bs);
  }

  // convex hull, counterclockwise, collinear points dropped
  static hull(pts) {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = list => {
      const h = [];
      for (const p of list) {
        while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 1e-12) h.pop();
        h.push(p);
      }
      h.pop();
      return h;
    };
    return half(P).concat(half(P.reverse()));
  }

  // P° = conv(±b_i) has vertices W; the vertex V_j of P is dual to the edge W_j W_{j+1}
  static polar(bs) {
    const W = PolarEditor.hull(bs.flatMap(([a, b]) => [[a, b], [-a, -b]]));
    if (W.length < 3) return null;
    const n = W.length;
    const V = W.map((w, j) => {
      const z = W[(j + 1) % n], d = w[0] * z[1] - w[1] * z[0];
      return [(z[1] - w[1]) / d, (w[0] - z[0]) / d];
    });
    return { V, W };
  }

  // set the b_i if they give a bounded P; returns whether they did
  update(bs) {
    const pp = PolarEditor.polar(bs);
    if (!pp) return false;
    this.bs = bs; this.V = pp.V; this.W = pp.W;
    this.onChange(this);
    return true;
  }

  // pixel <-> plane coordinates
  get cx() { return this.rect.x + this.rect.w / 2; }
  get cy() { return this.rect.y + this.rect.h / 2; }
  get scale() { return Math.min(this.rect.w, this.rect.h) / 2 / this.halfWidth; }
  toPx([x, y]) { return [this.cx + x * this.scale, this.cy - y * this.scale]; }
  toZ(px, py) { return [(px - this.cx) / this.scale, (this.cy - py) / this.scale]; }

  contains(mx, my) {
    const { x, y, w, h } = this.rect;
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
  }

  hitHandle(mx, my) {
    let best = null, bd = this.hit * touchHit;
    this.bs.forEach((b, i) => [1, -1].forEach(s => {
      const d = dist(mx, my, ...this.toPx([s * b[0], s * b[1]]));
      if (d < bd) { bd = d; best = { i, s }; }
    }));
    return best;
  }

  draw() {
    const { x, y, w, h } = this.rect, I = this.colorInk, D = this.colorDual, C = this.colorP;
    const ctx = drawingContext;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    stroke(I[0], I[1], I[2], 60); strokeWeight(1);
    line(x, this.cy, x + w, this.cy);
    line(this.cx, y, this.cx, y + h);
    strokeJoin(ROUND);
    fill(D[0], D[1], D[2], 60); stroke(D); strokeWeight(2.5);
    beginShape(); for (const q of this.W) vertex(...this.toPx(q)); endShape(CLOSE);
    fill(C[0], C[1], C[2], 40); stroke(C);
    beginShape(); for (const q of this.V) vertex(...this.toPx(q)); endShape(CLOSE);
    this.bs.forEach((b, i) => [1, -1].forEach(s => {
      const hot = this.drag && this.drag.i === i;
      stroke(255); strokeWeight(hot ? 2.5 : 1.5);
      if (s > 0) fill(D); else noFill();
      circle(...this.toPx([s * b[0], s * b[1]]), hot ? 14 : 10);
    }));
    restoreContext(ctx);
  }

  // mouse handlers return whether they used the event
  pressed(mx, my) {
    this.drag = this.contains(mx, my) ? this.hitHandle(mx, my) : null;
    return !!this.drag;
  }

  dragged(mx, my) {
    if (!this.drag) return false;
    // keep the handle (and so its mirror image) inside rect
    const { x, y, w, h } = this.rect, m = this.margin, { i, s } = this.drag;
    const [a, b] = this.toZ(constrain(mx, x + m, x + w - m), constrain(my, y + m, y + h - m));
    const bs = this.bs.slice();
    bs[i] = [s * a, s * b];
    this.update(bs);
    return true;
  }

  released() {
    const was = !!this.drag;
    this.drag = null;
    return was;
  }

  // double-click a handle to remove it, or empty space to add one
  doubleClicked(mx, my) {
    if (!this.contains(mx, my)) return false;
    const h = this.hitHandle(mx, my);
    if (h) this.update(this.bs.filter((_, i) => i !== h.i));
    else this.update([...this.bs, this.toZ(mx, my)]);
    this.drag = null;
    return true;
  }
}
