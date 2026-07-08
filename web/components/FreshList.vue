<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const props = defineProps<{
  items: ContentItem[];
}>();

const activeTab = ref<'fresh' | 'popular'>('fresh');
const isExpanded = ref(false);

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

function isTodayInMoscow(date: string): boolean {
  const d = new Date(date).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
  const today = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
  return d === today;
}

function formatFreshDate(date?: string | null) {
  if (!date) return '';
  if (isTodayInMoscow(date)) {
    return new Date(date).toLocaleTimeString('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return new Date(date).toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
  });
}

function category(item: ContentItem) {
  return item.categories?.[0]?.name || '';
}

function truncatedTitle(title: string, exclusive: boolean): string {
  const max = exclusive ? 40 : 200;
  if (title.length <= max) return title;
  return title.slice(0, max).trim().replace(/[\s.,!?;:]$/, '') + '…';
}

const ITEM_LIMIT = 7;

const displayedItems = computed<ContentItem[]>(() => {
  const list = props.items || [];
  if (activeTab.value === 'popular') {
    return [...list]
      .sort((a, b) => (b.viewsTotal || 0) - (a.viewsTotal || 0))
      .slice(0, ITEM_LIMIT);
  }
  return list.slice(0, ITEM_LIMIT);
});

const hasMobileMore = computed(() => displayedItems.value.length > 4);
</script>

<template>
  <div class="flex flex-col border border-foreground/5 bg-card p-5 shadow-sm md:p-6">
    <!-- Tabs -->
    <div class="mb-4 flex items-center justify-between">
      <button
        type="button"
        class="flex-1 pb-1 text-center font-heading text-xs font-bold uppercase tracking-wider transition border-b-2"
        :class="activeTab === 'popular' ? 'text-foreground border-accent' : 'text-foreground/50 border-transparent hover:text-foreground'"
        @click="activeTab = 'popular'"
      >
        Популярные
      </button>
      <button
        type="button"
        class="flex-1 pb-1 text-center font-heading text-xs font-bold uppercase tracking-wider transition border-b-2"
        :class="activeTab === 'fresh' ? 'text-foreground border-accent' : 'text-foreground/50 border-transparent hover:text-foreground'"
        @click="activeTab = 'fresh'"
      >
        Свежие
      </button>
    </div>

    <ul class="divide-y divide-foreground/10">
      <li
        v-for="(item, index) in displayedItems"
        :key="item.id"
        class="py-3 first:pt-0 last:pb-0"
        :class="{ 'hidden md:block': !isExpanded && index >= 4 }"
      >
        <NuxtLink :to="link(item)" class="group flex min-w-0 items-start gap-3 transition-colors duration-200">
          <span class="shrink-0 pt-0.5 text-sm font-bold text-accent">
            {{ formatFreshDate(item.publishedAt || item.createdAt) }}
          </span>
          <div class="min-w-0 flex-1">
            <span class="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-accent">
              {{ truncatedTitle(item.title, item.materialLabel === 'exclusive') }}
              <span
                v-if="item.materialLabel === 'exclusive'"
                class="ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              >
                Эксклюзив
              </span>
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <button
      v-if="hasMobileMore && !isExpanded"
      type="button"
      class="mt-3 w-full text-center text-sm font-medium text-foreground/70 transition hover:text-foreground md:hidden"
      @click="isExpanded = true"
    >
      Ещё
    </button>

    <NuxtLink
      to="/news"
      class="mt-4 inline-flex items-center text-sm font-medium text-foreground/70 transition hover:text-foreground"
    >
      Все новости
      <span class="ml-1">→</span>
    </NuxtLink>
  </div>
</template>
