const PAGE_SIZE = 100; // API ListContentDto limit max is 100
const NEWS_MAX_AGE_MS = 48 * 60 * 60 * 1000; // Google News: только новости за последние 48 часов

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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

  const entries: string[] = [];
  const cutoff = Date.now() - NEWS_MAX_AGE_MS;

  // Новости за последние 48 часов: /news/{slug}
  try {
    let offset = 0;
    let fetched = 0;
    do {
      const res: any = await $fetch(`${apiUrl}/content`, {
        query: { type: 'news', limit: PAGE_SIZE, offset },
      });
      const items: any[] = res?.items || [];
      for (const item of items) {
        if (!item?.slug || !item?.publishedAt) continue;
        const publishedAt = new Date(item.publishedAt);
        if (Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() < cutoff) continue;
        entries.push(
          newsUrlEntry(
            `${siteUrl}/news/${item.slug}`,
            item.title || '',
            publishedAt.toISOString(),
          ),
        );
      }
      fetched = items.length;
      offset += PAGE_SIZE;
    } while (fetched === PAGE_SIZE);
  } catch {
    // API недоступно — отдаём пустую карту
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
