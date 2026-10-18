#!/usr/bin/env node
// learn.js — learning the edit (film-language/editing.json "learning"): record Erick's pick between two candidate cuts
// with both candidates' measurements; summarise; suggest moved thresholds. Nothing is moved by this tool: it prints the
// suggestion and the picks behind it; a human edits editing.json and the change is recorded there with the picks.
//
//   node learn.js record compare_N.json --pick A|B [--note "…"] [--film TITLE]    append to editing.json learning.picks
//   node learn.js summary                                                        picks by context (transition, rule), agreement with the editor
//   node learn.js suggest                                                        what the picks say, when there are enough (≥ 5 on one context, ≥ 60 % one way)
"use strict";
const fs = require("fs"), path = require("path");
const [CMD, ...REST] = process.argv.slice(2);
if (!CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 9).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; };
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const EDF = path.join(__dirname, "..", "film-language", "editing.json"), ED = JSON.parse(fs.readFileSync(EDF, "utf8"));
ED.learning.picks = ED.learning.picks || [];
const ctx = p => `${p.A.transition}→${p.B.transition}|${(p.A.rule || "").split(" ")[0]}`;
const cmd = {
  record() { const c = JSON.parse(fs.readFileSync(ARGS[0], "utf8")), pick = (opt("pick") || "").toUpperCase(); if (!["A", "B"].includes(pick)) throw new Error("--pick A|B");
    ED.learning.picks.push({ film: opt("film", path.basename(path.dirname(path.resolve(ARGS[0])))), event: c.event, cut: c.cut, A: c.A, B: c.B, pick, note: opt("note", ""), date: new Date().toISOString() });
    fs.writeFileSync(EDF, JSON.stringify(ED, null, 1)); console.log(`recorded pick ${pick} for ${c.cut} (${ED.learning.picks.length} pick(s) on file)`); },
  summary() { const P = ED.learning.picks, by = {}; for (const p of P) { const k = ctx(p); by[k] = by[k] || { n: 0, A: 0 }; by[k].n++; if (p.pick === "A") by[k].A++; }
    console.log(`${P.length} pick(s)\n| context (A→B transition | A's rule) | picks | editor's choice (A) kept |\n|---|---|---|`); for (const [k, v] of Object.entries(by)) console.log(`| ${k} | ${v.n} | ${v.A}/${v.n} |`); },
  suggest() { const P = ED.learning.picks, by = {}; for (const p of P) { const k = ctx(p); (by[k] = by[k] || []).push(p); } let any = false;
    for (const [k, ps] of Object.entries(by)) { if (ps.length < 5) continue; const b = ps.filter(p => p.pick === "B").length / ps.length; if (b >= 0.6) { any = true; console.log(`${k}: ${ps.length} picks, ${(b * 100).toFixed(0)} % against the editor — consider ${/dissolve→cut/.test(k) ? "cutting where it now dissolves (dissolve_context)" : /cut→dissolve/.test(k) ? "dissolving where it now cuts" : "the cut_point default for this rule (handle edges were preferred)"}; picks: ${ps.map(p => p.cut).join("; ")}`); } }
    if (!any) console.log(`nothing to suggest yet (${P.length} pick(s); a suggestion needs ≥ 5 on one context, ≥ 60 % one way)`); },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
