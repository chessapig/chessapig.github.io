// Dev auto-reload: load the sketch files uncached, and reload the page when any of them changes.
const FILES = ['../island.js', '../../libraries/sketch-ui.js', '../../libraries/sketch-touch.js', '../lines.js', 'symplectic.js', 'limit.js', 'sketch.js'];
const stamp = f => fetch(f, { cache: 'no-store' }).then(r => r.headers.get('Last-Modified') + r.headers.get('Content-Length'));
// Set window.FIXED_MODE before loading this to show a single mode, without the dropdown.
(async () => {
  const t0 = await Promise.all(FILES.map(stamp));
  for (const f of FILES) await new Promise(res => {
    const s = document.createElement('script');
    s.src = f + '?t=' + Date.now(); s.onload = s.onerror = res;
    document.head.appendChild(s);
  });
  // p5 starts itself on window load; if that already happened before the sketch loaded, start it here
  if (document.readyState !== 'complete') await new Promise(r => addEventListener('load', r));
  await new Promise(r => setTimeout(r, 0));
  if (!p5.instance) new p5();
  setInterval(async () => {
    try { if ((await Promise.all(FILES.map(stamp))).join() !== t0.join()) location.reload(); } catch (e) {}
  }, 500);
})();
