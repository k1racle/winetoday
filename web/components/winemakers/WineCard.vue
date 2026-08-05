<script setup lang="ts">
import type { WineSummary } from '~/types/winemakers';

defineProps<{
  wine: WineSummary;
}>();
</script>

<template>
  <NuxtLink
    :to="`/wines/${wine.slug}`"
    class="block border border-foreground/10 bg-card p-4 transition hover:border-accent/40 hover:bg-foreground/5"
  >
    <div class="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/50">
      <span v-if="wine.type">{{ wine.type }}</span>
      <span v-if="wine.style">{{ wine.style }}</span>
      <span v-if="wine.vintage">{{ wine.vintage }}</span>
    </div>
    <p class="mt-3 font-heading text-xl leading-tight text-foreground">{{ wine.name }}</p>
    <p v-if="wine.winery?.name" class="mt-2 text-sm text-foreground/70">
      {{ wine.winery.name }}
      <span v-if="wine.region?.name"> · {{ wine.region.name }}</span>
    </p>
    <p v-if="wine.summary" class="mt-3 text-sm leading-6 text-foreground/70">{{ wine.summary }}</p>
  </NuxtLink>
</template>
