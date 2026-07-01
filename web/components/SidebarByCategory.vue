<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  groups: { category: { id: string; name: string; slug: string }; items: ContentItem[] }[];
}>();

function link(item: ContentItem) {
  switch (item.type) {
    case 'article':
      return `/articles/${item.slug}`;
    case 'news':
      return `/news/${item.slug}`;
    case 'video':
      return `/videos/${item.slug}`;
    case 'gallery':
      return `/gallery/${item.slug}`;
    default:
      return '/';
  }
}

function formatDayMonth(date?: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function truncatedTitle(title: string, exclusive: boolean): string {
  const max = exclusive ? 40 : 200;
  if (title.length <= max) return title;
  return title.slice(0, max).trim().replace(/[\s.,!?;:]$/, '') + '…';
}
</script>

<template>
  <div class="h-full border border-foreground/5 bg-card p-5 shadow-sm md:p-6">
    <h3 class="mb-5 font-heading text-base font-bold text-foreground">
      Свежие новости
    </h3>
    <div class="space-y-8">
      <div v-for="group in groups" :key="group.category.id">
        <NuxtLink
          :to="`/category/${group.category.slug}`"
          class="mb-3 block text-xs font-bold text-accent hover:text-accent/80"
        >
          {{ group.category.name }}
        </NuxtLink>
        <ul class="space-y-3">
          <li v-for="item in group.items" :key="item.id">
            <NuxtLink :to="link(item)" class="group flex items-start gap-3">
              <span class="shrink-0 pt-0.5 text-sm font-bold text-accent">
                {{ formatDayMonth(item.publishedAt || item.createdAt) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium leading-snug text-foreground group-hover:text-foreground line-clamp-2">
                  {{ truncatedTitle(item.title, item.materialLabel === 'exclusive') }}
                  <span
                    v-if="item.materialLabel === 'exclusive'"
                    class="ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  >
                    Эксклюзив
                  </span>
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
