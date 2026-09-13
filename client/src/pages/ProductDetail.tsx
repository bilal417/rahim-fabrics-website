import { ArrowLeft, Check, MessageCircle, PackageCheck, Ruler, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo, { Breadcrumbs } from '../components/Seo';
import { api } from '../lib/api';
import { products, whatsappUrl } from '../lib/data';
import { productPageSeo, productSchema, webPageSchema } from '../lib/seo';
import type { Product } from '../types';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | undefined>(
    products.find((p) => p.slug === slug || p._id === slug),
  );
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch(() => undefined);
  }, [slug]);

  const crumbs = useMemo(
    () => [
      { name: 'Home', path: '/' },
      { name: 'Collection', path: '/catalogue' },
      {
        name: product?.name || 'Product',
        path: `/products/${product?.slug || slug || ''}`,
      },
    ],
    [product, slug],
  );

  if (!product) {
    return (
      <>
        <Seo
          title="Fabric Not Found | Rahim Fabrics"
          description="This fabric range is not available in the Rahim Fabrics wholesale catalogue."
          path={`/products/${slug || ''}`}
          noindex={true}
        />
        <div className="section text-center">
          <h1 className="font-display text-4xl">Fabric not found</h1>
          <Link to="/catalogue" className="btn-dark mt-6">
            Back to collection
          </Link>
        </div>
      </>
    );
  }

  const urls = product.images
    .map((image) => (typeof image === 'string' ? image : image.url))
    .filter(Boolean);
  const photo = urls[activeImage];
  const uploadedPhoto = photo && !photo.includes('fabric-collection');
  const msg = `Assalam-o-Alaikum, please share the wholesale price and availability for ${product.name} (${product.code}).`;
  const image = urls[0] || '/logo.webp';
  const seo = productPageSeo(product);

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        image={image}
        type="product"
        breadcrumbs={crumbs}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            ...webPageSchema({
              path: seo.path,
              title: seo.title,
              description: seo.description,
              type: 'ItemPage',
            }),
          },
          { '@context': 'https://schema.org', ...productSchema(product) },
        ]}
      />
      <section className="section pt-10">
        <div className="mx-auto max-w-[1320px]">
          <Breadcrumbs items={crumbs} />
          <Link
            to="/catalogue"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/50"
          >
            <ArrowLeft size={16} /> Back to collection
          </Link>
          <div className="grid gap-12 lg:grid-cols-[1.08fr_.92fr]">
            <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
              <div
                className={`${uploadedPhoto ? 'bg-cover bg-center' : 'fabric-tile'} min-h-[540px] bg-[#eee4d3]`}
                style={
                  uploadedPhoto
                    ? { backgroundImage: `url(${photo})` }
                    : { backgroundPosition: product.tilePosition || 'center' }
                }
                role="img"
                aria-label={`${product.name} wholesale fabric sample`}
              />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                {urls.length > 1 ? (
                  urls.map((url, i) => (
                    <button
                      aria-label={`View ${product.name} image ${i + 1}`}
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`min-h-28 bg-cover bg-center ${i === activeImage ? 'border-2 border-gold-500' : ''}`}
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  ))
                ) : (
                  <>
                    <div
                      className="fabric-tile min-h-28 border-2 border-gold-500"
                      style={{ backgroundPosition: product.tilePosition || 'center' }}
                      role="img"
                      aria-label={`${product.name} fabric swatch`}
                    />
                    <div
                      className="min-h-28 bg-[url('/images/showroom-hero.webp')] bg-cover bg-center"
                      role="img"
                      aria-label="Rahim Fabrics showroom"
                    />
                    <div
                      className="fabric-tile min-h-28 [background-size:150%]"
                      style={{ backgroundPosition: product.tilePosition || 'center' }}
                      role="img"
                      aria-label={`${product.name} detail texture`}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="lg:pl-8">
              <p className="eyebrow">
                {product.category} wholesale · {product.code}
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-emerald-950 md:text-5xl">
                {seo.h1}
              </h1>
              <p className="mt-6 leading-8 text-black/55">{product.description}</p>
              <div className="mt-8 border-y border-black/10 py-6">
                <div className="grid grid-cols-2 gap-5">
                  <Spec icon={<Ruler />} label="Thaan length" value={product.thaanLength} />
                  <Spec
                    icon={<PackageCheck />}
                    label="Packing"
                    value={`1 Thaan · ${product.suitsPerThaan} suits`}
                  />
                  <Spec
                    icon={<Check />}
                    label="Availability"
                    value={
                      product.stock > 0
                        ? `${product.stock} thaans in stock`
                        : 'Confirm on inquiry'
                    }
                  />
                  <Spec icon={<Share2 />} label="Fabric" value={product.fabricType} />
                </div>
              </div>
              <div className="mt-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-black/45">
                  Available colours
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-9 rounded-sm bg-cream p-6">
                <h2 className="font-display text-xl font-semibold text-emerald-950">
                  Request wholesale price
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  Prices depend on quantity and current lot. Message our trade desk for a prompt quote from Azam Market, Lahore.
                </p>
                <a href={whatsappUrl(msg)} target="_blank" rel="noreferrer" className="btn-dark mt-5 w-full">
                  <MessageCircle size={18} /> Contact on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 [&_svg]:mt-1 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-gold-500">
      <div>{icon}</div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-black/35">{label}</div>
        <div className="mt-1 text-sm font-semibold text-emerald-950">{value}</div>
      </div>
    </div>
  );
}
