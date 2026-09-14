import { CheckCircle2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import Seo, { Breadcrumbs } from '../components/Seo';
import { api } from '../lib/api';
import { whatsappUrl } from '../lib/data';
import { pageSeo, SITE_URL, webPageSchema } from '../lib/seo';

const seo = pageSeo.wholesale;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Wholesale', path: '/wholesale' },
];

export default function Wholesale() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const serviceSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Gents fabric wholesale supply',
      serviceType: 'Textile wholesale',
      provider: { '@id': `${SITE_URL}/#localbusiness` },
      areaServed: 'Pakistan',
      description: seo.description,
      url: `${SITE_URL}/wholesale`,
    }),
    [],
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      await api.post('/inquiries', payload);
      setSent(true);
    } catch {
      window.open(
        whatsappUrl(
          `Wholesale registration — Business: ${payload.businessName}, Owner: ${payload.customerName}, City: ${payload.city}, Phone: ${payload.phone}, Shop type: ${payload.shopType}, Monthly requirement: ${payload.monthlyRequirement}`,
        ),
        '_blank',
      );
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

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
              type: 'ContactPage',
            }),
          },
          serviceSchema,
        ]}
      />
      <section className="min-h-[750px] bg-cream">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-[420px] overflow-hidden bg-emerald-950 p-8 text-white md:p-14 lg:min-h-[750px] lg:p-16">
            <img
              src="/images/showroom-hero.png"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
              alt="Rahim Fabrics wholesale showroom New Azam Cloth Market Lahore"
            />
            <div className="relative">
              <Breadcrumbs items={crumbs} tone="dark" />
              <p className="eyebrow">Trade account · Lahore</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-tight">
                {seo.h1}
              </h1>
              <p className="mt-6 max-w-md leading-8 text-white/60">
                Tell us what your customers buy. Our New Azam Cloth Market wholesale desk will contact you with suitable lots, current thaan availability and trade prices.
              </p>
              <ul className="mt-10 space-y-4">
                {[
                  'Direct wholesale assistance',
                  'Thaan-based order planning',
                  'New collection updates',
                  'Nationwide dispatch support',
                ].map((x) => (
                  <li className="flex items-center gap-3 text-sm" key={x}>
                    <CheckCircle2 size={18} className="text-gold-400" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center p-6 md:p-14 lg:p-20">
            {sent ? (
              <div className="max-w-md">
                <CheckCircle2 size={45} className="text-gold-500" />
                <h2 className="mt-6 font-display text-4xl font-semibold text-emerald-950">
                  Registration received.
                </h2>
                <p className="mt-4 leading-7 text-black/55">
                  Thank you. Our wholesale desk will review your requirements and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="w-full max-w-2xl">
                <p className="eyebrow">Wholesale customer registration</p>
                <h2 className="mt-3 font-display text-4xl font-semibold text-emerald-950">
                  Introduce your shop
                </h2>
                <div className="mt-9 grid gap-5 sm:grid-cols-2">
                  <Input name="businessName" label="Business Name" />
                  <Input name="customerName" label="Owner Name" />
                  <Input name="city" label="City" />
                  <Input name="phone" label="Phone" type="tel" />
                  <Select
                    name="shopType"
                    label="Shop Type"
                    options={['Retail shop', 'Wholesale dealer', 'Reseller', 'Boutique', 'Online seller']}
                  />
                  <Select
                    name="monthlyRequirement"
                    label="Monthly Requirement"
                    options={['1–5 thaans', '6–15 thaans', '16–30 thaans', '30+ thaans']}
                  />
                </div>
                <button disabled={loading} className="btn-dark mt-7 min-w-48">
                  {loading ? 'Sending…' : 'Submit registration'}
                </button>
                <p className="mt-4 text-xs leading-5 text-black/35">
                  By submitting, you agree to be contacted by Rahim Fabrics about wholesale supply.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Input({
  name,
  label,
  type = 'text',
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-black/45">
      {label}
      <input required name={name} type={type} className="field mt-2 normal-case tracking-normal" />
    </label>
  );
}

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-black/45">
      {label}
      <select required name={name} defaultValue="" className="field mt-2 normal-case tracking-normal">
        <option value="" disabled>
          Select
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
