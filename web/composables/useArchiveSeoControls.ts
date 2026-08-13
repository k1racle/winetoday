import type { ComputedRef } from 'vue';

interface ArchiveSeoControlsOptions {
  currentPage: ComputedRef<number>;
  canonicalBasePath?: string;
  filterKeys?: string[];
}

export function useArchiveSeoControls(options: ArchiveSeoControlsOptions) {
  const route = useRoute();
  const filterKeys = options.filterKeys || ['sort', 'author', 'tag'];

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

  useSeoMeta({
    robots: () => (hasSeoFilters.value ? 'noindex,follow' : undefined),
  });

  return {
    hasSeoFilters,
    canonicalPath,
  };
}
