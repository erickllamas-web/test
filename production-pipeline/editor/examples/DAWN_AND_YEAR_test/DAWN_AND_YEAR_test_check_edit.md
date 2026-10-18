# check_edit — DAWN_AND_YEAR_test

EDL ../../../../..<work>/DAWN_AND_YEAR_test_edl.json, 9 events, 72.167 s.

| test | where | verdict | detail |
|---|---|---|---|
| motion_at_cut | A_summer_top in f23 | ok | motion 0.060 vs window f12–24 median 0.066 |
| motion_at_cut | A_summer_top out f265 | ok | motion 0.145 vs window f264–276 median 0.149 |
| rhythm | A_summer_top | ok | 10.083 s is "medium"; wide allows medium/long/very_long |
| voice_leads | A_summer_top | ok | leads by 0.50 s |
| voice_fits | A_summer_top | WARN | line needs ~9.6 s, shot is 10.083 s |
| luma_jump_at_cut | A_summer_top → A_contrast_am | ok | Δ mean luma 2.2 (limit 40) |
| no_two_wides | A_summer_top → A_contrast_am | ok | wide → insert |
| rhythm | A_contrast_am | ok | 3.958 s is "insert"; insert allows insert |
| voice_leads | A_contrast_am | ok | leads by 0.50 s |
| voice_fits | A_contrast_am | WARN | line needs ~3.2 s, shot is 3.958 s |
| motion_at_cut | A_summer_sw in f23 | ok | motion 0.037 vs window f12–24 median 0.039 |
| luma_jump_at_cut | A_contrast_am → A_summer_sw | ok | Δ mean luma 10.9 (limit 40) |
| no_two_wides | A_contrast_am → A_summer_sw | ok | insert → medium |
| rhythm | A_summer_sw | ok | 12.042 s is "medium"; medium allows medium/long |
| breath_after_instant | A_summer_sw | ok | 7.7 s after the instant (min 2) |
| voice_silent_at_instant | A_summer_sw's line over A_summer_sw's instant | FAIL | voice 13.5–22.3 s (estimated at 150 wpm), instant 18.4 s |
| voice_leads | A_summer_sw | ok | leads by 0.50 s |
| luma_jump_at_cut | A_summer_sw → A_axis_5s | ok | Δ mean luma 10.8 (limit 40) |
| eye_trace | A_summer_sw → A_axis_5s | n/a | needs the frame lists (--lists DIR) |
| line | A_summer_sw → A_axis_5s | ok | sw → sw |
| thirty_degrees | A_summer_sw → A_axis_5s | FAIL | Δbearing 0.0°, lens ratio 1.00 |
| no_two_wides | A_summer_sw → A_axis_5s | ok | medium → insert |
| rhythm | A_axis_5s | ok | 5 s is "insert"; insert allows insert |
| breath_after_instant | A_axis_5s | FAIL | 1.9 s after the instant (min 2) |
| voice_silent_at_instant | A_autumn_set's line over A_axis_5s's instant | FAIL | voice 28.6–37.8 s (estimated at 150 wpm), instant 29.2 s |
| motion_at_cut | A_autumn_set in f22 | ok | motion 0.048 vs window f12–24 median 0.049 |
| motion_at_cut | A_autumn_set out f219 | ok | motion 0.040 vs window f216–228 median 0.044 |
| eye_trace | A_axis_5s → A_autumn_set | n/a | needs the frame lists (--lists DIR) |
| thirty_degrees | A_axis_5s → A_autumn_set | ok | Δbearing 140.3°, lens ratio 2.50 |
| no_two_wides | A_axis_5s → A_autumn_set | ok | insert → medium |
| dissolve_context | A_axis_5s → A_autumn_set | ok | act changes, day changes |
| rhythm | A_autumn_set | ok | 8.208 s is "medium"; medium allows medium/long |
| voice_leads | A_autumn_set | ok | leads by 0.50 s |
| voice_fits | A_autumn_set | WARN | line needs ~9.2 s, shot is 8.208 s |
| motion_at_cut | A_winter_top in f22 | ok | motion 0.126 vs window f12–24 median 0.133 |
| motion_at_cut | A_winter_top out f265 | ok | motion 0.049 vs window f264–276 median 0.058 |
| no_two_wides | A_autumn_set → A_winter_top | ok | medium → wide |
| dissolve_context | A_autumn_set → A_winter_top | ok | act same, day changes |
| rhythm | A_winter_top | ok | 10.125 s is "medium"; wide allows medium/long/very_long |
| voice_leads | A_winter_top | ok | leads by 0.50 s |
| luma_jump_at_cut | A_winter_top → A_contrast_pm | ok | Δ mean luma 0.2 (limit 40) |
| no_two_wides | A_winter_top → A_contrast_pm | ok | wide → insert |
| rhythm | A_contrast_pm | ok | 3.958 s is "insert"; insert allows insert |
| luma_jump_at_cut | A_contrast_pm → A_winter_ne | ok | Δ mean luma 16.7 (limit 40) |
| no_two_wides | A_contrast_pm → A_winter_ne | ok | insert → medium |
| match_pair | A_contrast_pm → A_winter_ne | ok | lens 12° vs 12°, subject position needs the frame lists |
| rhythm | A_winter_ne | ok | 10.292 s is "medium"; medium allows medium/long |
| breath_after_instant | A_winter_ne | ok | 2.0 s after the instant (min 2) |
| voice_silent_at_instant | A_station_moon's line over A_winter_ne's instant | FAIL | voice 59.2–68.8 s (estimated at 150 wpm), instant 58.7 s |
| voice_leads | A_winter_ne | ok | leads by 0.50 s |
| eye_trace | A_winter_ne → A_station_moon | n/a | needs the frame lists (--lists DIR) |
| thirty_degrees | A_winter_ne → A_station_moon | ok | Δbearing 90.3°, lens ratio 1.20 |
| no_two_wides | A_winter_ne → A_station_moon | ok | medium → medium |
| dissolve_context | A_winter_ne → A_station_moon | ok | act same, day changes |
| rhythm | A_station_moon | ok | 12.5 s is "medium"; medium allows medium/long |
| breath_after_instant | A_station_moon | FAIL | 0.1 s after the instant (min 2) |
| voice_leads | A_station_moon | ok | leads by 0.50 s |
| runtime | film | ok | 72.167 s vs target 80 (±10 %) |
| black | cut | ok | 2 black span(s), all declared |

FAIL: voice_silent_at_instant @ A_summer_sw's line over A_summer_sw's instant; thirty_degrees @ A_summer_sw → A_axis_5s; breath_after_instant @ A_axis_5s; voice_silent_at_instant @ A_autumn_set's line over A_axis_5s's instant; voice_silent_at_instant @ A_station_moon's line over A_winter_ne's instant; breath_after_instant @ A_station_moon
WARN: voice_fits @ A_summer_top; voice_fits @ A_contrast_am; voice_fits @ A_autumn_set
