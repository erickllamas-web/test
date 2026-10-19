// Seam harness: drives the player through each seam in headless Chromium and records
// a timeline of (wall ms, video state, screenshot). Analysis is done by analyse.py.
//   node harness.mjs <site_dir> <index.html> <out_dir> [scenario,...] [viewport WxH]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const [site, indexFile, out, scen = 'start,sun,rotate,fly,loop,drag', vp = '375x667', net = ''] = process.argv.slice(2);
const [VW, VH] = vp.split('x').map(Number);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
// serve a copy of the site with the chosen index
const srv = fs.mkdtempSync('/tmp/claude-0/-home-user-test/6d9528b0-6431-5225-87a4-8233b3d39536/scratchpad/work/srv-');
for (const f of fs.readdirSync(site)) fs.symlinkSync(path.join(site, f), path.join(srv, f));
fs.copyFileSync(indexFile, path.join(srv, 'index.html'));
const port = 8100 + Math.floor(Math.random() * 800);
const server = spawn('/opt/node22/bin/http-server', [srv, '-p', String(port), '-s', '-c-1'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
// optional network shaping: "<mbit>/<latency ms>", e.g. 25/30 for a phone on wifi
if (net) {
  const [mbit, lat] = net.split('/').map(Number);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: lat || 0,
    downloadThroughput: mbit * 125000, uploadThroughput: 5 * 125000 });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const state = () => page.evaluate(() => {
  const v = (x) => ({ t: +x.currentTime.toFixed(3), paused: x.paused, rs: x.readyState, seeking: x.seeking,
                      src: (x.getAttribute('src') || '').split('/').pop(), op: getComputedStyle(x).opacity,
                      cls: x.className, w: x.videoWidth, h: x.videoHeight });
  const vids = [vFilm, vNight].map(v);
  return { vids, sunOff: S.sunOff, shape: S.shape, Wn: S.Wn, Hn: S.Hn, look: !!S.look,
           frame: { w: parseFloat(frame.style.width), h: parseFloat(frame.style.height) },
           xf: stage.style.transform, veil: (typeof VEIL !== 'undefined' ? +VEIL.a.toFixed(2) : null) };
});
const timeline = [];
let n = 0;
async function sample(tag, t0) {
  const file = `${tag}_${String(n++).padStart(3, '0')}.png`;
  const st = await state();
  const ms = performance.now() - t0;
  await page.screenshot({ path: path.join(out, file), animations: 'allow', caret: 'hide' });
  timeline.push({ tag, ms: +ms.toFixed(0), file, ...st });
}
async function record(tag, durMs, every = 40) {
  const t0 = performance.now();
  while (performance.now() - t0 < durMs) { await sample(tag, t0); const left = every - ((performance.now() - t0) % every); await sleep(Math.max(1, left)); }
}
const want = new Set(scen.split(','));
// ── start ───────────────────────────────────────────────────────────────────
const t0 = performance.now();
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'commit' });
if (want.has('start')) await record('start', 4000, 60);
else await page.waitForFunction(() => typeof S !== 'undefined' && S.film && S.seek && S.aim, null, { timeout: 15000 });
await page.waitForFunction(() => typeof S !== 'undefined' && S.film && S.seek && S.aim && vFilm.readyState >= 2, null, { timeout: 15000 });
// counters on both videos (re-attachable: a shape swap replaces the elements)
const attach = () => page.evaluate(() => {
  window.__ev = {};
  for (const [name, v] of [['film', vFilm], ['night', vNight]]) {
    window.__ev[name] = { seeking: 0, seeked: 0, frames: 0, stalled: 0, waiting: 0 };
    v.addEventListener('seeking', () => window.__ev[name].seeking++);
    v.addEventListener('seeked', () => window.__ev[name].seeked++);
    v.addEventListener('waiting', () => window.__ev[name].waiting++);
    v.addEventListener('stalled', () => window.__ev[name].stalled++);
    const cb = () => { window.__ev[name].frames++; v.requestVideoFrameCallback(cb); };
    v.requestVideoFrameCallback(cb);
  }
});
await attach();
const counters = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__ev)));
const resetCounters = () => attach();
// ── the Sun switch ─────────────────────────────────────────────────────────
if (want.has('sun')) {
  await page.evaluate(() => { vFilm.currentTime = 21.5; });
  await page.waitForFunction(() => !vFilm.seeking && vFilm.readyState >= 2); await sleep(300);
  const before = await state();
  const t1 = performance.now(); await page.click('#sun'); await record('sun', 1600, 40);
  const after = await state();
  timeline.push({ tag: 'sun-summary', before: before.vids[0].t, afterNight: after.vids[1].t, sunOff: after.sunOff });
  // and back
  await sleep(300); await page.click('#sun'); await record('sunback', 1600, 40);
  await sleep(700);   // let the retire fade finish before the next scenario
}
// ── rotate (shape swap) ────────────────────────────────────────────────────
if (want.has('rotate')) {
  await page.evaluate(() => { if (S.sunOff) setSun(false); vFilm.currentTime = 30; vFilm.play(); });
  await page.waitForFunction(() => !vFilm.seeking && vFilm.readyState >= 3); await sleep(400);
  await resetCounters();
  const before = await state();
  const p = page.setViewportSize({ width: VH, height: VW });   // turn the phone
  await record('rotate', 2500, 40); await p;
  const after = await state(); const c = await counters();
  timeline.push({ tag: 'rotate-summary', beforeShape: before.shape, beforeT: before.vids[0].t, afterShape: after.shape, afterT: after.vids[0].t, counters: c, after });
  const p2 = page.setViewportSize({ width: VW, height: VH });
  await record('rotateback', 2500, 40); await p2;
}
// ── fly-to (search) ───────────────────────────────────────────────────────
if (want.has('fly')) {
  await page.evaluate(() => { if (!S.sunOff) setSun(true); vNight.pause(); vNight.currentTime = 5; });
  await page.waitForFunction(() => !vNight.seeking && vNight.readyState >= 2); await sleep(300);
  await resetCounters();
  const target = await page.evaluate(() => { const e = S.seek.find(e => e.name === 'Vega'); return { t: e.t, name: e.name }; });
  const tA = performance.now();
  await page.evaluate(() => goTo(S.seek.find(e => e.name === 'Vega')));
  await record('fly', 2000, 40);
  const c = await counters(); const st = await state();
  timeline.push({ tag: 'fly-summary', target, arrivedT: st.vids[1].t, counters: c });
}
// ── the loop point ────────────────────────────────────────────────────────
if (want.has('loop')) {
  await page.evaluate(() => { if (S.sunOff) setSun(false); S.marked = null; });
  await sleep(1200);
  await page.evaluate(() => { vFilm.currentTime = S.film.loop_secs - 1.2; vFilm.play(); });
  await page.waitForFunction(() => !vFilm.seeking && vFilm.readyState >= 3);
  await record('loop', 2600, 40);
  await page.evaluate(() => { if (!S.sunOff) setSun(true); });
  await sleep(1200);
  await page.evaluate(() => { vNight.currentTime = S.night.loop_secs - 1.2; vNight.play(); });
  await page.waitForFunction(() => !vNight.seeking && vNight.readyState >= 3);
  await record('nloop', 2600, 40);
}
// ── free-look drag ────────────────────────────────────────────────────────
if (want.has('drag')) {
  await page.evaluate(() => { if (!S.sunOff) setSun(true); vNight.pause(); vNight.currentTime = 10; });
  await page.waitForFunction(() => !vNight.seeking && vNight.readyState >= 2); await sleep(300);
  await resetCounters();
  const cx = VW / 2, cy = VH / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  const t0d = performance.now();
  for (let i = 1; i <= 40; i++) { await page.mouse.move(cx - i * 4, cy + i * 2); await sleep(16); }
  await page.mouse.up();
  const dragMs = performance.now() - t0d;
  await sleep(600);
  const c = await counters(); const st = await state();
  timeline.push({ tag: 'drag-summary', dragMs: +dragMs.toFixed(0), counters: c, nightT: st.vids[1].t, look: st.look });
}
fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify(timeline, null, 1));
await browser.close(); server.kill(); fs.rmSync(srv, { recursive: true, force: true });
console.log('recorded', timeline.length, 'samples →', out);
