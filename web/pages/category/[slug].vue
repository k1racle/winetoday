<script setup lang="ts">
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const slug = route.params.slug as string;

const { getContent, getCategories, getLatestByCategory, getAuthorsList, getTags } = useApi();

const { items, total, currentPage, itemsPerPage, filterQuery, error: contentError } = usePagedArchive(
  (opts) => getContent({ categorySlug: slug, ...opts }),
  `category-content-${slug}`,
);

const { data: categories } = await useAsyncData('categories', () =>
  getCategories().catch(() => []),
);

const { data: latestByCategory } = await useAsyncData(`latest-by-category-${slug}`, () =>
  getLatestByCategory(10).catch(() => []),
);
const { data: authors } = await useAsyncData('authors-filter', () =>
  getAuthorsList().catch(() => []),
);
const { data: tags } = await useAsyncData('tags-filter', () => getTags().catch(() => []));

const category = computed(() =>
  (categories.value || []).find((c: any) => c.slug === slug),
);

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Рубрика не найдена' });
}

useArchiveSeoControls({ currentPage, canonicalBasePath: route.path });

const archiveSeo = useArchiveSeo(slug, category.value?.name);
useSeoMeta({
  title: () => {
    const base = archiveSeo.title.value || `${category.value?.name || slug} — Виноделие сегодня`;
    return currentPage.value > 1 ? `${base} — страница ${currentPage.value}` : base;
  },
  description: archiveSeo.description.value || `Материалы по рубрике «${category.value?.name || slug}».`,
});

useCollectionPageSchema({
  title: computed(() => {
    const base = archiveSeo.title.value || `${category.value?.name || slug} — Виноделие сегодня`;
    return currentPage.value > 1 ? `${base} — страница ${currentPage.value}` : base;
  }),
  description: computed(() => archiveSeo.description.value || `Материалы по рубрике «${category.value?.name || slug}».`),
  path: computed(() => route.fullPath),
  items: computed(() =>
    items.value.map((item) => ({
      name: item.title,
      url:
        item.type === 'news'
          ? `/news/${item.slug}`
          : item.type === 'video'
            ? `/videos/${item.slug}`
            : item.type === 'gallery'
              ? `/gallery/${item.slug}`
              : `/articles/${item.slug}`,
    })),
  ),
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-4 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ category?.name || slug }}</span>
    </nav>

    <h1 class="mb-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
      {{ category?.name || slug }}
    </h1>

    <ArchiveFilters :authors="authors || []" :tags="tags || []" />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <div v-if="contentError" class="rounded border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          Ошибка загрузки материалов рубрики.
        </div>
        <div v-else-if="!items.length" class="rounded border border-foreground/10 bg-card px-4 py-12 text-center text-sm text-foreground/60">
          В этой рубрике пока нет материалов.
        </div>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            image-aspect="video"
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
