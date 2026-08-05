<script setup lang="ts">
import type { RegionSummary, WinemakersMapPoint, WinemakersMapResponse } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const { getRegionsCatalog, getRegionsMap } = useApi();
const { data } = await useAsyncData(
  'regions-index',
  async () => {
    const [regions, mapData] = await Promise.all([
      getRegionsCatalog({ limit: 200 }) as Promise<RegionSummary[]>,
      getRegionsMap().catch(() => ({ regions: [], terroirs: [] }) as WinemakersMapResponse),
    ]);

    return { regions, mapData };
  },
);

const regions = computed(() => data.value?.regions || []);
const mapPoints = computed<WinemakersMapPoint[]>(() => {
  const mapData = data.value?.mapData;
  if (!mapData) {
    return [];
  }

  return [
    ...(mapData.regions || []).map((region) => ({
      ...region,
      kind: 'region' as const,
      persons: region.persons || [],
    })),
    ...(mapData.terroirs || []).map((terroir) => ({
      ...terroir,
      kind: 'terroir' as const,
      persons: terroir.persons || [],
    })),
  ];
});

useCanonical();
useSeoMeta({
  title: 'Регионы',
  description: 'Регионы и подрегионы проекта «Виноделы России».',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Регионы</h1>
    <div class="mt-8">
      <WinemakersGeoMap
        :points="mapPoints"
        title="География проекта"
        description="Обзор опубликованных регионов и терруаров. Клик по карточке в подсказке ведет на детальную страницу."
        height-class="h-[380px]"
      />
    </div>
    <div class="mt-8 border border-foreground/10 bg-card p-5 md:p-6">
      <WinemakersRegionTree :items="regions" />
    </div>
  </div>
</template>
