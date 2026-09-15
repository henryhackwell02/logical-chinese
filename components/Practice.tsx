'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { coreAddsMeaning } from '@/lib/mnemonic';
import Mnemonic from './Mnemonic';
import { InventedMark } from './Bits';
import type { IndexRow } from '@/lib/search';
import { charHref, soundHref } from '@/lib/site';

const STORE = 'lc-progress-v1';
const DIRECTION_STORE = 'lc-direction-v1';

/** Leitner boxes: a miss drops you to box 1, a hit moves you up one. */
const INTERVALS_MS = [0, 6e4 * 10, 864e5, 3 * 864e5, 7 * 864e5, 21 * 864e5];

/**
 * Recognition and recall are different skills that fail in different places.
 * Seeing 张 and reaching for the sound is what reading asks of you; holding
 * "opened and spread" and reaching for the character is what writing asks, and
 * it is much the harder of the two. Both directions drill the same deck.
 */
type Direction = 'zh-en' | 'en-zh';

interface Card {
  box: number;
  due: number;
}
type Progress = Record<string, Card>;

function readProgress(): Progress {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE) ?? '{}') as Progress;
  } catch {
    return {};
  }
}

function writeProgress(progress: Progress) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(progress));
  } catch {
    /* private browsing; the session still works, it just will not persist */
  }
}

const idOf = (row: IndexRow) => `${row[0]}-${row[1]}`;

export default function Practice({
  crowded,
  clusterOptions,
}: {
  crowded: { syllable: string; count: number }[];
  clusterOptions: { slug: string; name: string; chars: string[] }[];
}) {
  const params = useSearchParams();
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [direction, setDirection] = useState<Direction>('zh-en');
  const [syllable, setSyllable] = useState<string | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    setProgress(readProgress());
    try {
      const saved = window.localStorage.getItem(DIRECTION_STORE);
      if (saved === 'zh-en' || saved === 'en-zh') setDirection(saved);
    } catch {
      /* ignore */
    }
    import('@/lib/generated/search-index.json').then((mod) =>
      setIndex((mod.default ?? mod) as unknown as IndexRow[]),
    );
  }, []);

  useEffect(() => {
    setSyllable(params.get('syllable'));
    setCluster(params.get('cluster'));
    setCurrent(null);
    setRevealed(false);
  }, [params]);

  function chooseDirection(next: Direction) {
    setDirection(next);
    setRevealed(false);
    try {
      window.localStorage.setItem(DIRECTION_STORE, next);
    } catch {
      /* ignore */
    }
  }

  const clusterChars = useMemo(() => {
    if (!cluster) return null;
    const found = clusterOptions.find((c) => c.slug === cluster);
    return found ? new Set(found.chars) : null;
  }, [cluster, clusterOptions]);

  const deck = useMemo(() => {
    if (!index) return [];
    if (syllable) return index.filter((row) => row[2] === syllable);
    if (clusterChars) return index.filter((row) => clusterChars.has(row[0]));
    return index.filter((row) => row[6] !== null && row[6] <= 500);
  }, [index, syllable, clusterChars]);

  /** Next card: the one that has been waiting longest, unseen counting as due now. */
  const pick = useCallback(
    (from: IndexRow[], store: Progress, avoid: string | null): string | null => {
      if (!from.length) return null;
      const now = Date.now();
      const pool = from.filter((row) => from.length === 1 || idOf(row) !== avoid);
      const due = pool.filter((row) => (store[idOf(row)]?.due ?? 0) <= now);
      const choices = due.length ? due : pool;
      let bestDue = Infinity;
      for (const row of choices) {
        const rowDue = store[idOf(row)]?.due ?? 0;
        if (rowDue < bestDue) bestDue = rowDue;
      }
      const tied = choices.filter((row) => (store[idOf(row)]?.due ?? 0) === bestDue);
      return idOf(tied[Math.floor(Math.random() * tied.length)]);
    },
    [],
  );

  useEffect(() => {
    if (!current && deck.length) setCurrent(pick(deck, progress, null));
  }, [current, deck, progress, pick]);

  const card = useMemo(
    () => deck.find((row) => idOf(row) === current) ?? null,
    [deck, current],
  );

  function grade(hit: boolean) {
    if (!card) return;
    const id = idOf(card);
    const box = hit ? Math.min((progress[id]?.box ?? 0) + 1, 5) : 1;
    const next: Progress = {
      ...progress,
      [id]: { box, due: Date.now() + INTERVALS_MS[box] },
    };
    setProgress(next);
    writeProgress(next);
    setSeen((n) => n + 1);
    setRevealed(false);
    setCurrent(pick(deck, next, id));
  }

  const learned = deck.filter((row) => (progress[idOf(row)]?.box ?? 0) >= 3).length;
  const started = deck.filter((row) => progress[idOf(row)]).length;

  const scopeLabel = syllable
    ? `everything read ${syllable}`
    : cluster
      ? (clusterOptions.find((c) => c.slug === cluster)?.name.toLowerCase() ?? 'this cluster')
      : 'every reading ranked 1 to 500';

  // A syllable reached from a sound page is usually not one of the twelve
  // fullest, so it needs a chip of its own or nothing appears to be selected.
  const syllableChips = useMemo(() => {
    if (syllable && !crowded.some((c) => c.syllable === syllable)) {
      return [{ syllable, count: deck.length }, ...crowded];
    }
    return crowded;
  }, [crowded, syllable, deck.length]);

  const answer = card && (
    <>
      <p className="card-reading">
        <Link href={charHref(card[0])} lang="zh" className="card-answer-char">
          {card[0]}
        </Link>
        <span>{card[1]}</span>
        {card[8] === 1 && <InventedMark />}
      </p>
      <Mnemonic text={card[5]} className="card-mnemonic" as="div" />
      {coreAddsMeaning(card[4], card[5]) && <p className="core">{card[4]}</p>}
    </>
  );

  return (
    <>
      <div className="drill-bar">
        <div className="control">
          <span className="control-label" id="direction-label">
            Test
          </span>
          <ul className="chips" role="group" aria-labelledby="direction-label">
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={direction === 'zh-en'}
                onClick={() => chooseDirection('zh-en')}
              >
                character first
              </button>
            </li>
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={direction === 'en-zh'}
                onClick={() => chooseDirection('en-zh')}
              >
                meaning first
              </button>
            </li>
          </ul>
        </div>
        <p className="note">
          Drilling {scopeLabel} — {deck.length} {deck.length === 1 ? 'card' : 'cards'}.
          {syllable && (
            <>
              {' '}
              <Link href={soundHref(syllable)}>See the whole group laid out</Link>.
            </>
          )}
        </p>
      </div>

      {!index && <p className="note">Loading the dictionary…</p>}

      {card && (
        <div className="card">
          {direction === 'zh-en' ? (
            <>
              <p className="card-prompt">
                {revealed ? 'the thread' : 'How is it read, and what is the thread?'}
              </p>
              <p className="card-char" lang="zh">
                {card[0]}
              </p>
            </>
          ) : (
            <>
              <p className="card-prompt">
                {revealed ? 'the character' : 'Which character is this, and how is it read?'}
              </p>
              <p className="card-idea core">{card[4]}</p>
            </>
          )}

          {revealed && <div className="card-answer">{answer}</div>}

          <div className="card-actions">
            {revealed ? (
              <>
                <button type="button" className="btn" onClick={() => grade(false)}>
                  Missed it
                </button>
                <button type="button" className="btn" onClick={() => grade(true)}>
                  Got it
                </button>
              </>
            ) : (
              <button type="button" className="btn" onClick={() => setRevealed(true)}>
                Reveal
              </button>
            )}
          </div>
        </div>
      )}

      {index && !card && (
        <p className="note">Nothing in this deck yet. Pick another sound or meaning below.</p>
      )}

      <div className="progress">
        <span>{seen} answered this session</span>
        <span>
          {started} of {deck.length} started
        </span>
        <span>{learned} settling in</span>
        <button
          type="button"
          className="btn-quiet"
          style={{ padding: 0, textDecoration: 'underline' }}
          onClick={() => {
            if (!window.confirm('Clear all flashcard progress on this device?')) return;
            setProgress({});
            writeProgress({});
            setSeen(0);
          }}
        >
          Reset progress
        </button>
      </div>

      <div className="controls" style={{ marginTop: '2.5rem' }}>
        <div className="control">
          <span className="control-label" id="drill-label">
            Drill a sound
          </span>
          <ul className="chips" role="group" aria-labelledby="drill-label">
            <li>
              <Link href="/practice/" className="chip" data-on={!syllable && !cluster}>
                commonest 500
              </Link>
            </li>
            {syllableChips.map((s) => (
              <li key={s.syllable}>
                <Link
                  href={`/practice/?syllable=${encodeURIComponent(s.syllable)}`}
                  className="chip"
                  data-on={syllable === s.syllable}
                >
                  {s.syllable}
                  <span className="chip-count">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="control">
          <span className="control-label" id="drill-cluster">
            Or a meaning
          </span>
          <ul className="chips" role="group" aria-labelledby="drill-cluster">
            {clusterOptions.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/practice/?cluster=${c.slug}`}
                  className="chip"
                  data-on={cluster === c.slug}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
