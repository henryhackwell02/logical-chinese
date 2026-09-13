/**
 * Pinyin normalisation.
 *
 * Search has to work for someone who cannot type tone marks, so every pinyin
 * string is reduced to a plain-ASCII key: diacritics stripped, ü folded to u.
 * A second "v" key is kept because keyboard input conventionally writes ü as v.
 */

/** `zhāng` -> `zhang`, `lǜ` -> `lu`. */
export function toneless(pinyin: string): string {
  return pinyin
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .toLowerCase()
    .trim();
}

/** `lǜ` -> `lv`. Returns null when it would duplicate the toneless key. */
export function vForm(pinyin: string): string | null {
  const stripped = pinyin
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  if (!stripped.includes('ü')) return null;
  return stripped.replace(/ü/g, 'v');
}

export const TONE_NAMES: Record<number, string> = {
  1: 'first tone, high and level',
  2: 'second tone, rising',
  3: 'third tone, dipping',
  4: 'fourth tone, falling',
  5: 'neutral tone',
};

export const TONE_CONTOURS: Record<number, string> = {
  1: '˧˧',
  2: '˧˥',
  3: '˨˩˦',
  4: '˥˩',
  5: '·',
};
