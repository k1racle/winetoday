export type SidebarCategoryGroup = {
    label: string;
    names: string[];
    slugs: string[];
};
export declare const SIDEBAR_CATEGORY_GROUPS: SidebarCategoryGroup[];
export declare const headerCategoryOrder: string[];
export declare function sortBySidebarCategoryOrder<T extends {
    category: {
        name: string;
        slug: string;
    };
}>(groups: T[]): T[];
export declare function resolveSidebarCategoryLabel(category: {
    name: string;
    slug: string;
}): string;
export declare function matchSidebarCategory<T extends {
    id: string;
    name: string;
    slug: string;
}>(categories: T[], group: SidebarCategoryGroup): T | null;
