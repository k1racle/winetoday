import Link from "next/link";

type PreviewBannerProps = {
  exitHref: string;
};

export function PreviewBanner({ exitHref }: PreviewBannerProps) {
  return (
    <div className="border-b border-amber-300/40 bg-amber-50/95 text-amber-950 backdrop-blur dark:border-amber-200/10 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="type-small">Режим предпросмотра</p>
          <p className="type-small mt-1 text-amber-900/80 dark:text-amber-100/80">
            Вы видите черновую версию контента из Strapi до публикации.
          </p>
        </div>
        <Link
          href={`/api/preview/disable?url=${encodeURIComponent(exitHref)}`}
          className="type-button border border-amber-400/40 px-4 py-2 transition-colors hover:bg-amber-100 dark:border-amber-200/20 dark:hover:bg-amber-200/10"
        >
          Выйти из предпросмотра
        </Link>
      </div>
    </div>
  );
}
