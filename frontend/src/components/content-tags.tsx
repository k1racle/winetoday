import Link from "next/link";

import type { CategorySummaryList } from "@/lib/strapi";

type ContentTag = {
  slug: string;
  name: string;
};

type ContentTagsProps = {
  tags?: ContentTag[] | null;
  categories?: CategorySummaryList | null;
  className?: string;
};

export function ContentTags({ tags, categories, className }: ContentTagsProps) {
  if (!tags?.length && !categories?.length) {
    return null;
  }

  return (
    <div className={className ?? "mt-2 flex flex-wrap gap-x-3 gap-y-1"}>
      {categories?.map((category, index) => {
        if (!category?.name?.trim()) {
          return null;
        }

        const className = "type-caption text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300";

        if (!category.slug) {
          return (
            <span key={`category-${category.name}-${index}`} className={className}>
              {category.name}
            </span>
          );
        }

        return (
          <Link
            key={`category-${category.slug}`}
            href={`/categories/${category.slug}`}
            className={className}
          >
            {category.name}
          </Link>
        );
      })}
      {(tags ?? []).map((tag) => (
        <Link
          key={tag.slug}
          href={`/tags/${tag.slug}`}
          className="type-caption text-zinc-500 transition-colors hover:text-emerald-800 dark:text-zinc-400 dark:hover:text-emerald-300"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
