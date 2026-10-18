#!/usr/bin/env python3
"""make_doc.py — FILM_LANGUAGE.md from dimensions.json, directors.json and sequences.json.
The JSON is the source; the document is generated, so the two never drift. Run from this folder."""
import json, pathlib
H = pathlib.Path(__file__).parent
dims = json.loads((H / "dimensions.json").read_text())
dirs = json.loads((H / "directors.json").read_text())["directors"]
seqs = json.loads((H / "sequences.json").read_text())["patterns"]
out = []
w = out.append
w("# The film language library\n")
w("Generated from `dimensions.json`, `directors.json`, `sequences.json` by `make_doc.py`. Edit the JSON, not this file.\n")
w("Three tables: the **dimensions** (every property of a shot or a sequence and the shot-file field it lands in), "
  "the **directors** (one value per dimension: how each pursues a shot and builds a sequence), and the **sequence "
  "patterns** (ordered beats a strategy expands). The directors' rows are their habits as commonly described, written "
  "as starting rows to edit; none is a measurement. Nothing in the *look* dimension changes a number the renderer "
  "computed: it is the display transform, recorded once per film, and needs a ruling before any value but neutral.\n")

def val_lines(v):
    if isinstance(v, dict) and all(isinstance(x, dict) for x in v.values()):
        return [f"**{k}**: " + ", ".join(f"`{a}`" + (f" ({b})" if b else "") for a, b in x.items()) for k, x in v.items()]
    return [", ".join(f"`{a}`" + (f" ({b})" if b else "") for a, b in v.items())]

for level in ("shot", "sequence"):
    w(f"\n## Dimensions of a {level}\n")
    w("| dimension | what | values | lands in |")
    w("|---|---|---|---|")
    for k, d in dims[level].items():
        w(f"| **{k}** | {d['what']} | " + "<br>".join(val_lines(d["values"])) + f" | {d['maps_to']} |")

w("\n## The directors — how each pursues a shot\n")
shot_cols = ["frame", "lens", "height", "line", "movement", "motion_curve", "time", "duration", "cut_in", "eye_trace"]
w("| director | " + " | ".join(shot_cols) + " |")
w("|---|" + "---|" * len(shot_cols))
for k, d in dirs.items():
    w(f"| **{d['name']}** | " + " | ".join(str(d["shot"][c]) for c in shot_cols) + " |")

w("\n### Light, look and sound per director\n")
w("| director | light band / direction | exposure | contrast | saturation | warmth | blacks | voice | music | silence |")
w("|---|---|---|---|---|---|---|---|---|---|")
for k, d in dirs.items():
    s, L, lk, sd = d["shot"], d["shot"]["light"], d["shot"]["look"], d["shot"]["sound"]
    w(f"| **{d['name']}** | {L['band']} / {L['direction']} | {lk['exposure']} | {lk['contrast']} | {lk['saturation']} | {lk['warmth']} | {lk['blacks']} | {sd['voice']} | {sd['music']} | {sd['silence']} |")

w("\n### How each builds a sequence\n")
seq_cols = ["ladder", "rhythm", "motif", "act_shape", "key_instant", "colour_arc", "sound_arc"]
w("| director | " + " | ".join(seq_cols) + " |")
w("|---|" + "---|" * len(seq_cols))
for k, d in dirs.items():
    w(f"| **{d['name']}** | " + " | ".join(d["sequence"][c] for c in seq_cols) + " |")

w("\n### Signature, and where each fits our film\n")
for k, d in dirs.items():
    w(f"\n**{d['name']}** (`{k}`) — {d['signature']}\n")
    w("- For us: " + "; ".join(d["for_us"]) + ".")
    w("- Avoid: " + "; ".join(d["avoid"]) + ".")

w("\n## Sequence patterns\n")
for k, p in seqs.items():
    w(f"\n### {k.replace('_', ' ')}\n")
    w(f"{p['what']} From: {', '.join(p['from'])}. Key instant: `{p['key_instant']}`. Rhythm: `{p['rhythm']}`. Used in: {p['used_in']}.\n")
    w("| # | rung | time | duration | cut in | does |")
    w("|---|---|---|---|---|---|")
    for i, b in enumerate(p["beats"], 1):
        w(f"| {i} | {b['rung']} | {b['time']} | {b['duration']} | {b['cut_in']} | {b['does']} |")

w("\n## How the tool uses this\n")
w("- A take in `cameras.json` or a row in the shot file may carry `\"style\": \"<director>\"`; a strategy may carry one for the whole film or per act. "
  "The row's values fill every dimension the row does not set itself. Precedence: strategy < style < take < row.")
w("- A strategy's acts are lists of sequence patterns; the compiler expands each beat into a shot row from the site's moments and the camera library, then `check` runs.")
w("- The proposer offers each claim in up to three styles on one sheet; the pick is recorded as a weight on that style for that pattern, so the next film asks less.")
w("- Dimensions whose `lands in` says *not in the tool yet* (look, music, colour arc, sound arc) are recorded in the shot file now and applied when the look step and the finish stage exist. Until then they change nothing.")
(H / "FILM_LANGUAGE.md").write_text("\n".join(out) + "\n")
print("wrote", H / "FILM_LANGUAGE.md", len(out), "lines")
