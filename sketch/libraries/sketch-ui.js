// Sketch controls that can live outside the canvas.
// Run on its own, a sketch shows its controls in a panel over the top-left of the canvas.
// Embedded with an Obsidian [!sketch] callout (see _includes/callouts.html), the page gives the
// iframe a panel below it, and the controls are built there instead.
//   uiRow(...els)  -- put p5 elements (sliders, selects, buttons, readouts) side by side; returns the row div
//   uiReadout()    -- a p5 span for text that changes; set it with .html(...)
//   uiHint(text)   -- a line of instructions
// and, for sketches that draw on demand (noLoop):
//   redrawSoon()   -- redraw on the next animation frame; calls in between are merged into that one redraw
// With ?poster in the URL, run on its own, the controls are hidden (for screenshots).

let uiPanel_ = null;

function uiPanel() {
  if (uiPanel_) return uiPanel_;
  let host = null;
  try { host = window.frameElement && window.frameElement.sketchPanel; } catch (e) {}
  if (host) {
    host.textContent = '';   // the sketch may have reloaded
    uiPanel_ = host;
  } else {
    const style = document.createElement('style');
    style.textContent = `
      .sketch-ui { position: absolute; left: 16px; top: 16px; display: flex; flex-direction: column; gap: 8px;
                   font: 14px sans-serif; color: #fff; }
      .sketch-ui-row { display: flex; align-items: center; gap: 8px; }
      .sketch-ui-hint { position: fixed; left: 12px; bottom: 10px; font-size: 12px; opacity: 0.63; }`;
    document.head.appendChild(style);
    uiPanel_ = document.createElement('div');
    uiPanel_.className = 'sketch-ui';
    if (/[?&]poster\b/.test(location.search)) uiPanel_.style.display = 'none';   // screenshots for posters (_tools/make-posters.py)
    document.body.appendChild(uiPanel_);
  }
  return uiPanel_;
}

function uiRow(...els) {
  const panel = uiPanel(), row = panel.ownerDocument.createElement('div');
  row.className = 'sketch-ui-row';
  for (const e of els) row.appendChild(e.elt || e);
  panel.appendChild(row);
  return row;
}

const uiReadout = () => createSpan('').addClass('sketch-ui-readout');

function uiHint(text) {
  const row = uiRow(createSpan(text));
  row.classList.add('sketch-ui-hint');
  return row;
}

let redrawPending_ = false;

function redrawSoon() {
  if (redrawPending_) return;
  redrawPending_ = true;
  requestAnimationFrame(() => { redrawPending_ = false; redraw(); });
}
