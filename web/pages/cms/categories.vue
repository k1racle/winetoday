<script setup lang="ts">
import LegacyCategoriesPage from '~/pages/account/admin/categories.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyCategoriesPage />
</template>
