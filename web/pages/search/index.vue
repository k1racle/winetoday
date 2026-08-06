<script setup lang="ts">
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const { getContent } = useApi();

const query = computed(() => (route.query.q as string) || '');

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
});

const { goal, event } = useYm();

const searched = ref(false);
let goalTracked = false;
let noResultsTracked = false;

const { items, total, isLoading, loadMore } = useArchivePagination(
  async ({ limit, offset }) => {
    if (!query.value) {
      searched.value = true;
      return { items: [], total: 0 };
    }
    try {
      const res = await getContent({ search: query.value, limit, offset });
      if (offset === 0) {
        if (!goalTracked) {
          goalTracked = true;
          goal('search');
        }
        if (res.total === 0 && !noResultsTracked) {
          noResultsTracked = true;
          event('search_no_results', { query: query.value });
        }
      }
      return res;
    } catch {
      return { items: [], total: 0 };
    } finally {
      searched.value = true;
    }
  },
  `search-${query.value}`,
  { itemsPerPage: 12, rowSize: 3 },
);

function targetUrl(item: { type: string; slug: string }) {
  switch (item.type) {
    case 'article':
      return `/articles/${item.slug}`;
    case 'news':
      return `/news/${item.slug}`;
    case 'video':
      return `/videos/${item.slug}`;
    case 'gallery':
      return `/gallery/${item.slug}`;
    default:
      return '/';
  }
}

function trackResultClick(item: { type: string; slug: string }) {
  event('search_success', {
    query: query.value,
    result_count: total.value,
    target_url: targetUrl(item),
  });
}

const pending = computed(() => Boolean(query.value) && !searched.value);
const altQuery = computed(() => (query.value ? convertKeyboardLayout(query.value, 'auto') : ''));

const { data: altResult } = useAsyncData(
  `search-alt-${query.value}`,
  () =>
    query.value && altQuery.value !== query.value
      ? getContent({ search: altQuery.value, limit: 1 }).catch(() => ({ items: [], total: 0 }))
      : Promise.resolve(null),
);

const altTotal = computed(() => altResult.value?.total || 0);
const showAltSuggestion = computed(() => total.value === 0 && altTotal.value > 0);

useSeoMeta({
  title: () => {
    const base = query.value ? `Поиск: ${query.value}` : 'Поиск';
    return currentPage.value > 1 ? `${base} — страница ${currentPage.value}` : base;
  },
  description: 'Поиск по материалам сайта.',
  robots: 'noindex,follow',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-2 font-heading text-3xl font-bold">Поиск</h1>
    <p v-if="query" class="mb-8 text-foreground/70">
      По запросу «<span class="font-normal text-foreground">{{ query }}</span>»
      найдено {{ total }} материалов
    </p>
    <p v-else class="mb-8 text-foreground/70">Введите поисковый запрос.</p>

    <div v-if="pending" class="py-12 text-center text-foreground/60">Загрузка...</div>

    <template v-else>
      <div
        v-if="showAltSuggestion"
        class="mb-6 rounded border border-accent/30 bg-accent/5 p-4 text-foreground/80"
      >
        Возможно, вы искали
        <NuxtLink :to="`/search?q=${encodeURIComponent(altQuery)}`" class="text-accent underline">
          «{{ altQuery }}»
        </NuxtLink>
        ({{ altTotal }} материалов)
      </div>

      <div
        v-if="items.length"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <ArticleCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          imageAspect="video"
          hideExcerpt
          @click="trackResultClick(item)"
        />
      </div>
      <div v-if="items.length < total" class="mt-8">
        <InfiniteScrollTrigger
          :loading="isLoading"
          :has-more="items.length < total"
          @load="loadMore"
        />
      </div>
      <div v-else-if="query && !items.length && !showAltSuggestion" class="py-12 text-center text-foreground/60">
        Ничего не найдено.
      </div>
      <ArchivePagination
        :total="total"
        :items-per-page="12"
        :extra-query="query ? { q: query } : {}"
      />
    </template>
  </div>
</template>
