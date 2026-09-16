/**
 * Per-page SEO / Open Graph configuration, consumed by scripts/build_seo.mjs
 * and scripts/build_sitemap.mjs.
 *
 * Keep titles ~60 chars and descriptions ~155 chars. Paths are the served URL
 * paths (no ".html"); the corresponding source file is inferred by appending
 * ".html" and rewriting "/" to "index.html".
 *
 * og:image points at a dedicated 1200×630 share card (DEFAULT_OG_IMAGE) served
 * from the site root so its URL stays stable across deploys.
 */

export const SITE_ORIGIN = "https://polysocial.cc";

// 1200×630 social share card (stable, root-level URL — not fingerprinted).
export const DEFAULT_OG_IMAGE = "/og-share.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = "Welcome to the creator economy — Polysocial";

const home = {
  path: "/",
  file: "index.html",
  priority: 1.0,
  title: "Polysocial — Turn Your Reach Into Revenue | Creator Campaigns",
  description: "Polysocial is a marketplace for performance-based creator campaigns. Brands launch campaigns and creators earn based on the real reach they generate.",
};

export const PAGES = [
  home,
  {
    path: "/creators", file: "creators.html", priority: 0.9,
    title: "For Creators — Get Paid For Your Reach | Polysocial",
    description: "Join open brand campaigns, create content you love, and earn based on the reach you generate. No follower minimums. Start earning with Polysocial.",
  },
  {
    path: "/brands", file: "brands.html", priority: 0.9,
    title: "For Brands — Launch Creator Campaigns | Polysocial",
    description: "Grow brand awareness and sales with performance-based creator campaigns. Pay for real reach, not just follower counts. Launch your campaign on Polysocial.",
  },
  {
    path: "/partner", file: "partner.html", priority: 0.8,
    title: "Partner With Polysocial — Grow Together",
    description: "Become a Polysocial partner and help brands and creators connect through performance-based campaigns. Explore partnership opportunities.",
  },
  {
    path: "/pricing", file: "pricing.html", priority: 0.8,
    title: "Pricing — Simple & Performance-Based | Polysocial",
    description: "Transparent Polysocial pricing: 10% creator commission and no platform fee for campaign owners. Pay for performance, nothing hidden.",
  },
  {
    path: "/linkedin-ugc-campaigns", file: "linkedin-ugc-campaigns.html", priority: 0.7,
    title: "LinkedIn UGC Campaigns — Reach Decision Makers | Polysocial",
    description: "Run performance-based UGC campaigns on LinkedIn with Polysocial. Build a community of professionals around your brand and reach the decision makers who matter.",
  },
  {
    path: "/about", file: "about.html", priority: 0.7,
    title: "Our Story — Monetizing Word-of-Mouth | Polysocial",
    description: "Polysocial connects brands, events, and public figures with creators through performance-based campaigns. Learn the story behind the platform.",
  },
  {
    path: "/download", file: "download.html", priority: 0.7,
    title: "Get the Polysocial App — Discover Campaigns",
    description: "Download the Polysocial app to browse open brand campaigns, submit content, and track your earnings. Start monetizing your reach today.",
  },
  // Articles — title/description are auto-generated from <h1> / first <p> if
  // omitted here. Listing them explicitly ensures build_seo.mjs processes them.
  // datePublished feeds BlogPosting JSON-LD; it mirrors the on-page byline date.
  { path: "/poverty-of-trust",      file: "poverty-of-trust.html",      article: true, priority: 0.6, datePublished: "2026-08-08" },
  { path: "/the-kumar-method",      file: "the-kumar-method.html",      article: true, priority: 0.6, datePublished: "2026-08-08" },
  { path: "/reach-vs-followers",    file: "reach-vs-followers.html",    article: true, priority: 0.6, datePublished: "2026-08-08" },
  { path: "/habibi-come-to-dubai",  file: "habibi-come-to-dubai.html",  article: true, priority: 0.6, datePublished: "2026-08-08" },
  { path: "/new-guy-in-town",       file: "new-guy-in-town.html",       article: true, priority: 0.6, datePublished: "2026-08-08" },
];

// Extra URLs included in sitemap.xml but not processed by build_seo.mjs
// (their <head> metadata is maintained by hand).
export const SITEMAP_EXTRA = [
  { path: "/privacy",       file: "privacy.html",       priority: 0.3 },
  { path: "/terms",         file: "terms.html",         priority: 0.3 },
  { path: "/data-deletion", file: "data-deletion.html", priority: 0.3 },
];

// JSON-LD Organization structured data (emitted on the homepage only).
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Polysocial",
  "url": SITE_ORIGIN,
  "logo": SITE_ORIGIN + "/favicon.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+94-77-254-0134",
    "email": "support@polysocial.cc",
    "contactType": "customer support",
    "areaServed": "LK",
    "availableLanguage": ["en"],
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "LK",
  },
};

// JSON-LD WebSite structured data (emitted on the homepage only). No
// SearchAction/sitelinks-searchbox is declared because the site has no on-site
// search endpoint; add `potentialAction` here once a /search?q= route exists.
export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Polysocial",
  "url": SITE_ORIGIN,
};

// Publisher block reused by article BlogPosting JSON-LD.
export const PUBLISHER_JSONLD = {
  "@type": "Organization",
  "name": "Polysocial",
  "logo": {
    "@type": "ImageObject",
    "url": SITE_ORIGIN + "/favicon.png",
  },
};

// Known image filenames whose alt attribute is missing / empty and what it
// should be. Applied to any <img> whose src ends with the given basename.
export const IMG_ALT_FIXES = {
  // Homepage: "How it works" phone screens
  "5d1cbb31.png": "Polysocial app screen showing an open campaign card",
  "41bef84a.jpg": "Creator recording content on a phone for a Polysocial campaign",
  "35f46895.jpg": "Reach analytics on the Polysocial creator dashboard",
  // Homepage: notification / earnings icons
  "d940bd53.png": "Polysocial notification avatar",
  "d20322b3.gif": "Animated illustration celebrating a creator payout",
  "72b4b917.gif": "Animated illustration of a phone showing a campaign",
  // Homepage: brand carousel avatars
  "2fb456f2.png": "Creator avatar",
  "a14a7902.png": "Creator avatar",
  "6776e340.png": "Creator avatar",
  // Campaign cards
  "campaign-moto.jpg": "Uber Moto rider in Colombo — Polysocial campaign artwork",
  "uber.png": "Uber logo",
};
