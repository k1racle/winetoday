<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const { getArticle, incrementView } = useApi();

const { data: article, error } = await useAsyncData(
  `article-${route.params.slug}`,
  () => getArticle(route.params.slug as string, route.query.preview === '1'),
);

if (!article.value && error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' });
}

useSeoMeta({
  title: article.value?.seo?.metaTitle || article.value?.title,
  description: article.value?.seo?.metaDescription || article.value?.excerpt,
});

onMounted(() => {
  if (article.value?.id) {
    incrementView({
      contentType: 'article',
      contentId: article.value.id,
      slug: article.value.slug,
      viewerId: useViewerId(),
    }).catch(() => {});
  }
});
</script>

<template>
  <ContentDetail
    v-if="article"
    :item="article as ContentItem"
    type-label="Статьи"
    type-route="/articles"
  />
</template>
