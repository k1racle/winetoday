<script setup lang="ts">
useSiteSeoDefaults();
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
