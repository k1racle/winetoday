<script setup lang="ts">
import type { PersonSummary } from '~/types/winemakers';

const props = defineProps<{
  person: PersonSummary;
}>();

const imageUrl = computed(() => useMediaUrl(props.person.photo?.path));

function yearsLabel() {
  if (!props.person.birthYear && !props.person.deathYear) return '';
  const from = props.person.birthYear || '—';
  const to = props.person.deathYear || 'н.в.';
  return `${from}–${to}`;
}
</script>

<template>
  <NuxtLink
    :to="`/winemakers/${person.slug}`"
    class="group block border border-foreground/10 bg-card transition hover:border-accent/40 hover:bg-foreground/5"
  >
    <div class="aspect-[4/5] overflow-hidden bg-foreground/5">
      <NuxtImg
        v-if="imageUrl"
        :src="imageUrl"
        :alt="person.name"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />
      <div
        v-else
        class="flex h-full items-center justify-center px-6 text-center font-heading text-2xl text-foreground/35"
      >
        {{ person.name }}
      </div>
    </div>
    <div class="space-y-2 p-4">
      <p class="font-heading text-xl leading-tight text-foreground">{{ person.name }}</p>
      <p v-if="yearsLabel()" class="text-xs uppercase tracking-wider text-foreground/50">{{ yearsLabel() }}</p>
      <p v-if="person.winery?.name" class="text-sm text-foreground/70">
        {{ person.winery.name }}
        <span v-if="person.winery.region?.name"> · {{ person.winery.region.name }}</span>
      </p>
      <p v-if="person.summary" class="text-sm leading-6 text-foreground/70">
        {{ person.summary }}
      </p>
    </div>
  </NuxtLink>
</template>
