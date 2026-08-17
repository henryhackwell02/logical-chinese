#!/usr/bin/env node
// Scaffolds a new data/roots/<id>.json file.
//
// Usage:
//   npm run new-root -- --char 侯 --id hou --derived 候,猴,喉

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const character = getArg("char");
const id = getArg("id");
const derivedRaw = getArg("derived") ?? "";

if (!character || !id) {
  console.error(
    "Usage: npm run new-root -- --char 侯 --id hou --derived 候,猴,喉"
  );
  process.exit(1);
}

const derivedChars = derivedRaw
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);

const filePath = path.join(process.cwd(), "data", "roots", `${id}.json`);

if (fs.existsSync(filePath)) {
  console.error(`${filePath} already exists.`);
  process.exit(1);
}

const data = {
  id,
  character,
  pinyin: "",
  meaning: "",
  description: "",
  derived: derivedChars.map((c) => ({
    character: c,
    pinyin: "",
    meaning: "",
    aiDefinition: "",
    examples: [],
  })),
};

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`Created ${filePath}`);
console.log(
  `Next: run "npm run enrich" to auto-fill pinyin/meaning from CC-CEDICT, then paste in your aiDefinition text.`
);
