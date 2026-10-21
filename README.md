# Chiefs of Angels: storefront redesign prototype

A clickable prototype of the new chiefsofangels.com storefront, for the team and client to review before the custom WordPress theme is built.

**Live preview:** https://centenarynetworks.github.io/coa-prototype/

Prepared by MPL AI (NewMPL Ventures) for Centenary Networks. Product names, prices, photos and page text come from the live store, exported on 14 October 2026.

## This is a prototype, not the store

- Nothing here connects to WooCommerce. The bag, checkout, account sign-in, contact form and newsletter all work in the browser, but no order, payment, message or email is sent.
- Anything a reviewer does (bag, wishlist, test orders) is saved only in their own browser. The red **All pages** button (bottom corner) lists every page and has **Reset prototype data**.
- The site is hidden from search engines (`noindex` on every page and `robots.txt`) so it never competes with the real site.

## Pages to review

| Page | What to look at |
|---|---|
| `index.html` | Homepage: campaign hero, New In, Skool of Rock timetable, categories, outerwear, Diaries feature |
| `collection.html#shop` | Any collection: filters, sort, grid size. Try `#skool-of-rock`, `#jackets`, `#denim-edit`, `#sale`, `#accessories` |
| `product.html#flatground-bomber-jacket` | Product page: gallery and zoom, sizes, made-to-order dispatch dates, Diaries link |
| `diaries.html`, `diary.html#skool-of-rock`, `diary.html#story-beneath-the-sound` | COA Diaries index and both stories |
| `about.html`, `contact.html`, `faq.html` | Brand pages (About now includes Services) |
| `cart.html`, `checkout.html`, `account.html`, `wishlist.html` | Shopping flow, order confirmation, order tracking |
| `404.html` | Not-found page |

Search: the magnifier in the header, or press `/`.

## Store details confirmed by Chiefs of Angels (21 Oct 2026)

Now reflected across the bag, checkout, product pages and FAQ:

- **Shipping:** The Courier Guy, standard shipping. The fee is calculated at checkout from the address. There is no free-delivery threshold.
- **Collection:** from the Melrose flagship store. A shipping fee still applies.
- **Payments:** PayFast and PayFlex (4 interest-free payments over 6 weeks).
- **Exchange policy:** exchanges or returns within 14 calendar days of purchase with a digital receipt, if goods are unused and undamaged. Sale items, discounted merchandise and headgear are not eligible; these show as "Final sale".
- **Duplicate listings** (e.g. Rock Stars Never Die Tee) are intentional: limited stock options.

## Still open

These show as red "Answer needed" boxes in the prototype:

1. **Size chart:** being produced by Chiefs of Angels
2. **Care instructions:** being produced by Chiefs of Angels
3. **Melrose flagship store:** street address and collection hours. Also confirm whether the Victoria Yards address on the current site is still in use.
4. **Made-to-order changes:** can a size be changed or an order cancelled once production starts?

## Images

The COA Diaries story images were sourced from Pinterest and their usage rights have not been checked. They are fine for internal review but should be licensed or replaced before the new site goes live.

## How it's built

Plain HTML, CSS and JavaScript, with no build step.

- `coa.css`: all styles
- `coa.js`: header, footer, search, bag, wishlist and shared helpers
- `coa-data.js`: the 75 products, generated from the WooCommerce Store API
- `img/`: product and campaign photos, resized for the web

When the design is approved, these files become the basis of a custom WordPress theme. WooCommerce (products, cart, checkout, orders, accounts) stays exactly as it is; only the storefront templates change.

## Updating the preview

Commit to `main` and GitHub Pages republishes within a minute or two.
