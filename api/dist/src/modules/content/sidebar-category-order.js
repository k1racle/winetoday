"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerCategoryOrder = exports.SIDEBAR_CATEGORY_GROUPS = void 0;
exports.sortBySidebarCategoryOrder = sortBySidebarCategoryOrder;
exports.resolveSidebarCategoryLabel = resolveSidebarCategoryLabel;
exports.matchSidebarCategory = matchSidebarCategory;
exports.SIDEBAR_CATEGORY_GROUPS = [
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
exports.headerCategoryOrder = exports.SIDEBAR_CATEGORY_GROUPS.map((group) => group.label);
const duplicateSuffixPattern = /-\d+$/;
function normalizeSlug(slug) {
    return slug.trim().toLowerCase().replace(duplicateSuffixPattern, '');
}
function normalizeName(name) {
    return name.trim().toLowerCase();
}
function resolveGroupIndex(category) {
    const normalizedName = normalizeName(category.name);
    const normalizedSlug = normalizeSlug(category.slug);
    for (let index = 0; index < exports.SIDEBAR_CATEGORY_GROUPS.length; index += 1) {
        const group = exports.SIDEBAR_CATEGORY_GROUPS[index];
        if (group.names.some((name) => normalizeName(name) === normalizedName)) {
            return index;
        }
        if (group.slugs.some((slug) => normalizeSlug(slug) === normalizedSlug)) {
            return index;
        }
    }
    return null;
}
function sortBySidebarCategoryOrder(groups) {
    const usedGroups = new Set();
    return groups
        .map((group) => ({ group, index: resolveGroupIndex(group.category) }))
        .filter((entry) => entry.index !== null)
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
function resolveSidebarCategoryLabel(category) {
    const index = resolveGroupIndex(category);
    if (index === null) {
        return category.name.trim();
    }
    return exports.SIDEBAR_CATEGORY_GROUPS[index].label;
}
function matchSidebarCategory(categories, group) {
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
//# sourceMappingURL=sidebar-category-order.js.map