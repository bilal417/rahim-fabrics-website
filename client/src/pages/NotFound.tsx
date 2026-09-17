import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found | Rahim Fabrics"
        description="The requested page could not be found. Browse Rahim Fabrics' current gents fabric collection."
        path={window.location.pathname}
        noindex={true}
      />
      <section className="section text-center">
        <p className="eyebrow">404 error</p>
        <h1 className="mt-3 font-display text-4xl text-ink-950 md:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-black/60">
          This page may have moved or no longer exists. Visit our catalogue to see the latest fabrics.
        </p>
        <Link to="/catalogue" className="btn-dark mt-7">
          Browse catalogue
        </Link>
      </section>
    </>
  );
}
