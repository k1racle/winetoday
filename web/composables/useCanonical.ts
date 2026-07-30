export function useCanonical(path?: string) {
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const rawPath = path ?? route.path;
  // Убираем trailing slash, кроме корня
  const cleanPath = rawPath !== '/' ? rawPath.replace(/\/+$/, '') || '/' : rawPath;
  const canonical = `${siteUrl}${cleanPath}`;

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });

  return canonical;
}
