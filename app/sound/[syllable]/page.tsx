import type { Metadata } from 'next';
import Link from 'next/link';
import { EntryRows } from '@/components/Bits';
import { allSyllables, getEntriesForSyllable, tonesForSyllable } from '@/lib/data';
import { TONE_CONTOURS, TONE_NAMES } from '@/lib/pinyin';
import { soundHref } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return allSyllables.map((syllable) => ({ syllable }));
}

function decode(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function generateMetadata({ params }: { params: { syllable: string } }): Metadata {
  const syllable = decode(params.syllable);
  const group = getEntriesForSyllable(syllable);
  const chars = [...new Set(group.map((e) => e.char))];

  return {
    title: `${syllable} — ${chars.length} characters`,
    description: `Every character read ${syllable}, grouped by tone, each with its own mnemonic: ${chars
      .slice(0, 20)
      .join(' ')}.`,
    alternates: { canonical: soundHref(syllable) },
    openGraph: {
      type: 'article',
      title: `${syllable} — ${chars.length} characters, side by side`,
      description: `${chars.slice(0, 24).join(' ')} — told apart by mnemonic rather than by guesswork.`,
    },
  };
}

export default function SoundPage({ params }: { params: { syllable: string } }) {
  const syllable = decode(params.syllable);
  const group = getEntriesForSyllable(syllable);
  const bands = tonesForSyllable(syllable);
  const charCount = new Set(group.map((e) => e.char)).size;

  const position = allSyllables.indexOf(syllable);
  const previous = position > 0 ? allSyllables[position - 1] : null;
  const next = position < allSyllables.length - 1 ? allSyllables[position + 1] : null;

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link> <span aria-hidden="true">/</span>{' '}
        <Link href="/browse/#sounds">sounds</Link>
      </p>

      <header className="page-head">
        <h1 className="syllable-title">{syllable}</h1>
        <p className="lede">
          {charCount === 1
            ? 'One character carries this sound.'
            : `${charCount} characters carry this sound across ${bands.length} ${
                bands.length === 1 ? 'tone' : 'tones'
              }. The tone narrows it; the mnemonic settles it.`}
        </p>
        <p className="note" style={{ marginTop: '0.75rem' }}>
          <Link href={`/practice/?syllable=${encodeURIComponent(syllable)}`}>
            Drill this group as flashcards
          </Link>
        </p>
      </header>

      {bands.map(({ tone, entries }) => (
        <section className="tone-band" key={tone} aria-labelledby={`tone-${tone}`}>
          <div className="tone-head">
            <h2 id={`tone-${tone}`}>
              {syllable}
              <span aria-hidden="true"> </span>
              <span className="tone-contour">{TONE_CONTOURS[tone]}</span>
            </h2>
            <span className="tone-desc">{TONE_NAMES[tone]}</span>
            <span className="tone-count">
              {entries.length} {entries.length === 1 ? 'character' : 'characters'}
            </span>
          </div>
          <EntryRows entries={entries} />
        </section>
      ))}

      <nav className="crumb" aria-label="Nearby sounds">
        {previous && <Link href={soundHref(previous)}>{previous}</Link>}
        {previous && next && <span aria-hidden="true"> &nbsp;&nbsp; </span>}
        {next && <Link href={soundHref(next)}>{next}</Link>}
      </nav>
    </div>
  );
}
