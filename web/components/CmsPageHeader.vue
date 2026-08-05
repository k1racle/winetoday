<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="relative mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:px-7">
    <div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(204,244,79,0.16),transparent_58%)]" />
    <p
      v-if="eyebrow"
      class="relative text-[11px] uppercase tracking-[0.24em] text-foreground/45"
    >
      {{ eyebrow }}
    </p>
    <div class="relative mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0">
        <h1 class="font-heading text-3xl font-bold leading-tight lg:text-4xl">{{ title }}</h1>
        <p v-if="description" class="mt-3 max-w-3xl text-sm leading-6 text-foreground/65 lg:text-[15px]">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="relative shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
