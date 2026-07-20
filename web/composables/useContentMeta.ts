import type { ContentItem } from '~/types/content';

export function useContentMeta(item: ContentItem) {
  const date = computed(() => {
    const d = item.publishedAt || item.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).replace(' г.', '');
  });

  const shortDate = computed(() => {
    const d = item.publishedAt || item.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('ru-RU', {
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

  return { date, shortDate, category, categorySlug, typeLabel };
}
