/*
 * Demo "database": everything lives in this browser's localStorage, so the
 * admin panel and the shop share the same data without a server. In the real
 * build this file becomes calls to the backend API; the pages stay the same.
 */
import * as seed from './data.js';

const KEY = 'sitara_demo_v1';
const COLLECTIONS = ['settings', 'categories', 'products', 'banners', 'posts', 'coupons', 'customers', 'orders', 'reviews', 'faq'];

function fresh() {
  return {
    settings: structuredClone(seed.SETTINGS),
    categories: structuredClone(seed.CATEGORIES),
    products: structuredClone(seed.PRODUCTS),
    banners: structuredClone(seed.BANNERS),
    posts: structuredClone(seed.POSTS),
    coupons: structuredClone(seed.COUPONS),
    customers: structuredClone(seed.CUSTOMERS),
    orders: structuredClone(seed.ORDERS),
    reviews: structuredClone(seed.REVIEWS),
    faq: structuredClone(seed.FAQ),
    cart: [], wishlist: [], session: null, coupon: '', newsletter: [], messages: [],
  };
}

let state;
function load() {
  try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { state = null; }
  if (!state || !state.products) state = fresh();
  for (const c of COLLECTIONS) if (!state[c]) state[c] = fresh()[c];
}
load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    alert('This browser is out of storage space for the demo (photos take room). Delete a few uploaded photos, or reset the demo data in Settings.');
    return false;
  }
}

export const db = new Proxy({}, { get: (_, k) => state[k], set: (_, k, v) => { state[k] = v; save(); return true; } });

export function reset() { state = fresh(); save(); }
export function reload() { load(); }

/** Other tabs (e.g. admin open next to the shop) see changes immediately. */
export function onExternalChange(fn) {
  window.addEventListener('storage', e => { if (e.key === KEY) { load(); fn(); } });
}

export const uid = p => p + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 46656).toString(36).toUpperCase();

// ---------------------------------------------------------------- helpers --
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
export const date = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const datetime = t => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
export const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const product = id => state.products.find(p => p.id === id);
export const productBySlug = s => state.products.find(p => p.slug === s);
export const live = () => state.products.filter(p => p.status === 'active');

// ------------------------------------------------------------------- cart --
export function cartAdd(id, qty = 1, size = '') {
  const p = product(id);
  if (!p || p.stock <= 0) return false;
  const line = state.cart.find(l => l.id === id && l.size === size);
  if (line) line.qty = Math.min(line.qty + qty, p.stock);
  else state.cart.push({ id, qty: Math.min(qty, p.stock), size });
  save();
  return true;
}
export function cartSet(i, qty) {
  const l = state.cart[i];
  if (!l) return;
  const p = product(l.id);
  if (qty <= 0 || !p) state.cart.splice(i, 1); else l.qty = Math.min(qty, p.stock);
  save();
}
export const cartCount = () => state.cart.reduce((s, l) => s + l.qty, 0);

export function findCoupon(code) {
  const c = state.coupons.find(x => x.code.toUpperCase() === String(code || '').trim().toUpperCase());
  if (!c || !c.active) return null;
  if (c.expires && new Date(c.expires + 'T23:59:59') < new Date()) return null;
  return c;
}

/** Prices include GST (as is normal for jewellery in India); GST is shown as part of the total. */
export function totals(lines = state.cart, couponCode = state.coupon, payment = '') {
  const s = state.settings;
  const items = lines.map(l => ({ ...l, p: product(l.id) })).filter(l => l.p);
  const subtotal = items.reduce((t, l) => t + l.p.price * l.qty, 0);
  const c = findCoupon(couponCode);
  let discount = 0, couponNote = '';
  if (couponCode && !c) couponNote = 'This coupon is not valid.';
  else if (c && subtotal < c.min) couponNote = `Add ${money(c.min - subtotal)} more to use ${c.code}.`;
  else if (c) discount = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
  const after = subtotal - discount;
  const shipping = !items.length || after >= s.freeShippingOver ? 0 : Number(s.shipping);
  const codFee = payment === 'Cash on delivery' ? Number(s.codFee || 0) : 0;
  const total = after + shipping + codFee;
  const gst = Math.round(after * s.gst / (100 + Number(s.gst)));
  return { items, subtotal, discount, coupon: c && discount ? c.code : '', couponNote, shipping, codFee, gst, total };
}

export function placeOrder(form, payment) {
  const t = totals(state.cart, state.coupon, payment);
  if (!t.items.length) return null;
  for (const l of t.items) if (l.qty > l.p.stock) return { error: `Only ${l.p.stock} left of ${l.p.title}.` };
  let cust = state.session && state.customers.find(c => c.id === state.session.customerId);
  if (!cust) cust = state.customers.find(c => c.email === form.email.toLowerCase());
  if (!cust) {
    cust = { id: uid('C'), name: form.name, email: form.email.toLowerCase(), phone: form.phone, password: '', created: Date.now(), address: {} };
    state.customers.push(cust);
  }
  cust.address = { line: form.line, city: form.city, state: form.state, pin: form.pin };
  cust.phone = form.phone || cust.phone;
  const order = {
    id: 'SG' + (50120 + state.orders.length + Math.floor(Math.random() * 900)), customerId: cust.id,
    name: form.name, email: form.email.toLowerCase(), phone: form.phone, address: cust.address,
    items: t.items.map(l => ({ id: l.id, title: l.p.title, price: l.p.price, qty: l.qty, size: l.size })),
    subtotal: t.subtotal, discount: t.discount, coupon: t.coupon, shipping: t.shipping, codFee: t.codFee, gst: t.gst, total: t.total,
    payment, status: 'Pending', tracking: '', created: Date.now(),
  };
  for (const l of t.items) l.p.stock -= l.qty;
  state.orders.unshift(order);
  state.cart = [];
  state.coupon = '';
  save();
  return order;
}

// ----------------------------------------------------------------- images --
/** Shrink an uploaded photo so it fits in browser storage (max 900px JPEG). */
export function readImage(file, max = 900) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error('Please choose an image file.'));
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .82));
      };
      img.onerror = () => rej(new Error('That image could not be read.'));
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
