import type { Product } from '../types';

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
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: DEFAULT_IMAGE,
  },
  email: BUSINESS_EMAIL,
  telephone: BUSINESS_PHONE,
  sameAs: [`https://wa.me/${BUSINESS_PHONE.replace('+', '')}`],
};

export const localBusinessSchema = {
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#localbusiness`,
  name: SITE_NAME,
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  logo: DEFAULT_IMAGE,
  description:
    'Premium gents fabrics wholesale supplier in Azam Market, Lahore. Wash & wear, cotton, khaddar and seasonal fabrics sold by the thaan.',
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Azam Market',
    addressLocality: 'Lahore',
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.582045,
    longitude: 74.329376,
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
      'Wholesale gents fabrics from Azam Market Lahore — wash & wear, cotton, khaddar and seasonal ranges by the thaan.',
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
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(path),
      priceCurrency: 'PKR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      description: 'Wholesale price shared on inquiry after buyer verification.',
    },
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
    title: 'Rahim Fabrics | Gents Fabrics Wholesale Azam Market Lahore',
    description:
      'Premium gents fabrics wholesale supplier in Azam Market, Lahore. Wash & wear, cotton, khaddar and seasonal fabrics sold by the thaan across Pakistan.',
    keywords:
      'gents fabrics wholesale Lahore, Azam Market fabric supplier, wash and wear wholesale, cotton fabric thaan, khaddar wholesale Lahore, Rahim Fabrics',
    path: '/',
  },
  catalogue: {
    title: 'Wholesale Fabric Collection | Rahim Fabrics Azam Market Lahore',
    description:
      'Browse current wholesale gents fabric stock by thaan — wash & wear, cotton, khaddar, summer and winter ranges from Rahim Fabrics, Azam Market Lahore.',
    keywords:
      'wholesale fabric collection Lahore, gents wash and wear thaan, cotton fabric wholesale, khaddar wholesale Azam Market, fabric catalogue Pakistan',
    path: '/catalogue',
  },
  wholesale: {
    title: 'Wholesale Buyer Registration | Rahim Fabrics Lahore',
    description:
      'Register as a wholesale buyer with Rahim Fabrics. Request trade prices, thaan availability and nationwide dispatch support from Azam Market, Lahore.',
    keywords:
      'fabric wholesale registration Lahore, become wholesale buyer, thaan fabric dealer Pakistan, Azam Market wholesale inquiry',
    path: '/wholesale',
  },
  about: {
    title: 'About Rahim Fabrics | Gents Fabric Wholesaler Azam Market Lahore',
    description:
      'Learn about Rahim Fabrics — a trusted gents fabric wholesale supplier rooted in Azam Market, Lahore, serving retailers, dealers and boutiques across Pakistan.',
    keywords:
      'about Rahim Fabrics, Azam Market fabric wholesaler, Lahore gents fabric supplier, fabric trade Lahore',
    path: '/about',
  },
} as const;

export function productPageSeo(product: Product) {
  const path = `/products/${product.slug || product._id}`;
  return {
    title: `${product.name} Wholesale (${product.code}) | Rahim Fabrics Lahore`,
    description: `${product.description} ${product.fabricType} available by the thaan from Rahim Fabrics, Azam Market Lahore. Colours: ${product.colors.slice(0, 4).join(', ')}.`,
    keywords: `${product.name}, ${product.category} wholesale Lahore, ${product.fabricType}, ${product.code}, Azam Market fabric`,
    path,
  };
}
