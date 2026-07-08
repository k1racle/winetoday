<script setup lang="ts">
import { getVideoEmbedUrl } from '~/utils/video-embed';

const props = defineProps<{
  url: string;
  title?: string;
}>();

const isReady = ref(false);
const embedUrl = computed(() => getVideoEmbedUrl(props.url));

function mountPlayer() {
  isReady.value = false;
  nextTick(() => {
    requestAnimationFrame(() => {
      isReady.value = true;
    });
  });
}

onMounted(mountPlayer);

watch(
  () => props.url,
  () => {
    if (import.meta.client) {
      mountPlayer();
    }
  },
);
</script>

<template>
  <div class="aspect-video w-full overflow-hidden bg-black">
    <div
      v-if="!isReady"
      class="flex h-full w-full items-center justify-center text-sm text-white/50"
      aria-hidden="true"
    />
    <iframe
      v-else-if="embedUrl"
      :key="embedUrl"
      :src="embedUrl"
      class="h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      :title="title || 'Видео'"
    />
  </div>
</template>
