<script setup>
const { getVideos, getLatestByCategory } = useApi();

const { data: list } = await useAsyncData('videos-list', () =>
  getVideos({ limit: 24 }).catch(() => ({ items: [], total: 0 })),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-videos', () =>
  getLatestByCategory(5).catch(() => []),
);

const items = computed(() => list.value?.items || []);

useSeoMeta({
  title: 'Видео — Виноделие сегодня',
  description: 'Видеоматериалы о вине, виноделии и виноградарстве.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-8 font-heading text-3xl font-bold">Видео</h1>
    <div class="grid gap-8 lg:grid-cols-4">
      <div class="lg:col-span-3">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <VideoThumb
            v-for="item in items"
            :key="item.id"
            :item="item"
            class="w-full"
          />
        </div>
      </div>
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
