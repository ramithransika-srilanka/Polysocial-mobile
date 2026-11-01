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
  filterPersonas: ["Momfluencer", "Dadfluencer", "Lifestyle UGC creator"],
  creators: [
    {
      name: "Vindula Kolambage",
      handle: "viindula",
      photo: "avatars/vindula-kolambage.webp",
      platform: "Instagram",
      followers: 25000,
      cost: 64706,
      personas: ["Lifestyle UGC creator", "Consumer UGC creator", "Fashion creator"],
      reels: "reels/vindula-kolambage.md",
      styles: null,
      community: "Young professionals and aspiring creators in Colombo interested in branding, digital marketing and lifestyle content",
      age: "25–34",
      lifestyle: "Middle-income",
      location: "Colombo suburbs",
      gender: "Mixed",
      language: "Singlish"
    },
    {
      name: "Imasha Peiris",
      handle: "mitchie_imasha",
      photo: "avatars/imasha-peiris.webp",
      platform: "Instagram",
      followers: 23000,
      cost: 47059,
      personas: ["Momfluencer", "Lifestyle UGC creator", "Consumer UGC creator", "Medfluencer"],
      reels: "reels/imasha-peiris.md",
      styles: null,
      community: "Young mothers in Colombo navigating toddler care, breastfeeding, and balancing motherhood with work",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Chathuri Dahanayake",
      handle: "she_writes_a_diary",
      photo: "avatars/chathuri-dahanayake.webp",
      platform: "Instagram",
      followers: 23000,
      cost: 47059,
      personas: ["Momfluencer", "Lifestyle UGC creator", "Consumer UGC creator", "Travel Influencer"],
      reels: "reels/chathuri-dahanayake.md",
      styles: null,
      community: "Working mothers in Colombo balancing kids, travel and lifestyle content",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Ranshan Jude Gomez",
      handle: "ranshan15",
      photo: "avatars/ranshan-jude-gomez.webp",
      platform: "Instagram",
      followers: 26000,
      cost: 70588,
      personas: ["Padel player", "Lifestyle UGC creator", "Consumer UGC creator", "Fashion creator", "Restaurant reviewer", "Mukbang reviewer", "Dadfluencer", "Travel Influencer"],
      reels: "reels/ranshan-jude-gomez.md",
      styles: null,
      community: "Young dads in Colombo interested in food, family dining and lifestyle",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly men",
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
