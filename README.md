# 🏠 מכירת חיסול ברמת גן — Moving Sale Page

A static, JSON-driven landing page (Hebrew, RTL) for selling household items, deployed on GitHub Pages.

**Live:** https://roussakov.github.io/sales-landing-page/

## How it works

Everything on the page is driven by **`items.json`**. No build step — edit the JSON, commit, push, and the site updates in ~1 minute. You can edit it straight from github.com in the browser. Nothing is cached (every asset URL is timestamped per page load), so changes appear immediately.

## Editing `items.json`

### Global settings (`config`)

| Field | What it does |
|---|---|
| `whatsapp` | Phone number for all WhatsApp buttons, international format without `+` (e.g. `972542460405`) |
| `title` / `subtitle` / `heroBadge` | Hero texts at the top of the page |
| `pickupInfo` | Pickup location/terms line |
| `freebies` | Optional. If present, shows a highlighted banner above the grid (e.g. free items for buyers). Delete the field to hide |
| `categoryEmojis` | Emoji shown on category chips and image placeholders |

### Items

```json
{
  "id": 66,
  "name": "שם הפריט",
  "description": "תיאור. דילים וכמויות נכנסים כאן, למשל: המחיר ליחידה — זוג ב־₪350",
  "price": 200,
  "originalPrice": 800,
  "category": "חדרי שינה",
  "condition": "מצב מצוין",
  "negotiable": true,
  "sold": false,
  "images": ["images/item.jpg"]
}
```

- **Required:** `id`, `name`, `price`, `category`. Everything else is optional
- `originalPrice` shows a crossed-out price anchor; `negotiable` adds a "גמישים במחיר" tag
- **Categories** and chip counts are derived automatically — use any category name (add an emoji for it in `categoryEmojis`)
- **Sold an item?** Set `"sold": true` — it grays out, gets a "מצא בית חדש! 🎉" badge, moves to the bottom, and the sold counter appears automatically
- **Multi-unit items and package deals** (e.g. 2 beds, a 3-scooter lot, a desk+chair+monitor set) are single listings: the card price is the headline price and the per-unit / per-component prices and deals go in the description. One listing per photo
- **Photos:** optimized JPEGs in `images/` (max 1400px). First image shows on the card, tap for full screen. iPhone HEIC photos must be converted and their EXIF orientation normalized to 1, or they may appear sideways in WhatsApp link previews

There is also an optional `bundles` array (cross-item "buy together" strips); currently unused since package deals are consolidated into single listings.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which **validates items.json** (a JSON typo can never take the site down) and deploys to GitHub Pages.

Requirements: repo public (or GitHub Pro), and **Settings → Pages → Source = GitHub Actions** (with "Deploy from a branch", GitHub's legacy pipeline publishes the site itself and rejects this workflow's deployments with a generic error). The workflow can also be run manually from the Actions tab.
