<script setup lang="ts">
import type { TerroirSummary } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  key: (route) => route.fullPath,
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getTerroirsCatalog } = useApi();

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
});

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : '').trim());
const limit = 24;
const form = reactive({ q: q.value });

watch(q, () => {
  form.q = q.value;
});

const { data: payload } = await useAsyncData(
  `terroirs-index-${route.fullPath}`,
  async () => await getTerroirsCatalog({
    q: q.value || undefined,
    limit,
    offset: (currentPage.value - 1) * limit,
  }) as { items: TerroirSummary[]; total: number; limit: number; offset: number },
);

const items = computed(() => payload.value?.items || []);
const total = computed(() => payload.value?.total || 0);

function submitFilters() {
  navigateTo({
    path: '/terroirs',
    query: {
      ...(form.q.trim() ? { q: form.q.trim() } : {}),
    },
  });
}

useCanonical(currentPage.value > 1 ? `/terroirs?page=${currentPage.value}` : '/terroirs');
useSeoMeta({
  title: () => (currentPage.value > 1 ? `Терруары — страница ${currentPage.value}` : 'Терруары'),
  description: 'Каталог терруаров проекта «Виноделы России».',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Терруары</h1>

    <form class="mt-8 grid gap-4 border border-foreground/10 bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="submitFilters">
      <input
        v-model="form.q"
        type="search"
        placeholder="Поиск по названию, региону или описанию"
        class="border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
      >
      <button type="submit" class="bg-accent px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-accent/90">
        Фильтр
      </button>
    </form>

    <div v-if="items.length" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <WinemakersCatalogCard
        v-for="terroir in items"
        :key="terroir.id"
        :to="`/terroirs/${terroir.slug}`"
        :title="terroir.name"
        eyebrow="Терруар"
        :summary="terroir.summary"
        :meta="[terroir.region?.name || '', terroir.elevationM ? `${terroir.elevationM} м` : '', terroir.soil || ''].filter(Boolean)"
      />
    </div>
    <div v-else class="mt-8 border border-foreground/10 bg-card px-4 py-10 text-center text-sm text-foreground/60">
      По текущим параметрам терруары не найдены.
    </div>

    <ArchivePagination
      class="mt-8"
      :total="total"
      :items-per-page="limit"
      :extra-query="{
        ...(q ? { q } : {}),
      }"
    />
  </div>
</template>
