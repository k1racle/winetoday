import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Хлебные крошки" className={className ?? "mb-5"}>
      <ol className="type-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-500 dark:text-zinc-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-emerald-800 dark:hover:text-emerald-300">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-zinc-700 dark:text-zinc-200" : undefined}>{item.label}</span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
