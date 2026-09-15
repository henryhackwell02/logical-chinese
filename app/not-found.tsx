import Link from 'next/link';
import SiteSearch from '@/components/SiteSearch';
import { addCharUrl } from '@/lib/site';

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
        <span aria-hidden="true"> &nbsp;&nbsp; </span>
        <a href={addCharUrl()} target="_blank" rel="noreferrer noopener">
          Add a missing character
        </a>
      </p>
    </div>
  );
}
