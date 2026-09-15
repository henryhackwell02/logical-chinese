/**
 * Adds one new character to data/entries.json, in the place it belongs.
 *
 * The file is ordered by syllable, then tone, so a new reading is inserted at
 * the end of its tone group within its syllable — 凛 lǐn goes after the lín
 * group and before lìn. A syllable the file has never seen goes where it sorts.
 *
 * The file is hand-authored and edited on GitHub, so this never re-serialises
 * it. It inserts one line formatted exactly like its neighbours, then proves
 * every existing entry is still present, in order, and byte-for-byte unchanged.
 *
 * Usage:
 *   node scripts/add-entry.mjs --body-file body.md [--write]
 *   node scripts/add-entry.mjs --char 凛 --pinyin lǐn --mnemonic "..." --core "..."
 *                              [--traditional 凜] [--invented] [--write]
 *
 * Readings are accepted with a tone mark (lǐn) or a tone number (lin3); v or u:
 * stand in for ü. Without --write it validates and reports only.
 */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseIssueForm, isTicked } from './issue-form.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(root, 'data/entries.json');
const WRITE = process.argv.includes('--write');

// ------------------------------------------------------------------ reporting

function report(result) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  appendFileSync(
    out,
    `ok=${result.ok ? 'true' : 'false'}\n` +
      `kind=add\n` +
      `message<<EOF\n${result.message}\nEOF\n` +
      `char=${result.char ?? ''}\n` +
      `pinyin=${result.pinyin ?? ''}\n`,
    'utf8',
  );
}

function reject(message) {
  report({ ok: false, message });
  console.error(`✗ ${message}`);
  process.exit(1);
}

// ------------------------------------------------------------------ arguments

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

let input = {
  char: arg('char'),
  reading: arg('pinyin'),
  mnemonic: arg('mnemonic'),
  core: arg('core'),
  traditional: arg('traditional'),
  invented: process.argv.includes('--invented'),
};

const bodyFile = arg('body-file');
if (bodyFile) {
  const fields = parseIssueForm(readFileSync(bodyFile, 'utf8'));
  input = {
    char: fields['character'],
    reading: fields['reading'],
    mnemonic: fields['mnemonic'],
    core: fields['core idea'],
    traditional: fields['traditional form'],
    invented: isTicked(fields['etymology']),
  };
}

const clean = (value) => (value ?? '').trim().replace(/\s+/g, ' ');
const char = clean(input.char);
const mnemonic = clean(input.mnemonic);
const core = clean(input.core);
const traditionalRaw = (input.traditional ?? '').replace(/\s+/g, '');

// ----------------------------------------------------------------- character

if (!char) reject('The character is required.');
if ([...char].length !== 1) reject(`"${char}" is not a single character. Add one at a time.`);
if (!/^\p{Script=Han}$/u.test(char)) reject(`"${char}" is not a Chinese character.`);

// -------------------------------------------------------------------- reading

const TONE_MARKS = { '\u0304': 1, '\u0301': 2, '\u030c': 3, '\u0300': 4 };
const MARKED = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };

/** Standard placement: a or e takes the mark, then the o of ou, then the last vowel. */
function markTone(syllable, tone) {
  if (tone === 5) return syllable;
  let at = syllable.indexOf('a');
  if (at === -1) at = syllable.indexOf('e');
  if (at === -1 && syllable.includes('ou')) at = syllable.indexOf('o');
  if (at === -1) {
    for (let i = syllable.length - 1; i >= 0; i--) {
      if ('iouü'.includes(syllable[i])) {
        at = i;
        break;
      }
    }
  }
  if (at === -1) return syllable; // m, n, ng, hm: nothing to mark
  return syllable.slice(0, at) + MARKED[syllable[at]][tone - 1] + syllable.slice(at + 1);
}

const INITIALS = '(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?';
const FINALS =
  '(?:iang|iong|uang|ueng|iao|ian|ing|uai|uan|ang|eng|ong|üan|ai|ei|ao|ou|an|en|er|' +
  'ia|ie|iu|in|ua|uo|ui|un|üe|ün|ue|a|o|e|i|u|ü)';
const SYLLABLE = new RegExp(`^${INITIALS}${FINALS}$`);
const INTERJECTIONS = new Set(['m', 'n', 'ng', 'hm', 'hng', 'r']);

function parseReading(raw) {
  if (!raw || !raw.trim()) reject('The reading is required — pinyin such as lǐn, or lin3.');
  let s = raw.trim().toLowerCase().normalize('NFC').replace(/u:/g, 'ü').replace(/v/g, 'ü');

  let tone = null;
  const numbered = s.match(/^(\S+?)([1-5])$/);
  if (numbered) {
    s = numbered[1];
    tone = Number(numbered[2]);
  }

  const letters = [...s.normalize('NFD')];
  const marks = letters.filter((ch) => ch in TONE_MARKS);
  if (numbered && marks.length) reject(`"${raw}" has both a tone mark and a tone number — use one.`);
  if (marks.length > 1) reject(`"${raw}" has more than one tone mark.`);
  if (!numbered) tone = marks.length ? TONE_MARKS[marks[0]] : 5;

  const syllable = letters
    .filter((ch) => !(ch in TONE_MARKS))
    .join('')
    .normalize('NFC');
  if (!/^[a-zü]+$/.test(syllable)) reject(`"${raw}" is not a pinyin reading.`);
  return { syllable, tone, pinyin: numbered ? markTone(syllable, tone) : s.normalize('NFC') };
}

const { syllable, tone, pinyin } = parseReading(input.reading);

// ---------------------------------------------------------------------- text

function checkText(label, value, max) {
  if (!value) reject(`The ${label} is required.`);
  if (value.length > max) reject(`The ${label} is ${value.length} characters; keep it under ${max}.`);
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) reject(`The ${label} contains a control character.`);
  if (/\p{Script=Han}/u.test(value)) {
    reject(`The ${label} contains Chinese characters; it should read as English.`);
  }
}

checkText('mnemonic', mnemonic, 160);
checkText('core idea', core, 160);

// Mirrors lib/mnemonic.ts: a run of capitals, else scattered capitals, else a
// single lowercase word. Anything else would render with nothing highlighted.
if (!/[A-Z]/.test(mnemonic) && /\s/.test(mnemonic)) {
  reject(
    `"${mnemonic}" has no capitals and is more than one word, so nothing would light up. ` +
      `Capitalise the letters that carry the sound.`,
  );
}
const lit = /[A-Z]{2,}/.test(mnemonic)
  ? mnemonic.match(/[A-Z]{2,}/g)
  : /[A-Z]/.test(mnemonic)
    ? mnemonic.match(/[A-Z]/g)
    : [mnemonic];

let traditional = '';
if (traditionalRaw) {
  const forms = [...traditionalRaw].filter((ch) => ch !== char);
  if (forms.some((ch) => !/^\p{Script=Han}$/u.test(ch))) {
    reject(`The traditional form "${traditionalRaw}" should be Chinese characters only.`);
  }
  if (forms.length > 4) reject('Give at most four traditional forms.');
  traditional = forms.join('');
}

// ------------------------------------------------------------------ the file

const original = readFileSync(DATA, 'utf8');
const entries = JSON.parse(original);
const lines = original.split('\n');

const readings = entries.filter((e) => e.char === char);
if (readings.some((e) => e.pinyin.normalize('NFC') === pinyin)) {
  reject(
    `${char} ${pinyin} is already in the dictionary. To change its mnemonic or core idea, ` +
      `use "Suggest a better mnemonic" on its entry page.`,
  );
}
if (readings.length) {
  reject(
    `${char} is already in the dictionary, read ${readings.map((e) => e.pinyin).join(', ')}. ` +
      `To change its thread, use "Suggest a better mnemonic" on its entry page. Adding a ` +
      `further reading to a character that is already here is not supported through this ` +
      `form yet.`,
  );
}

const knownSyllables = new Set(entries.map((e) => e.syllable));
if (!knownSyllables.has(syllable) && !SYLLABLE.test(syllable) && !INTERJECTIONS.has(syllable)) {
  reject(`"${syllable}" is not a Mandarin syllable. Check the spelling of the reading.`);
}

/** Serialise exactly as the file does: `"key": value`, joined with `, `. */
function serialise(object) {
  const value = (v) => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : JSON.stringify(v));
  return `{${Object.entries(object)
    .map(([k, v]) => `${JSON.stringify(k)}: ${value(v)}`)
    .join(', ')}}`;
}

const objects = [];
lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('{')) objects.push({ i, entry: JSON.parse(trimmed.replace(/,$/, '')) });
});

// Every object line but the last carries a trailing comma. Insertion relies on it.
objects.forEach(({ i }, n) => {
  const hasComma = lines[i].endsWith(',');
  if (hasComma !== n < objects.length - 1) reject(`internal: unexpected comma layout on line ${i + 1}`);
});

// Order key matching the file: ü sorts as "u:", so lu < lü < lüe < luan.
const orderKey = (s) => s.replace(/ü/g, 'u:');

let insertAt;
let after = null;
const group = objects.filter((o) => o.entry.syllable === syllable);
if (group.length) {
  const earlier = group.filter((o) => o.entry.tone <= tone);
  if (earlier.length) {
    const last = earlier[earlier.length - 1];
    insertAt = last.i + 1;
    after = last.entry;
  } else {
    insertAt = group[0].i;
  }
} else {
  const next = objects.find((o) => orderKey(o.entry.syllable) > orderKey(syllable));
  insertAt = next ? next.i : objects[objects.length - 1].i + 1;
  after = objects.filter((o) => o.i < insertAt).pop()?.entry ?? null;
}

const entry = {
  char,
  pinyin,
  syllable,
  tone,
  core,
  mnemonic,
  invented: Boolean(input.invented),
  crossRefs: [],
  freqRank: null,
  traditional,
};

// The serialiser must reproduce its neighbour byte for byte, or the new line
// would not match the file's formatting.
const neighbour = objects.find((o) => o.i === insertAt - 1) ?? objects.find((o) => o.i === insertAt);
if (serialise(neighbour.entry) !== lines[neighbour.i].replace(/,$/, '')) {
  reject(`internal: the formatting of line ${neighbour.i + 1} is not reproducible`);
}

const lastObject = objects[objects.length - 1].i;
const appending = insertAt > lastObject;
const updatedLines = [...lines];
if (appending) {
  updatedLines[lastObject] = `${lines[lastObject]},`;
  updatedLines.splice(insertAt, 0, serialise(entry));
} else {
  updatedLines.splice(insertAt, 0, `${serialise(entry)},`);
}
const updated = updatedLines.join('\n');

// ------------------------------------------------------ prove nothing else moved

if (updatedLines.length !== lines.length + 1) reject('internal: expected exactly one new line');

const withoutNew = [...updatedLines];
withoutNew.splice(insertAt, 1);
if (appending) withoutNew[lastObject] = withoutNew[lastObject].replace(/,$/, '');
if (withoutNew.join('\n') !== original) reject('internal: existing lines changed');

const reparsed = JSON.parse(updated);
if (reparsed.length !== entries.length + 1) reject('internal: entry count is wrong');
const position = reparsed.findIndex((e) => e.char === char && e.pinyin === pinyin);
const rest = reparsed.filter((_, n) => n !== position);
if (JSON.stringify(rest) !== JSON.stringify(entries)) reject('internal: an existing entry moved');
if (JSON.stringify(reparsed[position]) !== JSON.stringify(entry)) reject('internal: new entry differs');

// ------------------------------------------------------------------- outcome

const where = group.length
  ? after
    ? `in the ${syllable} group, after ${after.char} ${after.pinyin}`
    : `at the start of the ${syllable} group`
  : `as a new sound, ${syllable}${after ? `, after ${after.syllable}` : ''}`;

const summary = [
  `added ${char} ${pinyin}, tone ${tone === 5 ? 'neutral' : tone}, ${where}`,
  `mnemonic: ${JSON.stringify(mnemonic)} (lights ${lit.join(', ')})`,
  `core: ${JSON.stringify(core)}`,
  ...(traditional ? [`traditional: ${traditional}`] : []),
  ...(entry.invented ? ['marked as an invented thread'] : []),
].join('\n');

console.log(`✓ ${summary.split('\n').join('\n  ')}`);
console.log(`  line ${insertAt + 1} of data/entries.json`);

if (WRITE) {
  writeFileSync(DATA, updated, 'utf8');
  console.log('  written');
}

report({ ok: true, message: summary, char, pinyin });
