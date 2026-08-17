# Birthday surprise website — Our Little Universe

Open `index.html` in any modern browser to preview the site.

**Locks:** Step 1 code `180627` · Step 2 word `sidwani` (any case)  
**Birthday:** 18 August 2000

**Reels:** Add your two reel videos to `assets/videos/`:
- `reel-now.mp4` — plays when she picks the real one (you are the actual gift)
- `reel-soon.mp4` — teaser reel; full version drops later

## Make it personal

- Edit `config.js` for names, messages, timeline, letter, and gift URL.
- Add photos in an `images` folder, then set the `image` field on matching items in `config.js` → `memories`.
- Add a local `.mp3` under `assets/` and set `music.src` in `config.js`.
- Bubu & Dudu GIFs are configured in `config.js` → `gifs` and `bubuMoments` (Tenor embed IDs).

## Put it online

The site has no build step. Upload all files (including `assets/` and any `images/`) to Netlify Drop, GitHub Pages, or Vercel's static-site upload.
