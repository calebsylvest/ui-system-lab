const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:4174/_local.html'); await p.waitForTimeout(800);
  await p.selectOption('#pick-0', 'baseline');
  await p.keyboard.press('s'); await p.waitForTimeout(300);
  await p.selectOption('#pick-1', 'baseline'); await p.waitForTimeout(1500);
  await p.click('.sw[aria-label=Violet]'); await p.click('#density button[data-v=compact]');
  await p.selectOption('#action', 'sheet'); await p.click('#play'); await p.waitForTimeout(900);
  await p.screenshot({ path: '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/viewer2.png' });
  console.log('status:', await p.textContent('#status'), errs);
  await b.close();
})();
