import type { ComputedRef } from 'vue';

interface ArchiveSeoControlsOptions {
  currentPage: ComputedRef<number>;
  canonicalBasePath?: string;
  filterKeys?: string[];
  title?: string | ComputedRef<string>;
  description?: string | ComputedRef<string>;
  keywords?: string | ComputedRef<string | undefined>;
  isIndexable?: boolean | ComputedRef<boolean>;
}

export function useArchiveSeoControls(options: ArchiveSeoControlsOptions) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const filterKeys = options.filterKeys || ['sort', 'author', 'tag'];
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

  const hasSeoFilters = computed(() =>
    filterKeys.some((key) => {
      const raw = route.query[key];
      if (Array.isArray(raw)) {
        return raw.some((value) => String(value || '').trim().length > 0);
      }
      return String(raw || '').trim().length > 0;
    }),
  );

  const canonicalBasePath = options.canonicalBasePath || route.path;
  const canonicalPath = computed(() => {
    if (hasSeoFilters.value) return null;
    if (options.currentPage.value > 1) {
      return `${canonicalBasePath}?page=${options.currentPage.value}`;
    }
    return canonicalBasePath;
  });

  if (canonicalPath.value) {
    useCanonical(canonicalPath.value);
  }

  const isIndexable = computed(() =>
    options.isIndexable === undefined ? true : Boolean(unref(options.isIndexable)),
  );
  const resolvedTitle = computed(() => options.title ? unref(options.title) : undefined);
  const resolvedDescription = computed(() => options.description ? unref(options.description) : undefined);
  const resolvedKeywords = computed(() => options.keywords ? unref(options.keywords) : undefined);
  const canonicalUrl = computed(() =>
    canonicalPath.value ? `${siteUrl}${canonicalPath.value}` : `${siteUrl}${route.path}`,
  );

  useSeoMeta({
    title: () => resolvedTitle.value,
    description: () => resolvedDescription.value,
    keywords: () => resolvedKeywords.value,
    robots: () => (hasSeoFilters.value || !isIndexable.value ? 'noindex,follow' : undefined),
    ogTitle: () => resolvedTitle.value,
    ogDescription: () => resolvedDescription.value,
    ogUrl: () => canonicalUrl.value,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: () => resolvedTitle.value,
    twitterDescription: () => resolvedDescription.value,
  });

  return {
    hasSeoFilters,
    canonicalPath,
    isIndexable,
  };
}
