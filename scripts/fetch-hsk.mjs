/**
 * Regenerates data/hsk.json from the official HSK 2012 (HSK 2.0) word lists.
 *
 * Source: https://github.com/glxxyz/hskhsk.com (MIT), files
 * `data/lists/HSK Official With Definitions 2012 L1.txt` … `L6.txt`, which are
 * tab-separated: simplified, traditional, numbered pinyin, tone-marked pinyin,
 * definition. Definitions there derive from CC-CEDICT, which the site already
 * credits.
 *
 * The syllabus is nominally 150/150/300/600/1300/2500 = 5,000 words. This
 * source lists 151 at level 2, and six words appear at two levels apiece
 * (过 还 长 得 等 喂 — different senses or readings), so 5,001 listings reduce
 * to 4,995 distinct words. A word is filed at the lowest level it appears at,
 * which is where a learner meets it.
 *
 * Run by hand, not during a build:
 *   node scripts/fetch-hsk.mjs
 *
 * Writes data/hsk.json one object per line, like the other data files, so a
 * later correction is a one-line diff. Never touches data/entries.json.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE =
  'https://raw.githubusercontent.com/glxxyz/hskhsk.com/main/data/lists/' +
  'HSK%20Official%20With%20Definitions%202012%20L';

const seen = new Set();
const words = [];
const listed = {};

for (let level = 1; level <= 6; level++) {
  const res = await fetch(`${BASE}${level}.txt`);
  if (!res.ok) throw new Error(`L${level}: HTTP ${res.status}`);
  const text = (await res.text()).replace(/^﻿/, '');

  let count = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [word, , , pinyin, gloss] = line.split('\t');
    count += 1;
    if (!word || !pinyin || !gloss) throw new Error(`L${level}: short line ${line}`);
    if (seen.has(word)) continue; // already filed at a lower level
    seen.add(word);
    words.push({ word, pinyin, gloss: gloss.trim(), level });
  }
  listed[level] = count;
  console.log(`L${level}: ${count} listed`);
}

// Counts as the source actually publishes them, so a changed upstream file is
// caught rather than silently absorbed.
const EXPECTED_LISTINGS = { 1: 150, 2: 151, 3: 300, 4: 600, 5: 1300, 6: 2500 };
for (const [level, want] of Object.entries(EXPECTED_LISTINGS)) {
  if (listed[level] !== want) {
    throw new Error(`L${level}: expected ${want} listings, got ${listed[level]}`);
  }
}
if (words.length !== 4995) {
  throw new Error(`expected 4,995 distinct words, got ${words.length}`);
}

const body = words.map((w) => JSON.stringify(w)).join(',\n');
writeFileSync(join(root, 'data/hsk.json'), `[\n${body}\n]\n`, 'utf8');

console.log(`data/hsk.json: ${words.length} distinct words`);
