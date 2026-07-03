<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const route = useRoute();
const { getGallery, incrementView } = useApi();

const { data: gallery, error } = await useAsyncData(
  `gallery-${route.params.slug}`,
  () => getGallery(route.params.slug as string, route.query.preview === '1'),
);

if (!gallery.value && error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Галерея не найдена' });
}

useSeoMeta({
  title: gallery.value?.seo?.metaTitle || gallery.value?.title,
  description: gallery.value?.seo?.metaDescription || gallery.value?.excerpt,
});

onMounted(() => {
  if (gallery.value?.id) {
    incrementView({
      contentType: 'gallery',
      contentId: gallery.value.id,
      slug: gallery.value.slug,
      viewerId: useViewerId(),
    }).catch(() => {});
  }
});
</script>

<template>
  <ContentDetail
    v-if="gallery"
    :item="gallery as ContentItem"
    type-label="Галереи"
    type-route="/gallery"
  />
</template>
