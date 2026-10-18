# qc — DAWN_AND_YEAR_test

T4 exposure continuity: frame-to-frame mean-luma step ≤ 0.3 (of 255) inside a shot; black frames none.

| clip | frames | Y range | median step | max step | steps > 0.3 | steps > 1 | T4 |
|---|---|---|---|---|---|---|---|
| A_summer_top | 288 | 100.5–111.4 | 0.039 | 0.23 | 0 | 0 | pass |
| A_contrast_am | 96 | 109.1–109.1 | 0.000 | 0.00 | 0 | 0 | pass |
| A_summer_sw | 336 | 114.2–120.3 | 0.018 | 0.09 | 0 | 0 | pass |
| A_axis_5s | 120 | 107.4–125.3 | 0.114 | 1.48 | 14 | 2 (f99,105) | FAIL |
| A_autumn_set | 240 | 108.0–115.3 | 0.031 | 0.05 | 0 | 0 | pass |
| A_winter_top | 288 | 105.7–107.9 | 0.015 | 0.24 | 0 | 0 | pass |
| A_contrast_pm | 96 | 106.5–106.5 | 0.001 | 0.00 | 0 | 0 | pass |
| A_winter_ne | 288 | 89.3–98.4 | 0.032 | 0.10 | 0 | 0 | pass |
| A_station_moon | 336 | 25.9–45.4 | 0.066 | 1.95 | 93 | 12 (f307,309,310,313) | FAIL |
