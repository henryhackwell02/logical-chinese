import { parseMnemonic } from '@/lib/mnemonic';

/**
 * The product. Every run of two or more capitals carries the Mandarin sound and
 * is lit; never render a mnemonic as plain text.
 */
export default function Mnemonic({
  text,
  className,
  as: Tag = 'p',
}: {
  text: string;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2';
}) {
  const segments = parseMnemonic(text);
  return (
    <Tag className={className ? `mnemonic ${className}` : 'mnemonic'} lang="en">
      {segments.map((segment, i) =>
        segment.lit ? (
          <mark className="lit" key={i}>
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </Tag>
  );
}
