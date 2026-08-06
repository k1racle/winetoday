<script setup lang="ts">
import type { WineDetail } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const config = useRuntimeConfig();
const { getWineCatalogItem } = useApi();
const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

const { data: wine } = await useAsyncData(
  `wine-${route.params.slug}`,
  async () => {
    try {
      return await getWineCatalogItem(String(route.params.slug)) as WineDetail;
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.response?.status || 404,
        statusMessage: 'Вино не найдено',
      });
    }
  },
);

const relatedMaterials = computed(() =>
  Array.isArray(wine.value?.contentItemLinks)
    ? wine.value.contentItemLinks
        .map((entry) => entry.contentItem)
        .filter((item) => item?.id && item?.slug)
    : [],
);

const breadcrumbItems = computed(() => [
  { name: 'Главная', url: '/' },
  { name: 'Виноделы России', url: '/winemakers' },
  { name: 'Вина', url: '/wines' },
  { name: wine.value?.name || '', url: route.path },
].filter((item) => item.name));

useHead(() => ({
  script: wine.value
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
            '@type': 'Product',
            name: wine.value.name,
            description: wine.value.summary || undefined,
            category: 'Wine',
            url: `${siteUrl}${route.path}`,
            brand: wine.value.winery
              ? {
                  '@type': 'Organization',
                  name: wine.value.winery.name,
                  url: `${siteUrl}/wineries/${wine.value.winery.slug}`,
                }
              : undefined,
            additionalProperty: [
              wine.value.type
                ? { '@type': 'PropertyValue', name: 'Тип вина', value: wine.value.type }
                : null,
              wine.value.style
                ? { '@type': 'PropertyValue', name: 'Стиль', value: wine.value.style }
                : null,
              wine.value.vintage
                ? { '@type': 'PropertyValue', name: 'Винтаж', value: String(wine.value.vintage) }
                : null,
              wine.value.grapes?.length
                ? { '@type': 'PropertyValue', name: 'Сорта', value: wine.value.grapes.join(', ') }
                : null,
            ].filter(Boolean),
            mainEntityOfPage: `${siteUrl}${route.path}`,
          }),
        },
      ]
    : [],
}));

useCanonical();
useSeoMeta({
  title: () => (wine.value ? `${wine.value.name} — Виноделы России` : 'Вина'),
  description: () => wine.value?.summary || 'Карточка вина в каталоге «Виноделы России».',
});
</script>

<template>
  <div v-if="wine" class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <nav class="text-xs font-bold uppercase tracking-wider text-foreground/45">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/winemakers">Виноделы России</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/wines">Вина</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ wine.name }}</span>
    </nav>

    <h1 class="mt-6 inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
      {{ wine.name }}
    </h1>

    <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/50">
      <span v-if="wine.type">{{ wine.type }}</span>
      <span v-if="wine.style">{{ wine.style }}</span>
      <span v-if="wine.vintage">{{ wine.vintage }}</span>
    </div>

    <div class="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div class="border border-foreground/10 bg-card p-5">
        <dl class="space-y-4 text-sm">
          <div v-if="wine.vintage">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Винтаж</dt>
            <dd class="mt-1">{{ wine.vintage }}</dd>
          </div>
          <div v-if="wine.grapes?.length">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Сорта</dt>
            <dd class="mt-1">{{ wine.grapes.join(', ') }}</dd>
          </div>
          <div v-if="wine.winery?.name">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Винодельня</dt>
            <dd class="mt-1">
              <NuxtLink :to="`/wineries/${wine.winery.slug}`" class="text-accent hover:underline">{{ wine.winery.name }}</NuxtLink>
            </dd>
          </div>
          <div v-if="wine.region?.name">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Регион</dt>
            <dd class="mt-1">
              <NuxtLink :to="`/regions/${wine.region.slug}`" class="text-accent hover:underline">{{ wine.region.name }}</NuxtLink>
            </dd>
          </div>
          <div v-if="wine.terroir?.name">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Терруар</dt>
            <dd class="mt-1">
              <NuxtLink :to="`/terroirs/${wine.terroir.slug}`" class="text-accent hover:underline">{{ wine.terroir.name }}</NuxtLink>
            </dd>
          </div>
          <div v-if="wine.winemakers?.length">
            <dt class="font-bold uppercase tracking-wider text-foreground/45">Виноделы</dt>
            <dd class="mt-1 flex flex-col gap-1">
              <NuxtLink
                v-for="entry in wine.winemakers"
                :key="entry.person.id"
                :to="`/winemakers/${entry.person.slug}`"
                class="text-accent hover:underline"
              >
                {{ entry.person.name }}<span v-if="entry.role"> — {{ entry.role }}</span>
              </NuxtLink>
            </dd>
          </div>
        </dl>
      </div>

      <div class="max-w-3xl">
        <p v-if="wine.summary" class="mb-6 text-lg leading-8 text-foreground/72">{{ wine.summary }}</p>
        <WinemakersBlocks :blocks="wine.description" :title="wine.name" />
      </div>
    </div>

    <section v-if="relatedMaterials.length" class="mt-12">
      <h2 class="mb-6 font-heading text-2xl font-bold">Публикации о вине</h2>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ArticleCard
          v-for="item in relatedMaterials"
          :key="item.id"
          :item="item"
          image-aspect="video"
          variant="compact"
        />
      </div>
    </section>

    <EntityDiscussion
      :target-id="wine.id"
      target-type="wine"
      :slug="wine.slug"
      :title="wine.name"
    />
  </div>
</template>
