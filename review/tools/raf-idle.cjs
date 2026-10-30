// Count requestAnimationFrame callbacks and timers per second at idle.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const id of process.argv.slice(2)) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.addInitScript(() => { window.__raf = 0; window.__to = 0; const r = window.requestAnimationFrame; window.requestAnimationFrame = f => r(t => { window.__raf++; f(t); }); const s = window.setTimeout; window.setTimeout = (f, d, ...a) => { window.__to++; return s(f, d, ...a); }; const si = window.setInterval; window.__iv = 0; window.setInterval = (f, d, ...a) => { window.__iv++; return si(f, d, ...a); }; });
    await p.goto('http://localhost:4174/variants/' + id + '/index.html'); await p.waitForTimeout(4000);
    const a = await p.evaluate(() => [__raf, __to]); await p.waitForTimeout(2000); const c = await p.evaluate(() => [__raf, __to, __iv]);
    console.log(id, 'rAF/s', (c[0] - a[0]) / 2, 'timeouts/s', (c[1] - a[1]) / 2, 'intervals', c[2]);
    await p.close();
  }
  await b.close();
})();
