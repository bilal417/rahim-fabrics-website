import { ArrowLeft, Check, MessageCircle, PackageCheck, Ruler, Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo, { Breadcrumbs } from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { trackLead, trackViewItem } from '../lib/analytics';
import { productImageFallback, products, whatsappUrl } from '../lib/data';
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
  const [meterQty, setMeterQty] = useState(1);
  const [retailQty, setRetailQty] = useState(2);
  const [wholesaleQty, setWholesaleQty] = useState(1);
  const [message, setMessage] = useState('');
  const trackedProduct = useRef<string | null>(null);

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setMeterQty(Math.max(1, product.minMeterQty || 1));
    setRetailQty(Math.max(1, product.minRetailQty || 2));
    setWholesaleQty(Math.max(1, product.minWholesaleQty || 1));
  }, [product]);

  useEffect(() => {
    if (!product || trackedProduct.current === product.code) return;
    trackedProduct.current = product.code;
    trackViewItem(product);
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
  const fallbackImage = productImageFallback(product);
  const image = urls[0] || fallbackImage;
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

  function addMeter() {
    const error = addProduct(product!, 'retail', meterQty, 'meter');
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('Added metres to retail cart.');
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
            <div className={`grid items-start gap-3 ${urls.length > 1 ? 'sm:grid-cols-[minmax(0,1fr)_110px]' : ''}`}>
              <div className="relative aspect-[4/5] self-start overflow-hidden bg-[#eee4d3]">
                <img
                  src={photo || fallbackImage}
                  alt={`${product.name} ${product.colors[activeImage] || 'fabric'} product pack`}
                  width="900"
                  height="1125"
                  decoding="async"
                  fetchPriority="high"
                  onError={(event) => {
                    if (!event.currentTarget.src.endsWith(fallbackImage)) event.currentTarget.src = fallbackImage;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute right-4 top-4 overflow-hidden rounded-md border border-white/70 bg-emerald-950 shadow-xl">
                  <img
                    src="/logo-small.webp"
                    alt="Rahim Fabrics"
                    width="112"
                    height="75"
                    className="h-auto w-24 sm:w-28"
                  />
                </div>
              </div>
              {urls.length > 1 && (
                <div className="grid grid-cols-3 gap-3 sm:max-h-[min(75vh,790px)] sm:grid-cols-1 sm:overflow-y-auto sm:pr-1">
                  {urls.map((url, i) => (
                    <button
                      aria-label={`View ${product.name} image ${i + 1}`}
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`aspect-[4/5] overflow-hidden bg-[#eee4d3] ${i === activeImage ? 'border-2 border-gold-500' : 'border border-transparent'}`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} ${product.colors[i] || `shade ${i + 1}`}`}
                        width="180"
                        height="225"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          if (!event.currentTarget.src.endsWith(fallbackImage)) event.currentTarget.src = fallbackImage;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                {product.meterPrice ? (
                  <div className="flex h-full flex-col rounded-sm border border-emerald-950/10 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-black/40">By the metre</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-emerald-950">
                      {formatPkr(product.meterPrice)}
                    </p>
                    <p className="mt-1 text-sm text-black/45">per metre</p>
                    <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-black/40">
                      Quantity (metres)
                      <input
                        type="number"
                        min={product.minMeterQty || 1}
                        step="1"
                        value={meterQty}
                        onChange={(e) => setMeterQty(Number(e.target.value) || 1)}
                        className="field mt-2"
                      />
                    </label>
                    <button type="button" onClick={addMeter} className="btn-dark mt-auto w-full px-3 text-center text-sm">
                      <ShoppingBag size={16} /> Add metre to cart
                    </button>
                  </div>
                ) : null}
                <div className={`flex h-full flex-col rounded-sm border border-emerald-950/10 bg-cream p-5 ${product.retailOnly && !product.meterPrice ? 'sm:col-span-2' : ''}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40">{retailUnit === 'suit' ? 'Unstitched suit' : 'Retail price'}</p>
                  {product.compareAtPrice ? (
                    <p className="mt-2 text-sm font-semibold text-black/35 line-through">
                      {formatPkr(product.compareAtPrice)}
                    </p>
                  ) : null}
                  <p className="mt-2 font-display text-3xl font-semibold text-emerald-950">
                    {formatPkr(product.retailPrice || 0)}
                  </p>
                  <p className="mt-1 text-sm text-black/45">per {retailUnit}</p>
                  {product.bundleQty && product.bundlePrice ? (
                    <p className="mt-3 rounded-sm bg-white px-4 py-3 text-sm font-bold text-emerald-950">
                      Buy {product.bundleQty} suits for {formatPkr(product.bundlePrice)}
                    </p>
                  ) : null}
                  {product.purchaseMode === 'whatsapp' ? (
                    <a
                      href={whatsappUrl(`Assalam-o-Alaikum, I want to order ${product.name} (${product.code}).`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackLead('product_whatsapp_order', { item_id: product.code })}
                      className="btn-dark mt-4 w-full"
                    >
                      <MessageCircle size={17} /> Order on WhatsApp
                    </a>
                  ) : (
                    <>
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
                  <button type="button" onClick={addRetail} className="btn-dark mt-auto w-full px-3 text-center text-sm">
                    <ShoppingBag size={16} /> Add {retailUnit} to cart
                  </button>
                    </>
                  )}
                </div>
                {!product.retailOnly && <div className="flex h-full flex-col rounded-sm border border-emerald-950/10 bg-white p-5 sm:col-span-2">
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
                  <button type="button" onClick={addWholesale} className="btn-dark mt-4 w-full px-3 text-center text-sm">
                    <ShoppingBag size={16} /> Add thaan to cart
                  </button>
                </div>}
              </div>
              {message && <p className="mt-4 text-sm font-semibold text-emerald-900">{message}</p>}

              {!product.retailOnly && <div className="mt-8 border-y border-black/10 py-6">
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
                    value={product.unlimitedStock ? 'Available' : `${product.stockMeters ?? 0} metres`}
                  />
                  <Spec icon={<Share2 />} label="Wholesale stock" value={product.unlimitedStock ? 'Available' : `${product.stock} thaans`} />
                </div>
              </div>}

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
                onClick={() => trackLead('product_whatsapp_help', { item_id: product.code })}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-900"
              >
                <MessageCircle size={16} /> Prefer WhatsApp help?
              </a>
            </div>
          </div>
          <ProductBuyingGuide product={product} />
        </div>
      </section>
    </>
  );
}

function ProductBuyingGuide({ product }: { product: Product }) {
  const collectionPath = product.category === 'Boski'
    ? '/collections/boski-fabric'
    : product.category === 'Wash & Wear'
      ? '/collections/wash-and-wear'
      : product.category === 'Winter'
        ? '/collections/winter-fabrics'
        : '/collections/wedding-collection';

  return (
    <section className="mt-16 border-t border-black/10 pt-12" aria-labelledby="product-guide-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="eyebrow">Product guidance</p>
          <h2 id="product-guide-title" className="mt-3 font-display text-4xl font-semibold text-emerald-950">
            Choosing {product.name}
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-black/55">
            <p>
              {product.name} is an unstitched men’s fabric in {product.colors.length} current {product.colors.length === 1 ? 'shade' : 'shades'}.
              Its {product.fabricType.toLowerCase()} character makes it suitable for customers who want their tailor to control the final fit, collar, cuff and trouser cut.
            </p>
            <p>
              Before ordering, select the quantity shown for your preferred retail or wholesale option. If exact colour matching is important, ask our team for current shade guidance because screen settings and photography can create small differences.
            </p>
            <p>
              Keep the fabric packaging and product code <strong className="text-emerald-950">{product.code}</strong> until tailoring begins. Washing, pressing and stitching should follow the handling advice supplied with the fabric or your experienced tailor’s recommendation.
            </p>
          </div>
          <Link to={collectionPath} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-900">
            Explore related {product.category.toLowerCase()} fabrics <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="border border-emerald-950/10 bg-cream p-7 md:p-9">
          <h2 className="font-display text-3xl font-semibold text-emerald-950">Ordering questions</h2>
          <div className="mt-5 divide-y divide-emerald-950/10">
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-emerald-950">Is this fabric stitched?</summary>
              <p className="mt-3 leading-7 text-black/55">No. The product is supplied as unstitched men’s fabric for tailoring to your measurements and preferred style.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-emerald-950">Can I confirm the colour before ordering?</summary>
              <p className="mt-3 leading-7 text-black/55">Yes. Send the product name, code and preferred shade on WhatsApp and our team will guide you using the current stock.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-emerald-950">Is wholesale buying available?</summary>
              <p className="mt-3 leading-7 text-black/55">
                {product.retailOnly
                  ? 'This listing is currently presented as a retail suit option. Trade buyers can still contact the wholesale desk to discuss suitable available ranges.'
                  : `Yes. The current online minimum is ${product.minWholesaleQty || 1} thaan. Contact the wholesale desk when you need help planning a larger order.`}
              </p>
            </details>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
            <Link to="/shipping-delivery" className="text-emerald-900 underline underline-offset-4">Shipping information</Link>
            <Link to="/returns-exchanges" className="text-emerald-900 underline underline-offset-4">Returns & exchanges</Link>
          </div>
        </div>
      </div>
    </section>
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
