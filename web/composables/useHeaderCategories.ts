import { computed } from 'vue';

export const headerCategoryOrder = [
  'Российское виноделие',
  'Зарубежное виноделие',
  'Алкогольный рынок',
  'Розничный бизнес',
  'Ресторанный бизнес',
  'Туризм',
];

export function useHeaderCategories() {
  const { getCategories } = useApi();
  const { data: categories } = useAsyncData('categories', () =>
    getCategories().catch(() => []),
  );

  const headerCategories = computed(() => {
    if (!categories.value) return [];
    const map = new Map(
      (categories.value as any[]).map((c: any) => [
        String(c.name || '').trim().toLowerCase(),
        c,
      ]),
    );
    return headerCategoryOrder
      .map((name) => map.get(name.toLowerCase()))
      .filter(Boolean);
  });

  return { categories, headerCategories };
}
