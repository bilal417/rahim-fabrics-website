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
    primaryKeyword: 'gents fabrics wholesale Lahore',
    h1: 'Gents Fabrics Wholesale in Azam Market Lahore',
    title: 'Gents Fabrics Wholesale Lahore | Rahim Fabrics Azam Market',
    description:
      'Rahim Fabrics supplies gents fabrics wholesale in Lahore from Azam Market. Buy wash & wear, cotton, khaddar and seasonal fabrics by the thaan for shops across Pakistan.',
    keywords:
      'gents fabrics wholesale Lahore, Azam Market fabric supplier, wash and wear wholesale Lahore, cotton fabric thaan, khaddar wholesale Lahore, unstitched gents fabric wholesale, Rahim Fabrics',
    path: '/',
  },
  catalogue: {
    primaryKeyword: 'wholesale fabric collection Lahore',
    h1: 'Wholesale Fabric Collection in Lahore',
    title: 'Wholesale Fabric Collection Lahore | Wash & Wear, Cotton, Khaddar',
    description:
      'Browse the wholesale fabric collection in Lahore from Rahim Fabrics. Current wash & wear, cotton, khaddar, summer and winter stock sold by the thaan from Azam Market.',
    keywords:
      'wholesale fabric collection Lahore, wash and wear wholesale Lahore, cotton fabric wholesale, khaddar wholesale Azam Market, gents fabric catalogue, fabric thaan Lahore',
    path: '/catalogue',
  },
  wholesale: {
    primaryKeyword: 'fabric wholesale buyer Lahore',
    h1: 'Register as a Fabric Wholesale Buyer in Lahore',
    title: 'Fabric Wholesale Buyer Registration Lahore | Rahim Fabrics',
    description:
      'Register as a fabric wholesale buyer in Lahore with Rahim Fabrics. Get trade prices, thaan availability and nationwide dispatch support from Azam Market.',
    keywords:
      'fabric wholesale buyer Lahore, wholesale fabric dealer registration, thaan fabric supplier Pakistan, Azam Market wholesale inquiry, become fabric wholesaler buyer',
    path: '/wholesale',
  },
  about: {
    primaryKeyword: 'Azam Market fabric wholesaler',
    h1: 'Azam Market Fabric Wholesaler in Lahore',
    title: 'Azam Market Fabric Wholesaler Lahore | About Rahim Fabrics',
    description:
      'Rahim Fabrics is an Azam Market fabric wholesaler in Lahore supplying quality gents fabrics by the thaan to retailers, dealers and boutiques across Pakistan.',
    keywords:
      'Azam Market fabric wholesaler, Lahore gents fabric supplier, fabric wholesaler Azam Market, about Rahim Fabrics, fabric trade Lahore',
    path: '/about',
  },
} as const;

export function productPageSeo(product: Product) {
  const path = `/products/${product.slug || product._id}`;
  const primaryKeyword = `${product.name} wholesale Lahore`;
  return {
    primaryKeyword,
    h1: `${product.name} Wholesale Fabric`,
    title: `${product.name} Wholesale Lahore | ${product.category} Thaan | Rahim Fabrics`,
    description: `Buy ${product.name} wholesale in Lahore. ${product.description} ${product.fabricType} available by the thaan from Rahim Fabrics, Azam Market. Colours: ${product.colors.slice(0, 4).join(', ')}.`,
    keywords: `${primaryKeyword}, ${product.category} wholesale Lahore, ${product.fabricType} thaan, ${product.code}, Azam Market fabric supplier`,
    path,
  };
}
