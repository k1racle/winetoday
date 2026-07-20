<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = withDefaults(
  defineProps<{
    item: ContentItem;
    showTitle?: boolean;
    showPlay?: boolean;
  }>(),
  {
    showTitle: true,
    showPlay: true,
  },
);

const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const { date, category } = useContentMeta(props.item);
const { user } = useAuth();
const canEdit = computed(() => ['admin', 'editor'].includes(user.value?.role || ''));

function editUrl(item: ContentItem) {
  return `/account/editor?type=${item.type}&id=${item.id}`;
}
const duration = computed(() => {
  const blocks = (props.item as any).contentBlocks;
  const block = blocks?.find((b: any) => b.type === 'video-player');
  return block?.duration || props.item.duration;
});
</script>

<template>
  <div class="group relative">
    <slot name="title" />
    <NuxtLink
      v-if="canEdit"
      :to="editUrl(item)"
      class="absolute right-2 top-2 z-20 rounded bg-accent px-2 py-1 text-[10px] font-normal uppercase tracking-wide text-white shadow-sm hover:bg-accent/90"
    >
      Редактировать
    </NuxtLink>

    <NuxtLink
      :to="`/videos/${item.slug}`"
      class="relative flex w-full flex-col justify-end overflow-hidden bg-foreground/10 aspect-video"
    >
      <NuxtImg
        v-if="coverSrc"
        :src="coverSrc"
        :alt="item.coverMedia?.altText || item.title"
        class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div v-if="showTitle" class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <!-- Play button -->
      <div v-if="showPlay" class="absolute inset-0 flex items-center justify-center">
        <div class="flex h-16 w-16 items-center justify-center bg-card/90 text-accent transition group-hover:scale-110 group-hover:bg-card md:h-20 md:w-20">
          <svg class="h-7 w-7 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <div v-if="showTitle" class="relative z-10 p-5 text-white md:p-8">
        <div class="mb-2 flex flex-wrap items-center gap-2 text-xs font-normal uppercase tracking-wider text-white/80">
          <span v-if="date">{{ date }}</span>
          <span v-if="category">{{ category }}</span>
          <span v-if="duration">{{ formatDuration(duration) }}</span>
        </div>
        <h3 class="font-sans text-xl font-normal leading-snug md:text-2xl lg:text-3xl">
          {{ item.title }}
        </h3>
        <p v-if="item.excerpt" class="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 md:text-base">
          {{ item.excerpt }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
