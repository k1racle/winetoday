<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const slug = route.params.slug as string;

const { getContent, getTags, getLatestByCategory } = useApi();

const { items, total, isLoading, loadMore, error: contentError } = useArchivePagination(
  ({ limit, offset }) =>
    getContent({ tagSlug: slug, limit, offset }).catch(() => ({
      items: [] as ContentItem[],
      total: 0,
    })),
  `tag-${slug}`,
);

const { data: tags } = await useAsyncData('tags', () =>
  getTags().catch(() => []),
);

const { data: latestByCategory } = await useAsyncData(`latest-by-category-tag-${slug}`, () =>
  getLatestByCategory(10).catch(() => []),
);

const tag = computed(() =>
  (tags.value || []).find((t: any) => t.slug === slug),
);

if (!tag.value) {
  throw createError({ statusCode: 404, statusMessage: 'Тег не найден' });
}

useCanonical();

const archiveSeo = useArchiveSeo(slug, tag.value?.name);
useSeoMeta({
  title: archiveSeo.title.value || `${tag.value?.name || slug} — Виноделие сегодня`,
  description: archiveSeo.description.value || `Материалы по тегу «${tag.value?.name || slug}».`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-4 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ tag?.name || slug }}</span>
    </nav>

    <h1 class="mb-6 font-heading text-3xl font-bold md:text-4xl">
      {{ tag?.name || slug }}
    </h1>

    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <!-- Main grid -->
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
        <div v-if="items.length < total" class="mt-8">
          <InfiniteScrollTrigger
            :loading="isLoading"
            :has-more="items.length < total"
            @load="loadMore"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
