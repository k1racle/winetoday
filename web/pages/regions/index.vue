<script setup lang="ts">
import type { RegionSummary } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const { getRegionsCatalog } = useApi();
const { data: regions } = await useAsyncData(
  'regions-index',
  async () => await getRegionsCatalog({ limit: 200 }) as RegionSummary[],
);

useCanonical();
useSeoMeta({
  title: 'Регионы',
  description: 'Регионы и подрегионы проекта «Виноделы России».',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Регионы</h1>
    <div class="mt-8 border border-foreground/10 bg-card p-5 md:p-6">
      <WinemakersRegionTree :items="regions || []" />
    </div>
  </div>
</template>
