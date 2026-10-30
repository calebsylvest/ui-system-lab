const { chromium } = require('playwright');
(async () => {
  const [id, out] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const [file, theme, w] of [['light.png','light',1280],['dark.png','dark',1280],['phone.png','light',390]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(`http://localhost:4174/variants/${id}/index.html?theme=${theme}`); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${file}`, fullPage: true, timeout: 60000, caret: 'initial' }).catch(e => console.log(file, e.message.slice(0,100)));
    await p.close();
  }
  await b.close();
})();
