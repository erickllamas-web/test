"""bodies.json from a track file: the per-sample sky state the player needs to name the Moon and
the planets under a tap, to show the local clock, and to say where a thing stood at the birth
instant. Mirrors what write_bodies() in bake_birthday.rs writes; the numbers come straight from
the track rows (daemon samples), nothing is computed here but formatting."""
import sys, json
src, dst = sys.argv[1], sys.argv[2]
txt = open(src).read().split('\n'); meta = json.loads(txt[0])
rows = [list(map(float, l.split(','))) for l in txt[1:] if l.strip()]
names = meta['planets']; n = len(rows)
col = lambda i, f="%.3f": [float(f % r[i]) for r in rows]
out = {
  "n": n, "date": meta["date"], "utc_off_h": meta["utc_off"], "t0_h": meta["birth_local"],
  "span_h": meta["cycle_h"], "lat": meta["lat"], "lon": meta["lon"], "names": names,
  "lst": col(0), "sun_az": col(1), "sun_alt": col(2),
  "moon_az": col(5), "moon_alt": col(6), "moon_ang": col(7, "%.4f"), "moon_illum": col(8, "%.4f"),
  "moon_wax": [int(r[11] != 0) for r in rows],
  "pl_az": [[float("%.3f" % r[14 + 4*k]) for r in rows] for k in range(len(names))],
  "pl_alt": [[float("%.3f" % r[15 + 4*k]) for r in rows] for k in range(len(names))],
  "pl_mag": [[float("%.2f" % r[16 + 4*k]) for r in rows] for k in range(len(names))],
  "pl_ang": [[float("%.4f" % r[17 + 4*k]) for r in rows] for k in range(len(names))],
}
json.dump(out, open(dst, 'w'), separators=(',', ':'))
print(dst, n, 'samples', len(open(dst).read()) // 1024, 'KB')
