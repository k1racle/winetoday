interface SiteSeoResponse {
  defaultSeo?: {
    title?: string | null;
    description?: string | null;
  } | null;
  openGraphImage?: {
    path?: string | null;
  } | null;
  twitterImage?: {
    path?: string | null;
  } | null;
}

export function useSiteSeoDefaults() {
  const config = useRuntimeConfig();
  const { getSiteSeo } = useApi();

  const { data: siteSeo } = useAsyncData<SiteSeoResponse>('site-seo-defaults', () =>
    getSiteSeo().catch(() => null),
  );

  const siteUrl = (config.public.siteUrl as string)?.replace(/\/$/, '') || '';
  const mediaBaseUrl = (config.public.mediaBaseUrl as string)?.replace(/\/$/, '') || '';
  const defaultImagePath = computed(
    () => siteSeo.value?.openGraphImage?.path || siteSeo.value?.twitterImage?.path || '',
  );
  const defaultImageSrc = computed(() => {
    const path = defaultImagePath.value;
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return `${mediaBaseUrl}${path}`;
  });
  const defaultImageUrl = computed(() =>
    defaultImageSrc.value
      ? `${siteUrl}/api/og-image?src=${encodeURIComponent(defaultImageSrc.value)}`
      : '',
  );

  useSeoMeta({
    title: () => siteSeo.value?.defaultSeo?.title || undefined,
    description: () => siteSeo.value?.defaultSeo?.description || undefined,
    ogImage: () => defaultImageUrl.value || undefined,
    ogImageWidth: () => (defaultImageUrl.value ? 1200 : undefined),
    ogImageHeight: () => (defaultImageUrl.value ? 630 : undefined),
    ogImageType: () => (defaultImageUrl.value ? 'image/jpeg' : undefined),
    twitterImage: () => defaultImageUrl.value || undefined,
  });
}
