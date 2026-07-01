export function useMediaUrl(path?: string | null) {
  const config = useRuntimeConfig();
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const base = config.public.mediaBaseUrl?.replace(/\/$/, '') || '';
  return `${base}${path}`;
}
