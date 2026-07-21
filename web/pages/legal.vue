<script setup lang="ts">
const { getStaticPage, getLatestByCategory } = useApi();

const { data: page } = await useAsyncData('static-page-legal', () =>
  getStaticPage('legal').catch(() => null),
);

const { data: latestByCategory } = await useAsyncData('latest-by-category-legal', () =>
  getLatestByCategory(10).catch(() => []),
);

const title = computed(() => page.value?.title || 'Правовая информация');
const contentHtml = computed(() => {
  const blocks = page.value?.contentBlocks;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => (block.type === 'text' ? block.content : ''))
    .join('');
});

useSeoMeta({
  title: title.value,
  description: page.value?.seo?.description || 'Правовая информация.',
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
        <SidebarByCategory v-if="latestByCategory?.length" :groups="latestByCategory" />
      </aside>
    </div>
  </div>
</template>
