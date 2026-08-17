#!/usr/bin/env node
// Fills in missing `pinyin` / `meaning` fields for characters in data/roots/*.json
// using CC-CEDICT (free, open Chinese-English dictionary: https://cc-cedict.org/).
//
// It never touches `aiDefinition` — that's yours to fill in by hand.
//
// Usage:
//   npm run enrich            # fill gaps in all root files
//   npm run enrich -- --force # overwrite existing pinyin/meaning too

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOTS_DIR = path.join(process.cwd(), "data", "roots");
const CACHE_DIR = path.join(process.cwd(), "scripts", ".cedict-cache");
const CEDICT_URL =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";
const CACHE_FILE = path.join(CACHE_DIR, "cedict.txt");

const force = process.argv.includes("--force");

async function downloadCedict() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (fs.existsSync(CACHE_FILE)) {
    console.log("Using cached CC-CEDICT file.");
    return fs.readFileSync(CACHE_FILE, "utf-8");
  }

  console.log("Downloading CC-CEDICT...");
  const res = await fetch(CEDICT_URL);
  if (!res.ok) throw new Error(`Failed to download CC-CEDICT: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = zlib.gunzipSync(buf).toString("utf-8");
  fs.writeFileSync(CACHE_FILE, text, "utf-8");
  return text;
}

// CC-CEDICT line format: Traditional Simplified [pin1 yin1] /def 1/def 2/...
function parseCedict(text) {
  const bySimplified = new Map();
  const lines = text.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/);
    if (!match) continue;
    const [, , simplified, pinyinRaw, defsRaw] = match;

    // Only keep single-character entries for this lookup (roots/derived chars).
    if ([...simplified].length !== 1) continue;

    // CC-CEDICT lists multiple entries per character; ones whose pinyin
    // starts uppercase are usually proper nouns (surnames, place-name
    // abbreviations). Prefer the first lowercase (common-word) entry, and
    // only fall back to an uppercase one if nothing else exists.
    const isProperNoun = /^[A-Z]/.test(pinyinRaw);
    const existing = bySimplified.get(simplified);
    if (existing && !existing.isProperNoun) continue; // already have a good entry
    if (existing && existing.isProperNoun && isProperNoun) continue; // keep first proper noun

    const pinyin = toneMarks(pinyinRaw);
    const meaning = defsRaw.split("/").slice(0, 2).join("; ");
    bySimplified.set(simplified, { pinyin, meaning, isProperNoun });
  }

  return bySimplified;
}

const TONE_MAP = {
  a: "aāáǎà",
  e: "eēéěè",
  i: "iīíǐì",
  o: "oōóǒò",
  u: "uūúǔù",
  "u:": "üǖǘǚǜ",
};

function applyTone(syllable, tone) {
  if (tone === 5 || !tone) return syllable.replace("u:", "ü");
  const vowelPriority = ["a", "o", "e", "i", "u", "u:"];
  let target = null;
  const lower = syllable.toLowerCase();
  for (const v of vowelPriority) {
    if (lower.includes(v)) {
      target = v;
      break;
    }
  }
  if (!target) return syllable;
  const idx = lower.indexOf(target);
  const map = TONE_MAP[target];
  const toned = map[tone];
  return syllable.slice(0, idx) + toned + syllable.slice(idx + target.length);
}

function toneMarks(pinyinRaw) {
  return pinyinRaw
    .split(" ")
    .map((syll) => {
      const m = syll.match(/^([a-zA-Z:]+)([1-5])$/);
      if (!m) return syll;
      const [, base, toneStr] = m;
      return applyTone(base, Number(toneStr));
    })
    .join(" ");
}

async function main() {
  const text = await downloadCedict();
  const dict = parseCedict(text);
  console.log(`Loaded ${dict.size} single-character entries.`);

  const files = fs.readdirSync(ROOTS_DIR).filter((f) => f.endsWith(".json"));
  let filled = 0;

  for (const file of files) {
    const filePath = path.join(ROOTS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let changed = false;

    const applyLookup = (entry) => {
      const hit = dict.get(entry.character);
      if (!hit) return;
      if (force || !entry.pinyin) {
        entry.pinyin = hit.pinyin;
        changed = true;
        filled++;
      }
      if (force || !entry.meaning) {
        entry.meaning = hit.meaning;
        changed = true;
        filled++;
      }
    };

    applyLookup(data);
    for (const child of data.derived ?? []) applyLookup(child);

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
      console.log(`Updated ${file}`);
    }
  }

  console.log(`Done. Filled ${filled} fields.`);
  console.log(
    "Note: aiDefinition fields are never touched by this script — add those yourself."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
