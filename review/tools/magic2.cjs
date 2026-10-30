// magicui: reduced-motion reveal after scroll, ticker under reduced motion, and in-page find before scroll.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('http://localhost:4174/variants/magicui/index.html'); await p.waitForTimeout(300);
  const t = await p.evaluate(() => document.body.innerText.match(/\$[\d,]+/g).slice(0, 3));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1200);
  const o = await p.evaluate(() => { const h = [...document.querySelectorAll('div')].find(e => e.children.length === 0 && /^Workspace settings$/.test(e.textContent.trim())); let el = h, o = 1; while (el) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } return o; });
  // Anchor-jump style: focus an element in settings via keyboard without scrolling animation
  console.log({ tickerAt300ms_reduced: t, settingsOpacityAfterScroll_reduced: o });
  // blur filter on sections during reveal
  const p2 = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p2.goto('http://localhost:4174/variants/magicui/index.html'); await p2.waitForTimeout(100);
  await p2.screenshot({ path: '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/int/magic-load.png' });
  await p2.waitForTimeout(1500);
  await p2.mouse.move(400, 450); await p2.waitForTimeout(300);
  await p2.screenshot({ path: '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/int/magic-hover.png', clip: { x: 0, y: 330, width: 1280, height: 400 } });
  await b.close();
})();
