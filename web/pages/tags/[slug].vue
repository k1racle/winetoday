<script setup lang="ts">
definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const slug = route.params.slug as string;

const { getContent, getTags, getLatestByCategory, getAuthorsList } = useApi();

const { items, total, currentPage, itemsPerPage, filterQuery, error: contentError } = usePagedArchive(
  (opts) => getContent({ tagSlug: slug, ...opts }),
  `tag-${slug}`,
);

const { data: tags } = await useAsyncData('tags', () =>
  getTags().catch(() => []),
);

const { data: latestByCategory } = await useAsyncData(`latest-by-category-tag-${slug}`, () =>
  getLatestByCategory(10).catch(() => []),
);
const { data: authors } = await useAsyncData('authors-filter', () =>
  getAuthorsList().catch(() => []),
);

const tag = computed(() =>
  (tags.value || []).find((t: any) => t.slug === slug),
);

if (!tag.value) {
  throw createError({ statusCode: 404, statusMessage: 'Тег не найден' });
}

const archiveSeo = useArchiveSeo(slug, tag.value?.name);
const pageTitle = computed(() => {
  const base = archiveSeo.title.value || `${tag.value?.name || slug} — Виноделие Сегодня`;
  return currentPage.value > 1 ? `${base} — страница ${currentPage.value}` : base;
});
const pageDescription = computed(() =>
  archiveSeo.description.value || `Материалы по тегу «${tag.value?.name || slug}».`,
);

useArchiveSeoControls({
  currentPage,
  canonicalBasePath: route.path,
  title: pageTitle,
  description: pageDescription,
  keywords: archiveSeo.keywords,
  isIndexable: computed(() => items.value.length > 0),
});

useCollectionPageSchema({
  title: pageTitle,
  description: pageDescription,
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
      <span>{{ tag?.name || slug }}</span>
    </nav>

    <h1 class="mb-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
      {{ tag?.name || slug }}
    </h1>

    <ArchiveFilters :authors="authors || []" :show-tag="false" />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <div v-if="contentError" class="rounded border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          Ошибка загрузки материалов по тегу.
        </div>
        <div v-else-if="!items.length" class="rounded border border-foreground/10 bg-card px-4 py-12 text-center text-sm text-foreground/60">
          По этому тегу пока нет материалов.
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
