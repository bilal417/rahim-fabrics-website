import { useEffect } from 'react';

const SITE = 'https://rahimfabrics.site';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: string;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function Seo({
  title,
  description,
  path = '/',
  image = '/logo.webp',
  noindex = false,
  type = 'website',
}: SeoProps) {
  useEffect(() => {
    const url = path === '/' ? `${SITE}/` : `${SITE}${path}`;
    const absoluteImage = image.startsWith('http') ? image : `${SITE}${image}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', 'Rahim Fabrics');
    upsertMeta('property', 'og:locale', 'en_PK');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImage);
  }, [title, description, path, image, noindex, type]);

  return null;
}
