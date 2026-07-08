export type SidebarCategoryGroup = {
  label: string;
  names: string[];
  slugs: string[];
};

export const SIDEBAR_CATEGORY_GROUPS: SidebarCategoryGroup[] = [
  {
    label: 'Российское виноделие',
    names: ['Российское виноделие', 'Вино'],
    slugs: ['rossiyskoe-vinodelie', 'rossijskoe-vinodelie', 'vino'],
  },
  {
    label: 'Зарубежное виноделие',
    names: ['Зарубежное виноделие'],
    slugs: ['zarubezhnoe-vinodelie'],
  },
  {
    label: 'Алкогольный рынок',
    names: ['Алкогольный рынок'],
    slugs: ['alkogolnyj-rynok', 'alkogolnyy-rynok'],
  },
  {
    label: 'Розничный бизнес',
    names: ['Розничный бизнес'],
    slugs: ['roznichnyj-biznes', 'roznichnyy-biznes'],
  },
  {
    label: 'Ресторанный бизнес',
    names: ['Ресторанный бизнес'],
    slugs: ['restorannyj-biznes', 'restorannyy-biznes'],
  },
  {
    label: 'Туризм',
    names: ['Туризм'],
    slugs: ['turizm'],
  },
];

export const headerCategoryOrder = SIDEBAR_CATEGORY_GROUPS.map((group) => group.label);

const duplicateSuffixPattern = /-\d+$/;

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(duplicateSuffixPattern, '');
}

function resolveGroupIndex(category: { name: string; slug: string }): number | null {
  const normalizedName = category.name.trim().toLowerCase();
  const normalizedSlug = normalizeSlug(category.slug);

  for (let index = 0; index < SIDEBAR_CATEGORY_GROUPS.length; index += 1) {
    const group = SIDEBAR_CATEGORY_GROUPS[index];
    if (group.names.some((name) => name.trim().toLowerCase() === normalizedName)) {
      return index;
    }
    if (group.slugs.some((slug) => normalizeSlug(slug) === normalizedSlug)) {
      return index;
    }
  }

  return null;
}

export function sortBySidebarCategoryOrder<T extends { category: { name: string; slug: string } }>(
  groups: T[],
): T[] {
  const usedGroups = new Set<number>();

  return groups
    .map((group) => ({ group, index: resolveGroupIndex(group.category) }))
    .filter((entry): entry is { group: T; index: number } => entry.index !== null)
    .filter((entry) => {
      if (usedGroups.has(entry.index)) {
        return false;
      }
      usedGroups.add(entry.index);
      return true;
    })
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.group);
}

export function resolveSidebarCategoryLabel(category: { name: string; slug: string }): string {
  const index = resolveGroupIndex(category);
  if (index === null) {
    return category.name;
  }
  return SIDEBAR_CATEGORY_GROUPS[index].label;
}

export function matchSidebarCategory(
  categories: Array<{ name: string; slug: string }>,
  group: SidebarCategoryGroup,
): { name: string; slug: string } | null {
  const nameMap = new Map(
    categories.map((category) => [category.name.trim().toLowerCase(), category]),
  );
  const slugMap = new Map(
    categories.map((category) => [normalizeSlug(category.slug), category]),
  );

  for (const slug of group.slugs) {
    const match = slugMap.get(normalizeSlug(slug));
    if (match) {
      return match;
    }
  }

  for (const name of group.names) {
    const match = nameMap.get(name.trim().toLowerCase());
    if (match) {
      return match;
    }
  }

  return null;
}
