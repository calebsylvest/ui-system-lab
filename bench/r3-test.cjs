const { chromium } = require('playwright');
(async () => {
  const id = process.argv[2] || 'baseline', out = process.argv[3] || '/home/claude/scratch';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:4174/_harness.html#${id}`); await p.waitForTimeout(2000);
  const fr = p.frames()[1];
  const lab = async (n, w = 600) => { await fr.evaluate(n => window.postMessage({ type: 'lab:action', name: n }, '*'), n); await p.waitForTimeout(w); };
  for (const n of ['ledger-sort', 'ledger-next', 'ledger-filter', 'ledger-empty', 'ledger-clear', 'wizard-invalid', 'wizard-fill', 'wizard-next', 'wizard-back', 'wizard-cancel']) await lab(n);
  const dlg = await fr.evaluate(() => !!document.querySelector('[role="dialog"], [role="alertdialog"]'));
  await lab('close');
  const res = await p.evaluate(() => window.results);
  console.log(id, 'missing:', res.filter(r => !r.ok).map(r => r.name), 'discard-dialog:', dlg, 'errors:', errs);
  await lab('wizard-fill'); await lab('wizard-invalid', 300);
  const sec = fr.locator('[aria-label="Ledger and new client"]').first();
  await sec.screenshot({ path: `${out}/r3-${id}.png` }).catch(e => console.log(e.message));
  await b.close();
})();
