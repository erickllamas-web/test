"""The usability patch, applied on top of the seam patch. Anchors must match exactly once."""
import sys
src_path, dst_path = sys.argv[1], sys.argv[2]
s = open(src_path, encoding='utf-8').read()
def rep(old, new):
    global s
    n = s.count(old)
    if n != 1: raise SystemExit(f"anchor matched {n}x (want 1):\n{old[:200]}")
    s = s.replace(old, new)

# ── CSS ──────────────────────────────────────────────────────────────────────
rep("""  @media (max-width:760px) {
    #panel { left:10px; right:10px; top:10px; width:auto; }
    #res { max-height:32vh; }
    #cap { left:14px; bottom:16px; }
    #cap .p { font-size:15px; }
  }
</style>""",
"""  /* ── what the card SAYS ─────────────────────────────────────────────────
     Sentences first, numbers after. Each sentence is built from one held
     field and prints nothing when that field is absent (see sayStar). */
  .say { font-size:12.5px; line-height:1.5; margin:8px 0 0; color:var(--ink); }
  .say.birth { color:var(--gold); }
  #info details { margin-top:10px; }
  #info summary { font-size:10px; letter-spacing:.1em; text-transform:uppercase;
    color:var(--faint); cursor:pointer; list-style:none; }
  #info summary::-webkit-details-marker { display:none; }
  #info details[open] summary { color:var(--dim); }
  #info details dl { margin-top:6px; }
  .lnk { display:inline-block; margin:10px 6px 0 0; background:none; border:1px solid var(--line2);
    color:var(--ink); border-radius:999px; padding:5px 11px; font:12px inherit; cursor:pointer; }
  .lnk:hover { border-color:var(--gold); color:var(--gold); }
  /* the day, one line, always visible */
  #day { border-top:1px solid var(--line); padding:8px 12px; font-size:11.5px; color:var(--dim);
    cursor:pointer; line-height:1.4; }
  #day b { color:var(--ink); font-weight:500; }
  #day:hover { color:var(--ink); }
  /* the clock's second line: how the sky is lit, and which day it is */
  #now { padding:0 12px 7px; font:10.5px ui-monospace,monospace; color:var(--faint); letter-spacing:.04em; }
  #names.lit { color:var(--gold); }
  /* the first-open hint */
  #hint { position:fixed; left:50%; top:62%; transform:translateX(-50%); z-index:6;
    padding:10px 16px; border-radius:999px; font-size:13px; background:var(--glass);
    border:1px solid var(--line); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    color:var(--ink); pointer-events:none; white-space:nowrap; text-align:center;
    transition:opacity .6s; }
  #hint.off { opacity:0; }
  /* the dedication, a third caption line; absent when empty */
  #cap .ded { font-size:13px; color:var(--gold); letter-spacing:.06em; margin-top:7px; font-style:italic; }
  #cap .ded:empty { display:none; }

  @media (max-width:760px) {
    #panel { left:10px; right:10px; top:10px; width:auto; }
    #res { max-height:32vh; }
    #cap { left:14px; bottom:16px; }
    #cap .p { font-size:15px; }
  }
  /* A phone held upright: the panel is a sheet at the bottom, under the
     thumb, and the caption moves to the top so the two never meet. */
  @media (max-width:760px) and (orientation:portrait) {
    #panel { top:auto; bottom:12px; }
    #body { max-height:56vh; overflow-y:auto; }
    #res { max-height:24vh; }
    #cap { top:14px; bottom:auto; }
    #hint { top:30%; white-space:normal; max-width:78vw; }
  }
</style>""")

# ── markup ───────────────────────────────────────────────────────────────────
rep("""    <div class="d" id="capDate">2 APRIL 1983 · 10:05</div>
  </div>""",
"""    <div class="d" id="capDate">2 APRIL 1983 · 10:05</div>
    <div class="ded" id="capDed"></div>
  </div>""")
rep("""        <div id="res" style="display:none"></div>
        <div id="info"></div>""",
"""        <div id="res" style="display:none"></div>
        <div id="day" style="display:none"></div>
        <div id="info"></div>""")
rep("""          <button id="dayb" class="ic" aria-label="the day" title="The day at this place" data-icon="day" style="display:none"></button>
        </div>""",
"""          <button id="dayb" class="ic" aria-label="the day" title="The day at this place" data-icon="day" style="display:none"></button>
          <button id="names" class="ic" aria-label="names on the sky" title="Names on the sky" data-icon="tag"></button>
        </div>
        <div id="now"></div>""")
rep("""  <div id="veil"></div>
  <div id="toast"></div>""",
"""  <div id="veil"></div>
  <div id="hint" class="off">Tap a star to name it · type a name to fly there · drag to look around</div>
  <div id="toast"></div>""")
rep("""    day:   s('<path d="M3 17h18M6 13a6 6 0 0 1 12 0M12 4v2.5M4.6 7.6l1.7 1.7M19.4 7.6l-1.7 1.7M8 21h8"/>'),
  };""",
"""    day:   s('<path d="M3 17h18M6 13a6 6 0 0 1 12 0M12 4v2.5M4.6 7.6l1.7 1.7M19.4 7.6l-1.7 1.7M8 21h8"/>'),
    tag:   s('<path d="M3.5 12V4h8l8.5 8.5-8 8z"/><circle cx="7.5" cy="8" r="1.3"/>'),
  };""")

# ── state ────────────────────────────────────────────────────────────────────
rep("""  staging: { film: null, night: null },   // a cut being brought in for a new shape""",
"""  staging: { film: null, night: null },   // a cut being brought in for a new shape
  bodies: null,   // per-sample Sun, Moon and planets (bodies.json), or null
  names: false,   // the names layer""")

# ── words: compass, ordinals, light, spectral class, the clock ───────────────
rep("""// ── frame lookup ─────────────────────────────────────────────────────────────""",
"""// ── words ────────────────────────────────────────────────────────────────────
// Everything the card says in a sentence is spelled from one held number. The
// spellings below are the only vocabulary; nothing here estimates anything.
const COMPASS = ['north','north-north-east','north-east','east-north-east','east','east-south-east',
  'south-east','south-south-east','south','south-south-west','south-west','west-south-west','west',
  'west-north-west','north-west','north-north-west'];
const compass = az => COMPASS[Math.round(((az % 360) + 360) % 360 / 22.5) % 16];
const ordinal = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd'
                        : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
// How the sky is lit at a Sun altitude: the standard twilight boundaries.
function lightWord(sunAlt){
  return sunAlt > 0 ? 'daylight' : sunAlt > -6 ? 'civil twilight' : sunAlt > -12 ? 'nautical twilight'
       : sunAlt > -18 ? 'astronomical twilight' : 'night';
}
// A spectral code (G8III, A1V, M1.5Iab) in words: colour and temperature from
// the class letter, the giants from the luminosity class. Nothing else is
// read off it — no sizes, no masses, nothing this pipeline does not hold.
const SPECT = { O:['blue','far hotter than the Sun'], B:['blue-white','much hotter than the Sun'],
  A:['white','hotter than the Sun'], F:['yellow-white','a little hotter than the Sun'],
  G:['yellow','like the Sun in colour'], K:['orange','cooler than the Sun'], M:['red','much cooler than the Sun'] };
function spectralWords(code){
  if (!code) return null;
  const c = SPECT[code[0].toUpperCase()]; if (!c) return null;
  const lum = (code.match(/\\b(Ia|Iab|Ib|II|III|IV|V)\\b/) || code.match(/(III|II|IV|V|I)/) || [])[1] || '';
  const kind = /^I(a|ab|b)?$/.test(lum) ? 'supergiant' : lum === 'II' ? 'bright giant' : lum === 'III' ? 'giant' : 'star';
  const phrase = `${c[0]} ${kind}`;
  return `${/^[aeiou]/.test(phrase) ? 'An' : 'A'} ${phrase}, ${c[1]}.`;
}
// The local clock of one track sample: the birth hour plus the sample's share
// of the track's span. `bodies.json` carries both numbers from the track.
function sampleClock(si){
  const B = S.bodies; if (!B) return null;
  const h = B.t0_h + (si / Math.max(1, B.n - 1)) * B.span_h;
  const day = Math.floor(h / 24), hh = h - day * 24;
  const m = Math.round(hh * 60) % 1440;
  return { hhmm: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, day };
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function dateWord(dayOff){
  const B = S.bodies; if (!B || !B.date) return '';
  const [y, mo, d] = B.date.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d + (dayOff || 0)));
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}`;
}
const hhmmStr = h => { const m = Math.round(h * 60) % 1440; return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; };

// The Sun, the Moon and the planets at one sample, from bodies.json. Positions
// are the daemon's own for that instant, read, not computed.
function bodiesAt(si){
  const B = S.bodies; if (!B) return [];
  const i = Math.max(0, Math.min(B.n - 1, si));
  const out = [
    { kind:'sun',  name:'Sun',  az:B.sun_az[i],  alt:B.sun_alt[i] },
    { kind:'moon', name:'Moon', az:B.moon_az[i], alt:B.moon_alt[i], ang:B.moon_ang[i],
      illum:B.moon_illum[i], waxing:!!B.moon_wax[i] },
  ];
  B.names.forEach((nm, k) => out.push({ kind:'planet', name:nm, az:B.pl_az[k][i], alt:B.pl_alt[k][i],
                                        mag:B.pl_mag[k][i], ang:B.pl_ang[k][i] }));
  return out;
}

// ── frame lookup ─────────────────────────────────────────────────────────────""")

# ── the tap also names the Sun, Moon and planets ─────────────────────────────
rep("""  if (best == null){ $('info').classList.remove('on'); S.marked = null; draw(); return; }
  const [az, alt] = radecToAltaz(sk.ra[best], sk.dec[best], c.lat, c.lst);""",
"""  // The Moon and the planets are the brightest things in the frame and they
  // are not catalogue stars: test them too, against the daemon's positions for
  // this frame's sample. A disc is bigger than a point, so it gets a wider
  // reach, and it wins over a star under the same finger.
  let body = null, bdd = (R * 1.4) * (R * 1.4);
  for (const b of bodiesAt(c.sample)){
    if (b.alt <= -1) continue;                      // discs are drawn above the horizon only
    if (b.kind === 'sun' && S.sunOff) continue;     // no Sun in the planetarium pass
    const p = projectDir(dirAltaz(b.az, b.alt), cb, w, h);
    if (!p) continue;
    const d = (p[0]-x)*(p[0]-x) + (p[1]-y)*(p[1]-y);
    if (d < bdd){ bdd = d; body = b; }
  }
  if (body){
    const e = { ...body, framed:true };
    S.marked = e; showCard(e, null, null); draw(); return;
  }
  if (best == null){ $('info').classList.remove('on'); S.marked = null; draw(); return; }
  const [az, alt] = radecToAltaz(sk.ra[best], sk.dec[best], c.lat, c.lst);""")

# ── the card: sentences, then numbers ────────────────────────────────────────
rep("""  if (hip) rows.push(['HIP', hip]);
  box.innerHTML =
    `<span class="x" onclick="document.getElementById('info').classList.remove('on')">${ICON.close}</span>
     <div class="n">${e.name}</div>
     <div class="d">${kindStr(e)}</div>
     <dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl>
     ${note ? `<div class="note" style="padding:9px 0 0">${note}</div>` : ''}`;
  box.classList.add('on');
}""",
"""  if (hip) rows.push(['HIP', hip]);
  const say = sentences(e, hip);
  const conName = e.kind === 'star' && e.con ? (CON_LATIN[e.con] || e.con) : null;
  const conBtn = conName && S.fig && S.fig[e.con]
    ? `<button class="lnk" id="showcon">Show ${conName}${CON_EN[e.con] ? ', ' + enMid(CON_EN[e.con]) : ''}</button>` : '';
  const kindLine = e.kind === 'star' && conName
    ? `Star · ${conName}${CON_EN[e.con] && CON_EN[e.con] !== conName ? ', ' + enMid(CON_EN[e.con]) : ''}` : kindStr(e);
  box.innerHTML =
    `<span class="x" onclick="document.getElementById('info').classList.remove('on')">${ICON.close}</span>
     <div class="n">${e.name}</div>
     <div class="d">${kindLine}</div>
     ${say.map(t => `<p class="say${t.birth ? ' birth' : ''}">${t.text}</p>`).join('')}
     ${note ? `<div class="note" style="padding:9px 0 0">${note}</div>` : ''}
     ${conBtn}
     <details><summary>Details</summary>
       <dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl></details>`;
  box.classList.add('on');
  const b = $('showcon');
  if (b) b.onclick = () => { if (showFigure(e.con, conName)) { toast(`${conName} — tap the sky to clear the figure`); draw(); } };
}

// ── what the card says ───────────────────────────────────────────────────────
// Every sentence reads one field and is skipped when that field is absent. The
// facts come from facts.json (the day's tables), the catalogue (sky.json) and
// the track (bodies.json). Spellings only: no sentence introduces a number
// that was not already there.
let BRIGHT_RANK = null;   // HIP → rank among the named stars by magnitude, built once
function brightRank(hip){
  if (!BRIGHT_RANK){
    const sk = S.sky, idx = [...Array(sk.n).keys()].sort((a, b) => sk.mag[a] - sk.mag[b]);
    BRIGHT_RANK = new Map(); idx.forEach((i, r) => BRIGHT_RANK.set(sk.hip[i], r + 1));
  }
  return BRIGHT_RANK.get(hip);
}
// Where a star rises and sets, from its declination and the latitude: the
// rising azimuth is acos(sin δ / cos φ), the setting one its mirror. Pure
// spherical geometry on two held numbers, the same kind of arithmetic as the
// projection that puts the star under the finger.
function riseSetCompass(dec, lat){
  const k = Math.sin(dec * D2R) / Math.cos(lat * D2R);
  if (Math.abs(k) > 1) return null;
  const az = Math.acos(k) * R2D;
  return { rise: compass(az), set: compass(360 - az) };
}
// Where a thing stood at the birth instant (sample 0 of the track), in words.
function birthLine(e){
  const B = S.bodies; if (!B) return null;
  let az, alt;
  if (e.kind === 'star' && e.ra != null) [az, alt] = radecToAltaz(e.ra, e.dec, B.lat, B.lst[0]);
  else { const b = bodiesAt(0).find(b => b.name === e.name); if (!b) return null; az = b.az; alt = b.alt; }
  const when = hhmmStr(B.t0_h);
  if (alt <= 0) return `At ${when}, the hour this sky is made for, ${e.name === 'Sun' || e.name === 'Moon' ? 'the ' : ''}${e.name} was below the horizon, ${(-alt).toFixed(0)}° down in the ${compass(az)}.`;
  const sun = B.sun_alt[0];
  const seen = e.kind === 'sun' ? '' : e.kind === 'moon' ? '' : sun > 0 ? ', hidden in daylight'
             : sun > -18 ? ', in the twilight' : ', in a dark sky';
  return `At ${when}, the hour this sky is made for, ${e.name === 'Sun' || e.name === 'Moon' ? 'the ' : ''}${e.name} stood ${alt.toFixed(0)}° up in the ${compass(az)}${seen}.`;
}
function sentences(e, hip){
  const out = [], F = S.facts, B = S.bodies;
  const year = B && B.date ? +B.date.slice(0, 4) : (F && F.date ? +F.date.slice(0, 4) : null);
  if (e.kind === 'star'){
    const h = hip || +e.key || null;
    const r = h ? brightRank(h) : null;
    const st = h && F && F.stars && F.stars[h];
    const bits = [];
    if (r === 1) bits.push('The brightest star of the night sky.');
    else if (r && r <= 10) bits.push(`The ${ordinal(r)} brightest star of the night sky.`);
    const sw = st && spectralWords(st.spect); if (sw) bits.push(sw);
    if (st && Number.isFinite(st.lum_sun) && st.lum_sun >= 2) bits.push(`It shines with the light of ${numStr(st.lum_sun)} Suns.`);
    if (bits.length) out.push({ text: bits.join(' ') });
    if (st && Number.isFinite(st.ly) && st.ly >= 2 && year){
      const left = year - Math.round(st.ly);
      out.push({ text: `${lyStr(st.ly)} away: the light you see tonight left it ${st.ly >= 100 ? 'around' : 'in'} ${left}.` });
    }
    if (st){
      const rs = e.dec != null && B ? riseSetCompass(e.dec, B.lat) : null;
      if (st.always_up) out.push({ text: 'That day it never set: from here it circles the pole and stays above the horizon all night.' });
      else if (st.never_up) out.push({ text: 'That day it never rose above the horizon from here.' });
      else {
        const p = [];
        if (st.rise) p.push(`rose at ${st.rise}${rs ? ' in the ' + rs.rise : ''}`);
        if (st.highest) p.push(`stood highest at ${st.highest}${Number.isFinite(st.highest_alt_deg) ? `, ${st.highest_alt_deg.toFixed(0)}° up` : ''}`);
        if (st.set) p.push(`set at ${st.set}${rs ? ' in the ' + rs.set : ''}`);
        if (p.length) out.push({ text: `That day it ${p.join(', ')}.` });
      }
    }
  } else if (e.kind === 'moon'){
    const m = F && F.moon;
    const bits = [];
    if (Number.isFinite(e.illum)) bits.push(`${(e.illum * 100).toFixed(0)}% lit and ${e.waxing ? 'waxing' : 'waning'} at this moment.`);
    if (m && Number.isFinite(m.distance_km)) bits.push(`${numStr(Math.round(m.distance_km))} km away that day.`);
    if (bits.length) out.push({ text: bits.join(' ') });
    if (m){
      const p = [];
      if (m.rise) p.push(`rose at ${m.rise}`); if (m.highest) p.push(`stood highest at ${m.highest}`); if (m.set) p.push(`set at ${m.set}`);
      if (p.length) out.push({ text: `That day the Moon ${p.join(', ')}.` });
    }
  } else if (e.kind === 'planet'){
    const pl = F && (F.planets || []).find(p => p.name === e.name);
    if (Number.isFinite(e.mag)) out.push({ text: `Shining at magnitude ${e.mag.toFixed(1)} at this moment${e.mag < 0 ? ', brighter than almost every star' : ''}.` });
    if (pl){
      const p = [];
      if (pl.rise) p.push(`rose at ${pl.rise}`);
      if (pl.highest) p.push(`stood highest at ${pl.highest}${Number.isFinite(pl.highest_alt_deg) ? `, ${pl.highest_alt_deg.toFixed(0)}° up` : ''}`);
      if (pl.set) p.push(`set at ${pl.set}`);
      if (p.length) out.push({ text: `That day ${e.name} ${p.join(', ')}.` });
    }
  } else if (e.kind === 'sun'){
    const d = F && F.day;
    if (d && d.sunrise && d.sunset) out.push({ text: `Rose at ${d.sunrise} and set at ${d.sunset}${Number.isFinite(d.day_length_h) ? `: ${hoursStr(d.day_length_h)} of daylight` : ''}.` });
    if (d && d.dark_from && d.dark_until) out.push({ text: `Fully dark from ${d.dark_from} to ${d.dark_until}.` });
  } else if (e.kind === 'con'){
    if (CON_EN[e.con] && CON_EN[e.con] !== e.name) out.push({ text: `${CON_EN[e.con]}. Drawn here as H. A. Rey drew it, over the real stars.` });
  }
  const b = birthLine(e); if (b) out.push({ text: b, birth: true });
  return out;
}""")

# ── the names layer ──────────────────────────────────────────────────────────
rep("""  compass(c, cb);

  const fg = S.figure ? drawFigure(S.figure, at) : null;""",
"""  compassMarks(c, cb);
  if (S.names) drawNames(c, cb, at);

  const fg = S.figure ? drawFigure(S.figure, at) : null;""")
rep("""function compass(c, cb){
  const day = S.sunOff ? 0 : Math.max(0, Math.min(1, (c.sun + 4) / 8));""",
"""// Names on the sky: the Moon and the planets, and the stars brighter than
// magnitude 1.6 that the frame actually paints. Labels that would collide are
// dropped, the brighter first served, so the layer never becomes a thicket.
function drawNames(c, cb, at){
  const q = cpx(), placed = [];
  const marked = S.marked ? S.marked.name : null;
  const put = (p, text, bright) => {
    if (!p || text === marked) return;
    const x = p[0] + 9*q, y = p[1] - 7*q, w = text.length * 6.6*q, h = 14*q;
    for (const r of placed) if (Math.abs(r.x - x) < (r.w + w) / 2 && Math.abs(r.y - y) < h) return;
    placed.push({ x, y, w });
    octx.font = `500 ${11.5*q}px ui-sans-serif,system-ui,sans-serif`; octx.textAlign = 'left';
    octx.lineWidth = 3*q; octx.strokeStyle = 'rgba(0,0,0,.6)'; octx.strokeText(text, x, y);
    octx.fillStyle = bright ? 'rgba(255,228,170,.92)' : 'rgba(200,216,240,.85)'; octx.fillText(text, x, y);
  };
  for (const b of bodiesAt(c.sample)){
    if (b.alt <= -1) continue;
    if (b.kind === 'sun' && S.sunOff) continue;
    if (b.kind === 'planet' && b.mag > 2.5) continue;
    put(projectDir(dirAltaz(b.az, b.alt), cb, S.Wn, S.Hn), b.name, true);
  }
  const sk = S.sky;
  for (let i = 0; i < sk.n; i++){
    if (sk.mag[i] > 1.6 || sk.mag[i] > c.maglim || !sk.name[i]) continue;
    const [az, alt] = radecToAltaz(sk.ra[i], sk.dec[i], c.lat, c.lst);
    if (!S.sunOff && alt <= 0) continue;
    put(projectDir(dirAltaz(az, alt), cb, S.Wn, S.Hn), sk.name[i], false);
  }
}

function compassMarks(c, cb){
  const day = S.sunOff ? 0 : Math.max(0, Math.min(1, (c.sun + 4) / 8));""")

# ── the clock: local time of the sky on screen, and how it is lit ────────────
rep("""function syncScrub(){
  const v = vid();
  if (v.duration) $('scrub').value = Math.round(v.currentTime / v.duration * 1000);
  const t = v.currentTime;
  $('clk').textContent = `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
}""",
"""function syncScrub(){
  const v = vid();
  if (v.duration) $('scrub').value = Math.round(v.currentTime / v.duration * 1000);
  const t = v.currentTime;
  // The clock is the sky's own local time, not the film's seconds: the film
  // runs a warped clock and the planetarium pass a uniform one, and neither
  // means anything to the person watching. Both carry the sample on screen.
  const f = side(), ck = f && S.bodies ? sampleClock(f.sample[frameIdx(f, t)]) : null;
  if (ck){
    $('clk').textContent = ck.hhmm;
    const sun = f.sun_alt[frameIdx(f, t)];
    $('now').textContent = `${lightWord(sun)} · ${dateWord(ck.day)}`;
  } else {
    $('clk').textContent = `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  }
}""")

# ── chrome: names toggle, hint, day line ─────────────────────────────────────
rep("""$('head').onclick = () => $('panel').classList.toggle('closed');""",
"""$('head').onclick = () => $('panel').classList.toggle('closed');
// The names layer remembers itself on this device.
let store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
              set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
function setNames(on){
  S.names = on; $('names').classList.toggle('lit', on); store.set('sky.names', on ? '1' : '0'); draw();
}
$('names').onclick = () => setNames(!S.names);
// The hint shows once per device and leaves at the first tap, drag or search.
function hintOff(){ const h = $('hint'); if (!h.classList.contains('off')){ h.classList.add('off'); store.set('sky.hinted', '1'); } }
['pointerdown'].forEach(ev => $('tapzone').addEventListener(ev, hintOff));
$('q').addEventListener('input', hintOff);
// The day, in one line, always on the panel; the full table one tap away.
function dayLine(){
  const F = S.facts; if (!F) return;
  const d = F.day || {}, m = F.moon || {};
  const bits = [];
  if (d.sunrise) bits.push(`sunrise <b>${d.sunrise}</b>`);
  if (d.sunset)  bits.push(`sunset <b>${d.sunset}</b>`);
  if (Number.isFinite(m.illuminated_pct)) bits.push(`Moon <b>${m.illuminated_pct.toFixed(0)}%</b>`);
  if (!bits.length) return;
  const el = $('day'); el.innerHTML = `This day · ${bits.join(' · ')} ›`; el.style.display = ''; el.onclick = showDay;
}""")
# the day card gets a header with the date and the showers
rep("""     <div class="n">The day</div>
     <div class="d">local time · ${F.tz || ''}</div>""",
"""     <div class="n">The day</div>
     <div class="d">${F.date ? F.date.split('-').reverse().map((v, i) => i === 1 ? MONTHS[+v - 1] : +v).join(' ') + ' · ' : ''}local time${F.tz ? ' · ' + F.tz : ''}</div>""")
rep("""     ${pl ? `<table class="pt"><tr><th></th><th>rises</th><th>sets</th></tr>${pl}</table>` : ''}`;
  box.classList.add('on');
}""",
"""     ${pl ? `<table class="pt"><tr><th></th><th>rises</th><th>sets</th></tr>${pl}</table>` : ''}
     ${(F.showers || []).length ? `<div class="note" style="padding:9px 0 0">Meteor showers active: ${F.showers.map(s => s.name || s).join(', ')}.</div>` : ''}`;
  box.classList.add('on');
}""")

# ── boot: load bodies.json, Latin names, names layer, hint, day line ─────────
rep("""  S.facts = await load('facts.json').catch(() => null);""",
"""  S.facts = await load('facts.json').catch(() => null);
  // The track's per-sample bodies, for the tap, the clock and the birth line.
  // Optional: a bake without it loses those three things and nothing else.
  S.bodies = await load('bodies.json').catch(() => null);""")
rep("""  // English constellation names, so "the hunting dogs" can find Canes Venatici.
  for (const e of seek) if (e.kind === 'con' && e.english) CON_EN[e.con] = e.english;""",
"""  // English constellation names, so "the hunting dogs" can find Canes Venatici,
  // and the Latin ones, so a star's card can name its constellation in full.
  for (const e of seek) if (e.kind === 'con'){ if (e.english) CON_EN[e.con] = e.english; CON_LATIN[e.con] = e.name; }
  dayLine();
  setNames(store.get('sky.names') === '1');
  if (store.get('sky.hinted') !== '1') setTimeout(() => $('hint').classList.remove('off'), 1500);""")
rep("""let CON_EN = {};""", """let CON_EN = {}, CON_LATIN = {};
// "The Great Dog" is how the catalogue spells it; mid-sentence it is "the Great Dog".
const enMid = en => en ? en.replace(/^The /, 'the ') : en;""")

open(dst_path, 'w', encoding='utf-8').write(s)
print("patched →", dst_path)
