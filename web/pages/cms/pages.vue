<script setup lang="ts">
import LegacyPagesPage from '~/pages/account/admin/pages.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyPagesPage />
</template>
