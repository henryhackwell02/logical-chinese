export const SITE = {
  name: 'Logical Chinese',
  tagline: 'A Mandarin dictionary organised by sound, built for remembering.',
  url: 'https://logical-chinese.vercel.app',
  repo: 'https://github.com/henryhackwell02/logical-chinese',
};

/**
 * Opens the "Suggest a better mnemonic" issue form with the character and its
 * reading already filled in. The query keys are the field ids in
 * .github/ISSUE_TEMPLATE/mnemonic.yml; a workflow parses the submitted form and
 * applies it to data/entries.json once a maintainer approves it.
 */
export function suggestUrl(char: string, pinyin: string, mnemonic: string, core: string) {
  const params = new URLSearchParams({
    template: 'mnemonic.yml',
    title: `Mnemonic: ${char} ${pinyin}`,
    labels: 'mnemonic',
    character: char,
    reading: pinyin,
    mnemonic,
    core,
  });
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
