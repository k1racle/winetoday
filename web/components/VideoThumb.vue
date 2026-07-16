<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  item: ContentItem;
}>();

const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const { user } = useAuth();
const canEdit = computed(() => ['admin', 'editor'].includes(user.value?.role || ''));

function editUrl(item: ContentItem) {
  return `/account?type=${item.type}&id=${item.id}`;
}

const duration = computed(() => {
  const block = props.item.contentBlocks?.find((b: any) => b.type === 'video-player');
  return block?.duration || props.item.duration;
});


</script>

<template>
  <div
    class="group relative block w-64 shrink-0 overflow-hidden bg-card shadow-sm transition hover:shadow-md md:w-72"
  >
    <NuxtLink
      :to="`/videos/${item.slug}`"
      class="block"
    >
    <div class="relative aspect-video overflow-hidden bg-foreground/10">
      <LazyImage
        v-if="coverSrc"
        :src="coverSrc"
        :alt="item.coverMedia?.altText || item.title"
        wrapper-class="absolute inset-0"
        img-class="transition duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <span
        v-if="duration"
        class="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white"
      >
        {{ formatDuration(duration) }}
      </span>
      <div class="absolute inset-x-0 bottom-0 p-3">
        <h4 class="line-clamp-2 font-sans text-sm font-normal leading-snug text-white">
          {{ item.title }}
        </h4>
      </div>
    </div>
    </NuxtLink>
    <NuxtLink
      v-if="canEdit"
      :to="editUrl(item)"
      class="absolute right-2 top-2 z-10 rounded bg-accent px-2 py-1 text-[10px] font-normal uppercase tracking-wide text-white shadow-sm hover:bg-accent/90"
    >
      Редактировать
    </NuxtLink>
  </div>
</template>
