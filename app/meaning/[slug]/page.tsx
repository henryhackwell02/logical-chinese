import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Mnemonic from '@/components/Mnemonic';
import { InventedMark } from '@/components/Bits';
import { RichNote, isRemark } from '@/components/ClusterBits';
import { byChar, clusters, getCluster, primaryReading } from '@/lib/data';
import { coreAddsMeaning } from '@/lib/mnemonic';
import { charHref, meaningHref, soundHref } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return clusters.map((cluster) => ({ slug: cluster.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cluster = getCluster(params.slug);
  if (!cluster) return {};
  return {
    title: `${cluster.name} — ${cluster.chars.join(' ')}`,
    description: `${cluster.chars.join(' ')} all mean roughly the same thing: ${cluster.sharedIdea} What separates them, character by character.`,
    alternates: { canonical: meaningHref(cluster.slug) },
    openGraph: {
      type: 'article',
      title: `${cluster.name} — ${cluster.chars.join(' ')}`,
      description: cluster.sharedIdea,
    },
  };
}

export default function ClusterPage({ params }: { params: { slug: string } }) {
  const cluster = getCluster(params.slug);
  if (!cluster) notFound();

  const known = cluster.chars.filter((char) => byChar.has(char));
  const compounds = cluster.compounds.filter((c) => !isRemark(c));
  const remarks = cluster.compounds.filter(isRemark);

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link> <span aria-hidden="true">/</span>{' '}
        <Link href="/meaning/">meanings</Link>
      </p>

      <header className="page-head">
        <h1>{cluster.name}</h1>
        <p className="lede">
          {cluster.chars.join(' ')} — {cluster.sharedIdea}
        </p>
      </header>

      <section>
        <div className="section-head">
          <h2>What separates them</h2>
          <p className="section-more">{cluster.chars.length} characters</p>
        </div>
        <ul className="contrast">
          {cluster.chars.map((char) => {
            const note = cluster.notes[char];
            const entry = byChar.has(char) ? primaryReading(char) : null;
            return (
              <li className="contrast-row" key={char}>
                {entry ? (
                  <Link href={charHref(char)} className="contrast-char" lang="zh">
                    {char}
                  </Link>
                ) : (
                  <span className="contrast-char" lang="zh">
                    {char}
                  </span>
                )}
                <div className="row-head">
                  {entry && (
                    <Link href={soundHref(entry.syllable)} className="row-pinyin">
                      {entry.pinyin}
                    </Link>
                  )}
                  {entry?.invented && <InventedMark />}
                  {entry && <Mnemonic text={entry.mnemonic} className="row-mnemonic" as="span" />}
                </div>
                <p className="contrast-note">
                  {note ? (
                    <RichNote text={note} />
                  ) : entry && coreAddsMeaning(entry.core, entry.mnemonic) ? (
                    entry.core
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {compounds.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Attested compounds</h2>
            <p className="section-more">how the pairs actually combine</p>
          </div>
          <ul className="compounds">
            {compounds.map((compound, i) => (
              <li className="compound" key={`${compound.word}-${i}`}>
                <span className="compound-word" lang="zh">
                  {compound.word}
                </span>
                <span className="compound-gloss">{compound.gloss}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {remarks.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Worth noticing</h2>
          </div>
          {remarks.map((remark, i) => (
            <p className="remark" key={i}>
              <span className="hanzi" lang="zh">
                {remark.word}
              </span>{' '}
              {remark.gloss}
            </p>
          ))}
        </section>
      )}

      <p className="crumb">
        {known.length > 0 && (
          <Link href={`/practice/?cluster=${cluster.slug}`}>
            Drill these {known.length} characters as flashcards
          </Link>
        )}
      </p>
    </div>
  );
}
