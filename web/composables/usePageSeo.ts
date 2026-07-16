export function usePageSeo(slug: string, fallbackName?: string) {
  const { data: siteSeo } = useAsyncData('site-seo-defaults');
  const pageSeo = computed(() => {
    const seo = (siteSeo.value as any)?.pageSeo;
    return seo?.[slug] || {};
  });
  const title = computed(() => pageSeo.value?.title || fallbackName || undefined);
  const description = computed(() => pageSeo.value?.description || undefined);
  return { title, description, keywords: computed(() => pageSeo.value?.keywords) };
}
