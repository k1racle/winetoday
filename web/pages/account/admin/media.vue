<script setup lang="ts">
const { user, isAuthenticated } = useAuth();

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
  }
});
</script>

<template>
  <CmsPageShell
    title="Медиабиблиотека"
    description="Общая библиотека загруженных файлов для материалов, редакционных страниц и спецпроектов."
  >
    <CmsPanel
      title="Файлы и изображения"
      description="Поиск, загрузка, скачивание и удаление файлов без перехода в отдельные утилиты."
    >
      <MediaLibrary />
    </CmsPanel>
  </CmsPageShell>
</template>
