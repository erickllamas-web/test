#!/usr/bin/env node
// edit.js — the edit as data (film-language/editing.json). Zero dependencies beyond node, ffmpeg and ffprobe.
//
//   node edit.js FILM.json metrics   --clips DIR [--work DIR]        per-clip luma and motion per frame (cached)
//   node edit.js FILM.json edl       --clips DIR [--work DIR]        choose in/out frames by rule, transitions by context -> <work>/<title>_edl.json (+ voice .srt)
//   node edit.js FILM.json render    [--edl FILE] [--out FILE]       the cut, with ffmpeg (cuts, dissolves, fades, dips)
//   node edit.js FILM.json check     [--edl FILE] [--cut FILE] [--lists DIR]   check_edit: every test of editing.json -> <work>/<title>_check_edit.md (exit 1 on FAIL)
//   node edit.js FILM.json compare N [--edl FILE]                    the cut into event N two ways, side by side -> <work>/compare_N.mp4 + .png
//   node edit.js FILM.json otio      [--edl FILE]                    OpenTimelineIO JSON of the cut (open in Resolve to look)
//   node edit.js FILM.json chapters  [--edl FILE]                    YouTube chapter lines from the acts
//   node edit.js FILM.json qc        --clips DIR                     per-clip quality tests (exposure continuity T4, black frames)
//   node edit.js FILM.json dailies   --clips DIR [--edl FILE]        one HTML page per clip: video, three stills, metrics, its check rows
//
// The shot file is the same schema as shots.js's (films/stonehenge/stonehenge.shots.json). Clips are found as
// <clips>/<id>.mp4, else camera.path (clip rows), else missing (black in the cut, named in the check).
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync, spawnSync } = require("child_process");
const [FILE, CMD, ...REST] = process.argv.slice(2);
if (!FILE || !CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 15).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; };
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const F = JSON.parse(fs.readFileSync(FILE, "utf8")), FPS = (F.film && F.film.fps) || 24, HAND = 24, TOL = 12;
const LANG = path.join(__dirname, "..", "film-language");
const ED = JSON.parse(fs.readFileSync(path.join(LANG, "editing.json"), "utf8"));
const DIRS = JSON.parse(fs.readFileSync(path.join(LANG, "directors.json"), "utf8")).directors;
const WORK = path.resolve(opt("work", F.work || path.join(path.dirname(path.resolve(FILE)), "..", "work", F.title)));
const CLIPS = opt("clips", null); fs.mkdirSync(WORK, { recursive: true });
const FF = process.env.FFMPEG || "ffmpeg", FP = process.env.FFPROBE || "ffprobe";
const SHOTS = F.shots, byId = Object.fromEntries(SHOTS.map(s => [s.id, s]));
const hms = t => { const [h, m, s] = String(t).split(":").map(Number); return h * 3600 + m * 60 + (s || 0); };
const ts = x => { x = Math.max(0, x); const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")},${String(Math.round((s % 1) * 1000)).padStart(3, "0")}`; };
const sh = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")}\n${r.stderr}`); return r.stdout; };
const esc = p => p.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/,/g, "\\,").replace(/'/g, "\\'");

// ---- clips and metrics -------------------------------------------------------------------------------------------
function clipOf(s) {
  if (CLIPS && fs.existsSync(path.join(CLIPS, s.id + ".mp4"))) return path.resolve(CLIPS, s.id + ".mp4");
  if (s.camera.kind === "clip") { const p = s.camera.path; for (const c of [p, CLIPS && path.join(CLIPS, p), path.join(path.dirname(FILE), p)]) if (c && fs.existsSync(c)) return path.resolve(c); }
  return null;
}
function nframes(clip) { return +sh(FP, ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", clip]).trim(); }
function series(clip, filter) {   // one number per frame from signalstats YAVG after `filter`
  const out = sh(FP, ["-v", "error", "-f", "lavfi", "-i", `movie=${esc(clip)}${filter ? "," + filter : ""},signalstats`, "-show_entries", "frame_tags=lavfi.signalstats.YAVG", "-of", "csv=p=0"]);
  return out.trim().split("\n").map(l => +l.replace(/,$/, "")).filter(v => !isNaN(v));
}
function metrics(s) {
  const clip = clipOf(s); if (!clip) return null;
  const dir = path.join(WORK, "metrics"); fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, s.id + ".json"), st = fs.statSync(clip);
  if (fs.existsSync(f)) { const m = JSON.parse(fs.readFileSync(f, "utf8")); if (m.mtime === st.mtimeMs && m.size === st.size) return m; }
  const luma = series(clip), motion = series(clip, "tblend=all_mode=difference"); motion[0] = motion[1] || 0;
  const m = { id: s.id, clip, mtime: st.mtimeMs, size: st.size, n: luma.length, luma, motion }; fs.writeFileSync(f, JSON.stringify(m)); return m;
}
const median = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };

// ---- the shot's own geometry (no daemon needed) --------------------------------------------------------------------
const styleOf = s => (s.style && DIRS[s.style]) || null;
const renders = s => !["clip", "black"].includes(s.camera.kind);
function handles(s) { return s.handles !== false && renders(s) ? HAND : 0; }
function instantFrame(s, n) {   // the key instant's frame index in the clip: the light span maps linearly onto the frames (shots.js lines())
  if (!s.key_instant || !s.light || !s.light.from || !s.light.to) return null;
  const a = hms(s.light.from), b = hms(s.light.to), t = hms(s.key_instant); if (b === a) return null;
  return Math.round((t - a) / (b - a) * (n - 1));
}
function lookAz(s) {   // the camera's look bearing, where the row gives one
  const c = s.camera; if (c.az !== undefined) return +c.az; if (c.kind === "top" || c.kind === "contrast") return null;
  return null;
}
function axisSide(s) {   // which side of the monument's axis the eye stands on: "sw" / "ne" / null (on it, or unknown)
  const c = s.camera; if (c.kind === "axis") return c.d0 < 0 ? "sw" : c.d0 > 0 ? "ne" : null;
  if (c.kind === "line") return null; return null;
}
const bandOfRung = { wide: ["medium", "long", "very_long"], medium: ["medium", "long"], close: ["insert", "medium", "long"], hold: ["insert", "medium"], insert: ["insert"] };
const bands = { insert: [3, 6], medium: [8, 15], long: [16, 30], very_long: [30, 1e9] };
const bandOf = sec => Object.entries(bands).find(([k, [a, b]]) => sec >= a && sec <= b)?.[0] || (sec < 3 ? "under" : "very_long");
const dayOf = s => s.light && s.light.day ? s.light.day.join("-") : (s.contrast_of && byId[s.contrast_of] && dayOf(byId[s.contrast_of])) || null;
const words = t => (t || "").trim().split(/\s+/).filter(Boolean).length;
const voiceSec = t => words(t) / 2.5;   // 150 words a minute: an estimate until the voice is synthesised

// ---- edl ---------------------------------------------------------------------------------------------------------
function chooseFrames(s, m) {
  const n = m ? m.n : (s.frames || s.seconds * FPS + 2 * handles(s)), L = s.seconds * FPS, H = handles(s);
  const motion = m ? m.motion : new Array(n).fill(0);
  let inW, outW;
  if (s.camera.kind === "clip") { const i0 = Math.round((s.in || 0) * FPS); inW = [Math.max(0, i0 - TOL), Math.min(n - L, i0 + TOL)]; outW = null; }
  else if (!H) { return { in: 0, out: n, rule: "fixed (no handles)" }; }
  else { inW = [0, H]; outW = [n - H, n]; }
  const kf = instantFrame(s, n), rule = s.cut_rule || {}, st = styleOf(s);
  const inRule = rule.in || (s.cut && String(s.cut).startsWith("match") ? "match" : st && st.shot.cut_in === "cut_on_motion" ? "on_motion" : "on_stillness");
  const outRule = rule.out || (kf !== null ? "after_instant" : inRule === "on_motion" ? "on_motion" : "on_stillness");
  const cost = (r, i) => r === "on_motion" ? -motion[Math.min(n - 1, Math.max(0, i))] : motion[Math.min(n - 1, Math.max(0, i))];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const outAll = outW || [inW[0] + L - TOL, Math.min(n, inW[1] + L + TOL)];
  const tgtOut = kf !== null ? clamp(kf + 2 * FPS, outAll[0], outAll[1]) : null, tgtIn = kf !== null ? clamp(kf, inW[0], inW[1]) : null;
  let best = null, feasIn = [Infinity, -Infinity], feasOut = [Infinity, -Infinity];
  for (let i = inW[0]; i <= inW[1]; i++) {
    const outs = outW ? [outW[0], outW[1]] : [i + L - TOL, i + L + TOL];
    for (let o = Math.max(outs[0], i + L - TOL); o <= Math.min(outs[1], i + L + TOL, n); o++) {
      feasIn = [Math.min(feasIn[0], i), Math.max(feasIn[1], i)]; feasOut = [Math.min(feasOut[0], o), Math.max(feasOut[1], o)];
      let c = cost(inRule, i) + cost(outRule, o - 1) + Math.abs((o - i) - L) * 1e-3;   // ties go to the written length
      if (outRule === "after_instant" && tgtOut !== null) c += Math.abs(o - tgtOut) * 0.05;     // breathe 2 s after the instant (inside the window)
      if (inRule === "to_instant" && tgtIn !== null) c += Math.abs(i - tgtIn) * 0.05;
      if (!best || c < best.c) best = { c, in: i, out: o };
    }
  }
  if (!best) best = { in: inW[0], out: Math.min(n, inW[0] + L) };
  return { in: best.in, out: best.out, rule: `in:${inRule} out:${outRule}`, in_window: feasIn, out_window: feasOut };
}
function transitionFor(s, prev) {
  const c = String(s.cut || "cut");
  if (!prev) return { type: "fade_from_black", s: (F.film && F.film.fade_in_s) || 2 };
  if (c.startsWith("match")) return { type: "match_cut", s: 0, pair: c.split(":")[1] };
  if (c === "dissolve") { const long = dayOf(s) !== dayOf(prev) && s.act !== prev.act; return { type: "dissolve", s: long ? ED.transitions.dissolve.duration_s.long : ED.transitions.dissolve.duration_s.short }; }
  if (c === "dip") return { type: "dip_to_black", s: ED.transitions.dip_to_black.duration_s.black, fades: ED.transitions.dip_to_black.duration_s.fades };
  // by context (editing.json: dissolve when time has passed): a day change with no cut written on the row dissolves
  if (!s.cut && dayOf(s) && dayOf(prev) && dayOf(s) !== dayOf(prev)) return { type: "dissolve", s: s.act !== prev.act ? ED.transitions.dissolve.duration_s.long : ED.transitions.dissolve.duration_s.short, by: "context: day changes" };
  return { type: "cut", s: 0 };
}
function buildEdl() {
  const ev = []; let t = 0, prev = null;
  SHOTS.forEach((s, k) => {
    const clip = clipOf(s), m = clip ? metrics(s) : null, fr = chooseFrames(s, m), tr = transitionFor(s, prev);
    const n = fr.out - fr.in; t -= tr.type === "dissolve" ? tr.s : 0; if (tr.type === "dip_to_black") t += tr.s;
    const kf = m ? instantFrame(s, m.n) : null, kts = kf !== null && kf >= fr.in && kf < fr.out ? t + (kf - fr.in) / FPS : null;
    const e = { n: k + 1, shot_id: s.id, act: s.act, rung: s.rung, style: s.style || null, clip, missing: !clip, in_frame: fr.in, out_frame: fr.out, frames: n, seconds: +(n / FPS).toFixed(3), cut_rule: fr.rule, in_window: fr.in_window || null, out_window: fr.out_window || null, transition_in: tr.type, transition_s: tr.s, transition_by: tr.by || "row", pair: tr.pair || null, start_s: +t.toFixed(3), key_instant_s: kts !== null ? +kts.toFixed(3) : null,
      sound: s.voice ? { voice_start_s: +(t - ED.transitions.j_cut.lead_s).toFixed(3), voice_est_s: +voiceSec(s.voice).toFixed(1), voice: s.voice } : null };
    ev.push(e); t += n / FPS; prev = s;
  });
  const edl = { film: F.title, fps: FPS, made: new Date().toISOString(), fade_out_s: (F.film && F.film.fade_out_s) || 3, runtime_s: +t.toFixed(3), events: ev };
  const f = path.join(WORK, `${F.title}_edl.json`); fs.writeFileSync(f, JSON.stringify(edl, null, 1));
  let srt = "", k = 1; for (const e of ev) if (e.sound) srt += `${k++}\n${ts(e.sound.voice_start_s)} --> ${ts(e.sound.voice_start_s + e.sound.voice_est_s)}\n${e.sound.voice}\n\n`;
  fs.writeFileSync(path.join(WORK, `${F.title}_voice.srt`), srt);
  console.log(`edl ${f}: ${ev.length} events, ${edl.runtime_s} s` + (ev.some(e => e.missing) ? `; missing clips: ${ev.filter(e => e.missing).map(e => e.shot_id).join(" ")}` : ""));
  for (const e of ev) console.log(`  ${String(e.n).padStart(2)} ${e.shot_id.padEnd(16)} ${e.transition_in.padEnd(15)} in ${String(e.in_frame).padStart(3)} out ${String(e.out_frame).padStart(3)} (${e.seconds}s) ${e.cut_rule}${e.key_instant_s !== null ? `  instant@${e.key_instant_s}s` : ""}`);
  return edl;
}
const loadEdl = () => JSON.parse(fs.readFileSync(opt("edl", path.join(WORK, `${F.title}_edl.json`)), "utf8"));

// ---- render ------------------------------------------------------------------------------------------------------
function renderCut(edl, out, range) {   // range: optional [firstEvent, lastEvent] (1-based) for compare clips
  const ev = range ? edl.events.filter(e => e.n >= range[0] && e.n <= range[1]) : edl.events;
  const ins = [], segs = [], fc = [];
  ev.forEach((e, i) => {
    const d = e.frames / FPS;
    // every segment on one timebase (settb), or xfade refuses the concat output's 1/1000000 against a clip's 1/24
    if (e.missing) { ins.push("-f", "lavfi", "-t", d.toFixed(3), "-i", `color=c=black:s=1920x1080:r=${FPS}`); fc.push(`[${i}:v]format=yuv420p,settb=AVTB[v${i}]`); }
    else { ins.push("-i", e.clip); fc.push(`[${i}:v]trim=start_frame=${e.in_frame}:end_frame=${e.out_frame},setpts=PTS-STARTPTS,fps=${FPS},scale=1920:1080,setsar=1,format=yuv420p,settb=AVTB[v${i}]`); }
    segs.push({ i, d, e });
  });
  // fades and dips are filters on the segments; dissolves are xfades between them
  const first = segs[0], last = segs[segs.length - 1];
  const fi = !range && first.e.transition_in === "fade_from_black" ? first.e.transition_s : 0, fo = !range ? edl.fade_out_s : 0;
  let cur = null, curLen = 0, parts = [];
  segs.forEach((sg, k) => {
    let lab = `v${sg.i}`, pre = [];
    if (k === 0 && fi) pre.push(`fade=t=in:st=0:d=${fi}`);
    if (k === segs.length - 1 && fo) pre.push(`fade=t=out:st=${(sg.d - fo).toFixed(3)}:d=${fo}`);
    if (k > 0 && sg.e.transition_in === "dip_to_black") { pre.push(`fade=t=in:st=0:d=${sg.e.transition_s ? 1 : 1}`); }
    if (k < segs.length - 1 && segs[k + 1].e.transition_in === "dip_to_black") pre.push(`fade=t=out:st=${(sg.d - 1).toFixed(3)}:d=1`);
    if (pre.length) { fc.push(`[${lab}]${pre.join(",")}[f${sg.i}]`); lab = `f${sg.i}`; }
    if (cur === null) { cur = lab; curLen = sg.d; return; }
    const o = `j${k}`;
    if (sg.e.transition_in === "dissolve") { fc.push(`[${cur}][${lab}]xfade=transition=fade:duration=${sg.e.transition_s}:offset=${(curLen - sg.e.transition_s).toFixed(3)}[${o}]`); curLen += sg.d - sg.e.transition_s; }
    else if (sg.e.transition_in === "dip_to_black") { const b = sg.e.transition_s || 0.75; ins.push("-f", "lavfi", "-t", b.toFixed(3), "-i", `color=c=black:s=1920x1080:r=${FPS}`); const bi = ins.filter(x => x === "-i").length - 1; fc.push(`[${bi}:v]format=yuv420p,settb=AVTB[b${k}]`); fc.push(`[${cur}][b${k}][${lab}]concat=n=3:v=1:a=0[${o}]`); curLen += b + sg.d; }
    else { fc.push(`[${cur}][${lab}]concat=n=2:v=1:a=0[${o}]`); curLen += sg.d; }
    cur = o;
  });
  const args = ["-loglevel", "error", "-y", ...ins, "-filter_complex", fc.join(";"), "-map", `[${cur}]`, "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), out];
  sh(FF, args); return curLen;
}

// ---- check_edit --------------------------------------------------------------------------------------------------
function checkEdit(edl, cut) {
  const rows = [], bad = [], warn = [];
  const add = (test, where, ok, detail, kind = "FAIL") => { rows.push([test, where, ok ? "ok" : kind, detail]); if (!ok) (kind === "FAIL" ? bad : warn).push(`${test} @ ${where}`); };
  const ev = edl.events, M = Object.fromEntries(ev.map(e => [e.shot_id, e.missing ? null : metrics(byId[e.shot_id])]));
  const subj = {}; const LISTS = opt("lists", null);   // body position per frame from frames.tsv when a lists folder is given
  if (LISTS) for (const e of ev) { const f = path.join(LISTS, e.shot_id, "frames.tsv"); if (!fs.existsSync(f)) continue; const s = byId[e.shot_id], vf = s.lens || 50, deg = 180 / Math.PI, hf = 2 * Math.atan(Math.tan(vf / 2 / deg) * 16 / 9) * deg;
    subj[e.shot_id] = fs.readFileSync(f, "utf8").trim().split("\n").map(l => { const c = l.split("\t"), az = +c[3], alt = +c[4], ey = c.slice(8, 11).map(Number), lk = c.slice(11, 14).map(Number), d = [lk[0] - ey[0], lk[1] - ey[1], lk[2] - ey[2]];
      const yaw = Math.atan2(d[0], d[2]) * deg, pitch = Math.atan2(d[1], Math.hypot(d[0], d[2])) * deg, dy = ((az - yaw + 540) % 360) - 180, dp = alt - pitch; return [0.5 + dy / hf, 0.5 - dp / vf]; }); }
  for (let k = 0; k < ev.length; k++) {
    const e = ev[k], s = byId[e.shot_id], p = k ? ev[k - 1] : null, ps = p ? byId[p.shot_id] : null, m = M[e.shot_id], pm = p ? M[p.shot_id] : null, at = `${p ? p.shot_id + " → " : ""}${e.shot_id}`;
    // motion_at_cut: the chosen frames should sit at or below the handle's median motion when the rule is on_stillness
    // the chosen frame must sit at or below the median motion of the frames the chooser could pick (its feasible window)
    if (m && /in:on_stillness/.test(e.cut_rule) && handles(s)) { const w = e.in_window || [0, HAND], h = m.motion.slice(w[0], w[1] + 1), v = m.motion[e.in_frame]; add("motion_at_cut", `${e.shot_id} in f${e.in_frame}`, v <= median(h) * 1.02 + 1e-6, `motion ${v.toFixed(3)} vs window f${w[0]}–${w[1]} median ${median(h).toFixed(3)}`); }
    if (m && /out:on_stillness/.test(e.cut_rule) && handles(s)) { const w = e.out_window || [m.n - HAND, m.n], h = m.motion.slice(w[0] - 1, w[1]), v = m.motion[e.out_frame - 1]; add("motion_at_cut", `${e.shot_id} out f${e.out_frame}`, v <= median(h) * 1.02 + 1e-6, `motion ${v.toFixed(3)} vs window f${w[0]}–${w[1]} median ${median(h).toFixed(3)}`); }
    if (p) {
      // luma_jump_at_cut
      if (m && pm && e.transition_in !== "dissolve" && e.transition_in !== "dip_to_black") { const dj = Math.abs(m.luma[e.in_frame] - pm.luma[p.out_frame - 1]); add("luma_jump_at_cut", at, dj <= 40, `Δ mean luma ${dj.toFixed(1)} (limit 40)`, s.style === "leone" ? "WARN" : "FAIL"); }
      // eye_trace
      if (subj[p.shot_id] && subj[e.shot_id]) { const a = subj[p.shot_id][p.out_frame - 1], b = subj[e.shot_id][e.in_frame], d = Math.hypot(a[0] - b[0], a[1] - b[1]); add("eye_trace", at, d <= 0.15 || s.style === "leone", `subject moved ${(d * 100).toFixed(0)} % of frame`); }
      else if (s.claim && s.claim.in_frame && ps && ps.claim && ps.claim.in_frame) rows.push(["eye_trace", at, "n/a", "needs the frame lists (--lists DIR)"]);
      // line (180°): same act, both on a side, sides differ, no crossing declared
      const sa = axisSide(ps), sb = axisSide(s); if (sa && sb && s.act === p.act) add("line", at, sa === sb || s.line === "crossing", `${sa} → ${sb}${s.line === "crossing" ? " (crossing declared)" : ""}`);
      // thirty_degrees: adjacent shots that both look along a bearing
      const aa = lookAz(ps), ab = lookAz(s); if (aa !== null && ab !== null && e.transition_in !== "match_cut") { const da = Math.abs(((ab - aa + 540) % 360) - 180), lr = Math.max(s.lens || 50, ps.lens || 50) / Math.min(s.lens || 50, ps.lens || 50); add("thirty_degrees", at, da >= 30 || lr >= 1.5, `Δbearing ${da.toFixed(1)}°, lens ratio ${lr.toFixed(2)}`); }
      // no_two_wides
      add("no_two_wides", at, !(s.rung === "wide" && ps.rung === "wide"), `${ps.rung} → ${s.rung}`);
      // dissolve_context
      if (e.transition_in === "dissolve") add("dissolve_context", at, s.act !== p.act || (dayOf(s) && dayOf(ps) && dayOf(s) !== dayOf(ps)), `act ${p.act === s.act ? "same" : "changes"}, day ${dayOf(s) === dayOf(ps) ? "same" : "changes"}`);
      // match_pair
      if (e.transition_in === "match_cut") { const q = byId[e.pair]; let ok = q && q.lens === s.lens, det = q ? `lens ${q.lens}° vs ${s.lens}°` : `pair ${e.pair} not in the film`;
        if (ok && subj[e.pair] && subj[e.shot_id]) { const qe = ev.find(x => x.shot_id === e.pair), a = subj[e.pair][qe.out_frame - 1], b = subj[e.shot_id][e.in_frame], d = Math.hypot(a[0] - b[0], a[1] - b[1]); ok = d <= 0.05; det += `, subject moved ${(d * 100).toFixed(0)} %`; } else if (ok) det += ", subject position needs the frame lists";
        add("match_pair", at, ok, det); }
    }
    // rhythm: length inside the rung's band
    const band = bandOf(e.seconds), allowed = bandOfRung[s.rung] || Object.keys(bands); add("rhythm", e.shot_id, allowed.includes(band), `${e.seconds} s is "${band}"; ${s.rung} allows ${allowed.join("/")}`);
    // breath_after_instant, voice_silent_at_instant, voice_leads
    if (e.key_instant_s !== null) { const end = e.start_s + e.seconds; add("breath_after_instant", e.shot_id, end - e.key_instant_s >= 2, `${(end - e.key_instant_s).toFixed(1)} s after the instant (min 2)`);
      for (const x of ev) if (x.sound) { const v0 = x.sound.voice_start_s, v1 = v0 + x.sound.voice_est_s; if (v0 < e.key_instant_s + 1 && v1 > e.key_instant_s - 1) add("voice_silent_at_instant", `${x.shot_id}'s line over ${e.shot_id}'s instant`, false, `voice ${v0.toFixed(1)}–${v1.toFixed(1)} s (estimated at 150 wpm), instant ${e.key_instant_s.toFixed(1)} s`); } }
    if (e.sound) add("voice_leads", e.shot_id, e.start_s - e.sound.voice_start_s >= 0.3 && e.start_s - e.sound.voice_start_s <= 1, `leads by ${(e.start_s - e.sound.voice_start_s).toFixed(2)} s`);
    if (e.sound && e.sound.voice_est_s > e.seconds - 1) add("voice_fits", e.shot_id, false, `line needs ~${e.sound.voice_est_s} s, shot is ${e.seconds} s`, "WARN");
    if (e.missing) add("black", e.shot_id, false, "clip missing: black in the cut");
  }
  // rhythm per act: a long hold wants an insert (breathing)
  const acts = [...new Set(ev.map(e => e.act))]; for (const a of acts) { const L = ev.filter(e => e.act === a); const longs = L.filter(e => e.seconds >= 16).length, inserts = L.filter(e => e.seconds <= 6).length; if (longs) add("rhythm", `act ${a}`, inserts >= 1, `${longs} long hold(s), ${inserts} insert(s)`); }
  // runtime
  if (F.film && F.film.target_seconds) add("runtime", "film", Math.abs(edl.runtime_s - F.film.target_seconds) <= 0.1 * F.film.target_seconds, `${edl.runtime_s} s vs target ${F.film.target_seconds} (±10 %)`);
  // black frames in the rendered cut, outside declared fades and dips
  if (cut && fs.existsSync(cut)) { const r = spawnSync(FF, ["-hide_banner", "-i", cut, "-vf", "blackdetect=d=0.2:pix_th=0.05", "-an", "-f", "null", "-"], { encoding: "utf8" }); const found = [...(r.stderr || "").matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map(x => [+x[1], +x[2]]);
    const fi = ev[0].transition_in === "fade_from_black" ? ev[0].transition_s : 0, declared = x => x[1] <= fi + 0.3 || x[0] >= edl.runtime_s - edl.fade_out_s - 0.3 || ev.some(e => e.transition_in === "dip_to_black" && Math.abs(x[0] - e.start_s + e.transition_s) < 1.5);
    const stray = found.filter(x => !declared(x)); add("black", "cut", stray.length === 0, stray.length ? `black at ${stray.map(x => x[0].toFixed(1) + "–" + x[1].toFixed(1)).join(", ")} s` : `${found.length} black span(s), all declared`); }
  let md = `# check_edit — ${F.title}\n\nEDL ${path.relative(process.cwd(), opt("edl", path.join(WORK, `${F.title}_edl.json`)))}, ${ev.length} events, ${edl.runtime_s} s.\n\n| test | where | verdict | detail |\n|---|---|---|---|\n`;
  for (const r of rows) md += `| ${r.join(" | ")} |\n`;
  md += `\n${bad.length ? "FAIL: " + bad.join("; ") : "All tests pass."}${warn.length ? "\nWARN: " + warn.join("; ") : ""}\n`;
  const f = path.join(WORK, `${F.title}_check_edit.md`); fs.writeFileSync(f, md); console.log(md); if (bad.length) process.exitCode = 1;
}

// ---- compare: the cut into event N two ways ------------------------------------------------------------------------
function compare(edl, n) {
  const k = edl.events.findIndex(e => e.n === +n); if (k < 1) throw new Error("compare needs an event number ≥ 2");
  const A = JSON.parse(JSON.stringify(edl)), B = JSON.parse(JSON.stringify(edl)), e = B.events[k], p = B.events[k - 1], s = byId[e.shot_id], ps = byId[p.shot_id];
  // B: the plain alternative — handle edges instead of chosen frames, and cut instead of dissolve (or the reverse)
  if (handles(ps)) p.out_frame = metrics(ps).n - HAND; if (handles(s)) e.in_frame = HAND; e.transition_in = e.transition_in === "dissolve" ? "cut" : e.transition_in === "cut" ? "dissolve" : e.transition_in; e.transition_s = e.transition_in === "dissolve" ? 1 : 0;
  p.frames = p.out_frame - p.in_frame; e.frames = e.out_frame - e.in_frame;
  const win = 2 * FPS, cutA = JSON.parse(JSON.stringify(A)), cutB = JSON.parse(JSON.stringify(B));
  for (const C of [cutA, cutB]) { const pp = C.events[k - 1], ee = C.events[k]; pp.in_frame = Math.max(pp.in_frame, pp.out_frame - win); pp.frames = pp.out_frame - pp.in_frame; ee.out_frame = Math.min(ee.out_frame, ee.in_frame + win); ee.frames = ee.out_frame - ee.in_frame; }
  const a = path.join(WORK, `compare_${n}_A.mp4`), b = path.join(WORK, `compare_${n}_B.mp4`), out = path.join(WORK, `compare_${n}.mp4`), png = path.join(WORK, `compare_${n}.png`);
  renderCut(cutA, a, [p.n, e.n]); renderCut(cutB, b, [p.n, e.n]);
  sh(FF, ["-loglevel", "error", "-y", "-i", a, "-i", b, "-filter_complex", "[0:v]scale=960:540[l];[1:v]scale=960:540[r];[l][r]hstack=inputs=2", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", out]);
  // the sheet: out frame | in frame, A over B
  const grab = (clip, fr, o) => sh(FF, ["-loglevel", "error", "-y", "-i", clip, "-vf", `select=eq(n\\,${fr}),scale=480:270`, "-frames:v", "1", o]);
  const t = [["A_out", p.clip, A.events[k - 1].out_frame - 1], ["A_in", e.clip, A.events[k].in_frame], ["B_out", p.clip, B.events[k - 1].out_frame - 1], ["B_in", e.clip, B.events[k].in_frame]].map(([nm, c, fr]) => { const o = path.join(WORK, `compare_${n}_${nm}.png`); grab(c, fr, o); return o; });
  sh(FF, ["-loglevel", "error", "-y", "-i", t[0], "-i", t[1], "-i", t[2], "-i", t[3], "-filter_complex", "[0][1]hstack[a];[2][3]hstack[b];[a][b]vstack", png]);
  const sum = { event: +n, cut: `${p.shot_id} → ${e.shot_id}`, A: { out: A.events[k - 1].out_frame, in: A.events[k].in_frame, transition: A.events[k].transition_in, rule: A.events[k].cut_rule }, B: { out: B.events[k - 1].out_frame, in: B.events[k].in_frame, transition: B.events[k].transition_in, rule: "handle edges" }, video: out, sheet: png, note: "left/top = A (the editor's choice), right/bottom = B (the plain alternative). Record the pick in editing.json learning." };
  fs.writeFileSync(path.join(WORK, `compare_${n}.json`), JSON.stringify(sum, null, 1)); console.log(JSON.stringify(sum, null, 1));
}

// ---- otio, chapters, qc, dailies ---------------------------------------------------------------------------------
function otio(edl) {
  const RT = v => ({ OTIO_SCHEMA: "RationalTime.1", rate: FPS, value: v }), TR = (a, d) => ({ OTIO_SCHEMA: "TimeRange.1", start_time: RT(a), duration: RT(d) });
  const children = [];
  for (const e of edl.events) { if (e.transition_in === "dissolve") children.push({ OTIO_SCHEMA: "Transition.1", name: "dissolve", transition_type: "SMPTE_Dissolve", in_offset: RT(Math.round(e.transition_s * FPS / 2)), out_offset: RT(Math.round(e.transition_s * FPS / 2)) });
    children.push({ OTIO_SCHEMA: "Clip.1", name: e.shot_id, source_range: TR(e.in_frame, e.frames), media_reference: e.missing ? { OTIO_SCHEMA: "MissingReference.1" } : { OTIO_SCHEMA: "ExternalReference.1", target_url: "file://" + e.clip }, metadata: { shot: { act: e.act, rung: e.rung, style: e.style, cut_rule: e.cut_rule } } }); }
  const t = { OTIO_SCHEMA: "Timeline.1", name: F.title, global_start_time: RT(0), tracks: { OTIO_SCHEMA: "Stack.1", name: "tracks", children: [{ OTIO_SCHEMA: "Track.1", name: "V1", kind: "Video", children }] } };
  const f = path.join(WORK, `${F.title}.otio`); fs.writeFileSync(f, JSON.stringify(t, null, 1)); console.log(f);
}
function chapters(edl) { let last = null, o = ""; for (const e of edl.events) if (e.act !== last) { const t = Math.max(0, Math.floor(e.start_s)); o += `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")} ${e.act}\n`; last = e.act; }
  const f = path.join(WORK, `${F.title}_chapters.txt`); fs.writeFileSync(f, o); console.log(o.trim()); }
function qc() {
  let md = `# qc — ${F.title}\n\nT4 exposure continuity: frame-to-frame mean-luma step ≤ 0.3 (of 255) inside a shot; black frames none.\n\n| clip | frames | Y range | median step | max step | steps > 0.3 | steps > 1 | T4 |\n|---|---|---|---|---|---|---|---|\n`;
  for (const s of SHOTS) { const m = metrics(s); if (!m) { md += `| ${s.id} | — | | | | | | no clip |\n`; continue; } const d = m.luma.slice(1).map((v, i) => Math.abs(v - m.luma[i])); const big = d.map((x, i) => [i + 1, x]).filter(x => x[1] > 1);
    md += `| ${s.id} | ${m.n} | ${Math.min(...m.luma).toFixed(1)}–${Math.max(...m.luma).toFixed(1)} | ${median(d).toFixed(3)} | ${Math.max(...d).toFixed(2)} | ${d.filter(x => x > 0.3).length} | ${big.length}${big.length ? " (f" + big.slice(0, 4).map(x => x[0]).join(",") + ")" : ""} | ${Math.max(...d) <= 0.3 ? "pass" : "FAIL"} |\n`; }
  const f = path.join(WORK, `${F.title}_qc.md`); fs.writeFileSync(f, md); console.log(md);
}
function dailies(edl) {
  const dir = path.join(WORK, "dailies"); fs.mkdirSync(dir, { recursive: true }); const idx = [];
  const checks = fs.existsSync(path.join(WORK, `${F.title}_check_edit.md`)) ? fs.readFileSync(path.join(WORK, `${F.title}_check_edit.md`), "utf8").split("\n").filter(l => l.startsWith("|")) : [];
  for (const s of SHOTS) { const m = metrics(s); if (!m) continue; const e = edl && edl.events.find(x => x.shot_id === s.id), kf = instantFrame(s, m.n);
    const frames = [["start", e ? e.in_frame : 0], ["key", kf !== null ? kf : Math.floor(m.n / 2)], ["end", (e ? e.out_frame : m.n) - 1]], stills = frames.map(([nm, fr]) => { const o = path.join(dir, `${s.id}_${nm}.jpg`); sh(FF, ["-loglevel", "error", "-y", "-i", m.clip, "-vf", `select=eq(n\\,${fr}),scale=640:360`, "-frames:v", "1", o]); return [nm, fr, path.basename(o)]; });
    const d = m.luma.slice(1).map((v, i) => Math.abs(v - m.luma[i])), rows = checks.filter(l => l.includes(s.id) && !l.startsWith("| test")).map(l => `<tr>${l.split("|").slice(1, -1).map(c => `<td>${c.trim()}</td>`).join("")}</tr>`).join("");
    const W = 640, Hh = 120, pts = m.luma.map((v, i) => `${(i / (m.n - 1) * W).toFixed(1)},${(Hh - v / 255 * Hh).toFixed(1)}`).join(" ");
    const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${s.id} — dailies</title>
<style>body{font:15px/1.4 system-ui;margin:16px;max-width:900px;background:#111;color:#ddd}video,img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #444;padding:4px 8px;text-align:left}h2{margin-top:28px}.row{display:flex;gap:8px;flex-wrap:wrap}.row div{flex:1 1 200px}small{color:#999}</style>
<h1>${s.id}</h1><p>${s.act || ""} · ${s.rung || ""} · ${s.seconds} s · lens ${s.lens || 50}° · style ${s.style || "—"}<br><small>${s.proves || ""}</small></p>
<video controls preload=metadata src="file://${m.clip}"></video>
<h2>Stills</h2><div class=row>${stills.map(([nm, fr, f]) => `<div><img src="${f}"><br><small>${nm} · frame ${fr}</small></div>`).join("")}</div>
<h2>Exposure trace (mean luma per frame)</h2><svg width=${W} height=${Hh} style="background:#000"><polyline fill=none stroke=#8cf stroke-width=1.5 points="${pts}"/>${kf !== null ? `<line x1=${(kf / (m.n - 1) * W).toFixed(1)} y1=0 x2=${(kf / (m.n - 1) * W).toFixed(1)} y2=${Hh} stroke=#f80 />` : ""}</svg>
<p>${m.n} frames · Y ${Math.min(...m.luma).toFixed(1)}–${Math.max(...m.luma).toFixed(1)} · median step ${median(d).toFixed(3)} · max step ${Math.max(...d).toFixed(2)} · T4 ${Math.max(...d) <= 0.3 ? "pass" : "<b style=color:#f66>FAIL</b>"}${kf !== null ? ` · key instant at frame ${kf} (${s.key_instant})` : ""}</p>
${e ? `<h2>In the cut</h2><p>event ${e.n}: in ${e.in_frame}, out ${e.out_frame} (${e.seconds} s), ${e.transition_in}, ${e.cut_rule}, starts at ${e.start_s} s</p>` : ""}
${rows ? `<h2>check_edit rows</h2><table><tr><th>test</th><th>where</th><th>verdict</th><th>detail</th></tr>${rows}</table>` : ""}
${s.voice ? `<h2>Voice</h2><p>${s.voice}<br><small>~${voiceSec(s.voice).toFixed(1)} s at 150 wpm</small></p>` : ""}`;
    fs.writeFileSync(path.join(dir, `${s.id}.html`), html); idx.push(`<li><a href="${s.id}.html">${s.id}</a> — ${s.act || ""} · ${s.seconds} s · T4 ${Math.max(...d) <= 0.3 ? "pass" : "FAIL"}</li>`); }
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><meta charset=utf-8><title>${F.title} — dailies</title><body style="font:15px system-ui;background:#111;color:#ddd;margin:16px"><h1>${F.title}</h1><ul>${idx.join("")}</ul>`); console.log(path.join(dir, "index.html"));
}

// ---- dispatch ----------------------------------------------------------------------------------------------------
const cmd = {
  metrics() { for (const s of SHOTS) { const m = metrics(s); console.log(m ? `${s.id}: ${m.n} frames, luma ${Math.min(...m.luma).toFixed(1)}–${Math.max(...m.luma).toFixed(1)}, motion median ${median(m.motion).toFixed(2)}` : `${s.id}: no clip`); } },
  edl() { buildEdl(); },
  render() { const edl = loadEdl(), out = opt("out", path.join(WORK, `${F.title}_cut.mp4`)); const len = renderCut(edl, out); console.log(`cut ${out}: ${len.toFixed(2)} s (edl says ${edl.runtime_s})`); },
  check() { checkEdit(loadEdl(), opt("cut", path.join(WORK, `${F.title}_cut.mp4`))); },
  compare() { compare(loadEdl(), ARGS[0]); },
  otio() { otio(loadEdl()); },
  chapters() { chapters(loadEdl()); },
  qc, dailies() { dailies(fs.existsSync(opt("edl", path.join(WORK, `${F.title}_edl.json`))) ? loadEdl() : null); },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
