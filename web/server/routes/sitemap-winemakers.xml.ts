import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import { fetchPaginatedItems, fetchSitemapResource, toIso, urlEntry } from '~/server/utils/sitemap';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const entries: string[] = [];
  const [persons, regions, terroirs, wineries] = await Promise.all([
    fetchPaginatedItems<any>(`${apiUrl}/winemakers`),
    fetchSitemapResource<any[]>(`${apiUrl}/regions`, { limit: 500, sort: 'latest' }),
    fetchPaginatedItems<any>(`${apiUrl}/terroirs`),
    fetchPaginatedItems<any>(`${apiUrl}/wineries`),
  ]);

  for (const person of persons) {
    if (!person?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/winemakers/${person.slug}`, toIso(person.updatedAt)));
  }

  for (const region of regions || []) {
    if (!region?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/regions/${region.slug}`, toIso(region.updatedAt)));
  }

  for (const terroir of terroirs) {
    if (!terroir?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/terroirs/${terroir.slug}`, toIso(terroir.updatedAt)));
  }

  for (const winery of wineries) {
    if (!winery?.slug) continue;
    entries.push(urlEntry(`${siteUrl}/wineries/${winery.slug}`, toIso(winery.updatedAt)));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
