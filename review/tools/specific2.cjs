// magicui: ticker under reduced motion, below-fold visibility, idle animations.
// fluid: task title glyph clipping. all: idle running animations.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  let p = await ctx.newPage();
  await p.goto('http://localhost:4174/variants/magicui/index.html'); await p.waitForTimeout(300);
  console.log('magicui RM @300ms outstanding:', await p.evaluate(() => (document.body.innerText.match(/Outstanding\s*\$[\d,]+/) || [''])[0]));
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  p = await ctx.newPage();
  await p.goto('http://localhost:4174/variants/magicui/index.html'); await p.waitForTimeout(2000);
  console.log('magicui low-opacity big blocks below fold:', await p.evaluate(() => [...document.querySelectorAll('main *')].filter(el => { const r = el.getBoundingClientRect(); return r.top > 1000 && r.height > 100 && +getComputedStyle(el).opacity < 0.1; }).length));
  console.log('magicui idle anims:', await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName || a.constructor.name) + '@' + (a.effect.target && a.effect.target.className || '').toString().slice(0, 50))));
  // rate ticker during fail
  await p.evaluate(() => window.postMessage({ type: 'lab:action', name: 'save-fail' }, '*'));
  const seq = [];
  for (let i = 0; i < 14; i++) { await p.waitForTimeout(200); seq.push(await p.evaluate(() => { const m = document.body.innerText.match(/Default hourly rate\s*\$(\d+)/); return m && +m[1]; })); }
  console.log('magicui rate every 200ms after save-fail:', seq.join(' '));
  await ctx.close();
  // fluid clipping
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  p = await ctx.newPage();
  await p.goto('http://localhost:4174/variants/fluid/index.html'); await p.waitForTimeout(1500);
  console.log('fluid task titles:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button[aria-label^="Remove" i]')].slice(0, 2).map(btn => {
    const row = btn.closest('li') || btn.parentElement.parentElement;
    const t = [...row.querySelectorAll('*')].find(e => e.children.length === 0 && /catalog|tab order/i.test(e.textContent));
    if (!t) return 'nf';
    const out = []; let el = t;
    for (let i = 0; i < 4 && el; i++, el = el.parentElement) { const cs = getComputedStyle(el); out.push(el.tagName + ' h=' + el.clientHeight + ' sh=' + el.scrollHeight + ' lh=' + cs.lineHeight + ' fs=' + cs.fontSize + ' ov=' + cs.overflow); }
    return out;
  }))));
  await ctx.close();
  await b.close();
})();
