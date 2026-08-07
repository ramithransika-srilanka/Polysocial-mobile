#!/usr/bin/env node
/**
 * Assembles the final, de-bundled, optimized index.html.
 *
 *   node scripts/build_html.mjs
 *
 * Consumes build/page.raw.html (de-bundled page), asset-manifest.json (from
 * optimize.mjs) and build/measure-by-file.json (rendered layout metrics) and:
 *   - rewrites every static <img> into a <picture> with AVIF + WebP + fallback,
 *     responsive srcset/sizes, intrinsic width/height, and loading/decoding
 *   - transforms <video> into poster + <source> WebM/MP4 with correct preload
 *   - fingerprints and rewires the JS (app, dc-runtime loader, React) so the
 *     loader points at local hashed React instead of unpkg.com
 *   - fingerprints fonts/SVGs and repoints every reference
 *   - preloads the hero poster
 *
 * Only <img>/<video> tags and asset URLs are touched; the framework's inline
 * scripts are left byte-for-byte intact.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "asset-manifest.json"), "utf8"));
// Rendered layout metrics (optional): refine sizes/loading when present.
let measure = {};
try { measure = JSON.parse(fs.readFileSync(path.join(ROOT, "build/measure-by-file.json"), "utf8")); }
catch { console.warn("build/measure-by-file.json not found — using layout heuristics."); }
let html = fs.readFileSync(path.join(ROOT, "build/page.raw.html"), "utf8");

const hash = (b) => createHash("sha1").update(b).digest("hex").slice(0, 10);
const rel = (p) => p; // manifest paths are already root-relative ("assets/..")
const byBase = {}; // basename("src-assets/img/x.png") -> manifest entry
for (const [k, v] of Object.entries(manifest)) byBase[path.basename(k)] = v;

// ---------------------------------------------------------------------------
// 1. JavaScript: fingerprint app + React, patch the dc-runtime loader.
// ---------------------------------------------------------------------------
const JS = path.join(ROOT, "src-assets/js");
const outJs = (buf, name) => {
  const h = hash(buf);
  const rp = `assets/js/${name}.${h}.js`;
  fs.mkdirSync(path.join(ROOT, "assets/js"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, rp), buf);
  return rp;
};
const reactPath = outJs(fs.readFileSync(path.join(JS, "20cb171d.js")), "react.production.min");
const reactDomPath = outJs(fs.readFileSync(path.join(JS, "f3b7616e.js")), "react-dom.production.min");

let loader = fs.readFileSync(path.join(JS, "bc41823b.js"), "utf8");
for (const s of ["https://unpkg.com/react@18.3.1/umd/react.production.min.js",
                 "src-assets/js/react.production.min.js"])
  loader = loader.split(s).join(reactPath);
for (const s of ["https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
                 "src-assets/js/react-dom.production.min.js"])
  loader = loader.split(s).join(reactDomPath);
const loaderPath = outJs(Buffer.from(loader), "dc-runtime");
const appPath = outJs(fs.readFileSync(path.join(JS, "aa41149c.js")), "app");

html = html.replace("src-assets/js/bc41823b.js", loaderPath)
           .replace("src-assets/js/aa41149c.js", appPath);

// ---------------------------------------------------------------------------
// 2. <img> -> <picture>
// ---------------------------------------------------------------------------
const HERO_RE = /creatorFrame/;
const hasAttr = (tag, name) => new RegExp(`\\b${name}\\s*=`).test(tag);
const getSrc = (tag) => (tag.match(/\bsrc="([^"]*)"/) || [])[1] || "";

function sizesFor(file, entry) {
  const m = measure[file];
  if (m) {
    const d = (m.desktop && m.desktop.dispW) || 0;
    const mo = (m.mobile && m.mobile.dispW) || d;
    if (d) return `(max-width: 640px) ${mo}px, ${d}px`;
  }
  if (HERO_RE.test(file)) return "100vw";
  return `${Math.min(entry.width, 1024)}px`;
}
const isAboveFold = (file) => {
  const m = measure[file];
  return !!(m && ((m.desktop && m.desktop.inVP) || (m.mobile && m.mobile.inVP)));
};

let pics = 0, gifs = 0, svgRepoint = 0;
html = html.replace(/<img\b[^>]*>/g, (tag) => {
  const src = getSrc(tag);
  const file = src.split("/").pop();
  const entry = byBase[file];
  if (src.includes("{{") || !entry) return tag; // React placeholder / unknown

  if (entry.type === "passthrough" && /\.svg$/.test(entry.path)) {
    svgRepoint++;
    let t = tag.replace(/\bsrc="[^"]*"/, `src="${entry.path}"`);
    if (!hasAttr(t, "loading")) t = t.replace(/<img\b/, `<img loading="lazy"`);
    if (!hasAttr(t, "decoding")) t = t.replace(/<img\b/, `<img decoding="async"`);
    return t;
  }

  const aboveFold = isAboveFold(file);
  // Creator hero stop-motion frames must load up-front (during the initial
  // loader screen) so the frames are already cached when the animation runs —
  // otherwise each frame fetches on first display and the swap stutters. They
  // load eagerly but without fetchpriority so they don't preempt the hero video.
  const isCreatorFrame = HERO_RE.test(tag);
  const eager = aboveFold || isCreatorFrame;
  const sizes = sizesFor(file, entry);
  // Build the fallback <img>: keep every original attribute, repoint src,
  // and add the loading/sizing hints if absent.
  let img = tag.replace(/\bsrc="[^"]*"/, `src="${entry.fallback}"`);
  const add = (name, val) => { if (!hasAttr(img, name)) img = img.replace(/<img\b/, `<img ${name}="${val}"`); };
  add("width", entry.width);
  add("height", entry.height);
  add("decoding", "async");
  add("loading", eager ? "eager" : "lazy");
  if (entry.type === "raster") add("sizes", sizes);
  if (aboveFold && entry.width >= 200 && entry.height >= 200) add("fetchpriority", "high");

  let sources = "";
  if (entry.type === "animated") {
    sources = `<source type="image/webp" srcset="${entry.webp}">`;
    gifs++;
  } else {
    const srcset = (map) => Object.entries(map).map(([w, p]) => `${p} ${w}w`).join(", ");
    sources =
      `<source type="image/avif" sizes="${sizes}" srcset="${srcset(entry.avif)}">` +
      `<source type="image/webp" sizes="${sizes}" srcset="${srcset(entry.webp)}">`;
    pics++;
  }
  return `<picture>${sources}${img}</picture>`;
});

// ---------------------------------------------------------------------------
// 3. <video> -> poster + <source> webm/mp4, correct attributes
// ---------------------------------------------------------------------------
const HERO_VIDEO = "0e94d45a"; // above-the-fold looping hero
let heroPosterPreload = "";
html = html.replace(/<video\b[^>]*>/g, (tag) => {
  const src = getSrc(tag);
  const file = src.split("/").pop() || "";
  const key = "src-assets/video/" + file;
  const entry = manifest[key];
  if (!entry || entry.type !== "video") return tag;
  const isHero = file.startsWith(HERO_VIDEO);

  let t = tag.replace(/\s*\bsrc="[^"]*"/, ""); // drop src -> use <source>
  const add = (name, val) => { if (!hasAttr(t, name)) t = t.replace(/<video\b/, `<video ${name}${val ? `="${val}"` : '=""'}`); };
  add("poster", entry.posterWebp || entry.posterJpg);
  // Hero video is preloaded during the dark loading screen (the loader waits
  // for it), so preload="auto". Below-the-fold videos preload="none" and are
  // fetched lazily by JS (IntersectionObserver) only when scrolled near.
  add("preload", isHero ? "auto" : "none");
  add("muted", "");         // required for autoplay; all these are decorative
  add("playsinline", "");
  add("loop", "");
  const sources = `<source src="${entry.webm}" type="video/webm"><source src="${entry.mp4}" type="video/mp4">`;
  if (isHero) heroPosterPreload =
    `\n  <link rel="preload" as="image" href="${entry.posterWebp || entry.posterJpg}" fetchpriority="high">`;
  return `${t}${sources}`;
});

// ---------------------------------------------------------------------------
// 4. Repoint remaining asset URLs: fonts (in @font-face), leftover SVGs, and
//    ext images that the inline app-script injects (single WebP, native width).
// ---------------------------------------------------------------------------
for (const [k, v] of Object.entries(manifest)) {
  if (v.type === "passthrough") html = html.split(k).join(v.path);      // fonts, svg
}
for (const [k, v] of Object.entries(manifest)) {
  if (v.type === "raster") {
    const widths = Object.keys(v.webp).map(Number);
    const best = v.webp[Math.max(...widths)];
    html = html.split(k).join(best); // any remaining reference (inline-script imgs)
  } else if (v.type === "animated") {
    html = html.split(k).join(v.webp);
  }
}

// ---------------------------------------------------------------------------
// 5. Head: preload the hero poster.
// ---------------------------------------------------------------------------
if (heroPosterPreload) html = html.replace("</head>", `${heroPosterPreload}\n</head>`);

fs.writeFileSync(path.join(ROOT, "index.html"), html);
console.log(`Built index.html: ${pics} <picture> images, ${gifs} animated (gif→webp), ${svgRepoint} svg repointed.`);
console.log(`JS: react=${reactPath} reactDom=${reactDomPath} loader=${loaderPath} app=${appPath}`);
const leftover = (html.match(/src-assets\//g) || []).length;
console.log(`Remaining "src-assets/" references (should be 0): ${leftover}`);
