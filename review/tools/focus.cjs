// Focus-ring contact sheet: keyboard-focus Export button, first text input in settings, first switch, a tab trigger.
const { chromium } = require('playwright');
const ids = process.argv.slice(3);
const theme = process.argv[2];
const BASE = 'http://localhost:4174/variants/';
(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(BASE + id + '/index.html' + (theme === 'dark' ? '?theme=dark' : ''));
    await p.waitForTimeout(1500);
    const targets = [
      ['export', p.getByRole('button', { name: /export/i }).first()],
      ['tab', p.getByRole('tab', { name: /invoices/i }).first()],
      ['input', p.getByLabel(/studio name/i).first()],
      ['switch', p.getByRole('switch').first()],
    ];
    for (const [n, loc] of targets) {
      try {
        await loc.scrollIntoViewIfNeeded({ timeout: 8000 });
        await p.keyboard.press('Shift');
        await loc.evaluate(el => el.focus());
        await p.waitForTimeout(250);
        const bb = await loc.boundingBox();
        await p.screenshot({ path: `/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/focus/${theme}-${id}-${n}.png`, clip: { x: Math.max(0, bb.x - 14), y: Math.max(0, bb.y - 14), width: Math.min(bb.width + 28, 260), height: bb.height + 28 } });
      } catch (e) { console.log(id, n, 'fail', e.message.slice(0, 80)); }
    }
    await p.close();
  }
  await b.close();
})();
