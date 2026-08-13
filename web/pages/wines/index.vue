<script setup lang="ts">
import type { WineSummary } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  key: (route) => route.fullPath,
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getWinesCatalog } = useApi();

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
});

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : '').trim());
const type = computed(() => (typeof route.query.type === 'string' ? route.query.type : '').trim());
const style = computed(() => (typeof route.query.style === 'string' ? route.query.style : '').trim());
const limit = 24;

const { data: payload } = await useAsyncData(
  `wines-index-${route.fullPath}`,
  async () => await getWinesCatalog({
    q: q.value || undefined,
    type: type.value || undefined,
    style: style.value || undefined,
    limit,
    offset: (currentPage.value - 1) * limit,
  }) as { items: WineSummary[]; total: number; limit: number; offset: number },
);

const items = computed(() => payload.value?.items || []);
const total = computed(() => payload.value?.total || 0);

const form = reactive({
  q: q.value,
  type: type.value,
  style: style.value,
});

watch([q, type, style], () => {
  form.q = q.value;
  form.type = type.value;
  form.style = style.value;
});

function submitFilters() {
  navigateTo({
    path: '/wines',
    query: {
      ...(form.q.trim() ? { q: form.q.trim() } : {}),
      ...(form.type ? { type: form.type } : {}),
      ...(form.style ? { style: form.style } : {}),
    },
  });
}

const pageTitle = computed(() =>
  currentPage.value > 1 ? `Р’РёРЅР° вЂ” СЃС‚СЂР°РЅРёС†Р° ${currentPage.value}` : 'Р’РёРЅР°',
);
const pageDescription = 'РљР°С‚Р°Р»РѕРі РІРёРЅ РїСЂРѕРµРєС‚Р° В«Р’РёРЅРѕРґРµР»С‹ Р РѕСЃСЃРёРёВ».';

useArchiveSeoControls({
  currentPage,
  canonicalBasePath: '/wines',
  filterKeys: ['q', 'type', 'style'],
  title: pageTitle,
  description: pageDescription,
  isIndexable: computed(() => items.value.length > 0),
});

useCollectionPageSchema({
  title: pageTitle,
  description: pageDescription,
  path: computed(() => route.fullPath),
  items: computed(() =>
    items.value.map((wine) => ({
      name: wine.name,
      url: `/wines/${wine.slug}`,
    })),
  ),
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">Р’РёРЅР°</h1>

    <form class="mt-8 grid gap-4 border border-foreground/10 bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]" @submit.prevent="submitFilters">
      <input
        v-model="form.q"
        type="search"
        placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ"
        class="border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
      >
      <select v-model="form.type" class="border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent">
        <option value="">Р’СЃРµ С‚РёРїС‹</option>
        <option value="red">РљСЂР°СЃРЅРѕРµ</option>
        <option value="white">Р‘РµР»РѕРµ</option>
        <option value="rose">Р РѕР·Рµ</option>
        <option value="sparkling">РРіСЂРёСЃС‚РѕРµ</option>
      </select>
      <select v-model="form.style" class="border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent">
        <option value="">Р’СЃРµ СЃС‚РёР»Рё</option>
        <option value="dry">РЎСѓС…РѕРµ</option>
        <option value="semi-dry">РџРѕР»СѓСЃСѓС…РѕРµ</option>
        <option value="semi-sweet">РџРѕР»СѓСЃР»Р°РґРєРѕРµ</option>
        <option value="sweet">РЎР»Р°РґРєРѕРµ</option>
      </select>
      <button type="submit" class="bg-accent px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-accent/90">
        Р¤РёР»СЊС‚СЂ
      </button>
    </form>

    <div v-if="items.length" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <WinemakersWineCard v-for="wine in items" :key="wine.id" :wine="wine" />
    </div>
    <div v-else class="mt-8 border border-foreground/10 bg-card px-4 py-10 text-center text-sm text-foreground/60">
      РџРѕ С‚РµРєСѓС‰РёРј РїР°СЂР°РјРµС‚СЂР°Рј РІРёРЅР° РЅРµ РЅР°Р№РґРµРЅС‹.
    </div>

    <ArchivePagination
      class="mt-8"
      :total="total"
      :items-per-page="limit"
      :extra-query="{
        ...(q ? { q } : {}),
        ...(type ? { type } : {}),
        ...(style ? { style } : {}),
      }"
    />
  </div>
</template>
