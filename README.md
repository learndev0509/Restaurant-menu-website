# Plate & Pixel — Digital QR Menus for Restaurants

## What this project is

**Plate & Pixel** is a small product/service that builds **digital QR-code menus** (and, at the top tier, full restaurant websites) for restaurants and cafes. A guest scans a QR code on the table and opens a fast, mobile-friendly menu in their browser — no app to install.

The repository contains two things:

1. **A sales/landing page** (`index.html` at the repo root) — a pricing brochure that explains the offering, compares five plans, and links out to live demos. Each plan has a "See Live Demo" link and a pre-filled WhatsApp enquiry button.
2. **Five working demo menus** (`demo-GO/`, `demo-PLUS/`, `demo-PRO/`, `demo-MAX/`, `demo-ELITE/`) — one per plan, each showing the same sample restaurant so a prospect can see exactly what each price tier delivers.

The sample restaurant used across every demo is **The White Root Restaurant & Cafe** — tagline *"Where Taste Meets Flavour,"* located in Chandkheda, Ahmedabad, with a 4.8 rating and hours of 11:00 AM–3:00 PM & 7:00 PM–11:59 PM. The menu is organised into seven sections: Starters, Main Course, Pizza, Burgers, Pasta, Drinks, and Desserts.

## Tech stack

Plain **HTML, CSS, and JavaScript** — no frameworks, no build step, no dependencies. Each demo folder is fully self-contained with its own `index.html`, `style.css`, and `script.js`. This keeps the sites tiny, fast, and trivially hostable as static files.

All imagery currently uses Unsplash stock photos as placeholders, and favicons are a placeholder emoji — both are meant to be swapped for the real restaurant's photography and logo before going live.

## Repository structure

```
Restaurant-menu-website-main/
├── index.html            ← Plate & Pixel sales / pricing page
├── style.css             ← styles for the sales page
│
├── demo-GO/              ← GO tier demo (₹2,000)
├── demo-PLUS/            ← PLUS tier demo (₹5,000)
├── demo-PRO/             ← PRO tier demo (₹8,000)
├── demo-MAX/             ← MAX tier demo (₹10,000)
├── demo-ELITE/           ← ELITE tier demo (₹15,000) — multi-page site
│   ├── index.html
│   ├── about.html
│   ├── gallery.html
│   ├── events.html
│   └── contact.html
│
└── v1/ v2/ v3/           ← older archived iterations (not maintained)
```

Each single-page demo folder holds `index.html` + `style.css` + `script.js`. The ELITE demo is a full multi-page website (Home, About, Gallery, Events, Contact) that shares one stylesheet and script.

## The five plans

| Feature | GO (₹2,000) | PLUS (₹5,000) | PRO (₹8,000) | MAX (₹10,000) | ELITE (₹15,000) |
|---|---|---|---|---|---|
| Header | Static | Dynamic | Dynamic + Hero | Dynamic + Hero | Dynamic + Hero |
| Live search | – | ✓ | ✓ | ✓ | ✓ |
| Veg / Non-veg filter | – | ✓ | ✓ | ✓ | ✓ |
| Ingredients | – | Flip card | Flip card | Flip card | Flip card |
| Badges (Special / Popular) | – | ✓ | ✓ | ✓ | ✓ |
| Portion / Serves / Qty | – | ✓ | ✓ | ✓ | ✓ |
| Food images | – | ✓ | ✓ | ✓ | ✓ |
| QR-code menu | – | ✓ | ✓ | ✓ | ✓ |
| WhatsApp button | – | ✓ | ✓ | ✓ | ✓ |
| Dark mode | – | – | ✓ | ✓ | ✓ |
| Live hours | – | – | ✓ | ✓ | ✓ |
| Map · Instagram · Contact | – | – | ✓ | ✓ | ✓ |
| Back to top | – | – | ✓ | ✓ | ✓ |
| Food items | Up to 50 | Up to 150 | Unlimited | Unlimited | Unlimited |
| Categories | Limited | Extended | Unlimited | Unlimited | Unlimited |
| Branding | Logo only | Logo only | Logo + wallpaper | Full branding | Full branding |
| Design tier | Standard | Professional | Premium | Fully custom + luxury UI | Magazine-style website + luxury menu |
| SEO | – | – | ✓ | ✓ | ✓ (site-wide) |
| Support | 1 month | Priority | Premium | 1 year + annual refresh | 1 year + annual refresh |
| Lifetime ownership | ✓ | ✓ | ✓ | ✓ | ✓ |

**Tier notes**

- **GO** — the entry menu: static header, no search/filter, up to 50 items.
- **PLUS** — adds live search, veg/non-veg filtering, flip-card ingredients, badges, portion info, and food photos.
- **PRO** — everything in PLUS plus dark mode, live opening-hours, back-to-top, map/Instagram/contact footer, and SEO.
- **MAX** — PRO plus premium extras: an **English ⇄ Hindi language toggle**, an owner-only insights dashboard (scan counts, time-on-menu, peak hours, most-viewed dishes), per-table QR codes, and menu-type tabs (All-Day / Lunch / Dinner / Bar).
- **ELITE** — a full magazine-style **multi-page website** (Home, About, Gallery, Events, Contact) bundled with the luxury menu.

## Key menu features (in the higher tiers)

- **Light / dark mode** toggle, remembered across visits via `localStorage`.
- **Live search** that matches dish names *and* descriptions/ingredients.
- **Veg / Non-Veg / All** diet filter.
- **Flip cards** — tapping a dish flips the card from its photo to its ingredient list.
- **"Chef's Special" / "Popular"** badges on selected dishes.
- **Sticky category nav** with scroll-spy that auto-highlights the section in view.
- **Lazy-loaded images**, skeleton loaders, and JSON-LD schema markup for SEO.
- **MAX only:** bilingual English/Hindi menu, owner analytics dashboard, per-table QR codes.

## Hosting & deployment

The project is hosted for free on **GitHub Pages**:

- Live site: `https://learndev0509.github.io/Restaurant-menu-website/`
- Repo: `learndev0509/Restaurant-menu-website`

Because every folder is self-contained with relative asset links, each demo is automatically its own URL — e.g. `…/demo-PRO/` — with no extra configuration. Pushing to the repo's default branch publishes the changes.

## Running / testing locally

There is no build step. To preview on a computer, open any `index.html` directly in a browser (e.g. the repo-root `index.html` for the sales page, or `demo-PRO/index.html` for a menu). To test on a phone, use the live GitHub Pages URL.

## Important convention — cache-busting version strings

Each demo's HTML loads its CSS and JS with a version query string, e.g.:

```html
<link rel="stylesheet" href="style.css?v=20260701-1">
<script src="script.js?v=20260701-1"></script>
```

**Whenever `style.css` or `script.js` changes, bump that file's version string.** If you don't, browsers (especially phones that have already visited the page) may keep serving a stale cached copy, and a fix that is correct on disk simply won't appear. All demos currently share the version `20260701-1`.

## Contact details used in the project

- **Plate & Pixel enquiries (the vendor):** WhatsApp `+91 85110 28388` — used by the sales page CTAs.
- **The White Root (the sample restaurant):** WhatsApp / phone `+91 98798 66689`.
- **Instagram:** `@theglamishrestrocafe` — this handle is intentional; the restaurant was renamed but kept its original handle.

## Known intentional placeholders

These are known and expected, not bugs — they'll be replaced with real assets before a client launch:

- All photos (hero banners, dish images, social-share images) are **generic Unsplash stock**.
- The favicon is a **placeholder emoji** rather than a real logo.
- The Instagram handle differs from the restaurant name (see above).
