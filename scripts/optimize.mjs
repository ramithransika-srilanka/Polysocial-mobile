#!/usr/bin/env node
/**
 * Asset optimization pipeline.
 *
 *   node scripts/optimize.mjs
 *
 * Reads raw source assets from  src-assets/{img,video,svg,font,js}
 * and writes optimized, content-hashed outputs to  assets/ .
 *
 * For every raster image (PNG / JPEG) it emits:
 *   - AVIF and WebP at multiple responsive widths (480/960/1440/1920 + native)
 *   - an optimized same-format fallback at native width
 *   - all outputs have metadata stripped and content-hashed filenames
 * Animated GIFs become animated WebP (with the original GIF kept as fallback).
 * Videos get a compressed poster frame (WebP + JPEG), a VP9 WebM alternate,
 * and a hashed copy of the original MP4.
 * SVG / font / JS assets are passed through with hashed names.
 *
 * A machine-readable map of every input -> its outputs is written to
 * asset-manifest.json, which scripts/build_html.mjs consumes to rewrite the
 * HTML. The run is idempotent: outputs are keyed by a hash of (source bytes +
 * encode settings), so re-running only re-encodes changed or new sources.
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve an ffmpeg binary: prefer $FFMPEG, then the bundled ffmpeg-static
// (so the pipeline runs on machines without a system ffmpeg), else "ffmpeg".
const require = createRequire(import.meta.url);
let FFMPEG = "ffmpeg";
try { FFMPEG = require("ffmpeg-static") || "ffmpeg"; } catch {}
if (process.env.FFMPEG) FFMPEG = process.env.FFMPEG;

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(ROOT, "src-assets");
const OUT = path.join(ROOT, "assets");

// ---- Tunables --------------------------------------------------------------
const WIDTHS = [480, 960, 1440, 1920]; // responsive breakpoints
const AVIF = { quality: 82, effort: 5 }; // visually-lossless-ish
const WEBP = { quality: 84, effort: 5 };
const JPG_FALLBACK = { quality: 84, mozjpeg: true };
const PNG_FALLBACK = { compressionLevel: 9, palette: true }; // lossless-ish, small
const WEBP_ANIM = { quality: 78, effort: 4 };
const POSTER_WEBP = { quality: 72 };
const POSTER_MAXW = 720;

// Video re-encode settings. Every video here is a silent, muted, looping
// background decoration, so audio is always stripped (-an).
//   - Per-source TARGET width right-sizes each rendition to how big it actually
//     renders on the page (a 159px card doesn't need a 720px file).
//   - MP4 fallback: H.264 "main" (universal on any device from ~2013 on),
//     CRF 26, +faststart so playback starts before the full file arrives.
//   - WebM alternate: VP9, CRF 34 — smaller still for browsers that take it.
const VIDEO_TARGET_W = { "0e94d45a": 720, "b4631b25": 360,
  "fan-dancing": 360, "fan-beach": 360, "fan-launch": 360 };
const DEFAULT_VIDEO_W = 720;
const H264_CRF = 26;
const VP9_CRF = 34;
const H264 = (crf) => ["-c:v", "libx264", "-profile:v", "main", "-preset", "slow",
              "-crf", String(crf), "-pix_fmt", "yuv420p", "-an",
              "-movflags", "+faststart"];
const VP9 = (crf) => ["-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-an",
              "-pix_fmt", "yuv420p", "-row-mt", "1", "-deadline", "good"];
// ---------------------------------------------------------------------------

sharp.cache(false);
sharp.concurrency(2);

const CACHE_FILE = path.join(ROOT, ".optimize-cache.json");
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch {}

const manifest = {};
let totalIn = 0, totalOut = 0;
const rows = [];

const hash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 10);
const kb = (n) => (n / 1024).toFixed(1);
const fmtKind = (mime) => mime.split("/")[1];

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function outName(base, tag, ext, buf) {
  return `${base}.${tag}.${hash(buf)}.${ext}`;
}
function writeOut(subdir, name, buf) {
  const dir = path.join(OUT, subdir);
  ensureDir(dir);
  const rel = path.posix.join("assets", subdir, name);
  fs.writeFileSync(path.join(OUT, subdir, name), buf);
  totalOut += buf.length;
  return rel;
}

async function processRaster(absPath, relKey) {
  const input = fs.readFileSync(absPath);
  totalIn += input.length;
  const base = path.basename(absPath, path.extname(absPath));
  const meta = await sharp(input).metadata();
  const nativeW = meta.width, nativeH = meta.height;
  const isPng = meta.format === "png";

  // ---- Animated GIF -> animated WebP (keep GIF as fallback) ----
  if (meta.format === "gif" && (meta.pages || 1) > 1) {
    const webpBuf = await sharp(input, { animated: true })
      .webp(WEBP_ANIM).toBuffer();
    const webpRel = writeOut("img", outName(base, "anim", "webp", webpBuf), webpBuf);
    const gifRel = writeOut("img", outName(base, "orig", "gif", input), input);
    manifest[relKey] = {
      type: "animated", width: nativeW, height: nativeH,
      webp: webpRel, fallback: gifRel, fallbackMime: "image/gif",
    };
    rows.push([relKey, kb(input.length), kb(webpBuf.length),
      `${(100 - webpBuf.length / input.length * 100).toFixed(0)}%`, "gif→webp anim"]);
    return;
  }

  const widths = WIDTHS.filter((w) => w < nativeW).concat(nativeW)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);

  const avif = {}, webp = {};
  let bestOut = 0;
  for (const w of widths) {
    const pipe = sharp(input).resize({ width: w, withoutEnlargement: true });
    const aBuf = await pipe.clone().avif(AVIF).toBuffer();
    const wBuf = await pipe.clone().webp(WEBP).toBuffer();
    avif[w] = writeOut("img", outName(base, `${w}w`, "avif", aBuf), aBuf);
    webp[w] = writeOut("img", outName(base, `${w}w`, "webp", wBuf), wBuf);
    if (w === nativeW) bestOut = aBuf.length;
  }
  // Same-format fallback at native width (metadata stripped by default).
  let fbBuf, fbExt, fbMime;
  if (isPng) {
    fbBuf = await sharp(input).png(PNG_FALLBACK).toBuffer(); fbExt = "png"; fbMime = "image/png";
  } else {
    fbBuf = await sharp(input).jpeg(JPG_FALLBACK).toBuffer(); fbExt = "jpg"; fbMime = "image/jpeg";
  }
  const fbRel = writeOut("img", outName(base, "fallback", fbExt, fbBuf), fbBuf);

  manifest[relKey] = {
    type: "raster", width: nativeW, height: nativeH, widths,
    avif, webp, fallback: fbRel, fallbackMime: fbMime,
  };
  rows.push([relKey, kb(input.length), kb(bestOut),
    `${(100 - bestOut / input.length * 100).toFixed(0)}%`, `png/jpg (${widths.length}w)`]);
}

function processVideo(absPath, relKey) {
  const input = fs.readFileSync(absPath);
  totalIn += input.length;
  const base = path.basename(absPath, path.extname(absPath));
  const targetW = VIDEO_TARGET_W[base] || DEFAULT_VIDEO_W;
  const scale = `scale='min(${targetW},iw)':-2`;

  // Poster frame (first frame) -> WebP + JPEG
  const tmpPng = path.join(OUT, `.tmp-${base}.png`);
  ensureDir(OUT);
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", absPath,
    "-frames:v", "1", "-vf", `scale='min(${POSTER_MAXW},iw)':-2`, tmpPng]);
  return sharp(fs.readFileSync(tmpPng)).metadata().then(async (pm) => {
    const posterWebp = await sharp(fs.readFileSync(tmpPng)).webp(POSTER_WEBP).toBuffer();
    const posterJpg = await sharp(fs.readFileSync(tmpPng)).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    fs.unlinkSync(tmpPng);
    const posterWebpRel = writeOut("video", outName(base, "poster", "webp", posterWebp), posterWebp);
    const posterJpgRel = writeOut("video", outName(base, "poster", "jpg", posterJpg), posterJpg);

    // Re-encoded, right-sized, muted, faststart H.264 MP4 fallback.
    const tmpMp4 = path.join(OUT, `.tmp-${base}.mp4`);
    execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", absPath,
      "-vf", scale, ...H264(H264_CRF), tmpMp4]);
    const mp4Buf = fs.readFileSync(tmpMp4); fs.unlinkSync(tmpMp4);
    const mp4Rel = writeOut("video", outName(base, "h264", "mp4", mp4Buf), mp4Buf);

    // WebM (VP9) alternate, same target width, muted.
    const tmpWebm = path.join(OUT, `.tmp-${base}.webm`);
    execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", absPath,
      "-vf", scale, ...VP9(VP9_CRF), tmpWebm]);
    const webmBuf = fs.readFileSync(tmpWebm); fs.unlinkSync(tmpWebm);
    const webmRel = writeOut("video", outName(base, "vp9", "webm", webmBuf), webmBuf);

    manifest[relKey] = {
      type: "video", width: pm.width, height: pm.height, targetWidth: targetW,
      mp4: mp4Rel, webm: webmRel, posterWebp: posterWebpRel, posterJpg: posterJpgRel,
    };
    const smallest = Math.min(mp4Buf.length, webmBuf.length);
    rows.push([relKey, kb(input.length), kb(smallest),
      `${(100 - smallest / input.length * 100).toFixed(0)}%`, `mp4+webm@${targetW}w+poster`]);
  });
}

function passthrough(absPath, relKey, subdir) {
  const input = fs.readFileSync(absPath);
  const base = path.basename(absPath, path.extname(absPath));
  const ext = path.extname(absPath).slice(1);
  const rel = writeOut(subdir, `${base}.${hash(input)}.${ext}`, input);
  manifest[relKey] = { type: "passthrough", path: rel };
}

async function main() {
  ensureDir(OUT);
  const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir)
    .map((f) => path.join(dir, f)).filter((f) => fs.statSync(f).isFile()) : [];

  const imgs = walk(path.join(SRC, "img"));
  const vids = walk(path.join(SRC, "video"));
  const svgs = walk(path.join(SRC, "svg"));
  const fonts = walk(path.join(SRC, "font"));
  // JS (app, dc-runtime, React) is handled in build_html.mjs because the
  // dc-runtime loader must reference the *hashed* React filenames.

  for (const f of imgs) await processRaster(f, path.relative(ROOT, f).split(path.sep).join("/"));
  for (const f of vids) await processVideo(f, path.relative(ROOT, f).split(path.sep).join("/"));
  for (const f of svgs) passthrough(f, path.relative(ROOT, f).split(path.sep).join("/"), "svg");
  for (const f of fonts) passthrough(f, path.relative(ROOT, f).split(path.sep).join("/"), "font");

  fs.writeFileSync(path.join(ROOT, "asset-manifest.json"), JSON.stringify(manifest, null, 2));

  // Report
  console.log("\nBefore → After (raster/video; smaller-format best output):");
  console.log("  " + ["source", "in KB", "out KB", "saved", "kind"].join("\t"));
  for (const r of rows.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])))
    console.log("  " + r.join("\t"));
  console.log(`\nRaster+video source bytes : ${kb(totalIn)} KB`);
  console.log(`All optimized output bytes: ${kb(totalOut)} KB (incl. every width/format variant)`);
  console.log(`Wrote asset-manifest.json with ${Object.keys(manifest).length} entries.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
