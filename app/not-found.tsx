import Link from 'next/link';
import SiteSearch from '@/components/SiteSearch';

export default function NotFound() {
  return (
    <div className="wrap wrap-narrow">
      <header className="page-head" style={{ paddingTop: '3rem' }}>
        <h1>Nothing here</h1>
        <p className="lede">
          That character or sound is not in the set. The dictionary covers the commonest
          3,000 characters; anything rarer has no entry yet.
        </p>
      </header>
      <SiteSearch variant="hero" />
      <p className="crumb">
        <Link href="/browse/">Browse everything</Link>
      </p>
    </div>
  );
}
