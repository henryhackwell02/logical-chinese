'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { search, type Hit, type IndexRow } from '@/lib/search';
import { coreAddsMeaning, parseMnemonic } from '@/lib/mnemonic';
import { addCharUrl, charHref } from '@/lib/site';

/**
 * The index is a lazily-imported chunk rather than a fetch: no API, no search
 * library, and nothing downloaded until someone actually reaches for the box.
 */
let indexPromise: Promise<IndexRow[]> | null = null;
function loadIndex(): Promise<IndexRow[]> {
  if (!indexPromise) {
    indexPromise = import('@/lib/generated/search-index.json').then(
      (mod) => (mod.default ?? mod) as unknown as IndexRow[],
    );
  }
  return indexPromise;
}

function HitMnemonic({ text }: { text: string }) {
  return (
    <span className="search-hit-mnemonic mnemonic">
      {parseMnemonic(text).map((seg, i) =>
        seg.lit ? (
          <mark className="lit" key={i}>
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}

export default function SiteSearch({ variant = 'compact' }: { variant?: 'compact' | 'hero' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const warm = useCallback(() => {
    if (!index) void loadIndex().then(setIndex);
  }, [index]);

  // Anything typed before React hydrated is sitting in the DOM but not in
  // state, and would otherwise be swallowed. Adopt it on mount.
  useEffect(() => {
    const typedEarly = inputRef.current?.value;
    if (typedEarly) {
      setQuery(typedEarly);
      setOpen(true);
      void loadIndex().then(setIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!index || !query.trim()) {
      setHits([]);
      return;
    }
    setHits(search(index, query));
    setActive(0);
  }, [index, query]);

  // `/` focuses search from anywhere. The hero box wins when both are present.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const boxes = Array.from(
        document.querySelectorAll<HTMLInputElement>('[data-search-input]'),
      );
      const preferred = boxes.find((b) => b.dataset.searchInput === 'hero') ?? boxes[0];
      if (preferred !== inputRef.current) return;
      event.preventDefault();
      preferred.focus();
      preferred.select();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  function go(hit: Hit) {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(charHref(hit.char));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!hits.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % hits.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(hits[active] ?? hits[0]);
    }
  }

  const showResults = open && query.trim().length > 0;

  return (
    <div
      className={`search ${variant === 'hero' ? 'search-hero' : 'search-compact'}`}
      ref={boxRef}
    >
      <div className="search-field">
        <input
          ref={inputRef}
          type="search"
          value={query}
          data-search-input={variant}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search by character, pinyin or English"
          placeholder={
            variant === 'hero'
              ? 'A character, a sound, or an English word'
              : 'Search'
          }
          onFocus={() => {
            warm();
            setOpen(true);
          }}
          onChange={(event) => {
            warm();
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            clear
          </button>
        ) : (
          <kbd className="search-key" aria-hidden="true">
            /
          </kbd>
        )}
      </div>

      {showResults && (
        <div className="search-results" id={listId} role="listbox">
          {hits.length === 0 ? (
            <p className="search-empty">
              {!index ? (
                'Loading the dictionary…'
              ) : /^\p{Script=Han}$/u.test(query.trim()) ? (
                <>
                  <span lang="zh">{query.trim()}</span> is not in the dictionary yet.{' '}
                  <a href={addCharUrl(query.trim())} target="_blank" rel="noreferrer noopener">
                    Add it
                  </a>
                </>
              ) : (
                'Nothing matches. Try a pinyin syllable without tone marks, or an English word from a mnemonic.'
              )}
            </p>
          ) : (
            hits.map((hit, i) => (
              <button
                type="button"
                key={`${hit.char}-${hit.pinyin}`}
                className="search-hit"
                role="option"
                aria-selected={i === active}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit)}
              >
                <span className="search-hit-char" lang="zh">
                  {hit.char}
                </span>
                <span className="search-hit-line">
                  <span className="search-hit-pinyin">{hit.pinyin}</span>
                  <HitMnemonic text={hit.mnemonic} />
                </span>
                {coreAddsMeaning(hit.core, hit.mnemonic) && (
                  <span className="search-hit-core">{hit.core}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
