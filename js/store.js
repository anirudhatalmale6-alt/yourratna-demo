/* Storefront: a small hash-routed app. Every page reads the shared demo db. */
import { art, productImage, GEMS, METALS } from './art.js';
import { ZODIAC } from './data.js';
import {
  db, save, esc, money, date, product, productBySlug, live, cartAdd, cartSet, cartCount,
  totals, placeOrder, onExternalChange, uid,
} from './db.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');

// ------------------------------------------------------------ utilities ----
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 2600);
}
const params = () => new URLSearchParams((location.hash.split('?')[1]) || '');
const go = h => { location.hash = h; };
const stars = r => '<span class="stars" aria-label="' + r + ' out of 5">' + '★★★★★'.slice(0, Math.round(r)) + '<i>' + '★★★★★'.slice(Math.round(r)) + '</i></span>';
const me = () => db.session && db.customers.find(c => c.id === db.session.customerId);
const wished = id => db.wishlist.includes(id);
const off = p => p.compare > p.price ? Math.round((1 - p.price / p.compare) * 100) : 0;
const icon = {
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  ret: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="m8 5-4 4 4 4"/></svg>',
  gem: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18 3-18"/></svg>',
};

// --------------------------------------------------------------- chrome ----
function renderChrome() {
  const s = db.settings;
  document.title = `${s.name} — ${s.tagline}`;
  $('#announce').textContent = s.announcement || '';
  $('#announce').hidden = !s.announcement;
  const cats = db.categories;
  $('#hdr').innerHTML = `
  <div class="wrap hdr-in">
    <button class="icon-btn only-m" id="menuBtn" aria-label="Menu">${icon.menu}</button>
    <a href="#/" class="logo"><span class="logo-mark">◆</span>${esc(s.name)}</a>
    <form class="search" id="searchForm" role="search"><input name="q" placeholder="Search rings, ruby, pendants…" aria-label="Search" value="${esc(params().get('q') || '')}"><button aria-label="Search">${icon.search}</button></form>
    <nav class="hdr-icons">
      <a href="#/account" class="icon-btn" aria-label="Account">${icon.user}</a>
      <a href="#/wishlist" class="icon-btn" aria-label="Wishlist">${icon.heart}<b class="count" ${db.wishlist.length ? '' : 'hidden'}>${db.wishlist.length}</b></a>
      <button class="icon-btn" id="cartBtn" aria-label="Cart">${icon.bag}<b class="count" ${cartCount() ? '' : 'hidden'}>${cartCount()}</b></button>
    </nav>
  </div>
  <nav class="menu" id="menu">
    <div class="wrap menu-in">
      <a href="#/shop">All Jewellery</a>
      ${cats.map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}
      <div class="mega-wrap"><a href="#/gemstones">Shop by Gemstone ▾</a>
        <div class="mega">${Object.entries(GEMS).map(([k, g]) => `<a href="#/shop?gem=${k}"><i style="background:${g.c[1]}"></i>${esc(g.name)} <small>${esc(g.hindi)}</small></a>`).join('')}</div></div>
      <a href="#/zodiac">Zodiac</a>
      <a href="#/guide">Gem Guide</a>
    </div>
  </nav>`;
  $('#ftr').innerHTML = `
  <div class="wrap ftr-grid">
    <div><a href="#/" class="logo light"><span class="logo-mark">◆</span>${esc(s.name)}</a>
      <p>${esc(s.tagline)}. Every gemstone is natural and comes with a certificate from an independent laboratory.</p>
      <p class="muted">${esc(s.address)}<br>${esc(s.phone)} · ${esc(s.email)}</p></div>
    <div><h4>Shop</h4>${cats.map(c => `<a href="#/shop?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join('')}<a href="#/gemstones">Shop by Gemstone</a><a href="#/zodiac">Shop by Zodiac</a></div>
    <div><h4>Help</h4><a href="#/track">Track your order</a><a href="#/faq">FAQ</a><a href="#/page/shipping">Shipping</a><a href="#/page/returns">Returns &amp; exchange</a><a href="#/contact">Contact us</a></div>
    <div><h4>Company</h4><a href="#/about">About us</a><a href="#/guide">Gem Guide</a><a href="#/page/privacy">Privacy policy</a><a href="#/page/terms">Terms &amp; conditions</a><a href="admin/">Admin panel (demo)</a></div>
  </div>
  <div class="wrap ftr-bot"><span>© ${new Date().getFullYear()} ${esc(s.name)}. All rights reserved.</span><span>GSTIN ${esc(s.gstin)}</span></div>`;
  $('#searchForm').onsubmit = e => { e.preventDefault(); go('#/shop?q=' + encodeURIComponent(e.target.q.value.trim())); };
  $('#cartBtn').onclick = openCart;
  $('#menuBtn').onclick = () => $('#menu').classList.toggle('open');
}

function updateCounts() {
  const c = $('#cartBtn .count'); if (c) { c.textContent = cartCount(); c.hidden = !cartCount(); }
  const w = $('a[href="#/wishlist"] .count'); if (w) { w.textContent = db.wishlist.length; w.hidden = !db.wishlist.length; }
}

// ------------------------------------------------------------- the cart ----
function openCart() {
  const t = totals();
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer-hd"><h3>Your bag (${cartCount()})</h3><button class="x" id="dClose" aria-label="Close">×</button></div>
    ${t.items.length ? `<div class="drawer-list">${t.items.map((l, i) => `
      <div class="line"><a href="#/p/${esc(l.p.slug)}" class="thumb">${productImage(l.p)}</a>
        <div><a href="#/p/${esc(l.p.slug)}" class="line-t">${esc(l.p.title)}</a>${l.size ? `<small>Size ${esc(l.size)}</small>` : ''}
          <div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1">+</button></div></div>
        <b>${money(l.p.price * l.qty)}</b></div>`).join('')}</div>
      <div class="drawer-ft">
        ${t.shipping ? `<p class="hint">Add ${money(db.settings.freeShippingOver - (t.subtotal - t.discount))} more for free insured shipping.</p>` : '<p class="hint ok">You have free insured shipping.</p>'}
        <div class="sumrow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
        <a href="#/cart" class="btn ghost full">View bag</a><a href="#/checkout" class="btn full">Checkout</a></div>`
      : `<div class="empty">${icon.bag}<p>Your bag is empty.</p><a href="#/shop" class="btn">Start shopping</a></div>`}`;
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
function card(p) {
  return `<article class="card">
    <a href="#/p/${esc(p.slug)}" class="card-img">${productImage(p)}
      ${off(p) ? `<span class="tag">${off(p)}% off</span>` : ''}${p.stock <= 0 ? '<span class="tag dark">Sold out</span>' : p.bestseller ? '<span class="tag gold">Bestseller</span>' : ''}</a>
    <button class="wish ${wished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Add to wishlist">${icon.heart}</button>
    <div class="card-b">
      <a href="#/p/${esc(p.slug)}" class="card-t">${esc(p.title)}</a>
      <div class="card-r">${stars(p.rating)} <small>(${p.reviews})</small></div>
      <div class="price">${money(p.price)} ${p.compare > p.price ? `<s>${money(p.compare)}</s>` : ''}</div>
      <button class="btn sm full" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sold out' : p.sizes.length ? 'Choose size' : 'Add to bag'}</button>
    </div></article>`;
}

function bindCards(root = app) {
  $$('[data-wish]', root).forEach(b => b.onclick = e => {
    e.preventDefault();
    const id = b.dataset.wish;
    db.wishlist = wished(id) ? db.wishlist.filter(x => x !== id) : [...db.wishlist, id];
    b.classList.toggle('on', wished(id));
    updateCounts();
    toast(wished(id) ? 'Saved to your wishlist' : 'Removed from wishlist');
  });
  $$('[data-add]', root).forEach(b => b.onclick = () => {
    const p = product(b.dataset.add);
    if (p.sizes.length) return go('#/p/' + p.slug);
    if (cartAdd(p.id)) { updateCounts(); toast('Added to your bag'); openCart(); }
  });
}

const trust = () => `<section class="trust wrap">
  <div>${icon.gem}<b>100% natural</b><span>Lab-certified stones</span></div>
  <div>${icon.truck}<b>Free insured shipping</b><span>On orders over ${money(db.settings.freeShippingOver)}</span></div>
  <div>${icon.ret}<b>7-day returns</b><span>No questions asked</span></div>
  <div>${icon.shield}<b>Secure payment</b><span>UPI, cards, COD</span></div></section>`;

// ------------------------------------------------------------------ pages --
function pageHome() {
  const s = db.settings, P = live();
  const banners = db.banners;
  const featured = P.filter(p => p.featured).slice(0, 8);
  const best = P.filter(p => p.bestseller).slice(0, 8);
  const reviews = db.reviews.filter(r => r.approved).slice(0, 4);
  app.innerHTML = `
  <section class="hero" id="hero">
    ${banners.map((b, i) => `<div class="slide t-${esc(b.theme || 'navy')} ${i ? '' : 'on'}">
      <div class="wrap slide-in"><div class="slide-txt"><p class="eyebrow">${esc(s.name)}</p><h1>${esc(b.title)}</h1><p>${esc(b.sub)}</p>
        <a href="${esc(b.link || '#/shop')}" class="btn gold">${esc(b.btn || 'Shop now')}</a></div>
        <div class="slide-art">${b.image ? `<img src="${b.image}" alt="">` : art(b.type || 'loose', b.gem || 'ruby', 'vermeil')}</div></div></div>`).join('')}
    ${banners.length > 1 ? `<div class="dots">${banners.map((_, i) => `<button data-s="${i}" class="${i ? '' : 'on'}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>` : ''}
  </section>
  ${trust()}
  <section class="wrap sec"><div class="sec-hd"><h2>Shop by category</h2><a href="#/shop">View all →</a></div>
    <div class="cats">${db.categories.filter(c => c.home).map(c => `<a href="#/shop?cat=${esc(c.slug)}" class="cat">
      <div class="cat-img">${c.image ? `<img src="${c.image}" alt="">` : art(c.type, c.gem, c.metal)}</div><b>${esc(c.name)}</b><span>${esc(c.blurb || '')}</span></a>`).join('')}</div></section>
  <section class="band"><div class="wrap sec"><div class="sec-hd"><h2>Shop by gemstone</h2><a href="#/gemstones">All gemstones →</a></div>
    <div class="gems">${Object.entries(GEMS).map(([k, g]) => `<a href="#/shop?gem=${k}" class="gem"><div>${art('loose', k, 'silver')}</div><b>${esc(g.name)}</b><span>${esc(g.hindi)}</span></a>`).join('')}</div></div></section>
  <section class="wrap sec"><div class="sec-hd"><h2>Our finest pieces</h2><a href="#/shop?sort=featured">See more →</a></div>
    <div class="grid">${featured.map(card).join('')}</div></section>
  <section class="band dark"><div class="wrap sec"><div class="sec-hd"><h2>Shop by zodiac sign</h2><a href="#/zodiac">Find your stone →</a></div>
    <div class="zod">${ZODIAC.map(z => `<a href="#/shop?zodiac=${z.slug}" class="z"><span class="sym">${z.sym}</span><b>${z.name}</b><small>${esc(GEMS[z.gem].name)}</small></a>`).join('')}</div></div></section>
  <section class="wrap sec"><div class="sec-hd"><h2>Bestsellers</h2><a href="#/shop?sort=popular">See more →</a></div>
    <div class="grid">${best.map(card).join('')}</div></section>
  <section class="wrap sec split">
    <div class="split-art">${art('loose', 'emerald', 'silver')}</div>
    <div><p class="eyebrow">Why ${esc(s.name)}</p><h2>Honest gemstones, checked twice</h2>
      <p>Every stone we sell is natural and untreated (unless clearly stated), weighed in front of you on the certificate and tested by an independent laboratory.</p>
      <ul class="ticks"><li>Certificate with every gemstone</li><li>Weight shown in carat and ratti</li><li>Free re-testing within 7 days</li><li>Custom settings in silver, panchdhatu or gold</li></ul>
      <a href="#/about" class="btn ghost">Our story</a></div></section>
  <section class="band"><div class="wrap sec"><div class="sec-hd"><h2>What our customers say</h2></div>
    <div class="revs">${reviews.map(r => `<figure class="rev">${stars(r.rating)}<blockquote>“${esc(r.text)}”</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('')}</div></div></section>
  <section class="wrap sec"><div class="sec-hd"><h2>Learn about gemstones</h2><a href="#/guide">All articles →</a></div>
    <div class="posts">${db.posts.slice(0, 3).map(postCard).join('')}</div></section>
  <section class="news"><div class="wrap news-in"><div><h2>Join the ${esc(s.name)} circle</h2><p>New arrivals, gemstone guides and members-only offers. No spam.</p></div>
    <form id="newsForm"><input type="email" required placeholder="Your email address" aria-label="Email"><button class="btn gold">Subscribe</button></form></div></section>`;
  bindCards();
  let i = 0;
  const slides = $$('.slide'), dots = $$('.dots button');
  const show = n => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  dots.forEach(d => d.onclick = () => show(+d.dataset.s));
  clearInterval(window._hero);
  if (slides.length > 1) window._hero = setInterval(() => document.contains(slides[0]) ? show(i + 1) : clearInterval(window._hero), 5500);
  $('#newsForm').onsubmit = e => { e.preventDefault(); db.newsletter = [...db.newsletter, { email: e.target[0].value, at: Date.now() }]; e.target.reset(); toast('Thank you — you are subscribed!'); };
}

const postCard = p => `<a href="#/guide/${esc(p.slug)}" class="post"><div class="post-img">${p.image ? `<img src="${p.image}" alt="">` : art('loose', p.gem || 'ruby', 'silver')}</div>
  <small>${date(p.date)}</small><b>${esc(p.title)}</b><span>${esc(p.excerpt)}</span></a>`;

function pageShop() {
  const q = params();
  const f = { cat: q.get('cat') || '', gem: q.get('gem') || '', metal: q.get('metal') || '', gender: q.get('gender') || '',
    zodiac: q.get('zodiac') || '', min: +q.get('min') || 0, max: +q.get('max') || 0, sort: q.get('sort') || 'featured', q: q.get('q') || '' };
  const zod = ZODIAC.find(z => z.slug === f.zodiac);
  let list = live();
  if (f.cat) list = list.filter(p => p.category === f.cat);
  if (f.gem) list = list.filter(p => p.gem === f.gem);
  if (zod) list = list.filter(p => p.gem === zod.gem);
  if (f.metal) list = list.filter(p => p.metal === f.metal);
  if (f.gender) list = list.filter(p => p.gender === f.gender || p.gender === 'Unisex');
  if (f.min) list = list.filter(p => p.price >= f.min);
  if (f.max) list = list.filter(p => p.price <= f.max);
  if (f.q) {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(p => { const hay = `${p.title} ${GEMS[p.gem]?.hindi} ${p.category} ${p.sku}`.toLowerCase(); return words.every(w => hay.includes(w)); });
  }
  const sorts = { featured: (a, b) => (b.featured - a.featured) || (b.bestseller - a.bestseller), popular: (a, b) => b.reviews - a.reviews,
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, new: (a, b) => b.created - a.created };
  list.sort(sorts[f.sort] || sorts.featured);
  const cat = db.categories.find(c => c.slug === f.cat);
  const title = f.q ? `Results for “${f.q}”` : zod ? `${zod.name} — ${GEMS[zod.gem].name}` : cat ? cat.name : f.gem ? `${GEMS[f.gem]?.name} jewellery & stones` : 'All jewellery';
  const link = ch => { const n = new URLSearchParams(q); for (const [k, v] of Object.entries(ch)) v ? n.set(k, v) : n.delete(k); return '#/shop?' + n.toString(); };
  const opt = (k, v, label) => `<a href="${link({ [k]: f[k] === v ? '' : v })}" class="${f[k] === v ? 'on' : ''}">${label}</a>`;
  app.innerHTML = `
  <section class="page-hd"><div class="wrap"><nav class="crumbs"><a href="#/">Home</a> / ${esc(title)}</nav><h1>${esc(title)}</h1>
    ${zod ? `<p>Born between ${esc(zod.dates)}? Your lucky gemstone is <b>${esc(GEMS[zod.gem].name)} (${esc(GEMS[zod.gem].hindi)})</b>.</p>` : cat ? `<p>${esc(cat.blurb || '')}</p>` : ''}</div></section>
  <div class="wrap shop">
    <aside class="filters" id="filters"><button class="btn sm ghost only-m" id="fClose">Done</button>
      <h4>Category</h4><div class="opts">${db.categories.map(c => opt('cat', c.slug, esc(c.name))).join('')}</div>
      <h4>Gemstone</h4><div class="opts">${Object.entries(GEMS).map(([k, g]) => opt('gem', k, `<i style="background:${g.c[1]}"></i>${esc(g.name)}`)).join('')}</div>
      <h4>Metal</h4><div class="opts">${Object.entries(METALS).map(([k, m]) => opt('metal', k, esc(m.name))).join('')}</div>
      <h4>For</h4><div class="opts">${['Women', 'Men'].map(g => opt('gender', g, g)).join('')}</div>
      <h4>Price</h4><div class="opts">${[[0, 2999, 'Under ₹3,000'], [3000, 6999, '₹3,000 – ₹6,999'], [7000, 14999, '₹7,000 – ₹14,999'], [15000, 0, '₹15,000 and above']].map(([a, b, l]) =>
        `<a href="${link({ min: a || '', max: b || '' })}" class="${f.min === a && f.max === b && (a || b) ? 'on' : ''}">${l}</a>`).join('')}</div>
      ${(f.cat || f.gem || f.metal || f.gender || f.min || f.max || f.zodiac) ? `<a href="#/shop${f.q ? '?q=' + encodeURIComponent(f.q) : ''}" class="clear">Clear all filters</a>` : ''}
    </aside>
    <section>
      <div class="toolbar"><button class="btn sm ghost only-m" id="fOpen">Filters</button><span>${list.length} product${list.length === 1 ? '' : 's'}</span>
        <label>Sort by <select id="sort">${[['featured', 'Featured'], ['popular', 'Most popular'], ['new', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']].map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">${icon.search}<p>Nothing matches those filters.</p><a href="#/shop" class="btn">See all jewellery</a></div>`}
    </section></div>`;
  $('#sort').onchange = e => go(link({ sort: e.target.value }));
  $('#fOpen') && ($('#fOpen').onclick = () => $('#filters').classList.add('open'));
  $('#fClose') && ($('#fClose').onclick = () => $('#filters').classList.remove('open'));
  bindCards();
}

function pageProduct(slug) {
  const p = productBySlug(slug);
  if (!p || p.status !== 'active') return notFound();
  const g = GEMS[p.gem], m = METALS[p.metal];
  const imgs = (p.images && p.images.length) ? p.images : [null];
  const revs = db.reviews.filter(r => r.productId === p.id && r.approved);
  const related = live().filter(x => x.id !== p.id && (x.gem === p.gem || x.category === p.category)).slice(0, 4);
  const cat = db.categories.find(c => c.slug === p.category);
  app.innerHTML = `
  <div class="wrap"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/shop?cat=${esc(p.category)}">${esc(cat?.name || 'Shop')}</a> / ${esc(p.title)}</nav></div>
  <section class="wrap pdp">
    <div class="gallery"><div class="main-img" id="mainImg">${imgs[0] ? `<img src="${imgs[0]}" alt="">` : art(p.type, p.gem, p.metal)}</div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((src, i) => `<button data-img="${i}" class="${i ? '' : 'on'}"><img src="${src}" alt=""></button>`).join('')}</div>` : ''}
      <p class="cert">${icon.shield} Comes with an independent lab certificate</p></div>
    <div class="info">
      <p class="eyebrow">${esc(g.name)} · ${esc(g.hindi)}</p>
      <h1>${esc(p.title)}</h1>
      <div class="card-r">${stars(p.rating)} <button class="link" onclick="document.getElementById('reviews').scrollIntoView({behavior:'smooth'})">${p.reviews} reviews</button> · SKU ${esc(p.sku)}</div>
      <div class="price big">${money(p.price)} ${p.compare > p.price ? `<s>${money(p.compare)}</s> <span class="save">Save ${off(p)}%</span>` : ''}</div>
      <p class="muted">Inclusive of all taxes · ${p.price >= db.settings.freeShippingOver ? 'Free insured shipping' : `Free shipping over ${money(db.settings.freeShippingOver)}`}</p>
      <dl class="specs"><div><dt>Gemstone</dt><dd>${esc(g.name)} (${esc(g.hindi)})</dd></div><div><dt>Weight</dt><dd>${p.carat} carat · ${(p.carat * 1.1).toFixed(2)} ratti</dd></div>
        ${p.type !== 'loose' ? `<div><dt>Metal</dt><dd>${esc(m.name)}</dd></div>` : ''}<div><dt>For</dt><dd>${esc(p.gender)}</dd></div></dl>
      ${p.sizes.length ? `<div class="sizes"><div class="row-sb"><b>Ring size</b><button class="link" id="sizeGuide">Size guide</button></div>
        <div class="chips">${p.sizes.map(s => `<button data-size="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>` : ''}
      <div class="buy">
        <div class="qty big"><button id="qm">−</button><span id="qv">1</span><button id="qp">+</button></div>
        <button class="btn" id="addBtn" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sold out' : 'Add to bag'}</button>
        <button class="btn gold" id="buyBtn" ${p.stock <= 0 ? 'disabled' : ''}>Buy now</button>
        <button class="icon-btn wish ${wished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">${icon.heart}</button>
      </div>
      <p class="stock ${p.stock <= 3 ? 'low' : ''}">${p.stock <= 0 ? 'Out of stock — ask us to source one for you.' : p.stock <= 3 ? `Only ${p.stock} left in stock` : 'In stock · ships in 1–2 days'}</p>
      <details open><summary>Description</summary><p>${esc(p.desc)}</p></details>
      <details><summary>Certificate &amp; authenticity</summary><p>Tested by an independent gem laboratory. The report states the stone's identity, weight, measurements and any treatment. You can re-test it anywhere within 7 days for a full refund if it does not match.</p></details>
      <details><summary>Shipping &amp; returns</summary><p>Ships in 1–2 working days, fully insured, in a tamper-proof box. 7-day returns on unworn pieces (custom-sized rings excluded).</p></details>
    </div></section>
  <section class="wrap sec" id="reviews"><div class="sec-hd"><h2>Customer reviews</h2></div>
    <div class="rev-wrap"><div class="rev-sum"><b>${p.rating}</b>${stars(p.rating)}<span>${p.reviews} ratings</span></div>
      <div>${revs.length ? revs.map(r => `<div class="rv">${stars(r.rating)} <b>${esc(r.name)}</b> <small>${date(r.created)}</small><p>${esc(r.text)}</p></div>`).join('') : '<p class="muted">Be the first to review this piece.</p>'}
        <form class="rev-form" id="revForm"><h4>Write a review</h4>
          <div class="row2"><input name="name" required placeholder="Your name"><select name="rating">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)} ${n}</option>`).join('')}</select></div>
          <textarea name="text" required rows="3" placeholder="What did you think?"></textarea><button class="btn sm">Submit review</button></form></div></div></section>
  ${related.length ? `<section class="wrap sec"><div class="sec-hd"><h2>You may also like</h2></div><div class="grid">${related.map(card).join('')}</div></section>` : ''}`;
  let qty = 1, size = '';
  $('#qm').onclick = () => { qty = Math.max(1, qty - 1); $('#qv').textContent = qty; };
  $('#qp').onclick = () => { qty = Math.min(p.stock || 1, qty + 1); $('#qv').textContent = qty; };
  $$('[data-size]').forEach(b => b.onclick = () => { size = b.dataset.size; $$('[data-size]').forEach(x => x.classList.toggle('on', x === b)); });
  $$('[data-img]').forEach(b => b.onclick = () => { $('#mainImg').innerHTML = `<img src="${imgs[+b.dataset.img]}" alt="">`; $$('[data-img]').forEach(x => x.classList.toggle('on', x === b)); });
  const add = () => {
    if (p.sizes.length && !size) { toast('Please choose a ring size'); $('.sizes').classList.add('shake'); setTimeout(() => $('.sizes').classList.remove('shake'), 500); return false; }
    return cartAdd(p.id, qty, size);
  };
  $('#addBtn').onclick = () => { if (add()) { updateCounts(); toast('Added to your bag'); openCart(); } };
  $('#buyBtn').onclick = () => { if (add()) { updateCounts(); go('#/checkout'); } };
  $('#sizeGuide') && ($('#sizeGuide').onclick = () => modal(`<h3>Ring size guide</h3><p>Wrap a strip of paper around your finger, mark where it meets, and measure the length in mm.</p>
    <table class="tbl"><tr><th>Indian size</th><th>Circumference</th></tr>${[[6, 46.5], [7, 47.8], [8, 49.0], [9, 50.3], [10, 51.5], [11, 52.8], [12, 54.0], [13, 55.3], [14, 56.6]].map(([s, mm]) => `<tr><td>${s}</td><td>${mm} mm</td></tr>`).join('')}</table>`));
  $('#revForm').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    db.reviews = [...db.reviews, { id: uid('R'), productId: p.id, name: f.name.value.trim(), rating: +f.rating.value, text: f.text.value.trim(), approved: false, created: Date.now() }];
    f.reset(); toast('Thank you! Your review will appear once approved.');
  };
  bindCards();
}

function pageCart() {
  const t = totals();
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Your bag</h1></div></section>
  <div class="wrap">${t.items.length ? `<div class="cart">
    <div>${t.items.map((l, i) => `<div class="line big"><a href="#/p/${esc(l.p.slug)}" class="thumb">${productImage(l.p)}</a>
      <div><a href="#/p/${esc(l.p.slug)}" class="line-t">${esc(l.p.title)}</a>${l.size ? `<small>Ring size ${esc(l.size)}</small>` : ''}<small>${money(l.p.price)} each</small>
        <div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1">+</button></div>
        <button class="link" data-rm="${i}">Remove</button></div><b>${money(l.p.price * l.qty)}</b></div>`).join('')}</div>
    ${summary(t, true)}</div>` : `<div class="empty">${icon.bag}<p>Your bag is empty.</p><a href="#/shop" class="btn">Start shopping</a></div>`}</div>`;
  $$('[data-q]').forEach(b => b.onclick = () => { const i = +b.dataset.q; cartSet(i, db.cart[i].qty + +b.dataset.d); updateCounts(); pageCart(); });
  $$('[data-rm]').forEach(b => b.onclick = () => { cartSet(+b.dataset.rm, 0); updateCounts(); pageCart(); });
  bindCoupon(pageCart);
}

function summary(t, checkoutBtn) {
  return `<aside class="summary"><h3>Order summary</h3>
    <div class="sumrow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
    ${t.discount ? `<div class="sumrow ok"><span>Coupon ${esc(t.coupon)}</span><b>− ${money(t.discount)}</b></div>` : ''}
    <div class="sumrow"><span>Shipping</span><b>${t.shipping ? money(t.shipping) : 'Free'}</b></div>
    ${t.codFee ? `<div class="sumrow"><span>Cash on delivery fee</span><b>${money(t.codFee)}</b></div>` : ''}
    <div class="sumrow total"><span>Total</span><b>${money(t.total)}</b></div>
    <p class="muted small">Includes GST of ${money(t.gst)} (${db.settings.gst}%)</p>
    <form class="coupon" id="couponForm"><input name="code" placeholder="Coupon code" value="${esc(db.coupon || '')}"><button class="btn sm ghost">Apply</button></form>
    ${t.couponNote ? `<p class="err small">${esc(t.couponNote)}</p>` : db.coupons.filter(c => c.active).length ? `<p class="muted small">Try <b>${esc(db.coupons.find(c => c.active).code)}</b></p>` : ''}
    ${checkoutBtn ? '<a href="#/checkout" class="btn full">Proceed to checkout</a>' : ''}</aside>`;
}
function bindCoupon(rerender) {
  const f = $('#couponForm');
  if (f) f.onsubmit = e => { e.preventDefault(); db.coupon = e.target.code.value.trim(); const t = totals(); toast(t.discount ? `Coupon applied — you save ${money(t.discount)}` : (t.couponNote || 'Coupon removed')); rerender(); };
}

function pageCheckout() {
  if (!db.cart.length) return go('#/cart');
  const u = me(), a = u?.address || {};
  let pay = 'UPI';
  const draw = () => {
    const t = totals(db.cart, db.coupon, pay);
    $('#sumBox').innerHTML = summary(t, false);
    bindCoupon(draw);
  };
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Checkout</h1></div></section>
  <div class="wrap cart"><form id="coForm" class="co" novalidate>
    <h3>Contact</h3>
    ${u ? `<p class="muted">Signed in as <b>${esc(u.email)}</b></p>` : '<p class="muted">Have an account? <a href="#/account">Sign in</a> for faster checkout.</p>'}
    <div class="row2"><label>Full name<input name="name" required value="${esc(u?.name || '')}"></label><label>Mobile number<input name="phone" required inputmode="tel" value="${esc(u?.phone || '')}"></label></div>
    <label>Email<input name="email" type="email" required value="${esc(u?.email || '')}"></label>
    <h3>Delivery address</h3>
    <label>House / street<input name="line" required value="${esc(a.line || '')}"></label>
    <div class="row3"><label>City<input name="city" required value="${esc(a.city || '')}"></label><label>State<input name="state" required value="${esc(a.state || '')}"></label><label>PIN code<input name="pin" required inputmode="numeric" pattern="[0-9]{6}" value="${esc(a.pin || '')}"></label></div>
    <h3>Payment</h3>
    <div class="pays">${['UPI', 'Card', 'Net banking', ...(db.settings.cod ? ['Cash on delivery'] : [])].map((m, i) => `<label class="pay"><input type="radio" name="pay" value="${m}" ${i ? '' : 'checked'}><span><b>${m}</b><small>${{ UPI: 'GPay, PhonePe, Paytm', Card: 'Visa, Mastercard, RuPay', 'Net banking': 'All major banks', 'Cash on delivery': `Pay when it arrives (+${money(db.settings.codFee)})` }[m]}</small></span></label>`).join('')}</div>
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
    updateCounts();
    go('#/order/' + o.id);
  };
}

function pageOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return notFound();
  const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const at = steps.indexOf(o.status);
  app.innerHTML = `<section class="wrap narrow sec">
    ${o.created > Date.now() - 6e5 ? `<div class="success">${icon.gem}<h1>Thank you, ${esc(o.name.split(' ')[0])}!</h1><p>Your order <b>#${esc(o.id)}</b> is placed. A confirmation has been sent to ${esc(o.email)}.</p></div>` : `<h1>Order #${esc(o.id)}</h1>`}
    ${o.status === 'Cancelled' ? '<p class="err">This order was cancelled.</p>' : `<ol class="track">${steps.map((s, i) => `<li class="${i <= at ? 'done' : ''}"><span></span>${s}</li>`).join('')}</ol>`}
    ${o.tracking ? `<p>Courier tracking number: <b>${esc(o.tracking)}</b></p>` : ''}
    <div class="box">${o.items.map(i => `<div class="sumrow"><span>${esc(i.title)}${i.size ? ` (size ${esc(i.size)})` : ''} × ${i.qty}</span><b>${money(i.price * i.qty)}</b></div>`).join('')}
      ${o.discount ? `<div class="sumrow ok"><span>Coupon ${esc(o.coupon)}</span><b>− ${money(o.discount)}</b></div>` : ''}
      <div class="sumrow"><span>Shipping</span><b>${o.shipping ? money(o.shipping) : 'Free'}</b></div>
      ${o.codFee ? `<div class="sumrow"><span>COD fee</span><b>${money(o.codFee)}</b></div>` : ''}
      <div class="sumrow total"><span>Total (${esc(o.payment)})</span><b>${money(o.total)}</b></div></div>
    <p class="muted">Delivering to ${esc(o.name)}, ${esc(o.address.line)}, ${esc(o.address.city)}, ${esc(o.address.state)} ${esc(o.address.pin)}</p>
    <div class="row-btns"><a href="#/shop" class="btn">Continue shopping</a><a href="#/account" class="btn ghost">My orders</a></div></section>`;
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
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Hello, ${esc(u.name.split(' ')[0])}</h1><p>${esc(u.email)}</p></div></section>
  <div class="wrap acct"><nav class="side">${[['orders', 'My orders'], ['wishlist', 'Wishlist'], ['address', 'Address & details']].map(([k, l]) => `<a href="#/account/${k}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}<button class="link" id="logout">Sign out</button></nav>
    <section>${tab === 'orders' ? (orders.length ? `<table class="tbl"><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr>${orders.map(o => `<tr><td>#${esc(o.id)}</td><td>${date(o.created)}</td><td><span class="pill ${o.status.toLowerCase()}">${esc(o.status)}</span></td><td>${money(o.total)}</td><td><a href="#/order/${esc(o.id)}">View</a></td></tr>`).join('')}</table>` : '<div class="empty"><p>No orders yet.</p><a href="#/shop" class="btn">Start shopping</a></div>')
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
  <div class="wrap sec">${items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<div class="empty">${icon.heart}<p>Tap the heart on any piece to save it here.</p><a href="#/shop" class="btn">Browse jewellery</a></div>`}</div>`;
  bindCards();
}

function pageTrack() {
  app.innerHTML = `<section class="wrap narrow sec"><h1>Track your order</h1><p class="muted">Enter your order number and the email you used.</p>
    <form id="trk" class="co"><label>Order number<input name="id" required placeholder="e.g. SG50120"></label><label>Email<input name="email" type="email" required></label><p class="err" id="tErr" hidden></p><button class="btn">Track</button></form></section>`;
  $('#trk').onsubmit = e => {
    e.preventDefault();
    const id = e.target.id.value.trim().toUpperCase().replace('#', ''), em = e.target.email.value.trim().toLowerCase();
    const o = db.orders.find(x => x.id === id && x.email === em);
    if (!o) { $('#tErr').textContent = 'We could not find that order. Please check the number and email.'; $('#tErr').hidden = false; return; }
    go('#/order/' + o.id);
  };
}

function pageGemstones() {
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Shop by gemstone</h1><p>Natural, certified stones — loose or set in jewellery.</p></div></section>
  <div class="wrap sec"><div class="gems big">${Object.entries(GEMS).map(([k, g]) => `<a href="#/shop?gem=${k}" class="gem"><div>${art('loose', k, 'silver')}</div><b>${esc(g.name)}</b><span>${esc(g.hindi)} · ${live().filter(p => p.gem === k).length} pieces</span></a>`).join('')}</div></div>`;
}

function pageZodiac() {
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Shop by zodiac sign</h1><p>Find the gemstone traditionally associated with your sign.</p></div></section>
  <div class="wrap sec"><div class="zod big">${ZODIAC.map(z => `<a href="#/shop?zodiac=${z.slug}" class="z"><span class="sym">${z.sym}</span><b>${z.name}</b><small>${esc(z.dates)}</small><em>${esc(GEMS[z.gem].name)}</em></a>`).join('')}</div>
  <p class="muted small">Gemstone recommendations are traditional associations. For a personal recommendation, consult your astrologer.</p></div>`;
}

function mdLite(t) {
  return esc(t).split(/\n{2,}/).map(b => b.startsWith('## ') ? `<h2>${b.slice(3)}</h2>` : `<p>${b.replace(/\n/g, '<br>')}</p>`).join('');
}
function pageGuide(slug) {
  if (slug) {
    const p = db.posts.find(x => x.slug === slug);
    if (!p) return notFound();
    app.innerHTML = `<article class="wrap narrow sec article"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/guide">Gem Guide</a></nav>
      <h1>${esc(p.title)}</h1><p class="muted">${date(p.date)}</p><div class="art-hero">${p.image ? `<img src="${p.image}" alt="">` : art('loose', p.gem || 'ruby', 'silver')}</div>${mdLite(p.body)}
      <div class="cta-box"><b>Looking for a certified ${esc(GEMS[p.gem]?.name || 'gemstone')}?</b><a href="#/shop?gem=${esc(p.gem)}" class="btn sm">Shop now</a></div></article>`;
    return;
  }
  app.innerHTML = `<section class="page-hd"><div class="wrap"><h1>Gem Guide</h1><p>Plain-English guides to buying and caring for gemstones.</p></div></section>
  <div class="wrap sec"><div class="posts">${db.posts.map(postCard).join('')}</div></div>`;
}

const PAGES = {
  about: ['About us', s => `<p>${esc(s.name)} began as a small family gem shop in Jaipur's Johari Bazaar. Three generations later, we still choose every stone by hand — and we still believe a customer should know exactly what they are buying.</p>
    <h2>What we promise</h2><ul class="ticks"><li>Natural gemstones with independent lab certificates</li><li>Honest weights in carat and ratti</li><li>Fair prices, clearly shown — no hidden charges</li><li>7-day returns and free re-testing</li></ul>
    <h2>Visit us</h2><p>${esc(s.address)}<br>Open Monday to Saturday, 10am – 7pm.</p>`],
  shipping: ['Shipping policy', s => `<p>All orders are shipped fully insured in tamper-proof packaging.</p><h2>Delivery times</h2><p>Ready pieces ship within 1–2 working days and usually arrive in 3–6 working days anywhere in India. Custom settings take 7–10 days.</p>
    <h2>Charges</h2><p>Shipping is free on orders over ${money(s.freeShippingOver)}. Below that, a flat ${money(s.shipping)} applies. Cash on delivery carries a ${money(s.codFee)} fee.</p>`],
  returns: ['Returns & exchange', () => `<p>You can return any unworn piece within 7 days of delivery for a full refund or exchange.</p><h2>How to return</h2><p>Contact us with your order number. We arrange a free insured pickup, and refund to your original payment method within 5–7 days of receiving the item.</p>
    <h2>Exceptions</h2><p>Rings resized or made to order cannot be returned, but can be exchanged once within 15 days.</p>`],
  privacy: ['Privacy policy', s => `<p>${esc(s.name)} collects only the information needed to process your orders: your name, contact details and delivery address. We never sell your data.</p><h2>Payments</h2><p>Card and UPI payments are handled by our payment partner; we never see or store your card number.</p><h2>Contact</h2><p>Questions? Write to ${esc(s.email)}.</p>`],
  terms: ['Terms & conditions', s => `<p>By using this website you agree to these terms. Prices are in Indian Rupees and include GST. Product images are representative; natural gemstones vary slightly in colour and inclusions.</p><h2>Orders</h2><p>An order is confirmed once payment is received (or, for cash on delivery, once we call to confirm). We may cancel an order if an item is unavailable, with a full refund.</p><h2>Governing law</h2><p>These terms are governed by the laws of India, with jurisdiction in ${esc((s.address.split(',').slice(-2, -1)[0] || 'Jaipur').trim())}.</p>`],
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
  const parts = path.split('/').filter(Boolean);
  closeCart(); closeModal();
  $('#menu')?.classList.remove('open');
  const [a, b] = parts;
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
// The admin (another tab) changed something: refresh, except on pages where
// the visitor may be typing.
onExternalChange(() => {
  const a = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  if (['checkout', 'account', 'contact', 'track'].includes(a)) { updateCounts(); return; }
  renderChrome(); route();
});
route();
