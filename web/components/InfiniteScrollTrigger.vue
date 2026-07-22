<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  hasMore?: boolean;
}>();
const emit = defineEmits<{ (e: 'load'): void }>();

const trigger = ref<HTMLElement | null>(null);

useIntersectionObserver(
  trigger,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && props.hasMore && !props.loading) {
      emit('load');
    }
  },
  { rootMargin: '300px' },
);
</script>

<template>
  <div ref="trigger" class="h-2 w-full" aria-hidden="true" />
  <div v-if="loading && hasMore" class="mt-4 flex justify-center">
    <span class="text-sm text-foreground/60">Загрузка...</span>
  </div>
</template>
