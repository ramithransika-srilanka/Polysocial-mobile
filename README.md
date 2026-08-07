# Polysocial Mobile

Landing page for **Polysocial Mobile**, exported from Figma and served as a
conventional, file-based static site with an image/video optimization pipeline.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The deployable page. References real, fingerprinted asset files (no base64 inlining). |
| `assets/` | **Generated, deployable.** Optimized, content-hashed images / video / fonts / JS. Safe to cache forever. |
| `src-assets/` | **Sources.** Raw originals (PNG/JPEG/MP4/WebM-less/GIF/woff2/SVG/JS) the pipeline reads from. Drop new images here. |
| `scripts/optimize.mjs` | The image/video pipeline (sharp + ffmpeg). Re-runnable. |
| `scripts/build_html.mjs` | Rewrites the page from the optimized assets (`<picture>`, `srcset`, posters, hashed URLs). |
| `scripts/extract_bundle.py` | One-time de-bundler that turned the original single-file Figma export into `src-assets/` + `build/page.raw.html`. |
| `asset-manifest.json` | Generated map of every source → its optimized outputs (dimensions, sizes, variants). |
| `.htaccess` | Apache cache headers (see **Caching**). |
| `design-context.html` | Figma design tokens / component structure. |

## How the optimization works

`scripts/optimize.mjs` reads `src-assets/{img,video,...}` and, for every raster
image, emits:

- **AVIF and WebP** at responsive widths (480 / 960 / 1440 / 1920 + native),
- an optimized same-format **fallback** (mozjpeg / palette PNG),
- **content-hashed filenames** (e.g. `hero-1.960w.a1b2c3d4e5.avif`) so they can
  be cached forever,
- **metadata stripped** from every output,
- visually-lossless quality (AVIF q82 / WebP q84).

Animated GIFs become **animated WebP** (with the GIF kept as a `<picture>`
fallback). Videos get a compressed **poster** (WebP + JPEG), a **VP9 WebM**
alternate, and a hashed copy of the original MP4. It prints before/after sizes
and is idempotent — re-running only re-encodes new or changed sources.

`scripts/build_html.mjs` then rewrites `build/page.raw.html` into `index.html`:

- every static `<img>` becomes a `<picture>` with AVIF → WebP → original
  fallback, `srcset` + `sizes`, intrinsic `width`/`height` (no layout shift),
  `decoding="async"`, and `loading="lazy"` for below-the-fold images;
- the above-the-fold hero video gets `preload="auto"`, a `poster`, WebM+MP4
  `<source>`s, and its poster is `<link rel="preload" … fetchpriority="high">`ed;
  other videos use `preload="metadata"`. All decorative videos are
  `muted playsinline loop`.

## Re-running the pipeline

```bash
npm install
npm run build      # optimize assets + rebuild index.html
npm run serve      # http://localhost:8099  (python3 -m http.server)
```

To add a new image: drop it in `src-assets/img/`, reference it in the page
source (`build/page.raw.html`) like the others, then `npm run build`.

## Caching

All of `assets/` is fingerprinted, so those files are immutable — cache them for
a year. `index.html` is not fingerprinted and must be revalidated so deploys
appear immediately.

- **Apache** — `.htaccess` (included) sets:
  - `assets/**` → `Cache-Control: public, max-age=31536000, immutable`
  - `*.html` → `Cache-Control: public, max-age=0, must-revalidate`
- **Nginx** — add:
  ```nginx
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html { add_header Cache-Control "public, max-age=0, must-revalidate"; }
  ```
- **Other hosts (Netlify/Vercel/S3+CloudFront/…)** — ask for the same two rules:
  a 1-year immutable cache for `/assets/*`, and no-cache / must-revalidate for
  HTML.
- **GitHub Pages** — note: GitHub Pages sends a fixed `Cache-Control: max-age=600`
  and does **not** let you override headers. Fingerprinting still helps (new
  filenames bust caches on deploy), but you won't get the 1-year `immutable`
  cache. For full control, serve `assets/` from a host/CDN where you can set
  headers.

## Verifying in the browser

Open DevTools → **Network** → filter **Img**, hard-reload (⌘/Ctrl-Shift-R):

- image responses should be **`avif`/`webp`** (Type column), not png/jpeg;
- scrolling should trigger below-the-fold images on demand (lazy loading);
- the **Size** column totals should be a fraction of the originals — image
  payload drops from **~13 MB to ~1.8 MB (≈86% smaller)**;
- switch the filter to **Media** to see the videos served as **WebM** with a
  poster showing instantly.

Total page transfer drops from the original **24 MB single file** (which blocked
rendering until fully downloaded) to **~4–5.6 MB** streamed on demand, with the
first paint after roughly half a megabyte.
