import type { ComputedRef, Ref } from 'vue';

interface FetchOptions {
  limit: number;
  offset: number;
}

interface FetchResult<T> {
  items: T[];
  total?: number;
}

export interface UseArchivePaginationResult<T> {
  items: ComputedRef<T[]>;
  total: Ref<number>;
  isLoading: Ref<boolean>;
  error: Ref<any>;
  loadMore: () => Promise<void>;
}

export function useArchivePagination<T extends { id: string | number }>(
  fetcher: (opts: FetchOptions) => Promise<FetchResult<T>>,
  key: string,
  options: {
    itemsPerPage?: number;
    rowSize?: number;
    excludeIds?: Ref<Set<string | number>> | (() => Set<string | number>);
  } = {},
): UseArchivePaginationResult<T> {
  const itemsPerPage = options.itemsPerPage ?? 24;
  const rowSize = options.rowSize ?? 3;

  const isLoading = ref(false);
  const error = ref<any>(null);
  const allItems = ref<T[]>([]);
  const total = ref<number>(0);

  const getExcludeIds = () => {
    if (!options.excludeIds) return new Set<string | number>();
    return typeof options.excludeIds === 'function' ? options.excludeIds() : options.excludeIds.value;
  };

  const filteredItems = computed<T[]>(() => {
    const exclude = getExcludeIds();
    return allItems.value.filter((i) => !exclude.has(i.id));
  });

  const { data: initialData, error: initialError } = useAsyncData(key, async () => {
    const first = await fetcher({ limit: itemsPerPage, offset: 0 }).catch(() => ({
      items: [] as T[],
      total: undefined,
    }));
    allItems.value = first.items || [];
    total.value = first.total ?? 0;

    async function fetchChunk(limit: number, offset: number): Promise<FetchResult<T>> {
      return fetcher({ limit, offset }).catch(() => ({ items: [] as T[], total: undefined }));
    }

    async function fillToRow() {
      while (filteredItems.value.length < total.value && filteredItems.value.length % rowSize !== 0) {
        const needed = rowSize - (filteredItems.value.length % rowSize);
        const next = await fetchChunk(needed, allItems.value.length);
        const newItems = next.items || [];
        if (!newItems.length) break;
        allItems.value.push(...newItems);
        total.value = next.total ?? total.value;
      }
    }

    await fillToRow();
    return { items: allItems.value, total: total.value };
  });

  watchEffect(() => {
    if (initialData.value) {
      allItems.value = initialData.value.items || [];
      total.value = initialData.value.total || 0;
    }
  });

  error.value = initialError.value;

  async function fetchChunk(limit: number, offset: number): Promise<FetchResult<T>> {
    return fetcher({ limit, offset }).catch(() => ({ items: [] as T[], total: undefined }));
  }

  async function fillToRow() {
    while (filteredItems.value.length < total.value && filteredItems.value.length % rowSize !== 0) {
      const needed = rowSize - (filteredItems.value.length % rowSize);
      const next = await fetchChunk(needed, allItems.value.length);
      const newItems = next.items || [];
      if (!newItems.length) break;
      allItems.value.push(...newItems);
      total.value = next.total ?? total.value;
    }
  }

  async function loadMore() {
    if (isLoading.value || filteredItems.value.length >= total.value) return;
    isLoading.value = true;
    try {
      const next = await fetchChunk(itemsPerPage, allItems.value.length);
      allItems.value.push(...(next.items || []));
      total.value = next.total ?? total.value;
      await fillToRow();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    items: filteredItems,
    total,
    isLoading,
    error,
    loadMore,
  };
}
