/*
 * Product artwork, drawn as SVG so the demo uses no borrowed photos.
 * art(type, key, opt) -> SVG markup
 *   type 'gem'       key = GEMS key           (cut or cabochon stone)
 *   type 'rudraksha' key = mukhi number, 'ganesha' or 'gauri-shankar'
 *   type 'mala'      key = MALAS key          (108-bead mala with tassel)
 * Admin-uploaded photos replace the drawing automatically (productImage).
 */

export const GEMS = {
  // ---- precious (navratna and their substitutes)
  'yellow-sapphire': { name: 'Yellow Sapphire', hindi: 'Pukhraj', group: 'precious', planet: 'Jupiter (Guru)', day: 'Thursday', finger: 'Index', metal: 'Gold', c: ['#fff1a0', '#e8b714', '#8a6400'], ppc: 6200, origins: ['Ceylon', 'Bangkok'] },
  'blue-sapphire':   { name: 'Blue Sapphire', hindi: 'Neelam', group: 'precious', planet: 'Saturn (Shani)', day: 'Saturday', finger: 'Middle', metal: 'Silver or Panchdhatu', c: ['#7aa6ff', '#1c47b8', '#0a1f5c'], ppc: 7800, origins: ['Ceylon', 'Kashmir-type', 'Bangkok'] },
  emerald:           { name: 'Emerald', hindi: 'Panna', group: 'precious', planet: 'Mercury (Budh)', day: 'Wednesday', finger: 'Little', metal: 'Gold or Silver', c: ['#6ff0ad', '#0f8f55', '#044a2b'], ppc: 5400, origins: ['Colombia', 'Zambia', 'Brazil'] },
  ruby:              { name: 'Ruby', hindi: 'Manik', group: 'precious', planet: 'Sun (Surya)', day: 'Sunday', finger: 'Ring', metal: 'Gold or Copper', c: ['#ff6478', '#c4102b', '#6e0616'], ppc: 6600, origins: ['Burma', 'Mozambique', 'Thailand'] },
  'red-coral':       { name: 'Red Coral', hindi: 'Moonga', group: 'precious', planet: 'Mars (Mangal)', day: 'Tuesday', finger: 'Ring', metal: 'Gold or Copper', c: ['#ff9c7c', '#e2462a', '#8c1d0c'], round: true, ppc: 1400, origins: ['Italy', 'Japan'] },
  pearl:             { name: 'Pearl', hindi: 'Moti', group: 'precious', planet: 'Moon (Chandra)', day: 'Monday', finger: 'Little', metal: 'Silver', c: ['#ffffff', '#efe7dc', '#bfb2a2'], round: true, ppc: 1100, origins: ['South Sea', 'Basra', 'Japan'] },
  'cats-eye':        { name: "Cat's Eye", hindi: 'Lehsunia', group: 'precious', planet: 'Ketu', day: 'Tuesday', finger: 'Middle', metal: 'Silver or Panchdhatu', c: ['#ece3b0', '#9d9364', '#4f4826'], round: true, eye: true, ppc: 2300, origins: ['Ceylon', 'Orissa'] },
  hessonite:         { name: 'Hessonite', hindi: 'Gomed', group: 'precious', planet: 'Rahu', day: 'Saturday', finger: 'Middle', metal: 'Silver or Panchdhatu', c: ['#ffb873', '#c8611a', '#6b2d06'], ppc: 1300, origins: ['Ceylon', 'Africa'] },
  diamond:           { name: 'Diamond', hindi: 'Heera', group: 'precious', planet: 'Venus (Shukra)', day: 'Friday', finger: 'Middle', metal: 'Platinum or Silver', c: ['#ffffff', '#e3ecf7', '#9fb3c9'], ppc: 42000, origins: ['Africa', 'Russia'] },
  'white-sapphire':  { name: 'White Sapphire', hindi: 'Safed Pukhraj', group: 'precious', planet: 'Venus (Shukra)', day: 'Friday', finger: 'Middle', metal: 'Silver', c: ['#ffffff', '#e9eef4', '#b4c0cc'], ppc: 3400, origins: ['Ceylon'] },
  'white-coral':     { name: 'White Coral', hindi: 'Safed Moonga', group: 'precious', planet: 'Venus (Shukra)', day: 'Friday', finger: 'Ring', metal: 'Silver', c: ['#ffffff', '#f2ece4', '#cdbfae'], round: true, ppc: 600, origins: ['Italy'] },
  // ---- semi-precious (uparatna)
  amethyst:          { name: 'Amethyst', hindi: 'Katela', group: 'semi', planet: 'Saturn (Shani)', day: 'Saturday', finger: 'Middle', metal: 'Silver', c: ['#dcadff', '#8a3fd1', '#3f146b'], ppc: 380, origins: ['Brazil', 'Zambia'] },
  opal:              { name: 'Opal', hindi: 'Dudhiya Patthar', group: 'semi', planet: 'Venus (Shukra)', day: 'Friday', finger: 'Ring', metal: 'Silver', c: ['#fff6fb', '#c9e4ff', '#a7d9c6'], round: true, play: true, ppc: 1900, origins: ['Australia', 'Ethiopia'] },
  'blue-topaz':      { name: 'Blue Topaz', hindi: 'Blue Topaz', group: 'semi', planet: 'Jupiter (Guru)', day: 'Thursday', finger: 'Index', metal: 'Silver', c: ['#adf2ff', '#2cb5d9', '#0b5a73'], ppc: 420, origins: ['Brazil'] },
  citrine:           { name: 'Citrine', hindi: 'Sunela', group: 'semi', planet: 'Jupiter (Guru)', day: 'Thursday', finger: 'Index', metal: 'Gold or Silver', c: ['#ffe39a', '#f0a11b', '#8f4f00'], ppc: 450, origins: ['Brazil'] },
  iolite:            { name: 'Iolite', hindi: 'Neeli', group: 'semi', planet: 'Saturn (Shani)', day: 'Saturday', finger: 'Middle', metal: 'Silver', c: ['#a9a6ff', '#4c3fb0', '#1d175c'], ppc: 520, origins: ['Orissa', 'Madagascar'] },
  moonstone:         { name: 'Moonstone', hindi: 'Chandrakant Mani', group: 'semi', planet: 'Moon (Chandra)', day: 'Monday', finger: 'Little', metal: 'Silver', c: ['#ffffff', '#e4ecf7', '#b7c6dd'], round: true, play: true, ppc: 350, origins: ['Ceylon', 'India'] },
  peridot:           { name: 'Peridot', hindi: 'Zabarjad', group: 'semi', planet: 'Mercury (Budh)', day: 'Wednesday', finger: 'Little', metal: 'Gold or Silver', c: ['#e0ff8a', '#8fc21a', '#466b00'], ppc: 600, origins: ['Arizona', 'Pakistan'] },
  turquoise:         { name: 'Turquoise', hindi: 'Firoza', group: 'semi', planet: 'Jupiter (Guru)', day: 'Thursday', finger: 'Index', metal: 'Silver', c: ['#b9fff2', '#2fbfa8', '#0d6a5c'], round: true, ppc: 480, origins: ['Iran', 'Tibet'] },
  garnet:            { name: 'Garnet', hindi: 'Tamra Mani', group: 'semi', planet: 'Rahu', day: 'Saturday', finger: 'Middle', metal: 'Silver', c: ['#ff7f86', '#a3141f', '#4f050c'], ppc: 420, origins: ['Africa', 'India'] },
  'lapis-lazuli':    { name: 'Lapis Lazuli', hindi: 'Lajward', group: 'semi', planet: 'Saturn (Shani)', day: 'Saturday', finger: 'Middle', metal: 'Silver', c: ['#7d93ff', '#1e3fa8', '#0b1a55'], round: true, speck: true, ppc: 260, origins: ['Afghanistan'] },
  aquamarine:        { name: 'Aquamarine', hindi: 'Beruj', group: 'semi', planet: 'Mars (Mangal)', day: 'Tuesday', finger: 'Ring', metal: 'Silver', c: ['#e0fbff', '#7fd4e6', '#2c8ea3'], ppc: 900, origins: ['Brazil', 'Mozambique'] },
  'blue-zircon':     { name: 'Blue Zircon', hindi: 'Jarkan', group: 'semi', planet: 'Venus (Shukra)', day: 'Friday', finger: 'Middle', metal: 'Silver', c: ['#c9f7ff', '#39b6d6', '#0d5d75'], ppc: 750, origins: ['Cambodia'] },
};

export const MALAS = {
  sphatik:   { name: 'Sphatik (Clear Quartz)', c: ['#ffffff', '#e8f1fb', '#aebfd2'] },
  tulsi:     { name: 'Tulsi', c: ['#e9d2a8', '#b48a52', '#6b4a22'] },
  chandan:   { name: 'Red Sandalwood (Rakta Chandan)', c: ['#ff9b78', '#a8321c', '#561208'] },
  amethyst:  { name: 'Amethyst', c: ['#dcadff', '#8a3fd1', '#3f146b'] },
  'rose-quartz': { name: 'Rose Quartz', c: ['#ffe2ea', '#f2a3b8', '#b5617a'] },
  rudraksha: { name: '5 Mukhi Rudraksha', c: ['#c98d5a', '#7a4421', '#3b1d0b'], rough: true },
  'tiger-eye': { name: "Tiger's Eye", c: ['#ffd27a', '#b5761c', '#5a3105'] },
};

let uid = 0;
const BG = id => `<radialGradient id="${id}bg" cx=".5" cy=".42" r=".78"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#efe4d1"/></radialGradient>
  <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#3b2a12" flood-opacity=".25"/></filter>`;
const grad = (id, c) => `<radialGradient id="${id}g" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>`;
const wrap = (id, defs, body, label) => `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><defs>${BG(id)}${defs}</defs><rect width="400" height="400" fill="url(#${id}bg)"/>${body}</svg>`;

/** A faceted (or cabochon) stone centred at cx,cy, radius r. */
function stone(id, g, cx, cy, r) {
  if (g.round) {
    let extra = '';
    if (g.eye) extra = `<ellipse cx="${cx}" cy="${cy}" rx="${r * .12}" ry="${r * .85}" fill="#fff8d0" opacity=".75"/>`;
    if (g.play) extra = `<circle cx="${cx - r * .3}" cy="${cy - r * .1}" r="${r * .28}" fill="#ffb3d9" opacity=".4"/><circle cx="${cx + r * .25}" cy="${cy + r * .25}" r="${r * .25}" fill="#9cf0c0" opacity=".4"/><circle cx="${cx + r * .1}" cy="${cy - r * .35}" r="${r * .2}" fill="#ffe28a" opacity=".45"/>`;
    if (g.speck) extra = Array.from({ length: 14 }, (_, i) => `<circle cx="${cx + Math.cos(i * 2.4) * r * (.2 + (i % 5) * .14)}" cy="${cy + Math.sin(i * 2.4) * r * (.2 + (i % 4) * .15)}" r="${r * .025}" fill="#ffe38a" opacity=".9"/>`).join('');
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .9}" fill="url(#${id}g)"/>${extra}
      <ellipse cx="${cx - r * .35}" cy="${cy - r * .38}" rx="${r * .32}" ry="${r * .17}" fill="#fff" opacity=".7" transform="rotate(-30 ${cx - r * .35} ${cy - r * .38})"/>`;
  }
  const rx = r, ry = r * .82;
  const pts = (k, s) => Array.from({ length: k }, (_, i) => {
    const a = (Math.PI * 2 * i) / k - Math.PI / 2;
    return [cx + Math.cos(a) * rx * s, cy + Math.sin(a) * ry * s];
  });
  const outer = pts(16, 1), table = pts(8, .5);
  let facets = '';
  for (let i = 0; i < 8; i++) {
    const t = table[i], o = outer[i * 2], n = outer[(i * 2 + 1) % 16];
    facets += `<polygon points="${t.join(',')} ${o.join(',')} ${n.join(',')}" fill="#fff" opacity="${i % 2 ? .18 : .07}"/>`;
  }
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}g)"/>${facets}
    <polygon points="${table.map(p => p.join(',')).join(' ')}" fill="#fff" opacity=".15"/>
    <ellipse cx="${cx - rx * .32}" cy="${cy - ry * .42}" rx="${rx * .2}" ry="${ry * .1}" fill="#fff" opacity=".85" transform="rotate(-25 ${cx - rx * .32} ${cy - ry * .42})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>`;
}

/** A rudraksha bead with `m` vertical grooves (mukhi). */
function bead(id, cx, cy, r, m) {
  let lines = '';
  const shown = Math.max(1, Math.min(m, 14));
  for (let i = 0; i < shown; i++) {
    const t = (i + .5) / shown;               // spread grooves across the visible face
    const x = cx + (t - .5) * 2 * r * .82;
    const bend = (t - .5) * r * .5;
    lines += `<path d="M${cx} ${cy - r * .92} Q${x + bend} ${cy} ${cx} ${cy + r * .92}" fill="none" stroke="#2a1306" stroke-width="${r * .035}" opacity=".55"/>`;
  }
  const bumps = Array.from({ length: 40 }, (_, i) => `<circle cx="${cx + Math.cos(i * 2.39) * r * .75 * ((i % 7) / 7 + .2)}" cy="${cy + Math.sin(i * 2.39) * r * .8 * ((i % 5) / 5 + .2)}" r="${r * .05}" fill="#3b1d0b" opacity=".22"/>`).join('');
  return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .95}" fill="url(#${id}g)"/>${bumps}${lines}
    <ellipse cx="${cx}" cy="${cy - r * .96}" rx="${r * .12}" ry="${r * .06}" fill="#2a1306" opacity=".7"/>
    <ellipse cx="${cx - r * .38}" cy="${cy - r * .42}" rx="${r * .25}" ry="${r * .12}" fill="#fff" opacity=".22" transform="rotate(-30 ${cx - r * .38} ${cy - r * .42})"/>`;
}

export function art(type, key, opt = {}) {
  const id = 'a' + (++uid);
  if (type === 'rudraksha') {
    const c = ['#d79a63', '#8a4c22', '#3b1d0b'];
    let body;
    if (key === 'gauri-shankar') body = `<g filter="url(#${id}s)">${bead(id, 160, 205, 82, 5)}${bead(id, 240, 205, 82, 6)}</g>`;
    else if (key === 'ganesha') body = `<g filter="url(#${id}s)">${bead(id, 200, 210, 100, 5)}<path d="M200 115 q40 -10 52 30 q6 22 -8 30" fill="none" stroke="url(#${id}g)" stroke-width="22" stroke-linecap="round"/></g>`;
    else body = `<g filter="url(#${id}s)">${bead(id, 200, 205, 112, +key || 5)}</g>`;
    const label = key === 'gauri-shankar' ? 'Gauri Shankar' : key === 'ganesha' ? 'Ganesha' : (+key || 5) + ' Mukhi';
    return wrap(id, grad(id, c), body + `<text x="200" y="372" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#6b4a22" opacity=".7">${label}</text>`, label + ' Rudraksha');
  }
  if (type === 'mala') {
    const m = MALAS[key] || MALAS.sphatik;
    const beads = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2 + Math.PI / 2;
      const x = 200 + Math.cos(a) * 118, y = 180 + Math.sin(a) * 118;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="url(#${id}g)"/><circle cx="${(x - 4).toFixed(1)}" cy="${(y - 4).toFixed(1)}" r="3.5" fill="#fff" opacity=".55"/>`;
    }).join('');
    const tassel = `<rect x="191" y="305" width="18" height="16" rx="3" fill="#c8a24a"/><path d="M186 320 h28 l8 62 h-44z" fill="#9e1b32"/>${Array.from({ length: 6 }, (_, i) => `<line x1="${186 + i * 6}" y1="330" x2="${181 + i * 7.6}" y2="382" stroke="#7a1022" stroke-width="1.5"/>`).join('')}`;
    return wrap(id, grad(id, m.c), `<g filter="url(#${id}s)">${beads}<circle cx="200" cy="298" r="16" fill="url(#${id}g)"/>${tassel}</g>`, m.name + ' mala');
  }
  const g = GEMS[key] || GEMS.ruby;
  return wrap(id, grad(id, g.c), `<ellipse cx="200" cy="304" rx="140" ry="24" fill="#3b2a12" opacity=".1"/><g filter="url(#${id}s)">${stone(id, g, 200, 200, opt.r || 104)}</g>`, g.name);
}

/** Product image: uploaded photo if any, otherwise the drawing. */
export function productImage(p, i = 0) {
  const src = (p.images || [])[i];
  if (src) return `<img src="${src}" alt="${(p.title || '').replace(/"/g, '&quot;')}" loading="lazy">`;
  if (p.type === 'rudraksha') return art('rudraksha', p.mukhi);
  if (p.type === 'mala') return art('mala', p.material);
  if (p.type === 'service') return serviceArt(p.service);
  return art('gem', p.gem);
}

/** Simple emblem for services (consultation, kundali). */
export function serviceArt(kind) {
  const id = 'a' + (++uid);
  const glyph = kind === 'kundali'
    ? `<rect x="110" y="110" width="180" height="180" fill="none" stroke="#9e1b32" stroke-width="5"/><path d="M110 110 290 290M290 110 110 290M200 110 110 200 200 290 290 200Z" fill="none" stroke="#9e1b32" stroke-width="4"/>`
    : `<circle cx="200" cy="190" r="86" fill="none" stroke="#0d3b3c" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${200 + Math.cos(a) * 70}" y1="${190 + Math.sin(a) * 70}" x2="${200 + Math.cos(a) * 86}" y2="${190 + Math.sin(a) * 86}" stroke="#0d3b3c" stroke-width="4"/>`; }).join('')}<circle cx="200" cy="190" r="30" fill="#e38b1d"/>`;
  return wrap(id, '', `<g filter="url(#${id}s)">${glyph}</g>`, kind);
}
