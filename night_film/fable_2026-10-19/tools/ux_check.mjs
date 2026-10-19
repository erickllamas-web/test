// Usability checks: the hint, the clock, a tap on a star, a tap on the Moon, the names
// layer, the day line, the constellation button, the dedication. Prints what the card says.
//   node ux_check.mjs <site_dir> <index.html> <out_dir> [viewport]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const [site, indexFile, out, vp = '375x667'] = process.argv.slice(2);
const [VW, VH] = vp.split('x').map(Number);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const srv = fs.mkdtempSync('/tmp/claude-0/-home-user-test/6d9528b0-6431-5225-87a4-8233b3d39536/scratchpad/work/srv-');
for (const f of fs.readdirSync(site)) fs.symlinkSync(path.join(site, f), path.join(srv, f));
fs.copyFileSync(indexFile, path.join(srv, 'index.html'));
const port = 8100 + Math.floor(Math.random() * 800);
const server = spawn('/opt/node22/bin/http-server', [srv, '-p', String(port), '-s', '-c-1'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = {};
await page.goto(`http://127.0.0.1:${port}/index.html`);
await page.waitForFunction(() => typeof S !== 'undefined' && S.film && S.seek && S.aim && S.bodies && vFilm.readyState >= 2, null, { timeout: 15000 });
await sleep(2200);
R.hintShown = await page.evaluate(() => !document.getElementById('hint').classList.contains('off'));
R.hintText = await page.evaluate(() => document.getElementById('hint').textContent);
R.dayLine = await page.evaluate(() => document.getElementById('day').textContent);
// the clock at a known frame of the film
await page.evaluate(() => { vFilm.pause(); vFilm.currentTime = 30; });
await page.waitForFunction(() => !vFilm.seeking); await sleep(300);
R.clockAt30 = await page.evaluate(() => ({ clk: document.getElementById('clk').textContent, now: document.getElementById('now').textContent,
  sample: S.film.sample[Math.round(30 * 30)], sun: S.film.sun_alt[Math.round(30 * 30)] }));
// tap Sirius in the night pass at its seek second
const tapAt = async (name) => page.evaluate((name) => {
  const e = S.seek.find(e => e.name === name);
  return new Promise(res => {
    if (!S.sunOff) setSun(true, e.t); else vNight.currentTime = e.t;
    vNight.pause();
    const go = () => {
      const c = camNow(), cb = cameraBasis(c.az, c.alt, c.fov);
      let az, alt;
      if (e.kind === 'star'){ const i = S.sky.hip.indexOf(+e.key); [az, alt] = radecToAltaz(S.sky.ra[i], S.sky.dec[i], c.lat, c.lst); }
      else { const b = bodiesAt(c.sample).find(b => b.name === name); az = b.az; alt = b.alt; }
      const p = projectDir(dirAltaz(az, alt), cb, S.Wn, S.Hn, true);
      const r = ov.getBoundingClientRect();
      res({ x: r.left + p[0] / S.Wn * r.width, y: r.top + p[1] / S.Hn * r.height, t: e.t, sample: c.sample, alt });
    };
    setTimeout(go, 900);
  });
}, name);
for (const name of ['Sirius', 'Moon', 'Jupiter', 'Vega']) {
  // a figure on screen owns the next tap, so clear the last one first
  await page.evaluate(() => { hideFigure(); S.marked = null; document.getElementById('info').classList.remove('on'); });
  await sleep(700);
  const p = await tapAt(name);
  await page.waitForFunction(() => !vNight.seeking); await sleep(200);
  await page.mouse.click(p.x, p.y);
  await sleep(400);
  const card = await page.evaluate(() => {
    const b = document.getElementById('info');
    return { on: b.classList.contains('on'), name: (b.querySelector('.n') || {}).textContent,
             kind: (b.querySelector('.d') || {}).textContent,
             says: [...b.querySelectorAll('.say')].map(p => p.textContent),
             btn: (b.querySelector('.lnk') || {}).textContent,
             details: [...b.querySelectorAll('dt')].map(d => d.textContent + ' ' + d.nextElementSibling.textContent) };
  });
  R['tap_' + name] = { at: p, card };
  await page.screenshot({ path: path.join(out, `card_${name}.png`) });
  // the constellation button on a star
  if (card.btn) { await page.click('#showcon'); await sleep(700); R['figure_' + name] = await page.evaluate(() => S.figure && S.figure.name); await page.screenshot({ path: path.join(out, `figure_${name}.png`) }); }
}
R.hintAfterTap = await page.evaluate(() => document.getElementById('hint').classList.contains('off'));
// names layer
await page.evaluate(() => { document.getElementById('info').classList.remove('on'); S.marked = null; hideFigure(); setNames(true); draw(); });
await sleep(500);
R.namesOn = await page.evaluate(() => S.names);
await page.screenshot({ path: path.join(out, 'names_night.png') });
await page.evaluate(() => { setSun(false); vFilm.currentTime = 40; vFilm.pause(); }); await sleep(1200);
await page.screenshot({ path: path.join(out, 'names_film.png') });
// day card
await page.click('#day'); await sleep(300);
R.dayCard = await page.evaluate(() => document.getElementById('info').textContent.replace(/\s+/g, ' ').trim().slice(0, 300));
await page.screenshot({ path: path.join(out, 'day_card.png') });
// dedication
R.dedHiddenWhenEmpty = await page.evaluate(() => getComputedStyle(document.getElementById('capDed')).display === 'none');
await page.evaluate(() => { document.getElementById('capDed').textContent = 'For Jane, who was born under this sky'; });
R.dedShown = await page.evaluate(() => getComputedStyle(document.getElementById('capDed')).display !== 'none');
await page.evaluate(() => { document.getElementById('info').classList.remove('on'); vFilm.currentTime = 2; }); await sleep(800);
await page.screenshot({ path: path.join(out, 'caption_dedication.png') });
R.errors = errors;
fs.writeFileSync(path.join(out, 'ux.json'), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await browser.close(); server.kill(); fs.rmSync(srv, { recursive: true, force: true });
