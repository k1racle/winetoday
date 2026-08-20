import { ensureSitemapEnabled } from '~/server/utils/site-seo';
import {
  escapeXml,
  fetchPaginatedItems,
  GOOGLE_NEWS_MAX_AGE_MS,
  SITEMAP_PAGE_SIZE,
  toIso,
} from '~/server/utils/sitemap';

const newsUrlEntry = (loc: string, title: string, publicationDate: string) =>
  `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>ВИНОДЕЛИЕ СЕГОДНЯ</news:name>
        <news:language>ru</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>
  </url>`;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const cutoff = Date.now() - GOOGLE_NEWS_MAX_AGE_MS;
  const items = await fetchPaginatedItems<any>(`${apiUrl}/content`, { type: 'news' }, SITEMAP_PAGE_SIZE);
  const entries = items
    .filter((item) => item?.slug)
    .map((item) => {
      const publishedAt = toIso(item.publishedAt);
      if (!publishedAt || new Date(publishedAt).getTime() < cutoff) {
        return null;
      }

      return newsUrlEntry(`${siteUrl}/news/${item.slug}`, String(item.title || ''), publishedAt);
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
