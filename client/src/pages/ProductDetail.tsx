import { ArrowLeft, Check, MessageCircle, PackageCheck, Ruler, Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo, { Breadcrumbs } from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { products, whatsappUrl } from '../lib/data';
import { productPageSeo, productSchema, webPageSchema } from '../lib/seo';
import { formatPkr, type Product } from '../types';

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addProduct } = useCart();
  const [product, setProduct] = useState<Product | undefined>(
    products.find((p) => p.slug === slug || p._id === slug),
  );
  const [activeImage, setActiveImage] = useState(0);
  const [retailQty, setRetailQty] = useState(2);
  const [wholesaleQty, setWholesaleQty] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setRetailQty(Math.max(1, product.minRetailQty || 2));
    setWholesaleQty(Math.max(1, product.minWholesaleQty || 1));
  }, [product]);

  const crumbs = useMemo(
    () => [
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/catalogue' },
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
          description="This fabric range is not available in the Rahim Fabrics shop."
          path={`/products/${slug || ''}`}
          noindex={true}
        />
        <div className="section text-center">
          <h1 className="font-display text-4xl">Fabric not found</h1>
          <Link to="/catalogue" className="btn-dark mt-6">
            Back to shop
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
  const image = urls[0] || '/logo.webp';
  const seo = productPageSeo(product);
  const retailUnit = product.retailUnit || 'meter';

  function addRetail() {
    const error = addProduct(product!, 'retail', retailQty);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('Added to retail cart.');
    nav('/cart');
  }

  function addWholesale() {
    const error = addProduct(product!, 'wholesale', wholesaleQty);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('Added to wholesale cart.');
    nav('/cart');
  }

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
          <Link to="/catalogue" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/50">
            <ArrowLeft size={16} /> Back to shop
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
                aria-label={`${product.name} fabric sample`}
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
                  <div
                    className="fabric-tile min-h-28 border-2 border-gold-500"
                    style={{ backgroundPosition: product.tilePosition || 'center' }}
                    role="img"
                    aria-label={`${product.name} fabric swatch`}
                  />
                )}
              </div>
            </div>
            <div className="lg:pl-8">
              <p className="eyebrow">
                {product.category} · {product.code}
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-emerald-950 md:text-5xl">
                {seo.h1}
              </h1>
              <p className="mt-6 leading-8 text-black/55">{product.description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border border-emerald-950/10 bg-cream p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">Retail price</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-emerald-950">
                    {formatPkr(product.retailPrice || 0)}
                  </p>
                  <p className="mt-1 text-sm text-black/45">per {retailUnit}</p>
                  <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-black/40">
                    Quantity ({retailUnit})
                    <input
                      type="number"
                      min={product.minRetailQty || 1}
                      value={retailQty}
                      onChange={(e) => setRetailQty(Number(e.target.value) || 1)}
                      className="field mt-2"
                    />
                  </label>
                  <button type="button" onClick={addRetail} className="btn-dark mt-4 w-full">
                    <ShoppingBag size={17} /> Add retail to cart
                  </button>
                </div>
                <div className="rounded-sm border border-emerald-950/10 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">Wholesale price</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-emerald-950">
                    {formatPkr(product.wholesalePrice || 0)}
                  </p>
                  <p className="mt-1 text-sm text-black/45">per thaan</p>
                  <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-black/40">
                    Quantity (thaan)
                    <input
                      type="number"
                      min={product.minWholesaleQty || 1}
                      value={wholesaleQty}
                      onChange={(e) => setWholesaleQty(Number(e.target.value) || 1)}
                      className="field mt-2"
                    />
                  </label>
                  <button type="button" onClick={addWholesale} className="btn-outline mt-4 w-full border-emerald-950 text-emerald-950">
                    Add thaan to cart
                  </button>
                </div>
              </div>
              {message && <p className="mt-4 text-sm font-semibold text-emerald-900">{message}</p>}

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
                    label="Retail stock"
                    value={`${product.stockMeters ?? 0} metres`}
                  />
                  <Spec icon={<Share2 />} label="Wholesale stock" value={`${product.stock} thaans`} />
                </div>
              </div>

              <div className="mt-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-black/45">Available colours</h2>
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

              <a
                href={whatsappUrl(
                  `Assalam-o-Alaikum, I am interested in ${product.name} (${product.code}). Please confirm availability.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-900"
              >
                <MessageCircle size={16} /> Prefer WhatsApp help?
              </a>
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
