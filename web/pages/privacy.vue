<script setup lang="ts">
const { getStaticPage } = useApi();

const { data: page } = await useAsyncData('static-page-privacy', () =>
  getStaticPage('privacy').catch(() => null),
);

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
