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

## Answers needed from Chiefs of Angels

These show as red "Answer needed" boxes in the prototype:

1. Delivery areas, courier and fees (and any free-delivery threshold; the bag uses an example of R2,500)
2. Whether online orders can be collected from the Victoria Yards showroom
3. Returns and exchange policy, and cancellations for made-to-order pieces
4. Which payment gateway the store uses
5. Care instructions (leather, suede, denim, hand-distressed cotton)
6. A size chart (chest, waist and length per size)

## Content to check

- **Diaries photos:** the archive photos of musicians in "The Story Beneath the Sound" come from the live page. Confirm usage rights.
- **Lookbook:** looks 3 and 5 in the Skool of Rock story have no caption on the live page; the "Shop the look" pieces were matched by eye.
- **Duplicate products:** three "Rock Stars Never Die Tee" and two "Logo Fitted Tee" listings. Rename them if they are different colourways.
- **Outlaw Sleeveless Leather Jacket:** its description field contains Divi builder code and needs rewriting.
- **Page addresses:** the live Skool of Rock page sits at `/auto-draft/`, and a separate ROOTS page repeats the Diaries content.
- **Copy edits made:** "reritten" corrected to "rewritten"; the "second-largest polluter" claim removed from About.

## How it's built

Plain HTML, CSS and JavaScript, with no build step.

- `coa.css`: all styles
- `coa.js`: header, footer, search, bag, wishlist and shared helpers
- `coa-data.js`: the 75 products, generated from the WooCommerce Store API
- `img/`: product and campaign photos, resized for the web

When the design is approved, these files become the basis of a custom WordPress theme. WooCommerce (products, cart, checkout, orders, accounts) stays exactly as it is; only the storefront templates change.

## Updating the preview

Commit to `main` and GitHub Pages republishes within a minute or two.
