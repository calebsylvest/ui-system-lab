const { chromium } = require('playwright');
const ids = ['baseline','fluid','skills','feel-better','libraries','ui-craft','taste','uiwiki','ibelick','emil','kemiljk','magicui'];
const names = ['dialog','close','menu','close','tab','toast','task-add','task-complete','task-move','task-sort','task-remove','sheet','close','popover','close','combobox','close','command','close','save-fail','offline','offline','reload'];
(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    const p = await b.newPage({ viewport: { width: 1300, height: 920 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:4174/_harness.html#' + id); await p.waitForTimeout(2500);
    const fr = p.frames()[1];
    const opened = {};
    for (const n of names) {
      await fr.evaluate(n => window.postMessage({ type: 'lab:action', name: n }, '*'), n);
      await p.waitForTimeout(n === 'close' ? 500 : 900);
      if (['dialog','menu','sheet','popover','combobox','command'].includes(n)) opened[n] = await fr.evaluate(() => !!document.querySelector('[role="dialog"],[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper],[cmdk-root] input'));
    }
    const res = await p.evaluate(() => window.results);
    const missing = res.filter(r => !r.ok).map(r => r.name);
    const notOpened = Object.entries(opened).filter(([, v]) => !v).map(([k]) => k);
    console.log(id.padEnd(12), 'missing:', JSON.stringify([...new Set(missing)]), 'didnt-open:', JSON.stringify(notOpened), 'errors:', errs.length ? errs.slice(0,2) : 0);
    await p.close();
  }
  await b.close();
})();
