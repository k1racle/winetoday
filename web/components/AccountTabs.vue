<script setup lang="ts">
const route = useRoute();
const { user } = useAuth();

const canCreate = computed(() => ['admin', 'editor', 'author'].includes(user.value?.role || ''));

const tabs = computed(() => {
  const list: { label: string; to: string }[] = [];
  list.push({ label: 'Профиль', to: '/account' });
  if (canCreate.value) {
    list.push({ label: 'Редактор материалов', to: '/account/editor' });
  }
  list.push(
    { label: 'Подписки', to: '/account/subscriptions' },
    { label: 'Понравилось', to: '/account/liked' },
    { label: 'Комментарии', to: '/account/comments' },
  );
  return list;
});

function isActive(to: string) {
  if (to === '/account') {
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
