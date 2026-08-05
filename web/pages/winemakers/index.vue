<script setup lang="ts">
import type {
  PersonSummary,
  RegionSummary,
  TerroirSummary,
  WineSummary,
  WinerySummary,
  WinemakersHomeSectionEntity,
} from '~/types/winemakers';
import {
  normalizeWinemakersHomeConfig,
  winemakersSectionPath,
} from '~/utils/winemakersHome';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const {
  getSiteSettings,
  getWinemakers,
  getRegionsCatalog,
  getWinesCatalog,
  getWineriesCatalog,
  getTerroirsCatalog,
} = useApi();

type SectionItemsMap = Record<
  WinemakersHomeSectionEntity,
  PersonSummary[] | RegionSummary[] | TerroirSummary[] | WineSummary[] | WinerySummary[]
>;

const emptyItems: SectionItemsMap = {
  person: [],
  terroir: [],
  wine: [],
  winery: [],
  region: [],
};

const { data } = await useAsyncData('winemakers-home', async () => {
  const siteSettings = await getSiteSettings().catch(() => null);
  const config = normalizeWinemakersHomeConfig(siteSettings?.winemakersHomeConfig);

  const entries = await Promise.all(
    config.sections
      .filter((section) => section.enabled)
      .map(async (section) => {
        if (section.entity === 'person') {
          const response = await getWinemakers({ limit: section.limit, sort: 'latest' }).catch(() => ({ items: [] }));
          return [section.entity, (response as any)?.items || []] as const;
        }

        if (section.entity === 'wine') {
          const response = await getWinesCatalog({ limit: section.limit }).catch(() => ({ items: [] }));
          return [section.entity, (response as any)?.items || []] as const;
        }

        if (section.entity === 'winery') {
          const response = await getWineriesCatalog({ limit: section.limit }).catch(() => ({ items: [] }));
          return [section.entity, (response as any)?.items || []] as const;
        }

        if (section.entity === 'terroir') {
          const response = await getTerroirsCatalog({ limit: section.limit }).catch(() => ({ items: [] }));
          return [section.entity, (response as any)?.items || []] as const;
        }

        const response = await getRegionsCatalog({ limit: section.limit, sort: 'latest' }).catch(() => []);
        return [section.entity, Array.isArray(response) ? response : []] as const;
      }),
  );

  const items = { ...emptyItems } as SectionItemsMap;
  for (const [entity, value] of entries) {
    items[entity] = value as SectionItemsMap[typeof entity];
  }

  return { config, items };
});

const intro = computed(() => data.value?.config.intro || normalizeWinemakersHomeConfig().intro);
const sections = computed(() =>
  (data.value?.config.sections || [])
    .filter((section) => section.enabled)
    .map((section) => ({
      ...section,
      path: winemakersSectionPath(section.entity),
      items: data.value?.items?.[section.entity] || [],
    }))
    .filter((section) => section.items.length),
);

function cardMeta(section: { entity: WinemakersHomeSectionEntity }, item: any) {
  if (section.entity === 'region') {
    return [
      item._count?.wineries ? `${item._count.wineries} виноделен` : '',
      item._count?.wines ? `${item._count.wines} вин` : '',
      item._count?.terroirs ? `${item._count.terroirs} терруаров` : '',
    ].filter(Boolean);
  }

  if (section.entity === 'terroir') {
    return [
      item.region?.name || '',
      item.elevationM ? `${item.elevationM} м` : '',
      item.soil || '',
    ].filter(Boolean);
  }

  if (section.entity === 'winery') {
    return [
      item.region?.name || '',
      item.foundedYear ? `Основана ${item.foundedYear}` : '',
    ].filter(Boolean);
  }

  return [];
}

function cardEyebrow(section: { entity: WinemakersHomeSectionEntity }, item: any) {
  if (section.entity === 'region') return item.parentId ? 'Субрегион' : 'Регион';
  if (section.entity === 'terroir') return 'Терруар';
  if (section.entity === 'winery') return 'Винодельня';
  return '';
}

function cardPath(section: { entity: WinemakersHomeSectionEntity }, item: any) {
  if (section.entity === 'region') return `/regions/${item.slug}`;
  if (section.entity === 'terroir') return `/terroirs/${item.slug}`;
  return `/wineries/${item.slug}`;
}

useCanonical();
useSeoMeta({
  title: 'Виноделы России',
  description: 'Каталог виноделов, виноделен, регионов, терруаров и вин российского виноделия.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <section class="grid gap-8 border-b border-foreground/10 pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div class="max-w-3xl">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-foreground/45">
          {{ intro.eyebrow }}
        </p>
        <h1 class="mt-4 inline-block border-b-2 border-accent pb-2 font-heading text-4xl font-bold md:text-5xl">
          {{ intro.title }}
        </h1>
        <p class="mt-6 text-lg leading-8 text-foreground/72">
          {{ intro.description }}
        </p>
      </div>

      <div class="flex flex-col justify-end border border-foreground/10 bg-card/50 p-6">
        <p class="text-sm uppercase tracking-[0.24em] text-foreground/50">Навигация</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink
            to="/winemakers/persons"
            class="border border-foreground/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-accent hover:text-accent"
          >
            Виноделы
          </NuxtLink>
          <NuxtLink
            to="/regions"
            class="border border-foreground/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-accent hover:text-accent"
          >
            Регионы
          </NuxtLink>
          <NuxtLink
            to="/wines"
            class="border border-foreground/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-accent hover:text-accent"
          >
            Вина
          </NuxtLink>
          <NuxtLink
            to="/wineries"
            class="border border-foreground/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-accent hover:text-accent"
          >
            Винодельни
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-for="section in sections"
      :key="section.entity"
      class="mt-12"
    >
      <div class="mb-6 flex flex-col gap-4 border-b border-foreground/10 pb-4 md:flex-row md:items-end md:justify-between">
        <div class="max-w-3xl">
          <h2 class="font-heading text-3xl font-bold">{{ section.title }}</h2>
          <p v-if="section.description" class="mt-3 text-sm leading-6 text-foreground/65">
            {{ section.description }}
          </p>
        </div>
        <NuxtLink
          :to="section.path"
          class="shrink-0 border border-foreground/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          {{ section.buttonLabel }}
        </NuxtLink>
      </div>

      <div
        v-if="section.entity === 'person'"
        class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <WinemakersPersonCard
          v-for="person in section.items"
          :key="person.id"
          :person="person"
        />
      </div>

      <div
        v-else-if="section.entity === 'wine'"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <WinemakersWineCard
          v-for="wine in section.items"
          :key="wine.id"
          :wine="wine"
        />
      </div>

      <div
        v-else
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <WinemakersCatalogCard
          v-for="item in section.items"
          :key="item.id"
          :to="cardPath(section, item)"
          :title="item.name"
          :eyebrow="cardEyebrow(section, item)"
          :summary="item.summary"
          :meta="cardMeta(section, item)"
        />
      </div>
    </section>
  </div>
</template>
