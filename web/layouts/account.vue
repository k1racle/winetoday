<script setup lang="ts">
useSiteSeoDefaults();
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden">
    <SiteHeader />
    <main class="flex-1 pt-5">
      <div class="mx-auto w-full max-w-[1600px] px-4">
        <slot />
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
