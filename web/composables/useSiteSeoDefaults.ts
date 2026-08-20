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

export async function useSiteSeoDefaults() {
  const { getSiteSeo } = useApi();

  const { data: siteSeo } = await useAsyncData<SiteSeoResponse>('site-seo-defaults', () =>
    getSiteSeo().catch(() => null),
  );

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
