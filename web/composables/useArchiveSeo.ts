export function useArchiveSeo(slug: string, fallbackName?: string) {
  const { getSiteSeo } = useApi();

  const { data: siteSeo } = useAsyncData(`site-seo-archive-${slug}`, () => getSiteSeo(), {
    server: true,
  });

  const archiveSeo = computed(() => {
    const seo = (siteSeo.value as any)?.archiveSeo;
    return seo?.[slug] || {};
  });

  const title = computed(() => archiveSeo.value?.title || fallbackName || undefined);
  const description = computed(() => archiveSeo.value?.description || undefined);

  return { title, description, keywords: computed(() => archiveSeo.value?.keywords) };
}
