const PAGE_SIZE = 100; // API ListContentDto limit max is 100

const TYPE_TO_PATH: Record<string, string> = {
  video: '/videos',
  gallery: '/gallery',
};

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';

  const entries: string[] = [];

  // Видео и галереи: /videos/{slug}, /gallery/{slug}
  for (const [type, base] of Object.entries(TYPE_TO_PATH)) {
    try {
      let offset = 0;
      let fetched = 0;
      do {
        const res: any = await $fetch(`${apiUrl}/content`, {
          query: { type, limit: PAGE_SIZE, offset },
        });
        const items: any[] = res?.items || [];
        for (const item of items) {
          if (!item?.slug) continue;
          const lastmod = item.publishedAt ? new Date(item.publishedAt).toISOString() : null;
          entries.push(urlEntry(`${siteUrl}${base}/${item.slug}`, lastmod));
        }
        fetched = items.length;
        offset += PAGE_SIZE;
      } while (fetched === PAGE_SIZE);
    } catch {
      // ignore — пробуем следующий тип
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
