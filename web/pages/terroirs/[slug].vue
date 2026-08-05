<script setup lang="ts">
import type { TerroirDetail } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getTerroirCatalogItem } = useApi();

const { data: terroir } = await useAsyncData(
  `terroir-${route.params.slug}`,
  async () => {
    try {
      return await getTerroirCatalogItem(String(route.params.slug)) as TerroirDetail;
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.response?.status || 404,
        statusMessage: 'Терруар не найден',
      });
    }
  },
);

useCanonical();
useSeoMeta({
  title: () => (terroir.value ? `${terroir.value.name} — Виноделы России` : 'Терруары'),
  description: () => terroir.value?.summary || 'Страница терруара.',
});
</script>

<template>
  <div v-if="terroir" class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <nav class="text-xs font-bold uppercase tracking-wider text-foreground/45">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/winemakers">Виноделы России</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/terroirs">Терруары</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ terroir.name }}</span>
    </nav>

    <h1 class="mt-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
      {{ terroir.name }}
    </h1>
    <p v-if="terroir.region?.name" class="mt-4 text-lg text-foreground/72">
      <NuxtLink :to="`/regions/${terroir.region.slug}`" class="text-accent hover:underline">{{ terroir.region.name }}</NuxtLink>
    </p>

    <div class="mt-6 flex flex-wrap gap-6 text-sm text-foreground/70">
      <p v-if="terroir.exposition"><span class="font-bold text-foreground">Экспозиция:</span> {{ terroir.exposition }}</p>
      <p v-if="terroir.elevationM"><span class="font-bold text-foreground">Высота:</span> {{ terroir.elevationM }} м</p>
      <p v-if="terroir.soil"><span class="font-bold text-foreground">Почвы:</span> {{ terroir.soil }}</p>
    </div>

    <section class="mt-8 max-w-3xl">
      <p v-if="terroir.summary" class="mb-6 text-lg leading-8 text-foreground/72">{{ terroir.summary }}</p>
      <WinemakersBlocks :blocks="terroir.description" :title="terroir.name" />
    </section>

    <section v-if="terroir.wines?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Вина терруара</h2>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersWineCard v-for="wine in terroir.wines" :key="wine.id" :wine="wine" />
      </div>
    </section>
  </div>
</template>
