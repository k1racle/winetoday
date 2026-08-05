<script setup lang="ts">
import LegacySubscribersPage from '~/pages/account/admin/subscribers.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacySubscribersPage />
</template>
