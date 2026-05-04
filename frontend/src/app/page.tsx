import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import {
  CMS_API_URL,
  SITE_URL,
  buildCategoryDateOverlayMeta,
  buildSeoMetadata,
  comparePublishedDesc,
  formatRussianDateTime,
  getGlobalSettings,
  getHomepage,
  getHomepageSpecialItems,
  getLatestNews,
  getNews,
  getSiteSeo,
  getSidebarForPath,
  type NewsSummary,
  withLoggedFallback,
} from "@/lib/strapi";
import { RichContent } from "@/components/rich-content";
import Link from "next/link";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { ArchiveOverlayMeta } from "@/components/archive-overlay-meta";
import { HomepageSpecialVideoCarousel } from "@/components/homepage-special-video-carousel";
import { HomepageNewsSidebar, type HomepageNewsSidebarItem } from "@/components/homepage-news-sidebar";

export const revalidate = 120;

function formatHomepageNewsTime(value?: string | null) {
  return formatRussianDateTime(value) ?? "--:--";
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, homepage, siteSeo] = await Promise.all([
    withLoggedFallback("home metadata global settings", () => getGlobalSettings(), null),
    withLoggedFallback("home metadata homepage", () => getHomepage(), null),
    withLoggedFallback("home metadata site seo", () => getSiteSeo(), null),
  ]);

  return buildSeoMetadata({
    title: homepage?.title ?? settings?.siteName ?? "Виноделие сегодня",
    description:
      homepage?.description ??
      settings?.siteDescription ??
      "Русскоязычный портал о вине, винодельческих регионах, новостях индустрии, событиях и редакционных материалах.",
    seo: homepage?.seo ?? null,
    siteSeo,
    path: "/",
    image: settings?.logo?.url,
  });
}

function renderBackgroundMedia(options: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  overlayClassName?: string;
  videoClassName?: string;
}) {
  if (!options.videoUrl && !options.imageUrl) {
    return null;
  }

  return (
    <>
      {options.videoUrl ? (
        <video
          className={options.videoClassName ?? "absolute inset-0 h-full w-full object-cover"}
          src={options.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : options.imageUrl ? (
        <Image
          src={options.imageUrl}
          alt=""
          fill
          sizes="100vw"
          className={options.videoClassName ?? "absolute inset-0 h-full w-full object-cover"}
        />
      ) : null}
      {options.overlayClassName ? <div className={`pointer-events-none ${options.overlayClassName}`} /> : null}
    </>
  );
}

async function getNewsLikeCount(targetDocumentId: string) {
  try {
    const query = new URLSearchParams({
      contentTypeUid: "api::news.news",
      targetDocumentId,
    });
    const response = await fetch(`${new URL(`/api/reactions/summary?${query.toString()}`, CMS_API_URL).toString()}`, {
      next: { revalidate },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data = (await response.json()) as { count?: number };
    return typeof data?.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

type HomepageNewsItem = NewsSummary & {
  popularityCount: number;
};

type InfographicSlot =
  | "topRectangle"
  | "topSquare"
  | "topStrip"
  | "bottomSquare"
  | "bottomCircle"
  ;

function infographicSlotClass(slot: InfographicSlot) {
  switch (slot) {
    case "topRectangle":
      return "min-h-[240px] aspect-[16/10] sm:min-h-[280px] xl:h-full xl:min-h-0 xl:w-full xl:aspect-auto";
    case "topSquare":
    case "bottomSquare":
      return "min-h-[220px] aspect-square sm:min-h-[280px] xl:h-full xl:min-h-0 xl:w-full xl:aspect-auto";
    case "topStrip":
      return "min-h-[110px] aspect-[16/6] sm:min-h-[132px] xl:h-full xl:min-h-0 xl:w-full xl:aspect-auto";
    case "bottomCircle":
      return "aspect-square min-h-[220px] w-full rounded-[999px] sm:min-h-[260px] xl:h-auto xl:min-h-0 xl:w-full xl:max-w-[270px]";
    default:
      return "min-h-[220px] aspect-square sm:min-h-[280px] xl:h-full xl:min-h-0 xl:w-full xl:aspect-auto";
  }
}

function infographicThemeClass(theme?: "light" | "dark" | null) {
  return theme === "dark"
    ? "border border-white/10 bg-[#081c22] text-white"
    : "border border-black/10 bg-white text-[#0d3132]";
}

type InfographicCard = {
  shape?: "square" | "rectangle" | "circle";
  title?: string | null;
  description?: string | null;
  href?: string | null;
  accentText?: string | null;
  backgroundImage?: { url: string } | null;
  backgroundVideo?: { url: string } | null;
  cornerIcon?: { url: string; alternativeText?: string | null } | null;
  theme?: "light" | "dark" | null;
};

function renderInfographicCornerIcon(card: InfographicCard, className: string) {
  if (!card.cornerIcon?.url) {
    return null;
  }

  return (
    <Image
      src={card.cornerIcon.url}
      alt={card.cornerIcon.alternativeText ?? ""}
      width={88}
      height={88}
      className={className}
    />
  );
}

function renderInfographicCardText(card: InfographicCard, options?: { titleClassName?: string; textClassName?: string }) {
  const title = card.title?.trim();
  const description = card.description?.trim();
  const accentText = card.accentText?.trim();

  if (!title && !description && !accentText) {
    return null;
  }

  return (
    <div className="min-w-0 space-y-2">
      {title ? (
        <div className={["type-h4 break-words [overflow-wrap:anywhere]", options?.titleClassName ?? ""].join(" ")}>
          {title}
        </div>
      ) : null}
      {description ? (
        <p className={["text-sm leading-[1.4] opacity-85", options?.textClassName ?? ""].join(" ")}>
          {description}
        </p>
      ) : null}
      {accentText ? (
        <p className={["text-sm leading-[1.4] opacity-85", options?.textClassName ?? ""].join(" ")}>
          {accentText}
        </p>
      ) : null}
    </div>
  );
}

function renderAdaptiveInfographicCard(card: InfographicCard | undefined, key: string) {
  if (!card) {
    return null;
  }

  const href = card.href?.trim();
  const isDark = card.theme === "dark";
  const className = `block overflow-hidden border transition-transform hover:-translate-y-0.5 ${infographicThemeClass(card.theme)}`;
  const content = (
    <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-4 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex min-h-[72px] items-center justify-center">
        {renderInfographicCornerIcon(card, "h-[72px] w-[72px] object-contain")}
      </div>
      <div className={isDark ? "text-white" : "text-[#0d3132]"}>
        {renderInfographicCardText(card, {
          titleClassName: "text-[15px] leading-5",
          textClassName: isDark ? "text-white/80" : "text-[#0d3132]/80",
        })}
      </div>
    </div>
  );

  return href ? (
    <Link key={key} href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div key={key} className={className}>
      {content}
    </div>
  );
}

function buildPhoneInfographicCards(cards: InfographicCard[]) {
  if (!cards.length) {
    return cards;
  }

  const videoCardIndex = cards.findIndex((card) => Boolean(card.backgroundVideo?.url));

  if (videoCardIndex === -1) {
    return cards;
  }

  const fallbackCard = [...cards].reverse().find((card, reverseIndex) => {
    const originalIndex = cards.length - 1 - reverseIndex;
    return originalIndex !== videoCardIndex && !card.backgroundVideo?.url;
  });

  if (!fallbackCard) {
    return cards.filter((card) => !card.backgroundVideo?.url);
  }

  return cards.map((card, index) => (index === videoCardIndex ? fallbackCard : card));
}

function renderInfographicCard(
  card: InfographicCard | undefined,
  slot: InfographicSlot,
  className: string,
  options?: { compact?: boolean; titleClassName?: string; paddingClassName?: string; slotClassName?: string },
) {
  if (!card) {
    return null;
  }

  const title = card.title?.trim();
  const href = card.href?.trim();
  const isDark = card.theme === "dark";
  const hasBackgroundMedia = Boolean(card.backgroundImage?.url || card.backgroundVideo?.url);
  const hasContent = Boolean(title || hasBackgroundMedia);

  if (!hasContent) {
    return null;
  }

  const themeClass = hasBackgroundMedia
    ? isDark
      ? "bg-transparent text-white"
      : "bg-transparent text-[#0d3132]"
    : infographicThemeClass(card.theme);
  const textClassName = isDark ? "text-white" : "text-[#0d3132]";
  const accentClassName = textClassName;
  const compact = options?.compact ?? false;
  const paddingClassName = options?.paddingClassName ?? "p-5";
  const slotClassName = options?.slotClassName ?? infographicSlotClass(slot);
  const rootClassName = `group relative block min-w-0 overflow-hidden transition-transform hover:-translate-y-0.5 ${className} ${themeClass} ${slotClassName}`;
  const content = (
    <>
      {renderBackgroundMedia({
        imageUrl: card.backgroundImage?.url,
        videoUrl: card.backgroundVideo?.url,
      })}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex justify-end">
        {renderInfographicCornerIcon(card, "h-14 w-14 object-contain xl:h-16 xl:w-16")}
      </div>
      <div
        className={`absolute inset-0 z-10 flex min-w-0 flex-col justify-end ${paddingClassName}`}
      >
        {title ? (
          <div className="min-w-0">
            <div
              className={`type-h4 w-full max-w-[11rem] break-words [overflow-wrap:anywhere] md:break-normal md:[overflow-wrap:normal] sm:max-w-[16rem] xl:max-w-[18rem] ${
                options?.titleClassName ?? ""
              } ${textClassName}`}
            >
              {title}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={rootClassName}>
      {content}
    </Link>
  ) : (
    <div className={rootClassName}>
      {content}
    </div>
  );
}

export default async function Home() {
  const [settings, homepage, sidebar, latestNews, allNews, homepageSpecial] = await Promise.all([
    withLoggedFallback("home global settings", () => getGlobalSettings(), null),
    withLoggedFallback("home homepage", () => getHomepage(), null),
    withLoggedFallback("home sidebar", () => getSidebarForPath("/"), null),
    withLoggedFallback("home latest news", () => getLatestNews(), []),
    withLoggedFallback("home all news", () => getNews(), []),
    withLoggedFallback("home homepage special items", () => getHomepageSpecialItems(), { featureCards: [], videos: [] }),
  ]);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.siteName ?? "Виноделие сегодня",
    description:
      settings?.siteDescription ??
      "Русскоязычный портал о вине, винодельческих регионах, новостях индустрии, событиях и редакционных материалах.",
    url: SITE_URL,
    logo: settings?.logo?.url,
  };
  const infographicCards = (
    homepage?.infographicCards?.filter((card) =>
      Boolean(card?.title?.trim() || card?.description?.trim() || card?.accentText?.trim() || card?.backgroundImage?.url || card?.backgroundVideo?.url),
    ) ?? []
  );
  const infographicDisplayCards = infographicCards.filter((_, index) => index !== 4 && index !== 9);
  const phoneInfographicCards = buildPhoneInfographicCards(infographicDisplayCards);
  const tabletInfographicCards = infographicDisplayCards.slice(0, Math.max(infographicDisplayCards.length - 2, 0));
  const topRowCards = infographicDisplayCards.slice(0, 4);
  const bottomRowCards = infographicDisplayCards.slice(4, 8);
  const regularSidebar = sidebar
    ? {
        ...sidebar,
        archiveBlocks: (sidebar.archiveBlocks ?? []).filter((block) => block?.__component !== "sidebar.homepage-news-block"),
      }
    : null;
  const popularNewsBase = allNews.slice(0, 20);
  const popularNews: HomepageNewsItem[] = (await Promise.all(
    popularNewsBase.map(async (item) => ({
      ...item,
      popularityCount: await getNewsLikeCount(item.documentId),
    })),
  ))
    .sort((left, right) => (right.popularityCount !== left.popularityCount
      ? right.popularityCount - left.popularityCount
      : comparePublishedDesc(left.publishedAtCustom ?? left.publishedAt, right.publishedAtCustom ?? right.publishedAt)))
    .slice(0, 10);
  const latestNewsItems: HomepageNewsItem[] = latestNews.slice(0, 10).map((item) => ({
    ...item,
    popularityCount: 0,
  }));
  const latestNewsSidebarItems: HomepageNewsSidebarItem[] = latestNewsItems.map((item) => ({
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    publishedLabel: formatHomepageNewsTime(item.publishedAtCustom ?? item.publishedAt),
    popularityCount: item.popularityCount,
  }));
  const popularNewsSidebarItems: HomepageNewsSidebarItem[] = popularNews.map((item) => ({
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    publishedLabel: formatHomepageNewsTime(item.publishedAtCustom ?? item.publishedAt),
    popularityCount: item.popularityCount,
  }));
  const specialLead = homepageSpecial.featureCards[0] ?? null;
  const specialSecondary = homepageSpecial.featureCards.slice(1, 3);
  const specialVideos = homepageSpecial.videos;
  const hasHomepageSpecialBlock = Boolean(specialLead || specialSecondary.length || specialVideos.length);
  const hasHomepageNewsWidget = Boolean(latestNewsSidebarItems.length || popularNewsSidebarItems.length);

  return (
    <main className="px-4 py-10 text-foreground max-md:pt-0 sm:px-8 lg:px-12">
      <Script id="home-organization-jsonld" type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </Script>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 max-md:-mx-4 max-md:mt-2 max-md:w-[calc(100%+2rem)]">
        <div className="grid gap-8 px-4 max-md:pt-0 sm:px-0">
          <MobileSidebarBridge sidebar={regularSidebar} />
          <div className="min-w-0 space-y-10">
            {hasHomepageNewsWidget ? (
              <HomepageNewsSidebar latest={latestNewsSidebarItems} popular={popularNewsSidebarItems} className="xl:hidden" />
            ) : null}
            {infographicCards.length ? (
              <section className="space-y-4">
                <div className="grid gap-3 max-[764px]:grid min-[765px]:hidden">
                  {phoneInfographicCards.map((card, index) => renderAdaptiveInfographicCard(card, `phone-infographic-${index}`))}
                </div>

                <div className="hidden gap-4 min-[765px]:grid min-[765px]:grid-cols-2 xl:hidden">
                  {tabletInfographicCards.map((card, index) => renderAdaptiveInfographicCard(card, `tablet-infographic-${index}`))}
                </div>

                <div className="hidden gap-4 xl:grid xl:grid-cols-4 xl:auto-rows-[clamp(11rem,18vw,20rem)] xl:w-full">
                  {topRowCards[0] ? (
                    <div className="col-span-2 row-start-1 h-full">
                      {renderInfographicCard(topRowCards[0], "topRectangle", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[18ch]",
                      })}
                    </div>
                  ) : null}

                  {topRowCards[1] ? (
                    <div className="col-span-1 row-start-1 h-full">
                      {renderInfographicCard(topRowCards[1], "topSquare", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[14ch]",
                      })}
                    </div>
                  ) : null}

                  {topRowCards[2] || topRowCards[3] ? (
                    <div className="col-span-1 row-start-1 grid h-full gap-4 grid-rows-2">
                      {topRowCards[2] ? renderInfographicCard(topRowCards[2], "topStrip", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[18ch]",
                      }) : null}
                      {topRowCards[3] ? renderInfographicCard(topRowCards[3], "topStrip", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[18ch]",
                      }) : null}
                    </div>
                  ) : null}

                  {bottomRowCards[0] ? (
                    <div className="col-span-1 row-start-2 h-full">
                      {renderInfographicCard(bottomRowCards[0], "bottomSquare", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[14ch]",
                      })}
                    </div>
                  ) : null}

                  {bottomRowCards[1] ? (
                    <div className="col-span-1 row-start-2 h-full">
                      {renderInfographicCard(bottomRowCards[1], "bottomSquare", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[14ch]",
                      })}
                    </div>
                  ) : null}

                  {bottomRowCards[2] ? (
                    <div className="col-span-1 row-start-2 flex h-full items-center justify-center">
                      {renderInfographicCard(bottomRowCards[2], "bottomCircle", "h-full w-full", {
                        compact: true,
                        titleClassName: "max-w-[14ch] text-center",
                      })}
                    </div>
                  ) : null}

                  {bottomRowCards[3] ? (
                    <div className="col-span-1 row-start-2 h-full">
                      {renderInfographicCard(bottomRowCards[3], "bottomSquare", "h-full", {
                        compact: true,
                        titleClassName: "max-w-[14ch]",
                      })}
                    </div>
                  ) : null}

                </div>
              </section>
            ) : null}

            {hasHomepageSpecialBlock ? (
              <section className="space-y-6 border border-black/8 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,248,247,0.98))] p-5 shadow-[0_24px_80px_-40px_rgba(6,78,59,0.38)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.16),_transparent_32%),linear-gradient(180deg,rgba(8,22,35,0.96),rgba(7,18,29,0.98))] sm:p-6 xl:p-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                  <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] lg:items-stretch">
                      {specialLead ? (
                        <article className="group relative aspect-square overflow-hidden border border-emerald-950/10 bg-black shadow-[0_20px_60px_-36px_rgba(6,78,59,0.45)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 lg:h-full lg:aspect-auto">
                          <div className="absolute inset-0 overflow-hidden">
                            <Link href={specialLead.href} aria-label={specialLead.title} className="block h-full">
                              {specialLead.cover?.url ? (
                                <Image
                                  src={specialLead.cover.url}
                                  alt={specialLead.cover.alternativeText ?? specialLead.title}
                                  width={960}
                                  height={960}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(28,55,40,0.5),_rgba(0,0,0,0.96))]" />
                              )}
                            </Link>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                            </div>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-6">
                            <ArchiveOverlayMeta itemId={specialLead.documentId} meta={buildCategoryDateOverlayMeta(specialLead.categories, specialLead.publishedAt, specialLead.publishedAtCustom)} />
                            <h2 className="type-h2 mt-4 text-white"><Link href={specialLead.href} className="pointer-events-auto transition hover:text-emerald-200">{specialLead.title}</Link></h2>
                            {specialLead.excerpt ? <p className="type-body mt-4 hidden max-w-[44ch] leading-[1.4] text-white/85 md:block">{specialLead.excerpt}</p> : null}
                          </div>
                        </article>
                      ) : null}

                      <div className="grid gap-4 lg:h-full lg:grid-rows-2">
                        {specialSecondary.map((item) => (
                          <article key={item.documentId} className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                              <Link href={item.href} aria-label={item.title} className="block h-full">
                                {item.cover?.url ? (
                                  <Image src={item.cover.url} alt={item.cover.alternativeText ?? item.title} width={640} height={360} className="h-full w-full object-cover" />
                                ) : null}
                              </Link>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                                <ArchiveOverlayMeta itemId={item.documentId} meta={buildCategoryDateOverlayMeta(item.categories, item.publishedAt, item.publishedAtCustom)} />
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="type-h4 text-[15px] leading-5 text-[#0d3132] dark:text-white"><Link href={item.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">{item.title}</Link></h3>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    {specialVideos.length ? (
                      <HomepageSpecialVideoCarousel
                        videos={specialVideos.map((video) => ({
                          documentId: video.documentId,
                          href: video.href,
                          title: video.title,
                          cover: video.cover ?? null,
                          videoUrl: video.videoUrl,
                          meta: buildCategoryDateOverlayMeta(video.categories, video.publishedAt, video.publishedAtCustom),
                        }))}
                      />
                    ) : null}
                  </div>

                  {hasHomepageNewsWidget ? (
                    <div className="hidden xl:block">
                      <HomepageNewsSidebar latest={latestNewsSidebarItems} popular={popularNewsSidebarItems} />
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

          </div>

          {homepage?.blocks?.length ? (
            <section className="border border-black/8 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,248,247,0.98))] p-5 shadow-[0_24px_80px_-40px_rgba(6,78,59,0.38)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.16),_transparent_32%),linear-gradient(180deg,rgba(8,22,35,0.96),rgba(7,18,29,0.98))] sm:p-6 xl:p-8">
              <div className="min-w-0">
                <RichContent blocks={homepage.blocks} />
              </div>
            </section>
          ) : null}
        </div>

      </div>
    </main>
  );
}
