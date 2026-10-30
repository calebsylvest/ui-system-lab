// Targeted checks: console errors, focus visibility, reduced-motion residue, below-fold visibility.
const { chromium } = require('playwright');
const ids = process.argv.slice(2);
const BASE = 'http://localhost:4174/variants/';
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const id of ids) {
    const r = { errors: [] };
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => r.errors.push('pageerror: ' + e.message));
    p.on('console', m => m.type() === 'error' && r.errors.push(m.text().slice(0, 160)));
    await p.goto(BASE + id + '/index.html');
    await p.waitForTimeout(1500);
    // Focus sweep: 40 tab stops
    const stops = [];
    for (let i = 0; i < 40; i++) {
      await p.keyboard.press('Tab');
      await p.waitForTimeout(60);
      stops.push(await p.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ow = parseFloat(cs.outlineWidth) || 0;
        const vis = (cs.outlineStyle !== 'none' && ow > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
        return { tag: el.tagName.toLowerCase(), name: (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim().slice(0, 24), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 80), vis };
      }));
    }
    r.focusInvisible = stops.filter(s => s && !s.vis).map(s => s.tag + ':' + s.name);
    r.focusSample = stops.slice(0, 40).filter(Boolean).map(s => s.tag + ':' + s.name + ' | ' + s.outline + ' | ' + s.shadow).slice(0, 6);
    // Below-fold sections visibility before scroll
    r.lowOpacity = await p.evaluate(() => {
      const res = [];
      document.querySelectorAll('main *').forEach(el => {
        const rc = el.getBoundingClientRect();
        if (rc.top > 1200 && rc.height > 100 && el.children.length) {
          const o = parseFloat(getComputedStyle(el).opacity);
          if (o < 0.1) res.push(el.className.toString().slice(0, 40));
        }
      });
      return res.length;
    });
    // Running animations at idle
    r.runningAnims = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    await ctx.close();
    // Reduced motion context
    const ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + id + '/index.html'); await p2.waitForTimeout(1500);
    r.reducedRunning = await p2.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName || a.constructor.name)).slice(0, 8));
    await ctx2.close();
    out[id] = r;
    console.log(id, JSON.stringify(r, null, 1));
  }
  await b.close();
})();
