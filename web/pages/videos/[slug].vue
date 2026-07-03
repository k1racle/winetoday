<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const { getVideo, incrementView } = useApi();

const { data: video, error } = await useAsyncData(
  `video-${route.params.slug}`,
  () => getVideo(route.params.slug as string, route.query.preview === '1'),
);

if (!video.value && error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Видео не найдено' });
}

useSeoMeta({
  title: video.value?.seo?.metaTitle || video.value?.title,
  description: video.value?.seo?.metaDescription || video.value?.excerpt,
});

onMounted(() => {
  if (video.value?.id) {
    incrementView({
      contentType: 'video',
      contentId: video.value.id,
      slug: video.value.slug,
      viewerId: useViewerId(),
    }).catch(() => {});
  }
});
</script>

<template>
  <ContentDetail
    v-if="video"
    :item="video as ContentItem"
    type-label="Видео"
    type-route="/videos"
  />
</template>
