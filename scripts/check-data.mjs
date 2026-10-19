/**
 * Integrity check for the hand-authored data. Read-only: it never writes to
 * data/. Run it after editing data/entries.json on GitHub, or locally with
 * `npm run check-data`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const entriesRaw = read('data/entries.json');
const entries = JSON.parse(entriesRaw);
const clusters = JSON.parse(read('data/clusters.json'));

const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

// --- shape ------------------------------------------------------------------
const FIELDS = [
  'char',
  'pinyin',
  'syllable',
  'tone',
  'core',
  'mnemonic',
  'invented',
  'crossRefs',
  'freqRank',
  'traditional',
];

const seen = new Set();
for (const [i, e] of entries.entries()) {
  for (const field of FIELDS) {
    if (!(field in e)) fail(`entry ${i} (${e.char ?? '?'}) is missing "${field}"`);
  }
  if (![1, 2, 3, 4, 5].includes(e.tone)) fail(`${e.char} ${e.pinyin}: tone ${e.tone}`);
  if (!(e.freqRank === null || (Number.isInteger(e.freqRank) && e.freqRank >= 1))) {
    fail(`${e.char} ${e.pinyin}: freqRank must be a positive integer, or null for an addition`);
  }
  if (!/^[a-zü]+$/.test(e.syllable)) fail(`${e.char} ${e.pinyin}: odd syllable "${e.syllable}"`);
  // The parser lights capital runs, then scattered capitals, then a bare
  // lowercase word. Only an empty or multi-word all-lowercase mnemonic has
  // nothing sensible to light.
  if (!e.mnemonic.trim()) fail(`${e.char} ${e.pinyin}: empty mnemonic`);
  else if (!/[A-Z]/.test(e.mnemonic) && /\s/.test(e.mnemonic)) {
    warn(
      `${e.char} ${e.pinyin}: multi-word mnemonic with no capitals, so the whole phrase lights — "${e.mnemonic}"`,
    );
  }
  const key = `${e.char}\u0000${e.pinyin}`;
  if (seen.has(key)) fail(`duplicate reading: ${e.char} ${e.pinyin}`);
  seen.add(key);
}

// --- one line per object, so GitHub edits stay reviewable ---------------------
const bodyLines = entriesRaw.split('\n').filter((l) => l.trim().startsWith('{'));
if (bodyLines.length !== entries.length) {
  fail(
    `entries.json must keep one object per line: ${entries.length} objects across ${bodyLines.length} object-lines`,
  );
}

// --- HSK vocabulary -----------------------------------------------------------
const hskRaw = read('data/hsk.json');
const hsk = JSON.parse(hskRaw);

const hskLines = hskRaw.split('\n').filter((l) => l.trim().startsWith('{'));
if (hskLines.length !== hsk.length) {
  fail(
    `hsk.json must keep one object per line: ${hsk.length} objects across ${hskLines.length} object-lines`,
  );
}

const hskSeen = new Set();
for (const w of hsk) {
  if (typeof w.word !== 'string' || !w.word) fail(`hsk: entry with no word`);
  else if (!/^[㐀-鿿]+$/.test(w.word)) {
    fail(`hsk: "${w.word}" is not all Han characters`);
  }
  if (!Number.isInteger(w.level) || w.level < 1 || w.level > 6) {
    fail(`hsk ${w.word}: level must be 1-6, got ${w.level}`);
  }
  if (typeof w.pinyin !== 'string' || !w.pinyin) fail(`hsk ${w.word}: no pinyin`);
  if (typeof w.gloss !== 'string' || !w.gloss) fail(`hsk ${w.word}: no gloss`);
  if (hskSeen.has(w.word)) fail(`hsk: duplicate word ${w.word}`);
  hskSeen.add(w.word);
}

// --- cross-references resolve in both directions ------------------------------
const readings = new Map();
for (const e of entries) {
  if (!readings.has(e.char)) readings.set(e.char, new Set());
  readings.get(e.char).add(e.pinyin);
}

for (const e of entries) {
  const all = readings.get(e.char);
  for (const ref of e.crossRefs) {
    if (!all.has(ref)) {
      fail(`${e.char} ${e.pinyin}: crossRef "${ref}" has no entry of its own`);
    }
  }
  if (all.size > 1 && e.crossRefs.length === 0) {
    warn(`${e.char} ${e.pinyin}: has sibling readings but no crossRefs`);
  }
  // Several characters use a hub pattern — every reading points at the
  // commonest one rather than at each other. That is fine: the site derives
  // sibling links from the grouping, so they resolve in both directions either
  // way. Only a reading that points nowhere at all is worth flagging.
}

// --- clusters -----------------------------------------------------------------
const slugs = new Set();
for (const c of clusters) {
  if (slugs.has(c.slug)) fail(`duplicate cluster slug "${c.slug}"`);
  slugs.add(c.slug);
  if (!/^[a-z0-9-]+$/.test(c.slug)) fail(`cluster "${c.name}" has an unroutable slug`);
  for (const char of c.chars) {
    if (!readings.has(char)) {
      warn(`cluster "${c.name}": ${char} is not in entries.json, so it will not link`);
    }
  }
}

// --- generated index is in step ------------------------------------------------
const indexPath = 'lib/generated/search-index.json';
if (existsSync(join(root, indexPath))) {
  const index = JSON.parse(read(indexPath));
  if (index.length !== entries.length) {
    fail(`${indexPath} has ${index.length} rows for ${entries.length} entries — rebuild it`);
  }
}

// --- report ---------------------------------------------------------------------
const chars = readings.size;
const syllables = new Set(entries.map((e) => e.syllable)).size;
const invented = entries.filter((e) => e.invented).length;

console.log(`entries      ${entries.length}`);
console.log(`characters   ${chars}`);
console.log(`syllables    ${syllables}`);
console.log(`clusters     ${clusters.length}`);
console.log(`invented     ${invented}`);

const hskChars = new Set(hsk.flatMap((w) => [...w.word]));
const withWords = [...readings.keys()].filter((c) => hskChars.has(c)).length;
console.log(`hsk words    ${hsk.length} (${withWords} characters carry at least one)`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) console.log(`  · ${w}`);
  if (warnings.length > 40) console.log(`  … and ${warnings.length - 40} more`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

console.log('\ndata ok');
