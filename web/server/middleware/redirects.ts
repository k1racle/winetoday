type RedirectEntry = { fromPath: string; toPath: string };
type SlugEntry = { slug: string };

type RedirectsCache = {
  map: Map<string, string>;
  expiresAt: number;
};

type AliasRedirectsCache = {
  map: Map<string, string>;
  expiresAt: number;
};

const CACHE_TTL_MS = 60_000;

const globalCache = globalThis as typeof globalThis & {
  __slugRedirectsCache?: RedirectsCache;
  __seoAliasRedirectsCache?: AliasRedirectsCache;
};

function resolveDuplicateBaseSlug(slug: string, existingSlugs: Set<string>) {
  const match = slug.match(/^(.*)-(\d+)$/);
  if (!match) return null;

  const baseSlug = match[1];
  return existingSlugs.has(baseSlug) ? baseSlug : null;
}

function buildAliasRedirectMap(
  entries: SlugEntry[],
  canonicalPrefix: string,
  legacyPrefix?: string,
) {
  const map = new Map<string, string>();
  const slugs = new Set(entries.map((entry) => entry?.slug).filter(Boolean));

  for (const slug of slugs) {
    const canonicalSlug = resolveDuplicateBaseSlug(slug, slugs) || slug;
    const canonicalPath = `${canonicalPrefix}/${canonicalSlug}`;

    map.set(`${canonicalPrefix}/${slug}`, canonicalPath);

    if (legacyPrefix) {
      map.set(`${legacyPrefix}/${slug}`, canonicalPath);
    }
  }

  return map;
}

function resolveNumericSuffixAlias(
  path: string,
  aliasRedirects: Map<string, string>,
) {
  const match = path.match(/^(\/category|\/tags|\/author)\/(.+)-(\d+)$/);
  if (!match) {
    return null;
  }

  const prefix = match[1];
  const baseSlug = match[2];
  const canonicalTarget = aliasRedirects.get(`${prefix}/${baseSlug}`);

  return canonicalTarget && canonicalTarget !== path ? canonicalTarget : null;
}

async function getRedirectsMap(apiUrl: string): Promise<Map<string, string>> {
  const now = Date.now();
  if (globalCache.__slugRedirectsCache && globalCache.__slugRedirectsCache.expiresAt > now) {
    return globalCache.__slugRedirectsCache.map;
  }

  try {
    const entries = await $fetch<RedirectEntry[]>(`${apiUrl}/redirects`);
    const map = new Map<string, string>();
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry?.fromPath && entry?.toPath) {
          map.set(entry.fromPath, entry.toPath);
        }
      }
    }
    globalCache.__slugRedirectsCache = { map, expiresAt: now + CACHE_TTL_MS };
    return map;
  } catch {
    // API недоступен — пропускаем запрос без редиректа, кеш не трогаем
    return globalCache.__slugRedirectsCache?.map ?? new Map();
  }
}

async function getAliasRedirectsMap(apiUrl: string): Promise<Map<string, string>> {
  const now = Date.now();
  if (globalCache.__seoAliasRedirectsCache && globalCache.__seoAliasRedirectsCache.expiresAt > now) {
    return globalCache.__seoAliasRedirectsCache.map;
  }

  try {
    const [categories, tags, authors] = await Promise.all([
      $fetch<SlugEntry[]>(`${apiUrl}/categories`).catch(() => []),
      $fetch<SlugEntry[]>(`${apiUrl}/tags`).catch(() => []),
      $fetch<SlugEntry[]>(`${apiUrl}/authors`).catch(() => []),
    ]);

    const map = new Map<string, string>();

    for (const [fromPath, toPath] of buildAliasRedirectMap(categories || [], '/category', '/categories')) {
      map.set(fromPath, toPath);
    }
    for (const [fromPath, toPath] of buildAliasRedirectMap(tags || [], '/tags')) {
      map.set(fromPath, toPath);
    }
    for (const [fromPath, toPath] of buildAliasRedirectMap(authors || [], '/author', '/authors')) {
      map.set(fromPath, toPath);
    }

    globalCache.__seoAliasRedirectsCache = { map, expiresAt: now + CACHE_TTL_MS };
    return map;
  } catch {
    return globalCache.__seoAliasRedirectsCache?.map ?? new Map();
  }
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  if (
    path.startsWith('/api') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/_ipx') ||
    path.startsWith('/uploads')
  ) {
    return;
  }

  // Пути с расширением файла — статика, редиректы не применяем
  if (/\.[a-zA-Z0-9]+$/.test(path)) {
    return;
  }

  const config = useRuntimeConfig();
  const apiUrl = (config.apiUrl as string)?.replace(/\/+$/, '') || '';
  if (!apiUrl) {
    return;
  }

  const aliasRedirects = await getAliasRedirectsMap(apiUrl);
  const numericSuffixTarget = resolveNumericSuffixAlias(path, aliasRedirects);
  if (numericSuffixTarget) {
    return sendRedirect(event, numericSuffixTarget, 301);
  }

  const aliasTarget = aliasRedirects.get(path);
  if (aliasTarget && aliasTarget !== path) {
    return sendRedirect(event, aliasTarget, 301);
  }

  const redirects = await getRedirectsMap(apiUrl);
  const toPath = redirects.get(path);
  if (toPath && toPath !== path) {
    return sendRedirect(event, toPath, 301);
  }
});
