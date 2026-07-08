import Link from "next/link";

import { AuthWidget } from "@/components/auth-widget";
import { SidebarItemTitle } from "@/components/sidebar-item-title";
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
  archiveBlockInnerWidthClassName?: string;
  showOnlyArchive?: boolean;
};

export function SidebarPanel({ sidebar, mobile = false, tagCloud, stacked = false, archiveBlockInnerWidthClassName, showOnlyArchive = false }: SidebarPanelProps) {
  const asideClassName = mobile
    ? "w-full min-w-0 box-border overflow-hidden border border-black/10 bg-white text-foreground dark:border-white/10 dark:bg-[#12202d] dark:text-white"
    : stacked
      ? "w-full min-w-0 box-border overflow-hidden border border-black/10 bg-white text-foreground dark:border-white/10 dark:bg-[#12202d] dark:text-white"
      : "w-full min-w-0 box-border overflow-hidden border border-black/10 bg-white text-foreground dark:border-white/10 dark:bg-[#12202d] dark:text-white";
  // Десктопный сайдбар: outer 320px, эффективная внутренняя ширина контента 290px => 15px + 15px.
  // Поэтому задаём общий горизонтальный padding на уровне панели и не дублируем его на вложенных элементах.
  const panelPaddingX = "px-[15px]";
  const panelInnerWidthClassName = "w-full max-w-[290px]";
  const archiveInnerWidthClassName = archiveBlockInnerWidthClassName ?? panelInnerWidthClassName;
  const itemClassName = "block min-w-0 border-b border-black/10 px-0 py-4 transition-colors hover:bg-black/[0.03] last:border-b-0 dark:border-white/10 dark:hover:bg-white/[0.03]";
  const wordWrapClassName = "whitespace-normal break-words [overflow-wrap:break-word]";

  // Если sidebar не задан, просто ничего не показываем.
  if (!sidebar) {
    return null;
  }

  const hasSections = Boolean(sidebar.sections?.length);
  const hasLinks = Boolean(sidebar.links?.length);
  const hasArchiveBlocks = Boolean(sidebar.archiveBlocks?.length);
  const hasSocialLinks = Boolean(sidebar.socialLinks?.links?.length);

  // Если запрошен только архив (showOnlyArchive), то рендерим только блоки archiveBlocks.
  if (showOnlyArchive) {
    if (!hasArchiveBlocks) {
      return null;
    }

    return (
      <aside className={`w-full box-border ${asideClassName}`}>
        {/** В мобильном мини-виджете обычно не показываем заголовок/описание панели, оставляем только архивные блоки */}
        <div className={`grid gap-4 ${panelPaddingX} py-4`}>
          {(() => {
            const blocks = sidebar.archiveBlocks ?? [];
            let orderedBlocks = blocks;

            // На мобильной версии: показываем вначале блоки "homepage-news-block" (свежие/популярные),
            // но полностью скрываем блоки-рубрики (archive-block с категориями) — они не нужны на телефоне.
            if (mobile) {
              const homepageNews = blocks.filter((b) => b.__component === "sidebar.homepage-news-block");
              const others = blocks.filter((b) => b.__component !== "sidebar.archive-block");
              // others содержит homepageNews и все остальные блоки, кроме archive-block с рубриками
              // Сначала ставим homepageNews, потом остальные (без рубрик).
              const nonHomepageOthers = others.filter((b) => !homepageNews.includes(b));
              orderedBlocks = [...homepageNews, ...nonHomepageOthers];
            }

            return orderedBlocks.map((block, index) => {
              if (block.__component === "sidebar.tag-cloud-block") {
                return tagCloud?.length ? (
                  <section key={`${sidebar.slug}-archive-tag-cloud-${index}`} className={`space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10 ${archiveInnerWidthClassName}`}>
                    <TagCloud tags={tagCloud} title={block.title ?? undefined} />
                  </section>
                ) : null;
              }

              if (!isSidebarArchiveBlock(block)) {
                return null;
              }

              return (
                <section key={`${sidebar.slug}-archive-${block.__component ?? block.contentType}-${index}`} className={`space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10 ${archiveInnerWidthClassName}`}>
                  {block.title ? <h2 className="font-menu text-[13px] font-bold tracking-[0.02em] text-foreground dark:text-white">{block.title}</h2> : null}
                  <div className="space-y-4">
                    {block.categoryGroups?.length ? (
                      block.categoryGroups.map((group) => (
                        <section key={`${block.contentType}-${group.category.slug}`} className="space-y-1">
                          <h3 className="font-menu text-[13px] font-bold tracking-[0.02em] text-emerald-700 dark:text-emerald-300">
                            {group.category.name}
                          </h3>
                          <div>
                            {group.items.map((item) => (
                              <Link
                                key={`${block.contentType}-${group.category.slug}-${item.href}-${item.label}`}
                                href={item.href}
                                className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                              >
                                <div className="type-body-sm flex min-w-0 items-start gap-x-3 text-[#10211a] dark:text-white">
                                  {item.meta ? (
                                    <span className="w-[44px] shrink-0 pt-0.5 font-menu text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                                      {item.meta}
                                    </span>
                                  ) : null}
                                  <SidebarItemTitle
                                    title={item.label}
                                    materialLabel={item.materialLabel}
                                    className={`min-w-0 flex-1 ${wordWrapClassName}`}
                                    badgeClassName={
                                      item.materialLabel?.trim().toLowerCase() === "video"
                                        ? "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-[#1e2f23] uppercase"
                                        : "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                                    }
                                    badgeBackgroundClassName={
                                      item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#b00000]"
                                    }
                                    gapPx={8}
                                  />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </section>
                      ))
                    ) : (
                      (block.items ?? []).map((item) => (
                        <Link
                          key={`${block.contentType}-${item.href}-${item.label}`}
                          href={item.href}
                          className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                        >
                          <div className="type-body-sm flex min-w-0 items-start gap-x-3 text-[#10211a] dark:text-white">
                            {item.meta ? (
                              <span className="w-[44px] shrink-0 pt-0.5 font-menu text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                                {item.meta}
                              </span>
                            ) : null}
                            <SidebarItemTitle
                              title={item.label}
                              materialLabel={item.materialLabel}
                              className={`min-w-0 flex-1 ${wordWrapClassName}`}
                              badgeClassName={
                                item.materialLabel?.trim().toLowerCase() === "video"
                                  ? "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-[#1e2f23] uppercase"
                                  : "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                              }
                              badgeBackgroundClassName={
                                item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#b00000]"
                              }
                              gapPx={8}
                            />
                          </div>
                        </Link>
                      ))
                    )}
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
            });
          })()}
        </div>
      </aside>
    );
  }

  if (!hasSections && !hasLinks && !hasArchiveBlocks && !hasSocialLinks) {
    return null;
  }

  return (
    <aside className={`w-full box-border ${asideClassName}`}>
      {sidebar.title ? (
        <p className={`type-small font-menu ${panelPaddingX} pt-4 text-emerald-700 dark:text-emerald-300`}>{sidebar.title}</p>
      ) : null}
      {sidebar.description ? (
        <p className={`type-small ${panelPaddingX} text-zinc-600 dark:text-zinc-400 ${sidebar.title ? "mt-3" : "pt-4"}`}>{sidebar.description}</p>
      ) : null}
      {hasSections ? (
        <div className={`grid gap-4 ${panelPaddingX} ${sidebar.title || sidebar.description ? "pb-4 pt-4" : "py-5"}`}>
          {sidebar.sections?.map((section, sectionIndex) => (
            <section key={`${sidebar.slug}-section-${sectionIndex}`} className={`space-y-3 ${panelInnerWidthClassName}`}>
              {section.title || section.description ? (
                <div>
                  {section.title ? <h2 className="type-card-heading text-foreground dark:text-white">{section.title}</h2> : null}
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
                      <div className="type-body min-w-0 text-foreground dark:text-white">
                        <span className={`min-w-0 ${wordWrapClassName}`}>{item.label}</span>
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
        <div className={`${panelPaddingX} ${sidebar.title || sidebar.description ? "pt-4" : "pt-0"}`}>
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
                <div className={`type-body min-w-0 text-foreground dark:text-white ${panelInnerWidthClassName}`}>
                  <span className={`min-w-0 ${wordWrapClassName}`}>{item.label}</span>
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
        <div className={`grid gap-4 min-w-0 max-w-full ${panelPaddingX} py-5`}>
          {sidebar.archiveBlocks?.map((block, index) => {
            if (block.__component === "sidebar.tag-cloud-block") {
              return tagCloud?.length ? (
                <section
                  key={`${sidebar.slug}-archive-tag-cloud-${index}`}
                  className={`space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10 ${archiveInnerWidthClassName}`}
                >
                  <TagCloud tags={tagCloud} title={block.title ?? undefined} />
                </section>
              ) : null;
            }

            if (!isSidebarArchiveBlock(block)) {
              return null;
            }

            return (
              <section key={`${sidebar.slug}-archive-${block.__component ?? block.contentType}-${index}`} className={`space-y-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0 dark:border-white/10 ${archiveInnerWidthClassName}`}>
                {block.title || block.description ? (
                  <div>
                    {block.title ? <h2 className="font-menu text-[13px] font-bold tracking-[0.02em] text-foreground dark:text-white">{block.title}</h2> : null}
                    {block.description ? (
                      <p className={`type-small text-zinc-600 dark:text-zinc-400 ${block.title ? "mt-2" : ""}`}>{block.description}</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-4">
                  {block.categoryGroups?.length ? (
                    block.categoryGroups.map((group) => (
                      <section key={`${block.contentType}-${group.category.slug}`} className="space-y-1">
                        <h3 className="font-menu text-[13px] font-bold tracking-[0.02em] text-emerald-700 dark:text-emerald-300">
                          {group.category.name}
                        </h3>
                        <div>
                          {group.items.map((item) => (
                            <Link
                              key={`${block.contentType}-${group.category.slug}-${item.href}-${item.label}`}
                              href={item.href}
                              className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                            >
                              <div className="type-body-sm flex min-w-0 items-start gap-x-3 text-[#10211a] dark:text-white">
                                {item.meta ? (
                                  <span className="w-[44px] shrink-0 pt-0.5 font-menu text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                                    {item.meta}
                                  </span>
                                ) : null}
                                <SidebarItemTitle
                                  title={item.label}
                                  materialLabel={item.materialLabel}
                                  className={`min-w-0 flex-1 ${wordWrapClassName}`}
                                  badgeClassName={
                                    item.materialLabel?.trim().toLowerCase() === "video"
                                      ? "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-[#1e2f23] uppercase"
                                      : "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                                  }
                                  badgeBackgroundClassName={
                                    item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#b00000]"
                                  }
                                  gapPx={8}
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))
                  ) : (
                    (block.items ?? []).map((item) => (
                      <Link
                        key={`${block.contentType}-${item.href}-${item.label}`}
                        href={item.href}
                        className={`${itemClassName} hover:text-emerald-600 dark:hover:text-emerald-300`}
                      >
                        <div className="type-body-sm flex min-w-0 items-start gap-x-3 text-[#10211a] dark:text-white">
                          {item.meta ? (
                            <span className="w-[44px] shrink-0 pt-0.5 font-menu text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                              {item.meta}
                            </span>
                          ) : null}
                          <SidebarItemTitle
                            title={item.label}
                            materialLabel={item.materialLabel}
                            className={`min-w-0 flex-1 ${wordWrapClassName}`}
                            badgeClassName={
                              item.materialLabel?.trim().toLowerCase() === "video"
                                ? "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-[#1e2f23] uppercase"
                                : "inline-flex w-fit items-center rounded-[2px] px-1 py-0 font-menu !text-[11px] font-normal leading-[16px] tracking-[0.10em] text-white uppercase"
                            }
                            badgeBackgroundClassName={
                              item.materialLabel?.trim().toLowerCase() === "video" ? "bg-[#cfe95b]" : "bg-[#b00000]"
                            }
                            gapPx={8}
                          />
                        </div>
                      </Link>
                    ))
                  )}
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
          className={`mt-5 border-t border-black/10 pt-4 dark:border-white/10 ${panelPaddingX}`}
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
