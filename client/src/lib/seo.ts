import type { Product } from '../types';
import { BRAND_LINE, SOCIAL } from './data';

export const SITE_URL = 'https://rahimfabrics.site';
export const SITE_NAME = 'Rahim Fabrics';
export const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`;
export const BUSINESS_PHONE = '+923219454085';
export const BUSINESS_EMAIL = 'info@rahimfabrics.site';

export type BreadcrumbItem = { name: string; path: string };

export const organizationSchema = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: BRAND_LINE,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: DEFAULT_IMAGE,
  },
  email: BUSINESS_EMAIL,
  telephone: BUSINESS_PHONE,
  sameAs: [
    `https://wa.me/${BUSINESS_PHONE.replace('+', '')}`,
    SOCIAL.facebook,
    ...(SOCIAL.instagram ? [SOCIAL.instagram] : []),
    ...(SOCIAL.tiktok ? [SOCIAL.tiktok] : []),
  ],
};

export const localBusinessSchema = {
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#localbusiness`,
  name: SITE_NAME,
  alternateName: BRAND_LINE,
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  logo: DEFAULT_IMAGE,
  description:
    'Premium gents fabrics for retail and wholesale from New Azam Cloth Market, Lahore. Shop by the metre or buy by the thaan.',
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'G 41/A Ground Floor, New Azam Cloth Market, Mohalla Buzurg Shah Nawan Mohalla, Walled City of Lahore',
    addressLocality: 'Lahore',
    postalCode: '54000',
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.585044,
    longitude: 74.322454,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Pakistan',
  },
  priceRange: '$$',
  parentOrganization: { '@id': `${SITE_URL}/#organization` },
};

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function absoluteImage(image?: string) {
  if (!image) return DEFAULT_IMAGE;
  return image.startsWith('http') ? image : absoluteUrl(image);
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(input: {
  path: string;
  title: string;
  description: string;
  type?: string;
}) {
  return {
    '@type': input.type || 'WebPage',
    '@id': `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.title,
    description: input.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#localbusiness` },
    inLanguage: 'en-PK',
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      'Shop premium gents fabrics online from New Azam Cloth Market Lahore — retail by the metre and wholesale by the thaan.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-PK',
  };
}

export function productSchema(product: Product) {
  const path = `/products/${product.slug || product._id}`;
  const image = product.images
    .map((img) => (typeof img === 'string' ? img : img.url))
    .filter(Boolean)
    .map(absoluteImage);

  return {
    '@type': 'Product',
    '@id': `${absoluteUrl(path)}#product`,
    name: product.name,
    description: product.description,
    sku: product.code,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    image: image.length ? image : [DEFAULT_IMAGE],
    material: product.fabricType,
    color: product.colors.join(', '),
    offers: [
      {
        '@type': 'Offer',
        url: absoluteUrl(path),
        priceCurrency: 'PKR',
        price: Number(product.retailPrice || 0),
        availability:
          (product.stockMeters ?? 0) > 0 || product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#organization` },
        description: `Retail price per ${product.retailUnit || 'meter'}`,
      },
      {
        '@type': 'Offer',
        url: absoluteUrl(path),
        priceCurrency: 'PKR',
        price: Number(product.wholesalePrice || 0),
        availability:
          product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#organization` },
        description: 'Wholesale price per thaan',
      },
    ],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Thaan length',
        value: product.thaanLength,
      },
      {
        '@type': 'PropertyValue',
        name: 'Suits per thaan',
        value: String(product.suitsPerThaan),
      },
    ],
  };
}

export function itemListSchema(products: Product[]) {
  return {
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug || product._id}`),
      name: product.name,
    })),
  };
}

export const pageSeo = {
  home: {
    primaryKeyword: 'gents fabrics Lahore',
    h1: 'Gents Fabrics for Retail & Wholesale in Lahore',
    title: 'Gents Fabrics Lahore | Retail & Wholesale | Rahim Fabrics',
    description:
      'Shop premium gents fabrics in Lahore from Rahim Fabrics at New Azam Cloth Market. Buy by the metre for retail orders or by the thaan for wholesale.',
    keywords:
      'gents fabrics Lahore, buy fabric online Lahore, fabric retail Lahore, New Azam Cloth Market, gents fabrics wholesale Lahore, Rahim Fabrics',
    path: '/',
  },
  catalogue: {
    primaryKeyword: 'buy fabric online Lahore',
    h1: 'Shop Fabrics Online in Lahore',
    title: 'Shop Fabrics Online Lahore | Retail & Wholesale | Rahim Fabrics',
    description:
      'Browse wash & wear, cotton, khaddar and seasonal fabrics online. Clear retail prices per metre plus wholesale thaan rates from Rahim Fabrics, New Azam Cloth Market Lahore.',
    keywords:
      'buy fabric online Lahore, fabric shop Lahore, wash and wear fabric price, New Azam Cloth Market, wholesale fabric collection',
    path: '/catalogue',
  },
  wholesale: {
    primaryKeyword: 'fabric wholesale buyer Lahore',
    h1: 'Register as a Fabric Wholesale Buyer in Lahore',
    title: 'Fabric Wholesale Buyer Registration Lahore | Rahim Fabrics',
    description:
      'Register as a fabric wholesale buyer in Lahore with Rahim Fabrics. Get trade prices, thaan availability and nationwide dispatch support from New Azam Cloth Market.',
    keywords:
      'fabric wholesale buyer Lahore, wholesale fabric dealer registration, thaan fabric supplier Pakistan, New Azam Cloth Market wholesale',
    path: '/wholesale',
  },
  about: {
    primaryKeyword: 'New Azam Cloth Market fabric shop',
    h1: 'New Azam Cloth Market Fabric Shop for Retail & Wholesale',
    title: 'New Azam Cloth Market Fabric Shop Lahore | About Rahim Fabrics',
    description:
      'Rahim Fabrics by Safeer Naseer Fabrics is a fabric shop at New Azam Cloth Market, Lahore — serving retail customers by the metre and wholesale buyers by the thaan.',
    keywords:
      'New Azam Cloth Market fabric shop, Lahore gents fabric supplier, fabric retail Lahore, about Rahim Fabrics',
    path: '/about',
  },
} as const;

export function productPageSeo(product: Product) {
  const path = `/products/${product.slug || product._id}`;
  const primaryKeyword = `${product.name} fabric Lahore`;
  const retail = product.retailPrice ? ` Retail from PKR ${product.retailPrice.toLocaleString('en-PK')}/${product.retailUnit || 'meter'}.` : '';
  return {
    primaryKeyword,
    h1: product.name,
    title: `${product.name} | Buy Online Lahore | Rahim Fabrics`,
    description: `Buy ${product.name} online from Rahim Fabrics, New Azam Cloth Market Lahore.${retail} ${product.description} Also available wholesale by the thaan. Colours: ${product.colors.slice(0, 4).join(', ')}.`,
    keywords: `${primaryKeyword}, ${product.category} fabric Lahore, ${product.fabricType}, ${product.code}, buy fabric online Lahore, wholesale thaan`,
    path,
  };
}
