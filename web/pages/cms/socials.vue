<script setup lang="ts">
import LegacySocialsPage from '~/pages/account/admin/socials.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacySocialsPage />
</template>
