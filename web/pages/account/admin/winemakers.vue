<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
});

await navigateTo('/account/projects/winemakers', { redirectCode: 301 });
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <p class="text-sm text-foreground/60">Перенаправление в раздел спецпроектов…</p>
  </div>
</template>
