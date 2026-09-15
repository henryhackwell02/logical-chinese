import Link from 'next/link';
import type { Entry } from '@/lib/types';
import { TONE_CONTOURS, TONE_NAMES } from '@/lib/pinyin';
import { charHref, soundHref } from '@/lib/site';
import { coreAddsMeaning } from '@/lib/mnemonic';
import Mnemonic from './Mnemonic';

export const INVENTED_TOOLTIP =
  'This thread is a memory aid, not established etymology.';

/** Hanzi always get lang="zh" so screen readers pronounce them. */
export function Hanzi({ children, className }: { children: string; className?: string }) {
  return (
    <span lang="zh" className={className ? `hanzi ${className}` : 'hanzi'}>
      {children}
    </span>
  );
}

export function InventedMark() {
  return (
    <abbr className="invented" title={INVENTED_TOOLTIP} aria-label={INVENTED_TOOLTIP}>
      ◇
    </abbr>
  );
}

export function ToneTag({ tone }: { tone: number }) {
  return (
    <span className="entry-tone">
      tone {tone === 5 ? 'neutral' : tone}{' '}
      <span className="tone-contour" aria-hidden="true">
        {TONE_CONTOURS[tone]}
      </span>
      <span className="sr-only"> — {TONE_NAMES[tone]}</span>
    </span>
  );
}

/** One reading, as a row in a list. Shared by sound, browse and meaning pages. */
export function EntryRow({ entry, showSyllable = false }: { entry: Entry; showSyllable?: boolean }) {
  return (
    <li className="row">
      <Link href={charHref(entry.char)} className="row-char" lang="zh" aria-label={entry.char}>
        {entry.char}
      </Link>
      <div className="row-head">
        <Link href={charHref(entry.char)} className="row-pinyin">
          {entry.pinyin}
        </Link>
        {entry.invented && <InventedMark />}
      </div>
      <Mnemonic text={entry.mnemonic} className="row-mnemonic" />
      {coreAddsMeaning(entry.core, entry.mnemonic) && (
        <p className="row-core core">{entry.core}</p>
      )}
      <div className="row-meta">
        {showSyllable && (
          <Link href={soundHref(entry.syllable)} className="row-meta-link">
            {entry.syllable}
          </Link>
        )}
        <span>{entry.freqRank === null ? 'added' : `no. ${entry.freqRank}`}</span>
      </div>
    </li>
  );
}

export function EntryRows({
  entries,
  showSyllable = false,
}: {
  entries: Entry[];
  showSyllable?: boolean;
}) {
  return (
    <ul className="rows">
      {entries.map((entry) => (
        <EntryRow key={`${entry.char}-${entry.pinyin}`} entry={entry} showSyllable={showSyllable} />
      ))}
    </ul>
  );
}
