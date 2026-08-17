# Birthday surprise website — Our Little Universe

Open `index.html` in any modern browser to preview the site.

**Locks:** Step 1 code `180627` · Step 2 word `sidwani` (any case)  
**Birthday:** 18 August 2000

**Bond reels:** Three videos in `assets/videos/`:
- `reel-1.mp4` — *Pehli yaadein / Ab tak ka hum*
- `reel-2.mp4` — *Beech ka safar*
- `reel-3.mp4` — *Aaj ka hum* (latest reel)

## Make it personal

- Edit `config.js` for names, messages, timeline, letter, and gift URL.
- Add photos in an `images` folder, then set the `image` field on matching items in `config.js` → `memories`.
- Add a local `.mp3` under `assets/` and set `music.src` in `config.js`.
- Bubu & Dudu GIFs are configured in `config.js` → `gifs` and `bubuMoments` (Tenor embed IDs).

## Put it online (Render — recommended)

This site has **no build step**. Render serves the files as-is from the repo root.

### Option A — Static Site (easiest)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Static Site**
2. Connect GitHub repo: `siddhhu/BirthdayWebsite`
3. Use these settings:

   | Setting | Value |
   |---------|--------|
   | **Branch** | `main` |
   | **Root Directory** | *(leave blank)* |
   | **Build Command** | `true` |
   | **Publish Directory** | `.` |

4. Click **Create Static Site**
5. Wait for deploy → you get a URL like `https://our-little-universe.onrender.com`

### Option B — Blueprint (`render.yaml`)

This repo includes `render.yaml`. To use it:

1. **New +** → **Blueprint**
2. Connect the same GitHub repo
3. Render reads `render.yaml` and creates the static site automatically

### After deploy

- Add a **Custom Domain** in Render site settings (optional)
- Push to `main` → Render auto-redeploys
- Test both locks: `180627` then `sidwani`
- Confirm photos load under `/assets/photos/website/`

### If deploy fails

- **Large repo / timeout:** ensure all photos are committed (`git ls-files assets | wc -l` should show ~98 files)
- **Blank page:** check browser console — paths must be relative (they are: `assets/...`, `config.js`, etc.)
- **Do not** add SPA rewrite rules (`/* → /index.html`) — this site uses hash links (`#memories`) and rewrites can break CSS/JS

### Other hosts

Netlify Drop, GitHub Pages, or Cloudflare Pages also work — upload all files including `assets/`.
