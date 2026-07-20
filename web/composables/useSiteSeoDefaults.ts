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

  const { data: siteSeo } = useAsyncData<SiteSeoResponse>('site-seo-defaults', () => getSiteSeo(), {
    server: true,
  });

  const siteUrl = (config.public.siteUrl as string)?.replace(/\/$/, '') || '';
  const defaultImagePath = siteSeo.value?.openGraphImage?.path || siteSeo.value?.twitterImage?.path;
  const defaultImageUrl = useOgImageUrl(defaultImagePath ? useMediaUrl(defaultImagePath) : '');

  const seo: Record<string, any> = {
    ogImage: defaultImageUrl,
    ogImageWidth: defaultImageUrl ? 1200 : undefined,
    ogImageHeight: defaultImageUrl ? 630 : undefined,
    ogImageType: defaultImageUrl ? 'image/jpeg' : undefined,
    twitterImage: defaultImageUrl,
  };

  if (siteSeo.value?.defaultSeo?.title) {
    seo.title = siteSeo.value.defaultSeo.title;
  }
  if (siteSeo.value?.defaultSeo?.description) {
    seo.description = siteSeo.value.defaultSeo.description;
  }

  useSeoMeta(seo);
}
