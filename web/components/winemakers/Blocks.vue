<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  blocks?: any[] | null;
  title: string;
  videoUrl?: string | null;
}>();

const contentItem = computed<ContentItem>(() => ({
  id: '',
  type: 'article',
  title: props.title,
  slug: '',
  status: 'published',
  videoUrl: props.videoUrl || null,
  viewsTotal: 0,
}));
</script>

<template>
  <ContentBlocks
    v-if="Array.isArray(blocks) && blocks.length"
    :blocks="blocks"
    :item="contentItem"
  />
</template>
