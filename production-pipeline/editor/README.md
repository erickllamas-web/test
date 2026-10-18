# editor — the edit as data

`edit.js` reads a shot file (the same schema as `shots.js`) and the rendered clips, and makes the cut by the rules in
`../film-language/editing.json`. Zero dependencies beyond node, ffmpeg and ffprobe. Nothing is hand-built: the cut
is an EDL generated from the shot file, rendered, tested, and compared.

```
node edit.js FILM.json metrics  --clips DIR [--work DIR]     per-clip luma and motion per frame (cached in <work>/metrics)
node edit.js FILM.json edl      --clips DIR [--work DIR]     in/out frames by rule, transitions by context -> <work>/<title>_edl.json + _voice.srt
node edit.js FILM.json render   [--edl F] [--out F]          the cut (cuts, dissolves, fades, dips) with ffmpeg
node edit.js FILM.json check    [--edl F] [--cut F] [--lists DIR]   check_edit -> <work>/<title>_check_edit.md, exit 1 on FAIL
node edit.js FILM.json compare N [--edl F]                   the cut into event N two ways, side by side -> compare_N.mp4 + .png + .json
node edit.js FILM.json otio     [--edl F]                    OpenTimelineIO JSON (open in Resolve to look; the EDL stays the source)
node edit.js FILM.json chapters [--edl F]                    YouTube chapter lines from the acts
node edit.js FILM.json qc       --clips DIR                  per-clip tests: T4 exposure continuity, with the offending frames
node edit.js FILM.json dailies  --clips DIR [--edl F]        one HTML page per clip: video, three stills, exposure trace, its check rows
```

Clips are found as `<clips>/<id>.mp4`, else the row's `camera.path`, else they are black in the cut and named by `check`.

## What the EDL decides, and from what

| decision | rule | source |
|---|---|---|
| in and out frame | inside the shot's handles (24 frames each side; `handles:false` = none; clip rows: ±12 frames round `in`), the pair that keeps the written length within ±0.5 s and minimises the rule's cost: `on_stillness` (least motion), `on_motion` (most), `to_instant`, `after_instant` (2 s after the key instant), `match` | `editing.json` cut_point; the style's `cut_in`; the row's `cut_rule` |
| the key instant's frame | `key_instant` (HH:MM:SS) on the shot's light span, mapped linearly onto the frames as `shots.js lists` does; no daemon needed | the row |
| transition | the row's `cut` (cut, dissolve, match:<id>, dip); with none written: a day change dissolves (long when the act changes too); the film fades in and out | `editing.json` transitions |
| voice timing | starts 0.5 s before its shot (J-cut); length estimated at 150 words a minute until the voice is synthesised | `editing.json` j_cut |

## Example: the dawn and year acts from today's clips

`films/dawn_and_year.shots.json` builds script v3.1's two alignment acts from the nine clips that exist
(`production_examples.zip`; the two contrast sheets as 4 s held inserts). Outputs in `examples/DAWN_AND_YEAR_test/`.
What `check_edit` found, all of it about the material, none about the tool:

- **The voice sits on the key instants.** A_summer_sw's line (22 words, ~9 s) runs across first gleam; the autumn
  line, led by 0.5 s into a 2 s dissolve, starts while A_axis_5s is still at its climax; the Moon line starts 0.5 s
  after the winter half-set. Shorter lines, or lines placed after the instant.
- **A_summer_sw → A_axis_5s is a jump cut by the 30° rule**: same bearing, same 12° lens. Script v3.1 has V_window
  between them in spirit; the test says it is needed.
- **No room to breathe after two instants.** A_axis_5s ends 1.9 s after the whole disc (no handles); A_station_moon
  ends 0.1 s after moonset. Both want a second or two more in the frame list, not in the edit.
- **Two dissolves by context** that the script wrote as cuts: autumn → winter and winter → the Moon night. The table
  says a day change dissolves; the row can say `cut` to overrule it.
- **T4 fails on two clips** (qc): A_axis_5s pumps 1.5 levels at frames 99 and 105, A_station_moon 2 levels in its
  last 30 frames. The per-frame auto exposure, as measured before.

## What is still to build for a production pipeline (in the order I would do them)

1. **Finish stage** (`master`): voice synthesis from the SRT, music cues from the acts, loudness to −14 LUFS,
   captions, chapters, titles, a 10-bit mezzanine and the YouTube encode. Everything but the voice engine and the
   music source exists in ffmpeg.
2. **Frame identity and manifests** on the render side: a hash per frame line plus settings, a manifest per clip,
   a cache so a frame is rendered once ever. Makes T10 (byte-identical re-render) a test.
3. **Queue and workers**: one directory queue, `run_film.sh` as one worker, the laptop as the desk. Then a GPU box
   or the iPad plug in by the same protocol.
4. **The look step** after a float/16-bit render: exposure policy and one recorded transform per film (T2, T3, T4).
5. **The proposer and the critic**: a language model over the tables offering each claim in three styles; a vision
   model reading each storyboard still against the grammar, as words beside the numbers.
6. **The strategy compiler**: strategy + site → shot file, with `the_proof` first, checked against script v3.1.
7. **Learning the edit**: record each `compare` pick with both candidates' metrics (the `learning` block in
   `editing.json`) and move the thresholds from the picks.
8. **Titles and poster frames**: generated from the film block; a poster is the key-instant frame of the climax shot.
9. **Delivery profiles**: 4K HEVC 10-bit for YouTube, 1080p H.264 fallback, a vertical crop rule for shorts if wanted.
10. **Archive**: clip + manifest + shot file revision + resolved settings to the Drive, one folder per film.
