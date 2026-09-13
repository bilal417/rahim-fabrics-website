import { BadgeCheck, Handshake, MapPin } from 'lucide-react';
import Seo, { Breadcrumbs } from '../components/Seo';
import { localBusinessSchema, organizationSchema, pageSeo, webPageSchema } from '../lib/seo';

const seo = pageSeo.about;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Our Story', path: '/about' },
];

export default function About() {
  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={crumbs}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            ...webPageSchema({
              path: seo.path,
              title: seo.title,
              description: seo.description,
              type: 'AboutPage',
            }),
          },
          { '@context': 'https://schema.org', ...organizationSchema },
          { '@context': 'https://schema.org', ...localBusinessSchema },
        ]}
      />
      <section className="relative grid min-h-[560px] place-items-center overflow-hidden bg-emerald-950 px-5 text-center text-white">
        <img
          src="/images/showroom-hero.png"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          alt="Rahim Fabrics showroom in Azam Market Lahore"
        />
        <div className="relative max-w-3xl">
          <div className="flex justify-center">
            <Breadcrumbs items={crumbs} tone="dark" />
          </div>
          <p className="eyebrow">Our story · Azam Market</p>
          <h1 className="mt-5 font-display text-5xl font-semibold md:text-7xl">
            {seo.h1}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl leading-8 text-white/60">
            Rahim Fabrics is a trusted Azam Market fabric wholesaler serving retailers, dealers and boutiques with quality gents fabrics by the thaan across Pakistan.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-3">
          {[
            [
              MapPin,
              'Market rooted',
              'We understand wholesale because we work at the heart of Lahore’s fabric trade in Azam Market.',
            ],
            [
              BadgeCheck,
              'Quality minded',
              'Each range is selected for handle, colour, tailoring and dependable customer value.',
            ],
            [
              Handshake,
              'Relationship led',
              'Clear communication and repeat business matter more than one-off transactions.',
            ],
          ].map(([Icon, t, d]) => (
            <div key={String(t)}>
              <Icon className="text-gold-500" size={28} />
              <h2 className="mt-5 font-display text-2xl font-semibold text-emerald-950">{String(t)}</h2>
              <p className="mt-3 leading-7 text-black/50">{String(d)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
