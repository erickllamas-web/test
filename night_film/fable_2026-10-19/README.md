# The night film: seam pass, 2026-10-19

Patches against commit a69bc45f of `discrete_calculus_rust` (plus the pack's `sky.rs`
working copy, which is untouched), measured on the 2026-10-18 pack. Nothing here
was built: the film crate does not build stand-alone from the pack, so the Rust
and shell changes are patches with their checks done on the shipped sidecars and
on a port of the director that reproduces them frame for frame. The player
change was run in headless Chromium against the real sidecars.

Every number below is from a script in `tools/`; the raw outputs are in `results/`.

## What is wrong today, measured

| Seam | Measured on the pack | Where |
|---|---|---|
| The sky moves in steps | Film: 711 of 1,199 frame transitions in the animation act show no sky motion (59%); the same sample is held up to 7 frames, 6 at a stretch through all of twilight. Night pass: 1,080 of 1,799 (60%), 2–3 frames each. When it moves it jumps 0.524° = 5.7 px at the 4K centre, one Sun diameter at sunset. | `results/predict.out`, from `film.json` / `night/film.json` |
| Sunset gradient bands | f608 sunset crop, 1:1: 43 blue levels in a 960 px column, bands median 11 px, max 79 px. `SKY_DITHER` is never set by the baker, so the renderer's own TPDF dither is off. | `look/f608_sunset_crop_stretched.png` |
| Night-pass loop is a cut | Last → first frame: stars jump 16.75° in LST (182 px at the 4K centre); the camera's vertical velocity flips from −1.59°/frame to +1.59°/frame (6.5 altitude cycles). | `night/film.json` |
| Film loop is a cut | Last → first frame: Sun 65.6° → 52.7°, camera altitude 36.2° → 45.0°, LST back 15.7°. The film ends the next morning and restarts at the birth hour; no camera path closes that. | `film/film.json` |
| Sun switch dims | The two cuts cross-dissolve at half opacity over black: measured screen luminance drops to 76% mid-switch (50.9 → 38.6). The dissolve also starts before the destination has seeked, so the frame it was parked on shows first. | `results/before.txt`, `sun` |
| Rotate goes black | Both `<video>` elements get a new `src` at once; the screen is black until metadata arrives and the seek lands (at 4K over a network, hundreds of ms to seconds). | code, `applyShape` |
| Fly-to and drag flood the decoder | A fly-to writes `currentTime` on every animation frame (68 seeks in 1.1 s measured); a drag writes one per pointer move. A browser keeps only the last seek in flight, so at 4K most land as stalls. | `results/before.txt`, `fly`, `drag` |
| Start | The poster is the 12 s hero frame; playback starts at frame 0, so the first thing seen is a jump. The offline store also starts fetching ~200 MB of whole files during the first seconds of playback. | `bake_all.sh` (`-ss 12`), `installOffline` |

Also seen, not fixed here (a look decision): Venus at magnitude −5.5 renders in the night
pass as a hard-edged flat white ellipse ~20 px across at 4K (`NIGHTPASS_4k_f001000`,
right of centre), where stars get a glow and spikes. `SKY_MAG_HEADROOM=60` admits
Sirius unclipped; Venus is 43× brighter than Sirius and clips flat.

## The patches

### 1. Track density: `order_birthday_film.sh` (720 → 4320 samples)

**Fixes** the stepping sky, inside the honesty contract: a frame still shows one real
sample, there are just enough of them. 4320 is one sample per 20.9 s of real time.

**Check** (director port, `tools/predict.py`, verified to reproduce both shipped
sidecars with 0 sample mismatches and ≤0.0005° camera difference):

| samples | film: max hold / frozen transitions | night pass: max hold / frozen |
|---|---|---|
| 720 (today) | 7 frames / 711 of 1,199 (59%) | 3 / 1,080 of 1,799 (60%) |
| 1440 | 4 / 379 (32%) | 2 / 362 (20%) |
| 2160 | 3 / 216 (18%) | 1 / 0 |
| 4320 | 2 / 2 (0%) | 1 / 0 |

The two remaining 2-frame holds are at the slowest instants of twilight.
Verify on the next bake with `BIRTHDAY_SIDECAR_ONLY=1` (3 s) and the hold
histogram at the top of `tools/predict.py`.

**Cost:** no render change (same frame count). The track bake asks the daemon for
6× the samples; `track.json` grows from 282 KB to ~1.7 MB. Sidecars do not grow.

### 2. Dither: `examples/bake_birthday.rs` (`SKY_DITHER=1`)

**Fixes** the banding. Uses the renderer's existing TPDF dither switch (`sky.rs`
1652–1800), which is default-off, so every still product stays byte-identical
(rule 5). Set in `calibrate_for_this_film` next to the other film-only knobs.

**Check:** on a 1:1 crop of the next sunset frame the blue channel should show
≥200 distinct levels and no plateau longer than ~6 px where today it shows 43 levels
and 79 px plateaus (`tools/predict.py` has no image check; the one-liner used is in
the commit message of this folder's `look/` images: longest run of an identical value
down a star-free column).

**Cost:** unmeasured here. `sky.rs` S8m notes the dithered path once cost 4 s per
1080p frame on one thread before its optimisation; after it the per-pixel cost is a
few arithmetic operations. Read the render ms off the shard log on the next bake and
compare with today's ~110 s per 4K night frame.

### 3. The night-pass loop: `src/birthday.rs`

Two changes to the planetarium pass, which has to be re-rendered anyway (it stopped at
frame ~1000 of 1800 on 2026-09-28):

- **One sidereal day, not the whole lunar-day track.** `night_last` is the sample at
  which local sidereal time has advanced exactly 360° (sample 687 of 719 on the Pai
  track, residual −0.020° = 0.2 px at the 4K centre). The star field at the last frame
  is the star field at the first.
- **Seven altitude cycles at 65° amplitude** instead of 6.5 at 70°. A whole number of
  cycles makes the camera's vertical velocity continuous through the wrap; 1440° of
  azimuth is already four whole turns.

The sidecar gains `loop_closed` and `loop_lst_residual_deg`, which the player reads.

**Check** (`tools/predict.py` and `tools/grid7.py`, the seek-index scorer ported; it
reproduces the shipped sweep's published numbers exactly: 55 entries needing over 2×
zoom across the four shapes, 0 objects sent below a horizon they rose above):

| sweep (pan, base, amp, cycles) | objects framed | sent below horizon | needing >2× zoom (16:9 / 9:16 / 4:3 / 3:4) | free-look worst gap / median |
|---|---|---|---|---|
| 1440, 0, 70, 6.5 whole track (shipped) | 3,285 in every shape | 0 | 9 / 29 / 9 / 8 = 55 | 22.3° / 5.8° |
| 1440, 0, 70, 6.5 sidereal day | 3,285 | 1 star (9:16) | 16 / 37 / 12 / 12 | 22.3° / 5.8° |
| 1440, 0, 70, 7.0 sidereal day | 3,285 | 1 star (9:16) | 8 / 21 / 7 / 11 | 23.0° / 5.5° |
| **1440, 0, 65, 7.0 sidereal day** | **3,285** | **0** | **8 / 19 / 9 / 10 = 46** | **24.5° / 5.7°** |
| 1440, 0, 60, 7.0 sidereal day | 3,285 | 0 | 7 / 16 / 7 / 9 | 29.5° / 6.0° |
| 6.0 or 8.0 cycles, any amplitude | 3,285 | 0 | — | ≥ 49° |

Loop seam, before → after: stars 16.75° → 0.02°; camera velocity reversal → none;
the Moon 1.2° → **14.3°**. That last one is the honest residue of a sidereal loop: the
Moon moves ~13° a day against the stars. It is a 6 px disc jumping 156 px once a minute,
against a star field that no longer moves at all. See the open decisions.

**Cost:** none beyond the re-render that is already owed. The 67 minutes of track the
pass no longer shows (10:00–11:03 the next morning) repeat the start of the track in
everything but the Moon; the search index loses nothing (table above).

### 4. The player: `player/birthday/index.html`

One file, 207 changed lines, full copy in `player/`, diff in `patches/`. The bundler's
own comment strip, `node --check` and leak scan pass on it (`tools/bundle_check.sh`:
"stripped player parses: OK, leak scan: clean").

- **A veil.** One black sheet under the chrome whose alpha is driven from the video
  clock every frame. It lifts only once the first frame has been painted
  (`requestVideoFrameCallback`), so neither the poster-to-frame-0 jump nor a black
  element while a 4K first frame decodes is ever seen. At the loop of a cut whose
  sidecar does not say `loop_closed` it dips through black, 0.6 s out and 0.6 s in,
  fully dark 0.1 s before the wrap so the cut frame itself is never shown. Paused,
  flown or parked, it stays clear. The night pass from patch 3 carries
  `loop_closed:true` and gets no dip; today's night pass gets one.
- **Sun switch: seek, then fade in on top.** The destination is seeked first and the
  switch waits for its frame; then it fades in over the still-opaque source (a `top`
  class, not a DOM move: a re-inserted `<video>` reloads and flashes black). The
  overlay holds while the switch is in flight so no compass lands on the wrong sky.
- **Rotate: double-buffered.** The cut on screen is loaded on a second element
  behind it, parked on the same film-second, and swapped in only when that frame is
  decodable; the hidden cut follows the same way. The geometry changes in the same
  frame as the element. A second turn cancels a pending one; an 8 s timeout means a
  dead network can delay a swap but not wedge it. Peak is three decoders, briefly.
- **Seek discipline.** `seekTo` issues a new `currentTime` only when the last seek
  has landed and keeps the latest target; fly-to and the free-look drag go through it.
- **Offline store waits for the film.** The service worker still registers at boot;
  the whole-file fetches start after the playing cut's `canplaythrough` (or 20 s).

**Check**, headless Chromium, 375×667 phone viewport, the real sidecars, tenth-scale
stand-in cuts (so these measure the player's logic, not decoder load; the 4K numbers are
in the next section):

| seam | before | after |
|---|---|---|
| start | playback starts on the poster frame; first frame 0 appears as a jump | screen rises from black to full over 0.62 s after the first painted frame; no jump (`results/after.txt`, `start`) |
| Sun switch, screen luminance through the fade | 50.9 → **38.6** → 50.9 (a 24% blink) | 51.6 → 49.9 → 50.9 (no blink); destination seeked to the same sky sample before the fade |
| loop point | hard cut, film 56.94 s → 0.05 s | dark at the wrap, back to full by t = 0.60 s; same for the night pass |
| rotate 9:16 → 16:9 | both elements re-sourced; moment preserved | moment preserved (30.41 s → 32.92 s after 2.5 s of playback), no black sample, new element only shown once decodable |
| fly-to (Vega, 32 s away) | 68 seeks issued | 28 seeks issued, 27 frames presented; arrives at 37.254 s either way |

### 4K, under load

Same harness, 667×375 landscape viewport, 4K stand-in cuts (3840×2160, VP9 at 46 Mbit/s
with a moving marker and noise, decoded in software on 4 cores, so decode is slower than
a phone's hardware HEVC) behind a network shaped to 2.6× the file bitrate, the ratio of a
9 Mbit/s master on a 25 Mbit/s line. Screenshots at 4K are slow, so the timelines are
coarse (one sample per 300–600 ms); the counters are exact. `results/4k_before.txt`,
`results/4k_after2.txt`.

| seam | before | after |
|---|---|---|
| start | black → poster flashes at 0.49 s → **black again** (the element goes dark once it has metadata and no frame) → frame 0 appears as a jump at 2.1 s | black held by the veil until the first frame is painted (0.67 s here), then a 0.6 s rise to full; no poster, no jump |
| Sun switch | **a black sample right after the click** (luminance 2.9) while the destination still had no frame, then the dissolve | luminance flat at 49.8 through the whole switch; the old picture holds until the new cut has painted its frame, then fades in on top |
| fly-to to Vega | **124 seeks issued, 4 landed, 2 frames presented** in 1.9 s | 6 seeks issued, 4 landed, 4 frames presented; arrives at the same 37.254 s |

| rotate 16:9 → 9:16 | the film is re-sourced at once: **1.1 s frozen on the poster** (in the product that is the 12 s hero frame, so a different picture), then playback resumes at the same moment | the 16:9 film keeps playing while the 9:16 cut stages behind it; on this machine's software decoder the second 4K stream then **stalls the playing one** after ~2 s, and the swap had not completed within the 2 s window (`results/4k_rot_after2.txt`). A second turn cancels the pending swap cleanly. |

The rotate result is the one measurement that depends on the device rather than the
player: two 4K streams decoding at once is routine for a phone's or tablet's hardware
HEVC decoder and impossible for 4 CPU cores in software, which is all this container
has. The design (old cut stays up until the new one is decodable; the hidden cut waits
until the live one has buffered through; an 8 s timeout so a swap can never wedge) is
the right one for hardware decode, and it needs one check on a real phone and tablet
before it is called done: turn the device during the night pass and during the film and
confirm the picture never goes black or freezes for more than a frame. If a device
does stall, the fallback is the old single-element swap behind the veil (a dip through
black instead of a poster), which is a ten-line change in `applyShape`.

The drag scenario did not register in headless Chromium at 4K in either run (no pointer
capture under load), so there is no 4K number for it; the tiny-cut run shows it going
through the same one-seek-at-a-time path as fly-to.

## The usability pass (second round, same day)

Eight things, all in the player plus one new sidecar. Checked by `tools/ux_check.mjs`
in headless Chromium on a 375×667 phone with the real Pai sidecars; what each card
said is in `results/ux/ux.json`, screenshots next to it.

1. **Tapping names the Moon, the Sun and the planets**, not only stars. Needs
   `bodies.json`, written by the baker (`write_bodies` in `bake_birthday.rs`): per-sample
   Sun, Moon and planet positions straight from the track, plus the track's clock. 187 KB
   at 720 samples. `tools/make_bodies.py` builds the same file from a track for testing.
   A tap on Jupiter now says "Jupiter · Planet", on the Moon "43% lit and waning at this
   moment".
2. **The card speaks first, numbers after.** Sirius now reads: "The brightest star of
   the night sky. A white star, hotter than the Sun. It shines with the light of 23
   Suns. · 8.6 light-years away: the light you see tonight left it in 2017. · That day it
   rose at 02:43 in the east-south-east, stood highest at 08:20, 54° up, set at 13:57 in
   the west-south-west." Each sentence reads one held field and is omitted when the
   field is absent. The only new arithmetic: rank by catalogue magnitude, the year the
   light left (date minus distance), the rising and setting compass point from
   declination and latitude (acos(sin δ / cos φ)), and spectral class to a colour word.
   No size, mass or age is ever stated. Altitude, azimuth, magnitude and the HIP number
   live under "Details".
3. **The birth instant**, in gold on every card: "At 10:00, the hour this sky is made
   for, Sirius stood 46° up in the south-west, hidden in daylight." Projected from the
   catalogue position at sample 0, the same way a tap is resolved. The wording "the hour
   this sky is made for" is a placeholder for your copy (§6 of the brief).
4. **A real clock.** The transport shows the sky's local time ("20:58") and under it
   how the sky is lit and the date ("night · 4 September", "daylight · 5 September"),
   from the sample on screen and the track's clock in `bodies.json`. Film seconds are
   gone.
5. **"Show Canis Major, the Great Dog"** on every star card draws the Rey figure
   without a trip to the search box.
6. **A names layer** (the tag icon): the Moon and planets in gold, stars brighter than
   magnitude 1.6 that the frame paints in white, colliding labels dropped, the choice
   remembered on the device.
7. **A first-open hint**, "Tap a star to name it · type a name to fly there · drag to
   look around", shown once per device, gone at the first tap, drag or keystroke.
8. **The dedication**: a third caption line, italic gold, stamped by the bundler from
   an optional eighth argument and absent when empty. The bundler's uniqueness check
   covers it like the place and date.

Also: the day is one line on the panel at all times ("This day · sunrise 06:12 · sunset
18:39 · Moon 52% ›"), opening the full table, which now carries the date and any active
meteor showers. On a phone held upright the panel is a sheet at the bottom and the
caption moves to the top.

Checks: all eight pass (`results/ux/ux.json`, no page errors); the seam harness still
passes on the combined player (`results/after.txt`); the bundler's strip, parse and leak
checks pass (54.9 KB stripped). The sidecar itself is unbuilt Rust, like the rest.

## Costs, summarised

| patch | render | encode | other |
|---|---|---|---|
| track density | 0 | 0 | track bake 6× samples; +1.4 MB on disk, nothing shipped grows |
| dither | unmeasured, expected small; read off the next shard log | 0 | none |
| night loop | 0 (the pass is re-rendered regardless) | 0 | none |
| player | 0 | 0 | +25 KB of page before strip (+15 KB after); two decoders for the length of a rotate, three briefly if the Sun is switched mid-rotate |
| bodies.json | 0 | 0 | 187 KB shipped at 720 samples, ~1.1 MB at 4320 (read once at boot; could be thinned to every 4th sample if that matters) |

## Open decisions (Erick's, not picked)

1. **The Moon at the night-pass loop.** With the sidereal loop the stars are seamless and
   the Moon jumps 14.3° once a minute. Options: (a) accept it; (b) have the player dip the
   night pass through black too (one flag: write `loop_closed:false`); (c) a baked
   dissolve of the last ~12 frames into the first 12, which would blend two real
   instants 23h56m apart and so needs a ruling against the honesty contract's "never
   an interpolation between two" before it is built. I built none of these.
2. **The film's loop dip** is in the player (no re-encode). The baked alternative is to
   end the animation at exactly 24 h with the sweep returning to the establishing shot;
   that is a change to the grid-searched `SWEEP` and I did not make it.
3. **Venus** (above): a look call on how the brightest planets are drawn.
4. **A device check for the rotate swap** (above): one phone, one tablet, both cuts. I
   could not do it from here.
5. The poster is still the 12 s hero frame because the app icon is cut from it; with the
   veil it is never seen as a poster. If a frame-0 poster is wanted anyway, `-ss 12` → `-ss 0`
   in `bake_all.sh` and the icon needs its own source.

## Files

- `patches/` unified diffs: `birthday.rs.diff`, `bake_birthday.rs.diff`,
  `order_birthday_film.sh.diff`, `bundle_birthday.sh.diff`, `player_index.html.diff`
- `player/index.html` the patched player, whole
- `tools/director.py` the director port; `predict.py`, `grid7.py` the predictions;
  `harness.mjs` + `analyse.py` the seam measurement; `patch_player.py` applies the player
  patch to a pristine copy; `bundle_check.sh` the bundler's checks on one file
- `results/` every number quoted above
- `look/` the two contrast-stretched twilight crops that show the banding
