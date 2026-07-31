<script setup lang="ts">
const props = defineProps<{
  slug: string;
  fallbackTitle?: string;
}>();

const { getStaticPage, getLatestByCategory } = useApi();

const { data: page } = await useAsyncData(`static-page-${props.slug}`, () =>
  getStaticPage(props.slug).catch(() => null),
);

const { data: latestByCategory } = await useAsyncData(`latest-by-category-${props.slug}`, () =>
  getLatestByCategory(10).catch(() => []),
);

const title = computed(() => page.value?.title || props.fallbackTitle || 'Страница в разработке');
const contentHtml = computed(() => {
  const blocks = page.value?.contentBlocks;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => (block.type === 'text' ? block.content : ''))
    .join('');
});

useCanonical();
useSeoMeta({
  title: title.value,
  description: page.value?.seo?.description || `${title.value}.`,
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
          Страница в разработке
        </div>
      </div>
      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory v-if="latestByCategory?.length" :groups="latestByCategory" />
      </aside>
    </div>
  </div>
</template>
