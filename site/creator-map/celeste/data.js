/*
 * Creator map data for Celeste Daily (/creator-map/celeste).
 * Fields with no data yet are null.
 *
 * `photo` is a file in this folder (placeholder portraits for now); a
 * creator without one shows their initials instead.
 *
 * `name` is what the page shows; `handle` (the Instagram username, with or
 * without @) appears next to it as a link to their Instagram page.
 *
 * `cost` is what the creator charges for one Instagram reel, in Rs.
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
 * the creator is placed in the first band.
 */
window.CREATOR_MAP = {
  brand: "Celeste Daily",
  updated: "October 2026",
  creators: [
    {
      name: "Radeesha De Silva",
      handle: "radeeshaa",
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
      handle: "viindula",
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
      handle: "mitchie_imasha",
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
      handle: "dithiiiii",
      photo: "avatars/dithmini-de-silva.webp",
      platform: "Instagram",
      followers: 5900,
      cost: 15000,
      personas: ["Travel Influencer", "Restaurant reviewer", "Food critic", "Social runner"],
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
      cost: 40000,
      personas: ["Momfluencer", "Travel Influencer", "Consumer UGC creator"],
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
      cost: 10000,
      personas: ["Social runner", "Lifestyle runner"],
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
      handle: null,
      photo: "avatars/belinda-seneviratne.webp",
      platform: "Instagram",
      followers: 13000,
      cost: 60000,
      personas: ["Lifestyle runner", "Social runner", "Travel Influencer"],
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
      handle: null,
      photo: "avatars/shavi.webp",
      platform: "Instagram",
      followers: 4000,
      cost: 20000,
      personas: ["Consumer UGC creator", "Travel Influencer", "Petfluencer", "Social runner"],
      styles: null,
      community: "Young women in Colombo interested in soft life, self-love, Pilates, girl talk and wellness",
      age: "25–34",
      lifestyle: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Lelumi Jagoda",
      handle: null,
      photo: "avatars/lelumi-jagoda.webp",
      platform: "Instagram",
      followers: 7700,
      cost: 20000,
      personas: ["Restaurant reviewer", "Food critic", "Social runner"],
      styles: null,
      community: "Young women in Colombo suburbs romanticizing everyday fashion and lifestyle",
      age: "18–35",
      lifestyle: "Middle-income",
      location: "Colombo suburbs",
      gender: "Mostly women",
      language: "English"
    },
    {
      name: "Yasasi",
      handle: null,
      photo: null,
      platform: "Instagram",
      followers: 38000,
      cost: null,
      personas: ["Fitness coach", "Entrepreneur", "Social runner"],
      styles: null,
      community: "Young women in Colombo interested in motorsport, fitness and active lifestyle",
      age: "25–34",
      lifestyle: ["Middle-income", "Premium"],
      lean: "Middle-income",
      location: "Colombo city",
      gender: "Mostly women",
      language: "English"
    }
  ]
};
