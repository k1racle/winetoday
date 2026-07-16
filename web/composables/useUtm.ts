const UTM_COOKIE_NAME = 'wt_utm';
const UTM_TTL_DAYS = 30;

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

function parseUtm(query: Record<string, unknown>): UtmParams {
  const result: UtmParams = {};
  const keys: (keyof UtmParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const key of keys) {
    const value = query[key];
    if (typeof value === 'string' && value.trim()) {
      result[key] = value.trim();
    }
  }
  return result;
}

function getCookie(name: string): string | undefined {
  if (import.meta.server) return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, days: number) {
  if (import.meta.server) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

function readStoredUtm(): UtmParams {
  if (import.meta.server) return {};
  try {
    const raw = getCookie(UTM_COOKIE_NAME);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

function saveUtm(params: UtmParams) {
  if (import.meta.server) return;
  setCookie(UTM_COOKIE_NAME, JSON.stringify(params), UTM_TTL_DAYS);
}

export function useUtm() {
  const route = useRoute();
  const utm = ref<UtmParams>({});

  function updateUtm() {
    if (import.meta.server) return;
    const fromQuery = parseUtm(route.query);
    const stored = readStoredUtm();
    const merged = { ...stored, ...fromQuery };
    if (Object.keys(fromQuery).length) {
      saveUtm(merged);
    }
    utm.value = merged;
    pushToDataLayer(merged);
  }

  onMounted(updateUtm);
  watch(() => route.fullPath, updateUtm, { flush: 'post' });

  return { utm: readonly(utm) };
}

function pushToDataLayer(params: UtmParams) {
  if (import.meta.server) return;
  if (!Object.keys(params).length) return;
  try {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: 'utm_detected', ...params });
    if (typeof w.ym === 'function') {
      w.ym(108722624, 'params', params);
    }
  } catch {
    // ignore
  }
}
