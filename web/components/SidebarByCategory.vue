<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { sortBySidebarCategoryOrder, resolveSidebarCategoryLabel } from '~/utils/sidebar-categories';

const props = defineProps<{
  groups: { category: { id: string; name: string; slug: string }; items: ContentItem[] }[];
}>();

const orderedGroups = computed(() =>
  sortBySidebarCategoryOrder(props.groups).map((group) => ({
    ...group,
    category: {
      ...group.category,
      name: resolveSidebarCategoryLabel(group.category),
    },
  })),
);

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
  <div class="border border-foreground/5 bg-card p-5 shadow-sm md:p-6">
    <div class="space-y-8">
      <div v-for="group in orderedGroups" :key="group.category.id">
        <NuxtLink
          :to="`/category/${group.category.slug}`"
          class="mb-3 block text-base font-normal text-foreground uppercase border-b-2 border-accent pb-2 hover:text-foreground/80"
        >
          {{ group.category.name }}
        </NuxtLink>
        <ul class="space-y-3">
          <li v-for="item in group.items.slice(0, 10)" :key="item.id">
            <NuxtLink :to="link(item)" class="group flex items-start gap-3">
              <span class="shrink-0 flex flex-col items-center justify-center text-center text-sm font-bold text-accent">
                <span>
                  {{ formatDayMonth(item.publishedAt || item.createdAt) }}
                </span>
                <span class="text-[10px] opacity-80">
                  {{ new Date(item.publishedAt || item.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
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
