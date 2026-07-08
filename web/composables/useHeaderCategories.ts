import { computed } from 'vue';

import {
  matchSidebarCategory,
  SIDEBAR_CATEGORY_GROUPS,
} from '~/utils/sidebar-categories';

export const headerCategoryOrder = SIDEBAR_CATEGORY_GROUPS.map((group) => group.label);

export function useHeaderCategories() {
  const { getCategories } = useApi();
  const { data: categories } = useAsyncData('categories', () =>
    getCategories().catch(() => []),
  );

  const headerCategories = computed(() => {
    if (!categories.value) return [];

    return SIDEBAR_CATEGORY_GROUPS
      .map((group) => matchSidebarCategory(categories.value as Array<{ name: string; slug: string }>, group))
      .filter(Boolean);
  });

  return { categories, headerCategories };
}
