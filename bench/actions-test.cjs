const { chromium } = require('playwright');
(async () => {
  const id = process.argv[2] || 'baseline';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:4174/variants/${id}/index.html`); await p.waitForTimeout(1200);
  const results = await p.evaluate(async () => {
    const out = {};
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const listen = (name) => new Promise(res => {
      const h = (e) => { if (e.data && e.data.type === 'lab:action' ) {} };
      window.postMessage({ type: 'lab:action', name }, '*');
      setTimeout(res, 50);
    });
    const names = ['dialog','close','menu','close','toast','tab','tab','tab','task-add','task-complete','task-move','task-sort','task-remove','sheet','close','popover','close','combobox','close','command','close','save-fail','retry','offline','offline','reload'];
    for (const n of names) {
      await listen(n); await wait(700);
      const open = document.querySelector('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]');
      out[n] = (out[n] ? out[n] + ',' : '') + (open ? 'overlay' : 'none');
    }
    out.tasks = document.querySelectorAll('ul li').length;
    return out;
  });
  console.log(JSON.stringify(results), errs);
  await p.evaluate(() => window.postMessage({ type: 'lab:brand', brand: { primary: '#e8590c', font: 'source-serif', density: 'compact' } }, '*'));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/brand.png' });
  await b.close();
})();
