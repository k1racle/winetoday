<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});

await navigateTo('/cms/materials', { redirectCode: 301 });
</script>

<template>
  <div class="text-sm text-foreground/60">Перенаправление в список материалов…</div>
</template>
