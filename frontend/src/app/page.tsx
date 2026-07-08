import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import {
  CMS_API_URL,
  buildCategoryDateOverlayMeta,
  buildSeoMetadata,
  DEFAULT_OG_IMAGE,
  comparePublishedDesc,
  formatRussianDateTime,
  formatRussianTime,
  getPrimaryCategory,
  getGlobalSettings,
  getHomepage,
  getHomepageSpecialItems,
  getLatestNews,
  getNews,
  getVideos,
  getTagCloud,
  getSiteSeo,
  getSidebarForPath,
  type NewsSummary,
  withLoggedFallback,
} from "@/lib/strapi";
import { RichContent } from "@/components/rich-content";
import { DesktopSidebarSlot } from "@/components/desktop-sidebar-slot";
import Link from "next/link";
import { MobileSidebarBridge } from "@/components/mobile-sidebar-bridge";
import { HomepageSpecialVideoCarousel } from "@/components/homepage-special-video-carousel";
import { HomepageNewsSidebar, type HomepageNewsSidebarItem } from "@/components/homepage-news-sidebar";
import { SidebarPanel } from "@/components/sidebar-panel";
import { buildWebPageJsonLd } from "@/lib/json-ld";
import { homeFaqJsonLd } from "@/lib/faq-data";

export const revalidate = 120;

// #region agent log
const AGENT_DEBUG_ENDPOINT = "http://127.0.0.1:7308/ingest/e5b160b2-f1d0-4782-b6e4-70859f118b60";
const AGENT_DEBUG_SESSION_ID = "38d826";

function agentDebugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  fetch(AGENT_DEBUG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": AGENT_DEBUG_SESSION_ID },
    body: JSON.stringify({ sessionId: AGENT_DEBUG_SESSION_ID, runId: "initial", hypothesisId, location, message, data, timestamp: Date.now() }),
  }).catch(() => {});
}
// #endregion

function formatHomepageNewsDateWithMonthLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatHomepageNewsTime(value?: string | null) {
  const dateLabel = formatRussianDateTime(value)?.split(",")[0]?.trim();

  if (!dateLabel) {
    return "--.--";
  }

  return dateLabel.replace(/(?:\.\d{4}|\s+\d{4}(?:\s*г\.?)?)$/u, "").trim();
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
    image: settings?.logo?.url ?? DEFAULT_OG_IMAGE,
    type: "website",
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

type HomepageSidebarSourceItem = {
  documentId: string;
  slug: string;
  title: string;
  materialLabel?: string | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
  popularityCount: number;
  href: string;
};

function mapHomepageSidebarItem(item: HomepageSidebarSourceItem): HomepageNewsSidebarItem {
  return {
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    publishedLabel: formatHomepageNewsTime(item.publishedAtCustom ?? item.publishedAt),
    materialLabel: item.materialLabel,
    popularityCount: item.popularityCount,
    href: item.href,
  };
}

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
  const hasBackgroundMedia = Boolean(card.backgroundImage?.url || card.backgroundVideo?.url);
  const className = `relative block overflow-hidden border transition-transform hover:-translate-y-0.5 ${
    hasBackgroundMedia
      ? isDark
        ? "bg-transparent text-white"
        : "bg-transparent text-[#0d3132]"
      : infographicThemeClass(card.theme)
  }`;
  const content = (
    <>
      {renderBackgroundMedia({
        imageUrl: card.backgroundImage?.url,
        videoUrl: card.backgroundVideo?.url,
        overlayClassName: hasBackgroundMedia ? "absolute inset-0 bg-black/12" : undefined,
      })}
      <div className="relative z-10 grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-4 px-4 py-4 sm:px-5 sm:py-5">
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
    </>
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

function hasInfographicContent(card: InfographicCard | undefined) {
  if (!card) {
    return false;
  }

  return Boolean(card.title?.trim() || card.description?.trim() || card.accentText?.trim() || card.backgroundImage?.url || card.backgroundVideo?.url);
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
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex justify-start">
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
  const homeStartedAt = Date.now();
  // #region agent log
  agentDebugLog("H2,H3,H5", "frontend/src/app/page.tsx:Home:start", "Home render start", {
    revalidate,
  });
  // #endregion
  const [settings, homepage, sidebar, latestNews, latestVideos, allNews, homepageSpecial, tagCloud] = await Promise.all([
    withLoggedFallback("home global settings", () => getGlobalSettings(), null),
    withLoggedFallback("home homepage", () => getHomepage(), null),
    withLoggedFallback("home sidebar", () => getSidebarForPath("/"), null),
    withLoggedFallback("home latest news", () => getLatestNews(), []),
    withLoggedFallback("home latest videos", () => getVideos(), []),
    withLoggedFallback("home all news", () => getNews(), []),
    withLoggedFallback("home homepage special items", () => getHomepageSpecialItems(), { featureCards: [], videos: [] }),
    withLoggedFallback("home tag cloud", () => getTagCloud(), []),
  ]);
  // #region agent log
  agentDebugLog("H2,H3,H5", "frontend/src/app/page.tsx:Home:data", "Home primary data loaded", {
    durationMs: Date.now() - homeStartedAt,
    hasSettings: Boolean(settings),
    hasHomepage: Boolean(homepage),
    hasSidebar: Boolean(sidebar),
    latestNewsCount: latestNews.length,
    latestVideosCount: latestVideos.length,
    allNewsCount: allNews.length,
    homepageFeatureCards: homepageSpecial.featureCards.length,
    homepageVideos: homepageSpecial.videos.length,
    tagCloudCount: tagCloud.length,
  });
  // #endregion
  const homeJsonLd = buildWebPageJsonLd({
    title: homepage?.title ?? settings?.siteName ?? "Виноделие сегодня",
    description:
      homepage?.description ??
      settings?.siteDescription ??
      "Русскоязычный портал о вине, винодельческих регионах, новостях индустрии, событиях и редакционных материалах.",
    path: "/",
    image: settings?.logo?.url ?? DEFAULT_OG_IMAGE.url,
  });
  const desktopInfographicCards = (homepage?.infographicCardsDesktop ?? []).filter((card) => hasInfographicContent(card));
  const tabletInfographicCards = (homepage?.infographicCardsTablet ?? []).filter((card) => hasInfographicContent(card));
  const phoneInfographicCards = (homepage?.infographicCardsMobile ?? []).filter((card) => hasInfographicContent(card));
  const topRowCards = desktopInfographicCards.slice(0, 4);
  const bottomRowCards = desktopInfographicCards.slice(4, 8);
  const regularSidebar = sidebar
    ? {
        ...sidebar,
        archiveBlocks: (sidebar.archiveBlocks ?? []).filter((block) => block?.__component !== "sidebar.homepage-news-block"),
      }
    : null;
  const popularNewsBase = allNews.slice(0, 20);
  const popularityStartedAt = Date.now();
  const popularNews: HomepageNewsItem[] = (await Promise.all(
    popularNewsBase.map(async (item) => ({
      ...item,
      popularityCount: await getNewsLikeCount(item.documentId),
    })),
  ))
    .sort((left, right) => (right.popularityCount !== left.popularityCount
      ? right.popularityCount - left.popularityCount
      : comparePublishedDesc(left.publishedAtCustom ?? left.publishedAt, right.publishedAtCustom ?? right.publishedAt)))
    .slice(0, 7);
  // #region agent log
  agentDebugLog("H3,H5", "frontend/src/app/page.tsx:Home:popularity", "Home popularity requests finished", {
    baseCount: popularNewsBase.length,
    durationMs: Date.now() - popularityStartedAt,
    nonZeroCount: popularNews.filter((item) => item.popularityCount > 0).length,
  });
  // #endregion
  const latestNewsSidebarItemsSource: HomepageSidebarSourceItem[] = latestNews.slice(0, 7).map((item) => ({
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    materialLabel: item.materialLabel,
    publishedAt: item.publishedAt,
    publishedAtCustom: item.publishedAtCustom,
    popularityCount: 0,
    href: `/news/${item.slug}`,
  }));
  const latestVideosSidebarItemsSource: HomepageSidebarSourceItem[] = latestVideos.slice(0, 7).map((item) => ({
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    materialLabel: item.materialLabel ?? "video",
    publishedAt: item.publishedAt,
    publishedAtCustom: item.publishedAtCustom,
    popularityCount: 0,
    href: `/videos/${item.slug}`,
  }));
  const latestNewsSidebarItems: HomepageNewsSidebarItem[] = [...latestNewsSidebarItemsSource, ...latestVideosSidebarItemsSource]
    .sort((left, right) => comparePublishedDesc(left.publishedAtCustom ?? left.publishedAt, right.publishedAtCustom ?? right.publishedAt))
    .slice(0, 7)
    .map(mapHomepageSidebarItem);
  const popularNewsSidebarItems: HomepageNewsSidebarItem[] = popularNews.map((item) => ({
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    publishedLabel: formatHomepageNewsTime(item.publishedAtCustom ?? item.publishedAt),
    materialLabel: item.materialLabel,
    popularityCount: item.popularityCount,
    href: `/news/${item.slug}`,
  }));
  const specialLead = homepageSpecial.featureCards[0] ?? null;
  const specialSecondary = homepageSpecial.featureCards.slice(1, 3);
  const specialVideos = homepageSpecial.videos;
  const hasHomepageSpecialBlock = Boolean(specialLead || specialSecondary.length || specialVideos.length);
  const hasHomepageNewsWidget = Boolean(latestNewsSidebarItems.length || popularNewsSidebarItems.length);
  const specialLeadPublishedValue = specialLead ? (specialLead.publishedAtCustom ?? specialLead.publishedAt) : null;
  const specialLeadDate = formatHomepageNewsDateWithMonthLabel(specialLeadPublishedValue);
  const specialLeadTime = formatRussianTime(specialLeadPublishedValue);
  const specialLeadCategory = specialLead ? getPrimaryCategory(specialLead.categories) : null;
  const hasSpecialLeadMeta = Boolean(specialLeadDate || specialLeadTime || specialLeadCategory?.name);

  return (
    <main className="py-10 text-foreground max-md:pt-0 sm:px-8 lg:px-12">
      <Script id="home-webpage-jsonld" type="application/ld+json">
        {JSON.stringify(homeJsonLd)}
      </Script>
      <Script id="home-faq-jsonld" type="application/ld+json">
        {JSON.stringify(homeFaqJsonLd)}
      </Script>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 max-md:-mx-4 max-md:mt-2 max-md:w-[calc(100%+2rem)]">
        <div className="grid gap-8 px-4 max-md:pt-0 sm:px-0">
          <MobileSidebarBridge sidebar={regularSidebar} />
          <div className="min-w-0 space-y-10">
            {hasHomepageNewsWidget ? (
              <HomepageNewsSidebar latest={latestNewsSidebarItems} popular={popularNewsSidebarItems} className="xl:hidden" />
            ) : null}
            {desktopInfographicCards.length || tabletInfographicCards.length || phoneInfographicCards.length ? (
              <section className="hidden space-y-4">
                <div className="grid gap-3 md:hidden">
                  {phoneInfographicCards.map((card, index) => renderAdaptiveInfographicCard(card, `mobile-${index}`))}
                </div>

                <div className="hidden gap-4 md:grid xl:hidden md:grid-cols-2">
                  {tabletInfographicCards.map((card, index) => renderAdaptiveInfographicCard(card, `tablet-${index}`))}
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
              <section className="space-y-6 max-xl:overflow-x-hidden">
                <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                  <div className="min-w-0 space-y-6">
                    <div className="space-y-4 xl:hidden">
                      {specialLead ? (
                        <article className="mx-auto flex h-full w-full max-w-[clamp(280px,92vw,520px)] flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04] sm:max-w-none">
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                            <Link href={specialLead.href} aria-label={specialLead.title} className="block h-full">
                              {specialLead.cover?.url ? (
                                <Image
                                  src={specialLead.cover.url}
                                  alt={specialLead.cover.alternativeText ?? specialLead.title}
                                  width={720}
                                  height={450}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </Link>
                          </div>
                          <div className="p-4">
                            {hasSpecialLeadMeta ? (
                              <div className="type-meta-line mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[#4b5d63] dark:text-white/70">
                                {specialLeadDate ? <span>{specialLeadDate}</span> : null}
                                {specialLeadTime ? <span>{specialLeadTime}</span> : null}
                                {specialLeadCategory?.name ? (
                                  specialLeadCategory.slug ? (
                                    <Link href={`/categories/${specialLeadCategory.slug}`} className="transition hover:text-emerald-900 dark:hover:text-emerald-200">
                                      {specialLeadCategory.name}
                                    </Link>
                                  ) : (
                                    <span>{specialLeadCategory.name}</span>
                                  )
                                ) : null}
                              </div>
                            ) : null}
                            <h3 className="type-card-heading text-[#10211a] dark:text-white">
                              <Link href={specialLead.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">
                                {specialLead.title}
                              </Link>
                            </h3>
                          </div>
                        </article>
                      ) : null}

                      {specialSecondary.slice(0, 2).map((item) => (
                        <article key={item.documentId} className="mx-auto flex h-full w-full max-w-[clamp(280px,92vw,520px)] flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04] sm:max-w-none">
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                            <Link href={item.href} aria-label={item.title} className="block h-full">
                              {item.cover?.url ? (
                                <Image src={item.cover.url} alt={item.cover.alternativeText ?? item.title} width={720} height={450} className="h-full w-full object-cover" />
                              ) : null}
                            </Link>
                          </div>
                          <div className="p-4">
                            {(() => {
                              const category = getPrimaryCategory(item.categories);
                              const categoryName = category?.name;
                              const categorySlug = category?.slug;
                              const publishedValue = item.publishedAtCustom ?? item.publishedAt;
                              const publishedDateLabel = formatHomepageNewsDateWithMonthLabel(publishedValue);
                              const publishedTimeLabel = formatRussianTime(publishedValue);

                              if (!categoryName && !publishedDateLabel && !publishedTimeLabel) {
                                return null;
                              }

                              return (
                                <div className="type-meta-line mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[#4b5d63] dark:text-white/70">
                                  {publishedDateLabel ? <span>{publishedDateLabel}</span> : null}
                                  {publishedTimeLabel ? <span>{publishedTimeLabel}</span> : null}
                                  {categoryName ? (
                                    categorySlug ? (
                                      <Link href={`/categories/${categorySlug}`} className="transition hover:text-emerald-900 dark:hover:text-emerald-200">
                                        {categoryName}
                                      </Link>
                                    ) : (
                                      <span>{categoryName}</span>
                                    )
                                  ) : null}
                                </div>
                              );
                            })()}
                            <h3 className="type-card-heading text-[#10211a] dark:text-white"><Link href={item.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">{item.title}</Link></h3>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden gap-4 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] xl:items-stretch">
                      {specialLead ? (
                        <article className="group relative aspect-square overflow-hidden border border-emerald-950/10 shadow-[0_20px_60px_-36px_rgba(6,78,59,0.45)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 lg:h-full lg:aspect-auto">
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
                            <h2 className="type-h3 mt-4 text-white">
                              <Link href={specialLead.href} className="pointer-events-auto transition hover:text-emerald-200">
                                {specialLead.title}
                              </Link>
                            </h2>
                            {specialLead.excerpt ? (
                              <p className="type-body mt-4 hidden max-w-[60ch] text-white/85 sm:block">
                                {specialLead.excerpt}
                              </p>
                            ) : null}
                            {hasSpecialLeadMeta ? (
                              <div className="type-meta-line mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-white/78">
                                {specialLeadDate ? <span>{specialLeadDate}</span> : null}
                                {specialLeadTime ? <span>{specialLeadTime}</span> : null}
                                {specialLeadCategory?.name ? (
                                  specialLeadCategory.slug ? (
                                    <Link href={`/categories/${specialLeadCategory.slug}`} className="pointer-events-auto transition hover:text-emerald-200">
                                      {specialLeadCategory.name}
                                    </Link>
                                  ) : (
                                    <span>{specialLeadCategory.name}</span>
                                  )
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      ) : null}

                      <div className="grid gap-4 xl:h-full xl:grid-rows-2">
                        {specialSecondary.map((item) => (
                          <article key={item.documentId} className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                              <Link href={item.href} aria-label={item.title} className="block h-full">
                                {item.cover?.url ? (
                                  <Image src={item.cover.url} alt={item.cover.alternativeText ?? item.title} width={640} height={400} className="h-full w-full object-cover" />
                                ) : null}
                              </Link>
                            </div>
                            <div className="p-4">
                              {(() => {
                                const category = getPrimaryCategory(item.categories);
                                const categoryName = category?.name;
                                const categorySlug = category?.slug;
                                const publishedValue = item.publishedAtCustom ?? item.publishedAt;
                                const publishedDateLabel = formatHomepageNewsDateWithMonthLabel(publishedValue);
                                const publishedTimeLabel = formatRussianTime(publishedValue);

                                if (!categoryName && !publishedDateLabel && !publishedTimeLabel) {
                                  return null;
                                }

                                return (
                                  <div className="type-meta-line mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[#4b5d63] dark:text-white/70">
                                    {publishedDateLabel ? <span>{publishedDateLabel}</span> : null}
                                    {publishedTimeLabel ? <span>{publishedTimeLabel}</span> : null}
                                    {categoryName ? (
                                      categorySlug ? (
                                        <Link href={`/categories/${categorySlug}`} className="transition hover:text-emerald-900 dark:hover:text-emerald-200">
                                          {categoryName}
                                        </Link>
                                      ) : (
                                        <span>{categoryName}</span>
                                      )
                                    ) : null}
                                  </div>
                                );
                              })()}
                              <h3 className="type-card-heading text-[#10211a] dark:text-white"><Link href={item.href} className="transition hover:text-emerald-700 dark:hover:text-emerald-200">{item.title}</Link></h3>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    {specialVideos.length ? (
                      <div className="min-w-0 max-w-full overflow-hidden xl:contents">
                        <HomepageSpecialVideoCarousel
                          videos={specialVideos.map((video) => ({
                            documentId: video.documentId,
                            href: video.href,
                            title: video.title,
                            cover: video.cover ?? null,
                            videoUrl: video.videoUrl,
                            duration: video.duration ?? null,
                            meta: buildCategoryDateOverlayMeta(video.categories, video.publishedAt, video.publishedAtCustom),
                          }))}
                        />
                      </div>
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
        </div>

        {homepage?.blocks?.length ? (
          <section>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <div className="min-w-0">
                <RichContent blocks={homepage.blocks} />
              </div>
              <DesktopSidebarSlot>
                <SidebarPanel sidebar={regularSidebar} tagCloud={tagCloud} />
              </DesktopSidebarSlot>
            </div>
          </section>
        ) : null}

      </div>
    </main>
  );
}
