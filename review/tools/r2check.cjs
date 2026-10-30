// Round-2 targeted checks: list motion on sort, focus after keyboard remove,
// save-fail/retry outcome, reduced motion, and yellow brand contrast/focus ring.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4174/variants/';
const ids = process.argv.slice(2);
const sleep = (p, ms) => p.waitForTimeout(ms);
const act = (p, n) => p.evaluate(n => window.postMessage({ type: 'lab:action', name: n }, '*'), n);

const helpers = `
window.__lum = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const [r,g,b] = m.slice(0,3).map(v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
window.__cr = (a,b) => { const x = __lum(a), y = __lum(b); if (x==null||y==null) return null; return +(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)); };
window.__bg = el => { while (el) { const c = getComputedStyle(el).backgroundColor; if (c && !/rgba\\(.*, 0\\)$/.test(c) && c !== 'transparent') return c; el = el.parentElement; } return 'rgb(255, 255, 255)'; };
window.__desc = el => !el ? 'null' : el === document.body ? 'BODY' : (el.tagName.toLowerCase() + (el.getAttribute('role') ? '/' + el.getAttribute('role') : '') + '[' + (el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent) || (el.id && document.querySelector('label[for="' + el.id + '"]') || {}).textContent || el.getAttribute('data-lab') || el.textContent || el.placeholder || '').replace(/\\s+/g,' ').trim().slice(0,40) + ']');
`;

async function sortMotion(p) {
  await act(p, 'task-sort');
  const samples = [];
  for (const t of [40, 120]) {
    await sleep(p, t === 40 ? 40 : 80);
    samples.push(await p.evaluate(() => {
      const anims = document.getAnimations().filter(a => a.playState === 'running');
      const desc = anims.slice(0, 40).map(a => {
        const tgt = a.effect && a.effect.target; const pe = a.effect && a.effect.pseudoElement;
        return (pe ? pe : (tgt ? tgt.tagName : '?')) + ':' + (a.animationName || a.transitionProperty || a.constructor.name);
      });
      const vt = desc.filter(d => /view-transition.*task/.test(d)).length;
      const sb = document.querySelector('[data-lab="task-sort"]') || [...document.querySelectorAll('button')].find(b => /sort/i.test(b.textContent));
      const card = sb && (sb.closest('[data-slot="card"]') || sb.closest('section') || sb.parentElement.parentElement.parentElement);
      const listAnims = anims.filter(a => { const t = a.effect && a.effect.target; return t && card && card.contains(t) && !/pulse|spin/.test(a.animationName || '') && !(t.tagName === 'BUTTON'); }).map(a => (a.animationName || a.transitionProperty || 'waapi:' + JSON.stringify(a.effect.getKeyframes().map(k => k.transform || k.translate || k.opacity)).slice(0, 60)));
      const lis = [...document.querySelectorAll('[data-lab="task-list"] li, [data-lab="task-list"] [role=listitem]')];
      const moved = [...document.querySelectorAll('li, [role=listitem]')].filter(el => { const t = getComputedStyle(el).transform; return t && t !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(t); }).length;
      return { vt, list: listAnims.length, kinds: [...new Set(listAnims)].slice(0, 3) };
    }));
  }
  return samples;
}

async function run(b, id) {
  const r = { id };
  const errs = [];
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  let p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.goto(BASE + id + '/index.html'); await sleep(p, 1500);
  await p.addScriptTag({ content: helpers });
  // idle animations
  r.idleRunning = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
  // 1. sort motion
  r.sort = await sortMotion(p);
  await sleep(p, 800);
  // move motion
  await act(p, 'task-move'); await sleep(p, 50);
  r.moveRunning = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
  await sleep(p, 800);
  // 2. remove by keyboard -> focus
  r.removeFocus = await (async () => {
    const h = await p.$('button[aria-label^="Remove" i]:not([aria-disabled=true])') || await p.$('[data-lab="task-remove"]'); if (!h) return 'no hook';
    await h.focus(); await p.keyboard.press('Enter'); await sleep(p, 900);
    return p.evaluate(() => __desc(document.activeElement));
  })();
  // undo via toast
  r.taskCountAfterRemove = await p.evaluate(() => document.querySelectorAll('button[aria-label^="Remove" i]').length);
  r.undo = await p.evaluate(() => { const u = [...document.querySelectorAll('button')].find(b => /undo/i.test(b.textContent)); if (!u) return 'no undo'; u.click(); return 'clicked'; });
  await sleep(p, 900);
  r.focusAfterUndo = await p.evaluate(() => __desc(document.activeElement));
  r.taskCountAfterUndo = await p.evaluate(() => document.querySelectorAll('button[aria-label^="Remove" i]').length);
  // 3. save-fail / retry
  const rateTxt = () => p.evaluate(() => { const m = document.body.innerText.match(/Default hourly rate[\s\S]{0,40}?\$(\d+)/); return m ? +m[1] : null; });
  r.rate0 = await rateTxt();
  await act(p, 'save-fail'); await sleep(p, 300);
  r.rateDuring = await rateTxt();
  await sleep(p, 1600);
  r.rateAfterFail = await rateTxt();
  r.errorShown = await p.evaluate(() => /couldn.t save|not saved/i.test(document.body.innerText));
  await sleep(p, 1200);
  r.rateAfterFailSettled = await rateTxt();
  const rh = await p.$('[data-lab="retry"]');
  if (rh) { await rh.focus(); await p.keyboard.press('Enter'); }
  await sleep(p, 300); r.rateDuringRetry = await rateTxt();
  await sleep(p, 2200);
  r.rateAfterRetry = await rateTxt();
  r.errorAfterRetry = await p.evaluate(() => /couldn.t save|not saved/i.test(document.body.innerText));
  r.focusAfterRetry = await p.evaluate(() => __desc(document.activeElement));
  // reload: skeleton then error
  await act(p, 'reload'); await sleep(p, 300);
  r.reloadBusy = await p.evaluate(() => !!document.querySelector('[aria-busy="true"]') + '/' + document.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"], .animate-pulse').length);
  await sleep(p, 1800);
  r.reloadResult = await p.evaluate(() => /couldn.t load|not loaded/i.test(document.body.innerText) ? 'error' : 'ok');
  // overlays: command focus
  await act(p, 'command'); await sleep(p, 400);
  r.commandFocus = await p.evaluate(() => __desc(document.activeElement));
  await p.keyboard.press('Escape'); await sleep(p, 300);
  await p.keyboard.press('Escape'); await sleep(p, 400);
  r.afterCommandClose = await p.evaluate(() => __desc(document.activeElement) + ' open=' + !!document.querySelector('[role=dialog]'));
  await act(p, 'sheet'); await sleep(p, 700);
  r.sheetFocus = await p.evaluate(() => __desc(document.activeElement));
  await p.keyboard.press('Escape'); await sleep(p, 700);
  r.afterSheetClose = await p.evaluate(() => __desc(document.activeElement));
  r.errors = errs.slice(0, 3);
  await ctx.close();

  // 4. reduced motion
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  p = await ctx.newPage();
  await p.goto(BASE + id + '/index.html'); await sleep(p, 1500);
  r.rmSort = await sortMotion(p);
  await sleep(p, 600);
  await act(p, 'task-add'); await sleep(p, 60);
  r.rmAdd = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.effect && a.effect.pseudoElement || '') + (a.animationName || a.transitionProperty || 'waapi')).slice(0, 6));
  await act(p, 'sheet'); await sleep(p, 60);
  r.rmSheet = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => { const k = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : []; return (a.animationName || 'waapi') + ':' + k.map(f => f.transform || f.translate || '').join('|').slice(0, 50); }).slice(0, 4));
  await ctx.close();

  // 5. brand yellow + compact
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  p = await ctx.newPage();
  await p.goto(BASE + id + '/index.html'); await sleep(p, 1500);
  await p.addScriptTag({ content: helpers });
  const measure = () => p.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const pick = re => btns.find(b => re.test(b.textContent.trim()));
    const out = {};
    for (const [k, re] of [['newProject', /^new project$/i], ['raise', /^raise by/i], ['save', /^save changes$/i], ['primaryCtl', /^primary$/i]]) {
      const el = pick(re); if (!el) { out[k] = null; continue; }
      const cs = getComputedStyle(el); const bg = __bg(el);
      out[k] = { bg, fg: cs.color, cr: __cr(cs.color, bg), h: Math.round(el.getBoundingClientRect().height) };
    }
    out.cardPad = (() => { const c = document.querySelector('[data-slot="card"]') || document.querySelector('.rounded-xl'); return c ? getComputedStyle(c).paddingTop : null; })();
    out.fontSize = getComputedStyle(document.body).fontFamily.slice(0, 30);
    return out;
  });
  const ringAt = async () => {
    const out = {};
    const add = await p.$('[data-lab="task-add"]'); if (!add) return 'no add';
    await add.focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(p, 200);
    const rd = () => p.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { el: __desc(el), outline: cs.outlineStyle === 'none' ? 'none' : cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor + ' cr=' + __cr(cs.outlineColor, __bg(el.parentElement)), shadow: cs.boxShadow.replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?/g,'').slice(0, 110) }; });
    out.button = await rd();
    await p.keyboard.press('Shift+Tab'); await sleep(p, 200);
    out.input = await rd();
    return out;
  };
  r.brandBefore = await measure();
  r.ringBefore = await ringAt();
  await p.evaluate(() => window.postMessage({ type: 'lab:brand', brand: { primary: '#f5c400', density: 'compact' } }, '*'));
  await sleep(p, 500);
  r.brandAfter = await measure();
  // focus ring on a keyboard-focused button and input
  r.ring = await ringAt();
  await ctx.close();
  return r;
}

(async () => {
  const b = await chromium.launch();
  for (const id of ids) {
    try { console.log(JSON.stringify(await run(b, id))); } catch (e) { console.log(JSON.stringify({ id, fail: e.message.slice(0, 200) })); }
  }
  await b.close();
})();
