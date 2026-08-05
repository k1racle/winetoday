<script setup lang="ts">
import LegacyMaterialsPage from '~/pages/account/admin/content.vue';

const route = useRoute();

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});

onMounted(() => {
  if (typeof route.query.id === 'string' || typeof route.query.type === 'string') {
    navigateTo({ path: '/cms/editor', query: route.query });
  }
});
</script>

<template>
  <LegacyMaterialsPage />
</template>
