<script setup>
const { getNews, getLatestByCategory } = useApi();

const { data: news } = await useAsyncData('news-list', () =>
  getNews({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-news', () =>
  getLatestByCategory(10).catch(() => []),
);

const items = computed(() => news.value?.items || []);

useSeoMeta({
  title: 'Новости',
  description: 'Последние новости виноделия и виноградарства.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-6 font-heading text-2xl font-bold md:text-3xl">Новости</h1>
    <div class="grid gap-8 lg:grid-cols-4">
      <div class="lg:col-span-3">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            image-aspect="video"
            variant="compact"
          />
        </div>
      </div>
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
