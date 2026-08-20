import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import { fetchPaginatedItems, SITEMAP_PAGE_SIZE, toIso, urlEntry } from '~/server/utils/sitemap';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const items = await fetchPaginatedItems<any>(`${apiUrl}/content`, { type: 'article' }, SITEMAP_PAGE_SIZE);
  const entries = items
    .filter((item) => item?.slug)
    .map((item) => urlEntry(`${siteUrl}/articles/${item.slug}`, toIso(item.updatedAt || item.publishedAt)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
