<script setup lang="ts">
import LegacyWinemakersProjectPage from '~/pages/account/projects/winemakers.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyWinemakersProjectPage />
</template>
