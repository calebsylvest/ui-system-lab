// Keyboard-remove the first task, report which row went and where focus landed.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const id of process.argv.slice(2)) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto('http://localhost:4174/variants/' + id + '/index.html'); await p.waitForTimeout(1200);
    const names = () => p.evaluate(() => [...document.querySelectorAll('button[aria-label^="Remove" i]')].map(b => b.getAttribute('aria-label').slice(7, 25)));
    const before = await names();
    const h = await p.$('button[aria-label^="Remove" i]');
    await h.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
    const after = await names();
    const f = await p.evaluate(() => { const e = document.activeElement; return e === document.body ? 'BODY' : e.tagName + ' ' + (e.getAttribute('aria-label') || e.getAttribute('role') || e.textContent).slice(0, 40); });
    console.log(id, '| before', before.length, '| after', after.length, after[0], '| focus:', f);
    await p.close();
  }
  await b.close();
})();
