/* YourRatna storefront: a small hash-routed app over the shared demo db. */
import { art, productImage, serviceArt, GEMS, MALAS } from './art.js';
import { ZODIAC, RUDRAKSHA, RATTI_PER_CARAT } from './data.js';
import {
  db, save, esc, money, date, product, productBySlug, live, cartAdd, cartSet, cartCount,
  totals, placeOrder, onExternalChange, uid, unitPrice,
} from './db.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');

// ------------------------------------------------------------ utilities ----
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600);
}
const params = () => new URLSearchParams((location.hash.split('?')[1]) || '');
const go = h => { location.hash = h; };
const stars = r => '<span class="stars" aria-label="' + r + ' out of 5">' + '★★★★★'.slice(0, Math.round(r)) + '<i>' + '★★★★★'.slice(Math.round(r)) + '</i></span>';
const me = () => db.session && db.customers.find(c => c.id === db.session.customerId);
const wished = id => db.wishlist.includes(id);
const off = p => p.compare > p.price ? Math.round((1 - p.price / p.compare) * 100) : 0;
const gemName = k => GEMS[k] ? `${GEMS[k].name} (${GEMS[k].hindi})` : k;
const rudName = m => m === 'ganesha' ? 'Ganesha' : m === 'gauri-shankar' ? 'Gauri Shankar' : `${m} Mukhi`;
const catArt = c => c.image ? `<img src="${c.image}" alt="">` : art(c.type, c.key);
const ornament = '<span class="orn" aria-hidden="true">✦</span>';
const icon = {
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  om: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>',
  gem: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18 3-18"/></svg>',
};
const TOOLS = [
  ['gem-recommendation', 'Free Gemstone Recommendation', 'Enter your date of birth and see the stones suited to you.', 'gem', 'yellow-sapphire'],
  ['rudraksha', 'Rudraksha Recommendation', 'Find the mukhi that matches what you want help with.', 'rudraksha', '7'],
  ['consultation', '1-to-1 Astrology Consultation', 'A 45-minute call with our Vedic astrologer.', 'service', 'consultation'],
  ['converter', 'Carat ↔ Ratti Converter', 'Convert weights between carat, ratti and grams.', 'gem', 'emerald'],
  ['kundali', 'Detailed Handmade Kundali', 'A hand-drawn birth chart with predictions.', 'service', 'kundali'],
];
const toolArt = ([, , , t, k]) => t === 'service' ? serviceArt(k) : art(t, k);

// --------------------------------------------------------------- chrome ----
function renderChrome() {
  const s = db.settings;
  document.title = `${s.name} — ${s.tagline}`;
  $('#announce').textContent = s.announcement || '';
  $('#announce').hidden = !s.announcement;
  const cats = db.categories;
  const gemCats = cats.filter(c => c.group === 'gemstones' && c.type !== 'gem');
  const rudCats = cats.filter(c => c.group === 'rudraksha' && c.slug !== 'rudraksha');
  const extra = cats.filter(c => !['gemstones', 'rudraksha'].includes(c.group));
  const gemLink = ([k, g]) => `<a href="#/shop?gem=${k}"><i style="background:${g.c[1]}"></i>${esc(g.hindi)} <small>${esc(g.name)}</small></a>`;
  $('#hdr').innerHTML = `
  <div class="wrap hdr-in">
    <button class="icon-btn only-m" id="menuBtn" aria-label="Menu">${icon.menu}</button>
    <a href="#/" class="logo"><span class="logo-mark" aria-hidden="true"></span><span>${esc(s.name)}</span></a>
    <form class="search" id="searchForm" role="search"><input name="q" placeholder="Search Neelam, 5 mukhi, Pukhraj…" aria-label="Search" value="${esc(params().get('q') || '')}"><button aria-label="Search">${icon.search}</button></form>
    <nav class="hdr-icons">
      <a href="#/account" class="icon-btn" aria-label="Account">${icon.user}</a>
      <a href="#/wishlist" class="icon-btn" aria-label="Wishlist">${icon.heart}<b class="count" ${db.wishlist.length ? '' : 'hidden'}>${db.wishlist.length}</b></a>
      <button class="icon-btn" id="cartBtn" aria-label="Cart">${icon.bag}<b class="count" ${cartCount() ? '' : 'hidden'}>${cartCount()}</b></button>
    </nav>
  </div>
  <nav class="menu" id="menu"><div class="wrap menu-in">
    <div class="mega-wrap"><a href="#/gemstones">Gemstones <span class="car">▾</span></a>
      <div class="mega wide"><div><h5>Precious (Navratna)</h5>${Object.entries(GEMS).filter(([, g]) => g.group === 'precious').map(gemLink).join('')}</div>
        <div><h5>Semi-precious (Uparatna)</h5>${Object.entries(GEMS).filter(([, g]) => g.group === 'semi').map(gemLink).join('')}</div>
        <div><h5>More</h5><a href="#/shop?cat=precious">All precious stones</a><a href="#/shop?cat=semi-precious">All semi-precious</a>${gemCats.map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}<a href="#/zodiac">Stones by zodiac</a></div></div></div>
    <div class="mega-wrap"><a href="#/shop?cat=rudraksha">Rudraksha <span class="car">▾</span></a>
      <div class="mega"><div><h5>By mukhi</h5><div class="mukhi">${Object.keys(RUDRAKSHA).filter(m => +m).map(m => `<a href="#/shop?cat=rudraksha&mukhi=${m}">${m}</a>`).join('')}</div>
        <a href="#/shop?cat=rudraksha&mukhi=ganesha">Ganesha Rudraksha</a><a href="#/shop?cat=rudraksha&mukhi=gauri-shankar">Gauri Shankar Rudraksha</a>
        ${rudCats.map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}<a href="#/shop?cat=rudraksha">All rudraksha</a></div></div></div>
    <div class="mega-wrap"><a href="#/tools">Astro Tools <span class="car">▾</span></a>
      <div class="mega"><div>${TOOLS.map(t => `<a href="#/tools/${t[0]}">${esc(t[1])}</a>`).join('')}</div></div></div>
    ${extra.map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}
    <a href="#/zodiac">Zodiac</a>
    <a href="#/guide">Gem Guide</a>
    <a href="#/tools/consultation" class="menu-cta">Talk to an astrologer</a>
  </div></nav>`;
  $('#ftr').innerHTML = `
  <div class="ftr-band"></div>
  <div class="wrap ftr-grid">
    <div><a href="#/" class="logo light"><span class="logo-mark" aria-hidden="true"></span><span>${esc(s.name)}</span></a>
      <p>${esc(s.tagline)}. Every gemstone is natural and lab-certified; every rudraksha is X-ray tested.</p>
      <p class="muted">${esc(s.address)}<br>${esc(s.phone)} · ${esc(s.email)}</p></div>
    <div><h4>Shop</h4><a href="#/shop?cat=precious">Precious gemstones</a><a href="#/shop?cat=semi-precious">Semi-precious gemstones</a><a href="#/shop?cat=rudraksha">Rudraksha</a>${cats.filter(c => c.type === 'mala').map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}<a href="#/zodiac">Shop by zodiac</a></div>
    <div><h4>Astro tools</h4>${TOOLS.map(t => `<a href="#/tools/${t[0]}">${esc(t[1])}</a>`).join('')}</div>
    <div><h4>Help</h4><a href="#/track">Track your order</a><a href="#/faq">FAQ</a><a href="#/page/shipping">Shipping</a><a href="#/page/returns">Returns</a><a href="#/contact">Contact us</a><a href="#/about">About us</a><a href="#/page/privacy">Privacy</a><a href="#/page/terms">Terms</a><a href="admin/">Admin panel (demo)</a></div>
  </div>
  <div class="wrap ftr-bot"><span>© ${new Date().getFullYear()} ${esc(s.name)}. All rights reserved.</span><span>GSTIN ${esc(s.gstin)}</span></div>`;
  $('#searchForm').onsubmit = e => { e.preventDefault(); go('#/shop?q=' + encodeURIComponent(e.target.q.value.trim())); };
  $('#cartBtn').onclick = openCart;
  $('#menuBtn').onclick = () => $('#menu').classList.toggle('open');
  $$('.mega-wrap>a').forEach(a => a.addEventListener('click', e => { if (matchMedia('(max-width:860px)').matches) { e.preventDefault(); a.parentNode.classList.toggle('open'); } }));
}

function updateCounts() {
  const c = $('#cartBtn .count'); if (c) { c.textContent = cartCount(); c.hidden = !cartCount(); }
  const w = $('a[href="#/wishlist"] .count'); if (w) { w.textContent = db.wishlist.length; w.hidden = !db.wishlist.length; }
}

// ------------------------------------------------------------- the cart ----
const lineSub = l => [l.label, l.p.type === 'service' && l.note ? 'Booking ' + l.note : ''].filter(Boolean).map(x => `<small>${esc(x)}</small>`).join('');
function openCart() {
  const t = totals();
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer-hd"><h3>Your bag (${cartCount()})</h3><button class="x" id="dClose" aria-label="Close">×</button></div>
    ${t.items.length ? `<div class="drawer-list">${t.items.map((l, i) => `
      <div class="line"><a href="#/p/${esc(l.p.slug)}" class="thumb">${productImage(l.p)}</a>
        <div><a href="#/p/${esc(l.p.slug)}" class="line-t">${esc(l.p.title)}</a>${lineSub(l)}
          <div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1">+</button></div></div>
        <b>${money(l.unit * l.qty)}</b></div>`).join('')}</div>
      <div class="drawer-ft">
        ${t.shipping ? `<p class="hint">Add ${money(db.settings.freeShippingOver - (t.subtotal - t.discount))} more for free insured shipping.</p>` : '<p class="hint ok">Free insured shipping on this order.</p>'}
        <div class="sumrow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
        <a href="#/cart" class="btn ghost full">View bag</a><a href="#/checkout" class="btn full">Checkout</a></div>`
      : `<div class="empty">${icon.bag}<p>Your bag is empty.</p><a href="#/gemstones" class="btn">Explore gemstones</a></div>`}`;
  d.classList.add('on'); $('#scrim').classList.add('on'); d.setAttribute('aria-hidden', 'false');
  $('#dClose').onclick = closeCart;
  $$('[data-q]', d).forEach(b => b.onclick = () => { const i = +b.dataset.q; cartSet(i, db.cart[i].qty + +b.dataset.d); updateCounts(); openCart(); });
  $$('a', d).forEach(a => a.addEventListener('click', closeCart));
}
function closeCart() { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); $('#drawer').setAttribute('aria-hidden', 'true'); }
$('#scrim').onclick = () => { closeCart(); closeModal(); };
function modal(html) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-box"><button class="x" id="mClose" aria-label="Close">×</button>${html}</div>`;
  m.classList.add('on'); $('#scrim').classList.add('on');
  $('#mClose').onclick = closeModal;
}
function closeModal() { $('#modal').classList.remove('on'); $('#scrim').classList.remove('on'); }

// ------------------------------------------------------------ components ---
function subtitle(p) {
  if (p.type === 'gem') return `${esc(p.origin)} · ${esc(p.lab.split(' ')[0])} certified`;
  if (p.type === 'rudraksha') return `${esc(p.origin)} · ${esc(p.size)} · X-ray tested`;
  return `${esc(p.beads || '')}`;
}
function card(p) {
  return `<article class="card">
    <a href="#/p/${esc(p.slug)}" class="card-img"><span class="arch">${productImage(p)}</span>
      ${off(p) ? `<span class="tag">${off(p)}% off</span>` : ''}${p.stock <= 0 ? '<span class="tag dark">Sold out</span>' : p.bestseller ? '<span class="tag gold">Bestseller</span>' : ''}</a>
    <button class="wish ${wished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Add to wishlist">${icon.heart}</button>
    <div class="card-b">
      <a href="#/p/${esc(p.slug)}" class="card-t">${esc(p.title)}</a>
      <span class="card-s">${subtitle(p)}</span>
      <div class="card-r">${stars(p.rating)} <small>(${p.reviews})</small></div>
      <div class="price">${p.variants?.length ? '<small>from</small> ' : ''}${money(p.price)} ${p.compare > p.price ? `<s>${money(p.compare)}</s>` : ''}</div>
      <button class="btn sm full" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sold out' : p.variants?.length ? 'Choose weight' : 'Add to bag'}</button>
    </div></article>`;
}
function bindCards(root = app) {
  $$('[data-wish]', root).forEach(b => b.onclick = e => {
    e.preventDefault();
    const id = b.dataset.wish;
    db.wishlist = wished(id) ? db.wishlist.filter(x => x !== id) : [...db.wishlist, id];
    b.classList.toggle('on', wished(id)); updateCounts();
    toast(wished(id) ? 'Saved to your wishlist' : 'Removed from wishlist');
  });
  $$('[data-add]', root).forEach(b => b.onclick = () => {
    const p = product(b.dataset.add);
    if (p.variants?.length) return go('#/p/' + p.slug);
    if (cartAdd(p.id)) { updateCounts(); toast('Added to your bag'); openCart(); }
  });
}
const trust = () => `<section class="trust wrap">
  <div>${icon.gem}<b>100% natural</b><span>Lab-certified gemstones</span></div>
  <div>${icon.om}<b>Energised for you</b><span>Free Pran Pratishtha</span></div>
  <div>${icon.truck}<b>Free insured shipping</b><span>On orders over ${money(db.settings.freeShippingOver)}</span></div>
  <div>${icon.shield}<b>7-day returns</b><span>Re-test it anywhere</span></div></section>`;
const secHd = (title, link, label, eyebrow = '') => `<div class="sec-hd">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2>${title}</h2>${link ? `<a href="${link}">${label} →</a>` : ''}</div>`;
const gemTile = ([k, g]) => `<a href="#/shop?gem=${k}" class="gem"><span class="arch">${art('gem', k, { r: 96 })}</span><b>${esc(g.hindi)}</b><span>${esc(g.name)}</span></a>`;

// ------------------------------------------------------------------ pages --
function pageHome() {
  const s = db.settings, P = live();
  const featured = P.filter(p => p.featured).slice(0, 8);
  const best = P.filter(p => p.bestseller).slice(0, 8);
  app.innerHTML = `
  <section class="hero" id="hero">
    ${db.banners.map((b, i) => `<div class="slide t-${esc(b.theme || 'teal')} ${i ? '' : 'on'}"><div class="mandala" aria-hidden="true"></div>
      <div class="wrap slide-in"><div class="slide-txt"><p class="eyebrow">${ornament} ${esc(s.name)} ${ornament}</p><h1>${esc(b.title)}</h1><p>${esc(b.sub)}</p>
        <a href="${esc(b.link || '#/shop')}" class="btn gold">${esc(b.btn || 'Shop now')}</a></div>
        <div class="slide-art"><span class="arch">${b.image ? `<img src="${b.image}" alt="">` : art(b.type || 'gem', b.key || 'ruby')}</span></div></div></div>`).join('')}
    ${db.banners.length > 1 ? `<div class="dots">${db.banners.map((_, i) => `<button data-s="${i}" class="${i ? '' : 'on'}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>` : ''}
  </section>
  ${trust()}
  <section class="wrap sec">${secHd('Navratna — precious gemstones', '#/shop?cat=precious', 'All precious stones', 'The nine planetary stones')}
    <div class="gems">${Object.entries(GEMS).filter(([, g]) => g.group === 'precious').map(gemTile).join('')}</div></section>
  <section class="band"><div class="wrap sec">${secHd('Rudraksha by mukhi', '#/shop?cat=rudraksha', 'All rudraksha', 'Nepal & Indonesia · X-ray tested')}
    <div class="mukhi-row">${Object.entries(RUDRAKSHA).map(([m, r]) => `<a href="#/shop?cat=rudraksha&mukhi=${m}" class="mk"><span class="arch">${art('rudraksha', m)}</span><b>${rudName(m)}</b><small>${esc(r[0])}</small></a>`).join('')}</div></div></section>
  <section class="reco"><div class="wrap reco-in"><div><p class="eyebrow">${ornament} Free · takes 10 seconds</p><h2>Which gemstone is right for you?</h2>
      <p>Enter your date of birth for an instant recommendation based on your sun sign. For a full chart-based answer, book a consultation.</p></div>
    <form id="recoForm" class="reco-form"><label>Your name<input name="name" required></label><label>Date of birth<input name="dob" type="date" required></label>
      <label>Mobile (optional)<input name="phone" inputmode="tel"></label><button class="btn gold">Show my gemstone</button></form></div></section>
  <section class="wrap sec">${secHd('Our finest stones', '#/shop?sort=featured', 'See more', 'Hand-picked this month')}<div class="grid">${featured.map(card).join('')}</div></section>
  <section class="band"><div class="wrap sec">${secHd('Semi-precious gemstones', '#/shop?cat=semi-precious', 'All semi-precious', 'Uparatna')}
    <div class="gems">${Object.entries(GEMS).filter(([, g]) => g.group === 'semi').map(gemTile).join('')}</div></div></section>
  <section class="wrap sec">${secHd('Astro tools', '#/tools', 'All tools', 'Guidance before you buy')}
    <div class="tools">${TOOLS.map(t => `<a href="#/tools/${t[0]}" class="tool"><span class="arch sm">${toolArt(t)}</span><div><b>${esc(t[1])}</b><span>${esc(t[2])}</span></div></a>`).join('')}</div></section>
  <section class="band dark"><div class="mandala soft" aria-hidden="true"></div><div class="wrap sec">${secHd('Shop by zodiac sign', '#/zodiac', 'Find your stone', 'Rashi ratna')}
    <div class="zod">${ZODIAC.map(z => `<a href="#/shop?zodiac=${z.slug}" class="z"><span class="sym">${z.sym}</span><b>${z.name}</b><small>${esc(z.rashi)} · ${esc(GEMS[z.gem].hindi)}</small></a>`).join('')}</div></div></section>
  <section class="wrap sec">${secHd('Bestsellers', '#/shop?sort=popular', 'See more')}<div class="grid">${best.map(card).join('')}</div></section>
  <section class="wrap sec split"><div class="split-art"><span class="arch tall">${art('gem', 'emerald')}</span></div>
    <div><p class="eyebrow">Why ${esc(s.name)}</p><h2>Honest stones, checked twice</h2>
      <p>Every gemstone we sell is natural, weighed in front of you on the certificate and tested by an independent laboratory. Every rudraksha is X-ray tested to confirm its mukhi.</p>
      <ul class="ticks"><li>Certificate with every gemstone</li><li>Weight shown in carat and ratti</li><li>Free energisation (Pran Pratishtha) before dispatch</li><li>Free re-testing within 7 days</li></ul>
      <a href="#/about" class="btn ghost">Our story</a></div></section>
  <section class="band"><div class="wrap sec">${secHd('What our customers say')}
    <div class="revs">${db.reviews.filter(r => r.approved).slice(0, 4).map(r => `<figure class="rev">${stars(r.rating)}<blockquote>“${esc(r.text)}”</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('')}</div></div></section>
  <section class="wrap sec">${secHd('Learn before you buy', '#/guide', 'All articles', 'Gem Guide')}<div class="posts">${db.posts.slice(0, 3).map(postCard).join('')}</div></section>
  <section class="news"><div class="wrap news-in"><div><h2>Join the ${esc(s.name)} circle</h2><p>Auspicious dates, new arrivals and members-only offers. No spam.</p></div>
    <form id="newsForm"><input type="email" required placeholder="Your email address" aria-label="Email"><button class="btn gold">Subscribe</button></form></div></section>`;
  bindCards();
  let i = 0;
  const slides = $$('.slide'), dots = $$('.dots button');
  const show = n => { i = (n + slides.length) % slides.length; slides.forEach((x, k) => x.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  dots.forEach(d => d.onclick = () => show(+d.dataset.s));
  clearInterval(window._hero);
  if (slides.length > 1) window._hero = setInterval(() => document.contains(slides[0]) ? show(i + 1) : clearInterval(window._hero), 6000);
  $('#newsForm').onsubmit = e => { e.preventDefault(); db.newsletter = [...db.newsletter, { email: e.target[0].value, at: Date.now() }]; e.target.reset(); toast('Thank you — you are subscribed!'); };
  $('#recoForm').onsubmit = e => { e.preventDefault(); const f = e.target; go(`#/tools/gem-recommendation?name=${encodeURIComponent(f.name.value)}&dob=${f.dob.value}&phone=${encodeURIComponent(f.phone.value)}`); };
}
const postCard = p => `<a href="#/guide/${esc(p.slug)}" class="post"><div class="post-img">${p.image ? `<img src="${p.image}" alt="">` : art(p.type || 'gem', p.key || 'ruby')}</div>
  <small>${date(p.date)}</small><b>${esc(p.title)}</b><span>${esc(p.excerpt)}</span></a>`;

function pageShop() {
  const q = params();
  const f = { cat: q.get('cat') || '', gem: q.get('gem') || '', mukhi: q.get('mukhi') || '', origin: q.get('origin') || '',
    zodiac: q.get('zodiac') || '', min: +q.get('min') || 0, max: +q.get('max') || 0, sort: q.get('sort') || 'featured', q: q.get('q') || '' };
  const zod = ZODIAC.find(z => z.slug === f.zodiac);
  let list = live();
  if (f.cat) list = list.filter(p => p.category === f.cat);
  if (f.gem) list = list.filter(p => p.gem === f.gem);
  if (zod) list = list.filter(p => p.gem === zod.gem);
  if (f.mukhi) list = list.filter(p => p.mukhi === f.mukhi);
  if (f.origin) list = list.filter(p => p.origin === f.origin);
  if (f.min) list = list.filter(p => p.price >= f.min);
  if (f.max) list = list.filter(p => p.price <= f.max);
  if (f.q) {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(p => { const g = GEMS[p.gem]; const hay = `${p.title} ${g?.name || ''} ${g?.hindi || ''} ${p.mukhi ? rudName(p.mukhi) + ' mukhi rudraksha' : ''} ${p.category} ${p.sku} ${p.origin || ''}`.toLowerCase(); return words.every(w => hay.includes(w)); });
  }
  const sorts = { featured: (a, b) => (b.featured - a.featured) || (b.bestseller - a.bestseller), popular: (a, b) => b.reviews - a.reviews,
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, new: (a, b) => b.created - a.created };
  list.sort(sorts[f.sort] || sorts.featured);
  const cat = db.categories.find(c => c.slug === f.cat);
  const title = f.q ? `Results for “${f.q}”` : zod ? `${zod.name} (${zod.rashi}) — ${gemName(zod.gem)}` : f.mukhi ? `${rudName(f.mukhi)} Rudraksha`
    : f.gem ? gemName(f.gem) : cat ? cat.name : 'All products';
  const link = ch => { const n = new URLSearchParams(q); for (const [k, v] of Object.entries(ch)) v ? n.set(k, v) : n.delete(k); return '#/shop?' + n.toString(); };
  const opt = (k, v, label) => `<a href="${link({ [k]: f[k] === v ? '' : v })}" class="${f[k] === v ? 'on' : ''}">${label}</a>`;
  const scope = live().filter(p => !f.cat || p.category === f.cat);
  const origins = [...new Set(scope.map(p => p.origin).filter(Boolean))].sort();
  const showGems = !f.cat || ['precious', 'semi-precious'].includes(f.cat);
  const showMukhi = f.cat === 'rudraksha';
  const g = GEMS[f.gem] || (zod && GEMS[zod.gem]);
  app.innerHTML = `
  <section class="page-hd"><div class="mandala soft" aria-hidden="true"></div><div class="wrap"><nav class="crumbs"><a href="#/">Home</a> / ${esc(title)}</nav><h1>${esc(title)}</h1>
    ${g ? `<p>Stone of <b>${esc(g.planet)}</b> · worn on ${esc(g.day)} on the ${esc(g.finger.toLowerCase())} finger, set in ${esc(g.metal.toLowerCase())}.</p>`
      : f.mukhi && RUDRAKSHA[f.mukhi] ? `<p>Ruled by <b>${esc(RUDRAKSHA[f.mukhi][0])}</b> · blessed by ${esc(RUDRAKSHA[f.mukhi][1])} · worn for ${esc(RUDRAKSHA[f.mukhi][2].toLowerCase())}.</p>`
      : cat ? `<p>${esc(cat.blurb || '')}</p>` : ''}</div></section>
  <div class="wrap shop">
    <aside class="filters" id="filters"><button class="btn sm ghost only-m" id="fClose">Done</button>
      <h4>Category</h4><div class="opts">${db.categories.map(c => opt('cat', c.slug, esc(c.name))).join('')}</div>
      ${showGems ? `<h4>Gemstone</h4><div class="opts scroll">${Object.entries(GEMS).filter(([, x]) => !f.cat || (f.cat === 'precious') === (x.group === 'precious')).map(([k, x]) => opt('gem', k, `<i style="background:${x.c[1]}"></i>${esc(x.hindi)} <small>${esc(x.name)}</small>`)).join('')}</div>` : ''}
      ${showMukhi ? `<h4>Mukhi</h4><div class="opts chips-sm">${Object.keys(RUDRAKSHA).map(m => opt('mukhi', m, rudName(m))).join('')}</div>` : ''}
      ${origins.length > 1 ? `<h4>Origin</h4><div class="opts">${origins.map(o => opt('origin', o, esc(o))).join('')}</div>` : ''}
      <h4>Price</h4><div class="opts">${[[0, 1999, 'Under ₹2,000'], [2000, 9999, '₹2,000 – ₹9,999'], [10000, 29999, '₹10,000 – ₹29,999'], [30000, 0, '₹30,000 and above']].map(([a, b, l]) =>
        `<a href="${link({ min: a || '', max: b || '' })}" class="${f.min === a && f.max === b && (a || b) ? 'on' : ''}">${l}</a>`).join('')}</div>
      ${(f.cat || f.gem || f.mukhi || f.origin || f.min || f.max || f.zodiac) ? `<a href="#/shop${f.q ? '?q=' + encodeURIComponent(f.q) : ''}" class="clear">Clear all filters</a>` : ''}
    </aside>
    <section>
      <div class="toolbar"><button class="btn sm ghost only-m" id="fOpen">Filters</button><span>${list.length} product${list.length === 1 ? '' : 's'}</span>
        <label>Sort <select id="sort">${[['featured', 'Featured'], ['popular', 'Most popular'], ['new', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']].map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">${icon.search}<p>Nothing matches those filters.</p><a href="#/shop" class="btn">See everything</a></div>`}
    </section></div>`;
  $('#sort').onchange = e => go(link({ sort: e.target.value }));
  $('#fOpen') && ($('#fOpen').onclick = () => $('#filters').classList.add('open'));
  $('#fClose') && ($('#fClose').onclick = () => $('#filters').classList.remove('open'));
  bindCards();
}

function specs(p) {
  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
  if (p.type === 'gem') {
    const g = GEMS[p.gem];
    return row('Gemstone', esc(gemName(p.gem))) + row('Origin', esc(p.origin)) + row('Shape', esc(p.shape)) + row('Treatment', esc(p.treatment))
      + row('Certificate', esc(p.lab)) + row('Ruling planet', esc(g.planet));
  }
  if (p.type === 'rudraksha') return row('Mukhi', esc(rudName(p.mukhi))) + row('Origin', esc(p.origin)) + row('Bead size', esc(p.size))
    + row('Ruling planet', esc(p.planet)) + row('Deity', esc(p.deity)) + row('Testing', 'X-ray tested');
  return row('Material', esc(MALAS[p.material]?.name || p.material)) + row('Beads', esc(p.beads)) + row('Origin', esc(p.origin));
}
function wearBox(p) {
  if (p.type === 'gem') {
    const g = GEMS[p.gem];
    return `<div class="wear"><h4>${ornament} How to wear ${esc(g.hindi)}</h4><ul><li><b>Day:</b> ${esc(g.day)} morning, after bath</li><li><b>Finger:</b> ${esc(g.finger)} finger</li><li><b>Metal:</b> ${esc(g.metal)}</li><li><b>Planet:</b> ${esc(g.planet)}</li></ul></div>`;
  }
  if (p.type === 'rudraksha') return `<div class="wear"><h4>${ornament} Benefits</h4><p>${esc(p.benefit)}. Wear on a Monday morning after chanting “Om Namah Shivaya” 108 times.</p></div>`;
  return '';
}

function pageProduct(slug) {
  const p = productBySlug(slug);
  if (!p || p.status !== 'active') return notFound();
  if (p.type === 'service') return go(p.service === 'kundali' ? '#/tools/kundali' : '#/tools/consultation');
  const imgs = (p.images && p.images.length) ? p.images : [null];
  const revs = db.reviews.filter(r => r.productId === p.id && r.approved);
  const related = live().filter(x => x.id !== p.id && (p.gem ? x.gem === p.gem : x.category === p.category)).slice(0, 4);
  const cat = db.categories.find(c => c.slug === p.category);
  const hasV = p.variants && p.variants.length;
  let variant = hasV ? 0 : -1;
  app.innerHTML = `
  <div class="wrap"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/shop?cat=${esc(p.category)}">${esc(cat?.name || 'Shop')}</a> / ${esc(p.title)}</nav></div>
  <section class="wrap pdp">
    <div class="gallery"><div class="main-img" id="mainImg"><span class="arch big">${imgs[0] ? `<img src="${imgs[0]}" alt="">` : productImage(p)}</span></div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((src, i) => `<button data-img="${i}" class="${i ? '' : 'on'}"><img src="${src}" alt=""></button>`).join('')}</div>` : ''}
      <p class="cert">${icon.shield} ${p.type === 'gem' ? `Certified by ${esc(p.lab)}` : p.type === 'rudraksha' ? 'X-ray tested · certificate included' : 'Energised before dispatch'}</p></div>
    <div class="info">
      <p class="eyebrow">${p.type === 'gem' ? esc(gemName(p.gem)) : p.type === 'rudraksha' ? 'Rudraksha · ' + esc(rudName(p.mukhi)) : 'Mala'}</p>
      <h1>${esc(p.title)}</h1>
      <div class="card-r">${stars(p.rating)} <button class="link" onclick="document.getElementById('reviews').scrollIntoView({behavior:'smooth'})">${p.reviews} reviews</button> · Code ${esc(p.sku)}</div>
      <div class="price big" id="price"></div>
      <p class="muted">Inclusive of all taxes · free insured shipping over ${money(db.settings.freeShippingOver)}</p>
      ${hasV ? `<div class="sizes"><div class="row-sb"><b>Weight</b><a class="link" href="#/tools/converter">Carat ↔ ratti converter</a></div>
        <div class="chips" id="vChips">${p.variants.map((v, i) => `<button data-v="${i}" class="${i ? '' : 'on'}">${esc(v.label.split(' (')[0])}<small>${esc((v.label.match(/\((.*)\)/) || [])[1] || '')}</small></button>`).join('')}</div></div>` : ''}
      <dl class="specs">${specs(p)}</dl>
      <label class="energise"><input type="checkbox" id="energise" checked> <span><b>Energise before dispatch (free)</b><small>Pran Pratishtha in your name — tell us your name and gotra</small></span></label>
      <div class="energise-in" id="energiseIn"><input id="eName" placeholder="Name for the puja"><input id="eGotra" placeholder="Gotra (optional)"></div>
      <div class="buy">
        <div class="qty big"><button id="qm">−</button><span id="qv">1</span><button id="qp">+</button></div>
        <button class="btn" id="addBtn" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sold out' : 'Add to bag'}</button>
        <button class="btn gold" id="buyBtn" ${p.stock <= 0 ? 'disabled' : ''}>Buy now</button>
        <button class="icon-btn wish ${wished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">${icon.heart}</button>
      </div>
      <p class="stock ${p.stock <= 3 ? 'low' : ''}">${p.stock <= 0 ? 'Out of stock — ask us to source one for you.' : p.stock <= 3 ? `Only ${p.stock} left` : 'In stock · ships in 1–2 days'}</p>
      ${wearBox(p)}
      <details open><summary>Description</summary><p>${esc(p.desc)}</p></details>
      <details><summary>Certificate &amp; authenticity</summary><p>${p.type === 'rudraksha' ? 'Every bead is X-ray tested to confirm the number of natural mukhi lines, and the report comes with it.' : 'Tested by an independent gem laboratory. The report states identity, weight, measurements and any treatment.'} You can re-test it anywhere within 7 days for a full refund if it does not match.</p></details>
      <details><summary>Shipping &amp; returns</summary><p>Ships in 1–2 working days, fully insured, in a tamper-proof box. 7-day returns in original condition with the certificate.</p></details>
      <a href="#/tools/consultation" class="consult-cta">Not sure this stone suits you? <b>Ask our astrologer →</b></a>
    </div></section>
  <section class="wrap sec" id="reviews">${secHd('Customer reviews')}
    <div class="rev-wrap"><div class="rev-sum"><b>${p.rating}</b>${stars(p.rating)}<span>${p.reviews} ratings</span></div>
      <div>${revs.length ? revs.map(r => `<div class="rv">${stars(r.rating)} <b>${esc(r.name)}</b> <small>${date(r.created)}</small><p>${esc(r.text)}</p></div>`).join('') : '<p class="muted">Be the first to review this product.</p>'}
        <form class="rev-form" id="revForm"><h4>Write a review</h4>
          <div class="row2"><input name="name" required placeholder="Your name"><select name="rating">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)} ${n}</option>`).join('')}</select></div>
          <textarea name="text" required rows="3" placeholder="What did you think?"></textarea><button class="btn sm">Submit review</button></form></div></div></section>
  ${related.length ? `<section class="wrap sec">${secHd('You may also like')}<div class="grid">${related.map(card).join('')}</div></section>` : ''}`;
  const drawPrice = () => {
    const u = unitPrice(p, variant), c = p.compare && variant <= 0 ? p.compare : (p.compare ? Math.round(p.compare * u / p.price) : 0);
    $('#price').innerHTML = `${money(u)} ${c > u ? `<s>${money(c)}</s> <span class="save">Save ${Math.round((1 - u / c) * 100)}%</span>` : ''}`;
  };
  drawPrice();
  let qty = 1;
  $('#qm').onclick = () => { qty = Math.max(1, qty - 1); $('#qv').textContent = qty; };
  $('#qp').onclick = () => { qty = Math.min(p.stock || 1, qty + 1); $('#qv').textContent = qty; };
  $$('[data-v]').forEach(b => b.onclick = () => { variant = +b.dataset.v; $$('[data-v]').forEach(x => x.classList.toggle('on', x === b)); drawPrice(); });
  $$('[data-img]').forEach(b => b.onclick = () => { $('#mainImg').innerHTML = `<span class="arch big"><img src="${imgs[+b.dataset.img]}" alt=""></span>`; $$('[data-img]').forEach(x => x.classList.toggle('on', x === b)); });
  $('#energise').onchange = e => $('#energiseIn').classList.toggle('off', !e.target.checked);
  const note = () => $('#energise').checked && $('#eName').value.trim() ? `Energise for ${$('#eName').value.trim()}${$('#eGotra').value.trim() ? ', gotra ' + $('#eGotra').value.trim() : ''}` : '';
  const add = () => cartAdd(p.id, qty, variant, note());
  $('#addBtn').onclick = () => { if (add()) { updateCounts(); toast('Added to your bag'); openCart(); } };
  $('#buyBtn').onclick = () => { if (add()) { updateCounts(); go('#/checkout'); } };
  $('#revForm').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    db.reviews = [...db.reviews, { id: uid('R'), productId: p.id, name: f.name.value.trim(), rating: +f.rating.value, text: f.text.value.trim(), approved: false, created: Date.now() }];
    f.reset(); toast('Thank you! Your review will appear once approved.');
  };
  bindCards();
}

// ------------------------------------------------------------ astro tools ---
export function sunSign(dob) {
  const d = new Date(dob + 'T12:00:00'), m = d.getMonth() + 1, day = d.getDate();
  // first day of each sign (tropical dates, as on the zodiac page)
  const edges = [[1, 20, 'aquarius'], [2, 19, 'pisces'], [3, 21, 'aries'], [4, 20, 'taurus'], [5, 21, 'gemini'], [6, 21, 'cancer'], [7, 23, 'leo'], [8, 23, 'virgo'], [9, 23, 'libra'], [10, 23, 'scorpio'], [11, 22, 'sagittarius'], [12, 22, 'capricorn']];
  for (let i = edges.length - 1; i >= 0; i--) if (m > edges[i][0] || (m === edges[i][0] && day >= edges[i][1])) return ZODIAC.find(z => z.slug === edges[i][2]);
  return ZODIAC.find(z => z.slug === 'capricorn');
}
function lead(type, data) {
  const e = { id: uid('E'), type, status: 'New', created: Date.now(), ...data };
  db.enquiries = [e, ...db.enquiries];
  return e;
}
const toolHd = (t, sub) => `<section class="page-hd"><div class="mandala soft" aria-hidden="true"></div><div class="wrap"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/tools">Astro Tools</a></nav><h1>${t}</h1><p>${sub}</p></div></section>`;

function pageTools(which) {
  const s = db.settings;
  if (!which) {
    app.innerHTML = toolHd('Astro Tools', 'Free calculators and personal guidance from our Vedic astrologers.') +
      `<div class="wrap sec"><div class="tools big">${TOOLS.map(t => `<a href="#/tools/${t[0]}" class="tool"><span class="arch sm">${toolArt(t)}</span><div><b>${esc(t[1])}</b><span>${esc(t[2])}</span></div></a>`).join('')}</div></div>`;
    return;
  }
  if (which === 'gem-recommendation') {
    const q = params();
    app.innerHTML = toolHd('Free Gemstone Recommendation', 'Based on your sun sign. For a chart-based (lagna) recommendation, book a consultation.') +
      `<div class="wrap sec tool-page"><form id="gf" class="co card-box"><label>Your name<input name="name" required value="${esc(q.get('name') || '')}"></label>
        <label>Date of birth<input name="dob" type="date" required value="${esc(q.get('dob') || '')}"></label>
        <label>Mobile (optional — we can call to explain)<input name="phone" inputmode="tel" value="${esc(q.get('phone') || '')}"></label><button class="btn full">Show my gemstone</button></form>
      <div id="gr" class="result"></div></div>`;
    const show = f => {
      const z = sunSign(f.dob.value), g = GEMS[z.gem];
      const picks = live().filter(p => p.gem === z.gem).slice(0, 3);
      $('#gr').innerHTML = `<div class="res-hd"><span class="arch sm">${art('gem', z.gem)}</span><div><p class="eyebrow">${z.sym} ${esc(z.name)} · ${esc(z.rashi)} rashi</p>
        <h2>${esc(f.name.value.split(' ')[0])}, your lucky stone is ${esc(g.hindi)} (${esc(g.name)})</h2>
        <p>Ruled by <b>${esc(g.planet)}</b>. Wear it on a ${esc(g.day)} morning on the ${esc(g.finger.toLowerCase())} finger, set in ${esc(g.metal.toLowerCase())}.</p></div></div>
        ${picks.length ? `<div class="grid three">${picks.map(card).join('')}</div>` : ''}
        <div class="cta-box"><b>Want a recommendation from your full birth chart?</b><a href="#/tools/consultation" class="btn sm">Book a consultation</a></div>`;
      bindCards($('#gr'));
      return z;
    };
    $('#gf').onsubmit = e => {
      e.preventDefault(); const f = e.target, z = show(f);
      lead('Gem recommendation', { name: f.name.value.trim(), phone: f.phone.value.trim(), dob: f.dob.value, note: `Result: ${GEMS[z.gem].name} (${GEMS[z.gem].hindi}) — ${z.name}` });
      $('#gr').scrollIntoView({ behavior: 'smooth' });
    };
    if (q.get('dob') && q.get('name')) $('#gf').requestSubmit();
    return;
  }
  if (which === 'rudraksha') {
    const PURPOSE = { health: ['5', '11'], wealth: ['7', 'ganesha'], career: ['12', '14'], peace: ['5', '2'], relationships: ['gauri-shankar', '2'], education: ['4', '6'], protection: ['9', '10'] };
    app.innerHTML = toolHd('Rudraksha Recommendation', 'Tell us what you want help with and we suggest the mukhi traditionally worn for it.') +
      `<div class="wrap sec tool-page"><form id="rf" class="co card-box"><label>Your name<input name="name" required></label><label>Date of birth<input name="dob" type="date"></label>
        <label>What do you want help with?<select name="purpose">${Object.keys(PURPOSE).map(k => `<option value="${k}">${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}</select></label>
        <label>Mobile (optional)<input name="phone" inputmode="tel"></label><button class="btn full">Recommend my rudraksha</button></form><div id="rr" class="result"></div></div>`;
    $('#rf').onsubmit = e => {
      e.preventDefault(); const f = e.target, picks = PURPOSE[f.purpose.value];
      const items = live().filter(p => p.type === 'rudraksha' && picks.includes(p.mukhi) && p.origin === 'Nepal');
      $('#rr').innerHTML = `<h2>For ${esc(f.purpose.value)}, we recommend ${picks.map(m => esc(rudName(m))).join(' and ')} Rudraksha</h2>
        <p>${picks.map(m => `<b>${esc(rudName(m))}</b>: ${esc(RUDRAKSHA[m][2])} (ruled by ${esc(RUDRAKSHA[m][0])}).`).join('<br>')}</p>
        <div class="grid three">${items.map(card).join('')}</div>`;
      bindCards($('#rr'));
      lead('Rudraksha recommendation', { name: f.name.value.trim(), phone: f.phone.value.trim(), dob: f.dob.value, note: `Purpose: ${f.purpose.value} — Result: ${picks.map(rudName).join(', ')}` });
      $('#rr').scrollIntoView({ behavior: 'smooth' });
    };
    return;
  }
  if (which === 'converter') {
    app.innerHTML = toolHd('Carat ↔ Ratti Converter', '1 ratti = 0.91 carat · 1 carat = 200 mg.') +
      `<div class="wrap sec tool-page narrow"><div class="card-box conv"><label>Carat<input id="cCt" type="number" step="0.01" min="0" value="5"></label>
        <label>Ratti<input id="cRt" type="number" step="0.01" min="0"></label><label>Grams<input id="cG" type="number" step="0.001" min="0"></label><label>Milligrams<input id="cMg" type="number" step="1" min="0"></label></div>
        <table class="tbl"><tr><th>Ratti</th><th>Carat</th><th>Ratti</th><th>Carat</th></tr>${[3, 4, 5, 6, 7, 8, 9, 10].reduce((a, r, i, arr) => i % 2 ? a : a + `<tr><td>${r}</td><td>${(r / RATTI_PER_CARAT).toFixed(2)}</td><td>${arr[i + 1]}</td><td>${(arr[i + 1] / RATTI_PER_CARAT).toFixed(2)}</td></tr>`, '')}</table></div>`;
    const set = (ct, skip) => {
      if (skip !== 'ct') $('#cCt').value = ct ? +ct.toFixed(3) : '';
      if (skip !== 'rt') $('#cRt').value = ct ? +(ct * RATTI_PER_CARAT).toFixed(3) : '';
      if (skip !== 'g') $('#cG').value = ct ? +(ct * .2).toFixed(4) : '';
      if (skip !== 'mg') $('#cMg').value = ct ? Math.round(ct * 200) : '';
    };
    $('#cCt').oninput = e => set(+e.target.value, 'ct');
    $('#cRt').oninput = e => set(+e.target.value / RATTI_PER_CARAT, 'rt');
    $('#cG').oninput = e => set(+e.target.value / .2, 'g');
    $('#cMg').oninput = e => set(+e.target.value / 200, 'mg');
    set(5, 'ct');
    return;
  }
  // consultation & kundali are paid services: details -> enquiry -> bag -> checkout
  const isK = which === 'kundali';
  if (!['consultation', 'kundali'].includes(which)) return notFound();
  const svc = product(isK ? 'SV-KUNDALI' : 'SV-CONSULT');
  const fee = isK ? s.kundaliFee : s.consultFee;
  if (svc) svc.price = fee;
  app.innerHTML = toolHd(isK ? 'Detailed Handmade Kundali' : '1-to-1 Astrology Consultation', isK
    ? 'A birth chart drawn by hand by our astrologer, with life predictions, dasha periods and remedies.'
    : 'A 45-minute phone or video call with our Vedic astrologer about career, marriage, health or which stone to wear.') +
    `<div class="wrap sec tool-page"><form id="sf" class="co card-box"><div class="fee"><span>Fee</span><b>${money(fee)}</b></div>
      <div class="row2"><label>Full name<input name="name" required></label><label>Mobile<input name="phone" required inputmode="tel"></label></div>
      <label>Email<input name="email" type="email" required></label>
      <div class="row3"><label>Date of birth<input name="dob" type="date" required></label><label>Time of birth<input name="tob" type="time"></label><label>Place of birth<input name="pob" required></label></div>
      ${isK ? `<div class="row2"><label>Language<select name="lang"><option>Hindi</option><option>English</option></select></label><label>Format<select name="fmt"><option>PDF by email</option><option>Printed &amp; couriered</option></select></label></div>`
        : `<div class="row2"><label>Preferred day<input name="day" type="date" required></label><label>Preferred time<select name="slot">${['10:00 am', '11:30 am', '1:00 pm', '3:00 pm', '5:00 pm', '7:00 pm'].map(x => `<option>${x}</option>`).join('')}</select></label></div>
           <label>Call type<select name="mode"><option>Phone call</option><option>Video call</option></select></label>`}
      <label>${isK ? 'Anything specific you want covered?' : 'Your questions'}<textarea name="q" rows="3"></textarea></label>
      <button class="btn full">Continue to payment</button></form>
      <aside class="card-box side-info"><span class="arch sm">${serviceArt(isK ? 'kundali' : 'consultation')}</span><ul class="ticks">${(isK
        ? ['Hand-drawn Lagna, Navamsa and Chandra charts', 'Dasha & antardasha periods for 20 years', 'Career, marriage, health and finance', 'Gemstone & rudraksha remedies', 'Delivered in 5–7 days']
        : ['45 minutes with an experienced astrologer', 'Career, marriage, health or business', 'Gemstone & rudraksha guidance', 'Notes sent after the call', 'Reschedule free up to 12 hours before']).map(x => `<li>${x}</li>`).join('')}</ul>
        <p class="muted small">${svc ? `${stars(svc.rating)} ${svc.reviews} happy customers` : ''}</p></aside></div>`;
  $('#sf').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    const e2 = lead(isK ? 'Kundali' : 'Consultation', { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), dob: f.dob.value,
      tob: f.tob.value, pob: f.pob.value.trim(), slot: isK ? '' : `${f.day.value} ${f.slot.value} (${f.mode.value})`,
      note: [isK ? `${f.lang.value}, ${f.fmt.value}` : '', f.q.value.trim()].filter(Boolean).join(' — '), status: 'Awaiting payment' });
    if (svc && cartAdd(svc.id, 1, -1, e2.id)) { updateCounts(); go('#/checkout'); }
  };
}

// ------------------------------------------------------------------ cart ----
function pageCart() {
  const t = totals();
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Your bag</h1></div></section>
  <div class="wrap">${t.items.length ? `<div class="cart">
    <div>${t.items.map((l, i) => `<div class="line big"><a href="#/p/${esc(l.p.slug)}" class="thumb">${productImage(l.p)}</a>
      <div><a href="#/p/${esc(l.p.slug)}" class="line-t">${esc(l.p.title)}</a>${lineSub(l)}${l.note && l.p.type !== 'service' ? `<small>${esc(l.note)}</small>` : ''}<small>${money(l.unit)} each</small>
        <div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1">+</button></div>
        <button class="link" data-rm="${i}">Remove</button></div><b>${money(l.unit * l.qty)}</b></div>`).join('')}</div>
    ${summary(t, true)}</div>` : `<div class="empty">${icon.bag}<p>Your bag is empty.</p><a href="#/gemstones" class="btn">Explore gemstones</a></div>`}</div>`;
  $$('[data-q]').forEach(b => b.onclick = () => { const i = +b.dataset.q; cartSet(i, db.cart[i].qty + +b.dataset.d); updateCounts(); pageCart(); });
  $$('[data-rm]').forEach(b => b.onclick = () => { cartSet(+b.dataset.rm, 0); updateCounts(); pageCart(); });
  bindCoupon(pageCart);
}
function summary(t, checkoutBtn) {
  const active = db.coupons.find(c => c.active);
  return `<aside class="summary"><h3>Order summary</h3>
    <div class="sumrow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
    ${t.discount ? `<div class="sumrow ok"><span>Coupon ${esc(t.coupon)}</span><b>− ${money(t.discount)}</b></div>` : ''}
    <div class="sumrow"><span>Shipping</span><b>${t.shipping ? money(t.shipping) : 'Free'}</b></div>
    ${t.codFee ? `<div class="sumrow"><span>Cash on delivery fee</span><b>${money(t.codFee)}</b></div>` : ''}
    <div class="sumrow total"><span>Total</span><b>${money(t.total)}</b></div>
    <p class="muted small">Includes GST of ${money(t.gst)} (${db.settings.gst}%)</p>
    <form class="coupon" id="couponForm"><input name="code" placeholder="Coupon code" value="${esc(db.coupon || '')}"><button class="btn sm ghost">Apply</button></form>
    ${t.couponNote ? `<p class="err small">${esc(t.couponNote)}</p>` : active ? `<p class="muted small">Try <b>${esc(active.code)}</b></p>` : ''}
    ${checkoutBtn ? '<a href="#/checkout" class="btn full">Proceed to checkout</a>' : ''}</aside>`;
}
function bindCoupon(rerender) {
  const f = $('#couponForm');
  if (f) f.onsubmit = e => { e.preventDefault(); db.coupon = e.target.code.value.trim(); const t = totals(); toast(t.discount ? `Coupon applied — you save ${money(t.discount)}` : (t.couponNote || 'Coupon removed')); rerender(); };
}

function pageCheckout() {
  if (!db.cart.length) return go('#/cart');
  const u = me(), a = u?.address || {};
  const svcLead = db.cart.map(l => db.enquiries.find(e => e.id === l.note)).find(Boolean);
  const onlyServices = db.cart.every(l => product(l.id)?.type === 'service');
  let pay = 'UPI';
  const draw = () => { $('#sumBox').innerHTML = summary(totals(db.cart, db.coupon, pay), false); bindCoupon(draw); };
  const pre = k => esc(u?.[k] || svcLead?.[k] || '');
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Checkout</h1></div></section>
  <div class="wrap cart"><form id="coForm" class="co" novalidate>
    <h3>Contact</h3>
    ${u ? `<p class="muted">Signed in as <b>${esc(u.email)}</b></p>` : '<p class="muted">Have an account? <a href="#/account">Sign in</a> for faster checkout.</p>'}
    <div class="row2"><label>Full name<input name="name" required value="${pre('name')}"></label><label>Mobile number<input name="phone" required inputmode="tel" value="${pre('phone')}"></label></div>
    <label>Email<input name="email" type="email" required value="${pre('email')}"></label>
    <h3>${onlyServices ? 'Billing address' : 'Delivery address'}</h3>
    <label>House / street<input name="line" required value="${esc(a.line || '')}"></label>
    <div class="row3"><label>City<input name="city" required value="${esc(a.city || '')}"></label><label>State<input name="state" required value="${esc(a.state || '')}"></label><label>PIN code<input name="pin" required inputmode="numeric" pattern="[0-9]{6}" value="${esc(a.pin || '')}"></label></div>
    <h3>Payment</h3>
    <div class="pays">${['UPI', 'Card', 'Net banking', ...(db.settings.cod && !onlyServices ? ['Cash on delivery'] : [])].map((m, i) => `<label class="pay"><input type="radio" name="pay" value="${m}" ${i ? '' : 'checked'}><span><b>${m}</b><small>${{ UPI: 'GPay, PhonePe, Paytm', Card: 'Visa, Mastercard, RuPay', 'Net banking': 'All major banks', 'Cash on delivery': `Pay when it arrives (+${money(db.settings.codFee)})` }[m]}</small></span></label>`).join('')}</div>
    <p class="demo-note">Demo store: no payment is taken. In the live shop this step opens Razorpay / PayU.</p>
    <p class="err" id="coErr" hidden></p>
    <button class="btn full big" id="placeBtn">Place order</button>
  </form><div id="sumBox"></div></div>`;
  draw();
  $$('input[name="pay"]').forEach(r => r.onchange = () => { pay = r.value; draw(); });
  $('#coForm').onsubmit = e => {
    e.preventDefault();
    const f = e.target, err = $('#coErr');
    const bad = [...f.querySelectorAll('input[required]')].filter(i => !i.checkValidity());
    if (bad.length) { err.textContent = 'Please complete: ' + bad.map(i => i.closest('label').firstChild.textContent.trim()).join(', '); err.hidden = false; bad[0].focus(); return; }
    if (!/^[0-9+ ]{10,14}$/.test(f.phone.value.trim())) { err.textContent = 'Please enter a valid mobile number.'; err.hidden = false; return; }
    const data = Object.fromEntries(['name', 'phone', 'email', 'line', 'city', 'state', 'pin'].map(k => [k, f[k].value.trim()]));
    const o = placeOrder(data, pay);
    if (!o || o.error) { err.textContent = o?.error || 'Your bag is empty.'; err.hidden = false; return; }
    updateCounts(); go('#/order/' + o.id);
  };
}

function pageOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return notFound();
  const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const at = steps.indexOf(o.status);
  const svc = o.items.some(i => i.id.startsWith('SV-'));
  app.innerHTML = `<section class="wrap narrow sec">
    ${o.created > Date.now() - 6e5 ? `<div class="success">${icon.om}<h1>Thank you, ${esc(o.name.split(' ')[0])}!</h1><p>Your order <b>#${esc(o.id)}</b> is placed. A confirmation has been sent to ${esc(o.email)}.${svc ? ' Our astrologer will call you to confirm your booking.' : ''}</p></div>` : `<h1>Order #${esc(o.id)}</h1>`}
    ${o.status === 'Cancelled' ? '<p class="err">This order was cancelled.</p>' : `<ol class="track">${steps.map((s, i) => `<li class="${i <= at ? 'done' : ''}"><span></span>${s}</li>`).join('')}</ol>`}
    ${o.tracking ? `<p>Courier tracking number: <b>${esc(o.tracking)}</b></p>` : ''}
    <div class="box">${o.items.map(i => `<div class="sumrow"><span>${esc(i.title)}${i.variant ? ` · ${esc(i.variant)}` : ''} × ${i.qty}${i.note && !i.id.startsWith('SV-') ? `<small class="muted"> — ${esc(i.note)}</small>` : ''}</span><b>${money(i.price * i.qty)}</b></div>`).join('')}
      ${o.discount ? `<div class="sumrow ok"><span>Coupon ${esc(o.coupon)}</span><b>− ${money(o.discount)}</b></div>` : ''}
      <div class="sumrow"><span>Shipping</span><b>${o.shipping ? money(o.shipping) : 'Free'}</b></div>
      ${o.codFee ? `<div class="sumrow"><span>COD fee</span><b>${money(o.codFee)}</b></div>` : ''}
      <div class="sumrow total"><span>Total (${esc(o.payment)})</span><b>${money(o.total)}</b></div></div>
    <p class="muted">${esc(o.name)}, ${esc(o.address.line)}, ${esc(o.address.city)}, ${esc(o.address.state)} ${esc(o.address.pin)}</p>
    <div class="row-btns"><a href="#/gemstones" class="btn">Continue shopping</a><a href="#/account" class="btn ghost">My orders</a></div></section>`;
}

function pageAccount(sub) {
  const u = me();
  if (!u) {
    const isNew = sub === 'register';
    app.innerHTML = `<section class="wrap narrow sec auth"><h1>${isNew ? 'Create your account' : 'Sign in'}</h1>
      <div class="tabs"><a href="#/account" class="${isNew ? '' : 'on'}">Sign in</a><a href="#/account/register" class="${isNew ? 'on' : ''}">Create account</a></div>
      <form id="authForm">${isNew ? '<label>Full name<input name="name" required></label><label>Mobile number<input name="phone" required inputmode="tel"></label>' : ''}
        <label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required minlength="6"></label>
        <p class="err" id="aErr" hidden></p><button class="btn full">${isNew ? 'Create account' : 'Sign in'}</button>
        ${isNew ? '' : '<p class="muted small">Demo: sign in with any customer email from the admin panel and password <b>demo1234</b>, or create a new account.</p>'}</form></section>`;
    $('#authForm').onsubmit = e => {
      e.preventDefault();
      const f = e.target, email = f.email.value.trim().toLowerCase(), err = $('#aErr');
      let c = db.customers.find(x => x.email === email);
      if (isNew) {
        if (c && c.password) { err.textContent = 'An account with this email already exists. Please sign in.'; err.hidden = false; return; }
        if (!c) { c = { id: uid('C'), email, created: Date.now(), address: {} }; db.customers.push(c); }
        Object.assign(c, { name: f.name.value.trim(), phone: f.phone.value.trim(), password: f.password.value });
      } else if (!c || c.password !== f.password.value) { err.textContent = 'Wrong email or password.'; err.hidden = false; return; }
      db.session = { customerId: c.id };
      save(); toast('Welcome, ' + c.name.split(' ')[0] + '!'); go('#/account');
    };
    return;
  }
  const orders = db.orders.filter(o => o.customerId === u.id);
  const tab = sub || 'orders';
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Namaste, ${esc(u.name.split(' ')[0])}</h1><p>${esc(u.email)}</p></div></section>
  <div class="wrap acct"><nav class="side">${[['orders', 'My orders'], ['wishlist', 'Wishlist'], ['address', 'Address & details']].map(([k, l]) => `<a href="#/account/${k}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}<button class="link" id="logout">Sign out</button></nav>
    <section>${tab === 'orders' ? (orders.length ? `<table class="tbl"><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr>${orders.map(o => `<tr><td>#${esc(o.id)}</td><td>${date(o.created)}</td><td><span class="pill ${o.status.toLowerCase()}">${esc(o.status)}</span></td><td>${money(o.total)}</td><td><a href="#/order/${esc(o.id)}">View</a></td></tr>`).join('')}</table>` : '<div class="empty"><p>No orders yet.</p><a href="#/gemstones" class="btn">Start shopping</a></div>')
      : tab === 'wishlist' ? (db.wishlist.length ? `<div class="grid">${db.wishlist.map(product).filter(Boolean).map(card).join('')}</div>` : '<div class="empty"><p>Your wishlist is empty.</p></div>')
      : `<form id="addrForm" class="co"><label>Full name<input name="name" value="${esc(u.name)}" required></label><label>Mobile<input name="phone" value="${esc(u.phone || '')}"></label>
          <label>House / street<input name="line" value="${esc(u.address?.line || '')}"></label><div class="row3"><label>City<input name="city" value="${esc(u.address?.city || '')}"></label><label>State<input name="state" value="${esc(u.address?.state || '')}"></label><label>PIN<input name="pin" value="${esc(u.address?.pin || '')}"></label></div>
          <button class="btn">Save</button></form>`}</section></div>`;
  $('#logout').onclick = () => { db.session = null; toast('Signed out'); go('#/'); };
  const af = $('#addrForm');
  if (af) af.onsubmit = e => { e.preventDefault(); const f = e.target; Object.assign(u, { name: f.name.value, phone: f.phone.value, address: { line: f.line.value, city: f.city.value, state: f.state.value, pin: f.pin.value } }); save(); toast('Saved'); };
  bindCards();
}

function pageWishlist() {
  const items = db.wishlist.map(product).filter(Boolean);
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Wishlist</h1></div></section>
  <div class="wrap sec">${items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<div class="empty">${icon.heart}<p>Tap the heart on any product to save it here.</p><a href="#/gemstones" class="btn">Browse gemstones</a></div>`}</div>`;
  bindCards();
}

function pageTrack() {
  app.innerHTML = `<section class="wrap narrow sec"><h1>Track your order</h1><p class="muted">Enter your order number and the email you used.</p>
    <form id="trk" class="co"><label>Order number<input name="id" required placeholder="e.g. YR60120"></label><label>Email<input name="email" type="email" required></label><p class="err" id="tErr" hidden></p><button class="btn">Track</button></form></section>`;
  $('#trk').onsubmit = e => {
    e.preventDefault();
    const id = e.target.id.value.trim().toUpperCase().replace('#', ''), em = e.target.email.value.trim().toLowerCase();
    const o = db.orders.find(x => x.id === id && x.email === em);
    if (!o) { $('#tErr').textContent = 'We could not find that order. Please check the number and email.'; $('#tErr').hidden = false; return; }
    go('#/order/' + o.id);
  };
}

function pageGemstones() {
  const count = k => live().filter(p => p.gem === k).length;
  const block = (grp, title, sub) => `<section class="wrap sec">${secHd(title, '', '', sub)}<div class="gems big">${Object.entries(GEMS).filter(([, g]) => g.group === grp).map(([k, g]) =>
    `<a href="#/shop?gem=${k}" class="gem"><span class="arch">${art('gem', k, { r: 96 })}</span><b>${esc(g.hindi)}</b><span>${esc(g.name)} · ${count(k)} stones</span><em>${esc(g.planet)}</em></a>`).join('')}</div></section>`;
  app.innerHTML = `<section class="page-hd"><div class="mandala soft" aria-hidden="true"></div><div class="wrap"><h1>Gemstones</h1><p>Natural, certified stones — choose by name, planet or zodiac sign.</p></div></section>
    ${block('precious', 'Precious gemstones (Navratna)', 'Ratna')}${block('semi', 'Semi-precious gemstones', 'Uparatna')}
    <section class="wrap sec">${secHd('Japa malas')}<div class="grid">${live().filter(p => p.category === 'japa-malas').slice(0, 4).map(card).join('')}</div></section>`;
  bindCards();
}

function pageZodiac() {
  app.innerHTML = `<section class="page-hd"><div class="mandala soft" aria-hidden="true"></div><div class="wrap"><h1>Shop by zodiac sign</h1><p>Find the gemstone traditionally associated with your rashi.</p></div></section>
  <div class="wrap sec"><div class="zod big">${ZODIAC.map(z => `<a href="#/shop?zodiac=${z.slug}" class="z"><span class="sym">${z.sym}</span><b>${z.name}</b><small>${esc(z.rashi)} · ${esc(z.dates)}</small><em>${esc(GEMS[z.gem].hindi)} (${esc(GEMS[z.gem].name)})</em></a>`).join('')}</div>
  <div class="cta-box"><b>Not sure of your sign? Get a free recommendation from your date of birth.</b><a href="#/tools/gem-recommendation" class="btn sm">Try it</a></div></div>`;
}

function mdLite(t) { return esc(t).split(/\n{2,}/).map(b => b.startsWith('## ') ? `<h2>${b.slice(3)}</h2>` : `<p>${b.replace(/\n/g, '<br>')}</p>`).join(''); }
function pageGuide(slug) {
  if (slug) {
    const p = db.posts.find(x => x.slug === slug);
    if (!p) return notFound();
    app.innerHTML = `<article class="wrap narrow sec article"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/guide">Gem Guide</a></nav>
      <h1>${esc(p.title)}</h1><p class="muted">${date(p.date)}</p><div class="art-hero">${p.image ? `<img src="${p.image}" alt="">` : art(p.type || 'gem', p.key || 'ruby')}</div>${mdLite(p.body)}
      <div class="cta-box"><b>Have a question about your stone?</b><a href="#/tools/consultation" class="btn sm">Ask an astrologer</a></div></article>`;
    return;
  }
  app.innerHTML = `<section class="page-hd"><div class="mandala soft" aria-hidden="true"></div><div class="wrap"><h1>Gem Guide</h1><p>Plain-English guides to gemstones and rudraksha.</p></div></section>
  <div class="wrap sec"><div class="posts">${db.posts.map(postCard).join('')}</div></div>`;
}

const PAGES = {
  about: ['About us', s => `<p>${esc(s.name)} began as a small family gem shop in Jaipur's Johari Bazaar. Three generations later, we still choose every stone by hand — and we still believe a customer should know exactly what they are buying.</p>
    <h2>What we promise</h2><ul class="ticks"><li>Natural gemstones with independent lab certificates</li><li>Genuine rudraksha, X-ray tested</li><li>Honest weights in carat and ratti</li><li>Fair prices, clearly shown</li><li>7-day returns and free re-testing</li></ul>
    <h2>Visit us</h2><p>${esc(s.address)}<br>Open Monday to Saturday, 10am – 7pm.</p>`],
  shipping: ['Shipping policy', s => `<p>All orders ship fully insured in tamper-proof packaging.</p><h2>Delivery times</h2><p>Orders ship within 1–2 working days and arrive in 3–6 working days anywhere in India; international orders take 7–12 days.</p>
    <h2>Charges</h2><p>Shipping is free on orders over ${money(s.freeShippingOver)}. Below that, a flat ${money(s.shipping)} applies. Cash on delivery carries a ${money(s.codFee)} fee.</p>`],
  returns: ['Returns & exchange', () => `<p>You can return any gemstone, rudraksha or mala within 7 days of delivery for a full refund, in its original condition with the certificate.</p><h2>How to return</h2><p>Contact us with your order number. We arrange a free insured pickup and refund within 5–7 days of receiving the item.</p>
    <h2>Exceptions</h2><p>Consultations and kundali reports cannot be refunded once delivered.</p>`],
  privacy: ['Privacy policy', s => `<p>${esc(s.name)} collects only what is needed to process your orders and readings: your name, contact details, delivery address and — for astrology services — your birth details. We never sell your data.</p><h2>Payments</h2><p>Card and UPI payments are handled by our payment partner; we never see or store your card number.</p><h2>Contact</h2><p>Questions? Write to ${esc(s.email)}.</p>`],
  terms: ['Terms & conditions', s => `<p>By using this website you agree to these terms. Prices are in Indian Rupees and include GST. Natural gemstones vary slightly in colour and inclusions from the pictures.</p><h2>Astrology services</h2><p>Recommendations are based on traditional Vedic astrology and are offered for guidance; they are not a substitute for medical, legal or financial advice.</p><h2>Governing law</h2><p>These terms are governed by the laws of India, with jurisdiction in Jaipur.</p>`],
};
function pageStatic(key) {
  const p = PAGES[key];
  if (!p) return notFound();
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>${esc(p[0])}</h1></div></section><article class="wrap narrow sec article">${p[1](db.settings)}</article>`;
}
function pageFaq() {
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Frequently asked questions</h1></div></section>
  <div class="wrap narrow sec">${db.faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  <p class="muted">Still have a question? <a href="#/contact">Contact us</a>.</p></div>`;
}
function pageContact() {
  const s = db.settings;
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Contact us</h1><p>We usually reply within a few hours.</p></div></section>
  <div class="wrap sec contact"><div class="box"><h3>Talk to a gem expert</h3><p><b>Phone / WhatsApp</b><br>${esc(s.phone)}</p><p><b>Email</b><br>${esc(s.email)}</p><p><b>Showroom</b><br>${esc(s.address)}</p></div>
    <form id="ctForm" class="co"><div class="row2"><label>Name<input name="name" required></label><label>Phone<input name="phone"></label></div><label>Email<input name="email" type="email" required></label>
      <label>Message<textarea name="msg" rows="5" required></textarea></label><button class="btn">Send message</button></form></div>`;
  $('#ctForm').onsubmit = e => { e.preventDefault(); const f = e.target; db.messages = [...db.messages, { id: uid('M'), name: f.name.value, phone: f.phone.value, email: f.email.value, msg: f.msg.value, at: Date.now() }]; f.reset(); toast('Thank you — we will get back to you soon.'); };
}
function notFound() {
  app.innerHTML = `<section class="wrap narrow sec empty">${icon.gem}<h1>Page not found</h1><p>That page may have moved.</p><a href="#/" class="btn">Go to the home page</a></section>`;
}

// ---------------------------------------------------------------- router ---
function route() {
  const [path] = location.hash.replace(/^#/, '').split('?');
  const [a, b] = path.split('/').filter(Boolean);
  closeCart(); closeModal();
  $('#menu')?.classList.remove('open');
  if (!a) pageHome();
  else if (a === 'shop') pageShop();
  else if (a === 'p') pageProduct(b);
  else if (a === 'cart') pageCart();
  else if (a === 'checkout') pageCheckout();
  else if (a === 'order') pageOrder(b);
  else if (a === 'account') pageAccount(b);
  else if (a === 'wishlist') pageWishlist();
  else if (a === 'track') pageTrack();
  else if (a === 'gemstones') pageGemstones();
  else if (a === 'zodiac') pageZodiac();
  else if (a === 'tools') pageTools(b);
  else if (a === 'guide') pageGuide(b);
  else if (a === 'faq') pageFaq();
  else if (a === 'contact') pageContact();
  else if (a === 'about') pageStatic('about');
  else if (a === 'page') pageStatic(b);
  else notFound();
  window.scrollTo(0, 0);
  updateCounts();
}

renderChrome();
window.addEventListener('hashchange', route);
// The admin (another tab) changed something: refresh, except on pages where the visitor may be typing.
onExternalChange(() => {
  const a = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  if (['checkout', 'account', 'contact', 'track', 'tools'].includes(a)) { updateCounts(); return; }
  renderChrome(); route();
});
route();
