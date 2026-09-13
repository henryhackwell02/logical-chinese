/**
 * Builds the client search index from data/entries.json.
 *
 * The index is a tuple array rather than objects — it is shipped to the browser
 * as a lazily-imported chunk, and dropping the repeated key names roughly halves
 * it. Regenerated on every `npm run dev` and `npm run build`, so an edit to
 * data/entries.json on GitHub is picked up automatically by the next deploy.
 *
 * Reads data/entries.json. Never writes to it.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entries = JSON.parse(readFileSync(join(root, 'data/entries.json'), 'utf8'));

/** Mirror of lib/pinyin.ts — kept here so the script has no build dependency. */
const toneless = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .toLowerCase();

const index = entries.map((e) => [
  e.char,
  e.pinyin,
  e.syllable,
  e.tone,
  e.core,
  e.mnemonic,
  e.freqRank,
  e.traditional,
  e.invented ? 1 : 0,
  toneless(e.pinyin),
  e.syllable.includes('ü') ? e.syllable.replace(/ü/g, 'v') : '',
]);

const outDir = join(root, 'lib/generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(index), 'utf8');

console.log(`search index: ${index.length} readings`);
