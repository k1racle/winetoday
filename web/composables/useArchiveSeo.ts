export function useArchiveSeo(slug: string, fallbackName?: string) {
  const { data: siteSeo } = useAsyncData('site-seo-defaults');
  const archiveSeo = computed(() => {
    const seo = (siteSeo.value as any)?.archiveSeo;
    return seo?.[slug] || {};
  });
  const title = computed(() => archiveSeo.value?.title || fallbackName || undefined);
  const description = computed(() => archiveSeo.value?.description || undefined);
  return { title, description, keywords: computed(() => archiveSeo.value?.keywords) };
}
