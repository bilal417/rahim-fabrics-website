import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  absoluteImage,
  absoluteUrl,
  breadcrumbSchema,
  SITE_NAME,
  type BreadcrumbItem,
} from '../lib/seo';

const JSON_LD_ATTR = 'data-seo-jsonld';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string;
  noindex?: boolean;
  type?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
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

function setJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  document.querySelectorAll(`script[${JSON_LD_ATTR}="true"]`).forEach((node) => node.remove());
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute(JSON_LD_ATTR, 'true');
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export default function Seo({
  title,
  description,
  path = '/',
  image = '/logo.webp',
  keywords,
  noindex = false,
  type = 'website',
  breadcrumbs,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = absoluteUrl(path);
    const absoluteImg = absoluteImage(image);

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    if (keywords) upsertMeta('name', 'keywords', keywords);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', absoluteImg);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_PK');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImg);

    const graph: Array<Record<string, unknown>> = [];
    if (breadcrumbs?.length) graph.push(breadcrumbSchema(breadcrumbs));
    if (jsonLd) {
      if (Array.isArray(jsonLd)) graph.push(...jsonLd);
      else graph.push(jsonLd);
    }

    if (graph.length === 1) setJsonLd(graph[0]);
    else if (graph.length > 1) {
      setJsonLd({
        '@context': 'https://schema.org',
        '@graph': graph,
      });
    }

    return () => {
      document.querySelectorAll(`script[${JSON_LD_ATTR}="true"]`).forEach((node) => node.remove());
    };
  }, [
    title,
    description,
    path,
    image,
    keywords,
    noindex,
    type,
    JSON.stringify(breadcrumbs),
    JSON.stringify(jsonLd),
  ]);

  return null;
}

export function Breadcrumbs({
  items,
  tone = 'light',
}: {
  items: BreadcrumbItem[];
  tone?: 'light' | 'dark';
}) {
  const muted = tone === 'dark' ? 'text-white/55' : 'text-black/45';
  const divider = tone === 'dark' ? 'text-white/25' : 'text-black/25';
  const current = tone === 'dark' ? 'text-white' : 'text-emerald-950';
  const link = tone === 'dark' ? 'hover:text-white' : 'hover:text-emerald-900';

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 text-sm ${muted}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className={divider}>/</span>}
              {last ? (
                <span aria-current="page" className={`font-semibold ${current}`}>
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className={`transition ${link}`}>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
