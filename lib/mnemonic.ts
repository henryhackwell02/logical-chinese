export interface MnemonicSegment {
  text: string;
  lit: boolean;
}

/**
 * The core mechanic: a Mandarin sound hidden inside an English phrase, carried
 * by capitals. `inCANdescent` -> ['in', 'CAN', 'descent'] with the middle
 * segment lit.
 *
 * The data uses three conventions, so the parser handles three cases. In order:
 *
 *   1. A run of two or more capitals is the sound.        `douBlEd` -> BL
 *      Runs win outright, which keeps sentence-initial capitals and proper
 *      nouns ("the Buddha — FOund enlightenment") out of the highlight.
 *
 *   2. Failing that, scattered single capitals are the sound. 87 mnemonics pick
 *      out non-adjacent letters this way: `the mAlIgnant growth` -> A, I.
 *
 *   3. Failing that, the mnemonic is a single lowercase word that simply sounds
 *      like the syllable — `anchor` for ān, `beaker` for bēi — and the whole
 *      word is the hook. 131 mnemonics are of this shape.
 *
 * No mnemonic ever comes back entirely unlit.
 */
const RUNS = /[A-Z]{2,}/g;
const SINGLES = /[A-Z]/g;

function highlight(mnemonic: string, pattern: RegExp): MnemonicSegment[] {
  const segments: MnemonicSegment[] = [];
  let cursor = 0;
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(mnemonic)) !== null) {
    if (match.index > cursor) {
      segments.push({ text: mnemonic.slice(cursor, match.index), lit: false });
    }
    segments.push({ text: match[0], lit: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < mnemonic.length) {
    segments.push({ text: mnemonic.slice(cursor), lit: false });
  }
  return segments;
}

export function parseMnemonic(mnemonic: string): MnemonicSegment[] {
  if (!mnemonic) return [];
  if (RUNS.test(mnemonic)) {
    RUNS.lastIndex = 0;
    return highlight(mnemonic, RUNS);
  }
  if (SINGLES.test(mnemonic)) {
    SINGLES.lastIndex = 0;
    return highlight(mnemonic, SINGLES);
  }
  return [{ text: mnemonic, lit: true }];
}

/** The sounds a mnemonic actually carries, for titles and metadata. */
export function litRuns(mnemonic: string): string[] {
  return parseMnemonic(mnemonic)
    .filter((segment) => segment.lit)
    .map((segment) => segment.text);
}

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * About three quarters of the mnemonics restate the core idea before the dash —
 * "opened and spread, and one flat sheet — the JAmmed-open sheet" — so printing
 * the core underneath it says the same thing twice. The mnemonic is the product
 * and is always rendered whole; the duplicate core line is what gives way.
 */
export function coreAddsMeaning(core: string, mnemonic: string): boolean {
  const c = normalise(core);
  if (!c) return false;
  if (normalise(mnemonic).includes(c)) return false;
  const dash = mnemonic.indexOf(' — ');
  if (dash > 0) {
    const head = normalise(mnemonic.slice(0, dash));
    if (head === c || c.includes(head) || head.includes(c)) return false;
  }
  return true;
}
