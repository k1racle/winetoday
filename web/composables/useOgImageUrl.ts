export function useOgImageUrl(src?: string | null) {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/$/, '') || '';
  if (!src) return '';
  return `${siteUrl}/api/og-image?src=${encodeURIComponent(src)}`;
}
