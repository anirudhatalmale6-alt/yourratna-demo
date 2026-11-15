/* Admin panel for the demo store. Changes write to the shared demo db, so
 * the shop (open in another tab) updates straight away. */
import { art, productImage, GEMS, METALS } from './art.js';
import { db, save, reset, esc, money, date, datetime, slugify, uid, readImage, onExternalChange } from './db.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = $('#root');
const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const THEMES = { navy: 'Midnight', wine: 'Wine', forest: 'Forest' };
const TYPES = { ring: 'Ring', pendant: 'Pendant', earrings: 'Earrings', necklace: 'Necklace', loose: 'Loose stone' };

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2400); }
const go = h => { location.hash = h; };
const pill = s => `<span class="pill ${String(s).toLowerCase().replace(/\s+/g, '-')}">${esc(s)}</span>`;
const opts = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${esc(k)}" ${k === sel ? 'selected' : ''}>${esc(typeof v === 'string' ? v : v.name)}</option>`).join('');
const live30 = o => o.status !== 'Cancelled' && o.created > Date.now() - 30 * 864e5;

// ------------------------------------------------------------------ auth ----
const authed = () => sessionStorage.getItem('sg_admin') === '1';
function login() {
  root.innerHTML = `<div class="login"><form id="lf" class="card login-card">
    <div class="brand"><span>◆</span>${esc(db.settings.name)}</div><h1>Admin sign in</h1>
    <label>Username<input name="u" value="admin" autocomplete="username"></label>
    <label>Password<input name="p" type="password" value="admin123" autocomplete="current-password"></label>
    <p class="err" id="le" hidden>Wrong username or password.</p>
    <button class="btn full">Sign in</button>
    <p class="hint">Demo login is filled in for you: <b>admin</b> / <b>admin123</b>. The real store uses a secure server login with two-step verification.</p>
    <a href="../" class="hint">← Back to the shop</a></form></div>`;
  $('#lf').onsubmit = e => {
    e.preventDefault();
    if (e.target.u.value.trim() === 'admin' && e.target.p.value === 'admin123') { sessionStorage.setItem('sg_admin', '1'); route(); }
    else $('#le').hidden = false;
  };
}

// ----------------------------------------------------------------- shell ----
const NAV = [
  ['dash', 'Dashboard', '▦'], ['orders', 'Orders', '◷'], ['products', 'Products', '◆'], ['categories', 'Categories', '▤'],
  ['customers', 'Customers', '☺'], ['coupons', 'Coupons', '%'], ['banners', 'Homepage banners', '▭'], ['reviews', 'Reviews', '★'],
  ['blog', 'Gem Guide (blog)', '✎'], ['inbox', 'Messages & subscribers', '✉'], ['settings', 'Store settings', '⚙'],
];
function shell(active, title, body, actions = '') {
  const pending = db.orders.filter(o => o.status === 'Pending').length;
  const rev = db.reviews.filter(r => !r.approved).length;
  root.innerHTML = `<div class="shell">
    <aside class="side" id="side"><a href="#/dash" class="brand"><span>◆</span>${esc(db.settings.name)}</a>
      <nav>${NAV.map(([k, l, i]) => `<a href="#/${k}" class="${k === active ? 'on' : ''}"><i>${i}</i>${l}${k === 'orders' && pending ? `<b>${pending}</b>` : ''}${k === 'reviews' && rev ? `<b>${rev}</b>` : ''}</a>`).join('')}</nav>
      <div class="side-ft"><a href="../" target="_blank">View store ↗</a><button class="link" id="out">Sign out</button></div></aside>
    <div class="main"><header class="top"><button class="menu-btn" id="mb" aria-label="Menu">☰</button><h1>${title}</h1><div class="top-act">${actions}</div></header>
      <div class="content">${body}</div></div></div>`;
  $('#out').onclick = () => { sessionStorage.removeItem('sg_admin'); route(); };
  $('#mb').onclick = () => $('#side').classList.toggle('open');
}

// ------------------------------------------------------------- dashboard ----
function dash() {
  const O = db.orders, P = db.products;
  const recent = O.filter(live30);
  const rev = recent.reduce((s, o) => s + o.total, 0);
  const prev = O.filter(o => o.status !== 'Cancelled' && o.created <= Date.now() - 30 * 864e5 && o.created > Date.now() - 60 * 864e5).reduce((s, o) => s + o.total, 0);
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (29 - i));
    const end = d.getTime() + 864e5;
    return { d, v: O.filter(o => o.status !== 'Cancelled' && o.created >= d.getTime() && o.created < end).reduce((s, o) => s + o.total, 0) };
  });
  const max = Math.max(...days.map(x => x.v), 1);
  const bars = days.map((x, i) => {
    const h = Math.round((x.v / max) * 150);
    return `<g><rect x="${i * 20 + 4}" y="${170 - h}" width="13" height="${h || 1}" rx="3" fill="${x.v ? '#b98d34' : '#e9e2d6'}"><title>${x.d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${money(x.v)}</title></rect></g>`;
  }).join('');
  const byStatus = STATUSES.map(s => [s, O.filter(o => o.status === s).length]);
  const sold = {};
  O.filter(o => o.status !== 'Cancelled').forEach(o => o.items.forEach(i => { sold[i.id] = (sold[i.id] || 0) + i.qty; }));
  const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => [P.find(p => p.id === id), n]).filter(x => x[0]);
  const low = P.filter(p => p.status === 'active' && p.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 6);
  shell('dash', 'Dashboard', `
  <div class="kpis">
    <div class="kpi"><span>Revenue · last 30 days</span><b>${money(rev)}</b><small class="${rev >= prev ? 'up' : 'down'}">${prev ? (rev >= prev ? '▲ ' : '▼ ') + Math.abs(Math.round((rev - prev) / prev * 100)) + '% vs previous 30 days' : 'first month'}</small></div>
    <div class="kpi"><span>Orders · last 30 days</span><b>${recent.length}</b><small>${O.filter(o => o.status === 'Pending').length} waiting to be confirmed</small></div>
    <div class="kpi"><span>Average order</span><b>${money(recent.length ? rev / recent.length : 0)}</b><small>excluding cancelled</small></div>
    <div class="kpi"><span>Customers</span><b>${db.customers.length}</b><small>${db.newsletter.length} newsletter subscribers</small></div>
  </div>
  <div class="cols">
    <section class="card"><h2>Sales — last 30 days</h2><svg viewBox="0 0 600 180" class="chart" preserveAspectRatio="none">${bars}<line x1="0" y1="170.5" x2="600" y2="170.5" stroke="#e9e2d6"/></svg>
      <div class="chart-x"><span>${days[0].d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><span>Today</span></div></section>
    <section class="card"><h2>Orders by status</h2>${byStatus.map(([s, n]) => `<a href="#/orders?status=${s}" class="stat-row">${pill(s)}<b>${n}</b></a>`).join('')}</section>
  </div>
  <div class="cols">
    <section class="card"><div class="card-hd"><h2>Latest orders</h2><a href="#/orders">All orders →</a></div>${orderTable(O.slice(0, 6))}</section>
    <section class="card"><h2>Best sellers</h2>${top.map(([p, n]) => `<a href="#/products/${p.id}" class="mini">${productImage(p)}<span>${esc(p.title)}</span><b>${n} sold</b></a>`).join('') || '<p class="muted">No sales yet.</p>'}
      <h2 style="margin-top:18px">Low stock</h2>${low.map(p => `<a href="#/products/${p.id}" class="mini">${productImage(p)}<span>${esc(p.title)}</span><b class="${p.stock ? 'warn' : 'bad'}">${p.stock ? p.stock + ' left' : 'Sold out'}</b></a>`).join('') || '<p class="muted">All products are well stocked.</p>'}</section>
  </div>`);
}

function orderTable(list) {
  if (!list.length) return '<p class="muted">No orders.</p>';
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th class="r">Total</th></tr></thead><tbody>
    ${list.map(o => `<tr class="click" data-href="#/orders/${o.id}"><td><b>#${esc(o.id)}</b></td><td>${esc(o.name)}<small>${esc(o.address?.city || '')}</small></td><td>${date(o.created)}</td><td>${esc(o.payment)}</td><td>${pill(o.status)}</td><td class="r">${money(o.total)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function bindRows() { $$('tr.click').forEach(tr => tr.onclick = () => go(tr.dataset.href)); }

// ---------------------------------------------------------------- orders ----
function orders() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const st = q.get('status') || '', s = (q.get('q') || '').toLowerCase();
  let list = db.orders;
  if (st) list = list.filter(o => o.status === st);
  if (s) list = list.filter(o => `${o.id} ${o.name} ${o.email} ${o.phone}`.toLowerCase().includes(s));
  shell('orders', 'Orders', `
  <div class="bar"><div class="tabs"><a href="#/orders" class="${st ? '' : 'on'}">All (${db.orders.length})</a>${STATUSES.map(x => `<a href="#/orders?status=${x}" class="${st === x ? 'on' : ''}">${x} (${db.orders.filter(o => o.status === x).length})</a>`).join('')}</div>
    <form id="sf" class="search"><input name="q" placeholder="Search order no., name, phone…" value="${esc(q.get('q') || '')}"></form></div>
  <section class="card">${orderTable(list)}</section>`);
  bindRows();
  $('#sf').onsubmit = e => { e.preventDefault(); go('#/orders?' + new URLSearchParams({ ...(st ? { status: st } : {}), q: e.target.q.value })); };
}

function order(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return go('#/orders');
  shell('orders', `Order #${esc(o.id)}`, `
  <div class="cols wide">
    <section class="card"><h2>Items</h2>
      ${o.items.map(i => { const p = db.products.find(x => x.id === i.id); return `<div class="mini">${p ? productImage(p) : ''}<span>${esc(i.title)}${i.size ? ` · size ${esc(i.size)}` : ''}<small>${money(i.price)} × ${i.qty}</small></span><b>${money(i.price * i.qty)}</b></div>`; }).join('')}
      <div class="totals"><div><span>Subtotal</span><b>${money(o.subtotal)}</b></div>${o.discount ? `<div><span>Coupon ${esc(o.coupon)}</span><b>− ${money(o.discount)}</b></div>` : ''}
        <div><span>Shipping</span><b>${o.shipping ? money(o.shipping) : 'Free'}</b></div>${o.codFee ? `<div><span>COD fee</span><b>${money(o.codFee)}</b></div>` : ''}
        <div class="t"><span>Total</span><b>${money(o.total)}</b></div><div class="muted"><span>Includes GST</span><span>${money(o.gst)}</span></div></div></section>
    <div>
      <section class="card"><h2>Status</h2><form id="stf">
        <label>Order status<select name="status">${STATUSES.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <label>Courier tracking number<input name="tracking" value="${esc(o.tracking || '')}" placeholder="e.g. BlueDart AWB"></label>
        <button class="btn">Save</button> <a href="#/orders/${o.id}/invoice" class="btn ghost">Print invoice</a></form>
        <p class="hint">Placed ${datetime(o.created)} · paid by ${esc(o.payment)}</p></section>
      <section class="card"><h2>Customer</h2><p><b>${esc(o.name)}</b><br>${esc(o.email)}<br>${esc(o.phone)}</p>
        <p class="muted">${esc(o.address.line)}<br>${esc(o.address.city)}, ${esc(o.address.state)} ${esc(o.address.pin)}</p>
        <a href="#/customers/${esc(o.customerId)}">View customer →</a></section></div></div>`, `<a href="#/orders" class="btn ghost sm">← All orders</a>`);
  $('#stf').onsubmit = e => {
    e.preventDefault();
    const was = o.status;
    o.status = e.target.status.value; o.tracking = e.target.tracking.value.trim();
    if (o.status === 'Cancelled' && was !== 'Cancelled') o.items.forEach(i => { const p = db.products.find(x => x.id === i.id); if (p) p.stock += i.qty; });
    if (was === 'Cancelled' && o.status !== 'Cancelled') o.items.forEach(i => { const p = db.products.find(x => x.id === i.id); if (p) p.stock = Math.max(0, p.stock - i.qty); });
    save(); toast('Order updated' + (o.status === 'Cancelled' && was !== 'Cancelled' ? ' — stock returned' : '')); order(id);
  };
}

function invoice(id) {
  const o = db.orders.find(x => x.id === id), s = db.settings;
  if (!o) return go('#/orders');
  const taxable = o.total - o.gst - o.shipping - o.codFee;
  root.innerHTML = `<div class="invoice"><div class="no-print bar"><a href="#/orders/${o.id}" class="btn ghost sm">← Back</a><button class="btn sm" onclick="print()">Print / Save PDF</button></div>
    <div class="inv"><div class="inv-hd"><div><div class="brand"><span>◆</span>${esc(s.name)}</div><p>${esc(s.address)}<br>${esc(s.phone)} · ${esc(s.email)}<br>GSTIN ${esc(s.gstin)}</p></div>
      <div class="r"><h1>Tax invoice</h1><p>Invoice #INV-${esc(o.id)}<br>Date ${date(o.created)}<br>Order #${esc(o.id)}</p></div></div>
      <div class="inv-to"><b>Bill to</b><br>${esc(o.name)}<br>${esc(o.address.line)}, ${esc(o.address.city)}, ${esc(o.address.state)} ${esc(o.address.pin)}<br>${esc(o.phone)}</div>
      <table class="tbl"><thead><tr><th>Item</th><th>HSN</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>
        ${o.items.map(i => `<tr><td>${esc(i.title)}${i.size ? ` (size ${esc(i.size)})` : ''}</td><td>7113</td><td class="r">${i.qty}</td><td class="r">${money(i.price)}</td><td class="r">${money(i.price * i.qty)}</td></tr>`).join('')}</tbody></table>
      <div class="totals inv-tot">${o.discount ? `<div><span>Discount (${esc(o.coupon)})</span><b>− ${money(o.discount)}</b></div>` : ''}
        <div><span>Taxable value</span><b>${money(taxable)}</b></div><div><span>CGST ${s.gst / 2}%</span><b>${money(o.gst / 2)}</b></div><div><span>SGST ${s.gst / 2}%</span><b>${money(o.gst / 2)}</b></div>
        <div><span>Shipping</span><b>${money(o.shipping)}</b></div>${o.codFee ? `<div><span>COD fee</span><b>${money(o.codFee)}</b></div>` : ''}<div class="t"><span>Total</span><b>${money(o.total)}</b></div></div>
      <p class="hint">Thank you for shopping with ${esc(s.name)}. This is a computer-generated invoice.</p></div></div>`;
}

// -------------------------------------------------------------- products ----
function products() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const s = (q.get('q') || '').toLowerCase(), c = q.get('cat') || '';
  let list = [...db.products].sort((a, b) => b.created - a.created);
  if (c) list = list.filter(p => p.category === c);
  if (s) list = list.filter(p => `${p.title} ${p.sku}`.toLowerCase().includes(s));
  shell('products', 'Products', `
  <div class="bar"><form id="pf" class="search"><input name="q" placeholder="Search name or SKU…" value="${esc(q.get('q') || '')}">
    <select name="cat"><option value="">All categories</option>${db.categories.map(x => `<option value="${esc(x.slug)}" ${x.slug === c ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><button class="btn sm ghost">Filter</button></form>
    <span class="muted">${list.length} products</span></div>
  <section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Product</th><th>Category</th><th class="r">Price</th><th class="r">Stock</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.map(p => `<tr class="click" data-href="#/products/${p.id}"><td class="th">${productImage(p)}</td><td><b>${esc(p.title)}</b><small>${esc(p.sku)}${p.featured ? ' · Featured' : ''}${p.bestseller ? ' · Bestseller' : ''}</small></td>
      <td>${esc(db.categories.find(x => x.slug === p.category)?.name || p.category)}</td><td class="r">${money(p.price)}</td>
      <td class="r ${p.stock <= 0 ? 'bad' : p.stock <= 2 ? 'warn' : ''}">${p.stock}</td><td>${pill(p.status === 'active' ? 'Active' : 'Draft')}</td><td class="r">›</td></tr>`).join('')}
  </tbody></table></div></section>`, `<a href="#/products/new" class="btn">+ Add product</a>`);
  bindRows();
  $('#pf').onsubmit = e => { e.preventDefault(); go('#/products?' + new URLSearchParams({ q: e.target.q.value, cat: e.target.cat.value })); };
}

function productForm(id) {
  const isNew = id === 'new';
  const p = isNew ? { id: uid('P'), sku: 'SG-' + Math.floor(1e4 + Math.random() * 9e4), title: '', type: 'ring', category: 'rings', gem: 'ruby', metal: 'silver', gender: 'Women',
    price: 0, compare: 0, stock: 1, carat: 3, sizes: ['6', '7', '8', '9', '10', '11', '12'], featured: false, bestseller: false, status: 'active', images: [], rating: 5, reviews: 0, desc: '', created: Date.now() }
    : db.products.find(x => x.id === id);
  if (!p) return go('#/products');
  const draft = structuredClone(p);
  shell('products', isNew ? 'Add product' : 'Edit product', `
  <form id="prf" class="cols wide">
    <div>
      <section class="card"><label>Product name<input name="title" required value="${esc(draft.title)}" placeholder="e.g. Classic Ruby Ring in 925 Silver"></label>
        <label>Description<textarea name="desc" rows="5">${esc(draft.desc)}</textarea></label></section>
      <section class="card"><h2>Photos</h2><div class="imgs" id="imgs"></div>
        <label class="upload">+ Add photos<input type="file" id="imgIn" accept="image/*" multiple hidden></label>
        <p class="hint">Without photos, the store shows a drawing of the piece in the chosen gemstone and metal. The first photo is the main one.</p></section>
      <section class="card"><h2>Pricing &amp; stock</h2><div class="g3">
        <label>Price (₹)<input name="price" type="number" min="0" required value="${draft.price}"></label>
        <label>Compare-at price (₹)<input name="compare" type="number" min="0" value="${draft.compare || ''}" placeholder="optional"></label>
        <label>Stock<input name="stock" type="number" min="0" required value="${draft.stock}"></label>
        <label>SKU<input name="sku" value="${esc(draft.sku)}"></label>
        <label>Weight (carat)<input name="carat" type="number" step="0.01" min="0" value="${draft.carat}"></label>
        <label>Ring sizes<input name="sizes" value="${esc((draft.sizes || []).join(', '))}" placeholder="e.g. 6, 7, 8"></label></div>
        <p class="hint">Compare-at price shows as a crossed-out price with a "% off" badge. Leave ring sizes empty for non-ring items.</p></section>
    </div>
    <div>
      <section class="card"><h2>Preview</h2><div class="preview" id="prev"></div></section>
      <section class="card"><h2>Organise</h2>
        <label>Status<select name="status"><option value="active" ${draft.status === 'active' ? 'selected' : ''}>Active — visible in store</option><option value="draft" ${draft.status !== 'active' ? 'selected' : ''}>Draft — hidden</option></select></label>
        <label>Category<select name="category">${db.categories.map(c => `<option value="${esc(c.slug)}" ${c.slug === draft.category ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label>Type (for the drawing)<select name="type">${opts(TYPES, draft.type)}</select></label>
        <label>Gemstone<select name="gem">${opts(GEMS, draft.gem)}</select></label>
        <label>Metal<select name="metal">${opts(METALS, draft.metal)}</select></label>
        <label>For<select name="gender">${['Women', 'Men', 'Unisex'].map(g => `<option ${g === draft.gender ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" name="featured" ${draft.featured ? 'checked' : ''}> Featured on home page</label>
        <label class="check"><input type="checkbox" name="bestseller" ${draft.bestseller ? 'checked' : ''}> Bestseller badge</label></section>
      <div class="save-bar"><button class="btn">${isNew ? 'Add product' : 'Save changes'}</button>
        ${isNew ? '' : `<button type="button" class="btn ghost" id="dup">Duplicate</button><button type="button" class="btn danger" id="del">Delete</button>`}</div>
    </div></form>`, `<a href="#/products" class="btn ghost sm">← Products</a>${isNew ? '' : ` <a href="../#/p/${esc(p.slug)}" target="_blank" class="btn ghost sm">View in store ↗</a>`}`);
  const f = $('#prf');
  const read = () => {
    const v = n => f[n].value;
    Object.assign(draft, { title: v('title').trim(), desc: v('desc').trim(), price: +v('price') || 0, compare: +v('compare') || 0, stock: Math.max(0, +v('stock') || 0),
      sku: v('sku').trim(), carat: +v('carat') || 0, sizes: v('sizes').split(',').map(x => x.trim()).filter(Boolean), status: v('status'), category: v('category'),
      type: v('type'), gem: v('gem'), metal: v('metal'), gender: v('gender'), featured: f.featured.checked, bestseller: f.bestseller.checked });
  };
  const drawImgs = () => {
    $('#imgs').innerHTML = draft.images.map((src, i) => `<div class="img"><img src="${src}" alt=""><button type="button" data-rm="${i}" aria-label="Remove">×</button>${i ? `<button type="button" data-first="${i}" class="first">Make main</button>` : '<span class="first">Main</span>'}</div>`).join('');
    $$('[data-rm]').forEach(b => b.onclick = () => { draft.images.splice(+b.dataset.rm, 1); drawImgs(); preview(); });
    $$('[data-first]').forEach(b => b.onclick = () => { const [x] = draft.images.splice(+b.dataset.first, 1); draft.images.unshift(x); drawImgs(); preview(); });
  };
  const preview = () => { read(); $('#prev').innerHTML = `<div class="pv-img">${productImage(draft)}</div><b>${esc(draft.title || 'Product name')}</b><div>${money(draft.price)} ${draft.compare > draft.price ? `<s>${money(draft.compare)}</s>` : ''}</div>`; };
  drawImgs(); preview();
  f.addEventListener('input', preview);
  $('#imgIn').onchange = async e => {
    for (const file of e.target.files) {
      try { draft.images.push(await readImage(file)); } catch (err) { toast(err.message); }
    }
    e.target.value = ''; drawImgs(); preview();
  };
  f.onsubmit = e => {
    e.preventDefault(); read();
    if (!draft.title) return toast('Please enter a product name');
    if (draft.price <= 0) return toast('Please enter a price');
    if (isNew || draft.title !== p.title) draft.slug = slugify(draft.title) + '-' + draft.id.slice(-4).toLowerCase();
    if (isNew) db.products.unshift(draft); else Object.assign(p, draft);
    if (save()) { toast(isNew ? 'Product added' : 'Saved'); go('#/products/' + draft.id); }
  };
  if (!isNew) {
    $('#del').onclick = () => { if (confirm('Delete this product?')) { db.products.splice(db.products.indexOf(p), 1); save(); toast('Deleted'); go('#/products'); } };
    $('#dup').onclick = () => { const c = structuredClone(p); c.id = uid('P'); c.title += ' (copy)'; c.slug = slugify(c.title) + '-' + c.id.slice(-4).toLowerCase(); c.sku += '-C'; c.status = 'draft'; c.created = Date.now(); db.products.unshift(c); save(); toast('Copy created as a draft'); go('#/products/' + c.id); };
  }
}

// ------------------------------------------------------------ categories ----
function categories() {
  shell('categories', 'Categories', `
  <div class="cols wide"><section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Category</th><th class="r">Products</th><th>Home page</th><th></th></tr></thead><tbody>
    ${db.categories.map((c, i) => `<tr><td class="th">${c.image ? `<img src="${c.image}" alt="">` : art(c.type, c.gem, c.metal)}</td><td><b>${esc(c.name)}</b><small>${esc(c.blurb || '')}</small></td>
      <td class="r">${db.products.filter(p => p.category === c.slug).length}</td><td>${c.home ? 'Shown' : '—'}</td>
      <td class="r nowrap"><button class="link" data-up="${i}" ${i ? '' : 'disabled'}>↑</button> <button class="link" data-edit="${i}">Edit</button> <button class="link bad" data-del="${i}">Delete</button></td></tr>`).join('')}
  </tbody></table></div><p class="hint">Use ↑ to change the order shown in the menu and on the home page.</p></section>
  <section class="card" id="catBox"></section></div>`);
  const form = (i = -1) => {
    const c = i >= 0 ? db.categories[i] : { name: '', slug: '', blurb: '', type: 'ring', gem: 'ruby', metal: 'silver', home: true, image: '' };
    $('#catBox').innerHTML = `<h2>${i >= 0 ? 'Edit category' : 'Add a category'}</h2><form id="cf">
      <label>Name<input name="name" required value="${esc(c.name)}" placeholder="e.g. Bracelets"></label>
      <label>Short description<input name="blurb" value="${esc(c.blurb || '')}"></label>
      <div class="g3"><label>Picture: type<select name="type">${opts(TYPES, c.type)}</select></label><label>Gemstone<select name="gem">${opts(GEMS, c.gem)}</select></label><label>Metal<select name="metal">${opts(METALS, c.metal)}</select></label></div>
      <label class="upload">${c.image ? 'Replace photo' : 'Or upload a photo'}<input type="file" name="img" accept="image/*" hidden></label>${c.image ? '<label class="check"><input type="checkbox" name="noimg"> Remove photo</label>' : ''}
      <label class="check"><input type="checkbox" name="home" ${c.home ? 'checked' : ''}> Show on the home page</label>
      <button class="btn">${i >= 0 ? 'Save' : 'Add category'}</button> ${i >= 0 ? '<button type="button" class="btn ghost" id="cNew">New category</button>' : ''}</form>`;
    $('#cf').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, name = f.name.value.trim();
      const data = { name, blurb: f.blurb.value.trim(), type: f.type.value, gem: f.gem.value, metal: f.metal.value, home: f.home.checked };
      if (f.img.files[0]) { try { data.image = await readImage(f.img.files[0], 600); } catch (err) { return toast(err.message); } }
      if (f.noimg?.checked) data.image = '';
      if (i >= 0) Object.assign(db.categories[i], data);
      else {
        const slug = slugify(name);
        if (db.categories.some(x => x.slug === slug)) return toast('A category with that name already exists');
        db.categories.push({ slug, image: '', ...data });
      }
      save(); toast('Saved'); categories();
    };
    $('#cNew') && ($('#cNew').onclick = () => form());
  };
  form();
  $$('[data-edit]').forEach(b => b.onclick = () => form(+b.dataset.edit));
  $$('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; [db.categories[i - 1], db.categories[i]] = [db.categories[i], db.categories[i - 1]]; save(); categories(); });
  $$('[data-del]').forEach(b => b.onclick = () => {
    const c = db.categories[+b.dataset.del], n = db.products.filter(p => p.category === c.slug).length;
    if (n) return alert(`${c.name} still has ${n} products. Move or delete them first (Products → filter by category).`);
    if (confirm(`Delete ${c.name}?`)) { db.categories.splice(+b.dataset.del, 1); save(); categories(); }
  });
}

// ------------------------------------------------------------- customers ----
function customers(id) {
  if (id) {
    const c = db.customers.find(x => x.id === id);
    if (!c) return go('#/customers');
    const os = db.orders.filter(o => o.customerId === c.id);
    shell('customers', esc(c.name), `<div class="cols wide"><section class="card"><h2>Orders (${os.length})</h2>${orderTable(os)}</section>
      <section class="card"><h2>Details</h2><p><b>${esc(c.name)}</b><br>${esc(c.email)}<br>${esc(c.phone || '')}</p><p class="muted">${esc(c.address?.line || '')}<br>${esc(c.address?.city || '')} ${esc(c.address?.state || '')} ${esc(c.address?.pin || '')}</p>
        <p class="muted">Customer since ${date(c.created)}<br>Total spent ${money(os.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0))}</p></section></div>`,
      '<a href="#/customers" class="btn ghost sm">← Customers</a>');
    bindRows(); return;
  }
  const s = (new URLSearchParams(location.hash.split('?')[1] || '').get('q') || '').toLowerCase();
  const rows = db.customers.map(c => { const os = db.orders.filter(o => o.customerId === c.id && o.status !== 'Cancelled'); return { c, n: os.length, spent: os.reduce((t, o) => t + o.total, 0) }; })
    .filter(x => !s || `${x.c.name} ${x.c.email} ${x.c.phone}`.toLowerCase().includes(s)).sort((a, b) => b.spent - a.spent);
  shell('customers', 'Customers', `<div class="bar"><form id="cs" class="search"><input name="q" placeholder="Search name, email, phone…" value="${esc(s)}"></form><button class="btn ghost sm" id="csv">Download CSV</button></div>
  <section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Customer</th><th>Phone</th><th>City</th><th class="r">Orders</th><th class="r">Spent</th></tr></thead><tbody>
    ${rows.map(({ c, n, spent }) => `<tr class="click" data-href="#/customers/${c.id}"><td><b>${esc(c.name)}</b><small>${esc(c.email)}</small></td><td>${esc(c.phone || '')}</td><td>${esc(c.address?.city || '')}</td><td class="r">${n}</td><td class="r">${money(spent)}</td></tr>`).join('')}
  </tbody></table></div></section>`);
  bindRows();
  $('#cs').onsubmit = e => { e.preventDefault(); go('#/customers?q=' + encodeURIComponent(e.target.q.value)); };
  $('#csv').onclick = () => {
    const lines = [['Name', 'Email', 'Phone', 'City', 'State', 'Orders', 'Spent']].concat(rows.map(({ c, n, spent }) => [c.name, c.email, c.phone || '', c.address?.city || '', c.address?.state || '', n, spent]));
    const blob = new Blob([lines.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customers.csv'; a.click();
  };
}

// --------------------------------------------------------------- coupons ----
function coupons() {
  shell('coupons', 'Coupons', `<div class="cols wide"><section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Code</th><th>Discount</th><th>Minimum order</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>
    ${db.coupons.map((c, i) => `<tr><td><b>${esc(c.code)}</b></td><td>${c.type === 'percent' ? c.value + '%' : money(c.value)}</td><td>${money(c.min)}</td><td>${esc(c.expires || 'never')}</td>
      <td>${pill(c.active ? 'Active' : 'Paused')}</td><td class="r nowrap"><button class="link" data-tg="${i}">${c.active ? 'Pause' : 'Activate'}</button> <button class="link" data-ed="${i}">Edit</button> <button class="link bad" data-dl="${i}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No coupons yet.</td></tr>'}
  </tbody></table></div></section><section class="card" id="cpBox"></section></div>`);
  const form = (i = -1) => {
    const c = i >= 0 ? db.coupons[i] : { code: '', type: 'percent', value: 10, min: 0, expires: '', active: true };
    $('#cpBox').innerHTML = `<h2>${i >= 0 ? 'Edit coupon' : 'New coupon'}</h2><form id="cpf"><label>Code<input name="code" required value="${esc(c.code)}" placeholder="e.g. DIWALI15" style="text-transform:uppercase"></label>
      <div class="g3"><label>Type<select name="type"><option value="percent" ${c.type === 'percent' ? 'selected' : ''}>% off</option><option value="flat" ${c.type === 'flat' ? 'selected' : ''}>₹ off</option></select></label>
      <label>Value<input name="value" type="number" min="1" required value="${c.value}"></label><label>Min. order (₹)<input name="min" type="number" min="0" value="${c.min}"></label></div>
      <label>Expires on<input name="expires" type="date" value="${esc(c.expires || '')}"></label><button class="btn">${i >= 0 ? 'Save' : 'Create coupon'}</button></form>`;
    $('#cpf').onsubmit = e => {
      e.preventDefault();
      const f = e.target, data = { code: f.code.value.trim().toUpperCase().replace(/\s+/g, ''), type: f.type.value, value: +f.value.value, min: +f.min.value || 0, expires: f.expires.value };
      if (data.type === 'percent' && data.value > 90) return toast('Percentage must be 90 or less');
      if (db.coupons.some((x, k) => x.code === data.code && k !== i)) return toast('That code already exists');
      if (i >= 0) Object.assign(db.coupons[i], data); else db.coupons.push({ ...data, active: true });
      save(); toast('Saved'); coupons();
    };
  };
  form();
  $$('[data-ed]').forEach(b => b.onclick = () => form(+b.dataset.ed));
  $$('[data-tg]').forEach(b => b.onclick = () => { const c = db.coupons[+b.dataset.tg]; c.active = !c.active; save(); coupons(); });
  $$('[data-dl]').forEach(b => b.onclick = () => { if (confirm('Delete this coupon?')) { db.coupons.splice(+b.dataset.dl, 1); save(); coupons(); } });
}

// --------------------------------------------------------------- banners ----
function banners() {
  shell('banners', 'Homepage banners', `<p class="lead">The slides at the top of the home page. They rotate every few seconds.</p>
  <div class="cols wide"><section class="card">${db.banners.map((b, i) => `<div class="bn t-${esc(b.theme)}"><div class="bn-art">${b.image ? `<img src="${b.image}" alt="">` : art(b.type, b.gem, 'vermeil')}</div>
    <div><b>${esc(b.title)}</b><small>${esc(b.sub)}</small><small>Button: ${esc(b.btn)} → ${esc(b.link)}</small></div>
    <div class="nowrap"><button class="link" data-up="${i}" ${i ? '' : 'disabled'}>↑</button> <button class="link" data-ed="${i}">Edit</button> <button class="link bad" data-dl="${i}">Delete</button></div></div>`).join('') || '<p class="muted">No banners — the home page will start with the categories.</p>'}</section>
  <section class="card" id="bBox"></section></div>`);
  const form = (i = -1) => {
    const b = i >= 0 ? db.banners[i] : { title: '', sub: '', btn: 'Shop now', link: '#/shop', theme: 'navy', type: 'ring', gem: 'ruby', image: '' };
    $('#bBox').innerHTML = `<h2>${i >= 0 ? 'Edit slide' : 'Add a slide'}</h2><form id="bf"><label>Heading<input name="title" required value="${esc(b.title)}"></label>
      <label>Text<textarea name="sub" rows="2">${esc(b.sub)}</textarea></label>
      <div class="g3"><label>Button text<input name="btn" value="${esc(b.btn)}"></label><label>Button goes to<select name="link">${[['#/shop', 'All jewellery'], ...db.categories.map(c => [`#/shop?cat=${c.slug}`, c.name]), ['#/zodiac', 'Zodiac page'], ['#/gemstones', 'Gemstones page'], ['#/guide', 'Gem Guide']].map(([v, l]) => `<option value="${esc(v)}" ${v === b.link ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label>Colour<select name="theme">${opts(THEMES, b.theme)}</select></label></div>
      <div class="g3"><label>Picture: type<select name="type">${opts(TYPES, b.type)}</select></label><label>Gemstone<select name="gem">${opts(GEMS, b.gem)}</select></label>
      <label class="upload">${b.image ? 'Replace photo' : 'Or upload a photo'}<input type="file" name="img" accept="image/*" hidden></label></div>
      ${b.image ? '<label class="check"><input type="checkbox" name="noimg"> Remove photo</label>' : ''}
      <button class="btn">${i >= 0 ? 'Save' : 'Add slide'}</button></form>`;
    $('#bf').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, data = { title: f.title.value.trim(), sub: f.sub.value.trim(), btn: f.btn.value.trim(), link: f.link.value, theme: f.theme.value, type: f.type.value, gem: f.gem.value };
      if (f.img.files[0]) { try { data.image = await readImage(f.img.files[0], 800); } catch (err) { return toast(err.message); } }
      if (f.noimg?.checked) data.image = '';
      if (i >= 0) Object.assign(db.banners[i], data); else db.banners.push({ id: uid('B'), image: '', ...data });
      save(); toast('Saved — check the home page'); banners();
    };
  };
  form();
  $$('[data-ed]').forEach(b => b.onclick = () => form(+b.dataset.ed));
  $$('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; [db.banners[i - 1], db.banners[i]] = [db.banners[i], db.banners[i - 1]]; save(); banners(); });
  $$('[data-dl]').forEach(b => b.onclick = () => { if (confirm('Delete this slide?')) { db.banners.splice(+b.dataset.dl, 1); save(); banners(); } });
}

// --------------------------------------------------------------- reviews ----
function reviews() {
  const list = [...db.reviews].sort((a, b) => (a.approved - b.approved) || (b.created - a.created));
  shell('reviews', 'Reviews', `<p class="lead">New reviews from customers wait here until you approve them.</p><section class="card">
    ${list.map(r => { const p = db.products.find(x => x.id === r.productId); return `<div class="rv-row ${r.approved ? '' : 'pending'}"><div><b>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</b> ${esc(r.name)} <small>${date(r.created)}${p ? ' · ' + esc(p.title) : ''}</small><p>${esc(r.text)}</p></div>
      <div class="nowrap">${r.approved ? pill('Published') + ` <button class="link" data-hide="${r.id}">Hide</button>` : `<button class="btn sm" data-ok="${r.id}">Approve</button>`} <button class="link bad" data-del="${r.id}">Delete</button></div></div>`; }).join('') || '<p class="muted">No reviews yet.</p>'}</section>`);
  const find = id => db.reviews.find(r => r.id === id);
  $$('[data-ok]').forEach(b => b.onclick = () => { find(b.dataset.ok).approved = true; save(); toast('Published'); reviews(); });
  $$('[data-hide]').forEach(b => b.onclick = () => { find(b.dataset.hide).approved = false; save(); reviews(); });
  $$('[data-del]').forEach(b => b.onclick = () => { if (confirm('Delete this review?')) { db.reviews = db.reviews.filter(r => r.id !== b.dataset.del); reviews(); } });
}

// ------------------------------------------------------------------ blog ----
function blog(slug) {
  if (slug) {
    const isNew = slug === 'new';
    const p = isNew ? { slug: '', title: '', date: new Date().toISOString().slice(0, 10), gem: 'ruby', excerpt: '', body: '', image: '' } : db.posts.find(x => x.slug === slug);
    if (!p) return go('#/blog');
    shell('blog', isNew ? 'New article' : 'Edit article', `<form id="bgf" class="card narrow"><label>Title<input name="title" required value="${esc(p.title)}"></label>
      <div class="g3"><label>Date<input name="date" type="date" value="${esc(p.date)}"></label><label>Gemstone (for picture &amp; shop link)<select name="gem">${opts(GEMS, p.gem)}</select></label>
      <label class="upload">${p.image ? 'Replace photo' : 'Upload a photo'}<input type="file" name="img" accept="image/*" hidden></label></div>
      <label>Summary<textarea name="excerpt" rows="2">${esc(p.excerpt)}</textarea></label>
      <label>Article <small>Blank line = new paragraph. Start a line with ## for a heading.</small><textarea name="body" rows="14">${esc(p.body)}</textarea></label>
      <button class="btn">${isNew ? 'Publish' : 'Save'}</button> ${isNew ? '' : `<button type="button" class="btn danger" id="pdel">Delete</button>`}</form>`,
      `<a href="#/blog" class="btn ghost sm">← Articles</a>`);
    $('#bgf').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, data = { title: f.title.value.trim(), date: f.date.value, gem: f.gem.value, excerpt: f.excerpt.value.trim(), body: f.body.value.trim() };
      if (f.img.files[0]) { try { data.image = await readImage(f.img.files[0], 1000); } catch (err) { return toast(err.message); } }
      if (isNew) { data.slug = slugify(data.title); db.posts.unshift({ image: '', ...data }); } else Object.assign(p, data);
      save(); toast('Saved'); go('#/blog');
    };
    $('#pdel') && ($('#pdel').onclick = () => { if (confirm('Delete this article?')) { db.posts = db.posts.filter(x => x !== p); go('#/blog'); } });
    return;
  }
  shell('blog', 'Gem Guide (blog)', `<section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Article</th><th>Date</th><th></th></tr></thead><tbody>
    ${db.posts.map(p => `<tr class="click" data-href="#/blog/${esc(p.slug)}"><td><b>${esc(p.title)}</b><small>${esc(p.excerpt)}</small></td><td>${date(p.date)}</td><td class="r">›</td></tr>`).join('')}</tbody></table></div></section>`,
    `<a href="#/blog/new" class="btn">+ New article</a>`);
  bindRows();
}

// ----------------------------------------------------------------- inbox ----
function inbox() {
  shell('inbox', 'Messages & subscribers', `<div class="cols wide"><section class="card"><h2>Contact form messages</h2>
    ${[...db.messages].reverse().map(m => `<div class="rv-row"><div><b>${esc(m.name)}</b> <small>${esc(m.email)} ${esc(m.phone || '')} · ${datetime(m.at)}</small><p>${esc(m.msg)}</p></div><a class="btn sm ghost" href="mailto:${esc(m.email)}">Reply</a></div>`).join('') || '<p class="muted">No messages yet. Try the Contact page in the store.</p>'}</section>
  <section class="card"><h2>Newsletter subscribers (${db.newsletter.length})</h2>${db.newsletter.map(n => `<div class="stat-row"><span>${esc(n.email)}</span><small>${date(n.at)}</small></div>`).join('') || '<p class="muted">No subscribers yet.</p>'}</section></div>`);
}

// -------------------------------------------------------------- settings ----
function settings() {
  const s = db.settings;
  shell('settings', 'Store settings', `<form id="stf" class="cols wide"><div>
    <section class="card"><h2>Store details</h2><label>Store name<input name="name" required value="${esc(s.name)}"></label><label>Tagline<input name="tagline" value="${esc(s.tagline)}"></label>
      <label>Announcement bar <small>the thin bar at the very top of every page — leave empty to hide</small><input name="announcement" value="${esc(s.announcement)}"></label>
      <div class="g2"><label>Phone / WhatsApp<input name="phone" value="${esc(s.phone)}"></label><label>Email<input name="email" value="${esc(s.email)}"></label></div>
      <label>Address<input name="address" value="${esc(s.address)}"></label></section>
    <section class="card"><h2>Tax</h2><div class="g2"><label>GSTIN<input name="gstin" value="${esc(s.gstin)}"></label><label>GST rate (%) <small>jewellery is usually 3%</small><input name="gst" type="number" step="0.5" min="0" value="${s.gst}"></label></div>
      <p class="hint">Prices in the store include GST; invoices split it into CGST + SGST.</p></section></div>
    <div><section class="card"><h2>Shipping &amp; payment</h2><div class="g2"><label>Shipping charge (₹)<input name="shipping" type="number" min="0" value="${s.shipping}"></label>
      <label>Free shipping over (₹)<input name="freeShippingOver" type="number" min="0" value="${s.freeShippingOver}"></label></div>
      <label class="check"><input type="checkbox" name="cod" ${s.cod ? 'checked' : ''}> Offer cash on delivery</label><label>COD fee (₹)<input name="codFee" type="number" min="0" value="${s.codFee}"></label></section>
      <div class="save-bar"><button class="btn">Save settings</button></div>
      <section class="card danger-zone"><h2>Demo data</h2><p class="hint">Put the demo back to how it started (all your test products, orders and changes are removed from this browser).</p><button type="button" class="btn danger" id="rst">Reset demo data</button></section></div></form>`);
  $('#stf').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    Object.assign(s, { name: f.name.value.trim(), tagline: f.tagline.value.trim(), announcement: f.announcement.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
      address: f.address.value.trim(), gstin: f.gstin.value.trim(), gst: +f.gst.value || 0, shipping: +f.shipping.value || 0, freeShippingOver: +f.freeShippingOver.value || 0,
      cod: f.cod.checked, codFee: +f.codFee.value || 0 });
    save(); toast('Settings saved'); settings();
  };
  $('#rst').onclick = () => { if (confirm('Reset all demo data in this browser?')) { reset(); toast('Demo data reset'); settings(); } };
}

// ---------------------------------------------------------------- router ----
function route() {
  if (!authed()) return login();
  const [path] = location.hash.replace(/^#\/?/, '').split('?');
  const [a, b, c] = path.split('/');
  window.scrollTo(0, 0);
  if (!a || a === 'dash') dash();
  else if (a === 'orders') b ? (c === 'invoice' ? invoice(b) : order(b)) : orders();
  else if (a === 'products') b ? productForm(b) : products();
  else if (a === 'categories') categories();
  else if (a === 'customers') customers(b);
  else if (a === 'coupons') coupons();
  else if (a === 'banners') banners();
  else if (a === 'reviews') reviews();
  else if (a === 'blog') blog(b);
  else if (a === 'inbox') inbox();
  else if (a === 'settings') settings();
  else dash();
}
window.addEventListener('hashchange', route);
// Live refresh when the shop (another tab) changes data — but never on a
// page with a form, so nothing being typed is thrown away.
onExternalChange(() => {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
  if (!b && ['', 'dash', 'orders', 'reviews', 'inbox', 'customers', 'products'].includes(a || '')) route();
});
route();
