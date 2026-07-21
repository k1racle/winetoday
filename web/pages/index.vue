<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const { getHomepage, getContent, getLatestByCategory } = useApi();

const { data: homepage } = useAsyncData('homepage', () =>
  getHomepage().catch(() => ({ lead: [], articles: [], news: [], videos: [], galleries: [] })),
);

const { data: fresh } = useAsyncData('fresh', () =>
  getContent({ limit: 7 }).catch(() => ({ items: [] })),
);

const { data: latestByCategory } = useAsyncData('latest-by-category-home', () =>
  getLatestByCategory(10).catch(() => []),
);

const { data: allMixed } = useAsyncData('all-mixed', () =>
  getContent({ type: 'article', limit: 100 }).catch(() => ({ items: [] })),
);

const topItems = computed<ContentItem[]>(() => {
  const h = homepage.value;
  if (h?.lead?.length) return h.lead.slice(0, 3);
  const articles = (allMixed.value?.items || []).filter((item) => item.type === 'article');
  return articles.slice(0, 3);
});

const freshItems = computed<ContentItem[]>(() => {
  const items = fresh.value?.items || [];
  return [...items]
    .sort((a, b) => {
      const da = new Date(b.publishedAt || b.createdAt).getTime();
      const db = new Date(a.publishedAt || a.createdAt).getTime();
      return da - db;
    })
    .slice(0, 7);
});

const topItemIds = computed(() => new Set(topItems.value.map((i) => i.id)));

const { items: articles, total: articlesTotal, isLoading, loadMore } = useArchivePagination(
  ({ limit, offset }) => getContent({ type: 'article', limit, offset }),
  'home-articles',
  { excludeIds: topItemIds },
);

const thumbScroll = ref<HTMLDivElement | null>(null);

function scrollThumbs(direction: number) {
  thumbScroll.value?.scrollBy({ left: direction * 320, behavior: 'smooth' });
}

const siteUrl = (useRuntimeConfig().public.siteUrl as string)?.replace(/\/$/, '') || '';
const firstCoverPath = topItems.value?.[0]?.coverMedia?.path;
const homeOgImage = firstCoverPath ? useOgImageUrl(useMediaUrl(firstCoverPath)) : '';

useHead({ titleTemplate: '%s' });

useSeoMeta({
  title: 'ВИНОДЕЛИЕ СЕГОДНЯ — федеральное отраслевое медиа',
  description: 'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.',
  ogTitle: 'ВИНОДЕЛИЕ СЕГОДНЯ — федеральное отраслевое медиа',
  ogDescription: 'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.',
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  ogImage: homeOgImage,
  twitterCard: 'summary_large_image',
  twitterImage: homeOgImage,
});
</script>

<template>
  <div class="pb-16">
    <!-- Main content + sidebar -->
    <section v-if="topItems.length || articles.length" class="mx-auto max-w-7xl px-4 py-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div class="lg:hidden mb-4">
          <FreshList v-if="freshItems.length" :items="freshItems" />
        </div>
        <!-- Main column: hero + video + latest news -->
        <div class="flex w-full flex-col gap-4 lg:w-3/4">
          <template v-if="topItems.length">
            <!-- Mobile: top 3 items look the same (photo on top, text below) -->
            <div class="flex flex-col gap-4 lg:hidden">
              <NewsThumbCard
                v-for="item in topItems.slice(0, 3)"
                :key="`mob-${item.id}`"
                :item="item"
              />
            </div>

            <!-- Desktop: large square hero + two small cards on the right -->
            <div class="hidden w-full flex-col gap-4 lg:flex">
              <div class="flex flex-col gap-4 lg:flex-row">
                <div class="w-full lg:w-2/3">
                  <HeroCard
                    v-if="topItems[0]"
                    :item="topItems[0]"
                    size="large"
                  />
                </div>
                <div class="flex w-full flex-col gap-4 lg:w-1/3">
                  <NewsThumbCard
                    v-for="item in topItems.slice(1, 3)"
                    :key="`top-${item.id}`"
                    :item="item"
                    class="min-h-0 flex-1"
                  />
                </div>
              </div>
            </div>

            <!-- Video block -->
            <div v-if="homepage?.videos?.length" class="mt-5 w-full">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg class="h-5 w-5 fill-current text-accent" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <h2 class="font-heading text-xl font-normal uppercase tracking-wider">
                    <span class="rounded bg-accent px-2 py-0.5 text-white dark:text-black">Видео</span>
                  </h2>
                </div>
                <NuxtLink
                  to="/videos"
                  class="inline-flex items-center rounded border border-foreground/20 bg-transparent px-4 py-2 text-sm font-normal text-foreground/80 transition hover:border-accent hover:text-accent"
                >
                  Все видео
                  <span class="ml-1">→</span>
                </NuxtLink>
              </div>

              <VideoFeatureCard :item="homepage.videos[0]" :show-title="false" :show-play="false">
                <template #title>
                  <h3 class="mb-3 font-heading text-lg font-normal leading-snug text-foreground md:text-xl">
                    {{ homepage.videos[0].title }}
                  </h3>
                </template>
              </VideoFeatureCard>

              <div class="mt-4">
                <div
                  ref="thumbScroll"
                  class="flex min-w-0 gap-4 overflow-x-auto pb-2 scroll-smooth"
                >
                  <VideoThumb
                    v-for="item in homepage.videos.slice(1)"
                    :key="item.id"
                    :item="item"
                  />
                </div>
                <div class="mt-2 hidden justify-end gap-2 md:flex">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded border border-foreground/10 bg-card text-foreground/70 transition hover:border-accent hover:text-accent"
                    aria-label="Назад"
                    @click="scrollThumbs(-1)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded border border-foreground/10 bg-card text-foreground/70 transition hover:border-accent hover:text-accent"
                    aria-label="Вперёд"
                    @click="scrollThumbs(1)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Latest news: left of sidebar -->
          <div v-if="articles.length" class="mt-1 pt-2 lg:pt-6">
            <h2 class="mb-6 inline-block border-b-2 border-accent pb-1 font-heading text-2xl font-normal">Последние статьи</h2>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ArticleCard
                v-for="item in articles"
                :key="item.id"
                :item="item"
                image-aspect="video"
                variant="compact"
              />
            </div>
            <div class="mt-8">
              <LoadMoreButton
                :loading="isLoading"
                :has-more="articles.length < articlesTotal"
                @load="loadMore"
              />
            </div>
          </div>
        </div>

        <!-- Fresh / popular news + categories: right column on desktop -->
        <aside
          v-if="freshItems.length || latestByCategory?.length"
          class="order-last hidden w-full flex-col gap-4 lg:flex lg:w-1/4"
        >
          <FreshList v-if="freshItems.length" :items="freshItems" />
          <SidebarByCategory v-if="latestByCategory?.length" :groups="latestByCategory" />
        </aside>
      </div>
    </section>
  </div>
</template>
