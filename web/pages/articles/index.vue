<script setup>
// Пересоздаём страницу при смене query, чтобы пагинация (?page=N) инициализировалась заново.
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const { getArticles, getLatestByCategory } = useApi();

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
});

const { items, total, isLoading, loadMore } = useArchivePagination(
  ({ limit, offset }) => getArticles({ limit, offset }),
  'articles-list',
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-articles', () =>
  getLatestByCategory(10).catch(() => []),
);

useCanonical(currentPage.value > 1 ? `${route.path}?page=${currentPage.value}` : undefined);

useSeoMeta({
  title: () => (currentPage.value > 1 ? `Статьи — страница ${currentPage.value}` : 'Статьи'),
  description: 'Статьи о вине, виноделии и виноградарстве.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-8 font-heading text-3xl font-bold">Статьи</h1>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="article in items"
            :key="article.id"
            :item="article"
            imageAspect="video"
            hideExcerpt
          />
        </div>
        <div v-if="items.length < total" class="mt-8">
          <InfiniteScrollTrigger
            :loading="isLoading"
            :has-more="items.length < total"
            @load="loadMore"
          />
        </div>
        <ArchivePagination :total="total" :items-per-page="24" />
      </div>
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
