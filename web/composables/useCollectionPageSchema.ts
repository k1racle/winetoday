import type { ComputedRef } from 'vue';

interface CollectionPageSchemaItem {
  name: string;
  url: string;
}

interface CollectionPageSchemaOptions {
  title: ComputedRef<string> | string;
  description?: ComputedRef<string | undefined> | string | undefined;
  items?: ComputedRef<CollectionPageSchemaItem[]> | CollectionPageSchemaItem[];
  path?: ComputedRef<string> | string;
}

export function useCollectionPageSchema(options: CollectionPageSchemaOptions) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = ((config.public.siteUrl as string) || '').replace(/\/+$/, '');

  useHead(() => {
    const title = toValue(options.title);
    const description = toValue(options.description);
    const path = toValue(options.path) || route.path;
    const items = toValue(options.items) || [];

    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            description: description || undefined,
            url: `${siteUrl}${path}`,
            mainEntity: items.length
              ? {
                  '@type': 'ItemList',
                  itemListElement: items.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    url: `${siteUrl}${item.url}`,
                  })),
                }
              : undefined,
          }),
        },
      ],
    };
  });
}
