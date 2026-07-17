export function useSharedCategories() {
  const { getCategories } = useApi();

  const { data: categories, pending, error } = useAsyncData('categories-shared', () =>
    getCategories().catch(() => []),
  );

  return { categories, pending, error };
}
