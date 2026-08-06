<script setup>
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const { getVideos, getLatestByCategory, getAuthorsList, getTags } = useApi();

const { items, total, currentPage, itemsPerPage, filterQuery } = usePagedArchive(
  (opts) => getVideos(opts),
  'videos-list',
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-videos', () =>
  getLatestByCategory(10).catch(() => []),
);
const { data: authors } = await useAsyncData('authors-filter', () =>
  getAuthorsList().catch(() => []),
);
const { data: tags } = await useAsyncData('tags-filter', () => getTags().catch(() => []));

useCanonical(currentPage.value > 1 ? `${route.path}?page=${currentPage.value}` : undefined);
useBreadcrumbSchema([
  { name: 'Главная', path: '/' },
  { name: 'Видео', path: '/videos' },
]);

useSeoMeta({
  title: () =>
    currentPage.value > 1
      ? `Видео — страница ${currentPage.value} — Виноделие сегодня`
      : 'Видео — Виноделие сегодня',
  description: 'Видеоматериалы о вине, виноделии и виноградарстве.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Видео</h1>

    <ArchiveFilters :authors="authors || []" :tags="tags || []" />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <div
          v-if="!items.length"
          class="rounded border border-foreground/10 bg-card px-4 py-12 text-center text-sm text-foreground/60"
        >
          По выбранным фильтрам ничего не найдено.
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            imageAspect="video"
            variant="compact"
          />
        </div>
        <ArchivePagination :total="total" :items-per-page="itemsPerPage" :extra-query="filterQuery" />
      </div>
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
