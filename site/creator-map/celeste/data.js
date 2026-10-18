/*
 * Creator map data for Celeste Daily (/creator-map/celeste).
 * Fields with no data yet are null.
 *
 * `photo` is a file in this folder (placeholder portraits for now); a
 * creator without one shows their initials instead.
 *
 * `name` is what the page shows; `handle` is kept for reference only.
 *
 * `cost` is what the creator charges for one Instagram reel, in Rs.
 *
 * `personas` and `styles` (content creation style) are lists: a creator can
 * carry several tags in each.
 *
 * `age` is one band (e.g. 25–34) or a range across bands (e.g. 25–44).
 *
 * Each value in age / gender / location / lifestyle / personas / language /
 * tone must match one of the options listed in index.html (OPT), otherwise
 * the creator is placed in the first band.
 */
window.CREATOR_MAP = {
  brand: "Celeste Daily",
  updated: "October 2026",
  creators: [
    {
      name: "Radeesha De Silva",
      handle: null,
      photo: "avatars/radeesha-de-silva.webp",
      platform: "Instagram",
      followers: 52000,
      cost: 45000,
      personas: ["Fitness coach", "Food critic", "Restaurant reviewer", "Mukbang reviewer"],
      styles: null,
      community: "Young Sri Lankans in Colombo interested in gym routines, affordable food finds and relatable lifestyle content",
      age: "25–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Vindula Kolambage",
      handle: null,
      photo: "avatars/vindula-kolambage.webp",
      platform: "Instagram",
      followers: 25000,
      cost: 55000,
      personas: ["Consumer UGC creator", "Travel Influencer", "Lifestyle UGC creator"],
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
      handle: null,
      photo: "avatars/imasha-peiris.webp",
      platform: "Instagram",
      followers: 23000,
      cost: 40000,
      personas: ["Momfluencer", "Consumer UGC creator", "Medfluencer"],
      styles: null,
      community: "Young mothers in Colombo navigating toddler care, breastfeeding, and balancing motherhood with work",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Dithmini De Silva",
      handle: null,
      photo: null,
      platform: "Instagram",
      followers: 5900,
      cost: null,
      personas: ["Travel Influencer", "Restaurant reviewer", "Food critic", "Social runner"],
      styles: null,
      community: "Young women in Colombo interested in travel diaries, restaurant finds and lifestyle moments",
      age: "25–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    }
  ]
};
