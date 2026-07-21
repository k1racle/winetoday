<script setup>
const { getVideos, getLatestByCategory } = useApi();

const { items, total, isLoading, loadMore } = useArchivePagination(
  ({ limit, offset }) => getVideos({ limit, offset }),
  'videos-list',
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-videos', () =>
  getLatestByCategory(10).catch(() => []),
);

useSeoMeta({
  title: 'Видео — Виноделие сегодня',
  description: 'Видеоматериалы о вине, виноделии и виноградарстве.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-8 font-heading text-3xl font-bold">Видео</h1>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            imageAspect="video"
            variant="compact"
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
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
