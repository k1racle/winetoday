<script setup lang="ts">
const { user, isAuthenticated } = useAuth();

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
  }
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Медиабиблиотека</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <p class="mt-6 text-sm text-foreground/60">
      Управление загруженными файлами: поиск, скачивание, удаление
    </p>

    <MediaLibrary class="mt-4" />
  </div>
</template>
