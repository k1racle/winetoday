<script setup lang="ts">
import type { MediaAsset } from '~/types/media';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', media: MediaAsset): void;
}>();

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function onSelect(media: MediaAsset) {
  emit('select', media);
  open.value = false;
}

function onUpload(media: MediaAsset) {
  emit('select', media);
  open.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="media-picker">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        @click.self="open = false"
      >
        <div class="flex max-h-[85vh] w-full max-w-6xl flex-col rounded-lg border border-foreground/10 bg-background shadow-xl">
          <div class="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
            <h3 class="font-heading text-lg font-normal">Выберите файл из медиабиблиотеки</h3>
            <button
              type="button"
              class="text-foreground/60 transition hover:text-foreground"
              aria-label="Закрыть"
              @click="open = false"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto p-4">
            <MediaLibrary picker @select="onSelect" @upload="onUpload" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.media-picker-enter-active,
.media-picker-leave-active {
  transition: opacity 0.2s ease;
}
.media-picker-enter-from,
.media-picker-leave-to {
  opacity: 0;
}
</style>
