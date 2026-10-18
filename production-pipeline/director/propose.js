#!/usr/bin/env node
// propose.js — the proposer and the critic as briefs: no model is called here. Each command writes one self-contained
// markdown brief that A-PRODUCTION (or any agent, or Erick) answers; the answer is recorded next to it. The tables are
// quoted inside the brief so the reader needs nothing else.
//
//   node propose.js shot FILM.shots.json SHOT_ID [--styles a,b,c]    three ways to take this shot (three styles), with the
//                                                                    dimension values of each, the take it implies, and the question
//   node propose.js critic FILM.shots.json --stills DIR               one brief per still: the grammar as questions to answer in words,
//                                                                    beside the numbers check already gives
//   node propose.js record BRIEF.md --pick N [--note "…"]             record the answer (the pick) in <brief>.answer.json
"use strict";
const fs = require("fs"), path = require("path");
const [CMD, ...REST] = process.argv.slice(2);
if (!CMD) { console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 12).join("\n")); process.exit(2); }
const opt = (k, d) => { const i = REST.indexOf("--" + k); return i >= 0 ? REST[i + 1] : d; };
const ARGS = REST.filter((a, i) => !a.startsWith("--") && !(i > 0 && REST[i - 1].startsWith("--")));
const H = __dirname, LANG = path.join(H, "..", "film-language"), load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const DIRS = load(path.join(LANG, "directors.json")).directors, CAMS = load(path.join(H, "lib", "cameras.json")).takes, DIMS = load(path.join(LANG, "dimensions.json"));
const rungBand = { wide: ["medium", "long", "very_long"], medium: ["medium", "long"], close: ["insert", "medium", "long"], hold: ["insert", "medium"], insert: ["insert"] };
function candidates(shot) {   // the row's own style first, then two whose duration band fits the rung and whose 'for_us' speaks to this kind of shot
  const own = shot.style, fit = Object.entries(DIRS).filter(([k, d]) => k !== own && (rungBand[shot.rung] || []).includes(d.shot.duration));
  const words = `${shot.id} ${shot.proves || ""} ${shot.rung} ${(shot.camera && (shot.camera.take || shot.camera.kind)) || ""}`.toLowerCase();
  const score = ([k, d]) => d.for_us.join(" ").toLowerCase().split(/\W+/).filter(w => w.length > 3 && words.includes(w)).length;
  const picked = fit.sort((a, b) => score(b) - score(a)).slice(0, 2).map(x => x[0]);
  return [own, ...picked].filter(Boolean);
}
const takeFor = (style, shot) => { const d = DIRS[style].shot; const t = Object.entries(CAMS).filter(([k, c]) => c.rung === shot.rung || shot.rung === "insert" || shot.rung === "hold").map(([k, c]) => [k, (c.family === (d.movement === "locked" ? "locked" : d.movement === "push" || d.movement === "pull" ? "axis" : d.movement === "orbit" ? "orbit" : d.movement === "walk" ? "walk" : d.movement === "crane" ? "axis" : c.family) ? 2 : 0) + (Math.abs(c.lens - { wide: 50, normal: 32, long: 15, very_long: 6 }[d.lens]) < 12 ? 1 : 0)]).sort((a, b) => b[1] - a[1]); return t.length ? t[0][0] : null; };
const cmd = {
  shot() {
    const F = load(ARGS[0]), s = F.shots.find(x => x.id === ARGS[1]); if (!s) throw new Error("no shot " + ARGS[1]);
    const styles = (opt("styles") ? opt("styles").split(",") : candidates(s)), out = path.join(path.dirname(path.resolve(ARGS[0])), `propose_${s.id}.md`);
    let md = `# Propose: ${s.id} (${F.title})\n\nThe claim: **${s.proves || "(none written)"}**. Act ${s.act}, rung ${s.rung}, ${s.seconds} s, today's take: ${s.camera.take || s.camera.kind}${s.lens ? `, lens ${s.lens}°` : ""}, style ${s.style || "none"}.\n\nThree ways to take it. For each: the dimension values the style implies (film-language/directors.json), the take from the camera library that fits them, and what it would change in the row. Answer with the number, or "none", and one line why. The answer is recorded with \`propose.js record\`.\n\n`;
    styles.forEach((k, i) => { const d = DIRS[k], t = takeFor(k, s); md += `## ${i + 1}. ${d.name}\n\n${d.signature}\n\n| dimension | value |\n|---|---|\n` + Object.entries(d.shot).filter(([a]) => !["light", "look", "sound"].includes(a)).map(([a, v]) => `| ${a} | ${v} |`).join("\n") + `\n| light | ${d.shot.light.band} / ${d.shot.light.direction} |\n| sound | voice ${d.shot.sound.voice}, music ${d.shot.sound.music}, ${d.shot.sound.silence} |\n\nTake that fits: **${t || "none in the library"}**${t ? ` (${CAMS[t].best_for})` : ""}. Row change: \`"style": "${k}"${t && t !== s.camera.take ? `, "camera": {"take": "${t}"}` : ""}\`.\n\nFor us: ${d.for_us.join("; ")}. Avoid: ${d.avoid.join("; ")}.\n\n`; });
    md += `## The question\n\nWhich of the three, for this claim, in this act? If none, say what the fourth would be in the same words (dimension values), and it becomes a row in directors.json.\n`;
    fs.writeFileSync(out, md); console.log(out);
  },
  critic() {
    const F = load(ARGS[0]), dir = opt("stills"), out = path.join(path.dirname(path.resolve(ARGS[0])), `critic_${F.title}.md`);
    let md = `# Critic: ${F.title}\n\nOne still per shot (${dir}). For each, look at the picture and answer the questions in words; the numbers are in ${F.title}_checks.md. Be plain: "the body is a dot", "the horizon cuts the lintel", "nothing tells me where the axis is".\n\n`;
    F.shots.forEach((s, i) => { const png = dir ? fs.readdirSync(dir).find(f => f.includes(s.id) && /\.(png|jpg)$/.test(f)) : null; const d = s.style && DIRS[s.style];
      md += `## ${i + 1}. ${s.id} — ${s.act}, ${s.rung}, ${s.seconds} s${png ? `\n\n![${s.id}](${path.join(dir, png)})` : "\n\n(no still found)"}\n\nClaim: ${s.proves || "—"}${d ? `\nStyle asked: ${d.name} — ${d.signature}` : ""}\n\n1. Is the claim visible without the voice? What in the frame proves it?\n2. Where is the eye at the end of the shot, and does the next shot start there?\n3. Does the frame read as ${d ? d.shot.frame : "the rung asks"}? What breaks it?\n4. Light: is the body (Sun/Moon) a disc, a glow, or nothing? Silhouette or lit stone?\n5. Surfaces: what reads as a box, a blotch, or a plantation? (name it, no fix)\n6. One change you would make to the camera numbers, and why.\n\n`; });
    fs.writeFileSync(out, md); console.log(out);
  },
  record() { const brief = ARGS[0], pick = opt("pick"), f = brief.replace(/\.md$/, "") + ".answer.json"; const a = fs.existsSync(f) ? load(f) : { brief, answers: [] }; a.answers.push({ pick, note: opt("note", ""), date: new Date().toISOString() }); fs.writeFileSync(f, JSON.stringify(a, null, 1)); console.log(f); },
};
if (!cmd[CMD]) { console.error("unknown command " + CMD); process.exit(2); }
cmd[CMD]();
