// Публичные индексные и статические страницы + рубрики, авторы и теги.

import { ensureSitemapEnabled } from '~/server/utils/site-seo';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const urlEntry = (loc: string, lastmod?: string | null) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>${
    lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  }\n  </url>`;

const toIso = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const entries: string[] = [];
  const staticRoutes = [
    { path: '/' as const, dataKey: 'homepage' as const },
    { path: '/articles' },
    { path: '/news' },
    { path: '/videos' },
    { path: '/gallery' },
    { path: '/authors' },
    { path: '/about', slug: 'about' },
    { path: '/contacts', slug: 'contacts' },
    { path: '/legal', slug: 'legal' },
    { path: '/privacy', slug: 'privacy' },
    { path: '/editorial-policy', slug: 'editorial-policy' },
    { path: '/corrections-policy', slug: 'corrections-policy' },
    { path: '/winemakers' },
    { path: '/winemakers/persons' },
    { path: '/wines' },
    { path: '/regions' },
    { path: '/terroirs' },
    { path: '/wineries' },
  ];

  const [homepageMeta, staticPageMeta] = await Promise.all([
    $fetch<{ updatedAt?: string | null }>(`${apiUrl}/homepage`).catch(() => null),
    Promise.all(
      staticRoutes
        .filter((route): route is { path: string; slug: string } => Boolean(route.slug))
        .map(async (route) => {
          const page = await $fetch<{ updatedAt?: string | null }>(`${apiUrl}/pages/${route.slug}`).catch(
            () => null,
          );
          return [route.slug, toIso(page?.updatedAt)] as const;
        }),
    ).then((items) => new Map(items)),
  ]);

  for (const route of staticRoutes) {
    const lastmod =
      route.dataKey === 'homepage'
        ? toIso(homepageMeta?.updatedAt)
        : route.slug
          ? staticPageMeta.get(route.slug) || null
          : null;
    entries.push(urlEntry(`${siteUrl}${route.path}`, lastmod));
  }

  try {
    const categories: any[] = await $fetch(`${apiUrl}/categories`);
    for (const category of categories || []) {
      if (!category?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/category/${category.slug}`, toIso(category.updatedAt)));
    }
  } catch {
    // ignore
  }

  try {
    const authors: any[] = await $fetch(`${apiUrl}/authors`);
    for (const author of authors || []) {
      if (!author?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/author/${author.slug}`, toIso(author.updatedAt)));
    }
  } catch {
    // ignore
  }

  try {
    const tags: any[] = await $fetch(`${apiUrl}/tags`);
    for (const tag of tags || []) {
      if (!tag?.slug) continue;
      entries.push(urlEntry(`${siteUrl}/tags/${tag.slug}`, toIso(tag.updatedAt)));
    }
  } catch {
    // ignore
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
