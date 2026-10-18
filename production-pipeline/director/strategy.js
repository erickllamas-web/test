#!/usr/bin/env node
// strategy.js — the strategy compiler: a strategy (story template) + a site's days → a shot file for shots.js.
//
//   node strategy.js compile STRATEGY[,STRATEGY…] --site stonehenge [--title T] [--out FILE] [--filmdir film_s] [--uploads uploads_s] [--outdir s_1080] [--work DIR]
//   node strategy.js doc FILE.shots.json               the compiled film as a table (acts, rungs, seconds, takes, styles, light)
//   node strategy.js strategies                        the strategies on file, with their beats
//
// The compiler never computes an instant: light spans are written as @moments (moments.json names with offsets) and
// shots.js lists solves them with the daemon and the skyline. Cameras are takes from cameras.json (camera.kind "take");
// a beat may override any take field. Styles come from directors.json and ride on the row. `the_proof` is expanded per
// claim; another strategy calls it as a beat ("strategy": "the_proof", "claim": "<id>"). Every take and moment name is
// checked against the libraries before anything is written.
"use strict";
const fs = require("fs"), path = require("path");
const [CMD, ...REST] = process.argv.slice(2);
if (!CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 11).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; };
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const H = __dirname, LANG = path.join(H, "..", "film-language"), load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const STRATS = Object.fromEntries(fs.readdirSync(path.join(H, "strategies")).filter(f => f.endsWith(".json")).map(f => { const s = load(path.join(H, "strategies", f)); return [s.id, s]; }));
const CAMS = load(path.join(H, "lib", "cameras.json")).takes, MOMENTS = load(path.join(H, "lib", "moments.json")).moments, DIRS = load(path.join(LANG, "directors.json")).directors;
const problems = [];
const checkMoment = (s, where) => { for (const m of String(s).matchAll(/@([a-z0-9_]+)/g)) if (!MOMENTS[m[1]]) problems.push(`${where}: no moment "${m[1]}" in moments.json`); return s; };
const checkTake = (t, where) => { if (!CAMS[t]) problems.push(`${where}: no take "${t}" in cameras.json`); return t; };
const checkStyle = (s, where) => { if (s && !DIRS[s]) problems.push(`${where}: no style "${s}" in directors.json`); return s; };
const off = (m, min) => `@${m}${min >= 0 ? "+" : "-"}${Math.abs(min)}m`;

function compile(names, SITE) {
  const shots = []; let lastAct = null, firstOfAct = false;
  const push = row => { if (row.act !== lastAct) { firstOfAct = true; lastAct = row.act; } else firstOfAct = false; if (firstOfAct && shots.length && !row.cut) row.cut = "dissolve"; shots.push(row); };
  const dayRow = (k, where) => { const d = SITE.days[k]; if (!d) problems.push(`${where}: no day "${k}" in ${SITE.site}.days.json`); return d || { day: [0, 1, 1], scene: "" }; };
  function proof(S, claimId, actOverride) {
    const C = S.claims.list.find(c => c.id === claimId); if (!C) { problems.push(`the_proof: no claim "${claimId}"`); return; }
    const D = dayRow(C.day, `claim ${C.id}`), line = SITE.lines[C.line.eye_bearing] || C.line, ids = C.ids || {}, act = actOverride || C.act, voice = C.voice || {};
    const base = slot => ({ act, scene: D.scene, ...(D.season_from ? { season_from: D.season_from } : {}), style: null, handles: S.defaults.handles });
    const idOf = slot => ids[slot] || `${C.id}_${slot}`;
    for (const B of S.beats) {
      const id = idOf(B.slot), r = { id, ...base(B.slot), rung: B.rung, seconds: B.seconds, style: checkStyle(B.style || S.defaults.style, id) }; if (B.handles === false) { r.handles = false; r.frames = B.seconds * 24; }
      const span = (C[`${B.slot}_span_min`] || B.span_min || [0, 0]);
      switch (B.slot) {
        case "overhead": r.camera = { kind: "take", take: checkTake(B.take, id) }; r.lens = CAMS[B.take].lens; r.light = { day: D.day, from: checkMoment(off(C.moment, span[0]), id), to: checkMoment(off(C.moment, span[1]), id) }; r.proves = C.proves; if (voice.overhead) r.voice = voice.overhead; break;
        case "contrast": r.contrast_of = idOf("overhead"); r.lens = 50; r.camera = { kind: "contrast", h: CAMS[B.take].height, sun_alt: B.sun_alt, when: C.contrast_when, each: B.each, days: [C.day, ...C.contrast_days].map(k => { const d = dayRow(k, id); return { day: d.day, season_from: d.season_from || null }; }) }; r.proves = `only this day's ${C.contrast_when} lies on the axis (same Sun height ${B.sun_alt}°)`; if (voice.contrast) r.voice = voice.contrast; break;
        case "on_the_line": r.camera = { kind: "take", take: checkTake(B.take, id), bearing: C.line.eye_bearing, dist: 60, height: 1.7, look: "dir", az: line.look_az, el: 0.6 }; r.lens = 12; r.light = { day: D.day, from: checkMoment(C.window[0], id), to: checkMoment(C.window[1], id) }; r.claim = { in_frame: true, ...(C.bearing_window ? { bearing: C.bearing_window } : {}) }; r.proves = C.proves; r.voice = voice.on_the_line || S.voice.line.replace("{proves}", C.proves);
          if (C.match_of) { const other = S.claims.list.find(c => c.id === C.match_of); r.cut = `match:${(other && other.ids && other.ids.on_the_line) || `${C.match_of}_on_the_line`}`; } break;
        case "push": r.camera = { kind: "take", take: checkTake(B.take, id), bearing: C.line.eye_bearing, dist: [80, 55], height: 1.7, look: "dir", az: line.look_az, el: 0.6, hold: C.match_of ? 1 : 0 }; r.lens = 12; r.light = { day: D.day, from: checkMoment(off(C.moment, span[0]), id), to: checkMoment(off(C.moment, span[1]), id) }; r.claim = { in_frame: true, ...(C.bearing_window ? { bearing: C.bearing_window } : {}) }; break;
        case "window": { const W = C.window_camera || {}; r.camera = { kind: "take", take: checkTake(B.take, id), ...W.camera }; r.lens = W.lens || CAMS[B.take].lens; r.light = { day: D.day, from: checkMoment(C.window[0], id), to: checkMoment(C.window[1], id) }; r.claim = { in_frame: true }; r.proves = C.proves; if (voice.window) r.voice = voice.window; break; }
        case "release": r.camera = { kind: "take", take: checkTake(B.take, id), bearing: C.line.eye_bearing }; r.lens = CAMS[B.take].lens; r.light = { day: D.day, held: checkMoment(`@${C.moment}`, id) }; break;
        default: problems.push(`the_proof: unknown slot ${B.slot}`);
      }
      push(r);
    }
  }
  function direct(S, B) {
    const id = `${S.id}_${B.slot}`, D = dayRow(B.day || S.day, id), r = { id, act: B.act || "", rung: B.rung, seconds: B.seconds, handles: B.handles ?? S.defaults.handles, style: checkStyle(B.style || S.defaults.style, id), scene: D.scene, ...(D.season_from ? { season_from: D.season_from } : {}) };
    if (B.handles === false) r.frames = B.seconds * 24;
    r.camera = { kind: "take", take: checkTake(B.take, id), ...(B.camera || {}) }; if (B.lens) r.lens = B.lens;
    const L = { day: D.day }; for (const k of ["from", "to", "held"]) if (B.light && B.light[k]) L[k] = checkMoment(B.light[k], id); if (B.light && B.light.kind) L.kind = B.light.kind; r.light = L;
    if (B.world) r.world = { ...(D.world || {}), ...B.world }; else if (D.world) r.world = D.world;
    if (B.cut) r.cut = B.cut; if (B.voice) r.voice = B.voice; if (B.proves) r.proves = B.proves; if (B.claim_in_frame) r.claim = { in_frame: true };
    push(r);
  }
  for (const name of names) { const S = STRATS[name]; if (!S) { problems.push(`no strategy ${name}`); continue; }
    if (S.claims && !S.beats.some(b => b.strategy)) { for (const C of S.claims.list) proof(S, C.id); continue; }
    for (const B of S.beats) B.strategy ? proof(STRATS[B.strategy], B.claim, B.act) : direct(S, B); }
  return shots;
}
const cmd = {
  strategies() { for (const [k, s] of Object.entries(STRATS)) { console.log(`\n${k}: ${s.about}\n`); for (const b of s.beats) console.log(`  ${(b.slot || "").padEnd(14)} ${b.strategy ? `→ ${b.strategy}(${b.claim})` : `${(b.rung || "").padEnd(7)} ${String(b.seconds || "").padStart(3)} s  ${b.take || ""}  ${b.style || s.defaults.style}`}`); if (s.claims) for (const c of s.claims.list) console.log(`  claim ${c.id}: ${c.day}, moment ${c.moment}, line ${c.line.eye_bearing}${c.match_of ? ", match of " + c.match_of : ""}`); } },
  compile() {
    const names = ARGS[0].split(","), site = opt("site", "stonehenge"), SITE = load(path.join(H, "sites", `${site}.days.json`)), title = opt("title", names.map(n => n.toUpperCase()).join("_") + "_" + site.toUpperCase());
    const shots = compile(names, SITE);
    if (problems.length) { console.error("not written — fix these first:\n  " + [...new Set(problems)].join("\n  ")); process.exit(1); }
    const film = { title, site, work: opt("work", `/home/erick/agents/a-production/films/${title}`), film: { filmdir: opt("filmdir", `film_${names[0]}`), out: opt("outdir", `${names[0]}_1080`), uploads: opt("uploads", `uploads_${names[0]}`) }, note: `compiled by strategy.js from ${names.join(" + ")} for ${site} on ${new Date().toISOString().slice(0, 10)}; light as @moments (shots.js lists solves them); takes from cameras.json; styles from directors.json`, strategies: names, shots };
    const out = opt("out", path.join(H, "out", `${title}.shots.json`)); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(film, null, 1));
    const total = shots.reduce((a, s) => a + s.seconds, 0); console.log(`${out}: ${shots.length} shots, ${Math.floor(total / 60)} min ${total % 60} s, ${[...new Set(shots.map(s => s.act))].length} acts`); cmd.doc(out);
  },
  doc(file) { const F = load(file || ARGS[0]); let t = 0, o = `| # | act | rung | id | s | take / camera | lens | style | light | cut |\n|---|---|---|---|---|---|---|---|---|---|\n`;
    F.shots.forEach((s, i) => { const c = s.camera, L = s.light || {}; o += `| ${i + 1} | ${s.act} | ${s.rung} | ${s.id}${s.contrast_of ? " (contrast)" : ""} | ${s.seconds} | ${c.take || c.kind}${c.dist !== undefined ? ` d${Array.isArray(c.dist) ? c.dist.join("→") : c.dist}` : ""}${c.az !== undefined ? ` az${c.az}` : ""} | ${s.lens || ""} | ${s.style || ""} | ${L.held ? "held " + L.held : L.from ? `${L.from} → ${L.to}` : ""} | ${s.cut || "cut"} |\n`; t += s.seconds; });
    o += `\nRunning time ≈ ${Math.floor(t / 60)} min ${t % 60} s.\n`; console.log(o); if (file) fs.writeFileSync(file.replace(/\.shots\.json$/, "_script.md"), `# ${F.title} — compiled from ${(F.strategies || []).join(" + ")}\n\n` + o); },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
