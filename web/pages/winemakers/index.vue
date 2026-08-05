<script setup lang="ts">
import type {
  PersonSummary,
  RegionSummary,
  WineSummary,
  WinerySummary,
} from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const { getWinemakers, getRegionsCatalog, getWinesCatalog, getWineriesCatalog } = useApi();
const activeTab = ref<'persons' | 'regions' | 'wines' | 'wineries'>('persons');

const { data } = await useAsyncData('winemakers-home', async () => {
  const [featured, persons, regions, wines, wineries] = await Promise.all([
    getWinemakers({ featured: true, limit: 4 }).catch(() => ({ items: [] })),
    getWinemakers({ limit: 18 }).catch(() => ({ items: [] })),
    getRegionsCatalog({ limit: 200 }).catch(() => []),
    getWinesCatalog({ limit: 18 }).catch(() => ({ items: [] })),
    getWineriesCatalog({ limit: 18 }).catch(() => ({ items: [] })),
  ]);

  return {
    featured: (featured as any)?.items || [],
    persons: (persons as any)?.items || [],
    regions: Array.isArray(regions) ? regions : [],
    wines: (wines as any)?.items || [],
    wineries: (wineries as any)?.items || [],
  };
});

const featuredPeople = computed(() => (data.value?.featured || []) as PersonSummary[]);
const persons = computed(() => (data.value?.persons || []) as PersonSummary[]);
const regions = computed(() => (data.value?.regions || []) as RegionSummary[]);
const wines = computed(() => (data.value?.wines || []) as WineSummary[]);
const wineries = computed(() => (data.value?.wineries || []) as WinerySummary[]);

useCanonical();
useSeoMeta({
  title: 'Виноделы России',
  description: 'Биографии виноделов, регионы, терруары, хозяйства и вина российского виноделия.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <div class="max-w-3xl">
      <p class="text-xs font-bold uppercase tracking-[0.3em] text-foreground/45">Спецпроект</p>
      <h1 class="mt-4 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold md:text-5xl">
        Виноделы России
      </h1>
      <p class="mt-6 text-lg leading-8 text-foreground/72">
        Каталог людей, хозяйств, регионов и вин, которые формируют современное российское виноделие.
      </p>
    </div>

    <section v-if="featuredPeople.length" class="mt-12">
      <div class="mb-6 flex items-end justify-between gap-4">
        <h2 class="font-heading text-2xl font-bold">Избранные виноделы</h2>
        <NuxtLink to="/winemakers/search" class="text-sm text-accent hover:underline">Поиск по каталогу</NuxtLink>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <WinemakersPersonCard
          v-for="person in featuredPeople"
          :key="person.id"
          :person="person"
        />
      </div>
    </section>

    <section class="mt-14">
      <div class="mb-6 flex flex-wrap gap-2 border-b border-foreground/10 pb-3">
        <button
          type="button"
          class="px-3 py-2 text-sm font-bold uppercase tracking-wider transition"
          :class="activeTab === 'persons' ? 'border-b-2 border-accent text-foreground' : 'text-foreground/55 hover:text-accent'"
          @click="activeTab = 'persons'"
        >
          Персоны
        </button>
        <button
          type="button"
          class="px-3 py-2 text-sm font-bold uppercase tracking-wider transition"
          :class="activeTab === 'regions' ? 'border-b-2 border-accent text-foreground' : 'text-foreground/55 hover:text-accent'"
          @click="activeTab = 'regions'"
        >
          Регионы
        </button>
        <button
          type="button"
          class="px-3 py-2 text-sm font-bold uppercase tracking-wider transition"
          :class="activeTab === 'wines' ? 'border-b-2 border-accent text-foreground' : 'text-foreground/55 hover:text-accent'"
          @click="activeTab = 'wines'"
        >
          Вина
        </button>
        <button
          type="button"
          class="px-3 py-2 text-sm font-bold uppercase tracking-wider transition"
          :class="activeTab === 'wineries' ? 'border-b-2 border-accent text-foreground' : 'text-foreground/55 hover:text-accent'"
          @click="activeTab = 'wineries'"
        >
          Хозяйства
        </button>
      </div>

      <div v-if="activeTab === 'persons'" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <WinemakersPersonCard v-for="person in persons" :key="person.id" :person="person" />
      </div>

      <div v-else-if="activeTab === 'regions'" class="border border-foreground/10 bg-card p-5 md:p-6">
        <WinemakersRegionTree :items="regions" />
      </div>

      <div v-else-if="activeTab === 'wines'" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersWineCard v-for="wine in wines" :key="wine.id" :wine="wine" />
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="winery in wineries"
          :key="winery.id"
          :to="`/wineries/${winery.slug}`"
          class="block border border-foreground/10 bg-card p-5 transition hover:border-accent/40 hover:bg-foreground/5"
        >
          <p class="font-heading text-2xl font-bold">{{ winery.name }}</p>
          <p v-if="winery.region?.name" class="mt-2 text-sm text-foreground/60">{{ winery.region.name }}</p>
          <p v-if="winery.summary" class="mt-4 text-sm leading-6 text-foreground/72">{{ winery.summary }}</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
