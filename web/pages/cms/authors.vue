<script setup lang="ts">
import LegacyAuthorsPage from '~/pages/account/admin/authors/index.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyAuthorsPage />
</template>
