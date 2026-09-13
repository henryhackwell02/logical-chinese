import type { Metadata } from 'next';
import Link from 'next/link';
import Mnemonic from '@/components/Mnemonic';
import { coreAddsMeaning } from '@/lib/mnemonic';
import { entries, primaryReading, stats } from '@/lib/data';
import { SITE } from '@/lib/site';
import { charHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How the mnemonics work, what a core idea is, why 29 of the threads are invented, and where the underlying data comes from.',
  alternates: { canonical: '/about/' },
};

const worked = primaryReading('灿');
const inventedExamples = entries.filter((e) => e.invented).slice(0, 5);

export default function AboutPage() {
  return (
    <div className="wrap wrap-narrow">
      <p className="crumb">
        <Link href="/">Logical Chinese</Link>
      </p>

      <header className="page-head">
        <h1>About</h1>
        <p className="lede">
          A Mandarin dictionary organised by sound, built for remembering. It is a memory
          system first and a reference second, and the ordering follows from that.
        </p>
      </header>

      <div className="prose">
        <h2>How a mnemonic works</h2>
        <p>
          Every reading carries an English phrase with the Mandarin sound spelled out
          inside it. The letters that carry the sound are capitalised, and the site lights
          them up wherever they appear:
        </p>
      </div>

      <div style={{ margin: '1.5rem 0', paddingLeft: '0.9rem', borderLeft: '2px solid var(--rule-firm)' }}>
        <p className="hero-read">
          <span className="hanzi" lang="zh">
            {worked.char}
          </span>{' '}
          {worked.pinyin}
        </p>
        <Mnemonic text={worked.mnemonic} className="reading-mnemonic" as="div" />
        <p className="core">{worked.core}</p>
      </div>

      <div className="prose">
        <p>
          Say the phrase, hear the syllable, and the character has somewhere to live. The
          rule for reading the page is simple: whatever is lit carries the Mandarin, and
          everything unlit is just English holding it together. Sometimes that is a block
          of letters inside a longer word, sometimes a few letters picked out across one,
          and sometimes — <Mnemonic text="anchor" as="span" /> for ān,{' '}
          <Mnemonic text="beaker" as="span" /> for bēi — a whole short word that simply
          sounds like the syllable.
        </p>

        <h2>What a core idea is</h2>
        <p>
          Under each mnemonic sits one short line in serif — the core idea. A character in
          Chinese usually has several dictionary senses, and listing them separately is how
          a dictionary teaches you to forget them. The core idea is an attempt at the one
          thread running through all of them, so that the senses hang off something rather
          than floating free. For {' '}
          <Link href={charHref('过')}>过</Link> it is &ldquo;passed across and
          beyond&rdquo;, which covers crossing a road, exceeding a limit, and the marker of
          having been through something.
        </p>

        <h2>Why it is organised by sound</h2>
        <p>
          Mandarin has roughly 400 syllables to carry several thousand characters, so
          homophones pile up. Learners do not usually fail to recognise a character in
          isolation; they fail to tell it from the other twelve that sound identical. So
          the syllable, not the radical and not the alphabet, is the primary axis here.
          Every <Link href="/browse/#sounds">sound page</Link> puts the whole group side by
          side, sorted by tone, with a different mnemonic on each — which is the thing that
          actually does the separating.
        </p>

        <h2>The invented threads</h2>
        <p>
          {stats.invented} of the {stats.entries.toLocaleString('en-GB')} threads are not
          real etymology. They are marked with a{' '}
          <span className="seal" aria-hidden="true">
            ◇
          </span>{' '}
          everywhere they appear, and can be filtered out on{' '}
          <Link href="/browse/">the browse page</Link>.
        </p>
        <p>
          Nearly all of them come from the same cause. Simplification folded pairs of
          unrelated traditional characters into a single shape, so one modern character can
          hold two histories that have nothing to do with each other. 发 is 發 and 髮 at
          once; 后 is 后 and 後. A thread through both is a fiction. It is still a useful
          fiction, because a learner has to remember one shape either way, so a made-up
          thread is written and labelled as made up.
        </p>
      </div>

      <ul className="rows" style={{ marginTop: '1.25rem' }}>
        {inventedExamples.map((entry) => (
          <li className="row" key={`${entry.char}-${entry.pinyin}`}>
            <Link href={charHref(entry.char)} className="row-char" lang="zh">
              {entry.char}
            </Link>
            <div className="row-head">
              <span className="row-pinyin">{entry.pinyin}</span>
              <span className="seal" aria-hidden="true">
                ◇
              </span>
            </div>
            <Mnemonic text={entry.mnemonic} className="row-mnemonic" />
            {coreAddsMeaning(entry.core, entry.mnemonic) && (
              <p className="row-core core">{entry.core}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="prose">
        <h2>Coverage</h2>
        <p>
          {stats.characters.toLocaleString('en-GB')} characters, the commonest 3,000 by
          corpus frequency, which between them account for about 98.4% of running text.
          Characters with more than one reading — {stats.multiReading} of them — get a
          separate thread for each reading, because a different sound is usually a
          different word. There are {stats.syllables} syllable pages and {stats.clusters}{' '}
          <Link href="/meaning/">meaning clusters</Link> of near-synonyms.
        </p>

        <h2>If a mnemonic is bad</h2>
        <p>
          Some of them are. Every entry has a link that opens a prefilled issue on GitHub
          with the character, the current mnemonic and a template, so a better one takes
          about a minute to propose. Corrections to the core ideas are as welcome as
          corrections to the mnemonics.{' '}
          <a href={SITE.repo} target="_blank" rel="noreferrer noopener">
            The repository is here.
          </a>
        </p>

        <h2>Sources and licence</h2>
        <p>
          The substrate — characters, pinyin readings, traditional variants and the glosses
          the core ideas were written against — derives from{' '}
          <a href="https://cc-cedict.org/" target="_blank" rel="noreferrer noopener">
            CC-CEDICT
          </a>
          , used under{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Creative Commons Attribution-ShareAlike 4.0
          </a>
          . Frequency ranks come from published character-frequency counts of modern
          written Chinese.
        </p>
        <p>
          The core ideas, the mnemonics and the meaning clusters are original work by the
          site author, and are published under the same CC BY-SA 4.0 licence — reuse them,
          credit them, and share what you build on them the same way.
        </p>

        <h2>How it is built</h2>
        <p>
          A statically exported Next.js site with no database and no search server. The
          whole dictionary lives in two hand-edited JSON files in the repository; the
          search index is built from them and runs entirely in your browser. Audio uses
          your browser&rsquo;s own speech synthesis, and flashcard progress is kept in{' '}
          <code>localStorage</code>. Nothing you do here is sent anywhere.
        </p>
      </div>
    </div>
  );
}
