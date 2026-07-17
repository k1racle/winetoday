<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { isTiptapJson, tiptapToHtml } from '~/utils/tiptap-html';
import { getVideoEmbedUrl } from '~/utils/video-embed';
import { stripTextColor } from '~/utils/html-sanitize';

const props = defineProps<{
  blocks: any[];
  item: ContentItem;
}>();

function renderContent(content: unknown): string {
  if (typeof content !== 'string') return '';
  const html = isTiptapJson(content) ? tiptapToHtml(content) : content;
  return stripTextColor(html);
}

function getEmbedUrl(url?: string) {
  return getVideoEmbedUrl(url);
}

function formatSource(source?: string | null): string {
  if (!source) return '';
  const normalized = source.trim().toLowerCase();
  if (/^(источник|автор|фото|пресс-служба|photo by|source)/.test(normalized)) {
    return source.trim();
  }
  return `Источник: ${source.trim()}`;
}
</script>

<template>
  <div class="space-y-6">
    <template v-for="block in props.blocks" :key="block.id">
      <div
        v-if="block.type === 'rich-text' || block.type === 'html-editor' || block.type === 'text'"
        class="prose prose-lg max-w-none text-foreground dark:prose-invert [&_a]:text-accent [&_a]:underline hover:[&_a]:no-underline [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:mt-6 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-normal [&_h3]:mt-5 [&_h3]:mb-3"
        v-html="renderContent(block.content)"
      />

      <figure v-else-if="block.type === 'image-highlight'" class="my-6">
        <NuxtImg
          v-if="block.imageId"
          :src="`/api/media/${block.imageId}/file`"
          :alt="block.caption || ''"
          class="w-full"
        />
        <figcaption v-if="block.caption || block.credit" class="mt-2 text-sm text-foreground/60">
          <span v-if="block.caption">{{ block.caption }}</span>
          <span v-if="block.caption && block.credit"> / </span>
          <span v-if="block.credit">{{ formatSource(block.credit) }}</span>
        </figcaption>
      </figure>

      <figure v-else-if="block.type === 'image'" class="my-6">
        <img
          v-if="block.data?.path"
          :src="useMediaUrl(block.data.path)"
          :alt="block.data.caption || ''"
          class="w-full"
        >
        <figcaption v-if="block.data?.caption || block.data?.source" class="mt-2 text-sm text-foreground/60">
          <span v-if="block.data.caption">{{ block.data.caption }}</span>
          <span v-if="block.data.caption && block.data.source"> / </span>
          <span v-if="block.data.source">{{ formatSource(block.data.source) }}</span>
        </figcaption>
      </figure>

      <BlockSlider
        v-else-if="block.type === 'slider'"
        :items="block.data?.items || []"
        class="my-6"
      />

      <div v-else-if="block.type === 'gallery'" class="my-6">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <figure v-for="(item, i) in block.data?.items" :key="i">
            <img
              v-if="item.path"
              :src="useMediaUrl(item.path)"
              :alt="item.source || ''"
              class="w-full"
            >
            <figcaption v-if="item.source" class="mt-1 text-xs text-foreground/60">
              {{ formatSource(item.source) }}
            </figcaption>
          </figure>
        </div>
      </div>

      <blockquote
        v-else-if="block.type === 'quote'"
        class="border-l-4 border-accent bg-accent/5 p-6 italic"
      >
        <p class="text-lg">{{ block.text }}</p>
        <footer v-if="block.author" class="mt-3 text-sm font-normal not-italic">
          {{ block.author }}<span v-if="block.role">, {{ block.role }}</span>
        </footer>
      </blockquote>

      <div
        v-else-if="block.type === 'embed' && block.html"
        class="my-6"
        v-html="block.html"
      />

      <ClientOnly v-else-if="block.type === 'video-player' && getEmbedUrl(block.videoUrl || props.item.videoUrl)">
        <VideoEmbed
          :url="getEmbedUrl(block.videoUrl || props.item.videoUrl)"
          :title="props.item.title || 'Видео'"
          class="my-6"
        />
        <template #fallback>
          <div class="my-6 aspect-video w-full bg-black" aria-hidden="true" />
        </template>
      </ClientOnly>
    </template>
  </div>
</template>
