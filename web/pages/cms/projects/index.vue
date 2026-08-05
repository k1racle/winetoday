<script setup lang="ts">
import LegacyProjectsPage from '~/pages/account/projects/index.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyProjectsPage />
</template>
