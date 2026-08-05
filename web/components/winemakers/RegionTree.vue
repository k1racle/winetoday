<script setup lang="ts">
import type { RegionSummary } from '~/types/winemakers';

defineOptions({
  name: 'WinemakersRegionTree',
});

const props = defineProps<{
  items: RegionSummary[];
  parentId?: string | null;
}>();

const nodes = computed(() =>
  props.items.filter((item) => (item.parentId || null) === (props.parentId || null)),
);
</script>

<template>
  <ul v-if="nodes.length" class="space-y-3">
    <li v-for="node in nodes" :key="node.id">
      <NuxtLink :to="`/regions/${node.slug}`" class="text-foreground transition hover:text-accent">
        {{ node.name }}
      </NuxtLink>
      <span class="ml-2 text-sm text-foreground/45">
        {{ node._count?.wineries || 0 }} хозяйств · {{ node._count?.wines || 0 }} вин
      </span>
      <WinemakersRegionTree
        :items="items"
        :parent-id="node.id"
        class="mt-3 border-l border-foreground/10 pl-4"
      />
    </li>
  </ul>
</template>
