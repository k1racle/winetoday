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

async function fetchPaged<T extends { items?: any[]; total?: number }>(
  endpoint: string,
  apiUrl: string,
  limit = 100,
) {
  const items: any[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const response = await $fetch<T>(`${apiUrl}${endpoint}`, {
      query: { limit, offset },
    }).catch(() => null);

    const batch = Array.isArray(response?.items) ? response!.items : [];
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

  const entries: string[] = [];

  const [persons, regions, terroirs, wineries] = await Promise.all([
    fetchPaged('/winemakers', apiUrl),
    $fetch<any[]>(`${apiUrl}/regions`, {
      query: { limit: 500, sort: 'latest' },
    }).catch(() => []),
    fetchPaged('/terroirs', apiUrl),
    fetchPaged('/wineries', apiUrl),
  ]);

  for (const person of persons) {
    if (!person?.slug) continue;
    entries.push(
      urlEntry(
        `${siteUrl}/winemakers/${person.slug}`,
        person.updatedAt ? new Date(person.updatedAt).toISOString() : null,
      ),
    );
  }

  for (const region of regions || []) {
    if (!region?.slug) continue;
    entries.push(
      urlEntry(
        `${siteUrl}/regions/${region.slug}`,
        region.updatedAt ? new Date(region.updatedAt).toISOString() : null,
      ),
    );
  }

  for (const terroir of terroirs) {
    if (!terroir?.slug) continue;
    entries.push(
      urlEntry(
        `${siteUrl}/terroirs/${terroir.slug}`,
        terroir.updatedAt ? new Date(terroir.updatedAt).toISOString() : null,
      ),
    );
  }

  for (const winery of wineries) {
    if (!winery?.slug) continue;
    entries.push(
      urlEntry(
        `${siteUrl}/wineries/${winery.slug}`,
        winery.updatedAt ? new Date(winery.updatedAt).toISOString() : null,
      ),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml');
  return xml;
});
