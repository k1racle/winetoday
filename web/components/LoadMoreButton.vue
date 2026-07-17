<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  hasMore?: boolean;
}>();

const emit = defineEmits<{
  (e: 'load'): void;
}>();
</script>

<template>
  <button
    v-if="hasMore"
    type="button"
    :disabled="loading"
    class="inline-flex items-center rounded border border-foreground/20 bg-transparent px-4 py-2 text-sm font-normal text-foreground/80 transition hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
    @click="emit('load')"
  >
    {{ loading ? 'Загрузка...' : 'Ещё' }}
    <span class="ml-1">→</span>
  </button>
</template>
