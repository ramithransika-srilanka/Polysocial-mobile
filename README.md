# Polysocial Mobile

Landing page for **Polysocial Mobile**, exported from Figma and served as a
conventional, file-based static site with an image/video optimization pipeline.

## Layout

```
site/                  deployable static site — Netlify publishes ONLY this folder
  index.html, *.html   one file per page; the URL is the filename without .html
  campaigns/<name>/    one self-contained folder per campaign page (/campaigns/<name>)
  assets/              generated, content-hashed images / video / fonts / js / svg
  robots.txt, sitemap.xml, site.webmanifest, favicons, og-share.png
src-assets/            raw originals the pipeline reads from — drop new media here
scripts/               build pipeline (paths shared via scripts/paths.mjs)
build/                 intermediate artifacts (page.raw.html, asset-manifest.json, …)
netlify.toml           publish dir + cache headers for polysocial.cc
.github/workflows/      deploy-netlify.yml - deploys site/ on push to release-* (see Release)
.claude/skills/release/ the /release command for Claude Code
```

| Path | What it is |
| --- | --- |
| `site/index.html` | The home page. References real, fingerprinted asset files (no base64 inlining). |
| `site/campaigns/celeste/` | The Celeste campaign onboarding page, served at `/campaigns/celeste`. Vite build of [Campaign_onboarding](https://github.com/ramithransika-srilanka/Campaign_onboarding), built with `--base=/campaigns/celeste/` so assets resolve with or without the trailing slash. |
| `site/campaigns/carnage/` | The Carnage campaign onboarding page, served at `/campaigns/carnage`. A copy of the Celeste build with Carnage's logo, hero image and campaign copy swapped in (asset paths rewritten to `/campaigns/carnage/`). |
| `site/creator-map/celeste/` | The Celeste Daily creator community map, served at `/creator-map/celeste`. Self-contained page in the site's design system; the creator list lives in `data.js` (fields with no data yet are `null`); profile pictures go in `avatars/`. Marked `noindex`. |
| `site/creator-list/` | The creator list, served at `/creator-list`: a profile card for every creator on the Celeste map, with search, language, persona and tier filters and sorting. Reads the same `/creator-map/celeste/data.js` (and avatars), parked creators included. Each card has an Add to map / Remove from map button; `creator-map/celeste/roster.js` keeps those choices in the visitor's localStorage (data.js stays the default line-up for everyone else), and the map reads them, live across tabs. The list links to the map, but the map has no link back to the list. A creator with a `reels` file (`creator-map/celeste/reels/<name>.md`: a breakdown of their last 50 reels, topped by a "Persona tags" section citing the reels behind each tag) gets a "Reel breakdown" button that opens it in a side panel. Marked `noindex`. |
| `site/assets/` | **Generated, deployable.** Optimized, content-hashed images / video / fonts / JS. Safe to cache forever. |
| `src-assets/` | **Sources.** Raw originals (PNG/JPEG/MP4/GIF/woff2/SVG/JS) the pipeline reads from. Not deployed. |
| `scripts/optimize.mjs` | The image/video pipeline (sharp + ffmpeg). Re-runnable. |
| `scripts/build_html.mjs` | Rewrites `site/index.html` from the optimized assets (`<picture>`, `srcset`, posters, hashed URLs). |
| `scripts/build_seo.mjs` / `build_sitemap.mjs` | Per-page `<head>` SEO tags and `site/sitemap.xml`, driven by `scripts/seo-config.mjs`. |
| `scripts/extract_bundle.py` | One-time de-bundler that turned the original single-file Figma export into `src-assets/` + `build/page.raw.html`. |
| `scripts/release.sh` | Cuts the next `release-<version>(<build>)` branch and pushes it with `develop`/`main` (see **Release**). |
| `build/asset-manifest.json` | Generated map of every source → its optimized outputs (dimensions, sizes, variants). |

### Adding a campaign page

Put it in its own folder, `site/campaigns/<name>/index.html`; it is served at
`/campaigns/<name>`. Keep anything only that campaign uses (images, scripts)
inside the same folder so it can be updated or removed as one unit.

## How the optimization works

`scripts/optimize.mjs` reads `src-assets/{img,video,...}`, writes to `site/assets/` and, for every raster
image, emits:

- **AVIF and WebP** at responsive widths (480 / 960 / 1440 / 1920 + native),
- an optimized same-format **fallback** (mozjpeg / palette PNG),
- **content-hashed filenames** (e.g. `hero-1.960w.a1b2c3d4e5.avif`) so they can
  be cached forever,
- **metadata stripped** from every output,
- visually-lossless quality (AVIF q82 / WebP q84).

Animated GIFs become **animated WebP** (with the GIF kept as a `<picture>`
fallback). Every video is **re-encoded**, not just copied:

- **MP4 fallback** — H.264 **Main** profile, **CRF 26**, `+faststart` (playback
  starts before the full file downloads);
- **VP9 WebM** alternate (smaller still for browsers that accept it);
- a compressed **poster** (WebP + JPEG) from the first frame;
- **audio is stripped** (`-an`) — every video here is a silent, muted, looping
  background, so its audio track is dead weight;
- each rendition is **right-sized** to how big it renders on the page via the
  `VIDEO_TARGET_W` map in `optimize.mjs` (e.g. a 159 px card is encoded at 360p,
  not 720p). Videos not listed there default to `DEFAULT_VIDEO_W` (720p), so
  **new videos are optimized automatically**.

It prints before/after sizes and is idempotent — re-running only re-encodes new
or changed sources. The originals in `src-assets/video/` are never modified.

`scripts/build_html.mjs` then rewrites `build/page.raw.html` into `site/index.html`:

- every static `<img>` becomes a `<picture>` with AVIF → WebP → original
  fallback, `srcset` + `sizes`, intrinsic `width`/`height` (no layout shift),
  `decoding="async"`, and `loading="lazy"` for below-the-fold images;
- **hero** videos (listed in `HERO_VIDEOS` in `build_html.mjs`) get
  `preload="auto"`, a `poster`, WebM+MP4 `<source>`s, and a
  `<link rel="preload" … fetchpriority="high">`ed poster. The hero video is
  **buffered behind the dark loading screen** — the loader will not dismiss
  until it can play through (4 s minimum, 12 s safety cap);
- **every other** video gets `preload="none"` and is lazy: fetched and played
  only when it scrolls near the viewport. `#fanVideo` does this via its own
  fan-swap logic; any *future* below-the-fold video inherits the same behaviour
  automatically through the generic `_armLazyVideos()` observer — just drop it
  in with `preload="none"`. All decorative videos are `muted playsinline loop`.

### Adding a video

1. Drop the raw file in `src-assets/video/`.
2. Reference it in `build/page.raw.html` with a `<video>` tag (see `#fanVideo`).
3. (Optional) add its basename to `VIDEO_TARGET_W` to right-size it, and to
   `HERO_VIDEOS` if it's above the fold.
4. `npm run build`. It's re-encoded, right-sized, given a poster + WebM, and
   wired to the correct loading strategy with no further code.

## Re-running the pipeline

```bash
npm install
npm run build      # optimize assets + rebuild site/index.html
npm run serve      # http://localhost:8099  (serves site/)
```

To add a new image: drop it in `src-assets/img/`, reference it in the page
source (`build/page.raw.html`) like the others, then `npm run build`.

## Release

polysocial.cc is served by Netlify, and it only changes when a **release
branch** is pushed. Day-to-day work goes to `develop`; a release pins that
commit and deploys it.

### Branch model

| Branch | Purpose | Deploys? |
| --- | --- | --- |
| `develop` | Where work is committed. | No |
| `main` | Always the same commit as `develop`. | No |
| `release-<version>(<build>)` | One branch per release, cut from `develop`, e.g. `release-1.0.0(2)`. Old ones are kept for rollback. | **Yes**: every push deploys to Netlify production |

### Releasing with `/release` (Claude Code)

Open Claude Code in this repo and type:

```text
/release          # next build of the current version: release-1.0.0(1) -> release-1.0.0(2)
/release 1.1.0    # new version: release-1.1.0(1)
```

It then:

1. commits any uncommitted work to `develop` (it stops and asks if you're on another branch);
2. checks that every link/asset in `site/` resolves;
3. works out the next release name;
4. pushes the same commit to `develop`, `main` and the new release branch in
   one atomic push, so all three move together or none do;
5. waits for the **Deploy to Netlify (release)** workflow the push triggers;
6. checks the live site and reports the release name, commit, run link and result.

The command is defined in `.claude/skills/release/SKILL.md`.

### Releasing without Claude

The git part is a plain script. Commit your work to `develop` first:

```bash
scripts/release.sh --dry-run   # show what would be released and pushed
scripts/release.sh             # release-1.0.0(1) -> release-1.0.0(2)
scripts/release.sh 1.1.0       # release-1.1.0(1)
```

It refuses to release, and pushes nothing, when:

- the working tree has uncommitted changes;
- `main` has commits `develop` doesn't (merge them into `develop` first);
- local `develop` and `origin/develop` have diverged;
- nothing is new since the last release (to redeploy, see **Rollback / redeploy**).

### How the deploy works

- `.github/workflows/deploy-netlify.yml` runs on every push to a `release-*`
  branch and publishes `site/` to Netlify production, with the headers from
  `netlify.toml`. There is no build step: the committed HTML is what ships.
- `ignore = "exit 0"` in `netlify.toml` cancels every build Netlify would start
  from a git push, so pushes to `develop`/`main` never go live.
- Only `site/` is published. `scripts/`, `src-assets/`, `build/` and
  `package.json` are never served.

### Rollback / redeploy

Actions → **Deploy to Netlify (release)** → **Run workflow** → pick the release
branch (an older one to roll back, the current one to redeploy).

### One-time setup

A repo admin adds two **repository secrets** under Settings → Secrets and
variables → Actions (Secrets tab, not Variables, not an environment):

| Secret | Where to get it |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | Netlify → avatar → User settings → Applications → Personal access tokens → New access token |
| `NETLIFY_SITE_ID` | Netlify → the site → Site configuration → General → Site details → Site ID |

In Netlify's build settings, leave **Base directory** and **Build command** empty.

### Troubleshooting

- **`Missing repo secret NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID`**: the secrets
  above aren't set. Add them, then **Re-run jobs** on the failed run.
- **Push rejected**: someone pushed to `develop`/`main` in the meantime.
  Pull, then release again. The script never force-pushes.
- **`nothing new since release-…`**: `develop` has no commits since that
  release. Commit something first, or redeploy the existing release branch.

## Caching

All of `site/assets/` is fingerprinted, so those files are immutable — cached
for a year. HTML is not fingerprinted and is always revalidated so deploys
appear immediately.

- **Netlify** (polysocial.cc) — `netlify.toml` sets
  `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`; HTML keeps
  Netlify's default `max-age=0, must-revalidate`.

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
