export const SITE = {
  name: 'Logical Chinese',
  tagline: 'A Mandarin dictionary organised by sound, built for remembering.',
  url: 'https://logical-chinese.vercel.app',
  repo: 'https://github.com/henryhackwell02/logical-chinese',
};

/** Prefilled GitHub issue for a better mnemonic — the only write path there is. */
export function suggestUrl(char: string, pinyin: string, mnemonic: string, core: string) {
  const title = `Better mnemonic for ${char} (${pinyin})`;
  const body = [
    `**Character:** ${char}`,
    `**Reading:** ${pinyin}`,
    `**Core idea:** ${core}`,
    `**Current mnemonic:** ${mnemonic}`,
    '',
    '---',
    '',
    '**Suggested mnemonic:**',
    '',
    '<!-- Write the English phrase, capitalising the letters that carry the Mandarin sound.',
    '     e.g. inCANdescent for càn. Two or more capitals in a row get highlighted on the site. -->',
    '',
    '',
    '**Why it is better:**',
    '',
    '<!-- Closer to the sound? Easier to picture? Truer to the core idea? -->',
    '',
  ].join('\n');

  return `${SITE.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
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
