/**
 * Per-page SEO / Open Graph configuration, consumed by scripts/build_seo.mjs.
 *
 * Keep titles ~60 chars and descriptions ~155 chars. Paths are the served URL
 * paths (no ".html"); the corresponding source file is inferred by appending
 * ".html" and rewriting "/" to "index.html".
 *
 * NOTE on og:image: for now we point every page at the site logo (SVG). A
 * dedicated 1200×630 PNG/JPG social card would be materially better — social
 * platforms prefer summary_large_image dimensions and many don't render SVG
 * previews. When such an image is added (assets/img/og-share-1200x630.png),
 * flip DEFAULT_OG_IMAGE below to point at it.
 */

export const SITE_ORIGIN = "https://polysocial.cc";

// TODO: replace with a dedicated 1200×630 share card at assets/img/og-share.png
export const DEFAULT_OG_IMAGE = "/favicon.png";

const home = {
  path: "/",
  file: "index.html",
  title: "Polysocial — Turn Your Reach Into Revenue | Creator Campaigns",
  description: "Polysocial is a marketplace for performance-based creator campaigns. Brands launch campaigns and creators earn based on the real reach they generate.",
};

export const PAGES = [
  home,
  {
    path: "/creators", file: "creators.html",
    title: "For Creators — Get Paid For Your Reach | Polysocial",
    description: "Join open brand campaigns, create content you love, and earn based on the reach you generate. No follower minimums. Start earning with Polysocial.",
  },
  {
    path: "/brands", file: "brands.html",
    title: "For Brands — Launch Creator Campaigns | Polysocial",
    description: "Grow brand awareness and sales with performance-based creator campaigns. Pay for real reach, not just follower counts. Launch your campaign on Polysocial.",
  },
  {
    path: "/partner", file: "partner.html",
    title: "Partner With Polysocial — Grow Together",
    description: "Become a Polysocial partner and help brands and creators connect through performance-based campaigns. Explore partnership opportunities.",
  },
  {
    path: "/pricing", file: "pricing.html",
    title: "Pricing — Simple & Performance-Based | Polysocial",
    description: "Transparent Polysocial pricing: 10% creator commission and no platform fee for campaign owners. Pay for performance, nothing hidden.",
  },
  {
    path: "/linkedin-ugc-campaigns", file: "linkedin-ugc-campaigns.html",
    title: "LinkedIn UGC Campaigns — Reach Decision Makers | Polysocial",
    description: "Run performance-based UGC campaigns on LinkedIn with Polysocial. Build a community of professionals around your brand and reach the decision makers who matter.",
  },
  {
    path: "/about", file: "about.html",
    title: "Our Story — Monetizing Word-of-Mouth | Polysocial",
    description: "Polysocial connects brands, events, and public figures with creators through performance-based campaigns. Learn the story behind the platform.",
  },
  {
    path: "/download", file: "download.html",
    title: "Get the Polysocial App — Discover Campaigns",
    description: "Download the Polysocial app to browse open brand campaigns, submit content, and track your earnings. Start monetizing your reach today.",
  },
  // Articles — title/description are auto-generated from <h1> / first <p> if
  // omitted here. Listing them explicitly ensures build_seo.mjs processes them.
  { path: "/poverty-of-trust",      file: "poverty-of-trust.html",      article: true },
  { path: "/the-kumar-method",      file: "the-kumar-method.html",      article: true },
  { path: "/reach-vs-followers",    file: "reach-vs-followers.html",    article: true },
  { path: "/habibi-come-to-dubai",  file: "habibi-come-to-dubai.html",  article: true },
  { path: "/new-guy-in-town",       file: "new-guy-in-town.html",       article: true },
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
