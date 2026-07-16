<script setup>
const { getArticles, getLatestByCategory } = useApi();

const itemsPerPage = 24;
const isLoading = ref(false);

const { data: list } = await useAsyncData('articles-list', () =>
  getArticles({ limit: itemsPerPage }).catch(() => ({ items: [], total: 0 })),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-articles', () =>
  getLatestByCategory(10).catch(() => []),
);

const items = computed(() => list.value?.items || []);
const total = computed(() => list.value?.total || 0);

async function loadMore() {
  if (isLoading.value || items.value.length >= total.value) return;
  isLoading.value = true;
  try {
    const next = await getArticles({ limit: itemsPerPage, offset: items.value.length });
    list.value.items.push(...(next.items || []));
    list.value.total = next.total ?? list.value.total;
  } finally {
    isLoading.value = false;
  }
}

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
            imageAspect="video"
            hideExcerpt
          />
        </div>
        <div v-if="items.length < total" class="mt-8">
          <button
            type="button"
            :disabled="isLoading"
            class="inline-flex items-center rounded border border-accent bg-transparent px-5 py-2.5 text-sm font-normal text-accent transition hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            @click="loadMore"
          >
            {{ isLoading ? 'Загрузка...' : 'Ещё' }}
            <span class="ml-1">→</span>
          </button>
        </div>
      </div>
      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="latestByCategory || []" />
      </aside>
    </div>
  </div>
</template>
