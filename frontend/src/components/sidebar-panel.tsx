import Link from "next/link";

import { AuthWidget } from "@/components/auth-widget";
import { TagCloud } from "@/components/tag-cloud";
import type { SidebarEntry } from "@/lib/strapi";
import type { SidebarArchiveBlock } from "@/lib/strapi";
import type { TagCloudItem } from "@/lib/strapi";
import { SocialLinks } from "@/components/social-links";

type SidebarPanelProps = {
  sidebar?: SidebarEntry | null;
  mobile?: boolean;
  tagCloud?: TagCloudItem[] | null;
  stacked?: boolean;
};

export function SidebarPanel({ sidebar, mobile = false, tagCloud, stacked = false }: SidebarPanelProps) {
  const asideClassName = mobile
    ? "w-full min-w-0 border border-black/10 bg-white p-5 text-foreground overflow-hidden break-words [overflow-wrap:anywhere] dark:border-white/10 dark:bg-[#12202d] dark:text-white"
    : stacked
      ? "w-full min-w-0 border border-black/10 bg-white p-5 text-foreground overflow-hidden break-words [overflow-wrap:anywhere] dark:border-white/10 dark:bg-[#12202d] dark:text-white"
      : "w-full min-w-0 border border-black/10 bg-white p-5 text-foreground overflow-hidden break-words [overflow-wrap:anywhere] dark:border-white/10 dark:bg-[#12202d] dark:text-white";
  const itemClassName = "block w-full min-w-0 border-b border-black/10 px-0 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]";

  // Если sidebar не задан, просто ничего не показываем.
  if (!sidebar) {
    return null;
  }

  const hasSections = Boolean(sidebar.sections?.length);
  const hasLinks = Boolean(sidebar.links?.length);
  const hasArchiveBlocks = Boolean(sidebar.archiveBlocks?.length);
  const hasSocialLinks = Boolean(sidebar.socialLinks?.links?.length);

  if (!hasSections && !hasLinks && !hasArchiveBlocks && !hasSocialLinks) {
    return null;
  }

  return (
    <aside className={asideClassName}>
      {sidebar.title ? (
        <p className="type-small font-menu text-emerald-700 dark:text-emerald-300">{sidebar.title}</p>
      ) : null}
      {sidebar.description ? (
        <p className={`type-small text-zinc-600 dark:text-zinc-400 ${sidebar.title ? "mt-3" : ""}`}>{sidebar.description}</p>
      ) : null}
      {hasSections ? (
        <div className="grid gap-4">
          {sidebar.sections?.map((section, sectionIndex) => (
            <section key={`${sidebar.slug}-section-${sectionIndex}`} className="space-y-3">
              {section.title || section.description ? (
                <div>
                  {section.title ? <h2 className="type-h4 text-[15px] leading-5 text-foreground">{section.title}</h2> : null}
                  {section.description ? (
                    <p className={`type-small text-zinc-600 dark:text-zinc-400 ${section.title ? "mt-2" : ""}`}>{section.description}</p>
                  ) : null}
                </div>
              ) : null}
                <div>
                {(section.links ?? []).map((item) => (
                  item.kind === "account" ? (
                    <div key={`${sidebar.slug}-section-${sectionIndex}-account-${item.label}`} className="border-b border-black/10 py-4 dark:border-white/10">
                      <AuthWidget label={item.label} className="w-full" buttonClassName="type-button inline-flex w-full items-center justify-center border border-black/10 px-4 py-3 text-emerald-700 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-emerald-300 dark:hover:bg-white/[0.06]" panelClassName="relative right-auto top-auto mt-4 w-full border border-black/10 bg-white p-5 text-foreground shadow-none dark:border-white/10 dark:bg-[#12202d] dark:text-white" />
                      {item.description ? <span className="type-small mt-2 block text-zinc-600 dark:text-zinc-400">{item.description}</span> : null}
                    </div>
                  ) : item.href ? (
                    <Link
                      key={`${sidebar.slug}-section-${sectionIndex}-${item.href}-${item.label}`}
                      href={item.href}
                      className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                    >
                      <div className="type-h4 min-w-0 text-[15px] leading-5 text-foreground">
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.label}</span>
                      </div>
                      {item.description ? (
                        <span className="type-small mt-2 block text-zinc-600 dark:text-zinc-400">{item.description}</span>
                      ) : null}
                    </Link>
                  ) : null
                ))}
                </div>
            </section>
          ))}
        </div>
      ) : hasLinks ? (
        <div>
          {sidebar.links?.map((item) => (
            item.kind === "account" ? (
              <div key={`account-${item.label}`} className="border-b border-black/10 py-4 dark:border-white/10">
                <AuthWidget label={item.label} className="w-full" buttonClassName="type-button inline-flex w-full items-center justify-center border border-black/10 px-4 py-3 text-emerald-700 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-emerald-300 dark:hover:bg-white/[0.06]" panelClassName="relative right-auto top-auto mt-4 w-full border border-black/10 bg-white p-5 text-foreground shadow-none dark:border-white/10 dark:bg-[#12202d] dark:text-white" />
                {item.description ? <span className="type-small mt-2 block text-zinc-600 dark:text-zinc-400">{item.description}</span> : null}
              </div>
            ) : item.href ? (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
              >
                <div className="type-h4 min-w-0 text-[15px] leading-5 text-foreground">
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.label}</span>
                </div>
                {item.description ? (
                  <span className="type-small mt-2 block text-zinc-600 dark:text-zinc-400">{item.description}</span>
                ) : null}
              </Link>
            ) : null
          ))}
        </div>
      ) : null}
      {hasArchiveBlocks ? (
        <div className="grid gap-4">
          {sidebar.archiveBlocks?.map((block, index) => {
            if (block.__component === "sidebar.tag-cloud-block") {
              return tagCloud?.length ? (
                <section
                  key={`${sidebar.slug}-archive-tag-cloud-${index}`}
                  className="space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10"
                >
                  <TagCloud tags={tagCloud} title={block.title ?? undefined} />
                </section>
              ) : null;
            }

            if (!isSidebarArchiveBlock(block)) {
              return null;
            }

            return (
              <section key={`${sidebar.slug}-archive-${block.__component ?? block.contentType}-${index}`} className="space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10">
                {block.title || block.description ? (
                  <div>
                    {block.title ? <h2 className="type-h4 text-[15px] leading-5 text-foreground">{block.title}</h2> : null}
                    {block.description ? (
                      <p className={`type-small text-zinc-600 dark:text-zinc-400 ${block.title ? "mt-2" : ""}`}>{block.description}</p>
                    ) : null}
                  </div>
                ) : null}
                <div>
                  {(block.items ?? []).map((item) => (
                    <Link
                      key={`${block.contentType}-${item.href}-${item.label}`}
                      href={item.href}
                      className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                    >
                      <div className="type-h4 min-w-0 text-[15px] leading-5 text-foreground">
                        {item.meta ? (
                          <span className="type-caption mr-2 text-emerald-700 dark:text-emerald-300">
                            {item.meta}
                          </span>
                        ) : null}
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {block.archiveHref && block.archiveLabel ? (
                  <Link
                    href={block.archiveHref}
                    className="type-small font-menu inline-flex items-center gap-2 text-emerald-600 transition-colors hover:text-foreground dark:text-emerald-300 dark:hover:text-white"
                  >
                    {block.archiveLabel}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}
      {hasSocialLinks ? (
        <SocialLinks
          widget={sidebar.socialLinks}
          className="mt-5 border-t border-black/10 pt-4 dark:border-white/10"
          showLabels
          itemClassName="hover:text-emerald-600 dark:hover:text-emerald-300"
          iconClassName="h-10 w-10"
          labelClassName="text-zinc-600 dark:text-zinc-400"
        />
      ) : null}
    </aside>
  );
}

function isSidebarArchiveBlock(block: NonNullable<SidebarEntry["archiveBlocks"]>[number]): block is SidebarArchiveBlock {
  return block.__component === "sidebar.archive-block" || "contentType" in block;
}
