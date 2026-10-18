# A top-shelf video production pipeline — thinking notes, 18 Oct 2026

Read for this: `production_pipeline.zip` (the whole `a-production` tree: CLAUDE/RULES/NOTES, the five study files,
protocol v1.2, pipeline v2, directing grammar v1.1, script v3.1, voice v1, the shot-file tool `shots.js` with
`site.json`, `world.json`, `cameras.json`, `moments.js/json`, the recipes, the job logs, the control results) and
`production_examples.zip` (the six A_ clips, the 5 s alignment, the compare clip, the contrast sheets, the camera
library sheets). Numbers below marked *measured* were measured on those files today; nothing else is new data.

---

## 1. What you already have (it is more than most studios)

- **A frame is a pure function of its line.** S8w frame independence (`SKY_PLANET_GLOBES=0 SKY_EXACT_KEYS=1`),
  proven byte-identical. This is the single most valuable property a pipeline can have: it makes caching,
  distribution across machines, resume after a crash, and byte-for-byte re-render of any one frame all free.
  Studios spend years trying to get this and rarely do.
- **A film is a data file.** `shots.js` already turns one JSON into frame lists, scenes, pre-render checks,
  stills, a queue, the cut, the SRT and the script table. The libraries behind it are the right nouns:
  `site` (the place), `world` (sky, ground, trees, season), `cameras` (23 takes with "best for / avoid"),
  `moments` (named instants solved from the daemon and the measured skyline).
- **Claims are tested before pixels.** `check` tests body-in-frame, body-up, the −11° data edge and the bearing
  window on the lists. The 17 Oct run caught V_plain and V_return crossing the data edge before a frame was spent.
- **Every change has a control**, and the controls are run: lists 11/11 byte-identical, scene byte-identical to
  `uploads_i/7_sunrise.json`, clouds_day A/B identical on held frames, moments to 0.1 s.
- **A grammar the tool enforces**: ladder per act, hold-move-hold, one claim per shot, contrast pairs, match cuts,
  voice leads by 0.5 s.
- **Provenance to the line.** PROVENANCE.md with D1–D100b and S4.1–S9z, every ruling in your words.

The backbone is right. What follows is what stands between it and top shelf, in order of how much screen it hits.

---

## 2. What I measured in the example clips

### 2.1 Exposure stability (the renderer auto-exposes every frame on its own: `EXPOSE=auto`, Reinhard key 0.18)

Mean luma Y (0–255) per frame from the delivered MP4s, and the largest frame-to-frame step.

| clip | frames | Y range | median step | max step | steps > 1 level |
|---|---|---|---|---|---|
| A_summer_top | 288 | 100.5–111.4 | 0.04 | 0.23 | 0 |
| A_summer_sw | 336 | 114.2–120.3 | 0.02 | 0.09 | 0 |
| A_winter_top | 288 | 105.7–107.9 | 0.02 | 0.24 | 0 |
| A_winter_ne | 288 | 89.3–98.4 | 0.03 | 0.10 | 0 |
| A_autumn_set | 240 | 108.0–115.3 | 0.03 | 0.05 | 0 |
| STONEHENGE_alignment_5s_v1 | 120 | 107.4–125.3 | 0.11 | 1.48 | 2 (frames 99, 105) |
| A_station_moon | 336 | 25.9–45.4 | 0.07 | 1.95 | 12 (frames 307–322) |

Reading: the daytime time-lapses are steady. The pumping happens exactly where the film lives: when the Sun enters
the slot (5 s clip, frames 99 and 105) and when the Moon sets (station shot, the last 30 frames). Per-frame auto
exposure reacts to the body itself. At 4K on a big screen a 1.5–2 level jump between consecutive frames reads as
a flicker at the climax.

### 2.2 Banding in the sky (8-bit PPM → PNG → x264 crf 18, 8-bit 4:2:0)

*Measured* on one scanline of the night sky in A_station_moon's last frame (y = 300, x = 100…800): the luma runs
in flat bands 40–76 pixels wide, stepping 1–2 levels and skipping levels (10, 11, 13, 15, 17, 18, 20, 22, 24 …).
Those are the concentric rings visible around the Moon's glow in the frame. The dusk and dawn skies — the film's
subject — are the worst case for 8 bits; the day skies above the lintels hold up (9 levels over a 2-level sweep,
dithered).

### 2.3 What the pictures show (looked at, not measured)

- **Stone surfaces** are a flat speckle at every distance; the telephoto climax frames (12°, 8°, 6°) show it
  most. Your own storyboard v2 note says it: "smooth blotches". Lintels and uprights are clean straight solids
  with no measured face relief, so at telephoto they read as boxes.
- **The overhead shots** are low in contrast: ground one brown-grey, shadows faint, the circle a pale ring. The
  four-day contrast sheets carry the proof but the eye has to work for it. (Part of this is the per-frame auto
  exposure flattening a frame that is mostly mid-grey ground.)
- **Night bodies**: with `SKY_PLANET_GLOBES=0` (set for frame independence) the planets draw as flat saturated
  red/blue discs, and the brightest one in the station shot's first seconds as a red cross with spikes. On a
  dark 1080p sky they read as markers, not bodies.
- **Ground** near the camera is one flat green; **trees** (where seen in the sb2 stills) read as rows of thin
  trunks. No river in any scene (D77 watercourses exist, not wired).
- **Edges** are hard and unfiltered (visible on the stone outlines from above); no motion blur, no supersampling
  I can see. Fine at 24 fps with slow moves; it will shimmer on fast moves and on 4K downscales.

None of this is a shader problem to "paint" away. Each is either data you do not hold yet (surface relief and
albedo of the stones, the ground's real texture) or a pipeline floor that is missing (bit depth, exposure policy,
resolution). That is good news: it is in your domain, not a taste argument.

---

## 3. What "top shelf" has to mean — as tests, for your yes/no

Written your way: measurable, no preference. Each is a check the tool runs on every clip before it is called done.

| # | test | pass |
|---|---|---|
| T1 | resolution and rate | 3840×2160, 24 fps (the master); 1080p is a derivative |
| T2 | bit depth | frames kept as float (or 16-bit) from the renderer to the grade; master 10-bit; no 8-bit step before the final encode |
| T3 | banding | in any pure-sky region, no flat run wider than 8 px at a 1-level step after the master encode |
| T4 | exposure continuity | frame-to-frame mean-luma step ≤ 0.3 level (of 255) inside a shot, except at a cut |
| T5 | temporal aliasing | edge shimmer below a measured threshold (rendered 2× and box-filtered, or the renderer's own AA); a short "pan over the circle" control shot defines the number |
| T6 | geometry and light | as today: every number from the daemon and the record; `check` passes (body in frame, data edge, bearing window) |
| T7 | surfaces | stones carry measured relief and albedo in every shot closer than the telephoto rung; where no data: "NOT APPLIED" and the shot is framed so it does not matter |
| T8 | grammar | hold–move–hold, one claim per shot, contrast after every overhead claim, match cuts as written — enforced by the tool |
| T9 | sound | voice at 48 kHz, mix −14 LUFS integrated, true peak ≤ −1 dBTP, voice leads 0.5 s, silent on the key instant |
| T10 | proof | every clip has a manifest; any frame re-rendered from its manifest is byte-identical |
| T11 | release | no asset under a licence that blocks release (today: the Pioneer Milky Way map) |
| T12 | operations | the laptop can reboot mid-film and the film continues; frames never live on the desk disk; one queue |

If you say yes to this table, it becomes `tests` in the shot file and `check` grows to cover it.

---

## 4. The gaps, ranked by screen time they hit

1. **Surfaces (T7).** The climax is telephoto on the stones. This needs data: Historic England's 2011 laser scan
   (faces to millimetres) is the source your record already names (D62 Q4). Without it, the answer is framing:
   keep the telephoto rungs where the Sun is the subject and the stone is a silhouette (which is where they
   already work best — A_summer_sw and A_winter_ne read well because the stones are dark against the sky).
2. **Bit depth and the colour path (T2, T3).** Today the renderer writes 8-bit PPM and the exposure is baked in.
   The fix is one renderer flag — float or 16-bit output (PPM carries maxval 65535 if the writer allows it;
   otherwise PFM/EXR) — then a deterministic `look` step outside the renderer that applies the film's exposure
   and tone curve once, recorded, and writes 16-bit frames. The renderer change is yours to rule on; it is more
   accurate, not less (the radiance stays as computed).
3. **Exposure policy (T4).** Needs no renderer change: `EXPOSURE` is a readable env and column 16 takes per-line
   settings. The shot file gets an `exposure` field — `fixed` (one value from the shot's median frame) or
   `smooth` (a curve from the daemon's Sun altitude) — and `lists` writes `EXPOSURE=…` into column 16. Control:
   field absent = byte-identical to today.
4. **Night bodies.** Planet globes are off for frame independence; the brightest bodies draw as glyphs. Worth
   asking the renderer: can a globe be drawn from the line's own instant (it is a function of time, so frame
   independence holds)? If not, a measured disc size with limb shading at the body's true angular size is the
   honest fallback (`SKY_TRUE_SIZE` already does this for the Sun and Moon).
5. **Resolution and compute (T1).** *Measured* on the laptop: 4.4–15 s a 1080p frame; 4K is ~4×. Script v3.1 is
   ≈ 5 min 40 s = 8,160 frames: roughly 11–34 h at 1080p and 45–136 h at 4K on this box, before re-renders.
   The iPad lane does only the clouds (8.8 s there vs 22 s here), moves ~96 MB a frame with 35–70 s round trips,
   and has refused the turbulence field since 15 Oct 21:32 (409 "already held"): every pipe frame since then was
   local. A discrete GPU in a box that is not also your desk is the only thing that changes the arithmetic. The
   honest number is a measured one: an hour on a rented GPU machine running the f64-oracle control first.
6. **Infrastructure (T12).** 97 % full disk with a 6 GB floor, /tmp is RAM, one iGPU shared with the display
   losing contexts, four hand-started drivers with different disk floors (7/8/12 GB), a systemd service that
   relaunches an old queue, `pkill -f` incidents. The last three days of NOTES.md are mostly disk and pipe.
7. **Proof (T10).** The film's proof is said to be shot file + settings + record, but GO.sh changes under running
   renders, scenes have been rebuilt without a byte control, and uploads folders were trashed. A manifest per
   clip closes this.
8. **The finishing stages** do not exist yet: voice synthesis from the SRT, music, mix, titles, captions, chapters,
   a mezzanine master, the YouTube encode. All are generated from the shot file; none is written.
9. **Review.** Dailies today are the clip in the Drive plus a line in chat. Enough for now; a dailies page per clip
   (clip, three stills, the check table, the luma trace, the manifest) costs little and makes the gate real.

---

## 5. The pipeline, v3 — what I would build

Same rule as yours: solve it once, generally. Stonehenge is case 1; the pyramids are a new `site.json`.
Zero dependencies beyond what is already there (bash, node, ffmpeg, the renderer). Nothing hand-built twice.

### 5.1 Layers

```
 FILM (data)      shots.json  +  site.json  world.json  cameras.json  moments.json  +  look.json  sound.json
      │ shots.js: lists · scene · check
 COMPILE          frames.tsv per shot  +  frame identity (hash)  +  job bundles
      │ queue
 FARM             workers pull bundles → render float/16-bit frames → push frame + sidecar      (laptop = desk, not farm)
      │ cache by frame hash: a frame is rendered once, ever, anywhere
 IMAGE            look (exposure/tone, once per film) → 16-bit frames → mezzanine clip per shot
      │
 FINISH           edit (cut list) · voice (TTS from SRT) · music · mix · titles · captions · chapters · master · YouTube encode
      │
 REVIEW           dailies page per clip → Drive → APPROVE line on your phone
      │
 ARCHIVE          clip + manifest + shot file revision + GO.sh resolved + binary/lib hashes → the film's proof
```

### 5.2 The pieces that are new

**Frame identity.** `hash = sha256(line columns 2–16 ‖ W×H×fov ‖ resolved GO.sh exports ‖ sha(binary) ‖ sha(GPU libs)
‖ sha(scene JSON))`. The cache is a folder keyed by hash. `lists` writes the hash next to each line; the queue skips
frames already in the cache; a held frame is one render for the whole film, not one per run; a re-render after a
settings change is exactly the frames whose hash changed. This replaces run_film's "PNG exists and decodes" with
something that also knows *which* settings made the PNG.

**Job bundles and workers.** You already proved the frame bundle (S8x: "a json for a certain range and then print
the pages from that json"). A job is a bundle of N lines + the scene reference. Workers (this laptop, a GPU box,
later the iPad for the passes it can do) pull the next bundle from one queue directory, render, write frames and a
sidecar, push back. The scheduler is a few hundred lines of bash/node; `run_film.sh` becomes one worker. The
`stonehenge-render.service` you wanted repointed becomes the queue runner. One disk floor, in one place.

**The look step.** Renderer writes float/16-bit. `look.json` per film holds: the exposure policy (fixed, smooth,
or auto-with-a-time-constant), the tone curve name, the output transform (Rec.709 now; PQ later if you want HDR).
`look` is deterministic and recorded; the same frames with a different look are a different manifest, never a
re-render.

**Manifests.** One JSON per clip: shot-file row (verbatim), hash of the shot file at that revision, frame hashes,
binary and library hashes, resolved settings, scene hash, look, ffmpeg arguments, timings, the check row, the luma
trace. `drive put` sends the clip and the manifest together. T10 is a test that re-renders three random frames
from the manifest and compares bytes.

**Finish.** `shots.js master`: voice from the SRT through the chosen TTS (your choice of engine), music cue sheet
from the shot file's acts, loudness-normalised mix, captions, chapters from the acts, titles from the film block,
the mezzanine (ProRes 422 HQ or lossless FFV1, 10-bit) and the YouTube encode (HEVC Main10 4K at ~50–80 Mbit/s,
or VP9 10-bit). Needs a check that the static ffmpeg build carries libx265/prores; if not, that is the one tool to add.

**Dailies.** `shots.js dailies <shot>`: one HTML with the clip, three stills (start, key instant, end), the check
row, the luma plot, the manifest summary, into the Drive with one line in chat and the `APPROVE:` line.

### 5.3 What stays exactly as it is

The renderer and GO.sh as the single settings file (your rule); the daemon as the only source of light; the
scene chain; the libraries; the grammar; the gates; the Drive as the delivery; the record.

### 5.4 The iPad

Lend is a product on its own and a fine demo. As a render farm for this film it carries one pass, over a relay,
with a bug that has had it silently local for three days. My recommendation: take it out of the production path
now, keep `pipe_render.sh` for the demo, and bring the iPad back as a worker when the queue exists and Lend's
transport is finished — then it plugs in like any other worker, by the same bundle protocol.

---

## 6. Order of work (what I would do first, with the gate each needs)

| # | work | size | gate |
|---|---|---|---|
| 1 | Lock the top-shelf tests (§3) into the shot file; `check` reports T4 and T3 on every clip from the existing MP4s | half a day | your yes to the table |
| 2 | Exposure policy via column 16 (`exposure: fixed/smooth`); control: absent = byte-identical; re-render only A_station_moon and A_axis_5s to see T4 pass | one day + ~1 h render | your yes |
| 3 | Frame identity + manifests + cache; `drive put` sends clip + manifest | two days | — |
| 4 | Queue + worker; `run_film.sh` becomes a worker; the service repointed; one disk floor | two or three days | your yes to touch the service |
| 5 | Compute: one measured hour on a rented GPU box running the oracle control and 20 frames of A_summer_sw at 4K; then decide buy/rent/stay | one evening + the rental | your decision |
| 6 | Float/16-bit output from the renderer + `look`; master encode chain; T2/T3 pass | renderer: yours; the rest two days | your ruling on the renderer flag |
| 7 | Stone surfaces: the data question (HE 2011 scan or framing rule) | — | yours |
| 8 | Finish: TTS, music, mix, captions, chapters, titles, master | three days | voice engine and music choice |
| 9 | Dailies page; archive | one day | — |

Nothing in 1–4 touches the renderer or the look of a frame; all of it makes the next render cheaper and provable.
Step 5 decides whether 4K is this month or this year.

---

## 7. Decisions only you can make

1. The definition in §3 — yes, or edit it.
2. Exposure: fixed per shot, or a smooth curve, or keep auto (and accept the pumping at the key instants).
3. The renderer: a float/16-bit output flag (yours to build or to refuse).
4. Compute: rent an hour to measure, buy a GPU box, or stay on the laptop at 1080p.
5. The iPad: out of the production path until the queue exists, or keep it in.
6. The planets at night: globes from the line's instant, measured discs, or leave as is.
7. Stone faces: pursue the 2011 scan, or frame around it.
8. Voice engine and music source (licence).
9. The open ones already on the record: the Milky Way map licence (blocks any night release), the Moon year,
   the river, the ditch rows.

---

*Files looked at are listed at the top. Measurements: ffprobe `signalstats` YAVG per frame; luma runs from a
grayscale scanline of the decoded frame. The clips were measured as delivered (after x264), which is what a viewer sees.*
