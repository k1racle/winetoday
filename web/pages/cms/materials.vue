<script setup lang="ts">
import LegacyEditorPage from '~/pages/account/editor.vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-editor',
});
</script>

<template>
  <LegacyEditorPage />
</template>
