import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { cache } from "react";

export const SITE_URL = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1";
const CMS_URL = process.env.CMS_URL ?? "http://localhost:1337";
const MEDIA_URL = process.env.MEDIA_URL ?? new URL("/uploads/", SITE_URL).toString();
export const CMS_API_URL = CMS_URL;
const HAS_REVALIDATE_SECRET = Boolean(process.env.REVALIDATE_SECRET);

function normalizeSiteOrigin(value?: string | null, fallback = SITE_URL) {
  const candidate = value?.trim() || fallback;

  try {
    const parsed = new URL(candidate);
    return parsed.origin;
  } catch {
    const normalizedCandidate = candidate.replace(/^\/+/, "");
    const protocol = /^(localhost|127(?:\.\d{1,3}){3})(:\d+)?(?:$|\/)/i.test(normalizedCandidate) ? "http://" : "https://";
    return new URL(`${protocol}${normalizedCandidate}`).origin;
  }
}

function resolveMediaUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "").replace(/^uploads\//, "");
  return new URL(normalizedPath, `${MEDIA_URL.replace(/\/+$/, "")}/`).toString();
}

const DEFAULT_REVALIDATE_SECONDS = 300;
const SETTINGS_REVALIDATE_SECONDS = 300;
const HOMEPAGE_REVALIDATE_SECONDS = 120;
const PREVIEW_PATH_COOKIE = "nvt-preview-path";
const CATEGORY_FIELDS_QUERY = [
  "populate[0]=categories",
  "populate[categories][fields][0]=name",
  "populate[categories][fields][1]=slug",
].join("&");
const CONTENT_POPULATE_QUERY = [
  "populate[content][populate]=*",
  "populate[content][on][blocks.archive-feed]=true",
  "populate[content][on][blocks.cta][populate][link]=true",
  "populate[content][on][blocks.embed]=true",
  "populate[content][on][blocks.html-editor]=true",
  "populate[content][on][blocks.image-gallery][populate][images]=true",
  "populate[content][on][blocks.image-slider][populate][images]=true",
  "populate[content][on][blocks.link-grid][populate][links]=true",
  "populate[content][on][blocks.rich-text]=true",
  "populate[content][on][blocks.quote]=true",
  "populate[content][on][blocks.image-highlight][populate][image]=true",
  "populate[content][on][blocks.hero][populate][backgroundImage]=true",
  "populate[content][on][blocks.hero][populate][backgroundVideo]=true",
  "populate[sources]=true",
].join("&");

const VIDEO_CONTENT_POPULATE_QUERY = [
  "populate[content][populate]=*",
  "populate[content][on][blocks.archive-feed]=true",
  "populate[content][on][blocks.cta][populate][link]=true",
  "populate[content][on][blocks.embed]=true",
  "populate[content][on][blocks.html-editor]=true",
  "populate[content][on][blocks.image-gallery][populate][images]=true",
  "populate[content][on][blocks.image-slider][populate][images]=true",
  "populate[content][on][blocks.link-grid][populate][links]=true",
  "populate[content][on][blocks.rich-text]=true",
  "populate[content][on][blocks.quote]=true",
  "populate[content][on][blocks.image-highlight][populate][image]=true",
  "populate[content][on][blocks.hero][populate][backgroundImage]=true",
  "populate[content][on][blocks.hero][populate][backgroundVideo]=true",
].join("&");

const HOMEPAGE_BLOCKS_POPULATE_QUERY = [
  "populate[blocks]=true",
  "populate[blocks][on][blocks.archive-feed]=true",
  "populate[blocks][on][blocks.cta][populate][link]=true",
  "populate[blocks][on][blocks.embed]=true",
  "populate[blocks][on][blocks.html-editor]=true",
  "populate[blocks][on][blocks.image-gallery][populate][images]=true",
  "populate[blocks][on][blocks.image-slider][populate][images]=true",
  "populate[blocks][on][blocks.link-grid][populate][links]=true",
  "populate[blocks][on][blocks.rich-text]=true",
  "populate[blocks][on][blocks.quote]=true",
  "populate[blocks][on][blocks.image-highlight][populate][image]=true",
  "populate[blocks][on][blocks.hero][populate][backgroundImage]=true",
  "populate[blocks][on][blocks.hero][populate][backgroundVideo]=true",
].join("&");

const SITE_HEADER_POPULATE_QUERY = [
  "populate[lightLogo]=true",
  "populate[darkLogo]=true",
  "populate[top][populate][items][populate][children]=true",
  "populate[top][populate][items][populate][image]=true",
  "populate[top][populate][items][populate][socialLinks][populate][links][populate][icon]=true",
  "populate[middle][populate][items][populate][children]=true",
  "populate[middle][populate][items][populate][image]=true",
  "populate[middle][populate][items][populate][socialLinks][populate][links][populate][icon]=true",
  "populate[bottom][populate][items][populate][children]=true",
  "populate[bottom][populate][items][populate][image]=true",
  "populate[bottom][populate][items][populate][socialLinks][populate][links][populate][icon]=true",
  "populate[mobile][populate][items][populate][children]=true",
  "populate[mobile][populate][items][populate][image]=true",
  "populate[mobile][populate][items][populate][socialLinks][populate][links][populate][icon]=true",
  "populate[mobileMenuSections][populate][links]=true",
].join("&");

type StrapiMediaFormat = {
  url: string;
};

type StrapiMedia = {
  url: string;
  alternativeText?: string | null;
  formats?: {
    medium?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    thumbnail?: StrapiMediaFormat;
  } | null;
};

export type MediaAsset = StrapiMedia;

export type SourceLink = {
  name: string;
  url?: string | null;
};

type StrapiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type RichTextNode =
  | {
      type: "text";
      text?: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      code?: boolean;
    }
  | {
      type: "link";
      url?: string;
      children?: RichTextNode[];
    }
  | {
      type: "paragraph" | "quote" | "list-item";
      children?: RichTextNode[];
    }
  | {
      type: "heading";
      level?: 1 | 2 | 3 | 4 | 5 | 6;
      children?: RichTextNode[];
    }
  | {
      type: "list";
      format?: "ordered" | "unordered";
      children?: RichTextNode[];
    }
  | {
      type: "code";
      children?: RichTextNode[];
    }
  | {
      type: "image";
      image?: MediaAsset | null;
      children?: RichTextNode[];
    };

export type RichTextContent = RichTextNode[];

export type StrapiBlock =
  | {
      __component: "blocks.hero";
      id: number;
      eyebrow?: string | null;
      title: string;
      description?: string | null;
      backgroundImage?: StrapiMedia | null;
      backgroundVideo?: StrapiMedia | null;
      theme?: "light" | "dark" | null;
    }
  | {
      __component: "blocks.archive-feed";
      id: number;
      title?: string | null;
      description?: string | null;
      contentType: SidebarArchiveContentType;
      categories?: CategorySummaryList | null;
      limit?: number | null;
    }
  | {
      __component: "blocks.cta";
      id: number;
      eyebrow?: string | null;
      title: string;
      description?: string | null;
      link?: NavigationLink | null;
      theme?: "light" | "dark" | null;
    }
  | {
      __component: "blocks.embed";
      id: number;
      title?: string | null;
      html?: string | null;
    }
  | {
      __component: "blocks.html-editor";
      id: number;
      title?: string | null;
      content?: Record<string, unknown> | string | null;
    }
  | {
      __component: "blocks.image-gallery";
      id: number;
      title?: string | null;
      description?: string | null;
      images?: StrapiMedia[] | null;
    }
  | {
      __component: "blocks.image-slider";
      id: number;
      title?: string | null;
      description?: string | null;
      images?: StrapiMedia[] | null;
    }
  | {
      __component: "blocks.link-grid";
      id: number;
      title?: string | null;
      description?: string | null;
      links?: NavigationLink[] | null;
    }
  | {
      __component: "blocks.rich-text";
      id: number;
      title?: string | null;
      content: RichTextContent | string;
    }
  | {
      __component: "blocks.quote";
      id: number;
      text: string;
      author?: string | null;
      role?: string | null;
    }
  | {
      __component: "blocks.image-highlight";
      id: number;
      caption?: string | null;
      credit?: string | null;
      image: StrapiMedia;
    };

export type GlobalSettings = {
  siteName: string;
  siteDescription: string;
  tickerText?: string | null;
  logo?: StrapiMedia | null;
  typography?: TypographySettings | null;
  mobileBottomNav?: MobileBottomNavItem[] | null;
  socialLinks?: SocialLinksBlock | null;
};

export type SiteSeoSettings = {
  siteUrl?: string | null;
  defaultSeo?: SeoFields | null;
  openGraphImage?: MediaAsset | null;
  twitterImage?: MediaAsset | null;
  robotsEnabled?: boolean | null;
  robotsRules?: RobotsRule[] | null;
  robotsAdditionalSitemaps?: string | null;
  robotsHost?: string | null;
  sitemapEnabled?: boolean | null;
  sitemapIncludeArticles?: boolean | null;
  sitemapIncludeNews?: boolean | null;
  sitemapIncludeVideos?: boolean | null;
  sitemapIncludePages?: boolean | null;
  sitemapExcludePaths?: string | null;
};

export type TypographyFontFamily =
  | "inter"
  | "oswald"
  | "tt-norms-regular"
  | "tt-norms-normal"
  | "tt-norms-medium"
  | "tt-norms-light"
  | "tt-norms-extra-light"
  | "tt-norms-thin"
  | "tt-norms-bold"
  | "tt-norms-extra-bold"
  | "tt-norms-black"
  | "tt-norms-extra-black"
  | "system-sans"
  | "system-serif";

export type TypographyStyle = {
  fontFamily?: TypographyFontFamily | null;
  fontSize?: string | null;
  mobileFontSize?: string | null;
  fontWeight?: string | null;
  lineHeight?: string | null;
  mobileLineHeight?: string | null;
  letterSpacing?: string | null;
  mobileLetterSpacing?: string | null;
  textTransform?: "none" | "uppercase" | null;
};

export type TypographySettings = {
  menu?: TypographyStyle | null;
  body?: TypographyStyle | null;
  hero?: TypographyStyle | null;
  heroEyebrow?: TypographyStyle | null;
  h1?: TypographyStyle | null;
  h2?: TypographyStyle | null;
  h3?: TypographyStyle | null;
  h4?: TypographyStyle | null;
  small?: TypographyStyle | null;
  caption?: TypographyStyle | null;
  button?: TypographyStyle | null;
};

export type RouteTarget = {
  id?: number;
  path: string;
  exactMatch?: boolean | null;
};

export type HeaderLink = {
  id?: number;
  kind: "link" | "logo" | "menu-toggle" | "search" | "theme-toggle" | "account" | "ticker" | "socials";
  label?: string | null;
  href?: string | null;
  children?: NavigationLink[] | null;
  text?: string | null;
  image?: StrapiMedia | null;
  socialLinks?: SocialLinksBlock | null;
  enabled?: boolean | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  activeTextColor?: string | null;
  activeBackgroundColor?: string | null;
};

export type HeaderGroup = {
  id?: number;
  title?: string | null;
  position?: "left" | "center" | "right" | null;
  enabled?: boolean | null;
  titleColor?: string | null;
  backgroundColor?: string | null;
  items?: HeaderLink[] | null;
};

export type SiteHeaderSettings = {
  backgroundColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  topBackgroundColor?: string | null;
  topPinned?: boolean | null;
  topOpacity?: number | null;
  topHeight?: number | null;
  middleBackgroundColor?: string | null;
  middlePinned?: boolean | null;
  middleOpacity?: number | null;
  middleHeight?: number | null;
  bottomBackgroundColor?: string | null;
  bottomPinned?: boolean | null;
  bottomOpacity?: number | null;
  bottomHeight?: number | null;
  mobileBackgroundColor?: string | null;
  mobileTextColor?: string | null;
  mobileBorderColor?: string | null;
  mobileOpacity?: number | null;
  mobileHeight?: number | null;
  lightLogo?: StrapiMedia | null;
  darkLogo?: StrapiMedia | null;
  top?: HeaderGroup[] | null;
  middle?: HeaderGroup[] | null;
  bottom?: HeaderGroup[] | null;
  mobile?: HeaderGroup[] | null;
  mobileMenuSections?: NavigationSection[] | null;
};

export type SiteFooterSettings = {
  bottomBarText?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  bottomBarBackgroundColor?: string | null;
  bottomBarTextColor?: string | null;
  column1?: FooterColumn | null;
  column2?: FooterColumn | null;
  column3?: FooterColumn | null;
  column4?: FooterColumn | null;
};

export type SidebarEntry = {
  documentId: string;
  title: string;
  slug: string;
  description?: string | null;
  paths?: RouteTarget[] | null;
  links?: NavigationLink[] | null;
  sections?: NavigationSection[] | null;
  archiveBlocks?: (SidebarArchiveBlock | SidebarTagCloudBlock | SidebarHomepageNewsBlock)[] | null;
  socialLinks?: SocialLinksBlock | null;
};

export type SocialLinkItem = {
  id?: number;
  label?: string | null;
  href?: string | null;
  icon?: MediaAsset | null;
};

export type SocialLinksBlock = {
  id?: number;
  title?: string | null;
  links?: SocialLinkItem[] | null;
};

export type TagCloudItem = {
  name: string;
  slug: string;
  count: number;
  articles?: Array<{ slug: string }> | null;
  news_items?: Array<{ slug: string }> | null;
  videos?: Array<{ slug: string }> | null;
};

export type SidebarArchiveContentType = "articles" | "news" | "videos";

export type SidebarArchiveItem = {
  label: string;
  href: string;
  meta?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type SidebarArchiveBlock = {
  __component?: "sidebar.archive-block";
  id?: number;
  title?: string | null;
  description?: string | null;
  contentType: SidebarArchiveContentType;
  categories?: CategorySummaryList | null;
  limit?: number | null;
  items?: SidebarArchiveItem[] | null;
  archiveHref?: string;
  archiveLabel?: string;
};

export type SidebarHomepageNewsBlock = {
  __component?: "sidebar.homepage-news-block";
  id?: number;
  title?: string | null;
  description?: string | null;
  limit?: number | null;
};

export type SidebarTagCloudBlock = {
  __component?: "sidebar.tag-cloud-block";
  id?: number;
  title?: string | null;
};

export type ArchiveSettings = {
  enableCardEffects?: boolean | null;
};

export type SeoFields = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: StrapiMedia | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

export type OverlayMetaValue = string | { label: string; href?: string | null };

export type RobotsRule = {
  id?: number;
  userAgent: string;
  allow?: string | null;
  disallow?: string | null;
  crawlDelay?: number | null;
};

export type NavigationLink = {
  id?: number;
  kind?: "link" | "account" | null;
  label: string;
  href?: string | null;
  description?: string | null;
};

export type MobileBottomNavItem = {
  id?: number;
  label: string;
  href?: string | null;
  description?: string | null;
  icon?: "home" | "articles" | "news" | "videos" | "search" | "sidebar" | "menu" | "sections" | "profile" | null;
  opensSidebar?: boolean | null;
};

export type NavigationSection = {
  id?: number;
  title: string;
  href?: string | null;
  description?: string | null;
  links?: NavigationLink[] | null;
};

export type FooterColumn = {
  title?: string | null;
  items?: FooterItem[] | null;
};

export type FooterItem = {
  kind: "text" | "link" | "tagCloud" | "image" | "phone" | "email" | "address" | "socials" | "account";
  label?: string | null;
  text?: string | null;
  href?: string | null;
  iconLabel?: string | null;
  image?: MediaAsset | null;
  socialLinks?: SocialLinksBlock | null;
};

export type AuthorSummary = {
  name: string;
  slug: string;
  position?: string | null;
};

export type CategorySummary = {
  name: string;
  slug?: string | null;
};

export type CategorySummaryList = Array<CategorySummary | null>;

export function getPrimaryCategory(categories?: CategorySummaryList | null) {
  return categories?.find((category): category is CategorySummary => Boolean(category?.name?.trim())) ?? null;
}

export function getPrimaryCategoryName(categories?: CategorySummaryList | null) {
  const categoryName = getPrimaryCategory(categories)?.name?.trim();

  return categoryName || null;
}

export type TagSummary = {
  name: string;
  slug: string;
};

export type ArticleSummary = {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  readingTime?: number | null;
  featured?: boolean | null;
  pinned?: boolean | null;
  homepageLead?: boolean | null;
  homepageSpecialBlock?: boolean | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
  cover?: StrapiMedia | null;
  author?: AuthorSummary | null;
  categories?: CategorySummaryList | null;
  tags?: TagSummary[] | null;
};

export type ArticleDetail = ArticleSummary & {
  content?: StrapiBlock[] | null;
  sources?: SourceLink[] | null;
  coverSource?: string | null;
  seo?: SeoFields | null;
};

export type NewsSummary = {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  featured?: boolean | null;
  pinned?: boolean | null;
  homepageLead?: boolean | null;
  homepageSpecialBlock?: boolean | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
  cover?: StrapiMedia | null;
  author?: AuthorSummary | null;
  sourceName?: string | null;
  categories?: CategorySummaryList | null;
  tags?: TagSummary[] | null;
};

export type NewsDetail = NewsSummary & {
  content?: StrapiBlock[] | null;
  sources?: SourceLink[] | null;
  coverSource?: string | null;
  sourceUrl?: string | null;
  seo?: SeoFields | null;
};

export type VideoSummary = {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  cover?: StrapiMedia | null;
  videoUrl: string;
  duration?: number | null;
  pinned?: boolean | null;
  homepageLead?: boolean | null;
  homepageSpecialBlock?: boolean | null;
  author?: AuthorSummary | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
  categories?: CategorySummaryList | null;
  tags?: TagSummary[] | null;
  content?: StrapiBlock[] | null;
  coverSource?: string | null;
  seo?: SeoFields | null;
};

export type CommunitySettings = {
  allowGuestComments?: boolean | null;
  commentModerationEnabled?: boolean | null;
  commentBlockedMessage?: string | null;
  commentMaxLength?: number | null;
  shareNetworks?: CommunityShareNetwork[] | null;
};

export type CommunityShareNetwork = {
  label: string;
  networkKey: string;
  shareUrlTemplate: string;
  icon?: MediaAsset | null;
  enabled?: boolean | null;
};

export type CommunityComment = {
  id: number;
  contentTypeUid: string;
  targetDocumentId: string;
  targetSlug?: string | null;
  body: string;
  status?: "pending" | "approved" | "rejected" | "spam" | null;
  guestName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  authorUser?: {
    id: number;
    username?: string | null;
  } | null;
};

export type ReactionSummary = {
  count: number;
  liked: boolean;
};

type StrapiTagEntry = {
  name: string;
  slug: string;
  seo?: SeoFields | null;
  articles?: Array<{ slug: string }> | null;
  news_items?: Array<{ slug: string }> | null;
  videos?: Array<{ slug: string }> | null;
};

type StrapiTagPageEntry = {
  name: string;
  slug: string;
  seo?: SeoFields | null;
  articles?: ArticleSummary[] | null;
  news_items?: NewsSummary[] | null;
  videos?: VideoSummary[] | null;
};

type StrapiCategoryAssignmentEntry = {
  name: string;
  slug: string;
  articles?: Array<{ slug?: string | null }> | null;
  news_items?: Array<{ slug?: string | null }> | null;
  videos?: Array<{ slug?: string | null }> | null;
};

export type TagPageData = {
  name: string;
  slug: string;
  seo?: SeoFields | null;
  items: Array<{
    kind: "article" | "news" | "video";
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    href: string;
    meta?: string | null;
    cover?: StrapiMedia | null;
    publishedAt?: string | null;
    publishedAtCustom?: string | null;
    categories?: CategorySummaryList | null;
  }>;
};

type ArchiveSortable = {
  homepageLead?: boolean | null;
  pinned?: boolean | null;
};

type PublishedSortable = {
  documentId?: string | null;
  slug?: string | null;
  title?: string | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
};

function getEffectivePublishedAt<T extends PublishedSortable>(item: T) {
  return item.publishedAtCustom ?? item.publishedAt ?? null;
}

function getStablePublishedOrderKey<T extends PublishedSortable>(item: T) {
  return item.documentId ?? item.slug ?? item.title ?? "";
}

function sortPublishedItems<T extends PublishedSortable>(items: T[]) {
  return [...items].sort((left, right) => {
    const publishedComparison = comparePublishedDesc(getEffectivePublishedAt(left), getEffectivePublishedAt(right));

    if (publishedComparison !== 0) {
      return publishedComparison;
    }

    return getStablePublishedOrderKey(left).localeCompare(getStablePublishedOrderKey(right), "ru");
  });
}

function sortArchiveItems<T extends ArchiveSortable & PublishedSortable>(items: T[]) {
  const sortedItems = sortPublishedItems(items);
  const leadItems = sortedItems.filter((item) => item.homepageLead);
  const pinnedItems = sortedItems.filter((item) => !item.homepageLead && item.pinned);
  const regularItems = sortedItems.filter((item) => !item.homepageLead && !item.pinned);

  return {
    leadItem: leadItems[0] ?? null,
    pinnedItems,
    regularItems,
    orderedItems: [...leadItems.slice(0, 1), ...pinnedItems, ...regularItems],
  };
}

function filterItemsBySelectedCategories<
  T extends { categories?: CategorySummaryList | null },
>(items: T[], selectedCategories?: CategorySummaryList | null) {
  const selectedSlugs = new Set(
    (selectedCategories ?? [])
      .map((category) => category?.slug?.trim())
      .filter((slug): slug is string => Boolean(slug)),
  );

  if (!selectedSlugs.size) {
    return items;
  }

  return items.filter((item) =>
    (item.categories ?? []).some((category) => category?.slug && selectedSlugs.has(category.slug)),
  );
}

export { getEffectivePublishedAt, sortArchiveItems, sortPublishedItems };

function formatSidebarDate(value?: string | null) {
  return formatRussianDateTime(value);
}

function formatDateKeyInTimeZone(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatRussianTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function comparePublishedDesc(left?: string | null, right?: string | null) {
  return new Date(right ?? 0).getTime() - new Date(left ?? 0).getTime();
}

function formatSidebarEventDate(startValue?: string | null, endValue?: string | null) {
  const startLabel = formatRussianDateTime(startValue);
  const endLabel = formatRussianDateTime(endValue);

  if (!startLabel) {
    return null;
  }

  if (!endLabel || startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
}

async function resolveSidebarArchiveBlock(block: SidebarArchiveBlock): Promise<SidebarArchiveBlock> {
  const limit = Math.min(Math.max(block.limit ?? 5, 1), 12);

  switch (block.contentType) {
    case "articles": {
      const items = filterItemsBySelectedCategories(await getFeaturedArticles(), block.categories)
        .sort((left, right) => comparePublishedDesc(getEffectivePublishedAt(left), getEffectivePublishedAt(right)) || getStablePublishedOrderKey(left).localeCompare(getStablePublishedOrderKey(right), "ru"))
        .slice(0, limit)
        .map((item) => ({
        label: item.title,
        href: `/articles/${item.slug}`,
        meta: formatSidebarDate(item.publishedAtCustom ?? item.publishedAt),
        description: item.excerpt,
        imageUrl: item.cover?.url ?? null,
        imageAlt: item.cover?.alternativeText ?? item.title,
      }));

      return {
        ...block,
        items,
        archiveHref: "/articles",
        archiveLabel: "Все статьи",
      };
    }
    case "news": {
      const items = filterItemsBySelectedCategories(await getLatestNews(), block.categories)
        .sort((left, right) => comparePublishedDesc(getEffectivePublishedAt(left), getEffectivePublishedAt(right)) || getStablePublishedOrderKey(left).localeCompare(getStablePublishedOrderKey(right), "ru"))
        .slice(0, limit)
        .map((item) => ({
        label: item.title,
        href: `/news/${item.slug}`,
        meta: formatSidebarDate(item.publishedAtCustom ?? item.publishedAt),
        description: item.excerpt,
        imageUrl: item.cover?.url ?? null,
        imageAlt: item.cover?.alternativeText ?? item.title,
      }));

      return {
        ...block,
        items,
        archiveHref: "/news",
        archiveLabel: "Все новости",
      };
    }
    case "videos": {
      const items = filterItemsBySelectedCategories(await getVideos(), block.categories)
        .sort((left, right) => comparePublishedDesc(getEffectivePublishedAt(left), getEffectivePublishedAt(right)) || getStablePublishedOrderKey(left).localeCompare(getStablePublishedOrderKey(right), "ru"))
        .slice(0, limit)
        .map((item) => ({
        label: item.title,
        href: `/videos/${item.slug}`,
        meta: formatSidebarDate(item.publishedAtCustom ?? item.publishedAt),
        description: item.excerpt,
        imageUrl: item.cover?.url ?? null,
        imageAlt: item.cover?.alternativeText ?? item.title,
      }));

      return {
        ...block,
        items,
        archiveHref: "/videos",
        archiveLabel: "Все видео",
      };
    }
    default:
      return block;
  }
}

async function enrichSidebar(sidebar: SidebarEntry): Promise<SidebarEntry> {
  if (!sidebar.archiveBlocks?.length) {
    return sidebar;
  }

  const validArchiveBlocks = sidebar.archiveBlocks.filter((block) => {
    if (block) {
      return true;
    }

    console.warn(`[strapi] sidebar ${sidebar.slug} contains an empty archive block entry`);
    return false;
  });

  if (!validArchiveBlocks.length) {
    return {
      ...sidebar,
      archiveBlocks: [],
    };
  }

  const archiveBlocks = await Promise.all(
    validArchiveBlocks.map((block) =>
      block.__component === "sidebar.archive-block" ? resolveSidebarArchiveBlock(block) : block,
    ),
  );

  return {
    ...sidebar,
    archiveBlocks,
  };
}

export type PageEntry = {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  showInFooter?: boolean | null;
  content?: StrapiBlock[] | null;
  seo?: SeoFields | null;
};

export function buildCategoryDateOverlayMeta(
  categories?: CategorySummaryList | null,
  publishedAt?: string | null,
  publishedAtCustom?: string | null,
) {
  void publishedAt;
  void publishedAtCustom;
  const primaryCategory = getPrimaryCategory(categories);
  const items: Array<OverlayMetaValue | null> = [
    primaryCategory ? { label: primaryCategory.name, href: primaryCategory.slug ? `/categories/${primaryCategory.slug}` : null } : null,
  ];

  return items.filter((value): value is OverlayMetaValue => value !== null);
}

export type HomepageEntry = {
  title: string;
  description?: string | null;
  infographicTitle?: string | null;
  infographicDescription?: string | null;
  infographicCards?: {
    id?: number;
    shape: "square" | "rectangle" | "circle";
    title: string;
    description?: string | null;
    href?: string | null;
    accentText?: string | null;
    backgroundImage?: StrapiMedia | null;
    backgroundVideo?: StrapiMedia | null;
    theme?: "light" | "dark" | null;
  }[] | null;
  blocks?: StrapiBlock[] | null;
  seo?: SeoFields | null;
};

export type HomepageSpecialCard = {
  kind: "article" | "news" | "video";
  documentId: string;
  title: string;
  slug: string;
  href: string;
  excerpt?: string | null;
  cover?: StrapiMedia | null;
  videoUrl?: string | null;
  publishedAt?: string | null;
  publishedAtCustom?: string | null;
  categories?: CategorySummaryList | null;
};

function normalizeBlocks(blocks?: StrapiBlock[] | null) {
  if (!blocks?.length) {
    return blocks ?? null;
  }

  return blocks.map((block) => {
    if (block.__component === "blocks.image-highlight") {
      return {
        ...block,
        image: {
          ...block.image,
          url: normalizeUrl(block.image.url) ?? block.image.url,
          formats: block.image.formats
            ? {
                medium: block.image.formats.medium
                  ? { url: normalizeUrl(block.image.formats.medium.url) ?? block.image.formats.medium.url }
                  : undefined,
                small: block.image.formats.small
                  ? { url: normalizeUrl(block.image.formats.small.url) ?? block.image.formats.small.url }
                  : undefined,
                thumbnail: block.image.formats.thumbnail
                  ? {
                      url:
                        normalizeUrl(block.image.formats.thumbnail.url) ??
                        block.image.formats.thumbnail.url,
                    }
                  : undefined,
              }
            : null,
        },
      };
    }

    if (block.__component === "blocks.image-gallery" || block.__component === "blocks.image-slider") {
      const images = (block.images ?? []).reduce<StrapiMedia[]>((accumulator, image) => {
        const normalized = normalizeMediaAsset(image);

        if (normalized) {
          accumulator.push(normalized);
        }

        return accumulator;
      }, []);

      return {
        ...block,
        images: images.length ? images : null,
      };
    }

    if (block.__component === "blocks.hero") {
      return {
        ...block,
        backgroundImage: block.backgroundImage
          ? {
              ...block.backgroundImage,
              url: normalizeUrl(block.backgroundImage.url) ?? block.backgroundImage.url,
              formats: block.backgroundImage.formats
                ? {
                    medium: block.backgroundImage.formats.medium
                      ? {
                          url:
                            normalizeUrl(block.backgroundImage.formats.medium.url) ??
                            block.backgroundImage.formats.medium.url,
                        }
                      : undefined,
                    small: block.backgroundImage.formats.small
                      ? {
                          url:
                            normalizeUrl(block.backgroundImage.formats.small.url) ??
                            block.backgroundImage.formats.small.url,
                        }
                      : undefined,
                    thumbnail: block.backgroundImage.formats.thumbnail
                      ? {
                          url:
                            normalizeUrl(block.backgroundImage.formats.thumbnail.url) ??
                            block.backgroundImage.formats.thumbnail.url,
                        }
                      : undefined,
                  }
                : null,
            }
          : null,
        backgroundVideo: block.backgroundVideo
          ? {
              ...block.backgroundVideo,
              url: normalizeUrl(block.backgroundVideo.url) ?? block.backgroundVideo.url,
            }
          : null,
      };
    }

    if (block.__component === "blocks.rich-text") {
      return {
        ...block,
        content: normalizeRichTextContent(block.content),
      };
    }

    return block;
  });
}

function normalizeRichTextContent(content?: RichTextContent | string | null): RichTextContent | string {
  if (!content || typeof content === "string") {
    return content ?? "";
  }

  return content.map((node) => normalizeRichTextNode(node));
}

function normalizeRichTextNode(node: RichTextNode): RichTextNode {
  if (node.type === "image") {
    return {
      ...node,
      image: normalizeMediaAsset(node.image),
      children: node.children?.map((child) => normalizeRichTextNode(child)),
    };
  }

  if ("children" in node && node.children) {
    return {
      ...node,
      children: node.children.map((child) => normalizeRichTextNode(child)),
    } as RichTextNode;
  }

  return node;
}

function normalizeMediaAsset(asset?: StrapiMedia | null) {
  if (!asset) {
    return null;
  }

  return {
    ...asset,
    url: normalizeUrl(asset.url) ?? asset.url,
    formats: asset.formats
      ? {
          medium: asset.formats.medium
            ? { url: normalizeUrl(asset.formats.medium.url) ?? asset.formats.medium.url }
            : undefined,
          small: asset.formats.small
            ? { url: normalizeUrl(asset.formats.small.url) ?? asset.formats.small.url }
            : undefined,
          thumbnail: asset.formats.thumbnail
            ? { url: normalizeUrl(asset.formats.thumbnail.url) ?? asset.formats.thumbnail.url }
            : undefined,
        }
      : null,
  };
}

function normalizeHeaderGroupsWithMedia(groups?: HeaderGroup[] | null) {
  return groups?.map((group) => ({
    ...group,
    items: group.items?.map((item) => ({
      ...item,
      children: item.children?.filter((child): child is NavigationLink => Boolean(child?.label && child?.href)) ?? null,
      image: normalizeMediaAsset(item.image),
      socialLinks: item.socialLinks
        ? {
            ...item.socialLinks,
            links: item.socialLinks.links?.map((social) => ({
              ...social,
              icon: normalizeMediaAsset(social.icon),
            })) ?? null,
          }
        : null,
    })) ?? null,
  })) ?? null;
}

function normalizeNavigationSections(sections?: NavigationSection[] | null) {
  return sections?.map((section) => ({
    ...section,
    title: section.title,
    links: section.links?.filter((item): item is NavigationLink => Boolean(item?.label && item?.href)) ?? null,
  })).filter((section) => section.title || section.href || section.links?.length) ?? null;
}

function normalizeTagSummary(tag?: TagSummary | null) {
  if (!tag?.name || !tag.slug) {
    return null;
  }

  return {
    name: tag.name,
    slug: tag.slug,
  } satisfies TagSummary;
}

function normalizeTagSummaryList(tags?: TagSummary[] | null) {
  return tags?.map((tag) => normalizeTagSummary(tag)).filter((tag): tag is TagSummary => Boolean(tag)) ?? null;
}

function normalizeCategorySummary(category?: CategorySummary | null) {
  if (!category?.name?.trim()) {
    return null;
  }

  return {
    name: category.name.trim(),
    slug: category.slug?.trim() || null,
  } satisfies CategorySummary;
}

type StrapiCategoryPageEntry = {
  name: string;
  slug: string;
  seo?: SeoFields | null;
  articles?: Array<{
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    publishedAtCustom?: string | null;
    cover?: StrapiMedia | null;
    categories?: CategorySummaryList | null;
  }> | null;
  news_items?: Array<{
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    publishedAtCustom?: string | null;
    cover?: StrapiMedia | null;
    categories?: CategorySummaryList | null;
  }> | null;
  videos?: Array<{
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    publishedAtCustom?: string | null;
    duration?: number | null;
    cover?: StrapiMedia | null;
    categories?: CategorySummaryList | null;
  }> | null;
};

export type CategoryPageData = {
  name: string;
  slug: string;
  seo?: SeoFields | null;
  items: Array<{
    kind: "article" | "news" | "video";
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    href: string;
    meta?: string | null;
    cover?: MediaAsset | null;
    publishedAt?: string | null;
    publishedAtCustom?: string | null;
    categories?: CategorySummaryList | null;
  }>;
};

function normalizeCategorySummaryList(categories?: CategorySummaryList | null) {
  return categories?.map((category) => normalizeCategorySummary(category)).filter((category): category is NonNullable<ReturnType<typeof normalizeCategorySummary>> => category !== null) ?? null;
}

type CategoryAssignmentKind = "article" | "news" | "video";

const getCategoryAssignments = cache(async function getCategoryAssignments() {
  const response = await fetchStrapi<StrapiCategoryAssignmentEntry[]>(
    "/api/categories?pagination[limit]=100&fields[0]=name&fields[1]=slug&populate[articles][fields][0]=slug&populate[news_items][fields][0]=slug&populate[videos][fields][0]=slug",
  );

  const assignments = {
    article: new Map<string, CategorySummary[]>(),
    news: new Map<string, CategorySummary[]>(),
    video: new Map<string, CategorySummary[]>(),
  } satisfies Record<CategoryAssignmentKind, Map<string, CategorySummary[]>>;

  for (const categoryEntry of response.data) {
    const category = normalizeCategorySummary(categoryEntry);

    if (!category) {
      continue;
    }

    for (const article of categoryEntry.articles ?? []) {
      const slug = article?.slug?.trim();

      if (!slug) {
        continue;
      }

      const existing = assignments.article.get(slug) ?? [];
      existing.push(category);
      assignments.article.set(slug, existing);
    }

    for (const item of categoryEntry.news_items ?? []) {
      const slug = item?.slug?.trim();

      if (!slug) {
        continue;
      }

      const existing = assignments.news.get(slug) ?? [];
      existing.push(category);
      assignments.news.set(slug, existing);
    }

    for (const video of categoryEntry.videos ?? []) {
      const slug = video?.slug?.trim();

      if (!slug) {
        continue;
      }

      const existing = assignments.video.get(slug) ?? [];
      existing.push(category);
      assignments.video.set(slug, existing);
    }
  }

  return assignments;
});

export const getSitemapCategories = cache(async function getSitemapCategories() {
  const response = await fetchStrapi<StrapiCategoryAssignmentEntry[]>(
    "/api/categories?pagination[limit]=100&sort[0]=name:asc&fields[0]=name&fields[1]=slug&populate[articles][fields][0]=slug&populate[news_items][fields][0]=slug&populate[videos][fields][0]=slug",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  return response.data
    .map((category) => ({
      slug: category.slug,
      count:
        (category.articles?.length ?? 0)
        + (category.news_items?.length ?? 0)
        + (category.videos?.length ?? 0),
    }))
    .filter((category) => category.slug && category.count > 0)
    .map((category) => ({ slug: category.slug }));
});

async function resolveCategoriesForItems<T extends { slug: string; categories?: CategorySummaryList | null }>(
  kind: CategoryAssignmentKind,
  items: T[],
) {
  const assignments = await getCategoryAssignments();

  return items.map((item) => {
    const normalizedCategories = normalizeCategorySummaryList(item.categories);
    const fallbackCategories = assignments[kind].get(item.slug) ?? null;
    const resolvedCategories = normalizedCategories ?? fallbackCategories ?? null;

    if (!normalizedCategories && fallbackCategories?.length) {
      console.warn(`[strapi-debug] restored categories for ${kind}:${item.slug}`, fallbackCategories.map((category) => category.slug ?? category.name));
    }

    return {
      ...item,
      categories: resolvedCategories,
    };
  });
}

async function resolveCategoriesForItem<T extends { slug: string; categories?: CategorySummaryList | null }>(
  kind: CategoryAssignmentKind,
  item: T,
) {
  const [resolvedItem] = await resolveCategoriesForItems(kind, [item]);

  return resolvedItem;
}

function normalizeAuthorSummary(author?: AuthorSummary | null) {
  if (!author?.name || !author.slug) {
    return null;
  }

  return {
    name: author.name,
    slug: author.slug,
    position: author.position ?? null,
  } satisfies AuthorSummary;
}

function normalizeContentCardMedia(cover?: StrapiMedia | null) {
  if (!cover?.url) {
    return null;
  }

  return {
    ...cover,
    url: normalizeUrl(cover.url) ?? cover.url,
  } satisfies StrapiMedia;
}

function normalizeSourceLinks(sources?: SourceLink[] | null) {
  return sources
    ?.filter((source): source is SourceLink => typeof source?.name === "string" && source.name.trim().length > 0)
    .map((source) => ({
      name: source.name.trim(),
      url: typeof source.url === "string" && source.url.trim().length > 0 ? source.url.trim() : null,
    })) ?? null;
}

function hasRequiredSummaryFields<T extends { documentId?: string | null; slug?: string | null; title?: string | null }>(
  item?: T | null,
): item is T & { documentId: string; slug: string; title: string } {
  return Boolean(item?.documentId && item.slug && item.title);
}

function normalizeFooterColumn(column?: FooterColumn | null) {
  if (!column) {
    return null;
  }

  return {
    ...column,
    items: column.items?.map((item) => ({
      ...item,
      image: normalizeMediaAsset(item.image),
      socialLinks: item.socialLinks
        ? {
            ...item.socialLinks,
            links: item.socialLinks.links?.map((social) => ({
              ...social,
              icon: normalizeMediaAsset(social.icon),
            })) ?? null,
          }
        : null,
    })) ?? null,
  };
}

export function buildSeoMetadata({
  title,
  description,
  seo,
  siteSeo,
  path,
  image,
}: {
  title: string;
  description: string;
  seo?: SeoFields | null;
  siteSeo?: SiteSeoSettings | null;
  path?: string;
  image?: string | null;
}): Metadata {
  const siteOrigin = normalizeSiteOrigin(siteSeo?.siteUrl, SITE_URL);
  const mergedSeo: Partial<SeoFields> = {
    ...(siteSeo?.defaultSeo ?? {}),
    ...(seo ?? {}),
  };
  const finalTitle = mergedSeo.metaTitle || title;
  const finalDescription = mergedSeo.metaDescription || description;
  const canonical = mergedSeo.canonicalUrl ? toAbsoluteSiteUrl(mergedSeo.canonicalUrl, siteOrigin) : path ? new URL(path, siteOrigin).toString() : undefined;
  const absoluteImage = toAbsoluteMetadataUrl(mergedSeo.metaImage?.url, siteOrigin)
    ?? toAbsoluteMetadataUrl(image, siteOrigin)
    ?? toAbsoluteMetadataUrl(siteSeo?.openGraphImage?.url, siteOrigin)
    ?? toAbsoluteMetadataUrl(siteSeo?.twitterImage?.url, siteOrigin);

  return {
    metadataBase: new URL(siteOrigin),
    title: finalTitle,
    description: finalDescription,
    keywords: mergedSeo.keywords ?? undefined,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    robots:
      mergedSeo.noIndex || mergedSeo.noFollow
        ? {
            index: !mergedSeo.noIndex,
            follow: !mergedSeo.noFollow,
          }
        : undefined,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonical,
      siteName: "Виноделие сегодня",
      locale: "ru_RU",
      type: "article",
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
    },
    twitter: {
      card: absoluteImage ? "summary_large_image" : "summary",
      title: finalTitle,
      description: finalDescription,
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };
}

function normalizeUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.pathname.startsWith("/uploads/")) {
        return resolveMediaUrl(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
      }

      return url;
    } catch {
      return url;
    }
  }

  return resolveMediaUrl(url);
}

export function toAbsoluteSiteUrl(url?: string | null, baseUrl = SITE_URL) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return new URL(url, baseUrl).toString();
}

function toAbsoluteMetadataUrl(url?: string | null, siteOrigin = SITE_URL) {
  if (!url) {
    return undefined;
  }

  const normalizedSiteOrigin = normalizeSiteOrigin(siteOrigin, SITE_URL);

  try {
    const parsed = new URL(url);

    if (parsed.pathname.startsWith("/uploads/")) {
      return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, normalizedSiteOrigin).toString();
    }

    return parsed.toString();
  } catch {
    return toAbsoluteSiteUrl(url, normalizedSiteOrigin);
  }
}

async function isPreviewEnabled() {
  return (await draftMode()).isEnabled;
}

async function getPreviewPath() {
  return (await cookies()).get(PREVIEW_PATH_COOKIE)?.value?.trim() || null;
}

async function shouldUseDraftForPath(pathname: string) {
  if (!(await isPreviewEnabled())) {
    return false;
  }

  return (await getPreviewPath()) === pathname;
}

function withStatus(path: string, status?: "draft" | "published") {
  if (!status) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}status=${status}`;
}

async function fetchStrapi<T>(path: string, options?: { revalidate?: number | false; status?: "draft" | "published" }) {
  const revalidate = options?.revalidate;
  const shouldUseNoStore = options?.status === "draft" || revalidate === false || !HAS_REVALIDATE_SECRET;
  const authToken = options?.status === "draft" ? (await cookies()).get("vino_auth_jwt")?.value ?? null : null;
  const response = await fetch(`${CMS_URL}${withStatus(path, options?.status)}`, {
    cache: shouldUseNoStore ? "no-store" : undefined,
    next: shouldUseNoStore ? undefined : { revalidate: revalidate ?? DEFAULT_REVALIDATE_SECONDS },
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as StrapiResponse<T>;
}

export async function withLoggedFallback<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(`[strapi] ${label}`, error);
    return fallback;
  }
}

export async function getCommunitySettings() {
  const response = await fetchStrapi<CommunitySettings & { commentStopWords?: unknown }>(
    "/api/community-setting?populate[shareNetworks][populate][icon]=true",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  const data = response.data;

  return {
    allowGuestComments: data.allowGuestComments ?? true,
    commentModerationEnabled: data.commentModerationEnabled ?? true,
    commentBlockedMessage: data.commentBlockedMessage ?? null,
    commentMaxLength: typeof data.commentMaxLength === "number" ? data.commentMaxLength : 3000,
    shareNetworks:
      data.shareNetworks
        ?.filter(
          (item): item is CommunityShareNetwork =>
            Boolean(
              item?.enabled !== false &&
                typeof item.label === "string" &&
                item.label.trim() &&
                typeof item.networkKey === "string" &&
                item.networkKey.trim() &&
                typeof item.shareUrlTemplate === "string" &&
                item.shareUrlTemplate.trim(),
            ),
        )
        .map((item) => ({
          ...item,
          icon: normalizeMediaAsset(item.icon),
        })) ?? [],
  } satisfies CommunitySettings;
}

export const getGlobalSettings = cache(async function getGlobalSettings(): Promise<GlobalSettings> {
  const response = await fetchStrapi<GlobalSettings>(
    "/api/global-setting?populate[logo]=true&populate[typography][populate]=*&populate[mobileBottomNav]=true&populate[socialLinks][populate][links][populate][icon]=true",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  const data = response.data;

  return {
    ...data,
    typography: data.typography
        ? {
            menu: data.typography.menu ?? null,
            body: data.typography.body ?? null,
            hero: data.typography.hero ?? null,
            heroEyebrow: data.typography.heroEyebrow ?? null,
            h1: data.typography.h1 ?? null,
            h2: data.typography.h2 ?? null,
            h3: data.typography.h3 ?? null,
            h4: data.typography.h4 ?? null,
            small: data.typography.small ?? null,
            caption: data.typography.caption ?? null,
            button: data.typography.button ?? null,
          }
        : null,
    mobileBottomNav:
      data.mobileBottomNav?.filter((item): item is MobileBottomNavItem => Boolean(item?.label && (item.href || item.opensSidebar))) ?? null,
    socialLinks: data.socialLinks
      ? {
          ...data.socialLinks,
          links: data.socialLinks.links?.map((social) => ({
            ...social,
            icon: normalizeMediaAsset(social.icon),
          })) ?? null,
        }
      : null,
    logo: data.logo
      ? {
          ...data.logo,
          url: normalizeUrl(data.logo.url) ?? data.logo.url,
          formats: data.logo.formats
            ? {
                medium: data.logo.formats.medium
                  ? { url: normalizeUrl(data.logo.formats.medium.url) ?? data.logo.formats.medium.url }
                  : undefined,
                small: data.logo.formats.small
                  ? { url: normalizeUrl(data.logo.formats.small.url) ?? data.logo.formats.small.url }
                  : undefined,
                thumbnail: data.logo.formats.thumbnail
                  ? {
                      url:
                        normalizeUrl(data.logo.formats.thumbnail.url) ??
                        data.logo.formats.thumbnail.url,
                    }
                  : undefined,
              }
            : null,
        }
      : null,
  };
});

export const getSiteSeo = cache(async function getSiteSeo() {
  const response = await fetchStrapi<SiteSeoSettings>(
    "/api/site-seo?populate[defaultSeo]=true&populate[openGraphImage]=true&populate[twitterImage]=true&populate[robotsRules]=true",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  return {
    ...response.data,
    openGraphImage: normalizeMediaAsset(response.data.openGraphImage),
    twitterImage: normalizeMediaAsset(response.data.twitterImage),
  };
});

export const getSiteHeader = cache(async function getSiteHeader() {
  const response = await fetchStrapi<SiteHeaderSettings>(
    `/api/site-header?${SITE_HEADER_POPULATE_QUERY}`,
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  return {
    ...response.data,
    lightLogo: normalizeMediaAsset(response.data.lightLogo),
    darkLogo: normalizeMediaAsset(response.data.darkLogo),
    top: normalizeHeaderGroupsWithMedia(response.data.top),
    middle: normalizeHeaderGroupsWithMedia(response.data.middle),
    bottom: normalizeHeaderGroupsWithMedia(response.data.bottom),
    mobile: normalizeHeaderGroupsWithMedia(response.data.mobile),
    mobileMenuSections: normalizeNavigationSections(response.data.mobileMenuSections),
  };
});

export const getSiteFooter = cache(async function getSiteFooter() {
  const response = await fetchStrapi<SiteFooterSettings>(
    "/api/site-footer?populate[column1][populate]=*&populate[column2][populate]=*&populate[column3][populate]=*&populate[column4][populate]=*",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  return {
    ...response.data,
    column1: normalizeFooterColumn(response.data.column1),
    column2: normalizeFooterColumn(response.data.column2),
    column3: normalizeFooterColumn(response.data.column3),
    column4: normalizeFooterColumn(response.data.column4),
  };
});

export async function getSidebars() {
  const response = await fetchStrapi<SidebarEntry[]>(
    "/api/sidebars?pagination[limit]=100&sort[0]=title:asc&populate=*",
  );

  return Promise.all(response.data.map((sidebar) => enrichSidebar(sidebar)));
}

export async function getArchiveSettings() {
  const response = await fetchStrapi<ArchiveSettings>("/api/archive-setting");
  return response.data;
}

export async function getSidebarForPath(pathname: string) {
  const response = await fetchStrapi<SidebarEntry[]>(
    "/api/sidebars?pagination[limit]=100&sort[0]=title:asc&populate=*",
  );
  const sidebars = response.data;

  const matchedSidebar = sidebars.find((sidebar) =>
    (sidebar.paths ?? []).some((target) => {
      if (!target.path) {
        return false;
      }

      if (target.exactMatch) {
        return pathname === target.path;
      }

      return pathname === target.path || pathname.startsWith(`${target.path}/`);
    }),
  );

  if (matchedSidebar) {
    return enrichSidebar(matchedSidebar);
  }

  const fallbackSidebar =
    sidebars.find(
      (sidebar) =>
        !(sidebar.paths?.length) &&
        Boolean(sidebar.links?.length || sidebar.sections?.length || sidebar.archiveBlocks?.length || sidebar.socialLinks?.links?.length),
    ) ?? null;

  return fallbackSidebar ? enrichSidebar(fallbackSidebar) : null;
}

export const getHomepage = cache(async function getHomepage() {
  const [contentResponse, blocksResponse] = await Promise.all([
    fetchStrapi<HomepageEntry>(
      "/api/homepage?populate[infographicCards][populate][backgroundImage]=true&populate[infographicCards][populate][backgroundVideo]=true&populate[seo][populate][metaImage]=true",
      { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    ),
    fetchStrapi<HomepageEntry>(
      "/api/homepage?populate=*",
      { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    ),
  ]);

  const data = {
    ...contentResponse.data,
    blocks: blocksResponse.data.blocks ?? contentResponse.data.blocks,
  };

  return {
    ...data,
    infographicCards: data.infographicCards?.map((card) => ({
      ...card,
      backgroundImage: card.backgroundImage
        ? {
            ...card.backgroundImage,
            url: normalizeUrl(card.backgroundImage.url) ?? card.backgroundImage.url,
          }
        : null,
      backgroundVideo: card.backgroundVideo
        ? {
            ...card.backgroundVideo,
            url: normalizeUrl(card.backgroundVideo.url) ?? card.backgroundVideo.url,
          }
        : null,
    })),
    blocks: normalizeBlocks(data.blocks),
  };
});

export const getTagCloud = cache(async function getTagCloud() {
  const response = await fetchStrapi<StrapiTagEntry[]>(
    "/api/tags?pagination[limit]=100&sort[0]=name:asc&fields[0]=name&fields[1]=slug&populate[articles][fields][0]=slug&populate[news_items][fields][0]=slug&populate[videos][fields][0]=slug",
    { revalidate: SETTINGS_REVALIDATE_SECONDS },
  );

  return response.data
    .map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      articles: tag.articles ?? null,
      news_items: tag.news_items ?? null,
      videos: tag.videos ?? null,
      count:
        (tag.articles?.length ?? 0)
        + (tag.news_items?.length ?? 0)
        + (tag.videos?.length ?? 0),
    }))
    .filter((tag) => tag.name && tag.slug && tag.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
});

export const getSitemapTags = cache(async function getSitemapTags() {
  const tags = await getTagCloud();

  return tags.map((tag) => ({
    slug: tag.slug,
  }));
});

export async function getFeaturedArticles() {
  const response = await fetchStrapi<ArticleSummary[]>(
    "/api/articles?filters[featured][$eq]=true&sort[0]=publishedAtCustom:desc&sort[1]=publishedAt:desc&pagination[limit]=6&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=readingTime&fields[4]=featured&fields[5]=pinned&fields[6]=homepageLead&fields[7]=homepageSpecialBlock&fields[8]=publishedAtCustom&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&populate[categories][fields][0]=name&populate[categories][fields][1]=slug&populate[tags][fields][0]=name&populate[tags][fields][1]=slug",
  );

  return sortPublishedItems(
    response.data.filter(hasRequiredSummaryFields).map((item) => ({
      ...item,
      author: normalizeAuthorSummary(item.author),
      categories: normalizeCategorySummaryList(item.categories),
      tags: normalizeTagSummaryList(item.tags),
      cover: normalizeContentCardMedia(item.cover),
    })),
  );
}

export async function getArticles() {
  const response = await fetchStrapi<ArticleSummary[]>(
    `/api/articles?sort[0]=publishedAtCustom:desc&sort[1]=publishedAt:desc&pagination[limit]=100&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=readingTime&fields[4]=featured&fields[5]=pinned&fields[6]=homepageLead&fields[7]=homepageSpecialBlock&fields[8]=publishedAtCustom&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug`,
  );

  const items = await resolveCategoriesForItems(
    "article",
    response.data.filter(hasRequiredSummaryFields).map((item) => ({
      ...item,
      author: normalizeAuthorSummary(item.author),
      categories: normalizeCategorySummaryList(item.categories),
      tags: normalizeTagSummaryList(item.tags),
      cover: normalizeContentCardMedia(item.cover),
    })),
  );

  return sortPublishedItems(
    items,
  );
}

export const getArticleBySlug = cache(async function getArticleBySlug(slug: string) {
  const pathname = `/articles/${slug}`;
  const status = await shouldUseDraftForPath(pathname) ? "draft" : undefined;
  const [baseResponse, contentResponse] = await Promise.all([
    fetchStrapi<ArticleDetail[]>(
      `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&populate[seo][populate][metaImage]=true`,
      { status },
    ),
    fetchStrapi<ArticleDetail[]>(
      `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&${CONTENT_POPULATE_QUERY}`,
      { status },
    ),
  ]);

  const article = baseResponse.data[0]
    ? {
        ...baseResponse.data[0],
        content: contentResponse.data[0]?.content ?? baseResponse.data[0].content,
        sources: contentResponse.data[0]?.sources ?? baseResponse.data[0].sources,
      }
    : null;

  if (!article) {
    return null;
  }

  return resolveCategoriesForItem("article", {
    ...article,
    author: normalizeAuthorSummary(article.author),
    categories: normalizeCategorySummaryList(article.categories),
    tags: normalizeTagSummaryList(article.tags),
    content: normalizeBlocks(article.content),
    cover: normalizeContentCardMedia(article.cover),
    sources: normalizeSourceLinks(article.sources),
    coverSource: typeof article.coverSource === "string" && article.coverSource.trim() ? article.coverSource.trim() : null,
  });
});

export async function getLatestNews() {
  const response = await fetchStrapi<NewsSummary[]>(
    "/api/news-entries?sort[0]=publishedAtCustom:desc&sort[1]=publishedAt:desc&pagination[limit]=10&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=featured&fields[4]=pinned&fields[5]=homepageLead&fields[6]=homepageSpecialBlock&fields[7]=sourceName&fields[8]=publishedAt&fields[9]=publishedAtCustom&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&populate[categories][fields][0]=name&populate[categories][fields][1]=slug&populate[tags][fields][0]=name&populate[tags][fields][1]=slug",
  );

  return sortPublishedItems(
    response.data.filter(hasRequiredSummaryFields).map((item) => ({
      ...item,
      author: normalizeAuthorSummary(item.author),
      categories: normalizeCategorySummaryList(item.categories),
      tags: normalizeTagSummaryList(item.tags),
      cover: normalizeContentCardMedia(item.cover),
    })),
  );
}

export async function getNews() {
  const response = await fetchStrapi<NewsSummary[]>(
    `/api/news-entries?sort[0]=publishedAtCustom:desc&sort[1]=publishedAt:desc&pagination[limit]=100&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=featured&fields[4]=pinned&fields[5]=homepageLead&fields[6]=homepageSpecialBlock&fields[7]=sourceName&fields[8]=publishedAt&fields[9]=publishedAtCustom&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug`,
  );

  const items = await resolveCategoriesForItems(
    "news",
    response.data.filter(hasRequiredSummaryFields).map((item) => ({
      ...item,
      author: normalizeAuthorSummary(item.author),
      categories: normalizeCategorySummaryList(item.categories),
      tags: normalizeTagSummaryList(item.tags),
      cover: normalizeContentCardMedia(item.cover),
    })),
  );

  return sortPublishedItems(
    items,
  );
}

export const getNewsBySlug = cache(async function getNewsBySlug(slug: string) {
  const pathname = `/news/${slug}`;
  const status = await shouldUseDraftForPath(pathname) ? "draft" : undefined;
  const [baseResponse, contentResponse] = await Promise.all([
    fetchStrapi<NewsDetail[]>(
      `/api/news-entries?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=featured&fields[4]=pinned&fields[5]=homepageLead&fields[6]=sourceName&fields[7]=sourceUrl&fields[8]=publishedAt&fields[9]=publishedAtCustom&fields[10]=coverSource&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&populate[seo][populate][metaImage]=true`,
      { status },
    ),
    fetchStrapi<NewsDetail[]>(
      `/api/news-entries?filters[slug][$eq]=${encodeURIComponent(slug)}&${CONTENT_POPULATE_QUERY}`,
      { status },
    ),
  ]);

  const item = baseResponse.data[0]
    ? {
        ...baseResponse.data[0],
        content: contentResponse.data[0]?.content ?? baseResponse.data[0].content,
        sources: contentResponse.data[0]?.sources ?? baseResponse.data[0].sources,
      }
    : null;

  if (!item) {
    return null;
  }

  return resolveCategoriesForItem("news", {
    ...item,
    author: normalizeAuthorSummary(item.author),
    categories: normalizeCategorySummaryList(item.categories),
    tags: normalizeTagSummaryList(item.tags),
    content: normalizeBlocks(item.content),
    cover: normalizeContentCardMedia(item.cover),
    sources: normalizeSourceLinks(item.sources),
    coverSource: typeof item.coverSource === "string" && item.coverSource.trim() ? item.coverSource.trim() : null,
  });
});

export async function getVideos() {
  const response = await fetchStrapi<VideoSummary[]>(
    `/api/videos?sort[0]=publishedAtCustom:desc&sort[1]=publishedAt:desc&pagination[limit]=100&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=videoUrl&fields[4]=duration&fields[5]=pinned&fields[6]=homepageLead&fields[7]=homepageSpecialBlock&fields[8]=publishedAt&fields[9]=publishedAtCustom&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug`,
  );

  const items = await resolveCategoriesForItems(
    "video",
    response.data.filter(hasRequiredSummaryFields).map((item) => ({
      ...item,
      author: normalizeAuthorSummary(item.author),
      categories: normalizeCategorySummaryList(item.categories),
      tags: normalizeTagSummaryList(item.tags),
      cover: normalizeContentCardMedia(item.cover),
    })),
  );

  return sortPublishedItems(
    items,
  );
}

export const getVideoBySlug = cache(async function getVideoBySlug(slug: string) {
  const pathname = `/videos/${slug}`;
  const status = await shouldUseDraftForPath(pathname) ? "draft" : undefined;
  const [baseResponse, contentResponse] = await Promise.all([
    fetchStrapi<VideoSummary[]>(
      `/api/videos?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=videoUrl&fields[4]=duration&fields[5]=pinned&fields[6]=homepageLead&fields[7]=publishedAt&fields[8]=publishedAtCustom&fields[9]=coverSource&populate[cover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&${CATEGORY_FIELDS_QUERY}&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&populate[seo][populate][metaImage]=true`,
      { status },
    ),
    fetchStrapi<VideoSummary[]>(
      `/api/videos?filters[slug][$eq]=${encodeURIComponent(slug)}&${VIDEO_CONTENT_POPULATE_QUERY}`,
      { status },
    ),
  ]);

  const video = baseResponse.data[0]
    ? {
        ...baseResponse.data[0],
        content: contentResponse.data[0]?.content ?? baseResponse.data[0].content,
      }
    : null;

  if (!video) {
    return null;
  }

  return resolveCategoriesForItem("video", {
    ...video,
    author: normalizeAuthorSummary(video.author),
    categories: normalizeCategorySummaryList(video.categories),
    tags: normalizeTagSummaryList(video.tags),
    content: normalizeBlocks(video.content),
    cover: normalizeContentCardMedia(video.cover),
    coverSource: typeof video.coverSource === "string" && video.coverSource.trim() ? video.coverSource.trim() : null,
  });
});

export async function getHomepageSpecialItems() {
  const [articles, news, videos] = await Promise.all([getArticles(), getNews(), getVideos()]);
  const homepageSpecialVideoLimit = 10;

  const cards: HomepageSpecialCard[] = sortPublishedItems([
    ...articles
      .filter((item) => item.homepageSpecialBlock)
      .map((item) => ({
        kind: "article" as const,
        documentId: item.documentId,
        title: item.title,
        slug: item.slug,
        href: `/articles/${item.slug}`,
        excerpt: item.excerpt,
        cover: item.cover ?? null,
        publishedAt: item.publishedAt,
        publishedAtCustom: item.publishedAtCustom,
        categories: item.categories ?? null,
      })),
    ...news
      .filter((item) => item.homepageSpecialBlock)
      .map((item) => ({
        kind: "news" as const,
        documentId: item.documentId,
        title: item.title,
        slug: item.slug,
        href: `/news/${item.slug}`,
        excerpt: item.excerpt,
        cover: item.cover ?? null,
        publishedAt: item.publishedAt,
        publishedAtCustom: item.publishedAtCustom,
        categories: item.categories ?? null,
      })),
  ]);

  const markedVideos = sortPublishedItems(
    videos.filter((item) => item.homepageSpecialBlock),
  )
    .map((item) => ({
      kind: "video" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      href: `/videos/${item.slug}`,
      excerpt: item.excerpt,
      cover: item.cover ?? null,
      videoUrl: item.videoUrl,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: item.categories ?? null,
    }));

  return {
    featureCards: cards.slice(0, 3),
    videos: markedVideos.slice(0, homepageSpecialVideoLimit),
  };
}

export const getTagPageBySlug = cache(async function getTagPageBySlug(slug: string): Promise<TagPageData | null> {
  const response = await fetchStrapi<StrapiTagPageEntry[]>(
    `/api/tags?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=name&fields[1]=slug&populate[seo][populate][metaImage]=true&populate[articles][fields][0]=title&populate[articles][fields][1]=slug&populate[articles][fields][2]=excerpt&populate[articles][fields][3]=publishedAt&populate[articles][fields][4]=publishedAtCustom&populate[articles][populate][cover]=true&populate[articles][populate][categories][fields][0]=name&populate[articles][populate][categories][fields][1]=slug&populate[news_items][fields][0]=title&populate[news_items][fields][1]=slug&populate[news_items][fields][2]=excerpt&populate[news_items][fields][3]=publishedAt&populate[news_items][fields][4]=publishedAtCustom&populate[news_items][populate][cover]=true&populate[news_items][populate][categories][fields][0]=name&populate[news_items][populate][categories][fields][1]=slug&populate[videos][fields][0]=title&populate[videos][fields][1]=slug&populate[videos][fields][2]=excerpt&populate[videos][fields][3]=publishedAt&populate[videos][fields][4]=publishedAtCustom&populate[videos][fields][5]=duration&populate[videos][populate][cover]=true&populate[videos][populate][categories][fields][0]=name&populate[videos][populate][categories][fields][1]=slug`,
    { revalidate: DEFAULT_REVALIDATE_SECONDS },
  );

  const tag = response.data[0];

  if (!tag) {
    return null;
  }

  const items: TagPageData["items"] = sortPublishedItems([
    ...(tag.articles ?? []).map((item) => ({
      kind: "article" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/articles/${item.slug}`,
      meta: getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))
        ? `${getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))} - ${formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты"}`
        : formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
    ...(tag.news_items ?? []).map((item) => ({
      kind: "news" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/news/${item.slug}`,
      meta: getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))
        ? `${getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))} - ${formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты"}`
        : formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
    ...(tag.videos ?? []).map((item) => ({
      kind: "video" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/videos/${item.slug}`,
      meta: [
        getPrimaryCategoryName(normalizeCategorySummaryList(item.categories)),
        formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты",
        item.duration ? `${item.duration} мин` : null,
      ].filter(Boolean).join(" - "),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
  ]);

  return {
    name: tag.name,
    slug: tag.slug,
    seo: tag.seo ?? null,
    items,
  };
});

export const getCategoryPageBySlug = cache(async function getCategoryPageBySlug(slug: string): Promise<CategoryPageData | null> {
  const response = await fetchStrapi<StrapiCategoryPageEntry[]>(
    `/api/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=name&fields[1]=slug&populate[seo][populate][metaImage]=true&populate[articles][fields][0]=title&populate[articles][fields][1]=slug&populate[articles][fields][2]=excerpt&populate[articles][fields][3]=publishedAt&populate[articles][fields][4]=publishedAtCustom&populate[articles][populate][cover]=true&populate[articles][populate][categories][fields][0]=name&populate[articles][populate][categories][fields][1]=slug&populate[news_items][fields][0]=title&populate[news_items][fields][1]=slug&populate[news_items][fields][2]=excerpt&populate[news_items][fields][3]=publishedAt&populate[news_items][fields][4]=publishedAtCustom&populate[news_items][populate][cover]=true&populate[news_items][populate][categories][fields][0]=name&populate[news_items][populate][categories][fields][1]=slug&populate[videos][fields][0]=title&populate[videos][fields][1]=slug&populate[videos][fields][2]=excerpt&populate[videos][fields][3]=publishedAt&populate[videos][fields][4]=publishedAtCustom&populate[videos][fields][5]=duration&populate[videos][populate][cover]=true&populate[videos][populate][categories][fields][0]=name&populate[videos][populate][categories][fields][1]=slug`,
    { revalidate: DEFAULT_REVALIDATE_SECONDS },
  );

  const category = response.data[0];

  if (!category) {
    return null;
  }

  const items: CategoryPageData["items"] = sortPublishedItems([
    ...(category.articles ?? []).map((item) => ({
      kind: "article" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/articles/${item.slug}`,
      meta: getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))
        ? `${getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))} - ${formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты"}`
        : formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
    ...(category.news_items ?? []).map((item) => ({
      kind: "news" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/news/${item.slug}`,
      meta: getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))
        ? `${getPrimaryCategoryName(normalizeCategorySummaryList(item.categories))} - ${formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты"}`
        : formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
    ...(category.videos ?? []).map((item) => ({
      kind: "video" as const,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      href: `/videos/${item.slug}`,
      meta: [
        getPrimaryCategoryName(normalizeCategorySummaryList(item.categories)),
        formatRussianDateTime(item.publishedAtCustom ?? item.publishedAt) ?? "Без даты",
        item.duration ? `${item.duration} мин` : null,
      ].filter(Boolean).join(" - "),
      cover: item.cover ? { ...item.cover, url: normalizeUrl(item.cover.url) ?? item.cover.url } : null,
      publishedAt: item.publishedAt,
      publishedAtCustom: item.publishedAtCustom,
      categories: normalizeCategorySummaryList(item.categories),
    })),
  ]);

  return {
    name: category.name,
    slug: category.slug,
    seo: category.seo ?? null,
    items,
  };
});

export async function getPages() {
  const response = await fetchStrapi<PageEntry[]>(
    "/api/pages?sort[0]=title:asc&fields[0]=title&fields[1]=slug",
  );

  return response.data;
}

export async function getFooterPages() {
  const response = await fetchStrapi<PageEntry[]>(
    "/api/pages?filters[showInFooter][$eq]=true&sort[0]=title:asc&fields[0]=title&fields[1]=slug&fields[2]=excerpt",
  );

  return response.data;
}

export async function getPageBySlug(slug: string) {
  const [baseResponse, contentResponse] = await Promise.all([
    fetchStrapi<PageEntry[]>(
      `/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[seo][populate][metaImage]=true`,
    ),
    fetchStrapi<PageEntry[]>(
      `/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&${CONTENT_POPULATE_QUERY}`,
    ),
  ]);

  const page = baseResponse.data[0]
    ? {
        ...baseResponse.data[0],
        content: contentResponse.data[0]?.content ?? baseResponse.data[0].content,
      }
    : null;

  if (!page) {
    return null;
  }

  return {
    ...page,
    content: normalizeBlocks(page.content),
  };
}

export function formatRussianDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatRussianDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const timeZone = "Europe/Moscow";
  const currentDay = formatDateKeyInTimeZone(new Date(), timeZone);
  const targetDay = formatDateKeyInTimeZone(parsed, timeZone);

  if (currentDay === targetDay) {
    return formatRussianTime(value);
  }

  return formatRussianDate(value);
}
