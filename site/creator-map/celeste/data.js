/*
 * Creator map data for Celeste Daily (/creator-map/celeste).
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
  brand: "Celeste Daily",
  updated: "October 2026",
  filterPersonas: ["Momfluencer", "Dadfluencer", "Social runner", "Lifestyle runner", "Fitness coach"],
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
      name: "Dithmini De Silva",
      handle: "dithiiiii",
      photo: "avatars/dithmini-de-silva.webp",
      platform: "Instagram",
      followers: 5900,
      cost: 17647,
      personas: ["Travel Influencer", "Consumer UGC creator", "Lifestyle UGC creator", "Social runner"],
      reels: "reels/dithmini-de-silva.md",
      styles: null,
      community: "Young women in Colombo interested in travel diaries, restaurant finds and lifestyle moments",
      age: "25–34",
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
      name: "Kyle",
      handle: "_kyloooo_",
      photo: "avatars/kyle.webp",
      platform: "Instagram",
      followers: 5100,
      cost: 11765,
      personas: ["Social runner", "Lifestyle runner", "Lifestyle UGC creator"],
      reels: "reels/kyle.md",
      styles: null,
      community: "Young runners in Colombo interested in community runs, run clubs and run-rave culture",
      age: "18–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly men",
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
      name: "Shavi",
      handle: "iamshavi__",
      photo: "avatars/shavi.webp",
      platform: "Instagram",
      followers: 4000,
      cost: 23529,
      personas: ["Consumer UGC creator", "Self-love creator", "Restaurant reviewer", "Pilates creator", "Travel Influencer"],
      reels: "reels/shavi.md",
      styles: null,
      community: "Young women in Colombo interested in soft life, self-love, Pilates, girl talk and wellness",
      age: "25–34",
      lifestyle: "Middle-income",
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
      name: "Senodhi Gloria",
      handle: "senodeee",
      photo: "avatars/senodhi-gloria.webp",
      platform: "Instagram",
      followers: 11000,
      cost: 47059,
      personas: ["Nightlife creator", "Travel Influencer", "Lifestyle UGC creator", "Consumer UGC creator"],
      reels: "reels/senodhi-gloria.md",
      styles: null,
      community: "Young women in Colombo interested in women's road races, beach runs and corporate-girly lifestyle",
      age: "18–35",
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
      name: "Lelumi Jagoda",
      handle: "le.lumii",
      photo: "avatars/lelumi-jagoda.webp",
      platform: "Instagram",
      followers: 7700,
      cost: 23529,
      personas: ["Fashion creator", "Beauty creator", "Lifestyle UGC creator", "Consumer UGC creator", "Restaurant reviewer"],
      reels: "reels/lelumi-jagoda.md",
      styles: null,
      community: "Young women in Colombo suburbs romanticizing everyday fashion and lifestyle",
      age: "18–35",
      lifestyle: "Middle-income",
      location: "Colombo suburbs",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Shewan Jayaweera",
      handle: null,
      photo: null,
      platform: "Instagram",
      followers: 3000,
      cost: 17647,
      personas: ["Entrepreneur", "Luxury Lifestyle"],
      styles: null,
      community: "Young creators in Colombo interested in videography, fashion and comedy",
      age: "18–35",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly men",
      language: "English"
    },
    {
      name: "Haifa Hassan",
      handle: null,
      photo: "avatars/haifa-hassan.webp",
      platform: "Instagram",
      followers: 3700,
      cost: 47059,
      personas: ["Fitness coach", "Entrepreneur", "Luxury Lifestyle"],
      styles: null,
      community: "Young women in Colombo interested in modest activewear, rehab fitness and halal lifestyle",
      age: "25–44",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Udula Karawita",
      handle: null,
      photo: "avatars/udula-karawita.webp",
      platform: "Instagram",
      followers: 2400,
      cost: 35294,
      personas: ["Luxury Lifestyle", "Entrepreneur", "Fitness coach"],
      styles: null,
      community: "Young creators in Colombo interested in modelling, lifestyle and fitness",
      age: "18–35",
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
