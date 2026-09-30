import { ArrowRight, MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Seo, { Breadcrumbs } from '../components/Seo';
import { api } from '../lib/api';
import { collectionDefinitions } from '../lib/content';
import { products as seedProducts, whatsappUrl } from '../lib/data';
import { itemListSchema, webPageSchema } from '../lib/seo';
import type { Product } from '../types';

export default function CollectionLanding() {
  const { slug = '' } = useParams();
  const definition = collectionDefinitions[slug];
  const [products, setProducts] = useState<Product[]>(seedProducts);

  useEffect(() => {
    api
      .get('/products')
      .then((response) => {
        if (!Array.isArray(response.data) || !response.data.length) return;
        const live = response.data as Product[];
        setProducts([
          ...seedProducts.filter((seed) => !live.some((item) => item.slug === seed.slug || item.code === seed.code)),
          ...live,
        ]);
      })
      .catch(() => undefined);
  }, []);

  const shown = useMemo(
    () => (definition ? products.filter((product) => definition.match(product)) : []),
    [definition, products],
  );

  if (!definition) {
    return (
      <section className="section text-center">
        <Seo
          title="Collection Not Found | Rahim Fabrics"
          description="Browse the current Rahim Fabrics catalogue."
          path={`/collections/${slug}`}
          noindex={true}
        />
        <h1 className="font-display text-4xl text-emerald-950">Collection not found</h1>
        <Link to="/catalogue" className="btn-dark mt-6">Browse all fabrics</Link>
      </section>
    );
  }

  const path = `/collections/${definition.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/catalogue' },
    { name: definition.name, path },
  ];

  return (
    <>
      <Seo
        title={definition.title}
        description={definition.description}
        path={path}
        image={definition.image}
        breadcrumbs={crumbs}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            ...webPageSchema({ path, title: definition.title, description: definition.description, type: 'CollectionPage' }),
          },
          {
            '@context': 'https://schema.org',
            ...itemListSchema(shown),
            name: definition.name,
            numberOfItems: shown.length,
          },
        ]}
      />

      <section className="relative min-h-[560px] overflow-hidden bg-emerald-950 text-white">
        <img
          src={definition.image}
          alt={`${definition.name} at Rahim Fabrics Lahore`}
          width="1120"
          height="1400"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-emerald-950/30" />
        <div className="relative mx-auto flex min-h-[560px] max-w-[1320px] items-center px-5 py-20 md:px-10 lg:px-16">
          <div className="max-w-3xl">
            <Breadcrumbs items={crumbs} tone="dark" />
            <p className="eyebrow">{definition.eyebrow}</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-tight md:text-7xl">{definition.h1}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">{definition.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#collection-products" className="btn-primary">View current products <ArrowRight size={17} /></a>
              <a
                href={whatsappUrl(`Assalam-o-Alaikum, I need details about the ${definition.name} collection.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:border-gold-400 hover:text-gold-400"
              >
                <MessageCircle size={17} /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#fbf8f2]">
        <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-3">
          {definition.highlights.map((highlight) => (
            <article key={highlight.title} className="border border-emerald-950/10 bg-white p-7 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-emerald-950">{highlight.title}</h2>
              <p className="mt-3 leading-7 text-black/55">{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="collection-products" className="section scroll-mt-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Current online selection</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-emerald-950 md:text-5xl">Shop {definition.name}</h2>
            </div>
            <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900">
              Browse the full catalogue <ArrowRight size={16} />
            </Link>
          </div>
          {shown.length ? (
            <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((product) => <ProductCard key={product.code} product={product} />)}
            </div>
          ) : (
            <div className="mt-10 border border-emerald-950/10 bg-cream p-8">
              <p className="font-display text-2xl text-emerald-950">Ask for current stock</p>
              <p className="mt-3 max-w-2xl leading-7 text-black/55">
                This collection changes with available lots. Contact our team for the latest colours, quantities and trade availability.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
