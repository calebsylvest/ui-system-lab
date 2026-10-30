// Brand stress screenshots: yellow primary + compact density, plus round-2 overlay states.
const { chromium } = require('playwright');
const ids = ['baseline','fluid','skills','feel-better','libraries','ui-craft','taste','uiwiki','ibelick','emil','kemiljk','magicui'];
(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    const out = `review/out/${id}`;
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(`http://localhost:4174/variants/${id}/index.html`); await p.waitForTimeout(2000);
    const lab = (msg) => p.evaluate((m) => window.postMessage(m, '*'), msg);
    // round-2 section crop
    const r2 = p.locator('[aria-label="Tasks, quick actions and sync"]').first();
    await lab({ type: 'lab:action', name: 'save-fail' }); await lab({ type: 'lab:action', name: 'offline' });
    await p.waitForTimeout(1600);
    await r2.screenshot({ path: `${out}/r2.png`, timeout: 30000 }).catch(e => console.log(id, 'r2', e.message.slice(0, 80)));
    await lab({ type: 'lab:action', name: 'offline' });
    for (const [n, f] of [['sheet', 'r2-sheet.png'], ['command', 'r2-command.png'], ['combobox', 'r2-picker.png']]) {
      await lab({ type: 'lab:action', name: n }); await p.waitForTimeout(900);
      await p.screenshot({ path: `${out}/${f}`, timeout: 30000 }).catch(() => {});
      await lab({ type: 'lab:action', name: 'close' }); await p.waitForTimeout(600);
    }
    await lab({ type: 'lab:brand', brand: { primary: '#f5c400', density: 'compact' } }); await p.waitForTimeout(600);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/brand-yellow.png`, fullPage: true, timeout: 30000 }).catch(e => console.log(id, 'brand', e.message.slice(0, 80)));
    await p.close();
    console.log(id, 'done');
  }
  await b.close();
})();
