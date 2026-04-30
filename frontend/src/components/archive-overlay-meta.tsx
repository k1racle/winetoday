import Link from "next/link";

type OverlayMetaItem = string | { label: string; href?: string | null };

type ArchiveOverlayMetaProps = {
  itemId: string;
  meta: OverlayMetaItem[];
  className?: string;
};

function renderOverlayMetaItem(itemId: string, value: OverlayMetaItem, index: number) {
  if (typeof value === "string") {
    return (
      <span key={`${itemId}-meta-${index}`} className="text-white/88">
        {value}
      </span>
    );
  }

  const chipClassName = "pointer-events-auto inline-flex items-center border border-white/22 bg-white/14 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_-12px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:border-emerald-300/50 hover:bg-emerald-400/18 hover:text-white";

  if (!value.href) {
    return <span key={`${itemId}-meta-${index}`} className={chipClassName}>{value.label}</span>;
  }

  return (
    <Link key={`${itemId}-meta-${index}`} href={value.href} className={`relative z-10 ${chipClassName}`}>
      {value.label}
    </Link>
  );
}

export function ArchiveOverlayMeta({ itemId, meta, className }: ArchiveOverlayMetaProps) {
  if (!meta.length) {
    return null;
  }

  return (
    <div
      className={[
        "type-caption flex flex-wrap items-center gap-x-3 gap-y-2 text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.65)]",
        "pointer-events-none",
        className,
      ].filter(Boolean).join(" ")}
    >
      {meta.map((value, index) => renderOverlayMetaItem(itemId, value, index))}
    </div>
  );
}

export type { OverlayMetaItem };
