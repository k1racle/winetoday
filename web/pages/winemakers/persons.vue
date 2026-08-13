<script setup lang="ts">
import type { PersonSummary } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  key: (route) => route.fullPath,
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getWinemakers } = useApi();

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
});

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : '').trim());
const limit = 24;
const form = reactive({ q: q.value });

watch(q, () => {
  form.q = q.value;
});

const { data: payload } = await useAsyncData(
  `winemakers-persons-${route.fullPath}`,
  async () => await getWinemakers({
    q: q.value || undefined,
    sort: 'latest',
    limit,
    offset: (currentPage.value - 1) * limit,
  }) as { items: PersonSummary[]; total: number; limit: number; offset: number },
);

const items = computed(() => payload.value?.items || []);
const total = computed(() => payload.value?.total || 0);

function submitFilters() {
  navigateTo({
    path: '/winemakers/persons',
    query: {
      ...(form.q.trim() ? { q: form.q.trim() } : {}),
    },
  });
}

const pageTitle = computed(() =>
  currentPage.value > 1 ? `Р’РёРЅРѕРґРµР»С‹ вЂ” СЃС‚СЂР°РЅРёС†Р° ${currentPage.value}` : 'Р’РёРЅРѕРґРµР»С‹',
);
const pageDescription = 'РљР°С‚Р°Р»РѕРі РІРёРЅРѕРґРµР»РѕРІ РїСЂРѕРµРєС‚Р° В«Р’РёРЅРѕРґРµР»С‹ Р РѕСЃСЃРёРёВ».';

useArchiveSeoControls({
  currentPage,
  canonicalBasePath: '/winemakers/persons',
  filterKeys: ['q'],
  title: pageTitle,
  description: pageDescription,
  isIndexable: computed(() => items.value.length > 0),
});

useCollectionPageSchema({
  title: pageTitle,
  description: pageDescription,
  path: computed(() => route.fullPath),
  items: computed(() =>
    items.value.map((person) => ({
      name: person.name,
      url: `/winemakers/${person.slug}`,
    })),
  ),
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Р’РёРЅРѕРґРµР»С‹</h1>

    <form class="mt-8 grid gap-4 border border-foreground/10 bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="submitFilters">
      <input
        v-model="form.q"
        type="search"
        placeholder="РџРѕРёСЃРє РїРѕ РёРјРµРЅРё, РІРёРЅРѕРґРµР»СЊРЅРµ РёР»Рё РѕРїРёСЃР°РЅРёСЋ"
        class="border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
      >
      <button type="submit" class="bg-accent px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-accent/90">
        Р¤РёР»СЊС‚СЂ
      </button>
    </form>

    <div v-if="items.length" class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <WinemakersPersonCard v-for="person in items" :key="person.id" :person="person" />
    </div>
    <div v-else class="mt-8 border border-foreground/10 bg-card px-4 py-10 text-center text-sm text-foreground/60">
      РџРѕ С‚РµРєСѓС‰РёРј РїР°СЂР°РјРµС‚СЂР°Рј РІРёРЅРѕРґРµР»С‹ РЅРµ РЅР°Р№РґРµРЅС‹.
    </div>

    <ArchivePagination
      class="mt-8"
      :total="total"
      :items-per-page="limit"
      :extra-query="{
        ...(q ? { q } : {}),
      }"
    />
  </div>
</template>
