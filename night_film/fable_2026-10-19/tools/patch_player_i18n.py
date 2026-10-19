"""English, Spanish and French: every sentence, label and name goes through one table.
Applied on top of the usability patch. Anchors must match exactly once."""
import sys
src_path, dst_path = sys.argv[1], sys.argv[2]
s = open(src_path, encoding='utf-8').read()
def rep(old, new):
    global s
    n = s.count(old)
    if n != 1: raise SystemExit(f"anchor matched {n}x (want 1):\n{old[:200]}")
    s = s.replace(old, new)

# ── the table ────────────────────────────────────────────────────────────────
rep("""const $ = id => document.getElementById(id);
const D2R = Math.PI / 180, R2D = 180 / Math.PI;""",
r"""const $ = id => document.getElementById(id);
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

// ── the language ─────────────────────────────────────────────────────────────
// Chosen once: `?lang=es` in the link, else the stamp the bundler can put on
// <html data-lang>, else the device's own language; English otherwise. Every
// word the customer reads comes from the one table below, so a sentence can
// never be half in one language. Catalogue names (Sirius, Cygnus) stay as the
// IAU spells them; the Sun, the Moon, the planets and the constellations'
// everyday names are translated.
const LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  const d = document.documentElement.getAttribute('data-lang');
  const l = String(q || d || navigator.language || 'en').slice(0, 2).toLowerCase();
  return ['en', 'es', 'fr'].includes(l) ? l : 'en';
})();
document.documentElement.lang = LANG;
const LOCALE = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR' }[LANG];
const cap = t => t ? t[0].toUpperCase() + t.slice(1) : t;
// A number spelled for the language: 370,765 / 370.765 / 370 765; −1.8 / −1,8.
const fmtN = (v, d) => Number(v).toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });

const CON_LOC = {
  es: { And:'Andrómeda', Ant:'la Máquina Neumática', Aps:'el Ave del Paraíso', Aqr:'Acuario', Aql:'el Águila', Ara:'el Altar', Ari:'Aries',
    Aur:'el Cochero', Boo:'el Boyero', Cae:'el Cincel', Cam:'la Jirafa', Cnc:'Cáncer', CVn:'los Perros de Caza', CMa:'el Can Mayor',
    CMi:'el Can Menor', Cap:'Capricornio', Car:'la Quilla', Cas:'Casiopea', Cen:'el Centauro', Cep:'Cefeo', Cet:'la Ballena',
    Cha:'el Camaleón', Cir:'el Compás', Col:'la Paloma', Com:'la Cabellera de Berenice', CrA:'la Corona Austral', CrB:'la Corona Boreal',
    Crv:'el Cuervo', Crt:'la Copa', Cru:'la Cruz del Sur', Cyg:'el Cisne', Del:'el Delfín', Dor:'el Dorado', Dra:'el Dragón',
    Equ:'el Caballito', Eri:'Erídano', For:'el Horno', Gem:'Géminis', Gru:'la Grulla', Her:'Hércules', Hor:'el Reloj', Hya:'la Hidra',
    Hyi:'la Hidra Macho', Ind:'el Indio', Lac:'el Lagarto', Leo:'Leo', LMi:'el León Menor', Lep:'la Liebre', Lib:'Libra', Lup:'el Lobo',
    Lyn:'el Lince', Lyr:'la Lira', Men:'la Mesa', Mic:'el Microscopio', Mon:'el Unicornio', Mus:'la Mosca', Nor:'la Escuadra',
    Oct:'el Octante', Oph:'Ofiuco', Ori:'Orión', Pav:'el Pavo', Peg:'Pegaso', Per:'Perseo', Phe:'el Fénix', Pic:'el Pintor', Psc:'Piscis',
    PsA:'el Pez Austral', Pup:'la Popa', Pyx:'la Brújula', Ret:'el Retículo', Sge:'la Flecha', Sgr:'Sagitario', Sco:'Escorpio',
    Scl:'el Escultor', Sct:'el Escudo', Ser:'la Serpiente', Sex:'el Sextante', Tau:'Tauro', Tel:'el Telescopio', Tri:'el Triángulo',
    TrA:'el Triángulo Austral', Tuc:'el Tucán', UMa:'la Osa Mayor', UMi:'la Osa Menor', Vel:'las Velas', Vir:'Virgo', Vol:'el Pez Volador',
    Vul:'la Zorra' },
  fr: { And:'Andromède', Ant:'la Machine pneumatique', Aps:"l'Oiseau de paradis", Aqr:'le Verseau', Aql:"l'Aigle", Ara:"l'Autel",
    Ari:'le Bélier', Aur:'le Cocher', Boo:'le Bouvier', Cae:'le Burin', Cam:'la Girafe', Cnc:'le Cancer', CVn:'les Chiens de chasse',
    CMa:'le Grand Chien', CMi:'le Petit Chien', Cap:'le Capricorne', Car:'la Carène', Cas:'Cassiopée', Cen:'le Centaure', Cep:'Céphée',
    Cet:'la Baleine', Cha:'le Caméléon', Cir:'le Compas', Col:'la Colombe', Com:'la Chevelure de Bérénice', CrA:'la Couronne australe',
    CrB:'la Couronne boréale', Crv:'le Corbeau', Crt:'la Coupe', Cru:'la Croix du Sud', Cyg:'le Cygne', Del:'le Dauphin', Dor:'la Dorade',
    Dra:'le Dragon', Equ:'le Petit Cheval', Eri:"l'Éridan", For:'le Fourneau', Gem:'les Gémeaux', Gru:'la Grue', Her:'Hercule',
    Hor:"l'Horloge", Hya:"l'Hydre", Hyi:"l'Hydre mâle", Ind:"l'Indien", Lac:'le Lézard', Leo:'le Lion', LMi:'le Petit Lion',
    Lep:'le Lièvre', Lib:'la Balance', Lup:'le Loup', Lyn:'le Lynx', Lyr:'la Lyre', Men:'la Table', Mic:'le Microscope', Mon:'la Licorne',
    Mus:'la Mouche', Nor:'la Règle', Oct:"l'Octant", Oph:'le Serpentaire', Ori:'Orion', Pav:'le Paon', Peg:'Pégase', Per:'Persée',
    Phe:'le Phénix', Pic:'le Peintre', Psc:'les Poissons', PsA:'le Poisson austral', Pup:'la Poupe', Pyx:'la Boussole', Ret:'le Réticule',
    Sge:'la Flèche', Sgr:'le Sagittaire', Sco:'le Scorpion', Scl:'le Sculpteur', Sct:"l'Écu", Ser:'le Serpent', Sex:'le Sextant',
    Tau:'le Taureau', Tel:'le Télescope', Tri:'le Triangle', TrA:'le Triangle austral', Tuc:'le Toucan', UMa:'la Grande Ourse',
    UMi:'la Petite Ourse', Vel:'les Voiles', Vir:'la Vierge', Vol:'le Poisson volant', Vul:'le Petit Renard' },
};
const BODY_LOC = {
  es: { Sun:'Sol', Moon:'Luna', Mercury:'Mercurio', Venus:'Venus', Mars:'Marte', Jupiter:'Júpiter', Saturn:'Saturno', Uranus:'Urano', Neptune:'Neptuno', Pluto:'Plutón' },
  fr: { Sun:'Soleil', Moon:'Lune', Mercury:'Mercure', Venus:'Vénus', Mars:'Mars', Jupiter:'Jupiter', Saturn:'Saturne', Uranus:'Uranus', Neptune:'Neptune', Pluto:'Pluton' },
};
// Grammatical gender of what a sentence is about (stars are feminine in both
// languages; the planets follow their names).
const GENDER = {
  es: { star:'f', moon:'f', sun:'m', con:'f', Venus:'f' },
  fr: { star:'f', moon:'f', sun:'m', con:'f', Venus:'f', Saturn:'f' },
};
function genderOf(e){
  const g = GENDER[LANG]; if (!g) return 'n';
  return e.kind === 'planet' ? (g[e.name] || 'm') : (g[e.kind] || 'm');
}
// The subject with its article where the language wants one: "the Moon",
// "la Luna", "le Soleil"; planets and stars bare.
function subj(e){
  const n = dispName(e);
  if (e.kind !== 'sun' && e.kind !== 'moon') return n;
  return LANG === 'es' ? (e.kind === 'sun' ? 'el ' : 'la ') + n
       : LANG === 'fr' ? (e.kind === 'sun' ? 'le ' : 'la ') + n : 'the ' + n;
}
const dispName = e => (e.kind === 'sun' || e.kind === 'moon' || e.kind === 'planet') && BODY_LOC[LANG]
  ? (BODY_LOC[LANG][e.name] || e.name) : e.name;

const I18N = {
  en: {
    placeholder: 'Orion, Sirius, the swan…',
    hint: 'Tap a star to name it · type a name to fly there · drag to look around',
    sunOn: 'Sunlight on — the day as it was', sunOff: 'Sunlight off — the whole sphere',
    dayBtn: 'The day at this place', namesBtn: 'Names on the sky',
    compass: ['north','north-north-east','north-east','east-north-east','east','east-south-east','south-east','south-south-east',
      'south','south-south-west','south-west','west-south-west','west','west-north-west','north-west','north-north-west'],
    westLetter: 'W',
    light: { day:'daylight', civil:'civil twilight', nautical:'nautical twilight', astro:'astronomical twilight', night:'night' },
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    kind: { con:'Constellation', sun:'The Sun', moon:'The Moon', planet:'Planet', star:'Star' },
    sub:  { con:'constellation', sun:'the Sun', moon:'the Moon', planet:'planet' },
    lbl: { altitude:'altitude', azimuth:'azimuth', magnitude:'magnitude', size:'apparent size', illuminated:'illuminated', phase:'phase',
      distance:'distance', type:'type', luminosity:'luminosity', rises:'rises', highest:'highest', sets:'sets', up:'up', thatDay:'that day',
      neverSet:'never set', neverRose:'never rose', age:'age', days:'days', waxing:'waxing', waning:'waning', xSun:'× the Sun',
      details:'Details', theDay:'The day', localTime:'local time', sunrise:'sunrise', sunset:'sunset', daylight:'daylight',
      fullyDark:'fully dark', moonrise:'moonrise', moonset:'moonset', moonLit:'moon lit', thisDay:'This day', moon:'Moon', sun:'Sun',
      showers:'Meteor showers active' },
    ly: n => `${n} light-year${n === '1' ? '' : 's'}`,
    hours: (h, m) => `${h} h ${m} min`,
    show: name => `Show ${name}`,
    clearFigure: name => `${name} — tap the sky to clear the figure`,
    tooFaint: name => `${name} is too faint to show`,
    neverFramed: name => `${name} is never framed in this film`,
    aboveH: (name, d) => `${name} — ${d}° above the horizon`,
    belowH: (name, d) => `${name} — ${d}° below the horizon`,
    faintNote: mag => `Magnitude ${mag} — far too faint to see, and below what this sky draws.`,
    neverEnters: 'Never enters the frame during this film.',
    farSide: d => `${d}° below the horizon — on the far side of the Earth from where you stood.`,
    brightest: r => r === 1 ? 'The brightest star of the night sky.' : `The ${r}${r===2?'nd':r===3?'rd':'th'} brightest star of the night sky.`,
    colour: { O:['blue','far hotter than the Sun'], B:['blue-white','much hotter than the Sun'], A:['white','hotter than the Sun'],
      F:['yellow-white','a little hotter than the Sun'], G:['yellow','like the Sun in colour'], K:['orange','cooler than the Sun'],
      M:['red','much cooler than the Sun'] },
    spectral: (colour, kind, heat) => { const p = `${colour} ${ {star:'star', giant:'giant', bright:'bright giant', super:'supergiant'}[kind] }`;
      return `${/^[aeiou]/.test(p) ? 'An' : 'A'} ${p}, ${heat}.`; },
    lum: n => `It shines with the light of ${n} Suns.`,
    light_left: (dist, around, year) => `${dist} away: the light you see tonight left it ${around ? 'around' : 'in'} ${year}.`,
    riseSet: (e, p) => { const b = [];
      if (p.rise) b.push(`rose at ${p.rise}${p.riseDir ? ' in the ' + p.riseDir : ''}`);
      if (p.highest) b.push(`stood highest at ${p.highest}${p.highAlt != null ? `, ${p.highAlt}° up` : ''}`);
      if (p.set) b.push(`set at ${p.set}${p.setDir ? ' in the ' + p.setDir : ''}`);
      return b.length ? `That day ${e.kind === 'star' ? 'it' : subj(e)} ${b.join(', ')}.` : null; },
    alwaysUp: 'That day it never set: from here it circles the pole and stays above the horizon all night.',
    neverUp: 'That day it never rose above the horizon from here.',
    moonLit: (p, waxing) => `${p}% lit and ${waxing ? 'waxing' : 'waning'} at this moment.`,
    moonDist: km => `${km} km away that day.`,
    planetMag: (mag, bright) => `Shining at magnitude ${mag} at this moment${bright ? ', brighter than almost every star' : ''}.`,
    sunRiseSet: (rise, set, hours) => `Rose at ${rise} and set at ${set}${hours ? `: ${hours} of daylight` : ''}.`,
    fullyDarkS: (a, b) => `Fully dark from ${a} to ${b}.`,
    conSentence: en => `${en}. Drawn here as H. A. Rey drew it, over the real stars.`,
    seen: { day:', hidden in daylight', twi:', in the twilight', night:', in a dark sky' },
    birth: (when, e, alt, dir, seen) => `At ${when}, the hour this sky is made for, ${subj(e)} stood ${alt}° up in the ${dir}${seen}.`,
    birthBelow: (when, e, d, dir) => `At ${when}, the hour this sky is made for, ${subj(e)} was below the horizon, ${d}° down in the ${dir}.`,
    conLine: (latin, loc) => loc && loc !== latin ? `${latin}, ${loc}` : latin,
  },
  es: {
    placeholder: 'Orión, Sirius, el cisne…',
    hint: 'Toca una estrella para saber su nombre · escribe un nombre para volar hasta ella · arrastra para mirar alrededor',
    sunOn: 'Luz del Sol encendida: el día tal como fue', sunOff: 'Luz del Sol apagada: toda la esfera',
    dayBtn: 'El día en este lugar', namesBtn: 'Nombres en el cielo',
    compass: ['norte','nornoreste','noreste','estenoreste','este','estesureste','sureste','sursureste','sur','sursuroeste',
      'suroeste','oestesuroeste','oeste','oestenoroeste','noroeste','nornoroeste'],
    westLetter: 'O',
    light: { day:'luz de día', civil:'crepúsculo civil', nautical:'crepúsculo náutico', astro:'crepúsculo astronómico', night:'noche' },
    months: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    kind: { con:'Constelación', sun:'El Sol', moon:'La Luna', planet:'Planeta', star:'Estrella' },
    sub:  { con:'constelación', sun:'el Sol', moon:'la Luna', planet:'planeta' },
    lbl: { altitude:'altura', azimuth:'acimut', magnitude:'magnitud', size:'tamaño aparente', illuminated:'iluminada', phase:'fase',
      distance:'distancia', type:'tipo', luminosity:'luminosidad', rises:'sale', highest:'culmina', sets:'se pone', up:'de altura', thatDay:'ese día',
      neverSet:'no se puso', neverRose:'no salió', age:'edad', days:'días', waxing:'creciente', waning:'menguante', xSun:'× el Sol',
      details:'Detalles', theDay:'El día', localTime:'hora local', sunrise:'amanecer', sunset:'atardecer', daylight:'luz de día',
      fullyDark:'noche cerrada', moonrise:'sale la Luna', moonset:'se pone la Luna', moonLit:'Luna iluminada', thisDay:'Este día', moon:'Luna', sun:'Sol',
      showers:'Lluvias de meteoros activas' },
    ly: n => `${n} año${n === '1' ? '' : 's'} luz`,
    hours: (h, m) => `${h} h ${m} min`,
    show: name => `Ver ${name}`,
    clearFigure: name => `${name}: toca el cielo para quitar la figura`,
    tooFaint: name => `${name} es demasiado tenue para mostrarse`,
    neverFramed: name => `${name} nunca entra en el encuadre de esta película`,
    aboveH: (name, d) => `${name}: ${d}° sobre el horizonte`,
    belowH: (name, d) => `${name}: ${d}° bajo el horizonte`,
    faintNote: mag => `Magnitud ${mag}: demasiado tenue para verse, por debajo de lo que este cielo dibuja.`,
    neverEnters: 'Nunca entra en el encuadre durante esta película.',
    farSide: d => `${d}° bajo el horizonte: al otro lado de la Tierra desde donde estabas.`,
    brightest: r => r === 1 ? 'La estrella más brillante del cielo nocturno.'
      : `La ${['','','segunda','tercera','cuarta','quinta','sexta','séptima','octava','novena','décima'][r]} estrella más brillante del cielo nocturno.`,
    colour: { O:['azul','mucho más caliente que el Sol'], B:['azul blanquecina','mucho más caliente que el Sol'], A:['blanca','más caliente que el Sol'],
      F:['blanca amarillenta','algo más caliente que el Sol'], G:['amarilla','del color del Sol'], K:['naranja','más fría que el Sol'],
      M:['roja','mucho más fría que el Sol'] },
    spectral: (colour, kind, heat) => `Una ${ {star:'estrella', giant:'gigante', bright:'gigante brillante', super:'supergigante'}[kind] } ${colour}, ${heat}.`,
    lum: n => `Brilla con la luz de ${n} soles.`,
    light_left: (dist, around, year) => `A ${dist}: la luz que ves esta noche salió de ella ${around ? 'hacia' : 'en'} ${year}.`,
    riseSet: (e, p) => { const b = [];
      if (p.rise) b.push(`salió a las ${p.rise}${p.riseDir ? ' por el ' + p.riseDir : ''}`);
      if (p.highest) b.push(`culminó a las ${p.highest}${p.highAlt != null ? `, a ${p.highAlt}° de altura` : ''}`);
      if (p.set) b.push(`se puso a las ${p.set}${p.setDir ? ' por el ' + p.setDir : ''}`);
      return b.length ? `Ese día ${e.kind === 'star' ? '' : subj(e) + ' '}${b.join(', ')}.` : null; },
    alwaysUp: 'Ese día no se puso: desde aquí gira en torno al polo y queda sobre el horizonte toda la noche.',
    neverUp: 'Ese día no llegó a salir sobre el horizonte desde aquí.',
    moonLit: (p, waxing) => `Iluminada al ${p} % y ${waxing ? 'creciente' : 'menguante'} en este momento.`,
    moonDist: km => `A ${km} km ese día.`,
    planetMag: (mag, bright) => `Brilla con magnitud ${mag} en este momento${bright ? ', más que casi cualquier estrella' : ''}.`,
    sunRiseSet: (rise, set, hours) => `Salió a las ${rise} y se puso a las ${set}${hours ? `: ${hours} de luz de día` : ''}.`,
    fullyDarkS: (a, b) => `Noche cerrada de ${a} a ${b}.`,
    conSentence: loc => `${cap(loc)}. Dibujada como la dibujó H. A. Rey, sobre las estrellas reales.`,
    seen: { day:', oculta por la luz del día', twi:', en el crepúsculo', night:', en un cielo oscuro' },
    birth: (when, e, alt, dir, seen) => `A las ${when}, la hora para la que está hecho este cielo, ${subj(e)} estaba a ${alt}° de altura por el ${dir}${seen.replace('oculta', genderOf(e) === 'f' ? 'oculta' : 'oculto')}.`,
    birthBelow: (when, e, d, dir) => `A las ${when}, la hora para la que está hecho este cielo, ${subj(e)} estaba bajo el horizonte, ${d}° por debajo, hacia el ${dir}.`,
    conLine: (latin, loc) => loc ? `${latin}, ${loc}` : latin,
  },
  fr: {
    placeholder: 'Orion, Sirius, le cygne…',
    hint: 'Touchez une étoile pour son nom · tapez un nom pour y voler · faites glisser pour regarder autour',
    sunOn: 'Lumière du Soleil allumée : le jour tel qu\'il fut', sunOff: 'Lumière du Soleil éteinte : toute la sphère',
    dayBtn: 'Le jour en ce lieu', namesBtn: 'Les noms sur le ciel',
    compass: ['nord','nord-nord-est','nord-est','est-nord-est','est','est-sud-est','sud-est','sud-sud-est','sud','sud-sud-ouest',
      'sud-ouest','ouest-sud-ouest','ouest','ouest-nord-ouest','nord-ouest','nord-nord-ouest'],
    westLetter: 'O',
    light: { day:'plein jour', civil:'crépuscule civil', nautical:'crépuscule nautique', astro:'crépuscule astronomique', night:'nuit' },
    months: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    kind: { con:'Constellation', sun:'Le Soleil', moon:'La Lune', planet:'Planète', star:'Étoile' },
    sub:  { con:'constellation', sun:'le Soleil', moon:'la Lune', planet:'planète' },
    lbl: { altitude:'hauteur', azimuth:'azimut', magnitude:'magnitude', size:'taille apparente', illuminated:'éclairée', phase:'phase',
      distance:'distance', type:'type', luminosity:'luminosité', rises:'se lève', highest:'culmine', sets:'se couche', up:'de hauteur', thatDay:'ce jour-là',
      neverSet:'ne s\'est pas couchée', neverRose:'ne s\'est pas levée', age:'âge', days:'jours', waxing:'croissante', waning:'décroissante', xSun:'× le Soleil',
      details:'Détails', theDay:'Le jour', localTime:'heure locale', sunrise:'lever du Soleil', sunset:'coucher du Soleil', daylight:'durée du jour',
      fullyDark:'nuit noire', moonrise:'lever de la Lune', moonset:'coucher de la Lune', moonLit:'Lune éclairée', thisDay:'Ce jour', moon:'Lune', sun:'Soleil',
      showers:'Essaims de météores actifs' },
    ly: n => `${n} année${n === '1' ? '' : 's'}-lumière`,
    hours: (h, m) => `${h} h ${m} min`,
    show: name => `Voir ${name}`,
    clearFigure: name => `${name} : touchez le ciel pour effacer la figure`,
    tooFaint: name => `${name} est trop faible pour être montrée`,
    neverFramed: name => `${name} n'entre jamais dans le cadre de ce film`,
    aboveH: (name, d) => `${name} : ${d}° au-dessus de l'horizon`,
    belowH: (name, d) => `${name} : ${d}° sous l'horizon`,
    faintNote: mag => `Magnitude ${mag} : bien trop faible pour être vue, en deçà de ce que ce ciel dessine.`,
    neverEnters: 'N\'entre jamais dans le cadre pendant ce film.',
    farSide: d => `${d}° sous l'horizon : de l'autre côté de la Terre par rapport à l'endroit où vous étiez.`,
    brightest: r => r === 1 ? 'L\'étoile la plus brillante du ciel nocturne.'
      : `La ${['','','deuxième','troisième','quatrième','cinquième','sixième','septième','huitième','neuvième','dixième'][r]} étoile la plus brillante du ciel nocturne.`,
    colour: { O:['bleue','bien plus chaude que le Soleil'], B:['bleu-blanc','beaucoup plus chaude que le Soleil'], A:['blanche','plus chaude que le Soleil'],
      F:['blanc-jaune','un peu plus chaude que le Soleil'], G:['jaune','de la couleur du Soleil'], K:['orange','plus froide que le Soleil'],
      M:['rouge','bien plus froide que le Soleil'] },
    spectral: (colour, kind, heat) => `Une ${ {star:'étoile', giant:'géante', bright:'géante brillante', super:'supergéante'}[kind] } ${colour}, ${heat}.`,
    lum: n => `Elle brille de la lumière de ${n} soleils.`,
    light_left: (dist, around, year) => `À ${dist} : la lumière que vous voyez ce soir l'a quittée ${around ? 'vers' : 'en'} ${year}.`,
    riseSet: (e, p) => { const b = [], f = genderOf(e) === 'f' ? 'e' : '';
      if (p.rise) b.push(`s'est levé${f} à ${p.rise}${p.riseDir ? ' ' + p.riseDir : ''}`);
      if (p.highest) b.push(`a culminé à ${p.highest}${p.highAlt != null ? `, à ${p.highAlt}° de hauteur` : ''}`);
      if (p.set) b.push(`s'est couché${f} à ${p.set}${p.setDir ? ' ' + p.setDir : ''}`);
      return b.length ? `Ce jour-là, ${e.kind === 'star' ? 'elle' : subj(e)} ${b.join(', ')}.` : null; },
    alwaysUp: 'Ce jour-là, elle ne s\'est pas couchée : d\'ici elle tourne autour du pôle et reste au-dessus de l\'horizon toute la nuit.',
    neverUp: 'Ce jour-là, elle ne s\'est pas levée au-dessus de l\'horizon d\'ici.',
    moonLit: (p, waxing) => `Éclairée à ${p} % et ${waxing ? 'croissante' : 'décroissante'} à cet instant.`,
    moonDist: km => `À ${km} km ce jour-là.`,
    planetMag: (mag, bright) => `Brille à la magnitude ${mag} à cet instant${bright ? ', plus que presque toutes les étoiles' : ''}.`,
    sunRiseSet: (rise, set, hours) => `Levé à ${rise}, couché à ${set}${hours ? ` : ${hours} de jour` : ''}.`,
    fullyDarkS: (a, b) => `Nuit noire de ${a} à ${b}.`,
    conSentence: loc => `${cap(loc)}. Dessinée comme H. A. Rey l'a dessinée, sur les vraies étoiles.`,
    seen: { day:', noyée dans la lumière du jour', twi:', dans le crépuscule', night:', dans un ciel noir' },
    birth: (when, e, alt, dir, seen) => `À ${when}, l'heure pour laquelle ce ciel est fait, ${subj(e)} se trouvait à ${alt}° de hauteur ${dir}${seen.replace('noyée', genderOf(e) === 'f' ? 'noyée' : 'noyé')}.`,
    birthBelow: (when, e, d, dir) => `À ${when}, l'heure pour laquelle ce ciel est fait, ${subj(e)} était sous l'horizon, ${d}° plus bas, ${dir}.`,
    conLine: (latin, loc) => loc ? `${latin}, ${loc}` : latin,
  },
};
const T = I18N[LANG];
// A constellation's everyday name in this language: the table for es/fr, the
// index's English name for en. "" when none is held.
function conLoc(code){ return LANG === 'en' ? (CON_EN[code] || '') : ((CON_LOC[LANG] || {})[code] || ''); }
// French elides "à l'ouest" but says "au sud": the compass points that start
// with a vowel take l', the rest take "au". Spanish and English take a fixed
// preposition handled in the sentence itself.
function dirPhrase(dir, mode){
  if (LANG !== 'fr') return dir;
  const vowel = /^[aeiouéè]/.test(dir);
  return mode === 'toward' ? (vowel ? `vers l'${dir}` : `vers le ${dir}`) : (vowel ? `à l'${dir}` : `au ${dir}`);
}
// A percentage, spaced as the language spaces it: 52% / 52 %.
const pct = v => LANG === 'en' ? `${v}%` : `${v} %`;
// A date in words: 4 September 2026 / 4 de septiembre de 2026 / 4 septembre 2026.
const dateStr = (d, mi, y) => LANG === 'es' ? `${d} de ${T.months[mi]}${y ? ' de ' + y : ''}` : `${d} ${T.months[mi]}${y ? ' ' + y : ''}`;""")

# ── words that were English constants ────────────────────────────────────────
rep("""const COMPASS = ['north','north-north-east','north-east','east-north-east','east','east-south-east',
  'south-east','south-south-east','south','south-south-west','south-west','west-south-west','west',
  'west-north-west','north-west','north-north-west'];
const compass = az => COMPASS[Math.round(((az % 360) + 360) % 360 / 22.5) % 16];
const ordinal = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd'
                        : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
// How the sky is lit at a Sun altitude: the standard twilight boundaries.
function lightWord(sunAlt){
  return sunAlt > 0 ? 'daylight' : sunAlt > -6 ? 'civil twilight' : sunAlt > -12 ? 'nautical twilight'
       : sunAlt > -18 ? 'astronomical twilight' : 'night';
}""",
"""const compass = az => T.compass[Math.round(((az % 360) + 360) % 360 / 22.5) % 16];
// How the sky is lit at a Sun altitude: the standard twilight boundaries.
function lightWord(sunAlt){
  const L = T.light;
  return sunAlt > 0 ? L.day : sunAlt > -6 ? L.civil : sunAlt > -12 ? L.nautical : sunAlt > -18 ? L.astro : L.night;
}""")
rep("""const SPECT = { O:['blue','far hotter than the Sun'], B:['blue-white','much hotter than the Sun'],
  A:['white','hotter than the Sun'], F:['yellow-white','a little hotter than the Sun'],
  G:['yellow','like the Sun in colour'], K:['orange','cooler than the Sun'], M:['red','much cooler than the Sun'] };
function spectralWords(code){
  if (!code) return null;
  const c = SPECT[code[0].toUpperCase()]; if (!c) return null;
  const lum = (code.match(/\\b(Ia|Iab|Ib|II|III|IV|V)\\b/) || code.match(/(III|II|IV|V|I)/) || [])[1] || '';
  const kind = /^I(a|ab|b)?$/.test(lum) ? 'supergiant' : lum === 'II' ? 'bright giant' : lum === 'III' ? 'giant' : 'star';
  const phrase = `${c[0]} ${kind}`;
  return `${/^[aeiou]/.test(phrase) ? 'An' : 'A'} ${phrase}, ${c[1]}.`;
}""",
"""function spectralWords(code){
  if (!code) return null;
  const c = T.colour[code[0].toUpperCase()]; if (!c) return null;
  const lum = (code.match(/\\b(Ia|Iab|Ib|II|III|IV|V)\\b/) || code.match(/(III|II|IV|V|I)/) || [])[1] || '';
  const kind = /^I(a|ab|b)?$/.test(lum) ? 'super' : lum === 'II' ? 'bright' : lum === 'III' ? 'giant' : 'star';
  return T.spectral(c[0], kind, c[1]);
}""")
rep("""const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function dateWord(dayOff){""", """function dateWord(dayOff){""")
rep("""  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}`;""", """  return dateStr(t.getUTCDate(), t.getUTCMonth());""")

# ── search: the local names find things too ──────────────────────────────────
rep("""    const nm = norml(e.name), con = norml(e.con), en = norml(CON_EN[e.con] || '');
    let sc = -1;
    if (nm === q || con === q || en === q) sc = 100;
    else if (nm.startsWith(q) || en.startsWith(q)) sc = 80;
    else if (nm.includes(q) || en.includes(q)) sc = 55;""",
"""    // The IAU name, the everyday name in this language ("el cisne", "le
    // cygne", "the swan") and, for a body, its translated name all count.
    const nm = norml(e.name), con = norml(e.con), en = norml(conLoc(e.con) || CON_EN[e.con] || ''),
          loc = norml(dispName(e));
    let sc = -1;
    if (nm === q || con === q || en === q || loc === q) sc = 100;
    else if (nm.startsWith(q) || en.startsWith(q) || loc.startsWith(q)) sc = 80;
    else if (nm.includes(q) || en.includes(q) || loc.includes(q)) sc = 55;""")
rep("""    case 'con':    return 'constellation';
    case 'sun':    return 'the Sun';
    case 'moon':   return 'the Moon';
    case 'planet': return 'planet';
    default:       return e.con;""",
"""    case 'con':    return T.sub.con;
    case 'sun':    return T.sub.sun;
    case 'moon':   return T.sub.moon;
    case 'planet': return T.sub.planet;
    default:       return e.con;""")
rep("""       <span class="nm">${e.name}</span>""", """       <span class="nm">${dispName(e)}</span>""")
rep("""  $('q').value = e.name;
  $('xq').style.display = '';""", """  $('q').value = dispName(e);
  $('xq').style.display = '';""")
rep("""    showCard(e, null, Number.isFinite(e.mag)
      ? `Magnitude ${e.mag.toFixed(1)} — far too faint to see, and below what this sky draws.`
      : `Never enters the frame during this film.`);
    toast(Number.isFinite(e.mag) ? `${e.name} is too faint to show`
                                 : `${e.name} is never framed in this film`);""",
"""    showCard(e, null, Number.isFinite(e.mag) ? T.faintNote(fmtN(e.mag, 1)) : T.neverEnters);
    toast(Number.isFinite(e.mag) ? T.tooFaint(dispName(e)) : T.neverFramed(dispName(e)));""")
rep("""  showCard(e, null, e.alt < 0
    ? `${(-e.alt).toFixed(0)}° below the horizon — on the far side of the Earth from where you stood.`
    : null);
  toast(shown ? `${e.name} — tap the sky to clear the figure`
              : `${e.name} — ${e.alt >= 0 ? e.alt.toFixed(0)+'° above the horizon'
                                          : (-e.alt).toFixed(0)+'° below the horizon'}`);""",
"""  showCard(e, null, e.alt < 0 ? T.farSide((-e.alt).toFixed(0)) : null);
  toast(shown ? T.clearFigure(dispName(e))
              : e.alt >= 0 ? T.aboveH(dispName(e), e.alt.toFixed(0)) : T.belowH(dispName(e), (-e.alt).toFixed(0)));""")
rep("""  sw.title = off ? 'Sunlight off — the whole sphere' : 'Sunlight on — the day as it was';""",
    """  sw.title = off ? T.sunOff : T.sunOn;""")

# ── the card ─────────────────────────────────────────────────────────────────
rep("""    case 'con':    return 'Constellation';
    case 'sun':    return 'The Sun';
    case 'moon':   return 'The Moon';
    case 'planet': return 'Planet';
    default:       return 'Star' + (e.con ? ' · ' + e.con : '');""",
"""    case 'con':    return T.kind.con;
    case 'sun':    return T.kind.sun;
    case 'moon':   return T.kind.moon;
    case 'planet': return T.kind.planet;
    default:       return T.kind.star + (e.con ? ' · ' + e.con : '');""")
rep("""const numStr = v => v >= 100 ? Math.round(v).toLocaleString('en-GB')
                  : v >= 10 ? v.toFixed(0) : v.toFixed(1);
const lyStr = ly => `${numStr(ly)} light-year${ly >= 0.95 && ly < 1.05 ? '' : 's'}`;
function hoursStr(h){ const m = Math.round(h * 60); return `${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')} min`; }
function pushTimes(rows, o){
  if (o.always_up){ rows.push(['that day', 'never set']); return; }
  if (o.never_up){ rows.push(['that day', 'never rose']); return; }
  if (o.rise) rows.push(['rises', o.rise]);
  if (o.highest) rows.push(['highest', o.highest + (Number.isFinite(o.highest_alt_deg)
                                         ? ` · ${o.highest_alt_deg.toFixed(0)}° up` : '')]);
  if (o.set) rows.push(['sets', o.set]);
}""",
"""const numStr = v => v >= 100 ? fmtN(Math.round(v), 0) : v >= 10 ? fmtN(v, 0) : fmtN(v, 1);
const lyStr = ly => T.ly(numStr(ly));
function hoursStr(h){ const m = Math.round(h * 60); return T.hours(Math.floor(m/60), String(m%60).padStart(2,'0')); }
function pushTimes(rows, o){
  const L = T.lbl;
  if (o.always_up){ rows.push([L.thatDay, L.neverSet]); return; }
  if (o.never_up){ rows.push([L.thatDay, L.neverRose]); return; }
  if (o.rise) rows.push([L.rises, o.rise]);
  if (o.highest) rows.push([L.highest, o.highest + (Number.isFinite(o.highest_alt_deg)
                                         ? ` · ${o.highest_alt_deg.toFixed(0)}° ${L.up}` : '')]);
  if (o.set) rows.push([L.sets, o.set]);
}""")
rep("""  const pl = (F.planets || []).map(p =>
    `<tr><td>${p.name}</td><td>${p.rise || '—'}</td><td>${p.set || '—'}</td></tr>`).join('');
  box.innerHTML =
    `<span class="x" onclick="document.getElementById('info').classList.remove('on')">${ICON.close}</span>
     <div class="n">The day</div>
     <div class="d">${F.date ? F.date.split('-').reverse().map((v, i) => i === 1 ? MONTHS[+v - 1] : +v).join(' ') + ' · ' : ''}local time${F.tz ? ' · ' + F.tz : ''}</div>
     <dl>${r('sunrise', d.sunrise)}${r('sunset', d.sunset)}
         ${r('daylight', Number.isFinite(d.day_length_h) ? hoursStr(d.day_length_h) : '')}
         ${r('fully dark', d.dark_from && d.dark_until ? `${d.dark_from} – ${d.dark_until}` : '')}
         ${r('moonrise', m.rise)}${r('moonset', m.set)}
         ${r('moon lit', Number.isFinite(m.illuminated_pct) ? `${m.illuminated_pct.toFixed(0)}% · ${m.waxing ? 'waxing' : 'waning'}` : '')}</dl>
     ${pl ? `<table class="pt"><tr><th></th><th>rises</th><th>sets</th></tr>${pl}</table>` : ''}
     ${(F.showers || []).length ? `<div class="note" style="padding:9px 0 0">Meteor showers active: ${F.showers.map(s => s.name || s).join(', ')}.</div>` : ''}`;""",
"""  const L = T.lbl;
  const pl = (F.planets || []).map(p =>
    `<tr><td>${dispName({ kind:'planet', name:p.name })}</td><td>${p.rise || '—'}</td><td>${p.set || '—'}</td></tr>`).join('');
  box.innerHTML =
    `<span class="x" onclick="document.getElementById('info').classList.remove('on')">${ICON.close}</span>
     <div class="n">${L.theDay}</div>
     <div class="d">${F.date ? dateStr(+F.date.slice(8, 10), +F.date.slice(5, 7) - 1, +F.date.slice(0, 4)) + ' · ' : ''}${L.localTime}${F.tz ? ' · ' + F.tz : ''}</div>
     <dl>${r(L.sunrise, d.sunrise)}${r(L.sunset, d.sunset)}
         ${r(L.daylight, Number.isFinite(d.day_length_h) ? hoursStr(d.day_length_h) : '')}
         ${r(L.fullyDark, d.dark_from && d.dark_until ? `${d.dark_from} – ${d.dark_until}` : '')}
         ${r(L.moonrise, m.rise)}${r(L.moonset, m.set)}
         ${r(L.moonLit, Number.isFinite(m.illuminated_pct) ? `${pct(m.illuminated_pct.toFixed(0))} · ${m.waxing ? L.waxing : L.waning}` : '')}</dl>
     ${pl ? `<table class="pt"><tr><th></th><th>${L.rises}</th><th>${L.sets}</th></tr>${pl}</table>` : ''}
     ${(F.showers || []).length ? `<div class="note" style="padding:9px 0 0">${L.showers}: ${F.showers.map(s => s.name || s).join(', ')}.</div>` : ''}`;""")
rep("""  if (e.alt != null) rows.push(['altitude', e.alt.toFixed(1)+'°']);
  if (e.az  != null) rows.push(['azimuth',  e.az.toFixed(1)+'°']);""",
"""  const L = T.lbl;
  if (e.alt != null) rows.push([L.altitude, fmtN(e.alt, 1)+'°']);
  if (e.az  != null) rows.push([L.azimuth,  fmtN(e.az, 1)+'°']);""")
rep("""  if (Number.isFinite(e.mag) && e.kind !== 'con') rows.push(['magnitude', e.mag.toFixed(2)]);
  if (Number.isFinite(e.ang))   rows.push(['apparent size', angStr(e.ang)]);
  if (Number.isFinite(e.illum)) rows.push(['illuminated', (e.illum*100).toFixed(0)+'%']);
  if (Number.isFinite(e.phase)) rows.push(['phase', e.phase.toFixed(0)+'° · '
                                                  + (e.waxing ? 'waxing' : 'waning')]);""",
"""  if (Number.isFinite(e.mag) && e.kind !== 'con') rows.push([L.magnitude, fmtN(e.mag, 2)]);
  if (Number.isFinite(e.ang))   rows.push([L.size, angStr(e.ang)]);
  if (Number.isFinite(e.illum)) rows.push([L.illuminated, pct((e.illum*100).toFixed(0))]);
  if (Number.isFinite(e.phase)) rows.push([L.phase, e.phase.toFixed(0)+'° · ' + (e.waxing ? L.waxing : L.waning)]);""")
rep("""      if (Number.isFinite(st.ly)) rows.push(['distance', lyStr(st.ly)]);
      if (st.spect) rows.push(['type', st.spect]);
      if (Number.isFinite(st.lum_sun)) rows.push(['luminosity', `${numStr(st.lum_sun)} × the Sun`]);""",
"""      if (Number.isFinite(st.ly)) rows.push([L.distance, lyStr(st.ly)]);
      if (st.spect) rows.push([L.type, st.spect]);
      if (Number.isFinite(st.lum_sun)) rows.push([L.luminosity, `${numStr(st.lum_sun)} ${L.xSun}`]);""")
rep("""      if (Number.isFinite(F.moon.distance_km)) rows.push(['distance', `${numStr(Math.round(F.moon.distance_km))} km`]);
      if (Number.isFinite(F.moon.age_days)) rows.push(['age', `${F.moon.age_days.toFixed(1)} days`]);""",
"""      if (Number.isFinite(F.moon.distance_km)) rows.push([L.distance, `${numStr(Math.round(F.moon.distance_km))} km`]);
      if (Number.isFinite(F.moon.age_days)) rows.push([L.age, `${fmtN(F.moon.age_days, 1)} ${L.days}`]);""")
rep("""      if (F.day.sunrise) rows.push(['rises', F.day.sunrise]);
      if (F.day.sunset)  rows.push(['sets', F.day.sunset]);
      if (Number.isFinite(F.day.day_length_h)) rows.push(['daylight', hoursStr(F.day.day_length_h)]);""",
"""      if (F.day.sunrise) rows.push([L.rises, F.day.sunrise]);
      if (F.day.sunset)  rows.push([L.sets, F.day.sunset]);
      if (Number.isFinite(F.day.day_length_h)) rows.push([L.daylight, hoursStr(F.day.day_length_h)]);""")
rep("""  const conName = e.kind === 'star' && e.con ? (CON_LATIN[e.con] || e.con) : null;
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
     <details><summary>Details</summary>""",
"""  const conName = e.kind === 'star' && e.con ? (CON_LATIN[e.con] || e.con) : null;
  const loc = conName ? enMid(conLoc(e.con)) : '';
  const conBtn = conName && S.fig && S.fig[e.con]
    ? `<button class="lnk" id="showcon">${T.show(T.conLine(conName, loc))}</button>` : '';
  const kindLine = e.kind === 'star' && conName ? `${T.kind.star} · ${T.conLine(conName, loc)}` : kindStr(e);
  box.innerHTML =
    `<span class="x" onclick="document.getElementById('info').classList.remove('on')">${ICON.close}</span>
     <div class="n">${dispName(e)}</div>
     <div class="d">${kindLine}</div>
     ${say.map(t => `<p class="say${t.birth ? ' birth' : ''}">${t.text}</p>`).join('')}
     ${note ? `<div class="note" style="padding:9px 0 0">${note}</div>` : ''}
     ${conBtn}
     <details><summary>${T.lbl.details}</summary>""")
rep("""  if (b) b.onclick = () => { if (showFigure(e.con, conName)) { toast(`${conName} — tap the sky to clear the figure`); draw(); } };""",
    """  if (b) b.onclick = () => { if (showFigure(e.con, conName)) { toast(T.clearFigure(conName)); draw(); } };""")

# ── the sentences, language-neutral logic over the table ─────────────────────
rep("""  const when = hhmmStr(B.t0_h);
  if (alt <= 0) return `At ${when}, the hour this sky is made for, ${e.name === 'Sun' || e.name === 'Moon' ? 'the ' : ''}${e.name} was below the horizon, ${(-alt).toFixed(0)}° down in the ${compass(az)}.`;
  const sun = B.sun_alt[0];
  const seen = e.kind === 'sun' ? '' : e.kind === 'moon' ? '' : sun > 0 ? ', hidden in daylight'
             : sun > -18 ? ', in the twilight' : ', in a dark sky';
  return `At ${when}, the hour this sky is made for, ${e.name === 'Sun' || e.name === 'Moon' ? 'the ' : ''}${e.name} stood ${alt.toFixed(0)}° up in the ${compass(az)}${seen}.`;
}""",
"""  const when = hhmmStr(B.t0_h);
  if (alt <= 0) return T.birthBelow(when, e, (-alt).toFixed(0), dirPhrase(compass(az), 'toward'));
  const sun = B.sun_alt[0];
  const seen = e.kind === 'sun' ? '' : e.kind === 'moon' ? '' : sun > 0 ? T.seen.day : sun > -18 ? T.seen.twi : T.seen.night;
  return T.birth(when, e, alt.toFixed(0), dirPhrase(compass(az)), seen);
}""")
rep("""    const bits = [];
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
  }""",
"""    const bits = [];
    if (r && r <= 10) bits.push(T.brightest(r));
    const sw = st && spectralWords(st.spect); if (sw) bits.push(sw);
    if (st && Number.isFinite(st.lum_sun) && st.lum_sun >= 2) bits.push(T.lum(numStr(st.lum_sun)));
    if (bits.length) out.push({ text: bits.join(' ') });
    if (st && Number.isFinite(st.ly) && st.ly >= 2 && year){
      out.push({ text: T.light_left(lyStr(st.ly), st.ly >= 100, year - Math.round(st.ly)) });
    }
    if (st){
      const rs = e.dec != null && B ? riseSetCompass(e.dec, B.lat) : null;
      if (st.always_up) out.push({ text: T.alwaysUp });
      else if (st.never_up) out.push({ text: T.neverUp });
      else {
        const t = T.riseSet(e, { rise: st.rise, riseDir: rs && dirPhrase(rs.rise), highest: st.highest,
          highAlt: Number.isFinite(st.highest_alt_deg) ? st.highest_alt_deg.toFixed(0) : null, set: st.set, setDir: rs && dirPhrase(rs.set) });
        if (t) out.push({ text: t });
      }
    }
  } else if (e.kind === 'moon'){
    const m = F && F.moon;
    const bits = [];
    if (Number.isFinite(e.illum)) bits.push(T.moonLit((e.illum * 100).toFixed(0), e.waxing));
    if (m && Number.isFinite(m.distance_km)) bits.push(T.moonDist(numStr(Math.round(m.distance_km))));
    if (bits.length) out.push({ text: bits.join(' ') });
    if (m){ const t = T.riseSet(e, { rise: m.rise, highest: m.highest, set: m.set }); if (t) out.push({ text: t }); }
  } else if (e.kind === 'planet'){
    const pl = F && (F.planets || []).find(p => p.name === e.name);
    if (Number.isFinite(e.mag)) out.push({ text: T.planetMag(fmtN(e.mag, 1), e.mag < 0) });
    if (pl){
      const t = T.riseSet(e, { rise: pl.rise, highest: pl.highest,
        highAlt: Number.isFinite(pl.highest_alt_deg) ? pl.highest_alt_deg.toFixed(0) : null, set: pl.set });
      if (t) out.push({ text: t });
    }
  } else if (e.kind === 'sun'){
    const d = F && F.day;
    if (d && d.sunrise && d.sunset) out.push({ text: T.sunRiseSet(d.sunrise, d.sunset, Number.isFinite(d.day_length_h) ? hoursStr(d.day_length_h) : null) });
    if (d && d.dark_from && d.dark_until) out.push({ text: T.fullyDarkS(d.dark_from, d.dark_until) });
  } else if (e.kind === 'con'){
    const loc = conLoc(e.con);
    if (loc && loc !== e.name) out.push({ text: T.conSentence(loc) });
  }""")

# ── names layer, reticle label, compass letters ──────────────────────────────
rep("""    put(projectDir(dirAltaz(b.az, b.alt), cb, S.Wn, S.Hn), b.name, true);""",
    """    put(projectDir(dirAltaz(b.az, b.alt), cb, S.Wn, S.Hn), dispName(b), true);""")
rep("""  const marked = S.marked ? S.marked.name : null;""", """  const marked = S.marked ? dispName(S.marked) : null;""")
rep("""  if (m && !fc) ring(onFrame(mark()), m.name);""", """  if (m && !fc) ring(onFrame(mark()), dispName(m));""")
rep("""  for (const [az, ch] of [[90, 'E'], [270, 'W']]){""", """  for (const [az, ch] of [[90, 'E'], [270, T.westLetter]]){""")
rep("""      } else {
        octx.moveTo(gx, gy); octx.lineTo(gx + gw*0.25, gy + gh); octx.lineTo(gx + gw*0.5, gy + gh*0.45);
        octx.lineTo(gx + gw*0.75, gy + gh); octx.lineTo(gx + gw, gy);
      }""",
"""      } else if (ch === 'O'){
        // "Oeste" / "Ouest": a ring, drawn like the other two letters.
        octx.moveTo(gx + gw, gy + gh/2); octx.ellipse(gx + gw/2, gy + gh/2, gw/2, gh/2, 0, 0, 7);
      } else {
        octx.moveTo(gx, gy); octx.lineTo(gx + gw*0.25, gy + gh); octx.lineTo(gx + gw*0.5, gy + gh*0.45);
        octx.lineTo(gx + gw*0.75, gy + gh); octx.lineTo(gx + gw, gy);
      }""")

# ── the day line, the chrome texts ───────────────────────────────────────────
rep("""  if (d.sunrise) bits.push(`sunrise <b>${d.sunrise}</b>`);
  if (d.sunset)  bits.push(`sunset <b>${d.sunset}</b>`);
  if (Number.isFinite(m.illuminated_pct)) bits.push(`Moon <b>${m.illuminated_pct.toFixed(0)}%</b>`);
  if (!bits.length) return;
  const el = $('day'); el.innerHTML = `This day · ${bits.join(' · ')} ›`; el.style.display = ''; el.onclick = showDay;""",
"""  const L = T.lbl;
  // Compact, so it stays one line on a phone in every language.
  if (d.sunrise && d.sunset) bits.push(`${L.sun} <b>${d.sunrise}–${d.sunset}</b>`);
  else { if (d.sunrise) bits.push(`${L.sunrise} <b>${d.sunrise}</b>`); if (d.sunset) bits.push(`${L.sunset} <b>${d.sunset}</b>`); }
  if (Number.isFinite(m.illuminated_pct)) bits.push(`${L.moon} <b>${pct(m.illuminated_pct.toFixed(0))}</b>`);
  if (!bits.length) return;
  const el = $('day'); el.innerHTML = `${L.thisDay} · ${bits.join(' · ')} ›`; el.style.display = ''; el.onclick = showDay;""")
rep("""  dayLine();
  setNames(store.get('sky.names') === '1');""",
"""  // The chrome in this language.
  $('q').placeholder = T.placeholder; $('hint').textContent = T.hint;
  $('sun').title = S.sunOff ? T.sunOff : T.sunOn; $('dayb').title = T.dayBtn; $('names').title = T.namesBtn;
  dayLine();
  setNames(store.get('sky.names') === '1');""")

open(dst_path, 'w', encoding='utf-8').write(s)
print("patched →", dst_path)
