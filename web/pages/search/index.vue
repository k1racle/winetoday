<script setup lang="ts">
const route = useRoute();
const { getContent } = useApi();

const query = computed(() => (route.query.q as string) || '');

const { data: result, pending } = useAsyncData(
  () => `search-${query.value}`,
  () =>
    query.value
      ? getContent({ search: query.value, limit: 24 }).catch(() => ({ items: [], total: 0 }))
      : Promise.resolve({ items: [], total: 0 }),
  { watch: [query] },
);

const items = computed(() => result.value?.items || []);
const total = computed(() => result.value?.total || 0);

useSeoMeta({
  title: () => (query.value ? `Поиск: ${query.value}` : 'Поиск'),
  description: 'Поиск по материалам сайта.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-2 font-heading text-3xl font-bold">Поиск</h1>
    <p v-if="query" class="mb-8 text-foreground/70">
      По запросу «<span class="font-medium text-foreground">{{ query }}</span>»
      найдено {{ total }} материалов
    </p>
    <p v-else class="mb-8 text-foreground/70">Введите поисковый запрос.</p>

    <div v-if="pending" class="py-12 text-center text-foreground/60">Загрузка...</div>

    <template v-else>
      <div
        v-if="items.length"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <ArticleCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          imageAspect="video"
          hideExcerpt
        />
      </div>
      <div v-else-if="query" class="py-12 text-center text-foreground/60">
        Ничего не найдено.
      </div>
    </template>
  </div>
</template>
