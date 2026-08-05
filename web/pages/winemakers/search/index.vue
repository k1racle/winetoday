<script setup lang="ts">
import type { WinepediaSearchResult } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  key: (route) => route.fullPath,
  middleware: 'winemakers-access',
});

const route = useRoute();
const { searchWinepedia } = useApi();
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : '').trim());

const { data: result } = await useAsyncData(
  `winepedia-search-${route.fullPath}`,
  async () => {
    if (!q.value) {
      return { q: '', persons: [], wines: [], regions: [], wineries: [] } as WinepediaSearchResult;
    }
    return await searchWinepedia({ q: q.value, limit: 20 }) as WinepediaSearchResult;
  },
);

useCanonical();
useSeoMeta({
  title: () => (q.value ? `Поиск по каталогу: ${q.value}` : 'Поиск по каталогу'),
  description: 'Поиск по каталогу «Виноделы России».',
  robots: 'noindex,follow',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="font-heading text-4xl font-bold">Поиск по каталогу</h1>
    <p v-if="q" class="mt-4 text-lg text-foreground/72">
      Результаты по запросу «{{ q }}»
    </p>
    <p v-else class="mt-4 text-lg text-foreground/72">Введите запрос в строке поиска раздела.</p>

    <div v-if="result && q" class="mt-10 space-y-12">
      <section v-if="result.persons.length">
        <h2 class="mb-5 font-heading text-2xl font-bold">Виноделы</h2>
        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <WinemakersPersonCard v-for="person in result.persons" :key="person.id" :person="person" />
        </div>
      </section>

      <section v-if="result.wines.length">
        <h2 class="mb-5 font-heading text-2xl font-bold">Вина</h2>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <WinemakersWineCard v-for="wine in result.wines" :key="wine.id" :wine="wine" />
        </div>
      </section>

      <section v-if="result.regions.length">
        <h2 class="mb-5 font-heading text-2xl font-bold">Регионы</h2>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <WinemakersCatalogCard
            v-for="region in result.regions"
            :key="region.id"
            :to="`/regions/${region.slug}`"
            :title="region.name"
            eyebrow="Регион"
            :summary="region.summary"
          />
        </div>
      </section>

      <section v-if="result.wineries.length">
        <h2 class="mb-5 font-heading text-2xl font-bold">Винодельни</h2>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <WinemakersCatalogCard
            v-for="winery in result.wineries"
            :key="winery.id"
            :to="`/wineries/${winery.slug}`"
            :title="winery.name"
            eyebrow="Винодельня"
            :summary="winery.summary"
            :meta="[winery.region?.name || ''].filter(Boolean)"
          />
        </div>
      </section>

      <p
        v-if="!result.persons.length && !result.wines.length && !result.regions.length && !result.wineries.length"
        class="text-foreground/60"
      >
        По этому запросу пока ничего не найдено.
      </p>
    </div>
  </div>
</template>
