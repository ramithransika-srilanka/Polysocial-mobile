/**
 * Repo layout, shared by every build script.
 *
 *   site/        the deployable static site (Netlify publishes only this)
 *   src-assets/  raw originals the optimizer reads (never deployed)
 *   build/       intermediate build artifacts (never deployed)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const SITE = path.join(ROOT, "site");
export const SRC_ASSETS = path.join(ROOT, "src-assets");
export const BUILD = path.join(ROOT, "build");
export const ASSET_MANIFEST = path.join(BUILD, "asset-manifest.json");
