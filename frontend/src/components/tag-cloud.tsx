import Link from "next/link";

import type { TagCloudItem } from "@/lib/strapi";

type TagCloudProps = {
  tags?: TagCloudItem[] | null;
  title?: string;
  className?: string;
  compact?: boolean;
};

function weightClass(weight: number) {
  if (weight >= 0.85) {
    return "text-base font-semibold";
  }

  if (weight >= 0.6) {
    return "text-[15px] font-medium";
  }

  return "text-sm font-medium";
}

export function TagCloud({ tags, title, className, compact = false }: TagCloudProps) {
  if (!tags?.length) {
    return null;
  }

  const maxCount = Math.max(...tags.map((tag) => tag.count), 1);

  return (
    <section className={`min-w-0 max-w-full ${className ?? ""}`.trim()}>
      {title ? (
        <h2 className="type-caption text-emerald-700 dark:text-emerald-400">
          {title}
        </h2>
      ) : null}
      <div className={`${title ? "mt-4 " : ""}flex min-w-0 max-w-full flex-wrap gap-2 ${compact ? "gap-y-2" : "gap-y-3"}`}>
        {tags.map((tag) => {
          const weight = tag.count / maxCount;

          return (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className={`inline-flex max-w-full items-center border border-black/10 px-3 py-1.5 text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-white/10 dark:text-zinc-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300 ${weightClass(weight)}`}
              title={`${tag.name} (${tag.count})`}
            >
              <span className="min-w-0 break-words [overflow-wrap:break-word]">{tag.name}</span>
              <span className="type-caption ml-2 shrink-0 opacity-60">{tag.count}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
