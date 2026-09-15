export interface Entry {
  char: string;
  pinyin: string;
  syllable: string;
  tone: 1 | 2 | 3 | 4 | 5;
  core: string;
  mnemonic: string;
  invented: boolean;
  crossRefs: string[];
  /** Corpus rank, 1 is commonest. null for characters added outside the ranked 3,000. */
  freqRank: number | null;
  traditional: string;
}

export interface ClusterCompound {
  word: string;
  gloss: string;
}

export interface Cluster {
  name: string;
  slug: string;
  sharedIdea: string;
  chars: string[];
  notes: Record<string, string>;
  compounds: ClusterCompound[];
}
