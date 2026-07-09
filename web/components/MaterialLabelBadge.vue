<script setup lang="ts">
const props = defineProps<{
  label?: string | null;
}>();

const config = computed(() => {
  switch (props.label) {
    case 'exclusive':
      return { text: 'Эксклюзив', color: 'bg-red-700' };
    case 'video':
      return { text: 'Видео', color: 'bg-green-600' };
    default:
      return null;
  }
});
</script>

<template>
  <span
    v-if="config"
    class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
    :class="config.color"
  >
    {{ config.text }}
  </span>
</template>
