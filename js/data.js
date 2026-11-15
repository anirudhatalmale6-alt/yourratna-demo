/* Seed data for the demo. Everything here can be changed in the admin panel. */
import { GEMS, METALS } from './art.js';

export const SETTINGS = {
  name: 'Sitara Gems',
  tagline: 'Certified gemstones & fine jewellery',
  phone: '+91 98765 43210',
  email: 'care@sitaragems.example',
  address: '12 Johari Bazaar, Jaipur, Rajasthan 302003',
  gstin: '08ABCDE1234F1Z5',
  gst: 3,
  shipping: 99,
  freeShippingOver: 2999,
  cod: true,
  codFee: 49,
  announcement: 'Free insured shipping over ₹2,999 · Lab-certified gemstones · 7-day easy returns',
  instagram: '@sitaragems',
};

export const CATEGORIES = [
  { slug: 'rings', name: 'Rings', type: 'ring', gem: 'emerald', metal: 'vermeil', home: true, blurb: 'Gemstone rings for men and women' },
  { slug: 'pendants', name: 'Pendants', type: 'pendant', gem: 'ruby', metal: 'silver', home: true, blurb: 'Everyday and statement pendants' },
  { slug: 'earrings', name: 'Earrings', type: 'earrings', gem: 'blue-sapphire', metal: 'gold', home: true, blurb: 'Studs, drops and danglers' },
  { slug: 'necklaces', name: 'Necklaces', type: 'necklace', gem: 'pearl', metal: 'vermeil', home: true, blurb: 'Necklaces for every occasion' },
  { slug: 'gemstones', name: 'Loose Gemstones', type: 'loose', gem: 'yellow-sapphire', metal: 'silver', home: true, blurb: 'Certified natural stones by the carat' },
];

export const ZODIAC = [
  { slug: 'aries', name: 'Aries', dates: 'Mar 21 – Apr 19', gem: 'red-coral', sym: '♈' },
  { slug: 'taurus', name: 'Taurus', dates: 'Apr 20 – May 20', gem: 'diamond', sym: '♉' },
  { slug: 'gemini', name: 'Gemini', dates: 'May 21 – Jun 20', gem: 'emerald', sym: '♊' },
  { slug: 'cancer', name: 'Cancer', dates: 'Jun 21 – Jul 22', gem: 'pearl', sym: '♋' },
  { slug: 'leo', name: 'Leo', dates: 'Jul 23 – Aug 22', gem: 'ruby', sym: '♌' },
  { slug: 'virgo', name: 'Virgo', dates: 'Aug 23 – Sep 22', gem: 'emerald', sym: '♍' },
  { slug: 'libra', name: 'Libra', dates: 'Sep 23 – Oct 22', gem: 'opal', sym: '♎' },
  { slug: 'scorpio', name: 'Scorpio', dates: 'Oct 23 – Nov 21', gem: 'red-coral', sym: '♏' },
  { slug: 'sagittarius', name: 'Sagittarius', dates: 'Nov 22 – Dec 21', gem: 'yellow-sapphire', sym: '♐' },
  { slug: 'capricorn', name: 'Capricorn', dates: 'Dec 22 – Jan 19', gem: 'blue-sapphire', sym: '♑' },
  { slug: 'aquarius', name: 'Aquarius', dates: 'Jan 20 – Feb 18', gem: 'blue-sapphire', sym: '♒' },
  { slug: 'pisces', name: 'Pisces', dates: 'Feb 19 – Mar 20', gem: 'yellow-sapphire', sym: '♓' },
];

// deterministic pseudo-random so the demo looks the same for everyone
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const STYLES = {
  ring: ['Classic Solitaire', 'Royal Halo', 'Elegant Oval', 'Heritage', 'Minimal Band', 'Twisted Vine'],
  pendant: ['Teardrop', 'Classic Prong', 'Royal Kite', 'Petite Charm', 'Heritage'],
  earrings: ['Bloom Stud', 'Halo Drop', 'Classic Stud', 'Crescent Drop', 'Royal Dangler'],
  necklace: ['Grace Station', 'Royal Choker', 'Heritage Mala', 'Elegance Lariat'],
};
const BASE = { ring: 3499, pendant: 2999, earrings: 3299, necklace: 5999 };
const GEM_MULT = { ruby: 1.6, emerald: 1.5, 'blue-sapphire': 1.8, 'yellow-sapphire': 1.7, pearl: .7, 'red-coral': .8,
  hessonite: .75, 'cats-eye': .9, diamond: 2.6, opal: 1.0, amethyst: .55, 'blue-topaz': .6 };
const METAL_MULT = { silver: 1, vermeil: 1.35, panchdhatu: .9, gold: 4.2, rosegold: 4.3 };
const PER_CARAT = { ruby: 4200, emerald: 3900, 'blue-sapphire': 5200, 'yellow-sapphire': 4800, pearl: 950, 'red-coral': 1300,
  hessonite: 1100, 'cats-eye': 1900, diamond: 38000, opal: 2600, amethyst: 450, 'blue-topaz': 520 };

const round = n => Math.round(n / 100) * 100 - 1;

function makeProducts() {
  const out = [];
  let n = 1001;
  const gems = Object.keys(GEMS);
  const jewelTypes = ['ring', 'pendant', 'earrings', 'necklace'];
  for (const gem of gems) {
    for (const type of jewelTypes) {
      if (type === 'necklace' && rnd() < .45) continue;
      const metal = pick(type === 'ring' ? ['silver', 'vermeil', 'panchdhatu', 'gold'] : ['silver', 'vermeil', 'gold', 'rosegold']);
      const style = pick(STYLES[type]);
      const gender = type === 'ring' ? pick(['Women', 'Men', 'Unisex']) : 'Women';
      const tname = { ring: 'Ring', pendant: 'Pendant', earrings: 'Earrings', necklace: 'Necklace' }[type];
      const title = `${style} ${GEMS[gem].name} ${tname} in ${METALS[metal].name}`;
      const price = round(BASE[type] * GEM_MULT[gem] * METAL_MULT[metal] * (0.9 + rnd() * .3));
      out.push({
        id: 'P' + n, sku: `SG-${type.slice(0, 2).toUpperCase()}${n}`, slug: slugify(title) + '-' + n,
        title, type, category: { ring: 'rings', pendant: 'pendants', earrings: 'earrings', necklace: 'necklaces' }[type],
        gem, metal, gender, price, compare: rnd() < .55 ? round(price * (1.15 + rnd() * .2)) : 0,
        stock: Math.floor(rnd() * 14) + (rnd() < .12 ? 0 : 1), carat: +(2 + rnd() * 5).toFixed(2),
        sizes: type === 'ring' ? ['6', '7', '8', '9', '10', '11', '12', '13', '14'] : [],
        featured: rnd() < .3, bestseller: rnd() < .25, status: 'active', images: [],
        rating: +(4.2 + rnd() * .8).toFixed(1), reviews: Math.floor(rnd() * 140) + 3,
        desc: `Handcrafted ${tname.toLowerCase()} set with a natural, lab-certified ${GEMS[gem].name} (${GEMS[gem].hindi}). ` +
          `Made in ${METALS[metal].name} with a secure prong setting and a polished finish that is comfortable for everyday wear. ` +
          `Comes with a gemstone certificate, a jewellery care card and a gift box.`,
        created: Date.now() - Math.floor(rnd() * 90) * 864e5,
      });
      n++;
    }
    // the loose stone itself, priced per carat
    const carat = +(3 + rnd() * 4).toFixed(2);
    out.push({
      id: 'P' + n, sku: `SG-LS${n}`, slug: slugify(`natural ${GEMS[gem].name} ${carat} carat`) + '-' + n,
      title: `Natural ${GEMS[gem].name} (${GEMS[gem].hindi}) – ${carat} Carat`, type: 'loose', category: 'gemstones',
      gem, metal: 'silver', gender: 'Unisex', price: round(PER_CARAT[gem] * carat), compare: 0, perCarat: PER_CARAT[gem],
      stock: Math.floor(rnd() * 6) + 1, carat, sizes: [], featured: rnd() < .35, bestseller: rnd() < .2, status: 'active', images: [],
      rating: +(4.4 + rnd() * .6).toFixed(1), reviews: Math.floor(rnd() * 90) + 5,
      desc: `Untreated natural ${GEMS[gem].name} (${GEMS[gem].hindi}), ${carat} carat (${(carat * 1.1).toFixed(2)} ratti). ` +
        `Tested and certified by an independent gem lab — the certificate number is printed on the card in the box. ` +
        `Can be set into a ring or pendant of your choice; ask us for a custom setting quote.`,
      created: Date.now() - Math.floor(rnd() * 90) * 864e5,
    });
    n++;
  }
  return out;
}

export const PRODUCTS = makeProducts();

export const BANNERS = [
  { id: 'B1', title: 'Gemstones, certified & true', sub: 'Natural stones tested by independent labs — with the certificate in every box.', btn: 'Shop gemstones', link: '#/shop?cat=gemstones', gem: 'blue-sapphire', type: 'loose', image: '', theme: 'navy' },
  { id: 'B2', title: 'The Festive Edit', sub: 'Gold vermeil rings, pendants and earrings — up to 20% off this week.', btn: 'Shop the edit', link: '#/shop?metal=vermeil', gem: 'emerald', type: 'ring', image: '', theme: 'wine' },
  { id: 'B3', title: 'Find your birthstone', sub: 'Pick your zodiac sign and we will show you the stones made for you.', btn: 'Shop by zodiac', link: '#/zodiac', gem: 'ruby', type: 'pendant', image: '', theme: 'forest' },
];

export const POSTS = [
  { slug: 'how-to-check-a-real-gemstone', title: 'How to tell a natural gemstone from a fake', date: '2026-10-02', gem: 'ruby',
    excerpt: 'Five simple checks — and why a lab certificate is the only one that really counts.',
    body: 'Buying a gemstone online can feel risky. Here is what to look for.\n\n## 1. Ask for a certificate\nA natural stone should come with a report from an independent gem lab. Check that the weight and colour on the report match the stone.\n\n## 2. Look for natural inclusions\nNatural stones usually have tiny marks inside. Perfectly clean stones at low prices are a warning sign.\n\n## 3. Check the price\nIf a large ruby or blue sapphire is very cheap, it is probably glass-filled or synthetic.\n\n## 4. Buy from a seller with a return policy\nWe offer a 7-day return on every stone, so you can have it tested again locally.' },
  { slug: 'carat-vs-ratti', title: 'Carat vs Ratti: what is the difference?', date: '2026-09-18', gem: 'yellow-sapphire',
    excerpt: 'Astrologers often prescribe stones in ratti. Here is how it converts to carats.',
    body: 'One carat is 200 milligrams. One ratti is about 182 milligrams, so 1 carat ≈ 1.1 ratti.\n\n## Which should I use?\nJewellers weigh in carats. If your astrologer gave you a weight in ratti, divide it by 1.1 to get carats.\n\n## Example\nA 5.25 ratti Pukhraj is about 4.77 carats.' },
  { slug: 'caring-for-gemstone-jewellery', title: 'How to care for your gemstone jewellery', date: '2026-08-27', gem: 'emerald',
    excerpt: 'Keep your stones bright for years with these easy habits.',
    body: 'Gemstones are durable, but a little care goes a long way.\n\n## Cleaning\nUse lukewarm water, a drop of mild soap and a soft brush. Avoid ultrasonic cleaners for emerald, opal and pearl.\n\n## Storage\nKeep each piece in its own pouch so harder stones do not scratch softer ones.\n\n## Wearing\nPut jewellery on after perfume and lotion, and take it off before swimming.' },
];

export const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, min: 1999, active: true, expires: '2027-12-31' },
  { code: 'FESTIVE500', type: 'flat', value: 500, min: 4999, active: true, expires: '2027-01-31' },
];

const FIRST = ['Priya', 'Rahul', 'Ananya', 'Vikram', 'Neha', 'Arjun', 'Kavya', 'Rohan', 'Isha', 'Aditya', 'Meera', 'Karan', 'Pooja', 'Siddharth', 'Riya'];
const LAST = ['Sharma', 'Verma', 'Iyer', 'Reddy', 'Gupta', 'Nair', 'Mehta', 'Kapoor', 'Joshi', 'Patel', 'Singh', 'Das'];
const CITIES = [['Mumbai', 'Maharashtra', '400050'], ['Delhi', 'Delhi', '110024'], ['Bengaluru', 'Karnataka', '560034'],
  ['Jaipur', 'Rajasthan', '302017'], ['Pune', 'Maharashtra', '411001'], ['Hyderabad', 'Telangana', '500034'], ['Chennai', 'Tamil Nadu', '600017']];

function makeCustomersAndOrders() {
  const customers = [];
  for (let i = 0; i < 18; i++) {
    const f = pick(FIRST), l = pick(LAST), c = pick(CITIES);
    customers.push({ id: 'C' + (2001 + i), name: `${f} ${l}`, email: `${f}.${l}${i}`.toLowerCase() + '@example.com',
      phone: '+91 9' + String(800000000 + Math.floor(rnd() * 199999999)).slice(0, 9),
      password: 'demo1234', created: Date.now() - Math.floor(30 + rnd() * 200) * 864e5,
      address: { line: `${Math.floor(rnd() * 200) + 1}, ${pick(['MG Road', 'Park Street', 'Linking Road', 'Residency Road', 'Station Road'])}`, city: c[0], state: c[1], pin: c[2] } });
  }
  const orders = [];
  const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Confirmed', 'Pending', 'Cancelled'];
  for (let i = 0; i < 34; i++) {
    const cust = pick(customers);
    const daysAgo = Math.floor(rnd() * 30);
    const items = [];
    const count = rnd() < .7 ? 1 : 2;
    for (let k = 0; k < count; k++) {
      const p = pick(PRODUCTS);
      items.push({ id: p.id, title: p.title, price: p.price, qty: 1, size: p.sizes.length ? pick(p.sizes) : '' });
    }
    const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
    const shipping = subtotal >= SETTINGS.freeShippingOver ? 0 : SETTINGS.shipping;
    const status = daysAgo < 2 ? pick(['Pending', 'Confirmed']) : daysAgo < 6 ? pick(['Confirmed', 'Shipped']) : pick(statuses);
    orders.push({ id: 'SG' + (50120 + i), customerId: cust.id, name: cust.name, email: cust.email, phone: cust.phone,
      address: cust.address, items, subtotal, discount: 0, coupon: '', shipping, codFee: 0,
      gst: Math.round(subtotal * SETTINGS.gst / (100 + SETTINGS.gst)), total: subtotal + shipping,
      payment: pick(['UPI', 'Card', 'UPI', 'Cash on delivery']), status, tracking: ['Shipped', 'Delivered'].includes(status) ? 'BD' + Math.floor(rnd() * 1e9) : '',
      created: Date.now() - daysAgo * 864e5 - Math.floor(rnd() * 864e5) });
  }
  orders.sort((a, b) => b.created - a.created);
  return { customers, orders };
}

const co = makeCustomersAndOrders();
export const CUSTOMERS = co.customers;
export const ORDERS = co.orders;

export const REVIEWS = [
  ['Priya S.', 5, 'The ruby is even brighter than in the photos. Certificate matched the stone exactly.'],
  ['Rahul V.', 5, 'Ordered a Pukhraj ring for my father — perfect fit and delivered in 3 days.'],
  ['Ananya I.', 4, 'Beautiful earrings, very well packed. Would love more designs in rose gold.'],
  ['Vikram R.', 5, 'Honest advice on the Neelam weight. Will buy again.'],
  ['Kavya N.', 5, 'The pearl pendant is so elegant. My mother loved it.'],
].map(([name, rating, text], i) => ({ id: 'R' + (i + 1), productId: PRODUCTS[(i * 7) % PRODUCTS.length].id, name, rating, text,
  approved: true, created: Date.now() - (i + 2) * 3 * 864e5 }));

export const FAQ = [
  ['Are your gemstones natural?', 'Yes. Every stone is natural and comes with a certificate from an independent gem laboratory.'],
  ['How long does delivery take?', 'Ready pieces ship within 1–2 working days and arrive in 3–6 days across India. Custom settings take 7–10 days.'],
  ['Can I return a product?', 'Yes — you can return any unworn piece within 7 days of delivery for a full refund. Custom-made rings cannot be returned.'],
  ['How do I find my ring size?', 'Use our size guide on any ring page, or order a free ring sizer with your first purchase.'],
  ['Do you offer cash on delivery?', 'Yes, on orders up to ₹50,000 (a small COD fee applies).'],
  ['Is my payment secure?', 'Payments are processed by a secure payment gateway. We never see or store your card details.'],
];
