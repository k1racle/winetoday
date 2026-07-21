<script setup lang="ts">
const { getStaticPage, getLatestByCategory, getContent } = useApi();

const { data: page } = await useAsyncData('static-page-privacy', () =>
  getStaticPage('privacy').catch(() => null),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-privacy', () =>
  getLatestByCategory(10).catch(() => []),
);

const { data: fresh } = await useAsyncData('fresh-privacy', () =>
  getContent({ limit: 7 }).catch(() => ({ items: [] })),
);

const freshItems = computed(() => fresh.value?.items || []);

const title = computed(() => page.value?.title || 'Политика в отношении обработки персональных данных');
const contentHtml = computed(() => {
  const blocks = page.value?.contentBlocks;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => (block.type === 'text' ? block.content : ''))
    .join('');
});

useSeoMeta({
  title: title.value,
  description: page.value?.seo?.description || 'Политика в отношении обработки персональных данных.',
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div class="w-full lg:w-3/4">
        <h1 class="mb-6 font-heading text-3xl font-bold md:text-4xl">
          {{ title }}
        </h1>
        <div
          v-if="contentHtml"
          class="prose prose-sm max-w-none text-foreground dark:prose-invert"
          v-html="contentHtml"
        />
        <div v-else class="text-sm text-foreground/60">
          Страница не заполнена. Добавьте текст в админке.
        </div>
      </div>
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <FreshList v-if="freshItems.length" :items="freshItems" />
        <SidebarByCategory v-if="latestByCategory?.length" :groups="latestByCategory" />
      </aside>
    </div>
  </div>
</template>
