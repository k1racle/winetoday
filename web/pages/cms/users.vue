<script setup lang="ts">
import LegacyUsersPage from '~/pages/account/admin/index.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyUsersPage />
</template>
