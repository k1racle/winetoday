<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { isTiptapJson, tiptapToHtml } from '~/utils/tiptap-html';

const props = defineProps<{
  blocks: any[];
  item: ContentItem;
}>();

function renderContent(content: unknown): string {
  if (typeof content !== 'string') return '';
  if (isTiptapJson(content)) return tiptapToHtml(content);
  return content;
}

function getEmbedUrl(url?: string) {
  if (!url) return '';
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  return url;
}
</script>

<template>
  <div class="space-y-6">
    <template v-for="block in props.blocks" :key="block.id">
      <div
        v-if="block.type === 'rich-text' || block.type === 'html-editor' || block.type === 'text'"
        class="prose prose-lg max-w-none text-foreground"
        v-html="renderContent(block.content)"
      />

      <figure v-else-if="block.type === 'image-highlight'" class="my-6">
        <NuxtImg
          v-if="block.imageId"
          :src="`/api/media/${block.imageId}`"
          :alt="block.caption || ''"
          class="w-full"
        />
        <figcaption v-if="block.caption || block.credit" class="mt-2 text-sm text-foreground/60">
          {{ block.caption }}
          <span v-if="block.credit"> / {{ block.credit }}</span>
        </figcaption>
      </figure>

      <blockquote
        v-else-if="block.type === 'quote'"
        class="border-l-4 border-accent bg-accent/5 p-6 italic"
      >
        <p class="text-lg">{{ block.text }}</p>
        <footer v-if="block.author" class="mt-3 text-sm font-medium not-italic">
          {{ block.author }}<span v-if="block.role">, {{ block.role }}</span>
        </footer>
      </blockquote>

      <div
        v-else-if="block.type === 'embed' && block.html"
        class="my-6"
        v-html="block.html"
      />

      <div v-else-if="block.type === 'video-player'" class="my-6 aspect-video w-full bg-black">
        <iframe
          v-if="getEmbedUrl(block.videoUrl || props.item.videoUrl)"
          :src="getEmbedUrl(block.videoUrl || props.item.videoUrl)"
          class="h-full w-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </template>
  </div>
</template>
