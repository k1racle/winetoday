type SitemapQueryValue = string | number | boolean | null | undefined;

export const SITEMAP_PAGE_SIZE = 100;
export const GOOGLE_NEWS_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const urlEntry = (loc: string, lastmod?: string | null, extraXml?: string) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>${
    lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  }${extraXml ? `\n${extraXml}` : ''}\n  </url>`;

export const toIso = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export function createSitemapUpstreamError(cause?: unknown) {
  const statusCode = Number(
    (cause as any)?.statusCode || (cause as any)?.status || (cause as any)?.response?.status,
  );

  return createError({
    statusCode: statusCode >= 400 && statusCode < 500 ? statusCode : 503,
    statusMessage: 'Sitemap upstream error',
    cause,
  });
}

export async function fetchSitemapResource<T>(
  url: string,
  query: Record<string, SitemapQueryValue> = {},
) {
  try {
    return await $fetch<T>(url, { query });
  } catch (error) {
    throw createSitemapUpstreamError(error);
  }
}

export async function fetchPaginatedItems<T>(
  url: string,
  query: Record<string, SitemapQueryValue> = {},
  limit = SITEMAP_PAGE_SIZE,
) {
  const items: T[] = [];
  let offset = 0;

  while (true) {
    const response = await fetchSitemapResource<{ items?: T[] }>(url, {
      ...query,
      limit,
      offset,
    });

    const batch = Array.isArray(response?.items) ? response.items : [];
    if (!batch.length) {
      break;
    }

    items.push(...batch);
    offset += batch.length;

    if (batch.length < limit) {
      break;
    }
  }

  return items;
}
