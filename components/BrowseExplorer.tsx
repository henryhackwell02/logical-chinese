'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { coreAddsMeaning } from '@/lib/mnemonic';
import Mnemonic from './Mnemonic';
import { InventedMark } from './Bits';
import type { IndexRow } from '@/lib/search';
import { TONE_NAMES } from '@/lib/pinyin';
import { charHref, soundHref } from '@/lib/site';

interface Band {
  id: string;
  label: string;
  /** Both null for the band of unranked, hand-added characters. */
  from: number | null;
  to: number | null;
}

const r = (n: number | null) => n ?? Number.POSITIVE_INFINITY;

export default function BrowseExplorer({
  bands,
  clusterOptions,
}: {
  bands: Band[];
  clusterOptions: { slug: string; name: string; chars: string[] }[];
}) {
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [band, setBand] = useState(bands[0].id);
  const [tone, setTone] = useState<number | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [hideInvented, setHideInvented] = useState(false);

  useEffect(() => {
    let live = true;
    import('@/lib/generated/search-index.json').then((mod) => {
      if (live) setIndex((mod.default ?? mod) as unknown as IndexRow[]);
    });
    return () => {
      live = false;
    };
  }, []);

  const clusterChars = useMemo(() => {
    if (!cluster) return null;
    const found = clusterOptions.find((c) => c.slug === cluster);
    return found ? new Set(found.chars) : null;
  }, [cluster, clusterOptions]);

  const rows = useMemo(() => {
    if (!index) return [];
    const active = bands.find((b) => b.id === band)!;
    return index
      .filter((row) => {
        if (cluster) {
          if (!clusterChars?.has(row[0])) return false;
        } else if (active.from === null) {
          if (row[6] !== null) return false;
        } else if (row[6] === null || row[6] < active.from || row[6] > active.to!) {
          return false;
        }
        if (tone !== null && row[3] !== tone) return false;
        if (hideInvented && row[8] === 1) return false;
        return true;
      })
      .sort((a, b) => r(a[6]) - r(b[6]) || a[3] - b[3] || a[0].localeCompare(b[0]));
  }, [index, band, tone, cluster, hideInvented, clusterChars, bands]);

  return (
    <>
      <div className="controls">
        <div className="control">
          <span className="control-label" id="band-label">
            Frequency
          </span>
          <ul className="chips" role="group" aria-labelledby="band-label">
            {bands.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={!cluster && band === b.id}
                  onClick={() => {
                    setBand(b.id);
                    setCluster(null);
                  }}
                >
                  {b.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="control">
          <span className="control-label" id="tone-label">
            Tone
          </span>
          <ul className="chips" role="group" aria-labelledby="tone-label">
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={tone === null}
                onClick={() => setTone(null)}
              >
                any
              </button>
            </li>
            {[1, 2, 3, 4, 5].map((t) => (
              <li key={t}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={tone === t}
                  onClick={() => setTone(tone === t ? null : t)}
                  title={TONE_NAMES[t]}
                >
                  {t === 5 ? 'neutral' : t}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="control">
          <span className="control-label" id="cluster-label">
            Meaning
          </span>
          <ul className="chips" role="group" aria-labelledby="cluster-label">
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={cluster === null}
                onClick={() => setCluster(null)}
              >
                any
              </button>
            </li>
            {clusterOptions.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={cluster === c.slug}
                  onClick={() => setCluster(cluster === c.slug ? null : c.slug)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="control">
          <span className="control-label" id="threads-label">
            Threads
          </span>
          <ul className="chips" role="group" aria-labelledby="threads-label">
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={hideInvented}
                onClick={() => setHideInvented((v) => !v)}
              >
                hide invented <span className="seal" aria-hidden="true">◇</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <p className="note" aria-live="polite" style={{ marginBottom: '0.75rem' }}>
        {index
          ? `${rows.length} ${rows.length === 1 ? 'reading' : 'readings'}${
              cluster ? ' in this cluster' : ''
            }`
          : 'Loading the dictionary…'}
      </p>

      <ul className="rows">
        {rows.map((row) => (
          <li className="row" key={`${row[0]}-${row[1]}`}>
            <Link href={charHref(row[0])} className="row-char" lang="zh" aria-label={row[0]}>
              {row[0]}
            </Link>
            <div className="row-head">
              <Link href={charHref(row[0])} className="row-pinyin">
                {row[1]}
              </Link>
              {row[8] === 1 && <InventedMark />}
            </div>
            <Mnemonic text={row[5]} className="row-mnemonic" />
            {coreAddsMeaning(row[4], row[5]) && <p className="row-core core">{row[4]}</p>}
            <div className="row-meta">
              <Link href={soundHref(row[2])}>{row[2]}</Link>
              <span>{row[6] === null ? 'added' : `no. ${row[6]}`}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
