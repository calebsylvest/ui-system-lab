// Font bytes the browser actually downloads for each variant (light + dark, desktop),
// as opposed to every font file shipped in the build.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:4174/variants/';
const ids = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const id of ids) {
    const seen = new Map();
    for (const theme of ['light', 'dark']) {
      const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
      p.on('response', async (r) => { if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url())) { try { seen.set(r.url(), (await r.body()).length); } catch (e) {} } });
      await p.goto(BASE + id + '/index.html?theme=' + theme, { waitUntil: 'load' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      await p.waitForTimeout(800); await p.close();
    }
    out[id] = Math.round([...seen.values()].reduce((a, c) => a + c, 0) / 1024);
  }
  console.log(JSON.stringify(out)); await b.close();
})();
