<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const slug = route.params.slug as string;

const { getContent, getCategories, getLatestByCategory } = useApi();

const { data: categories } = await useAsyncData('categories', () =>
  getCategories().catch(() => []),
);

const { data: content, error: contentError } = await useAsyncData(`category-content-${slug}`, () =>
  getContent({ categorySlug: slug, limit: 24 }).catch((err) => {
    console.error('Failed to load category content:', err);
    return { items: [], total: 0 };
  }),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category', () =>
  getLatestByCategory(5).catch(() => []),
);

const category = computed(() =>
  (categories.value || []).find((c: any) => c.slug === slug),
);

const items = computed(() => {
  const list = content.value?.items || [];
  return [...list].sort(
    (a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime(),
  );
});

useSeoMeta({
  title: `${category.value?.name || slug} — Виноделие сегодня`,
  description: `Материалы по рубрике «${category.value?.name || slug}».`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-4 text-xs font-medium uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ category?.name || slug }}</span>
    </nav>

    <h1 class="mb-6 font-heading text-3xl font-bold md:text-4xl">
      {{ category?.name || slug }}
    </h1>

    <div class="grid gap-8 lg:grid-cols-4">
      <!-- Main grid -->
      <div class="lg:col-span-3">
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
            class="h-[320px]"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
