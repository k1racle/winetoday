<script setup lang="ts">
definePageMeta({
  layout: 'account',
});

onMounted(() => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
  }
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-heading text-2xl font-normal">Медиабиблиотека</h1>
      <p class="mt-1 text-sm text-foreground/60">
        Управление загруженными файлами: поиск, скачивание, удаление
      </p>
    </div>

    <MediaLibrary />
  </div>
</template>
