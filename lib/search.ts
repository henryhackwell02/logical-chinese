import { toneless } from './pinyin';

/** Tuple layout produced by scripts/build-search-index.mjs. */
export type IndexRow = [
  char: string,
  pinyin: string,
  syllable: string,
  tone: number,
  core: string,
  mnemonic: string,
  freqRank: number | null,
  traditional: string,
  invented: 0 | 1,
  tonelessPinyin: string,
  vForm: string,
];

export interface Hit {
  char: string;
  pinyin: string;
  syllable: string;
  tone: number;
  core: string;
  mnemonic: string;
  freqRank: number | null;
  invented: boolean;
}

/**
 * Rank order, best first:
 *   0  the query is the character itself (simplified or traditional)
 *   1  the query is exactly this syllable, tones ignored
 *   2  the query starts this syllable
 *   3  the query starts a word in the core idea or the mnemonic
 *   4  the query appears anywhere in the core idea or the mnemonic
 * Frequency breaks ties, so the commonest character comes first.
 */
export function search(index: IndexRow[], rawQuery: string, limit = 40): Hit[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const hasHan = /[\u3400-\u9fff\uf900-\ufaff]/.test(query);
  const q = toneless(query);
  const scored: { row: IndexRow; rank: number }[] = [];

  for (const row of index) {
    const [char, , syllable, , core, mnemonic, , traditional, , plain, v] = row;
    let rank = -1;

    if (hasHan) {
      if (char === query) rank = 0;
      else if (traditional && traditional.includes(query)) rank = 1;
      else if (query.length > 1 && query.includes(char)) rank = 2;
    } else {
      if (syllable === q || plain === q || (v && v === q)) rank = 1;
      else if (syllable.startsWith(q) || (v && v.startsWith(q))) rank = 2;
      else {
        const haystack = `${core} ${mnemonic}`.toLowerCase();
        const at = haystack.indexOf(q);
        if (at === 0 || (at > 0 && !/[a-z0-9]/.test(haystack[at - 1]))) rank = 3;
        else if (at > 0) rank = 4;
      }
    }

    if (rank !== -1) scored.push({ row, rank });
  }

  // Unranked additions sort after every ranked character.
  const r = (n: number | null) => n ?? Number.POSITIVE_INFINITY;
  scored.sort((a, b) => a.rank - b.rank || r(a.row[6]) - r(b.row[6]));

  return scored.slice(0, limit).map(({ row }) => ({
    char: row[0],
    pinyin: row[1],
    syllable: row[2],
    tone: row[3],
    core: row[4],
    mnemonic: row[5],
    freqRank: row[6],
    invented: row[8] === 1,
  }));
}
