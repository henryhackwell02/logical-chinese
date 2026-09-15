import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import SiteSearch from '@/components/SiteSearch';
import { SITE, addCharUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — a Mandarin dictionary organised by sound`,
    template: `%s — ${SITE.name}`,
  },
  description:
    'Every character carries an English mnemonic with the Mandarin sound spelled out in capitals. Grouped by syllable, so homophones can finally be told apart.',
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_GB',
    title: `${SITE.name} — a Mandarin dictionary organised by sound`,
    description:
      'Every character carries an English mnemonic with the Mandarin sound spelled out in capitals.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#12181d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="shell">
          <header className="masthead">
            <div className="wrap masthead-inner">
              <Link href="/" className="wordmark">
                <span className="wordmark-han" lang="zh" aria-hidden="true">
                  声
                </span>
                {SITE.name}
              </Link>
              <div className="masthead-search">
                <SiteSearch variant="compact" />
              </div>
              <nav className="nav" aria-label="Main">
                <Link href="/browse/">Browse</Link>
                <Link href="/practice/">Practise</Link>
                <Link href="/about/">About</Link>
              </nav>
            </div>
          </header>

          <main id="main">{children}</main>

          <footer className="foot">
            <div className="wrap">
              <nav className="foot-nav" aria-label="Footer">
                <Link href="/browse/">Browse by frequency</Link>
                <Link href="/meaning/">Meaning clusters</Link>
                <Link href="/practice/">Flashcards</Link>
                <Link href="/about/">About the mnemonics</Link>
                <a href={addCharUrl()} target="_blank" rel="noreferrer noopener">
                  Add a character
                </a>
                <a href={SITE.repo} target="_blank" rel="noreferrer noopener">
                  Source and corrections
                </a>
              </nav>
              <p>
                Character, pinyin and gloss data derives from{' '}
                <a href="https://cc-cedict.org/" target="_blank" rel="noreferrer noopener">
                  CC-CEDICT
                </a>
                , used under{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  CC BY-SA 4.0
                </a>
                . The core ideas and mnemonics are original work by the site author and are
                published under the same licence.
              </p>
              <p>
                Frequency ranks reflect corpus counts for the 3,000 commonest characters,
                covering roughly 98.4% of running text.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
