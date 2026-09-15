import { ArrowUpRight, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPkr } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  const first = product.images?.[0];
  const photo = typeof first === 'string' ? first : first?.url;
  const uploadedPhoto = photo && !photo.includes('fabric-collection');
  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block reveal">
      <div className="relative aspect-[4/4.7] overflow-hidden bg-[#e9e0d0]">
        <div
          className={`${uploadedPhoto ? 'bg-cover bg-center' : 'fabric-tile'} absolute inset-0 transition duration-700 group-hover:scale-[1.04]`}
          style={
            uploadedPhoto
              ? { backgroundImage: `url(${photo})` }
              : { backgroundPosition: product.tilePosition || 'center' }
          }
          role="img"
          aria-label={`${product.name} fabric`}
        />
        <div className="absolute left-4 top-4 rounded-sm bg-cream/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-950">
          {product.category}
        </div>
        <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-900 opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </div>
      </div>
      <div className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-gold-500">{product.code}</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-emerald-950">{product.name}</h3>
          </div>
          <span className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-black/45">
            <Layers3 size={14} />
            {product.retailOnly ? product.fabricType : `${product.suitsPerThaan} suits`}
          </span>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          {product.compareAtPrice ? (
            <div className="text-xs text-black/35 line-through">{formatPkr(product.compareAtPrice)}</div>
          ) : null}
          <div className="font-semibold text-emerald-950">
            {formatPkr(product.retailPrice || 0)}{' '}
            <span className="text-xs font-medium text-black/40">/ {product.retailUnit || 'meter'}</span>
          </div>
          {product.bundleQty && product.bundlePrice ? (
            <div className="text-xs font-semibold text-gold-500">
              {product.bundleQty} suits · {formatPkr(product.bundlePrice)}
            </div>
          ) : !product.retailOnly ? (
            <div className="text-xs text-black/45">
              Wholesale {formatPkr(product.wholesalePrice || 0)} / thaan
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c}
              title={c}
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ background: colorMap[c] || '#aaa' }}
            />
          ))}
          <span className="ml-1 text-xs text-black/40">{product.colors.length} colours</span>
        </div>
      </div>
    </Link>
  );
}

const colorMap: Record<string, string> = {
  Emerald: '#0b513d',
  'Navy Blue': '#15243e',
  Charcoal: '#454545',
  Cream: '#e9ddc5',
  White: '#fafafa',
  Ivory: '#efe6d4',
  Sand: '#c9b18b',
  Black: '#171717',
  Brown: '#65452f',
  Olive: '#68705a',
  'Olive Khaki': '#6f6546',
  'Ice Blue': '#b7cbd0',
  Rust: '#984f45',
  'Warm Khaki': '#8a744c',
  'Light Grey': '#c4c4c4',
  Stone: '#9b9488',
  'Bottle Green': '#183c2b',
  Coffee: '#593b2d',
};
