import Link from "next/link";

type RelatedTag = {
  slug: string;
  name: string;
};

type RelatedTagsProps = {
  tags?: RelatedTag[] | null;
  title?: string;
};

export function RelatedTags({ tags, title = "Связанные теги" }: RelatedTagsProps) {
  if (!tags?.length) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-black/10 pt-6 dark:border-white/10">
      <p className="type-caption mb-4 text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="type-button border border-black/10 bg-black/[0.02] px-3 py-1.5 text-zinc-700 transition-colors hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-300"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
