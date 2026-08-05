<script setup lang="ts">
import LegacyHomepagePage from '~/pages/account/homepage.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-manager',
});
</script>

<template>
  <LegacyHomepagePage />
</template>
