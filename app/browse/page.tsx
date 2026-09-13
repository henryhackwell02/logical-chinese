import type { Metadata } from 'next';
import Link from 'next/link';
import BrowseExplorer from '@/components/BrowseExplorer';
import { FREQUENCY_BANDS, allSyllables, bySyllable, clusters, stats } from '@/lib/data';
import { soundHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Browse',
  description:
    'All 3,021 readings by frequency band, filtered by tone, meaning cluster or invented thread — and the full index of 396 pinyin syllables.',
  alternates: { canonical: '/browse/' },
};

/** Group syllables under their first letter for the crawlable A–Z index. */
const alphabet = allSyllables.reduce<Map<string, string[]>>((map, syllable) => {
  const letter = syllable[0].toUpperCase();
  const bucket = map.get(letter);
  if (bucket) bucket.push(syllable);
  else map.set(letter, [syllable]);
  return map;
}, new Map());

export default function BrowsePage() {
  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link>
      </p>

      <header className="page-head">
        <h1>Browse</h1>
        <p className="lede">
          {stats.entries.toLocaleString('en-GB')} readings of{' '}
          {stats.characters.toLocaleString('en-GB')} characters, ranked by how often they
          turn up in running text. The first few hundred do most of the work.
        </p>
      </header>

      <BrowseExplorer
        bands={FREQUENCY_BANDS.map((b) => ({ ...b }))}
        clusterOptions={clusters.map((c) => ({
          slug: c.slug,
          name: c.name,
          chars: c.chars,
        }))}
      />

      <section className="section" id="sounds">
        <div className="section-head">
          <h2>Every sound</h2>
          <p className="section-more">{stats.syllables} syllables</p>
        </div>
        <p className="note" style={{ marginBottom: '1.25rem', maxWidth: '38rem' }}>
          Mandarin runs on a small stock of syllables. Each page below holds every
          character that shares one, grouped by tone.
        </p>

        {[...alphabet.entries()].map(([letter, syllables]) => (
          <div key={letter} style={{ marginBottom: '1.5rem' }}>
            <h3
              className="note"
              style={{ marginBottom: '0.4rem', fontWeight: 600, color: 'var(--fg)' }}
            >
              {letter}
            </h3>
            <div className="alpha-index">
              {syllables.map((syllable) => (
                <Link key={syllable} href={soundHref(syllable)}>
                  {syllable}
                  <span className="chip-count"> {bySyllable.get(syllable)!.length}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
