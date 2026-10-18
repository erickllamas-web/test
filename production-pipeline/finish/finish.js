#!/usr/bin/env node
// finish.js — the finish stage: sound onto the locked cut, titles, captions, chapters, poster, master and delivery encodes.
//
//   node finish.js FILM.json master --edl EDL.json --cut CUT.mp4 [--sound sound.json] [--work DIR] [--profiles youtube,preview] [--burn-captions]
//   node finish.js FILM.json audio  --edl EDL.json [--sound sound.json] [--work DIR]        the mixed, loudness-normalised soundtrack only
//   node finish.js FILM.json poster --edl EDL.json --cut CUT.mp4 [--work DIR]               the poster frame (the climax key instant)
//   node finish.js FILM.json titles [--sound sound.json] [--work DIR]                         the title cards only (to look at them)
//
// Inputs: the EDL from edit.js (events with start_s, seconds, key_instant_s, sound.voice_start_s) and the rendered cut.
// Outputs in <work>/master/: <title>_master.<ext>, <title>_<profile>.<ext>, <title>.srt, <title>_chapters.txt,
// <title>_poster.png, <title>_audio.wav, <title>_master.json (what was used: hashes, encoders, loudness measured).
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawnSync } = require("child_process");
const [FILE, CMD, ...REST] = process.argv.slice(2);
if (!FILE || !CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 12).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; }, flag = k => REST.includes("--" + k);
const F = JSON.parse(fs.readFileSync(FILE, "utf8")), FPS = (F.film && F.film.fps) || 24;
const WORK = path.resolve(opt("work", F.work || path.join(path.dirname(path.resolve(FILE)), "..", "work", F.title))), OUT = path.join(WORK, "master"); fs.mkdirSync(OUT, { recursive: true });
const FF = process.env.FFMPEG || "ffmpeg", FP = process.env.FFPROBE || "ffprobe";
const PROF = JSON.parse(fs.readFileSync(path.join(__dirname, "profiles.json"), "utf8"));
const SND = (() => { const p = opt("sound", path.join(WORK, "sound.json")); return fs.existsSync(p) ? { ...JSON.parse(fs.readFileSync(p, "utf8")), _dir: path.dirname(p) } : { _dir: WORK, music: { cues: [] }, titles: {} }; })();
const EDL = opt("edl") ? JSON.parse(fs.readFileSync(opt("edl"), "utf8")) : null;
const run = (c, a, quiet) => { const r = spawnSync(c, a, { encoding: "utf8", maxBuffer: 1 << 28 }); if (r.status !== 0 && !quiet) throw new Error(`${c} ${a.join(" ")}\n${r.stderr}`); return r; };
const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex").slice(0, 16);
const notes = [];
const note = s => { notes.push(s); console.log("note: " + s); };
const has = (kind, name) => { const r = run(FF, ["-hide_banner", kind === "enc" ? "-encoders" : "-filters"], true); return new RegExp(`\\s${name}\\s`).test(r.stdout); };
const rel = p => path.isAbsolute(p) ? p : path.join(SND._dir, p);
const dur = f => +run(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.trim();
const size = f => run(FP, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", f]).stdout.trim();
const font = () => { if (SND.titles && SND.titles.font && fs.existsSync(SND.titles.font)) return SND.titles.font; const r = run("fc-list", [], true); const m = (r.stdout || "").split("\n").find(l => /DejaVuSans\.ttf|LiberationSans-Regular|NotoSans-Regular/.test(l)); return m ? m.split(":")[0] : null; };
const dtext = s => s.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'").replace(/%/g, "\\%");

// ---- voice: a file per shot, or tts_cmd, or silence ---------------------------------------------------------------
function voiceFiles() {
  const dir = rel(SND.voice_dir || "voice"), out = [];
  for (const e of EDL.events) { if (!e.sound) continue;
    let f = [".wav", ".mp3", ".flac", ".m4a"].map(x => path.join(dir, e.shot_id + x)).find(fs.existsSync);
    if (!f && SND.tts_cmd) { fs.mkdirSync(dir, { recursive: true }); f = path.join(dir, e.shot_id + ".wav"); const tf = path.join(dir, e.shot_id + ".txt"); fs.writeFileSync(tf, e.sound.voice);
      const cmd = SND.tts_cmd.replace("{text}", JSON.stringify(e.sound.voice)).replace("{text_file}", tf).replace("{out}", f); const r = spawnSync("bash", ["-lc", cmd], { encoding: "utf8" }); if (r.status !== 0 || !fs.existsSync(f)) { note(`tts failed for ${e.shot_id}: ${(r.stderr || "").trim().slice(0, 200)}`); f = null; } }
    if (f) { const d = dur(f); out.push({ e, f, d }); if (d > e.seconds) note(`${e.shot_id}: voice ${d.toFixed(1)} s is longer than the shot (${e.seconds} s)`); }
    else note(`${e.shot_id}: no voice file (${path.join(dir, e.shot_id + ".wav")}) and no tts_cmd — silent; the SRT carries the line`); }
  return out;
}
// ---- the mix ------------------------------------------------------------------------------------------------------
function mixAudio() {
  const T = EDL.runtime_s, ins = ["-f", "lavfi", "-t", T.toFixed(3), "-i", "anullsrc=r=48000:cl=stereo"], fc = [], mix = ["[0:a]"]; let n = 1;
  const V = voiceFiles(), vl = SND.voice_level_db ?? -3;
  for (const v of V) { ins.push("-i", v.f); fc.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${vl}dB,adelay=${Math.round(v.e.sound.voice_start_s * 1000)}|${Math.round(v.e.sound.voice_start_s * 1000)}[v${n}]`); mix.push(`[v${n}]`); n++; }
  // music cues by act: from the act's first event to its last, with fades and a duck under each voice line
  const M = SND.music || {}, cues = M.cues || [];
  for (const c of cues) { const evs = EDL.events.filter(e => e.act === c.act); if (!evs.length) { note(`music cue for "${c.act}": no such act`); continue; }
    const f = c.file ? rel(c.file) : null; if (!f || !fs.existsSync(f)) { note(`music cue for "${c.act}": file missing (${c.file || "none"}) — skipped`); continue; }
    const t0 = evs[0].start_s + (c.start_offset_s || 0), t1 = evs[evs.length - 1].start_s + evs[evs.length - 1].seconds, len = Math.max(0.1, t1 - t0), fi = M.fade_in_s ?? 3, fo = M.fade_out_s ?? 4;
    let chain = `[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${len.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fi},afade=t=out:st=${Math.max(0, len - fo).toFixed(3)}:d=${fo},volume=${M.level_db ?? -18}dB`;
    for (const v of V) { const a = v.e.sound.voice_start_s - t0, b = a + v.d; if (b > 0 && a < len) chain += `,volume=enable='between(t,${Math.max(0, a - 0.3).toFixed(2)},${Math.min(len, b + 0.3).toFixed(2)})':volume=${M.duck_db ?? -8}dB`; }
    ins.push("-i", f); fc.push(`${chain},adelay=${Math.round(t0 * 1000)}|${Math.round(t0 * 1000)}[m${n}]`); mix.push(`[m${n}]`); n++; }
  if (SND.ambience && SND.ambience.file && fs.existsSync(rel(SND.ambience.file))) { ins.push("-stream_loop", "-1", "-i", rel(SND.ambience.file)); fc.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${T.toFixed(3)},volume=${SND.ambience.level_db ?? -30}dB[amb]`); mix.push("[amb]"); n++; }
  fc.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=first[mix]`);
  const raw = path.join(OUT, `${F.title}_audio_raw.wav`); run(FF, ["-loglevel", "error", "-y", ...ins, "-filter_complex", fc.join(";"), "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", raw]);
  // two-pass loudness to YouTube's reference
  const L = PROF.loudness, p1 = run(FF, ["-hide_banner", "-i", raw, "-af", `loudnorm=I=${L.integrated_lufs}:TP=${L.true_peak_dbtp}:LRA=${L.lra}:print_format=json`, "-f", "null", "-"], true);
  const js = (p1.stderr.match(/\{[\s\S]*\}/) || ["{}"])[0]; let m = {}; try { m = JSON.parse(js); } catch (e) {}
  const out = path.join(OUT, `${F.title}_audio.wav`), silent = !isFinite(+m.input_i) || +m.input_i < -70;
  if (silent) { note("the soundtrack is silent (no voice files, no music) — the loudness pass is skipped; the SRT and the chapters still carry the words"); fs.renameSync(raw, out); return { file: out, voice: V.length, cues: cues.length, loudness_before: null, loudness_after: null, true_peak: null, silent: true }; }
  const measured = `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  run(FF, ["-loglevel", "error", "-y", "-i", raw, "-af", `loudnorm=I=${L.integrated_lufs}:TP=${L.true_peak_dbtp}:LRA=${L.lra}${measured}`, "-ar", "48000", "-c:a", "pcm_s24le", out]); fs.unlinkSync(raw);
  const p2 = run(FF, ["-hide_banner", "-i", out, "-af", "loudnorm=print_format=json", "-f", "null", "-"], true); let m2 = {}; try { m2 = JSON.parse((p2.stderr.match(/\{[\s\S]*\}/) || ["{}"])[0]); } catch (e) {}
  console.log(`audio ${out}: ${V.length} voice line(s), ${cues.length} music cue(s); loudness before ${m.input_i ?? "?"} LUFS, after ${m2.input_i ?? "?"} LUFS, true peak ${m2.input_tp ?? "?"} dBTP`);
  return { file: out, voice: V.length, cues: cues.length, loudness_before: m.input_i, loudness_after: m2.input_i, true_peak: m2.input_tp };
}
// ---- titles --------------------------------------------------------------------------------------------------------
function titleCard(name, lines, seconds, WH) {
  const f = path.join(OUT, `${F.title}_${name}.mp4`), fnt = font(), [W, H] = WH.split("x").map(Number);
  if (!has("filter", "drawtext") || !fnt) { note(`titles: ${!fnt ? "no font found" : "this ffmpeg has no drawtext"} — ${name} card is black, no text`); run(FF, ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(seconds), "-i", `color=c=black:s=${WH}:r=${FPS}`, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", f]); return f; }
  const n = lines.length, vf = lines.map((t, i) => `drawtext=fontfile='${fnt}':text='${dtext(t.text)}':fontsize=${t.size}:fontcolor=white@0.92:x=(w-text_w)/2:y=(h-${n * 1.6 * 48})/2+${i * 1.6 * 48 * (t.size / 48) + (t.size < 48 ? 20 : 0)}:alpha='if(lt(t,1),t,if(gt(t,${seconds - 1}),${seconds}-t,1))'`).join(",");
  run(FF, ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(seconds), "-i", `color=c=black:s=${WH}:r=${FPS}`, "-vf", vf, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", f]); return f;
}
function titles(WH) {
  const T = SND.titles || {}, out = {};
  if (T.open) out.open = titleCard("title_open", [{ text: T.open.title || F.title, size: 72 }, ...(T.open.subtitle ? [{ text: T.open.subtitle, size: 36 }] : [])], T.open.seconds || 4, WH);
  if (T.end) out.end = titleCard("title_end", (T.end.lines || []).map(t => ({ text: t, size: 36 })), T.end.seconds || 6, WH);
  return out;
}
// ---- captions, chapters, poster -------------------------------------------------------------------------------------
const ts = x => { x = Math.max(0, x); const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")},${String(Math.round((s % 1) * 1000)).padStart(3, "0")}`; };
function captions(offset, V) { let k = 1, o = ""; for (const e of EDL.events) if (e.sound) { const v = V.find(x => x.e === e), d = v ? v.d : e.sound.voice_est_s; o += `${k++}\n${ts(e.sound.voice_start_s + offset)} --> ${ts(e.sound.voice_start_s + offset + d)}\n${e.sound.voice}\n\n`; } const f = path.join(OUT, `${F.title}.srt`); fs.writeFileSync(f, o); return f; }
function chapters(offset) { let last = null, o = ""; if (offset > 0) o += `00:00 Title\n`; for (const e of EDL.events) if (e.act !== last) { const t = Math.floor(e.start_s + offset); o += `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")} ${e.act}\n`; last = e.act; } const f = path.join(OUT, `${F.title}_chapters.txt`); fs.writeFileSync(f, o); return f; }
function poster(cut) {
  const want = F.film && F.film.poster_shot, e = EDL.events.find(x => want ? x.shot_id === want : x.key_instant_s !== null) || EDL.events[Math.floor(EDL.events.length / 2)];
  const t = e.key_instant_s !== null ? e.key_instant_s : e.start_s + e.seconds / 2, png = path.join(OUT, `${F.title}_poster.png`), jpg = png.replace(/png$/, "jpg");
  run(FF, ["-loglevel", "error", "-y", "-ss", t.toFixed(3), "-i", cut, "-frames:v", "1", png]); run(FF, ["-loglevel", "error", "-y", "-i", png, "-q:v", "2", jpg]);
  console.log(`poster ${png}: ${e.shot_id} at ${t.toFixed(2)} s${e.key_instant_s !== null ? " (its key instant)" : ""}`); return { file: png, shot: e.shot_id, at_s: +t.toFixed(3) };
}
// ---- master ----------------------------------------------------------------------------------------------------------
function encode(profileName, video, audio, WH) {
  let p = PROF.profiles[profileName], name = profileName; while (p.needs && !has("enc", p.needs) && p.fallback) { note(`profile ${name}: encoder ${p.needs} missing, using ${p.fallback}`); name = p.fallback; p = PROF.profiles[name]; }
  const out = path.join(OUT, `${F.title}_${profileName === "mezzanine" || name.startsWith("mezzanine") ? "master" : profileName}.${p.container}`);
  const vf = p.size !== "source" && p.size !== WH ? ["-vf", `scale=${p.size.replace("x", ":")}:flags=lanczos`] : [];
  const args = ["-loglevel", "error", "-y", "-i", video, ...(audio ? ["-i", audio] : []), "-map", "0:v:0", ...(audio ? ["-map", "1:a:0"] : []), ...vf, ...p.video, ...(audio ? p.audio : ["-an"]), "-movflags", "+faststart", "-shortest", out];
  run(FF, args); console.log(`${profileName} -> ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB, ${name})`); return { profile: profileName, used: name, file: out, args: args.slice(3) };
}
function master() {
  const cut = opt("cut", path.join(WORK, `${F.title}_cut.mp4`)); if (!fs.existsSync(cut)) throw new Error("no cut at " + cut);
  const WH = size(cut), T = titles(WH), audio = mixAudio(), V = voiceFiles();
  // picture: title open + cut + title end, concatenated losslessly in time (the cards are encoded like the cut)
  let picture = cut, offset = 0; const parts = [T.open, cut, T.end].filter(Boolean);
  if (parts.length > 1) { offset = T.open ? dur(T.open) : 0; const ins = parts.flatMap(f => ["-i", f]), fc = parts.map((_, i) => `[${i}:v]fps=${FPS},scale=${WH.replace("x", ":")},setsar=1,format=yuv420p,settb=AVTB[v${i}]`).join(";") + `;${parts.map((_, i) => `[v${i}]`).join("")}concat=n=${parts.length}:v=1:a=0[v]`;
    picture = path.join(OUT, `${F.title}_picture.mp4`); run(FF, ["-loglevel", "error", "-y", ...ins, "-filter_complex", fc, "-map", "[v]", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", picture]); }
  // the soundtrack shifted by the opening card
  let a = audio.file; if (offset > 0) { const sh = path.join(OUT, `${F.title}_audio_shifted.wav`); run(FF, ["-loglevel", "error", "-y", "-i", a, "-af", `adelay=${Math.round(offset * 1000)}|${Math.round(offset * 1000)},apad`, "-t", String(dur(picture)), "-c:a", "pcm_s24le", sh]); a = sh; }
  const srt = captions(offset, V), ch = chapters(offset), po = poster(picture);
  if (flag("burn-captions") && has("filter", "subtitles")) { const b = path.join(OUT, `${F.title}_picture_captioned.mp4`); run(FF, ["-loglevel", "error", "-y", "-i", picture, "-vf", `subtitles='${srt.replace(/:/g, "\\:")}'`, "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", b]); picture = b; }
  const want = (opt("profiles", "mezzanine,youtube,preview")).split(","), encs = want.map(p => encode(p, picture, a, WH));
  const man = { film: F.title, made: new Date().toISOString(), cut: { file: cut, sha: sha(cut), seconds: dur(cut), size: WH }, edl: { file: opt("edl"), sha: sha(opt("edl")) }, shot_file: { file: path.resolve(FILE), sha: sha(FILE) }, sound: SND._dir ? { voice_lines: audio.voice, music_cues: audio.cues, loudness_lufs: audio.loudness_after, true_peak_dbtp: audio.true_peak } : null, titles: T, captions: srt, chapters: ch, poster: po, encodes: encs, notes };
  fs.writeFileSync(path.join(OUT, `${F.title}_master.json`), JSON.stringify(man, null, 1)); console.log(`master manifest ${path.join(OUT, `${F.title}_master.json`)}${notes.length ? `\n${notes.length} note(s) — read them` : ""}`);
}
const cmd = { master, audio() { mixAudio(); }, poster() { poster(opt("cut", path.join(WORK, `${F.title}_cut.mp4`))); }, titles() { const c = opt("cut", path.join(WORK, `${F.title}_cut.mp4`)); console.log(titles(fs.existsSync(c) ? size(c) : "1920x1080")); } };
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
if (CMD !== "titles" && !EDL) { console.error("--edl EDL.json is required"); process.exit(2); }
cmd[CMD]();
