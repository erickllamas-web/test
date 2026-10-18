#!/usr/bin/env node
// look.js — the look step and the exposure policy (look.json). Zero dependencies beyond ffmpeg.
//
//   node look.js apply LOOK FRAMES_DIR OUT_DIR [--depth 8|16]   apply a named look to every PNG (neutral = byte copy); writes OUT_DIR/look.json (what was applied, the look's hash)
//   node look.js exposure POLICY FRAMES.tsv [--value V] [--out FILE]   write EXPOSURE=… into column 16 per line: policy auto (unchanged), fixed (--value or the median of smooth), smooth (from the Sun altitude by look.json's table)
//   node look.js list                                              the looks and their rulings
//
// Control: `exposure auto` and `apply neutral` leave bytes identical. A look other than neutral prints its ruling line;
// one that says NOT RULED is applied only with --i-have-the-ruling, and the sidecar records that it was.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const [CMD, ...REST] = process.argv.slice(2);
if (!CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 10).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; }, flag = k => REST.includes("--" + k);
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const L = JSON.parse(fs.readFileSync(path.join(__dirname, "look.json"), "utf8")), FF = process.env.FFMPEG || "ffmpeg";
const sha = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
const lerpTable = (t, x) => { if (x <= t[0][0]) return t[0][1]; for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const [a, b] = [t[i - 1], t[i]]; return b[1] + 0 === a[1] ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return t[t.length - 1][1]; };
const cmd = {
  list() { for (const [k, v] of Object.entries(L.looks)) console.log(`${k.padEnd(18)} ${v.what}  — ruling: ${v.ruling}`); console.log(`\nexposure policies: auto | fixed | smooth (table ${JSON.stringify(L.exposure.smooth_table)}; ${L.exposure.calibration})`); },
  apply() {
    const [name, IN, OUT] = ARGS, lk = L.looks[name]; if (!lk) throw new Error(`no look ${name}`); fs.mkdirSync(OUT, { recursive: true });
    if (name !== "neutral" && /NOT RULED/.test(lk.ruling) && !flag("i-have-the-ruling")) throw new Error(`look ${name} is ${lk.ruling}; pass --i-have-the-ruling once Erick has ruled, and write his words into look.json`);
    const pngs = fs.readdirSync(IN).filter(f => /\.png$/i.test(f)).sort(), depth = opt("depth", "16"), fmt = depth === "16" ? "rgb48be" : "rgb24"; let n = 0;
    for (const f of pngs) { const a = path.join(IN, f), b = path.join(OUT, f); if (name === "neutral") fs.copyFileSync(a, b); else execFileSync(FF, ["-loglevel", "error", "-y", "-i", a, "-vf", `format=${fmt},${lk.filters},format=${fmt}`, "-pix_fmt", fmt, b]); n++; }
    fs.writeFileSync(path.join(OUT, "look.json"), JSON.stringify({ look: name, what: lk.what, filters: lk.filters || null, ruling: lk.ruling, look_sha: sha(JSON.stringify(lk)), depth, frames: n, from: path.resolve(IN), made: new Date().toISOString() }, null, 1));
    console.log(`${name}: ${n} frames -> ${OUT}${name === "neutral" ? " (byte copy)" : ` (${depth}-bit, ${lk.filters})`}`);
  },
  exposure() {
    const [policy, TSV] = ARGS, out = opt("out", TSV.replace(/\.tsv$/, "") + `.exp_${policy}.tsv`), lines = fs.readFileSync(TSV, "utf8").split("\n").filter(Boolean);
    if (policy === "auto") { fs.copyFileSync(TSV, out); console.log(`${out}: unchanged (auto = the renderer's per-frame EXPOSE=auto)`); return; }
    const alts = lines.map(l => +l.split("\t")[4]), vals = alts.map(a => lerpTable(L.exposure.smooth_table, a));
    const fixed = opt("value") ? +opt("value") : [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)];
    const outL = lines.map((l, i) => { const c = l.split("\t"); while (c.length < 16) c.push(""); const v = policy === "fixed" ? fixed : vals[i]; c[15] = [c[15].split(";").filter(x => x && !x.startsWith("EXPOSURE=")).join(";"), `EXPOSURE=${v.toFixed(1)}`].filter(Boolean).join(";"); return c.join("\t"); });
    fs.writeFileSync(out, outL.join("\n") + "\n"); console.log(`${out}: ${lines.length} lines, policy ${policy}${policy === "fixed" ? ` = ${fixed}` : ` (${Math.min(...vals).toFixed(0)}–${Math.max(...vals).toFixed(0)} over Sun altitude ${Math.min(...alts).toFixed(2)}°–${Math.max(...alts).toFixed(2)}°)`}. ${L.exposure.calibration}`);
  },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
