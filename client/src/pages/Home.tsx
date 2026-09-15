import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products } from '../lib/data';
import {
  itemListSchema,
  localBusinessSchema,
  organizationSchema,
  pageSeo,
  websiteSchema,
  webPageSchema,
} from '../lib/seo';

const seo = pageSeo.home;

export default function Home() {
  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        jsonLd={[
          { '@context': 'https://schema.org', ...websiteSchema() },
          { '@context': 'https://schema.org', ...organizationSchema },
          { '@context': 'https://schema.org', ...localBusinessSchema },
          {
            '@context': 'https://schema.org',
            ...webPageSchema({
              path: seo.path,
              title: seo.title,
              description: seo.description,
            }),
          },
          {
            '@context': 'https://schema.org',
            ...itemListSchema(products.slice(0, 3)),
            name: 'Featured fabrics for retail and wholesale',
          },
        ]}
      />
      <HeroSlider />
      <section className="section bg-[#fbf8f2]">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Shop collection</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-emerald-950 md:text-5xl">
                Fabrics priced for retail — ready for wholesale too.
              </h2>
            </div>
            <Link to="/catalogue" className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              Browse the shop <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.length ? (
              products.slice(0, 3).map((p) => <ProductCard key={p.code} product={p} />)
            ) : (
              <div className="rounded-sm bg-white p-10 text-center shadow-soft md:col-span-2 lg:col-span-3">
                <p className="font-display text-2xl text-emerald-950">New stock is being prepared</p>
                <p className="mt-3 text-sm text-black/50">
                  Catalogue products will appear here soon. Meanwhile, WhatsApp us or register for wholesale.
                </p>
                <Link to="/wholesale" className="btn-dark mt-6 inline-flex">
                  Wholesale registration
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div
            className="relative min-h-[480px] overflow-hidden bg-[url('/images/rahim-fabrics-hero-shop-signboard.png')] bg-cover bg-left"
            role="img"
            aria-label="Rahim Fabrics showroom at New Azam Cloth Market Lahore"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-transparent mix-blend-multiply" />
          </div>
          <div className="flex items-center px-7 py-16 md:px-16 lg:px-20">
            <div>
              <p className="eyebrow">Our Story</p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-emerald-950 md:text-5xl">
                Seven years of fabric, trust and direct sourcing.
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-black/55">
                Rahim Fabrics by Safeer Naseer Fabrics began seven years ago with a simple commitment: to bring dependable fabric variety directly from Faisalabad to our customers in Lahore.
              </p>
              <p className="mt-4 max-w-xl leading-8 text-black/55">
                Our collection includes trusted names such as Shaheen, Badar, Tayyab and Haroon, alongside Boski, Karandi, cotton, wash & wear and seasonal fabrics—carefully selected for quality, choice and lasting value.
              </p>
              <div className="mt-8 border-l-2 border-gold-500 pl-5">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-black/40">Founded by</p>
                <p className="mt-1 font-display text-2xl font-semibold text-emerald-950">Bilal Naseer</p>
              </div>
              <Link to="/about" className="btn-dark mt-8 inline-flex">
                Read Our Story <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-emerald-900 text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
          <MapPin className="text-gold-400" />
          <p className="eyebrow mt-5">Ready to order</p>
          <h2 className="mt-4 font-display text-4xl font-semibold md:text-6xl">
            Shop online — or register for wholesale.
          </h2>
          <p className="mt-6 max-w-2xl leading-8 text-white/60">
            Retail customers can add fabrics to cart and checkout with COD or bank transfer. Dealers can also register for thaan-based wholesale support.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/catalogue" className="btn-primary">
              Shop fabrics <ArrowRight size={17} />
            </Link>
            <Link to="/wholesale" className="btn-outline border-white/30 text-white hover:bg-white/10">
              Wholesale registration
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
