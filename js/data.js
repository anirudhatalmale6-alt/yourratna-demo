/* Seed data for the YourRatna demo. Everything can be changed in the admin panel. */
import { GEMS, MALAS } from './art.js';

export const SETTINGS = {
  name: 'YourRatna',
  tagline: 'Certified gemstones, rudraksha & Vedic guidance',
  phone: '+91 98765 43210',
  email: 'care@yourratna.example',
  address: '21 Gopalji ka Rasta, Johari Bazaar, Jaipur, Rajasthan 302003',
  gstin: '08ABCDE1234F1Z5',
  gst: 3,
  shipping: 99,
  freeShippingOver: 1999,
  cod: true,
  codFee: 49,
  consultFee: 1100,
  kundaliFee: 2100,
  announcement: 'Free insured shipping over ₹1,999 · Lab-certified gemstones · X-ray tested rudraksha',
};

/* Categories drive the menu, filters and home page. type/key choose the drawing. */
export const CATEGORIES = [
  { slug: 'precious', name: 'Precious Gemstones', group: 'gemstones', type: 'gem', key: 'blue-sapphire', home: true, blurb: 'Navratna stones: Pukhraj, Neelam, Panna, Manik and more' },
  { slug: 'semi-precious', name: 'Semi-Precious Gemstones', group: 'gemstones', type: 'gem', key: 'amethyst', home: true, blurb: 'Uparatna: Amethyst, Opal, Firoza, Sunela and more' },
  { slug: 'japa-malas', name: 'Japa Malas', group: 'gemstones', type: 'mala', key: 'sphatik', home: true, blurb: '108-bead malas for chanting' },
  { slug: 'rudraksha', name: 'Rudraksha', group: 'rudraksha', type: 'rudraksha', key: '5', home: true, blurb: '1 to 14 Mukhi, Ganesha & Gauri Shankar' },
  { slug: 'rudraksha-malas', name: 'Rudraksha Malas', group: 'rudraksha', type: 'mala', key: 'rudraksha', home: true, blurb: 'Hand-knotted malas, X-ray tested beads' },
];

export const ZODIAC = [
  { slug: 'aries', name: 'Aries', rashi: 'Mesh', dates: 'Mar 21 – Apr 19', gem: 'red-coral', sym: '♈' },
  { slug: 'taurus', name: 'Taurus', rashi: 'Vrishabh', dates: 'Apr 20 – May 20', gem: 'diamond', sym: '♉' },
  { slug: 'gemini', name: 'Gemini', rashi: 'Mithun', dates: 'May 21 – Jun 20', gem: 'emerald', sym: '♊' },
  { slug: 'cancer', name: 'Cancer', rashi: 'Kark', dates: 'Jun 21 – Jul 22', gem: 'pearl', sym: '♋' },
  { slug: 'leo', name: 'Leo', rashi: 'Simha', dates: 'Jul 23 – Aug 22', gem: 'ruby', sym: '♌' },
  { slug: 'virgo', name: 'Virgo', rashi: 'Kanya', dates: 'Aug 23 – Sep 22', gem: 'emerald', sym: '♍' },
  { slug: 'libra', name: 'Libra', rashi: 'Tula', dates: 'Sep 23 – Oct 22', gem: 'diamond', sym: '♎' },
  { slug: 'scorpio', name: 'Scorpio', rashi: 'Vrishchik', dates: 'Oct 23 – Nov 21', gem: 'red-coral', sym: '♏' },
  { slug: 'sagittarius', name: 'Sagittarius', rashi: 'Dhanu', dates: 'Nov 22 – Dec 21', gem: 'yellow-sapphire', sym: '♐' },
  { slug: 'capricorn', name: 'Capricorn', rashi: 'Makar', dates: 'Dec 22 – Jan 19', gem: 'blue-sapphire', sym: '♑' },
  { slug: 'aquarius', name: 'Aquarius', rashi: 'Kumbh', dates: 'Jan 20 – Feb 18', gem: 'blue-sapphire', sym: '♒' },
  { slug: 'pisces', name: 'Pisces', rashi: 'Meen', dates: 'Feb 19 – Mar 20', gem: 'yellow-sapphire', sym: '♓' },
];

/* Rudraksha: mukhi -> ruling planet, deity, main benefit, base price (Nepal origin). */
export const RUDRAKSHA = {
  1: ['Sun', 'Lord Shiva', 'Focus, leadership and spiritual growth', 45000],
  2: ['Moon', 'Ardhanarishvara', 'Harmony in relationships', 2100],
  3: ['Mars', 'Agni', 'Confidence and freedom from past burdens', 1600],
  4: ['Mercury', 'Brahma', 'Learning, memory and speech', 1300],
  5: ['Jupiter', 'Kalagni Rudra', 'Peace of mind and good health', 450],
  6: ['Venus', 'Kartikeya', 'Willpower and emotional balance', 1100],
  7: ['Saturn', 'Mahalakshmi', 'Wealth and new opportunities', 1900],
  8: ['Rahu', 'Lord Ganesha', 'Removing obstacles', 4200],
  9: ['Ketu', 'Maa Durga', 'Courage and protection', 5900],
  10: ['All planets', 'Lord Vishnu', 'Protection from negativity', 7400],
  11: ['All planets', 'Hanuman', 'Fearlessness and wisdom', 9800],
  12: ['Sun', 'Surya', 'Radiance and authority', 14500],
  13: ['Venus', 'Kamadeva', 'Charm and fulfilment of wishes', 21000],
  14: ['Saturn', 'Hanuman', 'Intuition and decision making', 38000],
  ganesha: ['Mercury', 'Lord Ganesha', 'Success in new beginnings', 3100],
  'gauri-shankar': ['Moon', 'Shiva & Parvati', 'Unity, marriage and family harmony', 6800],
};

// deterministic pseudo-random so the demo looks the same for everyone
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const round = n => Math.max(99, Math.round(n / 10) * 10 - 1);
export const RATTI_PER_CARAT = 1.0989;   // 1 ratti = 0.91 carat
export const toRatti = ct => +(ct * RATTI_PER_CARAT).toFixed(2);

const SHAPES = ['Oval', 'Cushion', 'Oval', 'Round', 'Pear', 'Emerald cut'];
const LABS = ['IGI', 'GII (Gemmological Institute of India)', 'GIA', 'Govt. Gem Testing Lab, Jaipur'];

/** Weight options shown on a gemstone page: price = per-carat rate x carats. */
export function gemVariants(ppc, quality = 1) {
  return [3.25, 4.25, 5.25, 6.25, 7.25].map(r => {
    const ct = +(r / RATTI_PER_CARAT).toFixed(2);
    return { label: `${r} Ratti (${ct} ct)`, price: round(ppc * quality * ct * (1 + (r - 3) * .04)) };
  });
}

function makeProducts() {
  const out = [];
  let n = 101;
  for (const [key, g] of Object.entries(GEMS)) {
    const count = g.group === 'precious' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const quality = [1, 1.35, 1.8][i] || 1;
      const origin = g.origins[i % g.origins.length];
      const carat = +(3 + rnd() * 5).toFixed(2);
      const code = key.split('-').map(w => w[0]).join('').toUpperCase() + '-' + (7000 + n);
      const grade = ['Good', 'Premium', 'Rare'][i] || 'Good';
      const title = `${origin} ${g.name} (${g.hindi}) – ${grade} Quality`;
      const v = gemVariants(g.ppc, quality);
      out.push({
        id: 'P' + n, sku: code, slug: slugify(`${title} ${code}`), title, type: 'gem', gem: key,
        category: g.group === 'precious' ? 'precious' : 'semi-precious', grade, origin, carat,
        shape: g.round ? 'Cabochon' : pick(SHAPES), lab: pick(LABS),
        treatment: ['pearl', 'red-coral', 'white-coral', 'turquoise', 'lapis-lazuli'].includes(key) ? 'Natural' : (rnd() < .6 ? 'Unheated & untreated' : 'Heated only (accepted in Vedic astrology)'),
        variants: v, price: v[0].price, compare: rnd() < .45 ? round(v[0].price * 1.18) : 0,
        stock: Math.floor(rnd() * 9) + (rnd() < .08 ? 0 : 1), featured: rnd() < .3 || (i === 1 && g.group === 'precious'),
        bestseller: rnd() < .22, status: 'active', images: [],
        rating: +(4.4 + rnd() * .6).toFixed(1), reviews: Math.floor(rnd() * 160) + 4,
        desc: `${grade}-quality natural ${g.name} (${g.hindi}) from ${origin}. ${g.name} is the stone of ${g.planet}. ` +
          `Each stone is weighed and tested by an independent laboratory, and the certificate travels with it. ` +
          `Choose the weight your astrologer recommended — prices are per stone.`,
        created: Date.now() - Math.floor(rnd() * 90) * 864e5,
      });
      n++;
    }
  }
  for (const [mukhi, [planet, deity, benefit, base]] of Object.entries(RUDRAKSHA)) {
    const named = mukhi === 'ganesha' ? 'Ganesha Rudraksha' : mukhi === 'gauri-shankar' ? 'Gauri Shankar Rudraksha' : `${mukhi} Mukhi Rudraksha`;
    for (const origin of (+mukhi >= 10 || mukhi === '1' ? ['Nepal'] : ['Nepal', 'Indonesia'])) {
      const price = round(origin === 'Nepal' ? base : base * .45);
      out.push({
        id: 'P' + n, sku: 'RD-' + (8000 + n), slug: slugify(`${named} ${origin} ${n}`), title: `${named} – ${origin}`, type: 'rudraksha',
        mukhi: String(mukhi), category: 'rudraksha', origin, size: origin === 'Nepal' ? `${18 + Math.floor(rnd() * 10)} mm` : `${10 + Math.floor(rnd() * 5)} mm`,
        planet, deity, benefit, lab: 'X-ray tested', price, compare: rnd() < .4 ? round(price * 1.2) : 0, variants: [],
        stock: Math.floor(rnd() * 15) + 1, featured: ['5', '7', 'gauri-shankar', '1'].includes(mukhi) && origin === 'Nepal', bestseller: ['5', '6', 'ganesha'].includes(mukhi),
        status: 'active', images: [], rating: +(4.5 + rnd() * .5).toFixed(1), reviews: Math.floor(rnd() * 120) + 6,
        desc: `Genuine ${origin} ${named}, ruled by ${planet} and blessed by ${deity}. Worn for ${benefit.toLowerCase()}. ` +
          `X-ray tested to confirm the natural mukhi lines, energised (Pran Pratishtha) before dispatch, and sent with a thread for wearing.`,
        created: Date.now() - Math.floor(rnd() * 90) * 864e5,
      });
      n++;
    }
  }
  const malaList = [
    ['rudraksha', 'rudraksha-malas', '5 Mukhi Rudraksha Japa Mala (108+1 beads)', 1499],
    ['rudraksha', 'rudraksha-malas', '5 Mukhi Rudraksha Kantha Mala – 7 mm', 2299],
    ['rudraksha', 'rudraksha-malas', 'Siddha Rudraksha Mala – 1 to 14 Mukhi', 89999],
    ['sphatik', 'japa-malas', 'Sphatik (Clear Quartz) Japa Mala', 899],
    ['tulsi', 'japa-malas', 'Tulsi Japa Mala', 349],
    ['chandan', 'japa-malas', 'Red Sandalwood (Rakta Chandan) Mala', 699],
    ['amethyst', 'japa-malas', 'Amethyst Japa Mala', 1599],
    ['rose-quartz', 'japa-malas', 'Rose Quartz Japa Mala', 1299],
    ['tiger-eye', 'japa-malas', "Tiger's Eye Japa Mala", 1399],
  ];
  for (const [material, category, title, price] of malaList) {
    out.push({
      id: 'P' + n, sku: 'ML-' + (9000 + n), slug: slugify(title) + '-' + n, title, type: 'mala', material, category, beads: '108 + 1 (Sumeru)',
      origin: material === 'rudraksha' ? 'Nepal' : 'India', price, compare: rnd() < .5 ? round(price * 1.25) : 0, variants: [],
      stock: Math.floor(rnd() * 20) + 2, featured: rnd() < .3, bestseller: rnd() < .3, status: 'active', images: [],
      rating: +(4.5 + rnd() * .5).toFixed(1), reviews: Math.floor(rnd() * 90) + 3,
      desc: `${title}, hand-knotted on strong cotton thread with a silk tassel. Made for daily japa (chanting) and meditation. Energised before dispatch.`,
      created: Date.now() - Math.floor(rnd() * 90) * 864e5,
    });
    n++;
  }
  // Services sold through the Astro Tools pages (not shown in product listings).
  out.push({ id: 'SV-CONSULT', sku: 'SV-CONSULT', slug: 'astrology-consultation', title: '1-to-1 Vedic Astrology Consultation (45 min)', type: 'service', service: 'consultation',
    category: 'services', price: SETTINGS.consultFee, compare: 0, variants: [], stock: 9999, status: 'active', images: [], rating: 4.9, reviews: 312, desc: 'Personal reading by our astrologer.', created: Date.now() });
  out.push({ id: 'SV-KUNDALI', sku: 'SV-KUNDALI', slug: 'handmade-kundali', title: 'Detailed Handmade Kundali', type: 'service', service: 'kundali',
    category: 'services', price: SETTINGS.kundaliFee, compare: 0, variants: [], stock: 9999, status: 'active', images: [], rating: 4.9, reviews: 187, desc: 'Hand-drawn birth chart with predictions.', created: Date.now() });
  return out;
}

export const PRODUCTS = makeProducts();

export const BANNERS = [
  { id: 'B1', title: 'Gemstones, certified & true', sub: 'Natural Navratna stones tested by independent labs — the certificate travels with every stone.', btn: 'Shop precious gemstones', link: '#/shop?cat=precious', type: 'gem', key: 'yellow-sapphire', image: '', theme: 'teal' },
  { id: 'B2', title: 'Rudraksha from Nepal', sub: '1 to 14 Mukhi, Ganesha and Gauri Shankar — X-ray tested and energised before dispatch.', btn: 'Shop rudraksha', link: '#/shop?cat=rudraksha', type: 'rudraksha', key: '5', image: '', theme: 'kumkum' },
  { id: 'B3', title: 'Not sure which stone?', sub: 'Enter your date of birth and get a free gemstone recommendation in seconds.', btn: 'Get my free recommendation', link: '#/tools/gem-recommendation', type: 'gem', key: 'emerald', image: '', theme: 'dusk' },
];

export const POSTS = [
  { slug: 'how-to-check-a-real-gemstone', title: 'How to tell a natural gemstone from a fake', date: '2026-10-02', type: 'gem', key: 'ruby',
    excerpt: 'Five simple checks — and why a lab certificate is the only one that really counts.',
    body: 'Buying a gemstone online can feel risky. Here is what to look for.\n\n## 1. Ask for a certificate\nA natural stone should come with a report from an independent gem lab. Check that the weight and colour on the report match the stone.\n\n## 2. Look for natural inclusions\nNatural stones usually have tiny marks inside. Perfectly clean stones at low prices are a warning sign.\n\n## 3. Check the price\nIf a large Manik or Neelam is very cheap, it is probably glass-filled or synthetic.\n\n## 4. Buy from a seller with a return policy\nWe offer a 7-day return on every stone, so you can have it tested again locally.' },
  { slug: 'carat-vs-ratti', title: 'Carat vs Ratti: what is the difference?', date: '2026-09-18', type: 'gem', key: 'yellow-sapphire',
    excerpt: 'Astrologers often prescribe stones in ratti. Here is how it converts to carats.',
    body: 'One carat is 200 milligrams. One ratti is about 182 milligrams, so 1 ratti ≈ 0.91 carat.\n\n## Which should I use?\nJewellers weigh in carats. If your astrologer gave you a weight in ratti, multiply it by 0.91 to get carats — or use our free converter.\n\n## Example\nA 5.25 ratti Pukhraj is about 4.78 carats.' },
  { slug: 'how-to-wear-rudraksha', title: 'How to wear rudraksha for the first time', date: '2026-08-27', type: 'rudraksha', key: '5',
    excerpt: 'The right day, the mantra and the simple rules for keeping it energised.',
    body: 'Rudraksha is simple to wear, and the traditional steps take only a few minutes.\n\n## Choose the day\nMonday is traditional, especially in the morning after a bath.\n\n## Purify it\nDip the bead in raw milk and then Gangajal, and chant "Om Namah Shivaya" 108 times.\n\n## Care\nRemove it before sleeping and bathing, and oil it lightly once a month to keep it from drying.' },
];

export const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, min: 999, active: true, expires: '2027-12-31' },
  { code: 'NAVRATNA500', type: 'flat', value: 500, min: 4999, active: true, expires: '2027-01-31' },
];

const FIRST = ['Priya', 'Rahul', 'Ananya', 'Vikram', 'Neha', 'Arjun', 'Kavya', 'Rohan', 'Isha', 'Aditya', 'Meera', 'Karan', 'Pooja', 'Siddharth', 'Riya'];
const LAST = ['Sharma', 'Verma', 'Iyer', 'Reddy', 'Gupta', 'Nair', 'Mehta', 'Kapoor', 'Joshi', 'Patel', 'Singh', 'Das'];
const CITIES = [['Mumbai', 'Maharashtra', '400050'], ['Delhi', 'Delhi', '110024'], ['Bengaluru', 'Karnataka', '560034'],
  ['Jaipur', 'Rajasthan', '302017'], ['Pune', 'Maharashtra', '411001'], ['Hyderabad', 'Telangana', '500034'], ['Varanasi', 'Uttar Pradesh', '221001']];

function makeCustomersAndOrders() {
  const customers = [];
  for (let i = 0; i < 18; i++) {
    const f = pick(FIRST), l = pick(LAST), c = pick(CITIES);
    customers.push({ id: 'C' + (2001 + i), name: `${f} ${l}`, email: `${f}.${l}${i}`.toLowerCase() + '@example.com',
      phone: '+91 9' + String(800000000 + Math.floor(rnd() * 199999999)).slice(0, 9), password: 'demo1234',
      created: Date.now() - Math.floor(30 + rnd() * 200) * 864e5,
      address: { line: `${Math.floor(rnd() * 200) + 1}, ${pick(['MG Road', 'Park Street', 'Linking Road', 'Residency Road', 'Station Road'])}`, city: c[0], state: c[1], pin: c[2] } });
  }
  const sellable = PRODUCTS.filter(p => p.type !== 'service');
  const orders = [];
  for (let i = 0; i < 36; i++) {
    const cust = pick(customers), daysAgo = Math.floor(rnd() * 30);
    const items = [];
    for (let k = 0; k < (rnd() < .7 ? 1 : 2); k++) {
      const p = pick(sellable), vi = p.variants.length ? Math.floor(rnd() * p.variants.length) : -1;
      items.push({ id: p.id, title: p.title, price: vi >= 0 ? p.variants[vi].price : p.price, qty: 1, variant: vi >= 0 ? p.variants[vi].label : '' });
    }
    const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
    const shipping = subtotal >= SETTINGS.freeShippingOver ? 0 : SETTINGS.shipping;
    const status = daysAgo < 2 ? pick(['Pending', 'Confirmed']) : daysAgo < 6 ? pick(['Confirmed', 'Shipped']) : pick(['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Cancelled']);
    orders.push({ id: 'YR' + (60120 + i), customerId: cust.id, name: cust.name, email: cust.email, phone: cust.phone, address: cust.address,
      items, subtotal, discount: 0, coupon: '', shipping, codFee: 0, gst: Math.round(subtotal * SETTINGS.gst / (100 + SETTINGS.gst)), total: subtotal + shipping,
      payment: pick(['UPI', 'Card', 'UPI', 'Cash on delivery']), status, tracking: ['Shipped', 'Delivered'].includes(status) ? 'BD' + Math.floor(rnd() * 1e9) : '',
      created: Date.now() - daysAgo * 864e5 - Math.floor(rnd() * 864e5) });
  }
  orders.sort((a, b) => b.created - a.created);
  return { customers, orders };
}
const co = makeCustomersAndOrders();
export const CUSTOMERS = co.customers;
export const ORDERS = co.orders;

/* Leads from the Astro Tools pages. */
export const ENQUIRIES = [
  { id: 'E1', type: 'Consultation', name: 'Neha Gupta', phone: '+91 98200 11223', email: 'neha.g@example.com', dob: '1992-04-17', tob: '06:40', pob: 'Indore', note: 'Career change — which stone should I wear?', slot: 'Tomorrow, 11:00 am', status: 'New', created: Date.now() - 3 * 36e5 },
  { id: 'E2', type: 'Kundali', name: 'Rohan Iyer', phone: '+91 99000 44556', email: 'rohan.i@example.com', dob: '1988-11-02', tob: '22:15', pob: 'Chennai', note: 'English, PDF', status: 'In progress', created: Date.now() - 2 * 864e5 },
  { id: 'E3', type: 'Gem recommendation', name: 'Kavya Nair', phone: '+91 97400 77889', email: '', dob: '1996-08-09', note: 'Result: Ruby (Manik) — Leo', status: 'New', created: Date.now() - 5 * 864e5 },
  { id: 'E4', type: 'Rudraksha recommendation', name: 'Arjun Mehta', phone: '+91 98111 22334', email: '', dob: '1979-01-25', note: 'Purpose: wealth — Result: 7 Mukhi, 5 Mukhi', status: 'Done', created: Date.now() - 9 * 864e5 },
];

export const REVIEWS = [
  ['Priya S.', 5, 'The Pukhraj is even brighter than in the photos. Certificate matched the stone exactly.'],
  ['Rahul V.', 5, 'Ordered a 5 Mukhi Nepal rudraksha — genuine, with the X-ray report. Delivered in 3 days.'],
  ['Ananya I.', 5, 'The free recommendation was spot on, and the consultation was worth every rupee.'],
  ['Vikram R.', 5, 'Honest advice on the Neelam weight. Will buy again.'],
  ['Kavya N.', 4, 'The Sphatik mala is lovely. Packaging could be a little sturdier.'],
].map(([name, rating, text], i) => ({ id: 'R' + (i + 1), productId: PRODUCTS[(i * 11) % 40].id, name, rating, text, approved: true, created: Date.now() - (i + 2) * 3 * 864e5 }));

export const FAQ = [
  ['Are your gemstones natural?', 'Yes. Every stone is natural and comes with a certificate from an independent gem laboratory. Rudraksha are X-ray tested to confirm the mukhi.'],
  ['How do I know which weight (ratti) to buy?', 'Your astrologer usually suggests a weight based on your body weight and chart. You can also book a 1-to-1 consultation, and use our free carat-to-ratti converter.'],
  ['How long does delivery take?', 'Stones ship within 1–2 working days and arrive in 3–6 days across India. International shipping takes 7–12 days.'],
  ['Can I return a product?', 'Yes — any stone or rudraksha can be returned within 7 days of delivery for a full refund, as long as it is in its original condition with the certificate.'],
  ['Are the stones energised?', 'Yes, on request at no cost. Tell us your name and gotra at checkout and we perform Pran Pratishtha before dispatch.'],
  ['Is my payment secure?', 'Payments are processed by a secure payment gateway. We never see or store your card details.'],
];
