import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import { fetchPaginatedItems, toIso, urlEntry } from '~/server/utils/sitemap';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const wines = await fetchPaginatedItems<any>(`${apiUrl}/wines`);
  const entries = wines
    .filter((wine) => wine?.slug)
    .map((wine) => urlEntry(`${siteUrl}/wines/${wine.slug}`, toIso(wine.updatedAt)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
