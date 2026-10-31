const { chromium } = require('playwright');
const fs = require('fs');
const ids = ['baseline', ...fs.readdirSync('site-blind').filter(d => d !== 'baseline').sort()];
(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    const out = `review-blind/${id}`; fs.mkdirSync(out, { recursive: true });
    const url = (t) => `http://localhost:4175/${id}/index.html?theme=${t}`;
    for (const [file, theme, w] of [['light.png','light',1280],['dark.png','dark',1280],['phone.png','light',390]]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.goto(url(theme)); await p.waitForTimeout(2500);
      await p.screenshot({ path: `${out}/${file}`, fullPage: true, timeout: 60000 }).catch(e => console.log(id, file, e.message.slice(0, 60)));
      await p.close();
    }
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(url('light')); await p.waitForTimeout(2000);
    const lab = (m) => p.evaluate((m) => window.postMessage(m, '*'), m);
    const act = async (n, w = 700) => { await lab({ type: 'lab:action', name: n }); await p.waitForTimeout(w); };
    await act('save-fail', 300); await act('offline', 1500);
    await p.locator('[aria-label="Tasks, quick actions and sync"]').first().screenshot({ path: `${out}/r2.png`, timeout: 30000 }).catch(() => {});
    await act('offline');
    for (const [n, f] of [['sheet','ov-sheet.png'],['command','ov-command.png'],['combobox','ov-picker.png'],['dialog','ov-dialog.png'],['menu','ov-menu.png']]) {
      await act(n, 900); await p.screenshot({ path: `${out}/${f}`, timeout: 30000 }).catch(() => {}); await act('close', 600);
    }
    await act('ledger-sort'); await act('wizard-fill'); await act('wizard-invalid', 500);
    await p.locator('[aria-label="Ledger and new client"]').first().screenshot({ path: `${out}/r3.png`, timeout: 30000 }).catch(() => {});
    await act('ledger-empty', 500);
    await p.locator('[aria-label="Ledger and new client"]').first().screenshot({ path: `${out}/r3-empty.png`, timeout: 30000 }).catch(() => {});
    await act('ledger-clear'); await act('wizard-fill'); await act('wizard-next'); await act('wizard-cancel', 900);
    await p.screenshot({ path: `${out}/ov-discard.png` }).catch(() => {}); await act('close');
    await lab({ type: 'lab:brand', brand: { primary: '#f5c400', density: 'compact' } }); await p.waitForTimeout(600);
    await p.evaluate(() => scrollTo(0, 0));
    await p.screenshot({ path: `${out}/brand-yellow.png`, fullPage: true, timeout: 60000 }).catch(() => {});
    await p.close();
    console.log(id, fs.readdirSync(out).length);
  }
  await b.close();
})();
