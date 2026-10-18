#!/usr/bin/env node
// manifest.js — frame identity and the clip's proof (PIPELINE v3 §5.2). Zero dependencies.
//
//   node manifest.js settings GO.sh                                   the resolved settings (last export wins) and their fingerprint
//   node manifest.js hash FRAMES.tsv --settings GO.sh --bin BIN --scene SCENE.json [--libs a.so,b.so] --size WxH --fov F
//                                                                     -> FRAMES.hash.tsv: frame index, identity hash, the line's columns 2-16 hash
//   node manifest.js clip CLIP.mp4 --frames FRAMES.tsv --png-dir DIR --settings GO.sh --bin BIN --scene SCENE.json [--libs ...] --size WxH --fov F [--shot ROW.json] [--out FILE]
//                                                                     -> the clip manifest: identity of every frame, sha of every PNG, binary/libs/scene/settings, ffmpeg args, timings from render.log if present
//   node manifest.js verify MANIFEST.json [--png-dir DIR]             every PNG still has the recorded sha; prints the three frames to re-render for the byte test
//   node manifest.js cache put HASH FILE.png | get HASH [--cache DIR]  a global frame cache keyed by identity (a frame is rendered once, ever)
//
// identity(frame) = sha256( columns 2..16 of its line ‖ WxH ‖ fov ‖ fingerprint(resolved settings) ‖ sha(binary) ‖ sha(each lib) ‖ sha(scene) ).
// Column 1 (the output path) is not part of it: the same frame written anywhere is the same frame.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const [CMD, ...REST] = process.argv.slice(2);
if (!CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 14).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; };
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const shaFile = f => sha(fs.readFileSync(f));
const CACHE = opt("cache", process.env.FRAME_CACHE || path.join(process.env.HOME || "/tmp", ".cache", "frame-cache"));

function resolveSettings(go) {   // the loaders eval every `export` line in order; the last value of a name wins
  const out = {}; for (const l of fs.readFileSync(go, "utf8").split("\n")) { const m = l.match(/^\s*export\s+(.*)$/); if (!m) continue;
    for (const kv of m[1].match(/([A-Za-z_][A-Za-z0-9_]*)=("[^"]*"|'[^']*'|\S*)/g) || []) { const [k, ...v] = kv.split("="); out[k] = v.join("=").replace(/^["']|["']$/g, ""); } }
  const keys = Object.keys(out).sort(), text = keys.map(k => `${k}=${out[k]}`).join("\n"); return { settings: out, fingerprint: sha(text).slice(0, 16), text };
}
function env() {
  const S = resolveSettings(opt("settings")), bin = opt("bin"), scene = opt("scene"), libs = (opt("libs", "") || "").split(",").filter(Boolean);
  const r = { size: opt("size"), fov: opt("fov"), settings_file: opt("settings"), settings_fingerprint: S.fingerprint, bin, bin_sha: bin && fs.existsSync(bin) ? shaFile(bin) : null, scene, scene_sha: scene && fs.existsSync(scene) ? shaFile(scene) : null, libs: libs.map(l => ({ file: l, sha: fs.existsSync(l) ? shaFile(l) : null })) };
  for (const [k, v] of Object.entries({ size: r.size, fov: r.fov, settings: r.settings_file })) if (!v) throw new Error(`--${k} is required`);
  if (!r.bin_sha) console.error(`warning: binary ${bin} not found here — its sha is null (fine on another machine; not fine for the proof)`);
  if (!r.scene_sha) console.error(`warning: scene ${scene} not found here — sha null`);
  return r;
}
const envKey = e => `${e.size}|${e.fov}|${e.settings_fingerprint}|${e.bin_sha}|${e.libs.map(l => l.sha).join(",")}|${e.scene_sha}`;
function frameIds(tsv, e) {
  const K = envKey(e); return fs.readFileSync(tsv, "utf8").split("\n").filter(Boolean).map((l, i) => { const c = l.split("\t"), body = c.slice(1, 16).join("\t"); return { i, out: c[0], line_sha: sha(body).slice(0, 16), id: sha(body + "\u0000" + K) }; });
}
const cmd = {
  settings() { const S = resolveSettings(ARGS[0]); console.log(S.text); console.log(`\nfingerprint ${S.fingerprint} (${Object.keys(S.settings).length} names)`); },
  hash() { const e = env(), ids = frameIds(ARGS[0], e), out = ARGS[0].replace(/\.tsv$/, "") + ".hash.tsv"; fs.writeFileSync(out, "i\tidentity\tline_sha\tout\n" + ids.map(x => `${x.i}\t${x.id}\t${x.line_sha}\t${x.out}`).join("\n") + "\n");
    const held = ids.filter((x, i) => i && x.line_sha === ids[i - 1].line_sha).length; console.log(`${out}: ${ids.length} frames, ${new Set(ids.map(x => x.id)).size} distinct identities (${held} held copies), env ${e.settings_fingerprint}/${(e.bin_sha || "no-bin").slice(0, 8)}`); },
  clip() {
    const clip = ARGS[0], e = env(), tsv = opt("frames"), dir = opt("png-dir"), ids = frameIds(tsv, e), frames = ids.map(x => { const p = path.join(dir, path.basename(x.out).replace(/\.ppm$/, ".png")); return { ...x, png: p, png_sha: fs.existsSync(p) ? shaFile(p) : null }; });
    const log = path.join(dir, "render.log"), timing = fs.existsSync(log) ? [...fs.readFileSync(log, "utf8").matchAll(/FRAME[^\d]*(\d+)[^\d]*([\d.]+)\s*ms/g)].map(m => +m[2]) : [];
    const row = opt("shot") ? JSON.parse(fs.readFileSync(opt("shot"), "utf8")) : null;
    const man = { clip: path.resolve(clip), clip_sha: shaFile(clip), made: new Date().toISOString(), shot: row, frames_tsv: path.resolve(tsv), frames_tsv_sha: shaFile(tsv), env: e, ffmpeg: "-framerate 24 -i f_%05d.png -c:v libx264 -crf 18 -pix_fmt yuv420p (run_film.sh)", frames_n: frames.length, frames_missing_png: frames.filter(f => !f.png_sha).length, distinct_identities: new Set(frames.map(f => f.id)).size, timing_ms: timing.length ? { n: timing.length, median: timing.sort((a, b) => a - b)[Math.floor(timing.length / 2)], max: timing[timing.length - 1] } : null, frames };
    const out = opt("out", clip.replace(/\.mp4$/, "") + ".manifest.json"); fs.writeFileSync(out, JSON.stringify(man, null, 1)); console.log(`${out}: ${man.frames_n} frames, ${man.frames_missing_png} without PNG, clip ${man.clip_sha.slice(0, 12)}, settings ${e.settings_fingerprint}`);
  },
  verify() {
    const man = JSON.parse(fs.readFileSync(ARGS[0], "utf8")), dir = opt("png-dir"); let ok = 0, bad = [], gone = [];
    for (const f of man.frames) { const p = dir ? path.join(dir, path.basename(f.png)) : f.png; if (!fs.existsSync(p)) { gone.push(f.i); continue; } if (f.png_sha && shaFile(p) === f.png_sha) ok++; else bad.push(f.i); }
    const pick = [...new Set([0, Math.floor(man.frames.length / 2), man.frames.length - 1])].map(i => man.frames[i]);
    console.log(`${ok} PNG(s) match, ${bad.length} differ${bad.length ? " (" + bad.slice(0, 10).join(",") + ")" : ""}, ${gone.length} gone (frames cleared after the clip: normal).`);
    console.log(`byte test (T10): re-render these three lines with the recorded env and compare the PNG sha:\n` + pick.map(f => `  frame ${f.i}: identity ${f.id.slice(0, 16)}… png ${f.png_sha ? f.png_sha.slice(0, 16) : "none"}…  line: ${f.out}`).join("\n"));
    if (bad.length) process.exitCode = 1;
  },
  cache() { fs.mkdirSync(CACHE, { recursive: true }); const [sub, h, f] = ARGS; const p = h ? path.join(CACHE, h.slice(0, 2), h + ".png") : null;
    if (sub === "put") { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.copyFileSync(f, p); console.log("cached " + p); }
    else if (sub === "get") { if (fs.existsSync(p)) { console.log(p); } else { console.log(""); process.exitCode = 1; } }
    else if (sub === "stats") { let n = 0, b = 0; for (const d of fs.readdirSync(CACHE)) for (const x of fs.readdirSync(path.join(CACHE, d))) { n++; b += fs.statSync(path.join(CACHE, d, x)).size; } console.log(`${n} frames, ${(b / 1e9).toFixed(2)} GB in ${CACHE}`); }
    else throw new Error("cache put HASH FILE | get HASH | stats"); },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
