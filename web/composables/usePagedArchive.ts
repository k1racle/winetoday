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
export async function usePagedArchive<T extends { id: string | number }>(
  fetcher: (opts: PagedFetchOptions) => Promise<PagedFetchResult<T>>,
  baseKey: string,
  options: { itemsPerPage?: number; enableAuthorFilter?: boolean } = {},
) {
  const itemsPerPage = options.itemsPerPage ?? 42;
  const enableAuthorFilter = options.enableAuthorFilter ?? true;
  const route = useRoute();

  const currentPage = computed(() => {
    const n = Number(route.query.page);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });

  const sort = computed(() => {
    const s = String(route.query.sort || 'new');
    return (SORT_VALUES as readonly string[]).includes(s) ? s : 'new';
  });
  const author = computed(() =>
    enableAuthorFilter && route.query.author ? String(route.query.author) : undefined,
  );
  const tag = computed(() => (route.query.tag ? String(route.query.tag) : undefined));

  const { data, pending, error } = await useAsyncData(
    `${baseKey}-p${currentPage.value}-${sort.value}-${author.value || ''}-${tag.value || ''}`,
    () =>
      fetcher({
        limit: itemsPerPage,
        offset: (currentPage.value - 1) * itemsPerPage,
        sort: sort.value === 'new' ? undefined : sort.value,
        authorSlug: author.value,
        tagSlug: tag.value,
      }),
  );

  if (error.value) {
    const statusCode = Number(
      (error.value as any)?.statusCode ||
        (error.value as any)?.status ||
        (error.value as any)?.response?.status,
    );

    throw createError({
      statusCode: statusCode >= 400 && statusCode < 500 ? statusCode : 503,
      statusMessage: 'Не удалось загрузить архив',
      cause: error.value,
    });
  }

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
