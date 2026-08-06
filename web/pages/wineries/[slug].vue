<script setup lang="ts">
import type { WineryDetail } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const config = useRuntimeConfig();
const { getWineryCatalogItem } = useApi();
const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';

const { data: winery } = await useAsyncData(
  `winery-${route.params.slug}`,
  async () => {
    try {
      return await getWineryCatalogItem(String(route.params.slug)) as WineryDetail;
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.response?.status || 404,
        statusMessage: 'Винодельня не найдена',
      });
    }
  },
);

const relatedMaterials = computed(() =>
  Array.isArray(winery.value?.contentItemLinks)
    ? winery.value.contentItemLinks
        .map((entry) => entry.contentItem)
        .filter((item) => item?.id && item?.slug)
    : [],
);

const breadcrumbItems = computed(() => [
  { name: 'Главная', url: '/' },
  { name: 'Виноделы России', url: '/winemakers' },
  { name: 'Винодельни', url: '/wineries' },
  { name: winery.value?.name || '', url: route.path },
].filter((item) => item.name));

useHead(() => ({
  script: winery.value
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
            '@type': 'Organization',
            name: winery.value.name,
            description: winery.value.summary || undefined,
            url: `${siteUrl}${route.path}`,
            logo: winery.value.logo?.path ? useMediaUrl(winery.value.logo.path) : undefined,
            foundingDate: winery.value.foundedYear ? String(winery.value.foundedYear) : undefined,
            address: winery.value.region?.name
              ? {
                  '@type': 'PostalAddress',
                  addressRegion: winery.value.region.name,
                }
              : undefined,
            mainEntityOfPage: `${siteUrl}${route.path}`,
          }),
        },
      ]
    : [],
}));

useCanonical();
useSeoMeta({
  title: () => (winery.value ? `${winery.value.name} — Виноделы России` : 'Винодельни'),
  description: () => winery.value?.summary || 'Страница винодельни.',
});
</script>

<template>
  <div v-if="winery" class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <nav class="text-xs font-bold uppercase tracking-wider text-foreground/45">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/winemakers">Виноделы России</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/wineries">Винодельни</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ winery.name }}</span>
    </nav>

    <div class="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
          {{ winery.name }}
        </h1>
        <p v-if="winery.region?.name" class="mt-4 text-lg text-foreground/72">
          <NuxtLink :to="`/regions/${winery.region.slug}`" class="text-accent hover:underline">{{ winery.region.name }}</NuxtLink>
        </p>
      </div>
      <div v-if="winery.logo?.path" class="w-full max-w-[180px] border border-foreground/10 bg-card p-4">
        <NuxtImg :src="useMediaUrl(winery.logo.path)" :alt="winery.name" class="w-full object-contain" />
      </div>
    </div>

    <section class="mt-8 max-w-3xl">
      <p v-if="winery.summary" class="mb-6 text-lg leading-8 text-foreground/72">{{ winery.summary }}</p>
      <WinemakersBlocks :blocks="winery.description" :title="winery.name" />
    </section>

    <section v-if="winery.persons?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Виноделы винодельни</h2>
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <WinemakersPersonCard v-for="person in winery.persons" :key="person.id" :person="person" />
      </div>
    </section>

    <section v-if="winery.wines?.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Вина винодельни</h2>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersWineCard v-for="wine in winery.wines" :key="wine.id" :wine="wine" />
      </div>
    </section>

    <section v-if="relatedMaterials.length" class="mt-12">
      <h2 class="mb-5 font-heading text-2xl font-bold">Публикации о винодельне</h2>
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
  </div>
</template>
