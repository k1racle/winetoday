export type SidebarCategoryGroup = {
  label: string;
  names: string[];
  slugs: string[];
};

export const SIDEBAR_CATEGORY_GROUPS: SidebarCategoryGroup[] = [
  {
    label: 'Российское виноделие',
    names: ['Российское виноделие', 'Вино'],
    slugs: ['rossijskoe-vino', 'rossiyskoe-vinodelie', 'rossijskoe-vinodelie', 'vino'],
  },
  {
    label: 'Зарубежное виноделие',
    names: ['Зарубежное виноделие'],
    slugs: ['zarubezhnoe-vino', 'zarubezhnoe-vinodelie'],
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

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function resolveGroupIndex(category: { name: string; slug: string }): number | null {
  const normalizedName = normalizeName(category.name);
  const normalizedSlug = normalizeSlug(category.slug);

  for (let index = 0; index < SIDEBAR_CATEGORY_GROUPS.length; index += 1) {
    const group = SIDEBAR_CATEGORY_GROUPS[index];
    if (group.names.some((name) => normalizeName(name) === normalizedName)) {
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
    return category.name.trim();
  }
  return SIDEBAR_CATEGORY_GROUPS[index].label;
}

export function matchSidebarCategory<T extends { id: string; name: string; slug: string }>(
  categories: T[],
  group: SidebarCategoryGroup,
): T | null {
  const nameMap = new Map(categories.map((category) => [normalizeName(category.name), category]));
  const slugMap = new Map(categories.map((category) => [normalizeSlug(category.slug), category]));

  for (const slug of group.slugs) {
    const match = slugMap.get(normalizeSlug(slug));
    if (match) {
      return match;
    }
  }

  for (const name of group.names) {
    const match = nameMap.get(normalizeName(name));
    if (match) {
      return match;
    }
  }

  return null;
}
