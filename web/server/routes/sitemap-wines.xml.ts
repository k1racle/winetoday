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

async function fetchPagedWines(apiUrl: string, limit = 100) {
  const items: any[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const response = await $fetch<any>(`${apiUrl}/wines`, {
      query: { limit, offset },
    }).catch(() => null);

    const batch = Array.isArray(response?.items) ? response.items : [];
    if (!batch.length) {
      break;
    }

    items.push(...batch);
    total = typeof response?.total === 'number' ? response.total : batch.length;
    offset += batch.length;

    if (batch.length < limit) {
      break;
    }
  }

  return items;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!(await ensureSitemapEnabled(event, apiUrl))) {
    return '';
  }

  const wines = await fetchPagedWines(apiUrl);
  const entries = wines
    .filter((wine) => wine?.slug)
    .map((wine) =>
      urlEntry(
        `${siteUrl}/wines/${wine.slug}`,
        wine.updatedAt ? new Date(wine.updatedAt).toISOString() : null,
      ),
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
