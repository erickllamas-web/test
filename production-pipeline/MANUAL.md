# Production pipeline — manual of use

Version of 18 October 2026. Everything here was run end to end on the clips of `production_examples.zip`; the parts
that need the renderer, the celestial daemon or the Drive were run with stand-ins and say so below.

## 1. What this is, in one paragraph

A film is a data file. One **shot file** describes every shot; everything else is generated from it: frame lists,
scenes, checks, storyboard stills, the queue, the cut, the voice timings, the master, the archive. Above the shot file
sits a **strategy** (a story template) that, with a site's days and the libraries, writes the shot file itself. Under
it sit the **tables**: the film language (dimensions, directors, sequence patterns, the edit), the camera and moments
libraries, the look, the delivery profiles. The renderer and the daemon are never touched: they are the calculations;
this is the pipeline that turns their output into a film of the highest quality the data allows, and proves it.

The one habit that makes it work: every stage ends with files and one question. You answer the question, the next stage
runs. Nothing is hand-built twice.

## 2. Install

On the laptop (or any machine with node ≥ 18, ffmpeg, python3):

```bash
unzip production-pipeline.zip -d ~/agents/a-production/     # -> ~/agents/a-production/production-pipeline
cd ~/agents/a-production/production-pipeline && chmod +x bin/pipe render/queue/q archive/archive.sh
export PATH="$PWD/bin:$PATH"                                   # put this in .bashrc
export ST=/home/erick/projects/maths/discrete_calculus/bots/babel/productions/stonehenge
export FFMPEG=/home/erick/.local/bin/ffmpeg FFPROBE=/home/erick/.local/bin/ffprobe   # the static build; the finish stage checks it for libx265/prores/drawtext
pipe stages
```

Optional: `RENDER_QUEUE` (default `~/.local/share/render-queue`), `FRAME_CACHE` (default `~/.cache/frame-cache`, on
disk, never /tmp), `FLOOR_GB` (default 7, the disk floor every worker respects).

Two files are copies of the desk's own libraries and must be kept in step with them: `director/lib/cameras.json` and
`director/lib/moments.json` (from `a-production/film/shotfile/`). The desk's `shots.js` stays where it is and is still
the tool that solves moments, makes lists, builds scenes, runs `check` and renders stills.

## 3. The map

```
bin/pipe                   one command for every stage (pipe stages)
film-language/             the tables: dimensions.json, directors.json, sequences.json, editing.json; make_doc.py -> FILM_LANGUAGE.md
director/                  strategy.js (compile), propose.js (briefs), strategies/*.json, sites/<site>.days.json, lib/{cameras,moments}.json, out/
look/                      look.js, look.json (the display transform and the exposure policy)
render/                    manifest.js (frame identity, clip manifests, cache); queue/q (the queue), queue/bundle.js (jobs from a frame list)
editor/                    edit.js (metrics, edl, render, check, compare, otio, chapters, qc, dailies), learn.js, films/, examples/
finish/                    finish.js (sound, titles, captions, poster, master, encodes), profiles.json, sound.example.json
archive/archive.sh         the film's proof in one folder (+ Drive)
PIPELINE_v3_thinking.md    the assessment and the design this implements
```

## 4. The order of work, one film

| # | stage | where | command | ends with | your gate |
|---|---|---|---|---|---|
| 1 | tables | anywhere | `pipe language` | `FILM_LANGUAGE.md` regenerated | — |
| 2 | strategy | anywhere | `pipe strategies` · `pipe compile the_proof --site stonehenge` | `director/out/<TITLE>.shots.json` + `_script.md` | "that's the film" |
| 3 | propose (optional) | anywhere | `pipe propose FILM.json SHOT_ID` | `propose_<id>.md`: the shot three ways | your pick (`pipe answer BRIEF --pick N`) |
| 4 | lists, scenes, checks, stills | **laptop** | `node shots.js FILM.json lists` · `scene` · `check` · `stills` | frame lists with the daemon's light; `<title>_checks.md`; the storyboard sheet | "these frames" |
| 5 | critic (optional) | anywhere | `pipe critic FILM.json --stills DIR` | `critic_<title>.md`: the grammar as questions per still | — |
| 6 | exposure policy | anywhere | `pipe exposure smooth film_x/<shot>/frames.tsv` | a frame list with `EXPOSURE=` in column 16 | your ruling; calibrate first (§9) |
| 7 | identity | anywhere | `pipe hash FRAMES.tsv --settings GO.sh --bin BIN --scene S.json --libs a.so,b.so --size 1920x1080 --fov 12` | `frames.hash.tsv` | — |
| 8 | render | **laptop** | `pipe bundle FRAMES.tsv … --n 48` → `pipe q add JOB.sh --needs cloudy` × N → `pipe q worker laptop --wait` | frames in the cache; `<shot>_assemble.sh OUTDIR` makes the clip | — |
| 9 | proof | **laptop** | `pipe manifest clip CLIP.mp4 --frames … --png-dir … (same env flags)` · `pipe verify MANIFEST` | `<clip>.manifest.json` | — |
| 10 | look (when float frames exist) | anywhere | `pipe look apply neutral IN OUT` | frames + `look.json` sidecar | your ruling for any look but neutral |
| 11 | edit | anywhere | `pipe edit FILM.json metrics\|edl\|render\|check --clips DIR --work W` | `<title>_edl.json`, `_cut.mp4`, `_check_edit.md`, `_voice.srt` | "picture lock" |
| 12 | compare and learn | anywhere | `pipe edit FILM.json compare N …` · `pipe learn record compare_N.json --pick A\|B` | side-by-side mp4 + sheet; the pick on file | your pick |
| 13 | qc and dailies | anywhere | `pipe edit FILM.json qc\|dailies --clips DIR` | `<title>_qc.md`; `dailies/index.html` | shot by shot ok |
| 14 | finish | anywhere | `pipe finish FILM.json master --edl E --cut C --sound W/sound.json --profiles mezzanine,youtube,preview` | `master/`: `_master.mov`, `_youtube.mp4`, `_preview.mp4`, `.srt`, `_chapters.txt`, `_poster.png`, `_master.json` | "release" |
| 15 | archive | **laptop** | `pipe archive FILM.json W OUT --drive "Working files/A-PRODUCTION/Archive"` | one folder, `INDEX.md` with every sha | — |

"Anywhere" means any machine with the clips and node + ffmpeg. "Laptop" means the renderer, the daemon
(`/tmp/celestial.sock`) or the Drive tool is needed.

### 4.1 Compile a film from a strategy

```bash
pipe compile the_proof --site stonehenge                     # the two alignment proofs, 12 shots, 2 min 6 s
pipe compile one_day,the_year --site stonehenge --title STONEHENGE_FULL   # script v3.1's shape, 23 shots, 5 min 12 s
pipe doc director/out/STONEHENGE_FULL.shots.json             # the table
```

The compiler writes light as `@moments` (e.g. `@sunrise_half+4m`), cameras as takes with overrides, the style on each
row, dissolves at act changes and the match cut where a claim says `match_of`. It refuses to write if a take, a moment
or a style is not in the libraries, and names what is missing. The compiled file's ids for the proof claims are the
script v3.1 ids (`A_summer_top`, `A_summer_sw`, `V_window` …) so you can diff it against the hand-written shot file.

Edit a strategy in `director/strategies/`; edit the place-bound facts (days, scenes, lines) in
`director/sites/<site>.days.json`. A new site is a new days file, the same strategies.

### 4.2 Lists, scenes, checks, stills (the desk's tool)

Unchanged: `node a-production/film/shotfile/shots.js FILM.json lists` solves the `@moments` with the daemon and the
skyline, writes `film_<x>/<shot>/frames.tsv` (+ `fov`), links or builds scenes (`scene`), runs the pre-render `check`,
and `stills` makes the storyboard. The compiled shot file uses only fields `shots.js` already understands, plus
`style`, `key_instant`, `cut_rule`, `line`, which `shots.js` ignores and the editor reads.

### 4.3 Render through the queue

```bash
pipe bundle $ST/w14/film_s/A_summer_sw/frames.tsv --scene uploads_s/A_summer_sw.json --fov 12 --size 1920x1080 \
     --settings $ST/w14/film_1080f/GO.sh --bin $ST/w8/bin/site_render_s119 --libs <libs from GO.sh> --n 48
for j in $ST/w14/film_s/A_summer_sw/jobs/A_summer_sw_b*.sh; do pipe q add $j --needs clear; done
pipe q worker laptop --wait            # in its own terminal or a systemd unit; add a second worker on a GPU box with the same queue dir shared
pipe q status                          # queued / running / done / failed, ages, who took what
$ST/w14/film_s/A_summer_sw/jobs/A_summer_sw_assemble.sh $ST/w14/s_1080/A_summer_sw     # frames from the cache -> the clip
```

A bundle job renders only the lines whose identity is not already in the cache, through the desk's own `w23/frame.sh`
with GO.sh as it is, and puts each new frame into the cache. A frame is rendered once, ever: a re-render after a
settings change is exactly the frames whose identity changed. The queue claims jobs atomically (`mv`), one worker per
machine, with one disk floor; `q stop` lets workers finish their job and exit; `q retry` re-queues a failed job.
`stonehenge-render.service` can be repointed to `q worker laptop --wait`.

Until the queue is adopted, `run_film.sh` and the recipes keep working unchanged; the manifest and the editor take
their clips as they are.

### 4.4 The proof of a clip

```bash
pipe manifest clip $ST/w14/s_1080/A_summer_sw.mp4 --frames $ST/w14/film_s/A_summer_sw/frames.tsv --png-dir $ST/w14/s_1080/A_summer_sw \
     --settings $ST/w14/film_1080f/GO.sh --bin $ST/w8/bin/site_render_s119 --scene $ST/w14/uploads_s/A_summer_sw.json --libs … --size 1920x1080 --fov 12
pipe verify A_summer_sw.manifest.json --png-dir …     # PNG shas still match; prints the three frames to re-render for the byte test (T10)
```

The manifest holds the identity of every frame, the sha of every PNG, the clip's sha, the resolved settings
fingerprint (every `export` of GO.sh, last wins), the binary and library shas, the scene sha, the ffmpeg arguments and
the renderer's timings. Keep it next to the clip; `drive put` both.

### 4.5 The edit

```bash
W=~/agents/a-production/films/<TITLE>; CLIPS=$ST/w14/s_1080     # clips are found as <CLIPS>/<id>.mp4, else the row's camera.path
pipe edit FILM.json metrics --clips $CLIPS --work $W
pipe edit FILM.json edl     --clips $CLIPS --work $W            # prints every event: in/out frame, rule, transition, key instant
pipe edit FILM.json render  --work $W
pipe edit FILM.json check   --clips $CLIPS --work $W            # exit 1 on FAIL; the report names the cut by shot ids and frames
pipe edit FILM.json compare 5 --clips $CLIPS --work $W          # the cut into event 5 two ways -> compare_5.mp4 / .png / .json
pipe learn record $W/compare_5.json --pick A --note "…"         # your pick, recorded in editing.json with both candidates' numbers
pipe edit FILM.json otio --work $W; pipe edit FILM.json chapters --work $W
pipe edit FILM.json qc --clips $CLIPS --work $W; pipe edit FILM.json dailies --clips $CLIPS --work $W
```

What the editor decides and from what is in `editor/README.md`. The rules and thresholds are in
`film-language/editing.json`; change them there, never in the code. `--lists DIR` (the folder with the frame lists)
turns on the eye-trace and match-position tests, which need the body's position per frame.

### 4.6 The finish

```bash
cp finish/sound.example.json $W/sound.json      # fill in: voice_dir or tts_cmd, music cues per act, titles
mkdir -p $W/voice $W/music                       # <voice>/<shot id>.wav per line (your engine); music files per cue
pipe finish FILM.json master --edl $W/<TITLE>_edl.json --cut $W/<TITLE>_cut.mp4 --sound $W/sound.json --work $W --profiles mezzanine,youtube,preview
```

Makes: the title cards (drawtext; black cards with a note if the ffmpeg lacks it), the mix (voice at its J-cut time,
music per act with fades and a duck under each line, optional ambience), two-pass loudness to −14 LUFS / −1 dBTP, the
captions SRT with the real voice lengths, the chapters, the poster frame (the climax shot's key instant), and the
encodes: ProRes 422 HQ master (FFV1 if ProRes is missing), HEVC Main10 for YouTube (H.264 if libx265 is missing), a
720p preview. `<TITLE>_master.json` records every input's sha, the encoders used, the loudness measured, and every
note. Read the notes: a silent track or a missing music file is reported, never hidden.

### 4.7 Archive

`pipe archive FILM.json $W ~/archive --drive "Working files/A-PRODUCTION/Archive"` collects the shot file, the EDL and
checks, the master manifest, every clip manifest, the masters, the libraries at this revision, and (with `GO_SH=…`)
the resolved settings, into one dated folder with an `INDEX.md` of shas; with `--drive` each file goes through
`drive put`.

## 5. The tables, and how to change them

| table | file | holds | change it when |
|---|---|---|---|
| dimensions | `film-language/dimensions.json` | every property of a shot or sequence, its values, the shot-file field it lands in | a new property is needed (add it with its `maps_to`, or "not in the tool yet") |
| directors | `film-language/directors.json` | one value per dimension for twelve directors; `for_us`, `avoid` | you disagree with a row, or a fourth way appears in a propose answer |
| sequences | `film-language/sequences.json` | ten sequence patterns as beats | a new way to build a sequence |
| the edit | `film-language/editing.json` | transitions and when, cut-point rules, Murch's weights, `check_edit` thresholds, the EDL format, the picks | a threshold is wrong (write the picks that moved it), a transition rule changes |
| strategies | `director/strategies/*.json` | story templates: beats, claims, spans, ids, voice | a new film shape |
| site days | `director/sites/<site>.days.json` | the days, scenes, season lists and lines of a place | a new site, a new day |
| cameras, moments | `director/lib/*.json` | copies of the desk's libraries | keep in step with `a-production/film/shotfile/` |
| look | `look/look.json` | the display transforms and their rulings; the exposure policy table | after the calibration (§9); after a ruling |
| profiles | `finish/profiles.json` | the delivery encodes and the loudness target | a new deliverable |
| sound | `<work>/sound.json` per film | voice source, music cues, titles | per film |

After any change to the four film-language tables: `pipe language` regenerates `FILM_LANGUAGE.md`.

## 6. File formats

**Shot file** (`shots.js` schema, plus the editor's fields): `title`, `work`, `film {filmdir, out, uploads}`,
`shots[]` with `id, act, rung, seconds, handles, frames, camera {kind: take|axis|top|locked|line|contrast|list|clip,
…}, lens, scene, season_from, world, light {day, from, to, held, kind}, cut (cut|dissolve|match:<id>|dip), voice,
proves, claim {in_frame, bearing}, contrast_of, in` and the new `style` (a directors.json id), `key_instant`
("HH:MM:SS" on the light span; the editor maps it to a frame), `cut_rule {in, out}`, `line: "crossing"`.

**EDL** (`<title>_edl.json`): `events[]` with `n, shot_id, act, rung, style, clip, in_frame, out_frame, frames,
seconds, cut_rule, in_window, out_window, transition_in, transition_s, transition_by (row|context), pair, start_s,
key_instant_s, sound {voice_start_s, voice_est_s, voice}`; `runtime_s`, `fade_out_s`.

**Manifest** (`<clip>.manifest.json`): `clip_sha, frames_tsv_sha, env {size, fov, settings_fingerprint, bin_sha,
libs[], scene_sha}, frames[] {i, id, line_sha, png, png_sha}, timing_ms, distinct_identities`.

**Compare** (`compare_N.json`): `cut, A {out, in, transition, rule}, B {…}, video, sheet`. **Pick** (in
`editing.json` → `learning.picks[]`): the compare plus `pick, note, date`.

## 7. Working with A-PRODUCTION

The agent runs the stages marked "anywhere" and "laptop" unattended in this order: compile → lists/scene/check/stills
→ (your gate) → bundle/queue/worker → manifest → edl/render/check → compare → dailies → (your gate) → finish →
archive. It asks you only at the gates, each with one line `APPROVE: …`. The briefs from `propose` and `critic` are
written for it to answer or for you; the answer is recorded next to the brief (`pipe answer BRIEF.md --pick N`). It
never edits GO.sh, the renderer, or a table on its own: a table change is your word, written with the words.

## 8. Troubleshooting

- `compile` refuses to write: it names the missing take, moment or style; add it to the library or fix the name.
- `edl`: a clip is "missing": the editor looks for `<clips>/<id>.mp4`, then the row's `camera.path`; black in the cut and a FAIL in `check` until it exists.
- `render` fails on xfade: every segment is set to one timebase (`settb=AVTB`); if an exotic clip still fails, re-encode it to 24 fps constant.
- `check` FAILs on `voice_silent_at_instant`: shorten the line or move it after the instant; voice lengths are estimates (150 wpm) until the voice exists, then `finish` measures them.
- `finish` notes "no drawtext": the static ffmpeg lacks it; cards come out black. Either set `FFMPEG` to a build with drawtext for the finish only, or render the cards once elsewhere and drop them in `master/`.
- `finish` notes "silent": no voice files and no `tts_cmd`; the loudness pass is skipped on purpose.
- `q worker` says "disk under the floor": free space or lower `FLOOR_GB` on his word; nothing is deleted by the tools.
- A worker died mid-job: the job stays in `running/`; move it back with `mv $Q/running/<id>.{job,meta} $Q/queue/` (the bundle is re-runnable; the cache keeps what it finished).
- `manifest` warns the binary or scene is not found: fine on a machine without them; the proof needs the shas, so run it on the laptop.

## 9. Not done yet, and calibrations that need the laptop

1. **Exposure calibration.** `look.json` holds a placeholder table from Sun altitude to the renderer's `EXPOSURE`. Render `A_axis_5s` with `EXPOSURE` fixed at three values, compare mean luma with `EXPOSE=auto`'s, fill the table. Until then `pipe exposure smooth` writes numbers that are not calibrated; `auto` is byte-identical.
2. **Float or 16-bit output** from the renderer (your ruling). The look step and the 10-bit master are built for it; today they take 8-bit frames.
3. **Looks other than neutral** need your words in `look.json`.
4. **A voice engine** (`tts_cmd` or files) and **music** (files, licence) for the finish.
5. **The frame lists** for the eye-trace and match-position tests (`--lists`).
6. **The proposer and critic answered by a model**: today they are briefs; A-PRODUCTION can answer them as it answers anything else.
7. **The byte test (T10)** needs the laptop: `verify` prints the three frames; render them with `frame.sh` under the recorded env and compare.
8. **Learning**: thresholds move only by hand, from `pipe learn suggest`, after five picks on one context.
