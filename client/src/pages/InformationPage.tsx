import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Seo, { Breadcrumbs } from '../components/Seo';
import { informationPages } from '../lib/content';
import { ADDRESS_FULL, EMAIL, MAPS_URL, PHONE_DISPLAY, PHONE_TEL, whatsappUrl } from '../lib/data';
import { webPageSchema } from '../lib/seo';

export default function InformationPage() {
  const { pathname } = useLocation();
  const page = informationPages[pathname];

  if (!page) {
    return (
      <section className="section text-center">
        <Seo title="Page Not Found | Rahim Fabrics" description="Browse Rahim Fabrics online." path={pathname} noindex={true} />
        <h1 className="font-display text-4xl text-emerald-950">Page not found</h1>
        <Link to="/" className="btn-dark mt-6">Return home</Link>
      </section>
    );
  }

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: page.h1, path: page.path },
  ];

  return (
    <>
      <Seo
        title={page.title}
        description={page.description}
        path={page.path}
        breadcrumbs={crumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          ...webPageSchema({ path: page.path, title: page.title, description: page.description }),
          dateModified: '2026-10-01',
        }}
      />
      <section className="bg-emerald-950 px-5 py-20 text-white md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <Breadcrumbs items={crumbs} tone="dark" />
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">{page.h1}</h1>
          <p className="mt-5 max-w-2xl leading-8 text-white/65">{page.description}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold-400">Last updated {page.updated}</p>
        </div>
      </section>
      <section className="section">
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {page.sections.map((section) => (
              <article key={section.heading} className="border-b border-black/10 pb-10 last:border-0">
                <h2 className="font-display text-3xl font-semibold text-emerald-950">{section.heading}</h2>
                <div className="mt-4 space-y-4 leading-8 text-black/55">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-5 list-disc space-y-2 pl-5 text-black/55">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
          <aside className="h-fit border border-emerald-950/10 bg-cream p-7 lg:sticky lg:top-32">
            <p className="eyebrow">Need assistance?</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-emerald-950">Contact Rahim Fabrics</h2>
            <div className="mt-6 space-y-4 text-sm text-black/60">
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 hover:text-emerald-900"><Phone size={17} /> {PHONE_DISPLAY}</a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 hover:text-emerald-900"><Mail size={17} /> {EMAIL}</a>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-emerald-900"><MapPin size={17} className="mt-1 shrink-0" /> {ADDRESS_FULL}</a>
            </div>
            <a
              href={whatsappUrl(`Assalam-o-Alaikum, I need help regarding ${page.h1}.`)}
              target="_blank"
              rel="noreferrer"
              className="btn-dark mt-7 w-full"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
