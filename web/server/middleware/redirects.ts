type RedirectEntry = { fromPath: string; toPath: string };

type RedirectsCache = {
  map: Map<string, string>;
  expiresAt: number;
};

const CACHE_TTL_MS = 60_000;

const globalCache = globalThis as typeof globalThis & {
  __slugRedirectsCache?: RedirectsCache;
};

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

  const redirects = await getRedirectsMap(apiUrl);
  const toPath = redirects.get(path);
  if (toPath && toPath !== path) {
    return sendRedirect(event, toPath, 301);
  }
});
