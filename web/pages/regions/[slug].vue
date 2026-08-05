<script setup lang="ts">
import type { RegionDetail, WinemakersMapPoint } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const config = useRuntimeConfig();
const { getRegionCatalogItem } = useApi();
const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

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

const mapPoints = computed<WinemakersMapPoint[]>(() => {
  if (!region.value) {
    return [];
  }

  const points: WinemakersMapPoint[] = [];

  if (Number.isFinite(region.value.lat) && Number.isFinite(region.value.lng)) {
    points.push({
      id: region.value.id,
      slug: region.value.slug,
      name: region.value.name,
      summary: region.value.summary,
      lat: Number(region.value.lat),
      lng: Number(region.value.lng),
      kind: 'region',
      persons: [],
      wineCount: region.value.wines?.length || 0,
      wineryCount: region.value.wineries?.length || 0,
      terroirCount: region.value.terroirs?.length || 0,
    });
  }

  for (const terroir of region.value.terroirs || []) {
    if (!Number.isFinite(terroir.lat) || !Number.isFinite(terroir.lng)) {
      continue;
    }

    points.push({
      id: terroir.id,
      slug: terroir.slug,
      name: terroir.name,
      summary: terroir.summary,
      lat: Number(terroir.lat),
      lng: Number(terroir.lng),
      kind: 'terroir',
      region: {
        id: region.value.id,
        slug: region.value.slug,
        name: region.value.name,
      },
      persons: [],
      wineCount: 0,
    });
  }

  return points;
});

const breadcrumbItems = computed(() => [
  { name: 'Главная', url: '/' },
  { name: 'Виноделы России', url: '/winemakers' },
  { name: 'Регионы', url: '/regions' },
  { name: region.value?.name || '', url: route.path },
].filter((item) => item.name));

useHead(() => ({
  script: region.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems.value.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: `${siteUrl}${item.url}`,
            })),
          }),
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: region.value.name,
            description: region.value.summary || undefined,
            url: `${siteUrl}${route.path}`,
            geo:
              Number.isFinite(region.value.lat) && Number.isFinite(region.value.lng)
                ? {
                    '@type': 'GeoCoordinates',
                    latitude: region.value.lat,
                    longitude: region.value.lng,
                  }
                : undefined,
            containsPlace: (region.value.terroirs || []).slice(0, 10).map((item) => ({
              '@type': 'Place',
              name: item.name,
              url: `${siteUrl}/terroirs/${item.slug}`,
            })),
            mainEntityOfPage: `${siteUrl}${route.path}`,
          }),
        },
      ]
    : [],
}));

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
      <NuxtLink to="/winemakers">Виноделы России</NuxtLink>
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

    <section v-if="mapPoints.length" class="mt-12">
      <WinemakersGeoMap
        :points="mapPoints"
        :focus-lat="region.lat ?? null"
        :focus-lng="region.lng ?? null"
        :focus-zoom="7"
        title="Карта региона"
        description="На карте показаны центр региона и опубликованные терруары с координатами."
        height-class="h-[360px]"
      />
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
        <WinemakersCatalogCard
          v-for="terroir in region.terroirs"
          :key="terroir.id"
          :to="`/terroirs/${terroir.slug}`"
          :title="terroir.name"
          eyebrow="Терруар"
          :summary="terroir.summary"
        />
      </div>
    </section>

    <section v-if="region.wineries?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Винодельни</h2>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersCatalogCard
          v-for="winery in region.wineries"
          :key="winery.id"
          :to="`/wineries/${winery.slug}`"
          :title="winery.name"
          eyebrow="Винодельня"
          :summary="winery.summary"
        />
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
