<script setup lang="ts">
const props = defineProps<{
  label?: string | null;
  type?: 'article' | 'news' | 'video' | 'gallery';
}>();

interface BadgeConfig {
  text: string;
  image: string;
}

const config = computed<BadgeConfig | null>(() => {
  const effective = props.label || (props.type === 'video' ? 'video' : props.type === 'gallery' ? 'photo' : null);
  switch (effective) {
    case 'important':
      return { text: 'Важное', image: '/badges/badge-important.svg' };
    case 'exclusive':
      return { text: 'Эксклюзив', image: '/badges/badge-exclusive.svg' };
    case 'trends':
    case 'hot':
      return { text: 'Тренды', image: '/badges/badge-trends.svg' };
    case 'photo':
      return { text: 'Фото', image: '/badges/badge-photo.svg' };
    case 'video':
      return { text: 'Видео', image: '/badges/badge-video.svg' };
    default:
      return null;
  }
});
</script>

<template>
  <img
    v-if="config"
    :src="config.image"
    :alt="config.text"
    class="inline-block h-5 w-auto align-middle"
  >
</template>
