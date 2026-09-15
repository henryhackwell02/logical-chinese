import type { Metadata } from 'next';
import Link from 'next/link';
import Mnemonic from '@/components/Mnemonic';
import EntryTools from '@/components/EntryTools';
import { Hanzi, INVENTED_TOOLTIP, InventedMark, ToneTag } from '@/components/Bits';
import {
  allChars,
  getClustersForChar,
  getEntriesForChar,
  getEntriesForSyllable,
  otherReadings,
} from '@/lib/data';
import { coreAddsMeaning, litRuns } from '@/lib/mnemonic';
import { toneless } from '@/lib/pinyin';
import { charHref, meaningHref, soundHref } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return allChars.map((char) => ({ char }));
}

/** Anchor per reading. Tone is part of it: 把 has both bǎ and bà. */
function readingId(pinyin: string, tone: number) {
  return `r-${toneless(pinyin)}${tone}`;
}

function decode(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function generateMetadata({ params }: { params: { char: string } }): Metadata {
  const char = decode(params.char);
  const readings = getEntriesForChar(char);
  if (!readings.length) return { title: char };

  const first = readings[0];
  const pinyins = readings.map((r) => r.pinyin).join(', ');
  const description = readings
    .map((r) => `${r.pinyin} — ${r.core}. Mnemonic: ${r.mnemonic}.`)
    .join(' ');

  return {
    title: `${char} ${pinyins}`,
    description,
    alternates: { canonical: charHref(char) },
    openGraph: {
      type: 'article',
      title: `${char} ${first.pinyin} — ${first.mnemonic}`,
      description: `${first.core}. ${litRuns(first.mnemonic).join(', ')} carries the sound.`,
    },
  };
}

export default function CharPage({ params }: { params: { char: string } }) {
  const char = decode(params.char);
  const readings = getEntriesForChar(char);
  const clusters = getClustersForChar(char);
  const primary = readings[0];
  const traditional = [...new Set(readings.flatMap((r) => [...r.traditional]))].filter(
    (t) => t !== char,
  );

  return (
    <div className="wrap wrap-narrow">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link> <span aria-hidden="true">/</span>{' '}
        <Link href={soundHref(primary.syllable)}>{primary.syllable}</Link>
      </p>

      <article className="entry">
        <header className="entry-top">
          <h1 className="entry-char" lang="zh">
            {char}
          </h1>
          <div>
            <div className="entry-pinyin">
              <span>{readings.map((r) => r.pinyin).join(', ')}</span>
            </div>
            <p className="note" style={{ marginTop: '0.35rem' }}>
              {readings.length === 1
                ? 'One reading'
                : `${readings.length} readings, each with its own thread`}
            </p>
          </div>
        </header>

        {readings.map((entry) => {
          const siblings = otherReadings(entry);
          const homophones =
            new Set(getEntriesForSyllable(entry.syllable).map((e) => e.char)).size - 1;
          return (
            <section
              className="reading"
              key={entry.pinyin}
              id={readingId(entry.pinyin, entry.tone)}
            >
              <h2 className="entry-pinyin">
                <span>{entry.pinyin}</span>
                <ToneTag tone={entry.tone} />
                {entry.invented && <InventedMark />}
              </h2>

              <Mnemonic text={entry.mnemonic} className="reading-mnemonic" as="div" />
              {coreAddsMeaning(entry.core, entry.mnemonic) && (
                <p className="reading-core core">{entry.core}</p>
              )}

              {entry.invented && (
                <p className="invented-note">
                  <span className="seal" aria-hidden="true">
                    ◇
                  </span>
                  <span>{INVENTED_TOOLTIP} It holds the senses together for recall, not for scholarship.</span>
                </p>
              )}

              <EntryTools entry={entry} />

              <dl className="facts">
                <div className="fact">
                  <dt>Sound</dt>
                  <dd>
                    <Link href={soundHref(entry.syllable)}>
                      {entry.syllable}
                    </Link>
                    {homophones > 0 && (
                      <span className="note">
                        {' '}
                        — {homophones} other {homophones === 1 ? 'character' : 'characters'}{' '}
                        share it
                      </span>
                    )}
                  </dd>
                </div>

                <div className="fact">
                  <dt>Frequency</dt>
                  <dd>
                    {entry.freqRank === null ? (
                      <>
                        not ranked{' '}
                        <span className="note">
                          — added outside the 3,000 commonest characters
                        </span>
                      </>
                    ) : (
                      <>
                        no. {entry.freqRank} of 3,000{' '}
                        <span className="note">by corpus count</span>
                      </>
                    )}
                  </dd>
                </div>

                {siblings.length > 0 && (
                  <div className="fact">
                    <dt>Also read</dt>
                    <dd className="inline-links">
                      {siblings.map((s) => (
                        <a
                          key={s.pinyin}
                          href={`#${readingId(s.pinyin, s.tone)}`}
                        >
                          {s.pinyin} — {s.core}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          );
        })}

        {(traditional.length > 0 || clusters.length > 0) && (
          <dl className="facts" style={{ marginTop: '2rem' }}>
            {traditional.length > 0 && (
              <div className="fact">
                <dt>Traditional</dt>
                <dd>
                  <Hanzi>{traditional.join(' ')}</Hanzi>
                </dd>
              </div>
            )}
            {clusters.length > 0 && (
              <div className="fact">
                <dt>Near-synonyms</dt>
                <dd className="inline-links">
                  {clusters.map((cluster) => (
                    <Link key={cluster.slug} href={meaningHref(cluster.slug)}>
                      {cluster.name}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </article>

      <p className="crumb">
        <Link href={soundHref(primary.syllable)}>
          Everything else read {primary.syllable}
        </Link>
      </p>
    </div>
  );
}
