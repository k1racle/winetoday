<script setup lang="ts">
import LegacyMaterialsPage from '~/pages/account/admin/content.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyMaterialsPage />
</template>
