// Sample task-row transforms and view transitions frame by frame during task-sort and task-add.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const rm = process.env.RM === '1';
  for (const id of process.argv.slice(2)) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    await p.goto('http://localhost:4174/variants/' + id + '/index.html'); await p.waitForTimeout(1500);
    for (const action of ['task-sort', 'task-add', 'task-remove']) {
      const res = await p.evaluate(action => new Promise(res => {
        const rows = () => [...document.querySelectorAll('button[aria-label^="Remove" i]')].map(b => b.closest('li, [role=listitem]') || b.parentElement.parentElement);
        let vtSeen = 0, maxT = 0, opac = 1, frames = 0, names = new Set();
        const tick = () => {
          frames++;
          document.getAnimations().forEach(a => { const pe = a.effect && a.effect.pseudoElement; if (pe && /view-transition/.test(pe)) { vtSeen++; names.add(pe.slice(0, 40)); } });
          rows().forEach(r => { let el = r; for (let i = 0; i < 2 && el; i++, el = el.parentElement) { const cs = getComputedStyle(el); const m = cs.transform.match(/matrix\(([^)]+)\)/); if (m) { const v = m[1].split(',').map(Number); maxT = Math.max(maxT, Math.abs(v[5]), Math.abs(1 - v[0]) * 100); } opac = Math.min(opac, +cs.opacity); } });
          if (frames < 30) requestAnimationFrame(tick); else res({ vtSeen, names: [...names].slice(0, 3), maxTranslatePx: Math.round(maxT), minOpacity: +opac.toFixed(2) });
        };
        window.postMessage({ type: 'lab:action', name: action }, '*');
        requestAnimationFrame(tick);
      }), action);
      console.log(id, rm ? 'RM' : '', action, JSON.stringify(res));
      await p.waitForTimeout(900);
    }
    await ctx.close();
  }
  await b.close();
})();
