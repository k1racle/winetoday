<script setup lang="ts">
import LegacyAuthorPage from '~/pages/account/admin/authors/[id].vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyAuthorPage />
</template>
