<script setup lang="ts">
import type { RegionDetail } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getRegionCatalogItem } = useApi();

const { data: region } = await useAsyncData(
  `region-${route.params.slug}`,
  async () => {
    try {
      return await getRegionCatalogItem(String(route.params.slug)) as RegionDetail;
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.response?.status || 404,
        statusMessage: 'Регион не найден',
      });
    }
  },
);

useCanonical();
useSeoMeta({
  title: () => (region.value ? `${region.value.name} — Виноделы России` : 'Регионы'),
  description: () => region.value?.summary || 'Страница винодельческого региона.',
});
</script>

<template>
  <div v-if="region" class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <nav class="text-xs font-bold uppercase tracking-wider text-foreground/45">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/regions">Регионы</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ region.name }}</span>
    </nav>

    <h1 class="mt-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
      {{ region.name }}
    </h1>

    <div class="mt-6 flex flex-wrap gap-6 text-sm text-foreground/70">
      <p v-if="region.climate"><span class="font-bold text-foreground">Климат:</span> {{ region.climate }}</p>
      <p v-if="region.soil"><span class="font-bold text-foreground">Почвы:</span> {{ region.soil }}</p>
    </div>

    <section class="mt-8 max-w-3xl">
      <p v-if="region.summary" class="mb-6 text-lg leading-8 text-foreground/72">{{ region.summary }}</p>
      <WinemakersBlocks :blocks="region.description" :title="region.name" />
    </section>

    <section v-if="region.children?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Подрегионы</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="child in region.children"
          :key="child.id"
          :to="`/regions/${child.slug}`"
          class="border border-foreground/10 px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
        >
          {{ child.name }}
        </NuxtLink>
      </div>
    </section>

    <section v-if="region.terroirs?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Терруары</h2>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="terroir in region.terroirs"
          :key="terroir.id"
          :to="`/terroirs/${terroir.slug}`"
          class="block border border-foreground/10 bg-card p-4 transition hover:border-accent/40 hover:bg-foreground/5"
        >
          <p class="font-heading text-xl">{{ terroir.name }}</p>
          <p v-if="terroir.summary" class="mt-2 text-sm leading-6 text-foreground/72">{{ terroir.summary }}</p>
        </NuxtLink>
      </div>
    </section>

    <section v-if="region.wineries?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Хозяйства</h2>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="winery in region.wineries"
          :key="winery.id"
          :to="`/wineries/${winery.slug}`"
          class="block border border-foreground/10 bg-card p-4 transition hover:border-accent/40 hover:bg-foreground/5"
        >
          <p class="font-heading text-xl">{{ winery.name }}</p>
          <p v-if="winery.summary" class="mt-2 text-sm leading-6 text-foreground/72">{{ winery.summary }}</p>
        </NuxtLink>
      </div>
    </section>

    <section v-if="region.wines?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Вина региона</h2>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersWineCard v-for="wine in region.wines" :key="wine.id" :wine="wine" />
      </div>
    </section>
  </div>
</template>
