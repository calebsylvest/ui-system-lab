// Variant-specific claim checks.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4174/variants/';
const SHOT = '/tmp/claude-0/-home-claude/a5f7f228-bf70-50c7-b777-29c6a263475e/scratchpad/int/';
const go = async (b, id, opts = {}, q = '') => { const p = await b.newPage({ viewport: { width: 1280, height: 900 }, ...opts }); await p.goto(BASE + id + '/index.html' + q); await p.waitForTimeout(1500); return p; };
const cards = (p) => p.evaluate(() => [...document.querySelectorAll('[role=tabpanel] *')].filter(e => e.children.length === 0 && /^(Spring catalog redesign|Checkout flow audit|Donor portal v2|Menu boards|Annual report site|Onboarding emails|Test Project X)/.test(e.textContent.trim())).length);
(async () => {
  const b = await chromium.launch();
  const only = process.argv[2];
  const run = async (name, fn) => { if (only && !only.split(',').includes(name)) return; try { console.log(name, JSON.stringify(await fn())); } catch (e) { console.log(name, 'ERR', e.message.slice(0, 200)); } };

  await run('newproject', async () => {
    const out = {};
    for (const id of ['baseline', 'kemiljk']) {
      const p = await go(b, id);
      const before = await cards(p);
      await p.getByRole('button', { name: /new project/i }).first().click();
      await p.getByRole('dialog').locator('input').first().fill('Test Project X');
      await p.getByRole('dialog').getByRole('button', { name: /create/i }).click();
      await p.waitForTimeout(800);
      out[id] = [before, await cards(p)];
      await p.close();
    }
    return out;
  });

  await run('archiveUndo', async () => {
    const out = {};
    for (const id of ['baseline', 'kemiljk']) {
      const p = await go(b, id);
      const before = await cards(p);
      await p.locator('[role=tabpanel]').getByRole('button').first().click();
      await p.getByRole('menuitem', { name: /archive/i }).click();
      await p.waitForTimeout(700);
      const mid = await cards(p);
      const undo = p.getByRole('button', { name: /undo/i }).first();
      let after = 'no undo';
      if (await undo.count()) { await undo.click(); await p.waitForTimeout(700); after = await cards(p); }
      out[id] = [before, mid, after];
      await p.close();
    }
    return out;
  });

  await run('ibelickDelete', async () => {
    const p = await go(b, 'ibelick');
    await p.locator('[role=tabpanel]').getByRole('button').first().click();
    await p.getByRole('menuitem', { name: /delete/i }).click();
    await p.waitForTimeout(500);
    const ad = await p.getByRole('alertdialog').count();
    const focus = await p.evaluate(() => document.activeElement.textContent.trim());
    await p.screenshot({ path: SHOT + 'ibelick-alert.png' });
    await p.getByRole('alertdialog').getByRole('button', { name: /cancel/i }).click();
    await p.waitForTimeout(400);
    const pointer = await p.evaluate(() => getComputedStyle(document.body).pointerEvents);
    // Can we still click things afterwards?
    await p.getByRole('tab', { name: /invoices/i }).click({ timeout: 3000 });
    return { alertdialog: ad, focus, bodyPointer: pointer, tabsClickableAfter: true };
  });

  await run('emilHold', async () => {
    const p = await go(b, 'emil');
    const del = p.getByRole('button', { name: /^delete$/i }).first();
    await del.click();
    await p.waitForTimeout(600);
    const quickToast = await p.evaluate(() => [...document.querySelectorAll('[data-sonner-toast]')].map(t => t.innerText).join('|'));
    const desc = await del.evaluate(e => e.getAttribute('aria-description'));
    const bb = await del.boundingBox();
    await p.mouse.move(bb.x + 10, bb.y + 10); await p.mouse.down(); await p.waitForTimeout(1000);
    await p.screenshot({ path: SHOT + 'emil-hold.png', clip: { x: bb.x - 20, y: bb.y - 20, width: 200, height: bb.height + 40 } });
    await p.waitForTimeout(1300); await p.mouse.up(); await p.waitForTimeout(500);
    const holdToast = await p.evaluate(() => [...document.querySelectorAll('[data-sonner-toast]')].map(t => t.innerText).join('|'));
    // keyboard
    await del.focus(); await p.keyboard.down('Space'); await p.waitForTimeout(2300); await p.keyboard.up('Space'); await p.waitForTimeout(400);
    const kbToasts = await p.evaluate(() => document.querySelectorAll('[data-sonner-toast]').length);
    return { quickToast, desc, holdToast, kbToasts };
  });

  await run('magicui', async () => {
    const p = await go(b, 'magicui');
    const vals = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^[\d$,.%]+$/.test(e.textContent.trim())).slice(0, 8).map(e => e.textContent.trim()));
    const lowerHidden = await p.evaluate(() => { const h = [...document.querySelectorAll('h1,h2,h3,div')].find(e => e.children.length === 0 && /^Workspace settings$/.test(e.textContent.trim())); let el = h, o = 1; while (el) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } return o; });
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1500);
    const afterScroll = await p.evaluate(() => { const h = [...document.querySelectorAll('h1,h2,h3,div')].find(e => e.children.length === 0 && /^Workspace settings$/.test(e.textContent.trim())); let el = h, o = 1; while (el) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } return o; });
    await p.close();
    const p2 = await go(b, 'magicui', { reducedMotion: 'reduce' });
    const reduced = await p2.evaluate(() => { const h = [...document.querySelectorAll('h1,h2,h3,div')].find(e => e.children.length === 0 && /^Workspace settings$/.test(e.textContent.trim())); let el = h, o = 1; while (el) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } return o; });
    const ticker = await p2.evaluate(() => document.body.innerText.match(/\$[\d,]+/g).slice(0, 3));
    await p2.close();
    return { valsAfter1_5s: vals, settingsOpacityBeforeScroll: lowerHidden, afterScroll, reducedMotionSettingsOpacity: reduced, reducedTicker: ticker };
  });

  await run('fluid', async () => {
    const p = await go(b, 'fluid');
    const r = {};
    r.buttons = await p.evaluate(() => [...document.querySelectorAll('button')].filter(x => !x.textContent.trim() && !x.getAttribute('aria-label') && !x.getAttribute('aria-labelledby')).map(x => x.outerHTML.slice(0, 120)).slice(0, 5));
    const del = p.getByRole('button', { name: /delete/i }).first();
    r.deleteBg = await del.evaluate(e => getComputedStyle(e).backgroundColor + ' / ' + getComputedStyle(e).color);
    r.inputBorders = await p.evaluate(() => [...document.querySelectorAll('input')].slice(0, 6).map(i => (i.getAttribute('aria-label') || i.id || i.name || i.placeholder) + ':' + getComputedStyle(i).borderTopWidth + ' ' + getComputedStyle(i).borderTopColor + ' bg ' + getComputedStyle(i).backgroundColor));
    r.accordionItems = await p.evaluate(() => [...document.querySelectorAll('[data-state], details, [aria-expanded]')].filter(e => /billable hours rounded|clients see/i.test(e.textContent) && e.textContent.length < 400).map(e => e.tagName + ' ' + e.getAttribute('aria-expanded')).slice(0, 4));
    const q = p.getByRole('button', { name: /clients see project progress/i });
    r.accBtn = await q.count();
    if (r.accBtn) { await q.first().click(); await p.waitForTimeout(600); r.accExpanded = await q.first().getAttribute('aria-expanded'); }
    await p.getByRole('tab', { name: /invoices/i }).click(); await p.waitForTimeout(500);
    await p.screenshot({ path: SHOT + 'fluid-invoices.png', clip: { x: 0, y: 300, width: 1280, height: 520 } });
    const hc = await p.evaluate(() => document.querySelectorAll('[data-hover-card], [data-radix-popper-content-wrapper]').length);
    r.popper = hc;
    return r;
  });

  await run('taste-phone', async () => {
    const p = await go(b, 'taste', { viewport: { width: 390, height: 844 } });
    await p.getByRole('button', { name: /menu|navigation|open/i }).first().click({ timeout: 4000 });
    await p.waitForTimeout(500);
    await p.screenshot({ path: SHOT + 'taste-phone-menu.png' });
    return { dialog: await p.getByRole('dialog').count() };
  });

  await run('uiwiki-sound', async () => {
    const p = await go(b, 'uiwiki');
    const sw = p.getByRole('switch', { name: /sound/i });
    return { soundSwitch: await sw.count(), checked: await sw.first().getAttribute('aria-checked') };
  });

  await run('libraries', async () => {
    const p = await go(b, 'libraries');
    const r = {};
    const t0 = Date.now();
    await p.getByRole('tab', { name: /invoices/i }).click({ timeout: 20000, force: true });
    r.tabClickMs = Date.now() - t0;
    await p.waitForTimeout(800);
    await p.screenshot({ path: SHOT + 'libraries-tabs.png', clip: { x: 0, y: 330, width: 700, height: 100 } });
    const t1 = Date.now();
    await p.getByRole('button', { name: /success toast/i }).click({ timeout: 20000, force: true });
    await p.waitForTimeout(800);
    r.toastMs = Date.now() - t1;
    r.toast = await p.evaluate(() => !!document.querySelector('[data-sonner-toast]'));
    const ta = p.locator('textarea').last(); await ta.fill('hi'); await ta.press('Enter');
    await p.waitForTimeout(1500);
    const bb = await ta.boundingBox();
    await p.screenshot({ path: SHOT + 'libraries-thinking.png', clip: { x: bb.x - 30, y: bb.y - 330, width: 520, height: 420 } });
    r.canvases = await p.evaluate(() => document.querySelectorAll('canvas').length);
    return r;
  });
  await b.close();
})();
