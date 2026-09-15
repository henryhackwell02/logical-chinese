import { Fragment } from 'react';
import type { ClusterCompound } from '@/lib/types';
import { Hanzi } from './Bits';

/** Cluster notes occasionally carry **bold** runs; render them rather than show the asterisks. */
export function RichNote({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Hanzi key={i}>{part.slice(2, -2)}</Hanzi>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const HAN = /[\u3400-\u9fff]/;

/**
 * A few entries in `compounds` are sentences about the cluster rather than
 * word-and-gloss pairs. They read as prose, so they are set as prose.
 */
export function isRemark(compound: ClusterCompound): boolean {
  const { gloss } = compound;
  return /[.,]$/.test(gloss) || HAN.test(gloss) || gloss.length > 28;
}
