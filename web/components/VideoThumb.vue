<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  item: ContentItem;
}>();

const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const duration = computed(() => {
  const block = props.item.contentBlocks?.find((b: any) => b.type === 'video-player');
  return block?.duration || props.item.duration;
});

function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
</script>

<template>
  <NuxtLink
    :to="`/videos/${item.slug}`"
    class="group relative block w-64 shrink-0 overflow-hidden bg-card shadow-sm transition hover:shadow-md md:w-72"
  >
    <div class="relative aspect-video overflow-hidden bg-foreground/10">
      <NuxtImg
        v-if="coverSrc"
        :src="coverSrc"
        :alt="item.coverMedia?.altText || item.title"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <span
        v-if="duration"
        class="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white"
      >
        {{ formatDuration(duration) }}
      </span>
      <div class="absolute inset-x-0 bottom-0 p-3">
        <h4 class="line-clamp-2 font-heading text-sm font-bold leading-snug text-white">
          {{ item.title }}
        </h4>
      </div>
    </div>
  </NuxtLink>
</template>
