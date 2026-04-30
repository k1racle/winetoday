import type { SourceLink } from "@/lib/strapi";

type SourceLinksProps = {
  sources?: SourceLink[] | null;
  className?: string;
};

export function SourceLinks({ sources, className }: SourceLinksProps) {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className={className}>
      <p className="type-caption text-zinc-500 dark:text-zinc-400">Источники</p>
      <ul className="mt-2 space-y-1">
        {sources.map((source, index) => (
          <li key={`${source.name}-${index}`} className="text-sm text-zinc-700 dark:text-zinc-300">
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-opacity hover:opacity-80">
                {source.name}
              </a>
            ) : (
              source.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
