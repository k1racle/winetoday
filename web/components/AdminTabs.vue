<script setup lang="ts">
const route = useRoute();
const tabs = [
  { label: 'Пользователи', to: '/account/admin' },
  { label: 'Авторы', to: '/account/admin/authors' },
  { label: 'Материалы', to: '/account/admin/content' },
  { label: 'Рубрики', to: '/account/admin/categories' },
  { label: 'Теги', to: '/account/admin/tags' },
  { label: 'Соцсети', to: '/account/admin/socials' },
  { label: 'Настройки', to: '/account/admin/settings' },
];

function isActive(to: string) {
  if (to === '/account/admin') {
    return route.path === to;
  }
  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>

<template>
  <nav class="flex gap-2 border-b border-foreground/10">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="px-4 py-2 text-sm font-normal transition"
      :class="isActive(tab.to) ? 'border-b-2 border-accent text-accent' : 'text-foreground/60 hover:text-foreground'"
    >
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>
