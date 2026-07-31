export function useCanonical(path?: string) {
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
  const rawPath = path ?? route.path;
  // path может включать query (например, '/articles?page=2' для пагинации).
  // Убираем trailing slash из части пути, кроме корня.
  const [pathname, search] = rawPath.split('?');
  const cleanPath = pathname !== '/' ? pathname!.replace(/\/+$/, '') || '/' : pathname;
  const canonical = `${siteUrl}${cleanPath}${search ? `?${search}` : ''}`;

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });

  return canonical;
}
