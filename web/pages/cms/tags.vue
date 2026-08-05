<script setup lang="ts">
import LegacyTagsPage from '~/pages/account/admin/tags.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyTagsPage />
</template>
