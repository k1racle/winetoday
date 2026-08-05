<script setup lang="ts">
defineProps<{
  to: string;
  title: string;
  summary?: string | null;
  eyebrow?: string | null;
  meta?: string[];
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex h-full flex-col border border-foreground/10 bg-card p-5 transition hover:border-accent/40 hover:bg-foreground/5"
  >
    <p v-if="eyebrow" class="text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/45">
      {{ eyebrow }}
    </p>
    <h3 class="mt-3 font-heading text-2xl font-bold transition group-hover:text-accent">
      {{ title }}
    </h3>
    <div v-if="meta?.length" class="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-wider text-foreground/55">
      <span
        v-for="item in meta"
        :key="item"
        class="border border-foreground/10 px-2 py-1"
      >
        {{ item }}
      </span>
    </div>
    <p v-if="summary" class="mt-4 text-sm leading-6 text-foreground/72">
      {{ summary }}
    </p>
  </NuxtLink>
</template>
