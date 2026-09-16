#!/usr/bin/env node
/**
 * Sitemap generator.
 *
 *   node scripts/build_sitemap.mjs
 *
 * Regenerates sitemap.xml from the URL list in seo-config.mjs (PAGES +
 * SITEMAP_EXTRA). Each <lastmod> is the file's last git commit date, so the
 * sitemap always reflects real edits instead of a hand-maintained date.
 * Falls back to today's date when git history is unavailable.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN, PAGES, SITEMAP_EXTRA } from "./seo-config.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TODAY = new Date().toISOString().slice(0, 10);

function gitLastModified(file) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${file}"`, {
      cwd: ROOT, stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : TODAY;
  } catch {
    return TODAY;
  }
}

function urlEntry({ path: p, file, priority }) {
  const loc = SITE_ORIGIN + (p === "/" ? "/" : p);
  const lastmod = gitLastModified(file);
  const prio = (priority ?? 0.5).toFixed(1);
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <priority>${prio}</priority>`,
    "  </url>",
  ].join("\n");
}

const entries = [...PAGES, ...SITEMAP_EXTRA].map(urlEntry).join("\n");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`Sitemap: wrote ${PAGES.length + SITEMAP_EXTRA.length} URLs to sitemap.xml`);
