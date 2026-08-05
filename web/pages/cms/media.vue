<script setup lang="ts">
import LegacyMediaPage from '~/pages/account/admin/media.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyMediaPage />
</template>
