<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-6 border-b border-foreground/10 pb-4">
    <p
      v-if="eyebrow"
      class="text-xs font-normal uppercase tracking-wider text-foreground/50"
    >
      {{ eyebrow }}
    </p>
    <div class="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="min-w-0">
        <h1 class="font-heading text-2xl font-bold">{{ title }}</h1>
        <p v-if="description" class="mt-2 max-w-3xl text-sm leading-6 text-foreground/65">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
