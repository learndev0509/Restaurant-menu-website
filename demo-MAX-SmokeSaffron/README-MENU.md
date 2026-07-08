# Smoke & Saffron — Live Menu Guide (Google Sheet + JSON)

The menu on this site is **no longer hard-coded in HTML**. It renders from data, in this priority order:

1. **Google Sheet** (published-to-web CSV) — if a sheet link is set in `menu.json → settings.sheetCsvUrl`
2. **`menu.json`** — the file in this folder (29 dishes pre-filled)
3. **Embedded fallback** inside `index.html` — so the page still shows a menu even offline / if both fetches fail

Change the data → refresh the page → the menu updates. No HTML edits, ever.

---

## Option A — Edit `menu.json` (developer-friendly)

Open `menu.json`. Each dish looks like:

```json
{
  "section": "starters",
  "name": "Paneer Tikka",
  "diet": "veg",              // "veg" or "non-veg"
  "price": 220,               // number only, ₹ added automatically
  "desc": "Grilled cottage cheese cubes…",
  "ingredients": ["Paneer (Cottage Cheese)", "Yogurt", "Bell Peppers"],
  "spicy": false,
  "popular": true,            // shows the "★ Popular" flag
  "img": "https://…jpg",
  "status": "active"          // "active" | "soldout" | "hidden"
}
```

- **Add a dish:** copy a block, change the values, keep the `section` id one of: `starters`, `main-course`, `pizza`, `burgers`, `pasta`, `drinks`, `desserts` (or add a new section — see below).
- **Remove a dish:** delete its block, or set `"status": "hidden"`.
- **Sold out today:** set `"status": "soldout"` — the card stays visible, greyed, price struck through.
- **New section:** add an entry to `"sections"` with `id`, `title`, `emoji`, `menus` (which menu-type tabs it appears in: any of `all lunch dinner bar`), and default `qty`/`serves`. Then give dishes that `section` id.
- Push the file to GitHub → Pages republishes → done. (The site fetches `menu.json` with a timestamp, so there's no stale-cache problem.)

⚠️ JSON is strict: a missing comma breaks the file (the site will then fall back to the embedded menu). Validate at https://jsonlint.com if unsure.

## Option B — Google Sheet (restaurant-owner-friendly) ⭐ recommended for clients

The owner edits a spreadsheet from their phone; the site reflects it. No JSON, no Git, no you.

### One-time setup (5 minutes)

1. Go to Google Sheets → create a blank sheet → **File → Import → Upload** → choose `menu-sheet-template.csv` (in this folder). You now have all 29 dishes as rows.
2. **File → Share → Publish to web** → in the dialog choose the sheet tab, format **Comma-separated values (.csv)** → Publish. Copy the link (it looks like `https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?output=csv`).
3. Open `menu.json`, paste that link into `"settings": { "sheetCsvUrl": "…" }`, push once.

From now on, **the sheet is the live menu**. Edits appear on the site within a few minutes (Google's publish cache) — no further pushes needed.

### Sheet columns

| Column | Values | Notes |
|--------|--------|-------|
| `section` | starters / main-course / pizza / burgers / pasta / drinks / desserts | lowercase, hyphenated. New section names auto-create a section. |
| `name` | text | required |
| `diet` | veg / non-veg | anything starting with "non" = non-veg |
| `price` | number | 220 (₹ is added by the site) |
| `desc` | text | one line shown under the name |
| `ingredients` | text separated by `\|` | e.g. `Paneer \| Yogurt \| Bell Peppers` — becomes the flip-card chips |
| `spicy` | yes / blank | shows 🌶 Spicy flag (if not popular) |
| `popular` | yes / blank | shows ★ Popular flag |
| `img` | image URL | any public image link |
| `status` | active / soldout / hidden | soldout = greyed + struck price; hidden = removed |

Rules of thumb for owners: **never rename the header row**, one dish per row, and to take something off the menu set `status` to `hidden` rather than deleting the row (easy to bring back).

### Section metadata

Section display names, emoji, menu-type tabs (`all lunch dinner bar`) and default portion pills (`qty`, `serves`) come from `menu.json → sections`. The sheet only supplies dishes. A `section` value in the sheet that isn't listed there still works — it renders with a title-cased name, no emoji, and appears in the All-Day tab.

---

## How it works (for the next developer)

- `menu-loader.js` runs on page load: fetch `menu.json` (cache-busted) → if `sheetCsvUrl` is set, fetch the CSV and **replace the dishes** (sections meta stays from menu.json) → render tabs + sections + cards → call `window.__initMenu()`.
- `script.js`'s original init was converted from a `DOMContentLoaded` listener into `window.__initMenu()` so it runs **after** the cards exist. All original features are untouched and verified working on the rendered DOM: search (name/desc/ingredients with auto-flip), Veg-only switch, flip cards, menu-type tabs (All-Day/Lunch/Dinner/Bar), scroll-spy category tabs, details modal on mobile, dark mode, back-to-top.
- The embedded `<script type="application/json" id="menu-embedded">` in `index.html` is the last-resort fallback (also what renders when opening the file directly from disk, where `fetch()` of local files is blocked). **If you change `menu.json` in a big way, regenerate this block to match** — or at least know it only serves as offline/failure fallback, so it can lag slightly behind.
- CSV parsing is built-in (quotes/commas/newlines handled) — no external libraries.
- Data fixes applied vs the old `menu-data.json`: section `menus` values were corrected to the shipped-demo truth (Bar = Pizza + Burgers + Drinks; pasta lunch+dinner; desserts dinner-only).

### Cache-busting

Current versions: `style.css?v=20260707-1`, `script.js?v=20260707-1`, `menu-loader.js?v=1`. **Bump these when you edit those files.** The menu data itself needs no version bump — it's fetched with a timestamp.

### Scaling to more restaurants (white-label)

Per client: copy this folder, replace `menu.json` (sections + dishes + their sheet URL), rebrand the CSS tokens/logo, deploy to its own folder/repo. One engine, many configs. Owners self-serve their menus via their own sheet.

---

## Testing checklist after any change

Serve locally (`python3 -m http.server`) — don't test `fetch` via `file://`. Verify: 29 (or expected) cards render; search "makhani" isolates Dal Makhani; Veg-only shows only veg; flip works; menu types show All=7 sections, Lunch=5, Dinner=6, **Bar=3 (pizza, burgers, drinks)**; no console errors; no horizontal overflow on mobile.
