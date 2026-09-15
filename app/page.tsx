import Link from 'next/link';
import SiteSearch from '@/components/SiteSearch';
import Mnemonic from '@/components/Mnemonic';
import { EntryRows } from '@/components/Bits';
import {
  bySyllable,
  clusters,
  entries,
  getEntriesForSyllable,
  primaryReading,
  rankOf,
  stats,
} from '@/lib/data';
import { charHref, meaningHref, soundHref } from '@/lib/site';

/** The demonstration entry. Read from the data so it cannot drift from it. */
const hero = primaryReading('灿');

const crowdedSyllables = [...bySyllable.entries()]
  .map(([syllable, group]) => ({ syllable, count: new Set(group.map((e) => e.char)).size }))
  .sort((a, b) => b.count - a.count || a.syllable.localeCompare(b.syllable))
  .slice(0, 16);

/** One row per character: 的 has three readings and should not open with all three. */
const openers = [
  ...new Set(
    [...entries].sort((a, b) => rankOf(a.freqRank) - rankOf(b.freqRank)).map((e) => e.char),
  ),
]
  .slice(0, 8)
  .map(primaryReading);

const zhangCount = new Set(getEntriesForSyllable('zhang').map((e) => e.char)).size;

export default function HomePage() {
  return (
    <div className="wrap">
      <section className="hero">
        <h1 className="sr-only">
          Logical Chinese — a Mandarin dictionary organised by sound
        </h1>
        <p className="hero-lede">
          A Mandarin dictionary organised by sound, built for remembering. Every character
          carries an English phrase with the Mandarin hidden inside it, spelled out in
          capitals.
        </p>

        <div className="hero-demo">
          <div className="hero-char" lang="zh">
            <Link href={charHref(hero.char)} aria-label={`${hero.char}, ${hero.pinyin}`}>
              {hero.char}
            </Link>
          </div>
          <div>
            <p className="hero-read">{hero.pinyin}</p>
            <Mnemonic text={hero.mnemonic} className="hero-mnemonic" as="div" />
            <p className="hero-core core">{hero.core}</p>
          </div>
        </div>

        <div className="hero-search">
          <SiteSearch variant="hero" />
        </div>
        <p className="hero-gloss">
          Type a character, a pinyin syllable without tone marks, or an English word from a
          mnemonic. {stats.entries.toLocaleString('en-GB')} readings across{' '}
          {stats.characters.toLocaleString('en-GB')} characters.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Sounds that pile up</h2>
          <p>
            <Link href={soundHref('zhang')}>{zhangCount} characters read zhang</Link>
          </p>
        </div>
        <p className="note" style={{ marginBottom: '1rem', maxWidth: '38rem' }}>
          Mandarin has only about 400 syllables, so homophones stack. These are the
          fullest. Each page sets the whole group side by side, sorted by tone, so the
          mnemonics do the work of telling them apart.
        </p>
        <ul className="chips">
          {crowdedSyllables.map(({ syllable, count }) => (
            <li key={syllable}>
              <Link href={soundHref(syllable)} className="chip">
                {syllable}
                <span className="chip-count">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Where to start</h2>
          <p className="section-more">
            <Link href="/browse/">All {stats.entries.toLocaleString('en-GB')} readings</Link>
          </p>
        </div>
        <EntryRows entries={openers} showSyllable />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Near-synonyms, pulled apart</h2>
          <p className="section-more">
            <Link href="/meaning/">All {stats.clusters} clusters</Link>
          </p>
        </div>
        <ul className="cluster-list">
          {clusters.slice(0, 6).map((cluster) => (
            <li key={cluster.slug}>
              <Link href={meaningHref(cluster.slug)} className="cluster-item">
                <h3>{cluster.name}</h3>
                <p className="cluster-idea">{cluster.sharedIdea}</p>
                <p className="cluster-chars" lang="zh">
                  {cluster.chars.join('')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>An honest note</h2>
        </div>
        <p className="prose">
          Most of the threads here follow the character&rsquo;s real semantic history.{' '}
          {stats.invented} of them do not — usually where simplification folded two
          unrelated traditional characters into one shape, and a thread had to be invented
          to make the pair stick. Those are marked with a{' '}
          <span className="seal">◇</span> wherever they appear, and can be filtered out
          entirely on <Link href="/browse/">the browse page</Link>. They are useful for
          learning and indefensible as history, and it seemed better to say so than to
          hope nobody checked. <Link href="/about/">More on how this works.</Link>
        </p>
      </section>
    </div>
  );
}
