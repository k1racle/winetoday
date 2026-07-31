import type { ComputedRef, Ref } from 'vue';

interface FetchOptions {
  limit: number;
  offset: number;
}

interface FetchResult<T> {
  items: T[];
  total?: number;
}

interface SavedPosition {
  count: number;
  scrollY: number;
}

export interface UseArchivePaginationResult<T> {
  items: ComputedRef<T[]>;
  total: Ref<number>;
  isLoading: Ref<boolean>;
  error: Ref<any>;
  loadMore: () => Promise<void>;
}

const STORAGE_PREFIX = 'archive-pagination:';

function readSavedPosition(key: string): SavedPosition | null {
  if (!import.meta.client) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.count === 'number' && parsed.count > 0) {
      return {
        count: parsed.count,
        scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function clearSavedPosition(key: string) {
  if (!import.meta.client) return;
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
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

  // Индексируемая пагинация: начальная страница берётся из ?page=N.
  // Страницы с page-параметром пересоздаются на каждую навигацию
  // (definePageMeta({ key: route => route.fullPath }) на страницах архивов),
  // поэтому значение читаем один раз при setup.
  const route = useRoute();
  const rawPage = Number(route.query.page);
  const initialPage = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const hasPageParam = route.query.page != null;
  const baseOffset = (initialPage - 1) * itemsPerPage;

  const isLoading = ref(false);
  const error = ref<any>(null);
  const allItems = ref<T[]>([]);
  const total = ref<number>(0);
  const restoredScrollY = ref<number | null>(null);

  const getExcludeIds = () => {
    if (!options.excludeIds) return new Set<string | number>();
    return typeof options.excludeIds === 'function' ? options.excludeIds() : options.excludeIds.value;
  };

  const filteredItems = computed<T[]>(() => {
    const exclude = getExcludeIds();
    return allItems.value.filter((i) => !exclude.has(i.id));
  });

  async function fetchChunk(limit: number, offset: number): Promise<FetchResult<T>> {
    return fetcher({ limit, offset }).catch(() => ({ items: [] as T[], total: undefined }));
  }

  async function fillToRow() {
    while (filteredItems.value.length < total.value && filteredItems.value.length % rowSize !== 0) {
      const needed = rowSize - (filteredItems.value.length % rowSize);
      const next = await fetchChunk(needed, baseOffset + allItems.value.length);
      const newItems = next.items || [];
      if (!newItems.length) break;
      allItems.value.push(...newItems);
      total.value = next.total ?? total.value;
    }
  }

  // Догружает элементы, если при уходе со страницы было загружено больше,
  // чтобы вернуть список в то же состояние (см. onBeforeUnmount ниже).
  async function restoreSavedPosition() {
    // При явном page-параметре восстановление позиции не нужно:
    // страница загружает свою порцию, а не продолжает предыдущий скролл.
    if (hasPageParam) return;
    const saved = readSavedPosition(key);
    if (!saved) return;
    while (allItems.value.length < saved.count && allItems.value.length < total.value) {
      const next = await fetchChunk(itemsPerPage, baseOffset + allItems.value.length);
      const newItems = next.items || [];
      if (!newItems.length) break;
      allItems.value.push(...newItems);
      total.value = next.total ?? total.value;
    }
    restoredScrollY.value = saved.scrollY;
    clearSavedPosition(key);
  }

  const { data: initialData, error: initialError } = useAsyncData(`${key}-p${initialPage}`, async () => {
    const first = await fetchChunk(itemsPerPage, baseOffset);
    allItems.value = first.items || [];
    total.value = first.total ?? 0;

    await restoreSavedPosition();
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

  async function loadMore() {
    if (isLoading.value || filteredItems.value.length >= total.value) return;
    isLoading.value = true;
    try {
      const next = await fetchChunk(itemsPerPage, baseOffset + allItems.value.length);
      allItems.value.push(...(next.items || []));
      total.value = next.total ?? total.value;
      await fillToRow();
    } finally {
      isLoading.value = false;
    }
  }

  // Скролл восстанавливаем через watch, а не onMounted: useAsyncData не await-ится
  // в вызывающих страницах, поэтому restoredScrollY может появиться после монтирования.
  if (import.meta.client) {
    const stop = watch(restoredScrollY, (y) => {
      if (y == null || y <= 0) return;
      stop();
      restoredScrollY.value = null;
      nextTick(() => {
        window.scrollTo(0, y);
        // Вторая попытка после отрисовки картинок, которые могут сдвинуть layout.
        setTimeout(() => window.scrollTo(0, y), 300);
      });
    });
  }

  onBeforeUnmount(() => {
    if (!import.meta.client) return;
    // Позицию сохраняем только для первой страницы архива (без page-параметра):
    // именно туда пользователь возвращается «назад» из материала.
    if (initialPage !== 1) return;
    try {
      sessionStorage.setItem(
        STORAGE_PREFIX + key,
        JSON.stringify({ count: allItems.value.length, scrollY: window.scrollY }),
      );
    } catch {
      // ignore
    }
  });

  return {
    items: filteredItems,
    total,
    isLoading,
    error,
    loadMore,
  };
}
