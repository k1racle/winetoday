<script setup lang="ts">
const props = defineProps<{
  total: number;
  itemsPerPage: number;
  // Дополнительные query-параметры, которые нужно сохранять в ссылках (например, q в поиске).
  extraQuery?: Record<string, string>;
}>();

const route = useRoute();

const currentPage = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
});

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.itemsPerPage)));

// Первая, последняя и текущая ±2 страницы.
const pages = computed<number[]>(() => {
  const set = new Set<number>([1, pageCount.value]);
  for (let p = currentPage.value - 2; p <= currentPage.value + 2; p++) {
    if (p >= 1 && p <= pageCount.value) set.add(p);
  }
  return [...set].sort((a, b) => a - b);
});

function pageLink(page: number) {
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(props.extraQuery || {})) {
    if (v) query[k] = v;
  }
  // Первая страница — чистый URL без ?page=1.
  if (page > 1) query.page = String(page);
  return { path: route.path, query };
}

const baseClass =
  'flex h-9 min-w-9 items-center justify-center rounded border border-foreground/10 px-3 text-sm transition-colors hover:border-accent hover:text-accent';
const activeClass = 'border-accent bg-accent text-white hover:text-white';
</script>

<template>
  <nav
    v-if="pageCount > 1"
    aria-label="Пагинация"
    class="mt-8 flex flex-wrap items-center justify-center gap-2"
  >
    <NuxtLink
      v-if="currentPage > 1"
      :to="pageLink(currentPage - 1)"
      :class="baseClass"
      aria-label="Предыдущая страница"
      rel="prev"
    >
      ←
    </NuxtLink>
    <template v-for="(page, i) in pages" :key="page">
      <span
        v-if="i > 0 && page - pages[i - 1]! > 1"
        class="px-1 text-sm text-foreground/40"
        aria-hidden="true"
      >…</span>
      <span
        v-if="page === currentPage"
        :class="[baseClass, activeClass]"
        aria-current="page"
      >{{ page }}</span>
      <NuxtLink v-else :to="pageLink(page)" :class="baseClass">{{ page }}</NuxtLink>
    </template>
    <NuxtLink
      v-if="currentPage < pageCount"
      :to="pageLink(currentPage + 1)"
      :class="baseClass"
      aria-label="Следующая страница"
      rel="next"
    >
      →
    </NuxtLink>
  </nav>
</template>
