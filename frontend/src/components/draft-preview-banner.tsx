import Link from "next/link";

export function DraftPreviewBanner({ type }: { type: string }) {
  return (
    <div className="border-b border-amber-200 bg-amber-100 px-4 py-3 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-100">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 sm:px-8 lg:px-10">
        <p className="text-sm font-medium">
          Это черновик {type}. Ссылка действительна для предпросмотра, материал не опубликован.
        </p>
        <Link
          href="/account"
          className="text-sm underline underline-offset-2 transition hover:text-amber-700 dark:hover:text-amber-200"
        >
          Вернуться в редактор
        </Link>
      </div>
    </div>
  );
}
