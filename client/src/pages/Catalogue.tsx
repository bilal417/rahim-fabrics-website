import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Seo, { Breadcrumbs } from '../components/Seo';
import { api } from '../lib/api';
import { categories, products as seedProducts } from '../lib/data';
import { itemListSchema, pageSeo, webPageSchema } from '../lib/seo';
import type { Product } from '../types';

const seo = pageSeo.catalogue;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Collection', path: '/catalogue' },
];

export default function Catalogue() {
  const [active, setActive] = useState('All Fabrics');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Product[]>(seedProducts);

  useEffect(() => {
    api
      .get('/products')
      .then((r) => {
        if (r.data?.length) setItems(r.data);
      })
      .catch(() => undefined);
  }, []);

  const shown = useMemo(
    () =>
      items.filter(
        (p) =>
          (active === 'All Fabrics' || p.category === active) &&
          `${p.name} ${p.code} ${p.fabricType}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [active, query, items],
  );

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
              type: 'CollectionPage',
            }),
          },
          {
            '@context': 'https://schema.org',
            ...itemListSchema(shown.slice(0, 24)),
            name: 'Rahim Fabrics shop collection',
            numberOfItems: shown.length,
          },
        ]}
      />
      <section className="bg-emerald-950 px-5 py-20 text-white md:px-10">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">Current stock · New Azam Cloth Market</p>
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">
            {seo.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-white/55">
            Explore wash & wear, cotton, khaddar and seasonal ranges with retail prices per metre and wholesale rates per thaan. Add to cart and checkout online.
          </p>
        </div>
      </section>
      <section className="section pt-10">
        <div className="mx-auto max-w-[1320px]">
          <Breadcrumbs items={crumbs} />
          <div className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fabric categories">
              {categories.map((c) => (
                <button
                  onClick={() => setActive(c)}
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={active === c}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    active === c
                      ? 'bg-emerald-900 text-white'
                      : 'bg-cream text-black/55 hover:text-emerald-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="flex min-w-[280px] items-center gap-3 border-b border-black/20 py-2">
              <Search size={17} className="text-black/35" />
              <span className="sr-only">Search fabrics</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or product code"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-black/45">Showing {shown.length} fabric ranges</p>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Retail & wholesale</p>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
          {!shown.length && (
            <div className="py-20 text-center text-black/45">
              {items.length ? 'No fabrics match your search.' : 'No products in the catalogue yet. New stock will appear here soon.'}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
