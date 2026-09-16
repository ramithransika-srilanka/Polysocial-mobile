#!/usr/bin/env node
/**
 * SEO / meta post-processor.
 *
 *   node scripts/build_seo.mjs
 *
 * Runs AFTER build_html.mjs (and after any hand-authored HTML has been shipped
 * to the site root). For every page listed in seo-config.mjs it rewrites the
 * <head> so the served HTML always carries:
 *
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical" href="https://polysocial.cc/<path>">
 *   - Open Graph: og:title, og:description, og:type, og:url, og:image, og:site_name
 *   - Twitter Card: summary_large_image, twitter:title, twitter:description, twitter:image
 *   - Homepage only: JSON-LD Organization structured data
 *
 * It also:
 *   - Demotes any duplicate <h1> on the homepage so exactly one <h1> remains
 *     per page (Google/SEO expects one). Extras become <div role="heading"
 *     aria-level="1"> so the visual styling is preserved.
 *   - Fills in missing / empty alt attributes for known image basenames listed
 *     in seo-config.IMG_ALT_FIXES.
 *   - Adds loading="lazy" decoding="async" to any <img> below the fold that
 *     doesn't already have them (build_html.mjs already handles this for the
 *     images it rewrites into <picture>; this catches straggler <img> tags in
 *     hand-authored article pages).
 *
 * The transform is idempotent: existing SEO tags managed by us are replaced,
 * so re-running the script converges. Markers around each block let us tell
 * our tags from any others that were already there.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_ORIGIN, DEFAULT_OG_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, OG_IMAGE_ALT,
  PAGES, ORGANIZATION_JSONLD, IMG_ALT_FIXES,
} from "./seo-config.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const START = "<!-- SEO:START (managed by scripts/build_seo.mjs — do not edit by hand) -->";
const END   = "<!-- SEO:END -->";
const H1_MARK = "data-seo-h1-demoted";
const ALT_MARK = "data-seo-alt";

const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const stripTags = (s) => s.replace(/<[^>]+>/g, "");

// Take the first `n` characters ending on a word boundary; append "…" if trimmed.
function clip(text, n) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const soft = cut.replace(/[\s.,;:!?]+[^\s.,;:!?]*$/, "").trim();
  return (soft.length > 40 ? soft : cut.trim()) + "…";
}

function autoTitleAndDesc(html) {
  const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "";
  const title = stripTags(h1).replace(/\s+/g, " ").trim();
  // First paragraph inside <article> or <main>, falling back to any <p>.
  const scoped = (html.match(/<(?:article|main)\b[\s\S]*?<\/(?:article|main)>/i) || [""])[0] || html;
  const p = (scoped.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || "";
  const desc = clip(stripTags(p), 155);
  return { title, desc };
}

function renderSeoBlock(page, absoluteUrl, effectiveTitle, effectiveDesc) {
  const og = SITE_ORIGIN + DEFAULT_OG_IMAGE;
  const jsonLd = page.path === "/"
    ? `\n  <script type="application/ld+json">${JSON.stringify(ORGANIZATION_JSONLD)}</script>`
    : "";
  return [
    START,
    `  <title>${esc(effectiveTitle)}</title>`,
    `  <meta name="description" content="${esc(effectiveDesc)}">`,
    `  <link rel="canonical" href="${esc(absoluteUrl)}">`,
    `  <meta property="og:type" content="${page.article ? "article" : "website"}">`,
    `  <meta property="og:site_name" content="Polysocial">`,
    `  <meta property="og:title" content="${esc(effectiveTitle)}">`,
    `  <meta property="og:description" content="${esc(effectiveDesc)}">`,
    `  <meta property="og:url" content="${esc(absoluteUrl)}">`,
    `  <meta property="og:image" content="${esc(og)}">`,
    `  <meta property="og:image:width" content="${OG_IMAGE_WIDTH}">`,
    `  <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">`,
    `  <meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${esc(effectiveTitle)}">`,
    `  <meta name="twitter:description" content="${esc(effectiveDesc)}">`,
    `  <meta name="twitter:image" content="${esc(og)}">`,
    `  <meta name="twitter:image:alt" content="${esc(OG_IMAGE_ALT)}">`,
    jsonLd,
    END,
  ].join("\n").replace(/\n{2,}/g, "\n");
}

// Strip any prior SEO tags we might replace, so re-running is idempotent.
// Removes: our managed block; any bare <title>; any <meta name="description">;
// any canonical link; any og:/twitter: meta; any Organization JSON-LD.
function stripExistingSeo(html) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  html = html.replace(new RegExp(`${esc(START)}[\\s\\S]*?${esc(END)}\\s*`, "g"), "");
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/gi, "");
  html = html.replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/\s*<meta\s+(?:property|name)=["'](?:og|twitter):[^"']+["'][^>]*>/gi, "");
  html = html.replace(
    /\s*<script\s+type=["']application\/ld\+json["'][^>]*>\s*\{[^<]*"@type"\s*:\s*"Organization"[\s\S]*?<\/script>/gi,
    "",
  );
  return html;
}

// Insert the SEO block right after <meta name="viewport" ...> (or, failing
// that, right after <meta charset>) so it lands in the head next to the other
// document-level metadata.
function insertSeoBlock(html, block) {
  const viewport = /<meta\s+name=["']viewport["'][^>]*>/i;
  const charset  = /<meta\s+charset=[^>]*>/i;
  if (viewport.test(html)) return html.replace(viewport, (m) => `${m}\n${block}`);
  if (charset.test(html))  return html.replace(charset,  (m) => `${m}\n${block}`);
  return html.replace(/<head\b[^>]*>/i, (m) => `${m}\n${block}`);
}

// Homepage-only: keep the first <h1>, demote every subsequent <h1> to
// <div role="heading" aria-level="1"> so styling stays but SEO sees one H1.
function dedupeH1(html) {
  let seen = false;
  return html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/g, (m, attrs, inner) => {
    if (!seen) { seen = true; return m; }
    return `<div role="heading" aria-level="1" ${H1_MARK}${attrs}>${inner}</div>`;
  });
}

// For any <img> whose src basename is in IMG_ALT_FIXES, ensure alt is set to
// the mapped value. Empty alt="" (decorative) is treated as "needs fill" only
// when we have a fix for it.
function fillMissingAlts(html) {
  // Build a lookup keyed by the leading token of each configured filename, so
  // "d940bd53.png" matches both the original and the hashed "d940bd53.fallback.<h>.png".
  const byToken = {};
  for (const [k, v] of Object.entries(IMG_ALT_FIXES)) {
    byToken[k.split(".")[0]] = v;
    byToken[k] = v; // exact matches too
  }
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = (tag.match(/\bsrc=["']([^"']+)["']/) || [])[1] || "";
    const base = src.split("/").pop() || "";
    const fix = byToken[base] || byToken[base.split(".")[0]];
    if (!fix) return tag;
    const altMatch = tag.match(/\balt=["']([^"']*)["']/);
    if (altMatch && altMatch[1].trim()) return tag; // already has meaningful alt
    if (altMatch) {
      return tag.replace(/\balt=["'][^"']*["']/, `alt="${esc(fix)}" ${ALT_MARK}=""`);
    }
    return tag.replace(/<img\b/, `<img alt="${esc(fix)}" ${ALT_MARK}=""`);
  });
}

// Add loading="lazy" decoding="async" to <img> tags missing them. Skip the
// first `eagerCount` images (assumed above the fold).
function addLazyDefaults(html, eagerCount = 3) {
  let seen = 0;
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    seen++;
    let t = tag;
    const hasLoading = /\bloading\s*=/.test(t);
    const hasDecoding = /\bdecoding\s*=/.test(t);
    if (!hasLoading && seen > eagerCount) t = t.replace(/<img\b/, `<img loading="lazy"`);
    if (!hasDecoding) t = t.replace(/<img\b/, `<img decoding="async"`);
    return t;
  });
}

function processPage(page) {
  const abs = path.join(ROOT, page.file);
  if (!fs.existsSync(abs)) {
    console.warn(`  [skip] ${page.file} — not found`);
    return;
  }
  let html = fs.readFileSync(abs, "utf8");
  const original = html;

  // 1. Resolve title / description (config wins, else auto from H1/first <p>).
  let title = page.title;
  let desc = page.description;
  if ((!title || !desc) && page.article) {
    const auto = autoTitleAndDesc(html);
    if (!title) title = `${auto.title} | Polysocial`;
    if (!desc)  desc  = auto.desc;
  }
  if (!title) title = "Polysocial";
  if (!desc)  desc  = "Polysocial — a marketplace for performance-based creator campaigns.";

  const url = SITE_ORIGIN + page.path;

  // 2. Strip any old SEO tags we manage, then inject the fresh block.
  html = stripExistingSeo(html);
  html = insertSeoBlock(html, renderSeoBlock(page, url, title, desc));

  // 3. Homepage: one H1 only. The mobile/desktop hero both mark up as <h1>
  //    for accessibility, but only one is visible; demote the extras.
  if (page.path === "/") html = dedupeH1(html);

  // 4. Fill missing alt text for known image slots.
  html = fillMissingAlts(html);

  // 5. Straggler <img> tags: add lazy/async defaults if missing. Article pages
  //    already do this by hand; this is a safety net.
  html = addLazyDefaults(html);

  if (html !== original) {
    fs.writeFileSync(abs, html);
    console.log(`  wrote ${page.file}  (title="${title.slice(0, 60)}${title.length > 60 ? "…" : ""}")`);
  } else {
    console.log(`  ok    ${page.file}  (no changes)`);
  }
}

console.log("SEO / meta pass:");
for (const page of PAGES) processPage(page);
console.log(`Done: processed ${PAGES.length} pages.`);
