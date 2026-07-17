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

function truncatedTitle(title: string, hasLabel: boolean): string {
  const max = hasLabel ? 40 : 200;
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
          class="mb-3 inline-block text-[12px] font-bold uppercase tracking-wider text-foreground border-b-2 border-accent pb-1 hover:text-foreground/80"
        >
          {{ group.category.name }}
        </NuxtLink>
        <ul class="space-y-3">
          <li v-for="item in group.items.slice(0, 10)" :key="item.id">
            <NuxtLink :to="link(item)" class="group flex items-start gap-3">
              <div class="flex shrink-0 flex-col items-start pt-0.5">
                <span class="text-xs font-normal text-foreground/60">
                  {{ formatDayMonth(item.publishedAt || item.createdAt) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm leading-snug text-foreground transition-colors group-hover:text-accent line-clamp-3" :class="item.materialLabel === 'important' ? 'font-bold' : 'font-normal'">
                  {{ truncatedTitle(item.title, !!item.materialLabel) }}
                  <MaterialLabelBadge
                    :label="item.materialLabel"
                    :type="item.type"
                    class="ml-1 inline-block whitespace-nowrap align-middle"
                  />
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink
          :to="`/category/${group.category.slug}`"
          class="mt-4 inline-flex items-center rounded border border-foreground/20 bg-transparent px-4 py-2 text-sm font-normal text-foreground/80 transition hover:border-accent hover:text-accent"
        >
          Ещё
          <span class="ml-1">→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
