<script setup lang="ts">
import LegacyUtmPage from '~/pages/account/admin/utm.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyUtmPage />
</template>
