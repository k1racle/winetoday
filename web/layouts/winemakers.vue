<script setup lang="ts">
useSiteSeoDefaults();

const route = useRoute();
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '');

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = typeof value === 'string' ? value : '';
  },
);

function submitSearch() {
  const q = searchQuery.value.trim();
  if (!q) return;
  navigateTo(`/winemakers/search?q=${encodeURIComponent(q)}`);
}
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
    <header class="border-b border-foreground/10 bg-background/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <NuxtLink
            to="/"
            class="shrink-0 border border-foreground/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 transition hover:border-accent hover:text-accent"
          >
            Виноделие Сегодня
          </NuxtLink>
          <div>
            <NuxtLink to="/winemakers" class="font-heading text-2xl font-bold text-foreground">
              Виноделы России
            </NuxtLink>
            <nav class="mt-2 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-foreground/55">
              <NuxtLink to="/winemakers" class="transition hover:text-accent">Персоны</NuxtLink>
              <NuxtLink to="/wines" class="transition hover:text-accent">Вина</NuxtLink>
              <NuxtLink to="/regions" class="transition hover:text-accent">Регионы</NuxtLink>
            </nav>
          </div>
        </div>

        <form class="flex w-full max-w-xl items-center gap-2 lg:w-auto" @submit.prevent="submitSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Поиск по именам, винам, регионам"
            class="w-full border border-foreground/10 bg-card px-4 py-3 text-sm outline-none transition focus:border-accent"
          >
          <button
            type="submit"
            class="bg-accent px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-accent/90"
          >
            Поиск
          </button>
        </form>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
