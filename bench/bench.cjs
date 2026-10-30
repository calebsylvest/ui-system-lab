// UI System Lab benchmark: load metrics, interaction smoothness, responsiveness, screenshots.
// Usage: node bench.cjs <variantId> <outDir> [runs]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE = 'http://localhost:4174/variants/';
const [, , id, outDir, runsArg] = process.argv;
const RUNS = Number(runsArg || 2);
fs.mkdirSync(outDir, { recursive: true });

function bundle(dir) {
  const out = { js: 0, jsGz: 0, css: 0, cssGz: 0, font: 0 };
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    const buf = fs.readFileSync(p);
    if (/\.js$/.test(e.name) && e.name !== 'lab-bridge.js') { out.js += buf.length; out.jsGz += zlib.gzipSync(buf).length; }
    else if (/\.css$/.test(e.name)) { out.css += buf.length; out.cssGz += zlib.gzipSync(buf).length; }
    else if (/\.(woff2?|ttf|otf)$/.test(e.name)) out.font += buf.length;
  });
  walk(dir);
  return out;
}

const INIT = () => {
  window.__lab = { lcp: 0, cls: 0, long: [], events: [], frames: [] };
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lab.lcp = e.startTime; })).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__lab.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lab.long.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.interactionId) window.__lab.events.push([e.name, e.duration]); })).observe({ type: 'event', durationThreshold: 16, buffered: true });
};

async function tryStep(log, name, fn) {
  try { await fn(); log.push([name, 'ok']); } catch (e) { log.push([name, 'skip']); }
}

async function run(browser, collectShots) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.addInitScript(INIT);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const t0 = Date.now();
  await page.goto(BASE + id + '/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const load = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const tbt = window.__lab.long.filter(([s]) => s < 5000).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
    return { fcp: fcp ? fcp.startTime : null, lcp: window.__lab.lcp, cls: window.__lab.cls, tbt, domContentLoaded: nav.domContentLoadedEventEnd };
  });
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));

  // Interaction script. Steps that don't exist in a variant are skipped and logged.
  await page.evaluate(() => {
    window.__lab.events = []; window.__lab.long = []; window.__lab.frames = [];
    let last = performance.now();
    const tick = (t) => { window.__lab.frames.push(t - last); last = t; if (!window.__lab.stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const log = [];
  await tryStep(log, 'dialog', async () => { await page.getByRole('button', { name: /new project/i }).first().click({ timeout: 2000 }); await page.waitForTimeout(700); await page.keyboard.press('Escape'); await page.waitForTimeout(600); });
  await tryStep(log, 'menu', async () => { await page.getByRole('button', { name: /actions for/i }).first().click({ timeout: 2000 }); await page.waitForTimeout(500); await page.keyboard.press('Escape'); await page.waitForTimeout(400); });
  await tryStep(log, 'tabs', async () => { for (const t of ['Invoices', 'Activity', 'Projects']) { await page.getByRole('tab', { name: t }).first().click({ timeout: 2000 }); await page.waitForTimeout(450); } });
  await tryStep(log, 'hover-cards', async () => { for (const n of ['Spring catalog redesign', 'Checkout flow audit', 'Donor portal v2', 'Onboarding emails', 'Annual report site', 'Menu boards']) { await page.getByText(n, { exact: true }).first().hover({ timeout: 1500 }); await page.waitForTimeout(160); } });
  await tryStep(log, 'tooltip', async () => { await page.getByRole('button', { name: /notifications/i }).first().hover({ timeout: 1500 }); await page.waitForTimeout(700); await page.mouse.move(5, 5); await page.waitForTimeout(300); });
  await tryStep(log, 'accordion', async () => { await page.getByText('Can clients see project progress?').first().click({ timeout: 2000 }); await page.waitForTimeout(700); });
  await tryStep(log, 'toast', async () => { await page.getByRole('button', { name: /success toast/i }).first().click({ timeout: 2000 }); await page.waitForTimeout(900); });
  await tryStep(log, 'scroll', async () => { for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 250); await page.waitForTimeout(60); } for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -250); await page.waitForTimeout(60); } });
  await tryStep(log, 'chat', async () => { await page.getByRole('button', { name: /summarize my hours/i }).first().click({ timeout: 2000 }); await page.waitForTimeout(3800); });
  const inter = await page.evaluate(() => {
    window.__lab.stop = true;
    const f = window.__lab.frames.slice(1).sort((a, b) => a - b);
    const sum = f.reduce((a, b) => a + b, 0);
    const ev = window.__lab.events.map(([, d]) => d).sort((a, b) => a - b);
    return {
      frames: f.length, avgFrame: sum / f.length, p95Frame: f[Math.floor(f.length * 0.95)],
      jank: f.filter((x) => x > 50).length / f.length,
      longTaskMs: window.__lab.long.reduce((a, [, d]) => a + d, 0),
      inpProxy: ev.length ? ev[Math.min(ev.length - 1, Math.floor(ev.length * 0.98))] : 0,
      maxEvent: ev.length ? ev[ev.length - 1] : 0,
      runningAnimations: document.getAnimations().length,
    };
  });
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const cpu = {};
  for (const k of ['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration']) cpu[k] = (m1[k] - m0[k]) * 1000;
  cpu.loadScript = m0.ScriptDuration * 1000;
  cpu.jsHeapMB = m1.JSHeapUsedSize / 1048576;

  if (collectShots) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const shot = async (file, theme, width) => {
      const p = await ctx.newPage();
      await p.setViewportSize({ width, height: 900 });
      await p.goto(BASE + id + '/index.html?theme=' + theme, { waitUntil: 'load' });
      await p.waitForTimeout(2200);
      await p.screenshot({ path: path.join(outDir, file), fullPage: true, animations: 'disabled', timeout: 15000 }).catch(() => {});
      await p.close();
    };
    await shot('light.png', 'light', 1280);
    await shot('dark.png', 'dark', 1280);
    await shot('phone.png', 'light', 390);
  }
  await ctx.close();
  return { load, inter, cpu, steps: log, errors, wall: Date.now() - t0 };
}

(async () => {
  const browser = await chromium.launch();
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await run(browser, i === 0));
  await browser.close();
  const med = (get) => { const v = runs.map(get).filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
  const result = {
    id, bundle: bundle(path.join(__dirname, '..', 'site', 'variants', id)),
    load: { fcp: med((r) => r.load.fcp), lcp: med((r) => r.load.lcp), cls: med((r) => r.load.cls), tbt: med((r) => r.load.tbt) },
    interaction: { avgFrame: med((r) => r.inter.avgFrame), p95Frame: med((r) => r.inter.p95Frame), jank: med((r) => r.inter.jank), longTaskMs: med((r) => r.inter.longTaskMs), inpProxy: med((r) => r.inter.inpProxy), maxEvent: med((r) => r.inter.maxEvent) },
    cpu: { script: med((r) => r.cpu.ScriptDuration), layout: med((r) => r.cpu.LayoutDuration), style: med((r) => r.cpu.RecalcStyleDuration), loadScript: med((r) => r.cpu.loadScript), heapMB: med((r) => r.cpu.jsHeapMB) },
    steps: runs[0].steps, errors: runs.flatMap((r) => r.errors).slice(0, 5), runs: RUNS,
  };
  fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(result, null, 2));
  console.log(id, JSON.stringify({ lcp: Math.round(result.load.lcp), tbt: Math.round(result.load.tbt), p95: Math.round(result.interaction.p95Frame), inp: Math.round(result.interaction.inpProxy), steps: result.steps.filter((s) => s[1] === 'skip').map((s) => s[0]) }));
})();
