#!/usr/bin/env node
// One-off seed script: inserts the characters from the old root-based
// prototype into the new Supabase-backed, sound/tone-grouped schema.
// Safe to re-run — uses upsert on (character, sound_base, tone).
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
// (e.g. via a .env.local loaded with `node --env-file=.env.local`).

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Run with:\n" +
      "  node --env-file=.env.local scripts/migrate-json-to-db.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, key);

// { character, pinyin (numbered), meaning, definition, memory_trick, examples }
const seed = [
  {
    character: "侯",
    pinyin: "hou2",
    meaning: "marquis; nobleman (archaic title)",
    definition:
      "侯 originally depicted an archer shooting at a target, later borrowed for a feudal noble title. As a phonetic component it lends the \"hou\" sound to a family of characters, often combined with a semantic radical that narrows the meaning (人/亻 for people-related, 犭 for animals, 口 for mouth/speech, etc.).",
    memory_trick: "",
    examples: [],
  },
  {
    character: "候",
    pinyin: "hou4",
    meaning: "to wait; time; season; to inquire after",
    definition:
      "Lovely character to pick apart, because 候 looks scattered — time, climate, waiting, greetings, migratory birds, symptoms, candidates — and it all collapses into one image once you see what the writing depicts. The core is: a sentinel on watch, observing for signs and awaiting the right moment. Everything radiates from watching-and-waiting.\n\nWhat the writing shows. 候 is 亻 (person) beside a component built around 矢 (arrow) under a screen/shelter — the same core as 侯 (hóu, \"marquis\"), which originally depicted an archery target and, by extension, the frontier lord who commanded the archers. 候 takes that watcher-at-the-frontier image and puts a person (亻) explicitly on it: a lookout, a scout, someone posted to watch and wait. The most transparent surviving fossil of this is 斥候 chìhòu — \"a scout,\" a military lookout. So at root, 候 = a person keeping watch.\n\nNow trace every meaning out of \"keep watch and await\":\n\nTo wait / await — the most direct sense. 等候 (wait), 守候 (keep vigil), 候车 (wait for a train), 候选 (await selection → candidate, one awaiting being chosen), 候补 (await filling in → alternate/reserve). A sentinel's essence is waiting, so this cluster is 候 at its most literal.\n\nTo watch for signs — a lookout doesn't just wait, he reads the signs. So 候 comes to mean the observed indications of something: 症候 (symptoms — the watched signs of illness), 火候 (the watched heat in cooking → the right moment/degree), and — see below — 气候.\n\nThe observed moment in time — what a watcher is waiting for is the right time, so 候 becomes \"the moment\": 时候 (time, the awaited point), and 候 alone in old texts meaning a period.\n\nSeasonal timing — and here the writing pays off beautifully. In the traditional calendar, the year was divided into 节气 (24 solar terms, 气) and, more finely, into 候 — units of five days (五天为一候，三候为一气: three pentads make one solar term, 72 候 in a year). A 候 was literally a watched unit of seasonal change. So 气候 is not a vague compound — it's 气 (solar terms) + 候 (five-day pentads) = the calendar-units of seasonal change → climate. The \"watching for seasonal signs\" sense is baked into the word's history. And 候鸟 (migratory bird) falls straight out: birds that move by the season's timing → creatures of the 候.\n\nTo attend to someone's state — a natural extension of \"observe/watch over\": 问候 (to inquire after, send regards) is literally observing how someone is doing → greetings.\n\nThe proof-chain, compressed: person-on-watch (斥候) → waits (等候) → watches for signs (症候, 火候) → the awaited moment (时候) → the seasonal units watched (气候, 候鸟) → attending to another's state (问候). One image — a sentinel reading signs and awaiting the moment — generates all seven.\n\nGrammatical slot: almost always the second character in a compound, carrying the \"time/moment/waiting\" weight (时候, 气候, 火候), or the head verb \"wait\" in 等候/守候. Rarely stands alone in modern Chinese except in set terms.\n\nDeduce (cover and reason): 候教 — 候 \"await\" + 教 \"instruction\" → \"await your instruction\" → a polite formal \"I await your guidance / at your service.\" You can reason it purely from the watch-and-await root without having seen it.\n\nOne clean contrast to lock it in: don't confuse 候 hòu (watch/await) with its near-twin 侯 hóu (marquis) — same origin, one stroke apart, but 侯 kept the nobleman branch (the lord who commanded the archers) while 候 took the sentinel branch (the man who watches for him). The arrow in both tells you they're family; the extra stroke marks the split.",
    memory_trick:
      "候 hòu → the sentinel's \"HO! — who goes there?\" — the lookout on watch, challenging and waiting. Sound-to-watcher.",
    examples: [
      { word: "等候", pinyin: "děng hòu", meaning: "to wait" },
      { word: "气候", pinyin: "qì hòu", meaning: "climate" },
    ],
  },
  {
    character: "猴",
    pinyin: "hou2",
    meaning: "monkey",
    definition: "",
    memory_trick: "",
    examples: [
      { word: "猴子", pinyin: "hóu zi", meaning: "monkey" },
      { word: "猕猴", pinyin: "mí hóu", meaning: "macaque" },
    ],
  },
  {
    character: "喉",
    pinyin: "hou2",
    meaning: "throat",
    definition: "",
    memory_trick: "",
    examples: [
      { word: "喉咙", pinyin: "hóu lóng", meaning: "throat" },
      { word: "咽喉", pinyin: "yān hóu", meaning: "throat; a vital passage" },
    ],
  },
  {
    character: "青",
    pinyin: "qing1",
    meaning: "blue-green; young; nature's fresh color",
    definition:
      "青 depicts a young plant (生) growing above a well or dye vat, and originally referred to the blue-green color of nature. As a phonetic component it gives many characters the \"qing\" sound, with the added radical narrowing the sense: 言/讠 for speech, 氵 for water, 忄 for emotion, 日 for sun/weather, 米 for rice/essence.",
    memory_trick: "",
    examples: [],
  },
  {
    character: "请",
    pinyin: "qing3",
    meaning: "to request; please; to invite",
    definition: "",
    memory_trick: "",
    examples: [
      { word: "请问", pinyin: "qǐng wèn", meaning: "excuse me; may I ask" },
      { word: "邀请", pinyin: "yāo qǐng", meaning: "to invite" },
    ],
  },
  {
    character: "清",
    pinyin: "qing1",
    meaning: "clear; pure",
    definition: "",
    memory_trick: "",
    examples: [
      { word: "清楚", pinyin: "qīng chu", meaning: "clear; distinct" },
      { word: "清水", pinyin: "qīng shuǐ", meaning: "clear water" },
    ],
  },
  {
    character: "情",
    pinyin: "qing2",
    meaning: "feeling; emotion; affection",
    definition: "",
    memory_trick: "",
    examples: [
      { word: "感情", pinyin: "gǎn qíng", meaning: "feelings; emotion" },
      { word: "心情", pinyin: "xīn qíng", meaning: "mood" },
    ],
  },
  {
    character: "晴",
    pinyin: "qing2",
    meaning: "sunny; clear (weather)",
    definition: "",
    memory_trick: "",
    examples: [{ word: "晴天", pinyin: "qíng tiān", meaning: "sunny day" }],
  },
  {
    character: "精",
    pinyin: "jing1",
    meaning: "essence; refined; energetic",
    definition: "",
    memory_trick: "",
    examples: [{ word: "精神", pinyin: "jīng shén", meaning: "spirit; vigor" }],
  },
];

function parseNumberedPinyin(input) {
  const match = input.trim().toLowerCase().match(/^([a-z]+)([1-5])$/);
  if (!match) return null;
  return { base: match[1], tone: Number(match[2]) };
}

async function main() {
  const rows = seed.map((entry) => {
    const parsed = parseNumberedPinyin(entry.pinyin);
    if (!parsed) throw new Error(`Bad pinyin for ${entry.character}: ${entry.pinyin}`);
    return {
      character: entry.character,
      sound_base: parsed.base,
      tone: parsed.tone,
      meaning: entry.meaning,
      definition: entry.definition,
      memory_trick: entry.memory_trick,
      examples: entry.examples,
    };
  });

  const { error, count } = await supabase
    .from("characters")
    .upsert(rows, { onConflict: "character,sound_base,tone", count: "exact" });

  if (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded/updated ${rows.length} characters.`);
}

main();
