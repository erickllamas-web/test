# The film language library

Generated from `dimensions.json`, `directors.json`, `sequences.json` by `make_doc.py`. Edit the JSON, not this file.

Three tables: the **dimensions** (every property of a shot or a sequence and the shot-file field it lands in), the **directors** (one value per dimension: how each pursues a shot and builds a sequence), and the **sequence patterns** (ordered beats a strategy expands). The directors' rows are their habits as commonly described, written as starting rows to edit; none is a measurement. Nothing in the *look* dimension changes a number the renderer computed: it is the display transform, recorded once per film, and needs a ruling before any value but neutral.


## Dimensions of a shot

| dimension | what | values | lands in |
|---|---|---|---|
| **frame** | where things sit in the picture | `symmetric_centre` (the subject and the line dead centre, left-right symmetric), `thirds` (subject on a third, horizon on a third), `horizon_low` (sky takes most of the frame), `horizon_high` (ground takes most of the frame), `figure_small` (the subject small against something vast), `architecture_dominant` (the built thing fills the frame; the event happens inside it), `planimetric` (flat-on, the camera square to the subject's face) | take.look / take.look_h / take.el; checked by check (horizon row, subject position) |
| **lens** | vertical field of view, degrees | `wide` (40 to 60), `normal` (25 to 40), `long` (8 to 25), `very_long` (under 8) | lens (fov) |
| **height** | camera above the ground, metres | `ground` (under 1), `low` (1 to 1.3), `eye` (1.6 to 1.8), `high` (5 to 30), `overhead` (over 50, looking down) | camera.h / take.height |
| **line** | the camera's relation to the monument's axis (the 180-degree line) | `on_axis` (eye on the line, looking along it), `oblique` (off the line, looking across it), `crossing` (the move crosses the line (a statement)) | take.bearing against site.axis |
| **movement** | how the camera moves | `locked` (none), `push` (in along the look), `pull` (out along the look), `track` (sideways), `crane` (up or down), `orbit` (round the subject), `drift` (a move so slow it is noticed only at the end), `walk` (at walking pace at eye height) | take.family (cameras.json) |
| **motion_curve** | how a move starts and ends | `hold_move_hold` (still one second, eased move, still one second), `constant` (one speed, cut in and out of motion), `ramp_to_instant` (slows into the key instant, holds, releases), `none` (locked) | camera.hold; strategy.ramp |
| **time** | how time runs inside the shot | `real` (one second a second), `held` (one instant, the camera moves), `lapse` (minutes or hours in seconds) | light.held / light.from,to (mode) |
| **light** | the Sun or Moon's height band, and its direction against the camera | **band**: `night` (below -12), `twilight` (-12 to 0), `golden` (0 to 6), `low` (6 to 15), `high` (over 15)<br>**direction**: `back` (the body in front of the camera, subject in silhouette), `side` (the body across the camera, relief shows), `front` (the body behind the camera, flat light) | light.from / light.to as @moments; check (body in frame) |
| **look** | the display transform applied once per film to the rendered radiance. It changes no number the renderer computed; it is the film stock. Each value is recorded in look.json. Erick's ruling needed before any value but 'neutral' is used. | **exposure**: `fixed` (one value per shot), `smooth` (a curve from the Sun's altitude), `auto` (per frame (today; pumps at key instants))<br>**contrast**: `flat` (lifted blacks, soft curve), `neutral` (the eye's curve), `hard` (deep blacks, steep curve)<br>**saturation**: `muted` (0.7 to 0.85 of measured), `natural` (as measured), `rich` (1.1 to 1.2)<br>**warmth**: `cool` (white point toward blue), `neutral` (D65), `warm` (white point toward amber)<br>**blacks**: `lifted` (nothing below 5 percent), `true` (zero stays zero) | look.json (the look step after the renderer; not in the tool yet) |
| **duration** | seconds on screen, by rung | `insert` (3 to 6), `medium` (8 to 15), `long` (16 to 30), `very_long` (over 30) | seconds |
| **cut_in** | how the shot begins | `cut_on_stillness` (the previous shot had settled), `cut_on_motion` (mid-move, momentum carries), `dissolve` (time passed (between days or acts)), `match` (same shape or position as the previous shot), `from_black` (the film breathes) | cut |
| **eye_trace** | where the point of interest sits so the next cut lands where the eye already is | `centre` (dead centre), `upper_third`, `lower_third`, `edge` (at the frame's edge, about to leave or enter) | check (body position); strategy.eye_trace |
| **sound** | what is heard over the shot | **voice**: `none`, `leads` (starts 0.5 s before the picture it names), `after` (speaks after the instant)<br>**music**: `none`, `under` (quiet, continuous), `leads` (the music is the structure), `enters` (a cue begins on the cut)<br>**silence**: `at_instant` (no voice, music down across the key instant), `whole` (the shot is silent) | voice; music (sound.json, not in the tool yet) |

## Dimensions of a sequence

| dimension | what | values | lands in |
|---|---|---|---|
| **ladder** | the order of rungs inside an act | `descend` (wide to medium to close), `ascend` (close to wide), `jump` (wide straight to close, nothing between), `flat` (all one rung (a montage of equals)) | strategy.beats[].rung |
| **rhythm** | the series of shot lengths; the pulse | `breathing` (long holds against short inserts (40 / 6 / 6 / 24)), `even` (all shots near one length), `accelerating` (shorter toward the climax, then one long), `decelerating` (longer as the act settles) | strategy.beats[].seconds |
| **motif** | what returns, and how often | `axis_both_ways` (the same line, summer then winter), `same_frame_other_day` (the contrast insert), `rule_of_three` (a figure shown three times, the third changed), `none` | strategy.motifs |
| **act_shape** | how an act enters and leaves | `enter_wide_exit_close`, `enter_close_exit_wide`, `bookend` (ends on the frame it began with) | strategy.acts[].shape |
| **key_instant** | how the climax of a claim is handled | `ramp_hold_release` (slow in, hold at the second, let go), `pass_without_comment` (the instant happens inside a long take), `cut_to_it` (arrive on the instant from another shot) | strategy.beats[].instant |
| **colour_arc** | how the look moves across the film | `follow_the_day` (warm at the ends, cool at night, neutral at noon (the physics gives this already)), `constant` (one look throughout), `toward_cold` (warms to cools as the film goes) | look.json per act (not in the tool yet) |
| **sound_arc** | how voice and music are distributed | `voice_sparse` (a line per claim, silence between), `voice_dense` (continuous narration), `music_led` (music carries, voice rare), `silence_then_music` (the first act silent, music enters with the first claim) | sound.json (not in the tool yet) |

## The directors — how each pursues a shot

| director | frame | lens | height | line | movement | motion_curve | time | duration | cut_in | eye_trace |
|---|---|---|---|---|---|---|---|---|---|---|
| **Stanley Kubrick** | symmetric_centre | wide | eye | on_axis | push | constant | real | long | cut_on_stillness | centre |
| **Andrei Tarkovsky** | thirds | normal | low | oblique | drift | hold_move_hold | real | very_long | cut_on_stillness | lower_third |
| **Terrence Malick** | horizon_low | wide | ground | oblique | walk | constant | real | medium | cut_on_motion | upper_third |
| **Akira Kurosawa** | thirds | long | eye | oblique | locked | none | real | medium | cut_on_motion | edge |
| **Yasujirō Ozu** | planimetric | normal | low | oblique | locked | none | real | insert | cut_on_stillness | edge |
| **Ron Fricke and Godfrey Reggio (Baraka, Koyaanisqatsi)** | symmetric_centre | wide | high | on_axis | locked | hold_move_hold | lapse | long | cut_on_stillness | centre |
| **David Lean** | horizon_low | wide | eye | on_axis | locked | none | real | very_long | cut_on_stillness | centre |
| **Denis Villeneuve** | figure_small | wide | high | oblique | drift | hold_move_hold | real | long | cut_on_stillness | lower_third |
| **Werner Herzog** | thirds | normal | eye | oblique | locked | none | real | very_long | cut_on_stillness | centre |
| **Sergio Leone** | horizon_low | very_long | eye | on_axis | locked | none | real | insert | cut_on_stillness | centre |
| **Alfred Hitchcock** | thirds | normal | eye | on_axis | push | ramp_to_instant | real | medium | match | centre |
| **Michelangelo Antonioni** | architecture_dominant | normal | eye | oblique | locked | none | real | long | cut_on_stillness | edge |

### Light, look and sound per director

| director | light band / direction | exposure | contrast | saturation | warmth | blacks | voice | music | silence |
|---|---|---|---|---|---|---|---|---|---|
| **Stanley Kubrick** | any / front | fixed | hard | rich | neutral | true | none | leads | at_instant |
| **Andrei Tarkovsky** | low / side | fixed | flat | muted | warm | lifted | none | under | whole |
| **Terrence Malick** | golden / back | smooth | neutral | natural | warm | lifted | after | under | at_instant |
| **Akira Kurosawa** | low / side | fixed | hard | natural | neutral | true | none | enters | at_instant |
| **Yasujirō Ozu** | any / front | fixed | neutral | muted | neutral | true | none | under | whole |
| **Ron Fricke and Godfrey Reggio (Baraka, Koyaanisqatsi)** | golden / side | smooth | neutral | rich | neutral | true | none | leads | at_instant |
| **David Lean** | high / front | fixed | neutral | rich | warm | true | none | leads | at_instant |
| **Denis Villeneuve** | low / back | fixed | flat | muted | cool | lifted | none | under | at_instant |
| **Werner Herzog** | any / any | fixed | neutral | natural | neutral | true | leads | under | at_instant |
| **Sergio Leone** | low / back | fixed | hard | natural | warm | true | none | leads | at_instant |
| **Alfred Hitchcock** | any / any | fixed | neutral | natural | neutral | true | leads | enters | at_instant |
| **Michelangelo Antonioni** | high / side | fixed | neutral | muted | cool | true | none | none | whole |

### How each builds a sequence

| director | ladder | rhythm | motif | act_shape | key_instant | colour_arc | sound_arc |
|---|---|---|---|---|---|---|---|
| **Stanley Kubrick** | descend | even | axis_both_ways | bookend | ramp_hold_release | constant | music_led |
| **Andrei Tarkovsky** | flat | decelerating | none | enter_close_exit_wide | pass_without_comment | toward_cold | silence_then_music |
| **Terrence Malick** | flat | breathing | rule_of_three | enter_wide_exit_close | pass_without_comment | follow_the_day | voice_sparse |
| **Akira Kurosawa** | descend | accelerating | rule_of_three | enter_wide_exit_close | cut_to_it | constant | music_led |
| **Yasujirō Ozu** | flat | even | same_frame_other_day | bookend | pass_without_comment | constant | voice_sparse |
| **Ron Fricke and Godfrey Reggio (Baraka, Koyaanisqatsi)** | descend | breathing | same_frame_other_day | enter_wide_exit_close | ramp_hold_release | follow_the_day | music_led |
| **David Lean** | ascend | decelerating | none | enter_close_exit_wide | ramp_hold_release | constant | music_led |
| **Denis Villeneuve** | descend | decelerating | none | enter_wide_exit_close | ramp_hold_release | toward_cold | music_led |
| **Werner Herzog** | flat | decelerating | none | bookend | pass_without_comment | constant | voice_sparse |
| **Sergio Leone** | jump | accelerating | rule_of_three | enter_wide_exit_close | ramp_hold_release | constant | music_led |
| **Alfred Hitchcock** | descend | accelerating | axis_both_ways | enter_wide_exit_close | cut_to_it | constant | voice_sparse |
| **Michelangelo Antonioni** | flat | decelerating | none | bookend | pass_without_comment | constant | voice_sparse |

### Signature, and where each fits our film


**Stanley Kubrick** (`kubrick`) — One-point perspective: the line of the space dead centre, the frame symmetric, a slow track or zoom along the axis.

- For us: the axis push-ins (A_axis_5s and its winter match); the slot as a one-point corridor; the alignment held.
- Avoid: the overhead shots (no vanishing line); anything hand-held or oblique.

**Andrei Tarkovsky** (`tarkovsky`) — The long take in which time is the subject: the camera drifts in so slowly it is noticed only at the end; water, wind, grass and weather inside the frame.

- For us: the walk in along the Avenue; the held dawn after first light; the carr with wind in the leaves.
- Avoid: inserts; anything under 15 seconds.

**Terrence Malick** (`malick`) — Magic hour only, a wide lens low to the ground, the camera moving through grass toward the light; the Sun left in the frame.

- For us: the Avenue at 3 degrees of Sun; the carr and the river; the grass near the camera.
- Avoid: noon; the overhead rung; precise alignments (the lens is too wide to read a degree).

**Akira Kurosawa** (`kurosawa`) — Telephoto compression from far back, the camera locked while the world moves; weather is a character; the cut lands on action.

- For us: the Sun crossing the slot, camera locked (sun_track_tele without the track); clouds and their shadows crossing the circle; wind over the Plain.
- Avoid: slow drifts; the empty wide.

**Yasujirō Ozu** (`ozu`) — A low fixed camera; nothing moves but time; 'pillow shots' of place between scenes; the event happens at the edge of the frame.

- For us: the inserts between acts (a lintel edge, the Heel Stone alone); the empty monument held; the contrast insert as a pillow shot.
- Avoid: moves of any kind; the climax.

**Ron Fricke and Godfrey Reggio (Baraka, Koyaanisqatsi)** (`fricke_reggio`) — Time-lapse from a locked camera, slow dollies through stillness, the scale ladder from the planet down to one stone; the music is the structure.

- For us: the spine of the film: it is already the grammar; the overhead sundial; the spiral down into dusk.
- Avoid: voice over the picture (they have none; we have decided on one, so place it in the gaps).

**David Lean** (`lean`) — Landscape as epic: the very wide frame with a low horizon, and the long approach in which a figure appears on the horizon and grows for a full minute.

- For us: the Heel Stone seen from far down the Avenue, growing; the circle appearing on the Plain in the walk in; the Sun arriving at the skyline.
- Avoid: the inside of the circle; the telephoto rung.

**Denis Villeneuve** (`villeneuve`) — Scale by a small thing against a vast one; the slow reveal; haze and dust between camera and subject; a muted palette and long, low drones.

- For us: the Plain from above with the circle small in it; aerial perspective doing the work (AERIAL=1 already); the descent to eye height.
- Avoid: bright noon; the window shots (they need the Sun, not haze).

**Werner Herzog** (`herzog`) — The landscape held past comfort, and a voice that says what the image cannot; the camera does not help the viewer.

- For us: every voice line: where it goes and where it stops; the hold after the Sun has gone; the equinox shots that say 'the monument does not frame it'.
- Avoid: music-led passages; the match cut (he does not play games with time).

**Sergio Leone** (`leone`) — The extreme wide against the extreme close with nothing between; waiting as tension; the music is the clock.

- For us: from the overhead straight to the lintel's edge (the jump); the seconds before the Sun touches the slot; the Sun's disc at 6 degrees, nothing else in frame.
- Avoid: the medium rung (he skips it); drifts.

**Alfred Hitchcock** (`hitchcock`) — Show the looker, then what is seen; the eye-trace carries the cut; the next shot's point of interest sits where the eye already is.

- For us: the hand-off from the overhead to the on-axis shot (the Sun stays where the eye is); the summer-winter match cut; 'the builders looked here' then the shot of what they saw.
- Avoid: long holds; the montage of equals.

**Michelangelo Antonioni** (`antonioni`) — Figures inside architecture; the frame stays after the action has left it; the built thing outlasts the event.

- For us: the ends of shots: hold after the Sun is gone; the coda to black; the stones at noon with no event.
- Avoid: the climax; the approach shots.

## Sequence patterns


### the proof

A measured claim shown so it cannot be doubted: establish from above, the same frame on the other days, then on the line, the instant held, release along the line. From: fricke_reggio, hitchcock. Key instant: `ramp_hold_release`. Rhythm: `breathing`. Used in: script v3.1 act VI (shots 8, 8c, 9, 10, 11) and act VIII (14, 14c, 15, 16).

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | wide | lapse | medium | cut_on_stillness | overhead: the shadows lie along the line |
| 2 | wide | held | insert | cut_on_stillness | contrast: the same frame at the same Sun height on the other important days |
| 3 | medium | lapse | medium | match | on the line, long lens: the body enters the frame the stones make |
| 4 | close | lapse | long | cut_on_stillness | the window: the body inside one gap |
| 5 | hold | held | medium | cut_on_stillness | the instant held, the camera moves along the line |

### the approach

A thing appears small on the horizon and grows for a long time; the viewer earns the arrival. From: lean. Key instant: `pass_without_comment`. Rhythm: `decelerating`. Used in: 6_walk_in; the Heel Stone from down the Avenue (not yet made).

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | wide | real | very_long | from_black | the walk or dolly in, the subject small at first |
| 2 | medium | real | medium | cut_on_motion | the subject fills the frame; the move continues |

### the jump

From the extreme wide straight to the extreme close, nothing between; the scale shock. From: leone. Key instant: `cut_to_it`. Rhythm: `accelerating`. Used in: not yet; a candidate for the first seconds after the dissolve into 'the year'.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | wide | lapse | long | cut_on_stillness | the Plain or the overhead |
| 2 | close | real | insert | cut_on_stillness | one edge of one stone, or the Sun's disc alone |

### the pillow

A short still shot of place between two acts; nothing happens; the film breathes. From: ozu. Key instant: `pass_without_comment`. Rhythm: `even`. Used in: not yet; between acts II/III and VII/VIII.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | close | real | insert | cut_on_stillness | a lintel, the Heel Stone alone, the ditch; locked, no event |

### the breath

After the climax, the frame stays after the event has left it; then the cut. From: antonioni, herzog. Key instant: `pass_without_comment`. Rhythm: `decelerating`. Used in: A_spring_rise to black (the coda); the end of V_slot wants it.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | close | real | medium | cut_on_stillness | the same frame as the climax, the body gone, the stones remain |

### the match

Two moments far apart in time, the same lens and mirrored camera, cut directly; the viewer sees the symmetry without being told. From: hitchcock, kubrick. Key instant: `ramp_hold_release`. Rhythm: `even`. Used in: A_summer_sw to A_winter_ne; A_axis_5s to A_axis_5s_winter (the compare clip).

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | medium | lapse | medium | cut_on_stillness | on the line from one end, the body in the gap |
| 2 | medium | lapse | medium | match | on the line from the other end, the same lens, the body in the same gap |

### the look

Show where the eye is, then what it sees: the point of interest of the second shot sits where the first left it. From: hitchcock. Key instant: `cut_to_it`. Rhythm: `even`. Used in: A_summer_top to A_summer_sw (the eye-trace rule in the grammar).

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | wide | lapse | medium | cut_on_stillness | the line seen from above, the body at frame centre |
| 2 | medium | lapse | medium | cut_on_stillness | along the line at eye height, the body at frame centre |

### the montage of place

Equal shots of one place through time, music-led, no story but the light; the scale ladder descends across the set. From: fricke_reggio. Key instant: `pass_without_comment`. Rhythm: `breathing`. Used in: acts I and II (V_plain, V_carr, V_sundial) in spirit.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | wide | lapse | long | cut_on_stillness | the Plain |
| 2 | wide | lapse | medium | cut_on_stillness | the circle from above |
| 3 | medium | lapse | medium | cut_on_stillness | the stones at eye height |
| 4 | close | lapse | insert | cut_on_stillness | one stone, the light moving on it |

### the long take

One shot that carries a whole act; time itself is the subject; the camera drifts so slowly the move is noticed only at the end. From: tarkovsky. Key instant: `pass_without_comment`. Rhythm: `decelerating`. Used in: not yet; a candidate to replace shots 9 and 10 with one shot.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | medium | real | very_long | cut_on_stillness | the dawn from first light to the whole disc, one drift along the line |

### the reveal

The subject withheld, then disclosed by the camera's own move: rise behind a stone and the whole axis appears. From: villeneuve, lean. Key instant: `ramp_hold_release`. Rhythm: `decelerating`. Used in: axis_crane_up in the camera library; 8_alignment in spirit.

| # | rung | time | duration | cut in | does |
|---|---|---|---|---|---|
| 1 | close | held | insert | cut_on_stillness | behind the trilithon, the view blocked |
| 2 | medium | held | medium | cut_on_motion | the crane up and tilt down: the line to the Heel Stone and the Avenue |

## How the tool uses this

- A take in `cameras.json` or a row in the shot file may carry `"style": "<director>"`; a strategy may carry one for the whole film or per act. The row's values fill every dimension the row does not set itself. Precedence: strategy < style < take < row.
- A strategy's acts are lists of sequence patterns; the compiler expands each beat into a shot row from the site's moments and the camera library, then `check` runs.
- The proposer offers each claim in up to three styles on one sheet; the pick is recorded as a weight on that style for that pattern, so the next film asks less.
- Dimensions whose `lands in` says *not in the tool yet* (look, music, colour arc, sound arc) are recorded in the shot file now and applied when the look step and the finish stage exist. Until then they change nothing.
