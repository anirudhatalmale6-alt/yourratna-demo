# Sitara Gems — jewellery store demo

A clickable demo of a gemstone & jewellery store with a full admin panel.

- **Store:** home, category pages with filters, product pages, cart, checkout, order tracking, customer accounts, wishlist, gemstone & zodiac pages, gem guide (blog), FAQ, contact and policy pages.
- **Admin (`/admin/`):** dashboard, orders (status, tracking, GST invoice), products (photos, stock, variants), categories, customers (CSV export), coupons, homepage banners, review moderation, blog, messages, store settings.

Demo admin login: `admin` / `admin123`.

Everything is stored in the visitor's own browser (localStorage) so the demo needs no server; changes made in the admin appear in the store immediately. Product artwork is drawn in code (`js/art.js`) — uploaded photos replace it. In the production build the same pages talk to a real backend (database, payments, emails).
