type BreadcrumbSchemaItem = {
  name: string;
  path?: string;
};

export function useBreadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

  useHead(() => ({
    script: [
      {
        key: `breadcrumb-jsonld:${route.path}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${siteUrl}${item.path ?? route.path}`,
          })),
        }),
      },
    ],
  }));
}
