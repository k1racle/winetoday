<script setup lang="ts">
const { getStaticPage } = useApi();

const { data: page } = await useAsyncData('static-page-legal', () =>
  getStaticPage('legal').catch(() => null),
);

const title = computed(() => page.value?.title || 'Правовая информация');
const contentHtml = computed(() => {
  const blocks = page.value?.content;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((block: any) => block?.__component === 'blocks.html-editor' || block?.__component === 'blocks.rich-text')
    .map((block: any) => block.content || '')
    .join('');
});

useSeoMeta({
  title: title.value,
  description: page.value?.seo?.description || 'Правовая информация.',
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
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
</template>
