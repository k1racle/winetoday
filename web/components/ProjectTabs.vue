<script setup lang="ts">
const route = useRoute();
const { user } = useAuth();

const tabs = computed(() => {
  if (user.value?.role !== 'admin') {
    return [];
  }

  return [
    { label: 'Спецпроекты', to: '/account/projects' },
    { label: 'Виноделы России', to: '/account/projects/winemakers' },
  ];
});

function isActive(to: string) {
  if (to === '/account/projects') {
    return route.path === to;
  }
  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>

<template>
  <nav
    v-if="tabs.length"
    class="flex gap-2 overflow-x-auto whitespace-nowrap border-b border-foreground/10"
  >
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="shrink-0 px-4 py-2 text-sm font-normal transition"
      :class="isActive(tab.to) ? 'border-b-2 border-accent text-accent' : 'text-foreground/60 hover:text-foreground'"
    >
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>
