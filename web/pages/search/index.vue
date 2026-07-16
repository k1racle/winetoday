<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { getContent } = useApi();

const query = computed(() => (route.query.q as string) || '');

const { data: result, pending } = useAsyncData(
  () => `search-${query.value}`,
  async () => {
    if (!query.value) {
      return { primary: { items: [], total: 0 }, alternate: null, altQuery: '' };
    }
    const altQuery = convertKeyboardLayout(query.value, 'auto');
    const [primary, alternate] = await Promise.all([
      getContent({ search: query.value, limit: 24 }).catch(() => ({ items: [], total: 0 })),
      altQuery !== query.value
        ? getContent({ search: altQuery, limit: 24 }).catch(() => ({ items: [], total: 0 }))
        : Promise.resolve(null),
    ]);
    return { primary, alternate, altQuery };
  },
  { watch: [query] },
);

const items = computed(() => result.value?.primary?.items || []);
const total = computed(() => result.value?.primary?.total || 0);
const altQuery = computed(() => result.value?.altQuery || '');
const altTotal = computed(() => result.value?.alternate?.total || 0);
const showAltSuggestion = computed(() => total.value === 0 && altTotal.value > 0);

useSeoMeta({
  title: () => (query.value ? `Поиск: ${query.value}` : 'Поиск'),
  description: 'Поиск по материалам сайта.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-2 font-heading text-3xl font-bold">Поиск</h1>
    <p v-if="query" class="mb-8 text-foreground/70">
      По запросу «<span class="font-normal text-foreground">{{ query }}</span>»
      найдено {{ total }} материалов
    </p>
    <p v-else class="mb-8 text-foreground/70">Введите поисковый запрос.</p>

    <div v-if="pending" class="py-12 text-center text-foreground/60">Загрузка...</div>

    <template v-else>
      <div
        v-if="showAltSuggestion"
        class="mb-6 rounded border border-accent/30 bg-accent/5 p-4 text-foreground/80"
      >
        Возможно, вы искали
        <NuxtLink :to="`/search?q=${encodeURIComponent(altQuery)}`" class="text-accent underline">
          «{{ altQuery }}»
        </NuxtLink>
        ({{ altTotal }} материалов)
      </div>

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
      <div v-else-if="query && !showAltSuggestion" class="py-12 text-center text-foreground/60">
        Ничего не найдено.
      </div>
    </template>
  </div>
</template>
