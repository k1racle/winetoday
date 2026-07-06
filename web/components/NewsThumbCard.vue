<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  item: ContentItem;
}>();

const link = computed(() => {
  switch (props.item.type) {
    case 'article':
      return `/articles/${props.item.slug}`;
    case 'news':
      return `/news/${props.item.slug}`;
    case 'video':
      return `/videos/${props.item.slug}`;
    case 'gallery':
      return `/gallery/${props.item.slug}`;
    default:
      return '/';
  }
});

const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const { shortDate, category } = useContentMeta(props.item);
</script>

<template>
  <NuxtLink
    :to="link"
    class="group flex h-full min-w-0 flex-col overflow-hidden bg-card shadow-sm transition duration-300 hover:scale-[1.02] hover:shadow-md"
  >
    <div class="relative aspect-video overflow-hidden bg-foreground/10">
      <NuxtImg
        v-if="coverSrc"
        :src="coverSrc"
        :alt="item.coverMedia?.altText || item.title"
        class="h-full w-full object-cover"
      />
      <span
        v-if="item.materialLabel === 'exclusive'"
        class="absolute bottom-2 right-2 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
      >
        Эксклюзив
      </span>
    </div>
    <div class="flex flex-1 flex-col p-3 md:p-4">
      <div class="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] text-foreground/50 md:text-xs">
        <span v-if="category">{{ category }}</span>
        <span v-if="shortDate">{{ shortDate }}</span>
      </div>
      <h3 class="font-heading text-sm font-bold leading-snug text-foreground group-hover:text-foreground line-clamp-2 break-words md:text-[17px] md:line-clamp-3">
        {{ item.title }}
      </h3>
    </div>
  </NuxtLink>
</template>
