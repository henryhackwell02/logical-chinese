import type { Metadata } from 'next';
import Link from 'next/link';
import { clusters, stats } from '@/lib/data';
import { meaningHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Meaning clusters',
  description:
    'Groups of near-synonym characters that share an idea, with the distinction between them set out one character at a time.',
  alternates: { canonical: '/meaning/' },
};

export default function MeaningIndexPage() {
  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link>
      </p>

      <header className="page-head">
        <h1>Meaning clusters</h1>
        <p className="lede">
          Sound groups solve one problem: characters that are easy to confuse because they
          sound alike. These solve the other one. {stats.clusters} sets of near-synonyms,
          each with the shared idea stated plainly and the difference between members drawn
          character by character.
        </p>
      </header>

      <ul className="cluster-list">
        {clusters.map((cluster) => (
          <li key={cluster.slug}>
            <Link href={meaningHref(cluster.slug)} className="cluster-item">
              <h2>{cluster.name}</h2>
              <p className="cluster-idea">{cluster.sharedIdea}</p>
              <p className="cluster-chars" lang="zh">
                {cluster.chars.join('')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
