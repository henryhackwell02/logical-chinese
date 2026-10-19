import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Practice from '@/components/Practice';
import { bySyllable, clusters } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Practise',
  description:
    'Spaced-repetition flashcards over the mnemonics. Drill a whole homophone group at once, because that is where characters actually get confused.',
  alternates: { canonical: '/practice/' },
};

/**
 * Every syllable, alphabetical, so any combination can be built from this page
 * alone. The picker scrolls and filters rather than showing a chosen few.
 */
const syllableOptions = [...bySyllable.entries()]
  .map(([syllable, group]) => ({ syllable, count: group.length }))
  .sort((a, b) => a.syllable.localeCompare(b.syllable, 'en'));

export default function PracticePage() {
  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link>
      </p>

      <header className="page-head">
        <h1>Practise</h1>
        <p className="lede">
          Flashcards over the mnemonics, spaced so the ones you miss come back sooner. Test
          in either direction, and drill several sound groups at once — the difficulty is
          rarely one character in isolation, it is telling thirteen that sound alike apart.
        </p>
      </header>

      <Suspense fallback={<p className="note">Loading…</p>}>
        <Practice
          syllableOptions={syllableOptions}
          clusterOptions={clusters.map((c) => ({
            slug: c.slug,
            name: c.name,
            chars: c.chars,
          }))}
        />
      </Suspense>

      <p className="note" style={{ marginTop: '2.5rem', maxWidth: '38rem' }}>
        Progress is kept in this browser only. There is no account, nothing is sent
        anywhere, and clearing site data clears it.
      </p>
    </div>
  );
}
