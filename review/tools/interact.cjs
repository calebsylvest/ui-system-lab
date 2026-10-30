// Targeted interaction checks across variants.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4174/variants/';
const SHOT = '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/int/';
const ids = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    const r = {};
    // 1. Dark-mode toast colour
    let p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(BASE + id + '/index.html?theme=dark'); await p.waitForTimeout(1200);
    try {
      await p.getByRole('button', { name: /^plain toast$/i }).first().click({ timeout: 5000 });
      await p.waitForTimeout(600);
      r.darkToastBg = await p.evaluate(() => { const t = document.querySelector('[data-sonner-toast]'); return t ? getComputedStyle(t).backgroundColor : 'none'; });
    } catch (e) { r.darkToastBg = 'fail ' + e.message.slice(0, 60); }
    await p.close();

    p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(BASE + id + '/index.html'); await p.waitForTimeout(1200);
    // 2. Dropdown menu open motion: animation on menu content right after open
    try {
      await p.getByRole('button', { name: /more|actions|options|menu/i }).first().click({ timeout: 4000 });
      await p.waitForTimeout(30);
      r.menuAnim = await p.evaluate(() => {
        const m = document.querySelector('[role=menu]'); if (!m) return 'no menu';
        const cs = getComputedStyle(m);
        return { anim: cs.animationName + ' ' + cs.animationDuration + ' ' + cs.animationTimingFunction.slice(0, 40), trans: cs.transitionDuration, opacity: cs.opacity, transform: cs.transform.slice(0, 40) };
      });
      await p.waitForTimeout(400);
      await p.screenshot({ path: SHOT + id + '-menu.png', clip: { x: 0, y: 300, width: 1280, height: 400 } });
      await p.keyboard.press('Escape');
    } catch (e) { r.menuAnim = 'fail ' + e.message.slice(0, 80); }
    // 3. Dialog open motion
    try {
      await p.getByRole('button', { name: /new project/i }).first().click({ timeout: 4000 });
      await p.waitForTimeout(40);
      r.dialogAnim = await p.evaluate(() => {
        const m = document.querySelector('[role=dialog]'); if (!m) return 'no dialog';
        const cs = getComputedStyle(m);
        return cs.animationName + ' ' + cs.animationDuration + ' ' + cs.animationTimingFunction.slice(0, 40) + ' op=' + cs.opacity + ' tf=' + cs.transform.slice(0, 50);
      });
      await p.waitForTimeout(400);
      await p.screenshot({ path: SHOT + id + '-dialog.png' });
      // submit empty -> error, then fill and create
      const create = p.getByRole('dialog').getByRole('button', { name: /create/i }).first();
      await create.click({ timeout: 3000 });
      await p.waitForTimeout(300);
      r.dialogErrorFocus = await p.evaluate(() => document.activeElement && (document.activeElement.tagName + ' ' + (document.activeElement.id || document.activeElement.name || '')));
      await p.getByRole('dialog').locator('input').first().fill('Test Project X');
      await create.click({ timeout: 3000 });
      await p.waitForTimeout(800);
      r.newProjectAdded = await p.evaluate(() => document.body.innerText.includes('Test Project X'));
      r.dialogClosed = await p.evaluate(() => !document.querySelector('[role=dialog]'));
    } catch (e) { r.dialog = 'fail ' + e.message.slice(0, 80); await p.keyboard.press('Escape'); }
    // 4. Tabs: switch to Invoices and select a row
    try {
      await p.getByRole('tab', { name: /invoices/i }).first().click({ timeout: 4000 });
      await p.waitForTimeout(400);
      const cb = p.getByRole('tabpanel').getByRole('checkbox').nth(1);
      await cb.click({ timeout: 3000 });
      await p.waitForTimeout(300);
      r.invoiceSelect = await p.evaluate(() => /selected/i.test(document.body.innerText));
      await p.screenshot({ path: SHOT + id + '-invoices.png', clip: { x: 0, y: 330, width: 1280, height: 520 } });
    } catch (e) { r.tabs = 'fail ' + e.message.slice(0, 80); }
    // 5. Accordion: open second question
    try {
      await p.getByText(/clients see project progress/i).first().click({ timeout: 4000 });
      await p.waitForTimeout(500);
      r.accordionOpen = await p.evaluate(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /share a read-only|clients can|client view/i.test(e.textContent)); return t ? t.getBoundingClientRect().height > 0 && getComputedStyle(t).visibility !== 'hidden' : 'text not found'; });
    } catch (e) { r.accordion = 'fail ' + e.message.slice(0, 80); }
    // 6. Chat: send message, check reply
    try {
      const ta = p.locator('textarea').last();
      await ta.fill('What is unpaid?');
      await ta.press('Enter');
      await p.waitForTimeout(4500);
      r.chatMsgs = await p.evaluate(() => (document.body.innerText.match(/What is unpaid\?/g) || []).length);
      await p.screenshot({ path: SHOT + id + '-chat.png', clip: { x: 640, y: 0, width: 640, height: 900 }, fullPage: false });
    } catch (e) { r.chat = 'fail ' + e.message.slice(0, 80); }
    // 7. Toasts in light
    try {
      await p.getByRole('button', { name: /success toast/i }).first().click({ timeout: 4000 });
      await p.waitForTimeout(500);
      r.toastShown = await p.evaluate(() => !!document.querySelector('[data-sonner-toast]'));
    } catch (e) { r.toast = 'fail ' + e.message.slice(0, 80); }
    console.log(id, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})();
