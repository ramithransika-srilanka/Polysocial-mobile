/*
 * Creator map data for Flash Health (/creator-map/flashhealth).
 * Fields with no data yet are null.
 *
 * `photo` is a file in this folder; a
 * creator without one shows their initials instead.
 *
 * `name` is what the page shows; `handle` (the Instagram username, with or
 * without @) appears next to it as a link to their Instagram page.
 *
 * `cost` is the price a brand pays for one Instagram reel from the creator,
 * in Rs., inclusive of the Polysocial fees.
 *
 * `personas` and `styles` (content creation style) are lists: a creator can
 * carry several tags in each.
 *
 * `age` is one band (e.g. 25–34) or a range across bands (e.g. 25–44).
 *
 * `lifestyle` (or `location`) is one band, or two bands in a list when the
 * audience sits between them, e.g. ["Middle-income", "Premium"]; `lean` then
 * names the band they are closer to.
 *
 * Each value in age / gender / location / lifestyle / personas / language /
 * tone must match one of the options listed in index.html (OPT), otherwise
 * the creator is placed in the first band. *
 * `filterPersonas` lists the persona tags offered as filters for this brand.
 * Creators keep all their personas, which still show on their profile.
 *
 * `reels` is a Markdown file in reels/ breaking down the creator's last 50
 * reels (or all of them, if they have fewer), opened from the creator list. Its "Persona tags" section lists the
 * reels behind each tag in `personas`; keep the two in step.
 *
 * `parked` holds creators taken off the map for now; the page ignores it.
 */
window.CREATOR_MAP = {
  brand: "Flash Health",
  updated: "October 2026",
  filterPersonas: ["Social runner", "Gymfluencer", "Pilates creator"],
  creators: [
    {
      name: "Radeesha De Silva",
      handle: "radeeshaa",
      photo: "avatars/radeesha-de-silva.webp",
      platform: "Instagram",
      followers: 52000,
      cost: 52941,
      personas: ["Restaurant reviewer", "Food critic", "Mukbang reviewer", "Consumer UGC creator", "Lifestyle UGC creator", "Homecook", "Travel Influencer"],
      reels: "reels/radeesha-de-silva.md",
      styles: null,
      community: "Young Sri Lankans in Colombo interested in gym routines, affordable food finds and relatable lifestyle content",
      age: "25–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Belinda Seneviratne",
      handle: "belinda_seneviratne",
      photo: "avatars/belinda-seneviratne.webp",
      platform: "Instagram",
      followers: 13000,
      cost: 70588,
      personas: ["Long-distance walker", "Trail hiker", "Lifestyle runner", "Travel Influencer", "Beauty creator", "Social runner", "Lifestyle UGC creator", "Consumer UGC creator"],
      reels: "reels/belinda-seneviratne.md",
      styles: null,
      community: "Young women in Colombo interested in walking, running, hiking and sustainable active lifestyle",
      age: "25–45",
      lifestyle: ["Middle-income", "Premium"],
      lean: "Premium",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Yasasi",
      handle: "ya_sassy",
      photo: "avatars/yasasi.webp",
      platform: "Instagram",
      followers: 38000,
      cost: 94118,
      personas: ["Gymfluencer", "Fashion creator", "Consumer UGC creator", "Motorsport creator"],
      reels: "reels/yasasi.md",
      styles: null,
      community: "Young women in Colombo interested in motorsport, fitness and active lifestyle",
      age: "25–34",
      lifestyle: ["Middle-income", "Premium"],
      lean: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Nivini Balachandra",
      handle: "nivinibalachandra",
      photo: "avatars/nivini-balachandra.webp",
      platform: "Instagram",
      followers: 7800,
      cost: 47059,
      personas: ["Fashion creator", "Beauty creator", "Pilates creator", "Lifestyle UGC creator", "Consumer UGC creator"],
      reels: "reels/nivini-balachandra.md",
      styles: null,
      community: "Young women in Colombo interested in fashion entrepreneurship, nightlife and fitness",
      age: "18–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Haifa Hassan",
      handle: "haifah14.hh",
      photo: "avatars/haifa-hassan.webp",
      platform: "Instagram",
      followers: 3700,
      cost: 47059,
      personas: ["Gymfluencer", "Consumer UGC creator", "Fashion creator", "Recipe creator", "Lifestyle UGC creator"],
      reels: "reels/haifa-hassan.md",
      styles: null,
      community: "Young women in Colombo interested in modest activewear, rehab fitness and halal lifestyle",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    }
  ],
  // Off the map for now but kept for later. The page only reads `creators`;
  // to bring someone back, move their entry into that list.
  parked: []
};
