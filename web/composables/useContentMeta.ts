import type { ContentItem } from '~/types/content';

export function useContentMeta(item: ContentItem) {
  const sourceDate = computed(() => item.publishedAt || item.createdAt || '');

  const parsedDate = computed(() => {
    if (!sourceDate.value) return null;
    const value = new Date(sourceDate.value);
    return Number.isNaN(value.getTime()) ? null : value;
  });

  const dateTime = computed(() => parsedDate.value?.toISOString() || '');

  const date = computed(() => {
    if (!parsedDate.value) return '';
    return parsedDate.value.toLocaleDateString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).replace(' г.', '');
  });

  const shortDate = computed(() => {
    if (!parsedDate.value) return '';
    return parsedDate.value.toLocaleDateString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(' г.', '');
  });

  const category = computed(() => {
    return item.categories?.[0]?.name || '';
  });

  const categorySlug = computed(() => {
    return item.categories?.[0]?.slug || '';
  });

  const typeLabel = computed(() => {
    switch (item.type) {
      case 'article':
        return 'Статья';
      case 'news':
        return 'Новость';
      case 'video':
        return 'Видео';
      case 'gallery':
        return 'Галерея';
      default:
        return '';
    }
  });

  return { date, shortDate, dateTime, category, categorySlug, typeLabel };
}
