import type { Product } from '../types';

export const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '923219454085';
export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

/** Display address used in header, footer, and page copy */
export const ADDRESS_SHORT = 'G 41/A Ground Floor New Azam Cloth Market Lahore';

/** Full legal / maps address */
export const ADDRESS_FULL =
  'Rahim Fabrics by Safeer Naseer Fabrics, G Ground Floor, New Azam Cloth Market, 41/A, Mohalla Buzurg Shah Nawan Mohalla, Walled City of Lahore, Lahore 54000, Pakistan';

/** Google Maps link for shop location */
export const MAPS_URL =
  'https://www.google.com/maps/place/Rahim+Fabrics+by+Safeer+Naseer+Fabrics/@31.585044,74.322454,17z/data=!4m6!3m5!1s0x39191b456f184f2f:0x4b0521aea5b20784!8m2!3d31.585044!4d74.322454!16s%2Fg%2F11nvzbk9mm?entry=ttu';

export const BRAND_LINE = 'Rahim Fabrics by Safeer Naseer Fabrics';

export const SOCIAL = {
  facebook: 'https://www.facebook.com/profile.php?id=61594455503016',
  instagram: 'https://www.instagram.com/bilal.naseer.399/',
  tiktok: 'https://www.tiktok.com/@rahimfabrics0?_r=1&_t=ZS-99iwwSmShYC',
};

export const PHONE_DISPLAY = '+92 321 9454085';
export const PHONE_TEL = '+923219454085';
export const EMAIL = 'info@rahimfabrics.site';

/** Featured catalogue items available even when the API is offline. */
export const products: Product[] = [
  {
    _id: 'grace-dunhill-self-textured',
    slug: 'grace-dunhill-self-textured-winter-wash-and-wear',
    name: 'Grace Dunhill Self-Textured',
    code: 'GR-DH-WW',
    category: 'Winter',
    fabricType: 'Premium Winter Wash & Wear',
    colors: [
      'Sky Blue',
      'Taupe Olive',
      'Muted Teal Blue',
      'Steel Blue Grey',
      'Warm Grey',
      'Deep Charcoal Teal',
      'Light Stone Beige',
    ],
    thaanLength: 'Unstitched suit',
    suitsPerThaan: 1,
    stock: 0,
    stockMeters: 0,
    retailPrice: 1499,
    bundleQty: 2,
    bundlePrice: 2599,
    retailUnit: 'suit',
    minRetailQty: 1,
    minWholesaleQty: 1,
    images: [
      '/images/products/grace-dunhill-sky-blue-tailor-desk.png',
      '/images/products/grace-dunhill-taupe-olive-tailor-desk.png',
      '/images/products/grace-dunhill-muted-teal-blue-tailor-desk.png',
      '/images/products/grace-dunhill-steel-blue-grey-tailor-desk.png',
      '/images/products/grace-dunhill-warm-grey-tailor-desk.png',
      '/images/products/grace-dunhill-deep-charcoal-teal-tailor-desk.png',
      '/images/products/grace-dunhill-light-stone-beige-tailor-desk.png',
    ],
    description:
      'Grace Dunhill Self-Textured is a premium winter wash & wear collection for men. Its refined self-textured finish, comfortable seasonal weight and seven versatile shades make it an elegant choice for everyday and occasion wear. Choose one unstitched suit for PKR 1,499 or any two suits for PKR 2,599.',
    featured: true,
    retailOnly: true,
    purchaseMode: 'whatsapp',
  },
  {
    _id: 'bit-coin-gul-ahmed-olive',
    slug: 'bit-coin-by-gul-ahmed-olive',
    name: 'Bit Coin by Gul Ahmed',
    code: 'BC-GA-OLIVE',
    category: 'Wash & Wear',
    fabricType: 'Premium Wash & Wear',
    colors: ['Olive Khaki', 'Ice Blue', 'Rust', 'Warm Khaki', 'Ivory'],
    thaanLength: 'Retail suit pack',
    suitsPerThaan: 1,
    stock: 0,
    stockMeters: 0,
    retailPrice: 3299,
    compareAtPrice: 4000,
    bundleQty: 2,
    bundlePrice: 6499,
    retailUnit: 'suit',
    minRetailQty: 1,
    minWholesaleQty: 1,
    images: [
      '/images/products/bit-coin-olive-branded-v1.png',
      '/images/products/bit-coin-ice-blue-branded-v1.png',
      '/images/products/bit-coin-rust-branded-v1.png',
      '/images/products/bit-coin-khaki-branded-v1.png',
      '/images/products/bit-coin-ivory-branded-v1.png',
    ],
    description:
      'Bit Coin by Gul Ahmed is a premium wash & wear fabric with a smooth finish, graceful drape and refined olive-khaki tone. A versatile unstitched choice for polished everyday and occasion wear.',
    featured: true,
    retailOnly: true,
    purchaseMode: 'whatsapp',
  },
];

export const categories = [
  'All Fabrics',
  'Summer',
  'Winter',
  'Cotton',
  'Wash & Wear',
  'Khaddar',
  'Boski',
  'Linen',
  'Karandi',
  'Tropical',
  'Wool',
  'Blended',
];

export const seasonalCollections = {
  Summer: ['Cotton', 'Wash & Wear', 'Boski', 'Linen', 'Tropical', 'Blended'],
  Winter: ['Khaddar', 'Karandi', 'Wool', 'Blended'],
} as const;
