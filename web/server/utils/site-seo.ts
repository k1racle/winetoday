import type { H3Event } from 'h3';

interface SiteSeoFlags {
  robotsEnabled?: boolean;
  sitemapEnabled?: boolean;
}

interface SiteSeoCacheEntry {
  data: SiteSeoFlags;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;

const globalCache = globalThis as typeof globalThis & {
  __siteSeoFlagsCache?: Map<string, SiteSeoCacheEntry>;
};

async function fetchSiteSeoFlags(apiUrl: string): Promise<SiteSeoFlags> {
  if (!apiUrl) {
    return { robotsEnabled: true, sitemapEnabled: true };
  }

  const cache = globalCache.__siteSeoFlagsCache ?? new Map<string, SiteSeoCacheEntry>();
  globalCache.__siteSeoFlagsCache = cache;

  const now = Date.now();
  const cached = cache.get(apiUrl);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const data = await $fetch<SiteSeoFlags>(`${apiUrl}/site-seo`);
    const normalized = {
      robotsEnabled: data?.robotsEnabled ?? true,
      sitemapEnabled: data?.sitemapEnabled ?? true,
    };
    cache.set(apiUrl, { data: normalized, expiresAt: now + CACHE_TTL_MS });
    return normalized;
  } catch {
    return cached?.data ?? { robotsEnabled: true, sitemapEnabled: true };
  }
}

export async function getSiteSeoFlags(apiUrl: string) {
  const cleanApiUrl = (apiUrl || '').replace(/\/+$/, '');
  return await fetchSiteSeoFlags(cleanApiUrl);
}

export async function ensureSitemapEnabled(event: H3Event, apiUrl: string) {
  const { sitemapEnabled } = await getSiteSeoFlags(apiUrl);
  if (sitemapEnabled !== false) return true;

  setResponseStatus(event, 404, 'Not Found');
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return false;
}
