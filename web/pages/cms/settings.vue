<script setup lang="ts">
import LegacySettingsPage from '~/pages/account/admin/settings.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacySettingsPage />
</template>
