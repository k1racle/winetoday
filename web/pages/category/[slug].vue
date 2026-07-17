<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const slug = route.params.slug as string;

const { getContent, getCategories, getLatestByCategory } = useApi();

const itemsPerPage = 24;
const isLoading = ref(false);

const { data: categories } = await useAsyncData('categories', () =>
  getCategories().catch(() => []),
);

const { data: content, error: contentError } = await useAsyncData(`category-content-${slug}`, () =>
  getContent({ categorySlug: slug, limit: itemsPerPage }).catch((err) => {
    console.error('Failed to load category content:', err);
    return { items: [], total: 0 };
  }),
);

const items = ref<ContentItem[]>((content.value?.items || []).sort(
  (a, b) =>
    new Date(b.publishedAt || b.createdAt).getTime() -
    new Date(a.publishedAt || a.createdAt).getTime(),
));
const total = ref(content.value?.total || 0);
const offset = ref(itemsPerPage);

async function loadMore() {
  if (isLoading.value || items.value.length >= total.value) return;
  isLoading.value = true;
  try {
    const next = await getContent({ categorySlug: slug, limit: itemsPerPage, offset: offset.value }).catch((err) => {
      console.error('Failed to load category content:', err);
      return { items: [], total: 0 };
    });
    const sorted = (next.items || []).sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime(),
    );
    items.value.push(...sorted);
    total.value = next.total ?? total.value;
    offset.value += itemsPerPage;
  } finally {
    isLoading.value = false;
  }
}

const category = computed(() =>
  (categories.value || []).find((c: any) => c.slug === slug),
);

const archiveSeo = useArchiveSeo(slug, category.value?.name);
useSeoMeta({
  title: archiveSeo.title.value || `${category.value?.name || slug} — Виноделие сегодня`,
  description: archiveSeo.description.value || `Материалы по рубрике «${category.value?.name || slug}».`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-4 text-xs font-normal uppercase tracking-wider text-foreground/50">
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

      <!-- Sidebar -->
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
