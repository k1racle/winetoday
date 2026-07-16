<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = withDefaults(
  defineProps<{
    item: ContentItem;
    imageAspect?: 'square' | 'video';
    variant?: 'default' | 'compact';
    hideExcerpt?: boolean;
  }>(),
  { imageAspect: 'square', variant: 'default', hideExcerpt: false },
);

const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const { date, category } = useContentMeta(props.item);
const { user } = useAuth();
const canEdit = computed(() => ['admin', 'editor'].includes(user.value?.role || ''));
const isImportant = computed(() => props.item.materialLabel === 'important');

function editUrl(item: ContentItem) {
  return `/account?type=${item.type}&id=${item.id}`;
}

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
</script>

<template>
  <div
    class="group relative min-w-0 overflow-hidden border border-foreground/10 bg-card"
    :class="variant === 'compact' ? 'flex h-[320px] flex-col' : 'block'"
  >
    <NuxtLink
      :to="link"
      class="block"
      :class="variant === 'compact' ? 'flex h-full flex-col' : ''"
    >
    <div
      class="relative w-full overflow-hidden bg-foreground/10"
      :class="{
        'aspect-square': imageAspect === 'square' && variant !== 'compact',
        'aspect-video': imageAspect === 'video' || variant === 'compact',
      }"
    >
      <NuxtImg
        v-if="item.coverMedia?.path"
        :src="coverSrc"
        :alt="item.coverMedia.altText || item.title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <MaterialLabelBadge
        :label="item.materialLabel"
        :type="item.type"
        class="absolute bottom-2 right-2"
      />
    </div>
    <div
      class="overflow-hidden"
      :class="variant === 'compact' ? 'flex flex-1 flex-col p-3' : 'p-4'"
    >
      <div class="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-foreground/50">
        <span v-if="date">{{ date }}</span>
        <span v-if="category">{{ category }}</span>
      </div>
      <h3
        class="font-heading font-normal leading-snug group-hover:text-foreground"
        :class="[variant === 'compact' ? 'break-words text-[17px] leading-snug line-clamp-3' : 'break-words text-lg', { 'font-bold': isImportant }]"
      >
        {{ item.title }}
      </h3>
      <p
        v-if="item.excerpt && variant !== 'compact' && !hideExcerpt"
        class="mt-2 line-clamp-2 text-sm opacity-80"
      >
        {{ item.excerpt }}
      </p>
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
