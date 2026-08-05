interface PagedFetchOptions {
  limit: number;
  offset: number;
  sort?: string;
  authorSlug?: string;
  tagSlug?: string;
}

interface PagedFetchResult<T> {
  items: T[];
  total?: number;
}

const SORT_VALUES = ['new', 'old', 'popular', 'author'] as const;

// Постраничный архив: одна страница = один запрос, ?page=N + фильтры
// (?sort, ?author, ?tag) в query. Страницы архивов пересоздаются при смене
// query (definePageMeta({ key: route => route.fullPath })), поэтому
// useAsyncData всегда запрашивает актуальную порцию.
export function usePagedArchive<T extends { id: string | number }>(
  fetcher: (opts: PagedFetchOptions) => Promise<PagedFetchResult<T>>,
  baseKey: string,
  options: { itemsPerPage?: number } = {},
) {
  const itemsPerPage = options.itemsPerPage ?? 42;
  const route = useRoute();

  const currentPage = computed(() => {
    const n = Number(route.query.page);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });

  const sort = computed(() => {
    const s = String(route.query.sort || 'new');
    return (SORT_VALUES as readonly string[]).includes(s) ? s : 'new';
  });
  const author = computed(() => (route.query.author ? String(route.query.author) : undefined));
  const tag = computed(() => (route.query.tag ? String(route.query.tag) : undefined));

  const { data, pending, error } = useAsyncData(
    `${baseKey}-p${currentPage.value}-${sort.value}-${author.value || ''}-${tag.value || ''}`,
    () =>
      fetcher({
        limit: itemsPerPage,
        offset: (currentPage.value - 1) * itemsPerPage,
        sort: sort.value === 'new' ? undefined : sort.value,
        authorSlug: author.value,
        tagSlug: tag.value,
      }).catch(() => ({ items: [] as T[], total: 0 })),
  );

  const items = computed<T[]>(() => (data.value?.items as T[]) || []);
  const total = computed(() => data.value?.total || 0);

  // Query-параметры фильтров для ссылок пагинации (page туда не входит).
  const filterQuery = computed<Record<string, string>>(() => {
    const query: Record<string, string> = {};
    if (sort.value !== 'new') query.sort = sort.value;
    if (author.value) query.author = author.value;
    if (tag.value) query.tag = tag.value;
    return query;
  });

  return {
    items,
    total,
    currentPage,
    isLoading: pending,
    error,
    sort,
    author,
    tag,
    itemsPerPage,
    filterQuery,
  };
}
