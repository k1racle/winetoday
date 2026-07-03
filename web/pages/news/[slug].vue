<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const { getNewsItem, incrementView } = useApi();

const { data: newsItem, error } = await useAsyncData(
  `news-${route.params.slug}`,
  () => getNewsItem(route.params.slug as string, route.query.preview === '1'),
);

if (!newsItem.value && error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Новость не найдена' });
}

useSeoMeta({
  title: newsItem.value?.seo?.metaTitle || newsItem.value?.title,
  description: newsItem.value?.seo?.metaDescription || newsItem.value?.excerpt,
});

onMounted(() => {
  if (newsItem.value?.id) {
    incrementView({
      contentType: 'news',
      contentId: newsItem.value.id,
      slug: newsItem.value.slug,
      viewerId: useViewerId(),
    }).catch(() => {});
  }
});
</script>

<template>
  <ContentDetail
    v-if="newsItem"
    :item="newsItem as ContentItem"
    type-label="Новости"
    type-route="/news"
  />
</template>
