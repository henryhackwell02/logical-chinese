import entriesJson from '@/data/entries.json';
import clustersJson from '@/data/clusters.json';
import type { Cluster, Entry } from './types';

// TypeScript infers a union of per-object literal types from the JSON imports,
// which does not widen to the interfaces on its own. The data is validated by
// scripts/check-data.mjs instead.
export const entries = entriesJson as unknown as Entry[];
export const clusters = clustersJson as unknown as Cluster[];

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

/**
 * Every reading of a character, tone order preserved. 226 characters have more
 * than one reading; the character page shows all of them.
 */
export const byChar: Map<string, Entry[]> = groupBy(entries, (e) => e.char);

/** Every character sharing a toneless syllable — the homophone page. */
export const bySyllable: Map<string, Entry[]> = groupBy(entries, (e) => e.syllable);

export const allChars: string[] = [...byChar.keys()];
export const allSyllables: string[] = [...bySyllable.keys()].sort((a, b) =>
  a.localeCompare(b, 'en'),
);

const clusterBySlug = new Map(clusters.map((c) => [c.slug, c]));

const clustersByChar = new Map<string, Cluster[]>();
for (const cluster of clusters) {
  for (const char of cluster.chars) {
    const bucket = clustersByChar.get(char);
    if (bucket) bucket.push(cluster);
    else clustersByChar.set(char, [cluster]);
  }
}

/** Sort key for frequency: unranked additions sort after every ranked character. */
export function rankOf(rank: number | null | undefined): number {
  return rank ?? Number.POSITIVE_INFINITY;
}

export function getEntriesForChar(char: string): Entry[] {
  const readings = byChar.get(char) ?? [];
  return [...readings].sort((a, b) => a.tone - b.tone);
}

export function getEntriesForSyllable(syllable: string): Entry[] {
  const group = bySyllable.get(syllable) ?? [];
  return [...group].sort((a, b) => a.tone - b.tone || rankOf(a.freqRank) - rankOf(b.freqRank));
}

/** Syllable entries split into tone buckets, empty tones dropped. */
export function tonesForSyllable(syllable: string): { tone: number; entries: Entry[] }[] {
  const group = getEntriesForSyllable(syllable);
  const buckets: { tone: number; entries: Entry[] }[] = [];
  for (const tone of [1, 2, 3, 4, 5]) {
    const inTone = group.filter((e) => e.tone === tone);
    if (inTone.length) buckets.push({ tone, entries: inTone });
  }
  return buckets;
}

export function getCluster(slug: string): Cluster | undefined {
  return clusterBySlug.get(slug);
}

export function getClustersForChar(char: string): Cluster[] {
  return clustersByChar.get(char) ?? [];
}

/**
 * The other readings of the same character. Derived from the grouping rather
 * than from `crossRefs`, so the link resolves even if the field drifts after a
 * hand edit — but crossRefs order is respected where it matches.
 */
export function otherReadings(entry: Entry): Entry[] {
  const siblings = getEntriesForChar(entry.char).filter((e) => e.pinyin !== entry.pinyin);
  const preferred = entry.crossRefs;
  return [...siblings].sort((a, b) => {
    const ai = preferred.indexOf(a.pinyin);
    const bi = preferred.indexOf(b.pinyin);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.tone - b.tone;
  });
}

/** The most representative reading of a character: the commonest one. */
export function primaryReading(char: string): Entry {
  const readings = getEntriesForChar(char);
  return readings.reduce(
    (best, e) => (rankOf(e.freqRank) < rankOf(best.freqRank) ? e : best),
    readings[0],
  );
}

export const FREQUENCY_BANDS = [
  { id: '1-250', label: '1 – 250', from: 1, to: 250 },
  { id: '251-500', label: '251 – 500', from: 251, to: 500 },
  { id: '501-1000', label: '501 – 1000', from: 501, to: 1000 },
  { id: '1001-1500', label: '1001 – 1500', from: 1001, to: 1500 },
  { id: '1501-2000', label: '1501 – 2000', from: 1501, to: 2000 },
  { id: '2001-2500', label: '2001 – 2500', from: 2001, to: 2500 },
  { id: '2501-3000', label: '2501 – 3000', from: 2501, to: 3000 },
  { id: 'added', label: 'added', from: null, to: null },
] as const;

export const stats = {
  entries: entries.length,
  characters: byChar.size,
  syllables: bySyllable.size,
  clusters: clusters.length,
  invented: entries.filter((e) => e.invented).length,
  multiReading: [...byChar.values()].filter((g) => g.length > 1).length,
  /** Characters added by hand, outside the ranked 3,000. */
  added: new Set(entries.filter((e) => e.freqRank === null).map((e) => e.char)).size,
};
