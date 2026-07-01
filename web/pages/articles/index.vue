<script setup>
const { getArticles, getLatestByCategory } = useApi();

const { data: list } = await useAsyncData('articles-list', () =>
  getArticles({ limit: 24 }).catch(() => ({ items: [], total: 0 })),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-articles', () =>
  getLatestByCategory(5).catch(() => []),
);

const items = computed(() => list.value?.items || []);

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
          />
        </div>
      </div>
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
