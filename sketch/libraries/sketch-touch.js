// Touch support for p5 sketches written against the mouse.
// Touches on the canvas are turned into the mouse events the sketch already handles:
//   - one finger on something draggable drags it (mousedown / mousemove / mouseup), without scrolling the page
//   - one finger anywhere else scrolls the page as usual; a tap is a click
//   - a double tap is a double click (dblclick)
//   - two fingers pan and pinch, if the sketch handles that
// The sketch opts in with optional global hooks. Before each call the mouse is moved to the touch, so
// mouseX / mouseY (and the sketch's hit tests) refer to it:
//   touchGrab()              -- is there something draggable under the finger?
//   touchPinch(f, dx, dy)    -- two-finger gesture: zoom by f about mouseX, mouseY (the fingers' midpoint)
//                               and pan by (dx, dy) px
// touchHit is 1 for the mouse and larger during a touch; multiply hit radii by it so fingers can grab things.

let touchHit = 1;

(function () {
  const TOUCH_HIT = 2.5;
  const TAP_MOVE = 10;                    // px a tap may move
  const DOUBLE_TAP = { ms: 350, px: 30 };

  const style = document.createElement('style');
  style.textContent = 'canvas { touch-action: pan-x pan-y; }';   // no browser pinch-zoom or double-tap zoom on the canvas
  document.head.appendChild(style);

  let canvas = null, mode = null;         // mode: 'drag' (a grab), 'idle' (maybe a tap or a scroll), 'pinch', 'done'
  let start = null, moved = false, pinch = null, lastTap = null;

  const mouse = (type, t, buttons) => canvas.dispatchEvent(new MouseEvent(type, {
    bubbles: true, cancelable: true, view: window, clientX: t.clientX, clientY: t.clientY,
    button: 0, buttons, detail: type === 'dblclick' ? 2 : 1,
  }));
  const hook = name => typeof window[name] === 'function' ? window[name] : null;
  const two = ts => {
    const [a, b] = ts;
    return { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2, d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) };
  };

  function tap(t) {
    const now = performance.now();
    if (lastTap && now - lastTap.time < DOUBLE_TAP.ms && Math.hypot(t.clientX - lastTap.x, t.clientY - lastTap.y) < DOUBLE_TAP.px) {
      mouse('dblclick', t, 0);
      lastTap = null;
    } else lastTap = { time: now, x: t.clientX, y: t.clientY };
  }

  function onStart(e) {
    if (e.target.tagName !== 'CANVAS') return;
    e.stopImmediatePropagation();         // the sketch only sees the mouse events made here
    canvas = e.target;
    touchHit = TOUCH_HIT;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      start = t; moved = false;
      mouse('mousemove', t, 0);
      const grab = hook('touchGrab');
      if (grab && grab()) { e.preventDefault(); mode = 'drag'; mouse('mousedown', t, 1); }
      else mode = 'idle';
    } else if (e.touches.length === 2 && hook('touchPinch')) {
      e.preventDefault();
      if (mode === 'drag') mouse('mouseup', start, 0);
      mode = 'pinch'; pinch = two(e.touches);
    } else {
      if (mode === 'drag') mouse('mouseup', start, 0);
      mode = 'done';
    }
  }

  function onMove(e) {
    if (e.target.tagName !== 'CANVAS' || !mode) return;
    e.stopImmediatePropagation();
    if (mode === 'drag') {
      e.preventDefault();
      const t = e.touches[0];
      if (Math.hypot(t.clientX - start.clientX, t.clientY - start.clientY) > TAP_MOVE) moved = true;
      mouse('mousemove', t, 1);
    } else if (mode === 'idle') {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - start.clientX, t.clientY - start.clientY) > TAP_MOVE) { moved = true; mode = 'done'; }   // a scroll
    } else if (mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const p = two(e.touches);
      mouse('mousemove', p, 0);
      hook('touchPinch')(p.d / Math.max(pinch.d, 1), p.clientX - pinch.clientX, p.clientY - pinch.clientY);
      pinch = p;
    }
  }

  function onEnd(e) {
    if (e.target.tagName !== 'CANVAS' || !mode) return;
    e.stopImmediatePropagation();
    if (e.touches.length) {               // fingers still down: finish the gesture when the last one lifts
      if (mode === 'pinch') mode = 'done';
      return;
    }
    const t = e.changedTouches[0];
    if (mode === 'drag') {
      e.preventDefault();
      mouse('mouseup', t, 0);
      if (!moved) tap(t);
    } else if (mode === 'idle' && !moved) {
      e.preventDefault();                 // no emulated mouse events: send our own click
      mouse('mousedown', t, 1);
      mouse('mouseup', t, 0);
      tap(t);
    }
    mode = null; touchHit = 1;
  }

  const opts = { capture: true, passive: false };
  window.addEventListener('touchstart', onStart, opts);
  window.addEventListener('touchmove', onMove, opts);
  window.addEventListener('touchend', onEnd, opts);
  window.addEventListener('touchcancel', e => {
    if (mode === 'drag' && canvas) mouse('mouseup', e.changedTouches[0], 0);
    mode = null; touchHit = 1;
  }, opts);
})();
