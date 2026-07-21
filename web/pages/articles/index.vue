<script setup>
const { getArticles, getLatestByCategory } = useApi();

const { items, total, isLoading, loadMore } = await useArchivePagination(
  ({ limit, offset }) => getArticles({ limit, offset }),
  'articles-list',
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-articles', () =>
  getLatestByCategory(10).catch(() => []),
);

useSeoMeta({
  title: 'Статьи',
  description: 'Статьи о вине, виноделии и виноградарстве.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-8 font-heading text-3xl font-bold">Статьи</h1>
    <div class="grid gap-8 lg:grid-cols-4">
      <div class="lg:col-span-3">
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
          <LoadMoreButton
            :loading="isLoading"
            :has-more="items.length < total"
            @load="loadMore"
          />
        </div>
      </div>
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
