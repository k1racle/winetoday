<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  description?: string;
  bodyClass?: string;
}>(), {
  title: undefined,
  description: undefined,
  bodyClass: 'px-5 py-5 lg:px-6 lg:py-6',
});
</script>

<template>
  <section class="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
    <div v-if="title || description || $slots.header || $slots.actions" class="border-b border-white/8 px-5 py-5 lg:px-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <slot name="header">
            <h2 v-if="title" class="font-heading text-xl font-semibold text-foreground">{{ title }}</h2>
            <p v-if="description" class="mt-2 max-w-3xl text-sm leading-6 text-foreground/60">{{ description }}</p>
          </slot>
        </div>
        <div v-if="$slots.actions" class="shrink-0">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div :class="bodyClass">
      <slot />
    </div>
  </section>
</template>
