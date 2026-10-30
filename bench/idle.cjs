const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const id of process.argv.slice(2)) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
    await p.goto('http://localhost:4174/variants/' + id + '/index.html'); await p.waitForTimeout(2000);
    const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const a = await g(); await p.waitForTimeout(5000); const z = await g();
    const canv = await p.evaluate(() => [...document.querySelectorAll('canvas')].map(c => c.width + 'x' + c.height + (c.getContext ? '' : '')));
    console.log(id, 'idle script ms/s:', ((z.ScriptDuration - a.ScriptDuration) * 200).toFixed(0), 'task ms/s:', ((z.TaskDuration - a.TaskDuration) * 200).toFixed(0), 'canvases:', canv.length, canv.slice(0,6).join(','));
    await ctx.close();
  }
  await b.close();
})();
