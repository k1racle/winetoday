import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import { fetchSitemapResource, toIso, urlEntry } from '~/server/utils/sitemap';

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

  const [homepageMeta, staticPageMeta, categories, authors, tags] = await Promise.all([
    fetchSitemapResource<{ updatedAt?: string | null }>(`${apiUrl}/homepage`),
    Promise.all(
      staticRoutes
        .filter((route): route is { path: string; slug: string } => Boolean(route.slug))
        .map(async (route) => {
          const page = await fetchSitemapResource<{ updatedAt?: string | null }>(
            `${apiUrl}/pages/${route.slug}`,
          );
          return [route.slug, toIso(page?.updatedAt)] as const;
        }),
    ).then((items) => new Map(items)),
    fetchSitemapResource<any[]>(`${apiUrl}/categories`),
    fetchSitemapResource<any[]>(`${apiUrl}/authors`),
    fetchSitemapResource<any[]>(`${apiUrl}/tags`),
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

  for (const category of categories || []) {
    if (!category?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/category/${category.slug}`, toIso(category.updatedAt)));
  }

  for (const author of authors || []) {
    if (!author?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/author/${author.slug}`, toIso(author.updatedAt)));
  }

  for (const tag of tags || []) {
    if (!tag?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/tags/${tag.slug}`, toIso(tag.updatedAt)));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
