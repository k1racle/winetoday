<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  item: ContentItem;
  size?: 'small' | 'medium' | 'large';
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
    class="group relative flex min-w-0 flex-col justify-end overflow-hidden bg-foreground/10"
    :class="{
      'aspect-video md:aspect-square': size === 'small' || size === 'medium',
      'aspect-square': size === 'large',
      'min-h-[280px] md:min-h-[360px]': !size,
    }"
  >
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc"
      :alt="item.coverMedia?.altText || item.title"
      class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    <div class="relative z-10 p-3 text-white md:p-6">
      <div class="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/80 md:text-xs">
        <span v-if="category">{{ category }}</span>
        <span v-if="shortDate">{{ shortDate }}</span>
      </div>
      <h3 class="break-words font-heading text-base font-bold leading-snug md:text-xl" :class="{ 'md:text-2xl': size === 'large' }">
        {{ item.title }}
      </h3>
      <p v-if="item.excerpt && size === 'large'" class="mt-1 line-clamp-1 text-xs text-white/80 md:mt-2 md:line-clamp-2 md:text-sm">
        {{ item.excerpt }}
      </p>
    </div>
  </NuxtLink>
</template>
