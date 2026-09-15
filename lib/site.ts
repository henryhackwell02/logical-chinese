export const SITE = {
  name: 'Logical Chinese',
  tagline: 'A Mandarin dictionary organised by sound, built for remembering.',
  url: 'https://logical-chinese.vercel.app',
  repo: 'https://github.com/henryhackwell02/logical-chinese',
};

/**
 * Opens the "Suggest a better mnemonic" issue form, identifying the reading so
 * the reader does not have to. The query keys are the field ids in
 * .github/ISSUE_TEMPLATE/mnemonic.yml.
 *
 * Only `character` and `reading` are prefilled, deliberately. The two boxes the
 * reader actually types into are left empty: nobody should have to clear the
 * existing text before writing their own, and a prefilled field that reappears
 * when you delete it reads as a broken form. The current mnemonic and core idea
 * are not passed at all — scripts/apply-suggestion.mjs reads them straight out
 * of data/entries.json and reports the before and after itself.
 */
export function suggestUrl(char: string, pinyin: string) {
  const params = new URLSearchParams({
    template: 'mnemonic.yml',
    title: `Mnemonic: ${char} ${pinyin}`,
    labels: 'mnemonic',
    character: char,
    reading: pinyin,
  });
  return `${SITE.repo}/issues/new?${params.toString()}`;
}

/**
 * Opens the "Add a character" issue form, with the character filled in when it
 * is known — from a search that came up empty, say. Handled by the same
 * workflow as mnemonic suggestions, via scripts/add-entry.mjs.
 */
export function addCharUrl(char?: string) {
  const params = new URLSearchParams({
    template: 'add-character.yml',
    title: char ? `New character: ${char}` : 'New character: ',
    labels: 'new-character',
  });
  if (char) params.set('character', char);
  return `${SITE.repo}/issues/new?${params.toString()}`;
}

export function charHref(char: string) {
  return `/char/${encodeURIComponent(char)}/`;
}

export function soundHref(syllable: string) {
  return `/sound/${encodeURIComponent(syllable)}/`;
}

export function meaningHref(slug: string) {
  return `/meaning/${slug}/`;
}
