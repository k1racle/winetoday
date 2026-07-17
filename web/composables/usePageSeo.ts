export function usePageSeo(slug: string, fallbackName?: string) {
  const { getSiteSeo } = useApi();
  const { data: siteSeo } = useAsyncData(`site-seo-page-${slug}`, () => getSiteSeo().catch(() => ({})));
  const pageSeo = computed(() => {
    const seo = (siteSeo.value as any)?.pageSeo;
    return seo?.[slug] || {};
  });
  const title = computed(() => pageSeo.value?.title || fallbackName || undefined);
  const description = computed(() => pageSeo.value?.description || undefined);
  return { title, description, keywords: computed(() => pageSeo.value?.keywords) };
}
