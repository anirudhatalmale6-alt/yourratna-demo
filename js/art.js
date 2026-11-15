/*
 * Product artwork, drawn as SVG so the demo uses no borrowed photos.
 * art(type, gem, metal) -> SVG markup string.
 *   type : ring | pendant | earrings | necklace | loose
 *   gem  : key of GEMS (colour of the stone)
 *   metal: key of METALS (colour of the setting)
 * Admin-uploaded photos (data URLs) replace the artwork automatically.
 */

export const GEMS = {
  ruby:            { name: 'Ruby',            hindi: 'Manik',     c: ['#ff5a6e', '#c4102b', '#6e0616'] },
  emerald:         { name: 'Emerald',         hindi: 'Panna',     c: ['#5fe0a0', '#0f8f55', '#044a2b'] },
  'blue-sapphire': { name: 'Blue Sapphire',   hindi: 'Neelam',    c: ['#6d9cff', '#1c47b8', '#0a1f5c'] },
  'yellow-sapphire': { name: 'Yellow Sapphire', hindi: 'Pukhraj', c: ['#ffe680', '#e6b412', '#8a6400'] },
  pearl:           { name: 'Pearl',           hindi: 'Moti',      c: ['#ffffff', '#efe7dc', '#bfb2a2'], round: true },
  'red-coral':     { name: 'Red Coral',       hindi: 'Moonga',    c: ['#ff9a7a', '#e2462a', '#8c1d0c'], round: true },
  hessonite:       { name: 'Hessonite',       hindi: 'Gomed',     c: ['#ffb36b', '#c8611a', '#6b2d06'] },
  'cats-eye':      { name: "Cat's Eye",       hindi: 'Lehsunia',  c: ['#e8e0b0', '#9d9364', '#4f4826'], round: true, eye: true },
  diamond:         { name: 'Diamond',         hindi: 'Heera',     c: ['#ffffff', '#dfe9f5', '#9fb3c9'] },
  opal:            { name: 'Opal',            hindi: 'Opal',      c: ['#fff6fb', '#c9e4ff', '#a7d9c6'], round: true, play: true },
  amethyst:        { name: 'Amethyst',        hindi: 'Katela',    c: ['#d9a6ff', '#8a3fd1', '#3f146b'] },
  'blue-topaz':    { name: 'Blue Topaz',      hindi: 'Blue Topaz', c: ['#a8f0ff', '#2cb5d9', '#0b5a73'] },
};

export const METALS = {
  silver: { name: '925 Sterling Silver', c: ['#ffffff', '#c9ced6', '#7d8590'] },
  vermeil: { name: '22kt Gold Vermeil', c: ['#fff1b8', '#e3b54a', '#8f6512'] },
  gold: { name: '18kt Yellow Gold', c: ['#ffe9a8', '#d4a017', '#7a5a06'] },
  panchdhatu: { name: 'Panchdhatu', c: ['#ffd9b0', '#c98b4f', '#6e4320'] },
  rosegold: { name: '18kt Rose Gold', c: ['#ffe0d6', '#d98c78', '#8a4a3c'] },
};

let uid = 0;
function grads(gem, metal) {
  const id = 'a' + (++uid);
  const g = GEMS[gem] || GEMS.ruby;
  const m = METALS[metal] || METALS.silver;
  return {
    id,
    defs: `
    <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${m.c[0]}"/><stop offset=".45" stop-color="${m.c[1]}"/><stop offset="1" stop-color="${m.c[2]}"/>
    </linearGradient>
    <radialGradient id="${id}g" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="${g.c[0]}"/><stop offset=".55" stop-color="${g.c[1]}"/><stop offset="1" stop-color="${g.c[2]}"/>
    </radialGradient>
    <radialGradient id="${id}bg" cx=".5" cy=".42" r=".75">
      <stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#f1e8da"/>
    </radialGradient>
    <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#5a4320" flood-opacity=".22"/></filter>`,
    gem: g,
  };
}

/** A faceted (or round cabochon) stone centred at cx,cy with radius r. */
function stone(id, g, cx, cy, r) {
  if (g.round) {
    let extra = '';
    if (g.eye) extra = `<ellipse cx="${cx}" cy="${cy}" rx="${r * .12}" ry="${r * .85}" fill="#fff8d0" opacity=".75"/>`;
    if (g.play) extra = `<circle cx="${cx - r * .3}" cy="${cy - r * .1}" r="${r * .28}" fill="#ffb3d9" opacity=".45"/><circle cx="${cx + r * .25}" cy="${cy + r * .25}" r="${r * .25}" fill="#9cf0c0" opacity=".45"/><circle cx="${cx + r * .1}" cy="${cy - r * .35}" r="${r * .2}" fill="#ffe28a" opacity=".5"/>`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}g)"/>${extra}
      <ellipse cx="${cx - r * .35}" cy="${cy - r * .4}" rx="${r * .32}" ry="${r * .18}" fill="#fff" opacity=".7" transform="rotate(-30 ${cx - r * .35} ${cy - r * .4})"/>`;
  }
  // oval brilliant with simple facets
  const rx = r, ry = r * .82;
  const pts = (k, s) => Array.from({ length: k }, (_, i) => {
    const a = (Math.PI * 2 * i) / k - Math.PI / 2;
    return `${(cx + Math.cos(a) * rx * s).toFixed(1)},${(cy + Math.sin(a) * ry * s).toFixed(1)}`;
  });
  const outer = pts(16, 1), table = pts(8, .5);
  let facets = '';
  for (let i = 0; i < 8; i++) {
    const [tx, ty] = table[i].split(','), [ox, oy] = outer[i * 2].split(','), [nx, ny] = outer[(i * 2 + 1) % 16].split(',');
    const op = (i % 2 ? .18 : .08);
    facets += `<polygon points="${tx},${ty} ${ox},${oy} ${nx},${ny}" fill="#fff" opacity="${op}"/>`;
  }
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}g)"/>
    ${facets}
    <polygon points="${table.join(' ')}" fill="#fff" opacity=".16"/>
    <ellipse cx="${cx - rx * .32}" cy="${cy - ry * .42}" rx="${rx * .2}" ry="${ry * .1}" fill="#fff" opacity=".85" transform="rotate(-25 ${cx - rx * .32} ${cy - ry * .42})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>`;
}

function prongs(id, cx, cy, r) {
  return [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) =>
    `<circle cx="${cx + dx * r * .72}" cy="${cy + dy * r * .6}" r="${r * .12}" fill="url(#${id}m)"/>`).join('');
}

export function art(type, gem, metal) {
  const { id, defs, gem: g } = grads(gem, metal);
  let body = '';
  switch (type) {
    case 'ring':
      body = `
      <g filter="url(#${id}s)">
        <ellipse cx="200" cy="245" rx="105" ry="78" fill="none" stroke="url(#${id}m)" stroke-width="20"/>
        <ellipse cx="200" cy="245" rx="105" ry="78" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" transform="translate(-4 -5)"/>
        <path d="M150 168 Q200 140 250 168 L238 186 Q200 168 162 186Z" fill="url(#${id}m)"/>
        ${stone(id, g, 200, 140, 46)}
        ${prongs(id, 200, 140, 46)}
      </g>`;
      break;
    case 'pendant':
      body = `
      <path d="M70 40 Q200 210 330 40" fill="none" stroke="url(#${id}m)" stroke-width="3.5" stroke-dasharray="6 3"/>
      <g filter="url(#${id}s)">
        <rect x="186" y="118" width="28" height="34" rx="12" fill="none" stroke="url(#${id}m)" stroke-width="7"/>
        <path d="M200 150 L262 212 L200 318 L138 212Z" fill="url(#${id}m)"/>
        ${stone(id, g, 200, 222, 48)}
        ${prongs(id, 200, 222, 48)}
      </g>`;
      break;
    case 'earrings':
      body = [130, 270].map(x => `
      <g filter="url(#${id}s)">
        <path d="M${x} 70 q-16 0 -16 18" fill="none" stroke="url(#${id}m)" stroke-width="5"/>
        <circle cx="${x}" cy="105" r="13" fill="url(#${id}m)"/>
        <rect x="${x - 3}" y="116" width="6" height="40" fill="url(#${id}m)"/>
        <circle cx="${x}" cy="210" r="56" fill="url(#${id}m)"/>
        ${stone(id, g, x, 210, 44)}
      </g>`).join('');
      break;
    case 'necklace': {
      const beads = Array.from({ length: 15 }, (_, i) => {
        const t = i / 14, x = 60 + t * 280, y = 60 + Math.sin(t * Math.PI) * 150;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="url(#${id}m)"/>`;
      }).join('');
      body = `
      <g filter="url(#${id}s)">
        <path d="M60 60 Q200 330 340 60" fill="none" stroke="url(#${id}m)" stroke-width="4"/>
        ${beads}
        ${stone(id, g, 152, 228, 20)}${stone(id, g, 248, 228, 20)}
        <circle cx="200" cy="262" r="46" fill="url(#${id}m)"/>
        ${stone(id, g, 200, 262, 36)}
      </g>`;
      break;
    }
    default: // loose stone on a velvet tray
      body = `
      <ellipse cx="200" cy="300" rx="140" ry="26" fill="#3b2a3f" opacity=".12"/>
      <g filter="url(#${id}s)">${stone(id, g, 200, 200, 98)}</g>`;
  }
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${g.name} ${type}">
    <defs>${defs}</defs><rect width="400" height="400" fill="url(#${id}bg)"/>${body}</svg>`;
}

/** Product image: uploaded photo if any, otherwise the drawing. */
export function productImage(p, i = 0) {
  const src = (p.images || [])[i];
  if (src) return `<img src="${src}" alt="${(p.title || '').replace(/"/g, '&quot;')}" loading="lazy">`;
  return art(p.type, p.gem, p.metal);
}
