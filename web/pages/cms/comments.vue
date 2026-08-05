<script setup lang="ts">
import LegacyCommentsPage from '~/pages/account/admin/comments.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyCommentsPage />
</template>
