# 🏠 מכירת תכולת דירה — Moving Sale Page

A static, JSON-driven landing page (Hebrew, RTL) for selling household items, deployed on GitHub Pages.

## How it works

Everything on the page is driven by **`items.json`**. No build step — edit the JSON, commit, and GitHub Pages updates in ~30 seconds. You can edit it straight from github.com in the browser.

## Editing `items.json`

### Global settings (`config`)

| Field | What it does |
|---|---|
| `whatsapp` | Phone number for all WhatsApp buttons, international format without `+` (e.g. `972542460405`) |
| `title` / `subtitle` / `heroBadge` | Hero texts at the top of the page |
| `pickupInfo` | Pickup location/times line |
| `categoryEmojis` | Emoji shown on category chips and image placeholders |

### Bundles (group deals)

Some items sell better together. Define groups in the top-level `bundles` array:

```json
{ "id": "living-room", "name": "סט סלון מפנק", "items": [1, 2, 3], "price": 1450 }
```

- `items` lists the item `id`s in the group, `price` is the price for taking all of them together
- Every card in the group gets a "🎁 משתלם בסט!" strip naming the other items and the set price; the regular crossed-out total is computed automatically. Clicking the strip opens WhatsApp with a message about the whole set
- If **any** item in a bundle is sold, the strip disappears from the remaining items automatically
- An item can belong to one bundle

### Items

Each item in the `items` array:

```json
{
  "id": 41,
  "name": "שם הפריט",
  "description": "תיאור קצר עם אופי",
  "price": 250,
  "originalPrice": 800,
  "category": "סלון",
  "condition": "כמו חדש",
  "negotiable": true,
  "sold": false,
  "images": ["images/sofa-1.jpg", "images/sofa-2.jpg"]
}
```

- **Required:** `id`, `name`, `price`, `category`
- **Optional:** everything else. `originalPrice` shows a crossed-out price, `negotiable` adds a "גמישים במחיר" tag
- **Categories** and their chips/counts are derived automatically — use any category name you like
- **Sold an item?** Set `"sold": true` — it grays out, gets a "מצא בית חדש! 🎉" badge, and moves to the bottom
- **Photos:** drop files into the `images/` folder and list them in `images`. The first one shows on the card (click = full screen). No photo → a friendly emoji placeholder

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works; opening index.html directly via file:// won't load the JSON.)

## Deploy

GitHub Pages serves the `main` branch root. Push to `main` → live.
