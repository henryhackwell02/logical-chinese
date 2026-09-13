import type { MetadataRoute } from 'next';
import { allChars, allSyllables, clusters } from '@/lib/data';
import { SITE } from '@/lib/site';

/**
 * Every entry, syllable and cluster page. Generated at build time and emitted
 * as a static sitemap.xml by the export.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, '');

  const fixed = ['/', '/browse/', '/meaning/', '/practice/', '/about/'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));

  const sounds = allSyllables.map((syllable) => ({
    url: `${base}/sound/${encodeURIComponent(syllable)}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const meanings = clusters.map((cluster) => ({
    url: `${base}/meaning/${cluster.slug}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const chars = allChars.map((char) => ({
    url: `${base}/char/${encodeURIComponent(char)}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...fixed, ...sounds, ...meanings, ...chars];
}
