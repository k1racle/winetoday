"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { AuthWidget } from "@/components/auth-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { SocialLinks } from "@/components/social-links";
import type { HeaderGroup, HeaderLink, MediaAsset, NavigationLink, NavigationSection, SocialLinksBlock } from "@/lib/strapi";

type NavigationItem = {
  href: string;
  label: string;
};

type MobileMenuEntry = {
  kind: "link" | "account";
  label: string;
  href?: string | null;
  description?: string | null;
  children: NavigationLink[];
};

type MobileMenuSectionState = MobileMenuEntry;

type SiteHeaderProps = {
  navigationItems: NavigationItem[];
  lightLogo?: MediaAsset | null;
  darkLogo?: MediaAsset | null;
  siteName: string;
  tickerText?: string | null;
  socialLinks?: SocialLinksBlock | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  topBackgroundColor?: string | null;
  topPinned?: boolean;
  topOpacity?: number | null;
  topHeight?: number | null;
  middleBackgroundColor?: string | null;
  middlePinned?: boolean;
  middleOpacity?: number | null;
  middleHeight?: number | null;
  bottomBackgroundColor?: string | null;
  bottomPinned?: boolean;
  bottomOpacity?: number | null;
  bottomHeight?: number | null;
  mobileBackgroundColor?: string | null;
  mobileTextColor?: string | null;
  mobileBorderColor?: string | null;
  mobileOpacity?: number | null;
  mobileHeight?: number | null;
  top?: HeaderGroup[] | null;
  middle?: HeaderGroup[] | null;
  bottom?: HeaderGroup[] | null;
  mobile?: HeaderGroup[] | null;
  mobileMenuSections?: NavigationSection[] | null;
};

type ResolvedHeaderGroup = {
  title?: string | null;
  position: "left" | "center" | "right";
  titleColor?: string | null;
  backgroundColor?: string | null;
  items: HeaderLink[];
};

type HeaderSlots = ReturnType<typeof splitGroupsByPosition>;
type ThemeMode = "light" | "dark";

const THEME_CHANGE_EVENT = "vino-theme-change";

function readHeaderThemeSnapshot(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToHeaderTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQuery.addEventListener("change", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function HeaderIcon({ kind }: { kind: "search" | "account" }) {
  if (kind === "search") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.2-4.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "right" | "left" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 fill-none stroke-current ${direction === "left" ? "rotate-180" : ""}`}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function hexToRgba(hex: string, opacityPercent: number) {
  const normalized = hex.replace("#", "").trim();

  if (![3, 6].includes(normalized.length)) {
    return hex;
  }

  const expanded = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  if ([red, green, blue].some((value) => Number.isNaN(value))) {
    return hex;
  }

  const alpha = Math.min(Math.max(opacityPercent, 0), 100) / 100;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildHeaderStyle(colors: {
  backgroundColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  opacity?: number | null;
}): CSSProperties | undefined {
  const style: CSSProperties = {};

  if (colors.backgroundColor) {
    style.backgroundColor =
      typeof colors.opacity === "number" && colors.opacity < 100
        ? hexToRgba(colors.backgroundColor, colors.opacity)
        : colors.backgroundColor;
  }

  if (colors.textColor) {
    style.color = colors.textColor;
  }

  if (colors.borderColor) {
    style.borderColor = colors.borderColor;
  }

  return Object.keys(style).length ? style : undefined;
}

function resolveRowMetrics(height?: number | null) {
  const rowHeight = typeof height === "number" ? Math.min(Math.max(height, 40), 220) : null;

  if (!rowHeight) {
    return {
      rowHeight: null,
      controlHeight: null,
      logoSize: null,
      verticalPadding: null,
    };
  }

  const controlHeight = Math.max(Math.min(rowHeight - 8, 48), 28);
  const logoSize = Math.max(Math.min(rowHeight - 8, 48), 24);
  const verticalPadding = Math.max((rowHeight - controlHeight) / 2, 0);

  return {
    rowHeight,
    controlHeight,
    logoSize,
    verticalPadding,
  };
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function normalizeHeaderGroups(groups?: HeaderGroup[] | null): ResolvedHeaderGroup[] {
  return (groups ?? [])
    .filter((group) => group.enabled !== false)
    .map((group) => ({
      title: group.title,
      position: group.position ?? "left",
      titleColor: group.titleColor,
      backgroundColor: group.backgroundColor,
      items: (group.items ?? []).filter((item) => item.enabled !== false),
    }))
    .filter((group) => group.items.length > 0);
}

function splitGroupsByPosition(groups: ResolvedHeaderGroup[]) {
  return {
    left: groups.filter((group) => group.position === "left"),
    center: groups.filter((group) => group.position === "center"),
    right: groups.filter((group) => group.position === "right"),
  };
}

function repeatTickerItems<T>(items: T[], minimumCopies = 4) {
  if (!items.length) {
    return [] as T[];
  }

  const repeated: T[] = [];
  const copies = Math.max(minimumCopies, 2);

  for (let index = 0; index < copies; index += 1) {
    repeated.push(...items);
  }

  return repeated;
}

type MobileMenuLinkItem = NavigationLink;

function normalizeNavigationChildren(children?: NavigationLink[] | null): NavigationLink[] {
  return (children ?? []).filter((child): child is NavigationLink => Boolean(child?.label?.trim() && child?.href?.trim()));
}

function mapHeaderItemToMobileMenuEntry(item: HeaderLink): MobileMenuEntry | null {
  if (item.kind === "account") {
    if (!item.label?.trim()) {
      return null;
    }

    return {
      kind: "account",
      label: item.label,
      href: item.href,
      description: null,
      children: [],
    };
  }

  if (item.kind !== "link" || !item.label?.trim()) {
    return null;
  }

  const children = normalizeNavigationChildren(item.children);

  if (!item.href?.trim() && !children.length) {
    return null;
  }

  return {
    kind: "link",
    label: item.label,
    href: item.href,
    description: null,
    children,
  };
}

function buildMobileMenuFromHeaderGroups(groups: ResolvedHeaderGroup[]): MobileMenuEntry[] {
  return groups.flatMap((group) => group.items.map((item) => mapHeaderItemToMobileMenuEntry(item)).filter((item): item is MobileMenuEntry => Boolean(item)));
}

function buildMobileMenuFromSections(sections?: NavigationSection[] | null): MobileMenuEntry[] {
  const normalizedSections = sections?.filter((section) => section.title || section.href || section.links?.length) ?? [];

  return normalizedSections.flatMap<MobileMenuEntry>((section) => {
    const children = normalizeNavigationChildren(section.links);
    const label = section.title?.trim();

    if (label) {
      if (!section.href?.trim() && !children.length) {
        return [];
      }

      return [{
        kind: "link",
        label,
        href: section.href,
        description: section.description,
        children,
      }];
    }

    return children.map((child) => ({
      kind: child.kind === "account" ? "account" : "link",
      label: child.label,
      href: child.href,
      description: child.description,
      children: [],
    }));
  });
}

export function SiteHeader({
  navigationItems,
  lightLogo,
  darkLogo,
  siteName,
  tickerText,
  socialLinks,
  top,
  middle,
  bottom,
  mobile,
  mobileMenuSections,
  ...theme
}: SiteHeaderProps) {
  const currentTheme = useSyncExternalStore<ThemeMode>(subscribeToHeaderTheme, readHeaderThemeSnapshot, () => "light");
  const pathname = usePathname();
  const router = useRouter();
  const topRowRef = useRef<HTMLDivElement | null>(null);
  const middleRowRef = useRef<HTMLDivElement | null>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);
  const mobileRowRef = useRef<HTMLDivElement | null>(null);
  const [topRowHeight, setTopRowHeight] = useState(0);
  const [middleRowHeight, setMiddleRowHeight] = useState(0);
  const [bottomRowHeight, setBottomRowHeight] = useState(0);
  const [mobileRowHeight, setMobileRowHeight] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const [searchOpenPath, setSearchOpenPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuStack, setMobileMenuStack] = useState<MobileMenuSectionState[]>([]);
  const isMenuOpen = menuOpenPath === pathname;
  const isSearchOpen = searchOpenPath === pathname;

  const closeMobileMenu = () => {
    setMenuOpenPath(null);
    setMobileMenuStack([]);
  };

  const toggleMobileMenu = () => {
    if (menuOpenPath === pathname) {
      closeMobileMenu();
      return;
    }

    setSearchOpenPath(null);
    setMobileMenuStack([]);
    setMenuOpenPath(pathname);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen, pathname]);

  useEffect(() => {
    if (!isSearchOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpenPath(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen]);

  const currentSection = useMemo(() => {
    return navigationItems.find((item) => isActivePath(pathname, item.href))?.label ?? "Главная";
  }, [navigationItems, pathname]);

  const resolvedTopGroups = normalizeHeaderGroups(top);
  const resolvedMiddleGroups = normalizeHeaderGroups(middle);
  const resolvedBottomGroups = normalizeHeaderGroups(bottom);
  const resolvedMobileGroups = normalizeHeaderGroups(mobile);

  const topSlots = splitGroupsByPosition(resolvedTopGroups);
  const middleSlots = splitGroupsByPosition(resolvedMiddleGroups);
  const bottomSlots = splitGroupsByPosition(resolvedBottomGroups);
  const mobileSlots = splitGroupsByPosition(resolvedMobileGroups.length ? resolvedMobileGroups : [...resolvedTopGroups, ...resolvedMiddleGroups, ...resolvedBottomGroups]);

  const mobileGroups = mobileSlots.left.length || mobileSlots.center.length || mobileSlots.right.length
    ? [...mobileSlots.left, ...mobileSlots.center, ...mobileSlots.right]
    : [];
  const hasHeaderContent = resolvedTopGroups.length > 0 || resolvedMiddleGroups.length > 0 || resolvedBottomGroups.length > 0 || mobileGroups.length > 0;

  useEffect(() => {
    const topNode = topRowRef.current;
    const middleNode = middleRowRef.current;
    const bottomNode = bottomRowRef.current;
    const mobileNode = mobileRowRef.current;

    const updateHeights = () => {
      setTopRowHeight(topNode?.offsetHeight ?? 0);
      setMiddleRowHeight(middleNode?.offsetHeight ?? 0);
      setBottomRowHeight(bottomNode?.offsetHeight ?? 0);
      setMobileRowHeight(mobileNode?.offsetHeight ?? 0);
    };

    updateHeights();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeights);

      return () => window.removeEventListener("resize", updateHeights);
    }

    const observer = new ResizeObserver(() => updateHeights());

    if (topNode) {
      observer.observe(topNode);
    }

    if (middleNode) {
      observer.observe(middleNode);
    }

    if (bottomNode) {
      observer.observe(bottomNode);
    }

    if (mobileNode) {
      observer.observe(mobileNode);
    }

    window.addEventListener("resize", updateHeights);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeights);
    };
  }, [resolvedTopGroups.length, resolvedMiddleGroups.length, resolvedBottomGroups.length, mobileGroups.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (!isMobileViewport || typeof window === "undefined") {
      return;
    }

    if (!isMenuOpen) {
      return;
    }

    console.info("[site-header] mobile menu opened", {
      scrollY: window.scrollY,
      mobileRowHeight,
      pathname,
      mobileRowMode: "sticky",
    });
  }, [isMenuOpen, isMobileViewport, mobileRowHeight, pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const desktopTopPinned = theme.topPinned ?? true;
    const desktopMiddlePinned = theme.middlePinned ?? true;
    const desktopBottomPinned = theme.bottomPinned ?? false;
    const desktopStickyOffset =
      (desktopTopPinned ? topRowHeight : 0) +
      (desktopMiddlePinned ? middleRowHeight : 0) +
      (desktopBottomPinned ? bottomRowHeight : 0);
    const stickyOffset = isMobileViewport
      ? mobileRowHeight + (isMenuOpen ? 1 : 0)
      : desktopStickyOffset;

    root.style.setProperty("--site-header-offset", `${stickyOffset}px`);
    root.style.setProperty("--site-header-offset-with-gap", `calc(${stickyOffset}px + 1.5rem)`);

    return () => {
      root.style.removeProperty("--site-header-offset");
      root.style.removeProperty("--site-header-offset-with-gap");
    };
  }, [bottomRowHeight, isMenuOpen, isMobileViewport, middleRowHeight, mobileRowHeight, theme.bottomPinned, theme.middlePinned, theme.topPinned, topRowHeight]);

  if (!hasHeaderContent) {
    return null;
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      router.push("/search");
      setSearchOpenPath(null);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpenPath(null);
  };

  const renderHeaderItem = (item: HeaderLink, key: string, compact = false, inheritRowTheme = false) => {
    const isDarkTheme = currentTheme === "dark";
    const themedStyle = buildHeaderStyle({
      backgroundColor: isDarkTheme
        ? item.activeBackgroundColor ?? item.backgroundColor
        : item.backgroundColor,
      textColor: isDarkTheme
        ? item.activeTextColor ?? item.textColor
        : item.textColor,
      borderColor: item.borderColor,
    });

    switch (item.kind) {
      case "logo": {
        const hasLogoImage = Boolean(lightLogo?.url || darkLogo?.url);
        const fallbackLabel = item.label?.trim();

        if (!hasLogoImage && !fallbackLabel) {
          return null;
        }

        return (
          <Link key={key} href={item.href || "/"} className={`inline-flex items-center gap-4 ${compact ? "min-w-0" : ""}`} style={themedStyle}>
            {hasLogoImage ? (
              <span
                className="relative flex shrink-0 items-center"
                style={{
                  height: "var(--header-logo-size, 3rem)",
                  width: "fit-content",
                }}
              >
                {lightLogo?.url ? (
                  <Image
                    src={lightLogo.url}
                    alt={lightLogo.alternativeText ?? siteName}
                    width={400}
                    height={120}
                    sizes="100vw"
                    className="block h-[var(--header-logo-size,3rem)] w-auto object-contain"
                  />
                ) : null}
                {!lightLogo?.url && darkLogo?.url ? (
                  <Image
                    src={darkLogo.url}
                    alt={darkLogo.alternativeText ?? siteName}
                    width={400}
                    height={120}
                    sizes="100vw"
                    className="block h-[var(--header-logo-size,3rem)] w-auto object-contain"
                  />
                ) : null}
              </span>
            ) : (
              <span className={`type-h4 block ${compact ? "min-w-0 truncate" : ""}`}>{fallbackLabel}</span>
            )}
          </Link>
        );
      }
      case "menu-toggle":
        return (
          <button
            key={key}
            type="button"
            aria-controls="mobile-site-menu"
            aria-expanded={isMenuOpen}
            aria-label={item.label || (isMenuOpen ? "Закрыть меню" : "Открыть меню")}
            className={compact
              ? "inline-flex h-11 w-11 items-center justify-center bg-transparent text-white transition-opacity hover:opacity-80"
              : inheritRowTheme
                ? "font-menu inline-flex min-h-11 items-center justify-center gap-2 border border-current/15 bg-transparent px-4 text-inherit transition-colors hover:bg-white/10 hover:text-inherit"
                : "font-menu inline-flex min-h-11 items-center justify-center gap-2 border border-black/8 bg-white px-4 text-zinc-800 transition-colors hover:border-emerald-900/12 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-emerald-950/35"
            }
            style={compact
              ? themedStyle
              : {
                  ...(themedStyle ?? {}),
                  minHeight: "var(--header-control-height, 2.75rem)",
                }}
            onClick={toggleMobileMenu}
          >
            <span className="flex h-4 w-4 flex-col justify-between" aria-hidden="true">
              <span className="block h-[1.5px] w-full bg-current" />
              <span className="block h-[1.5px] w-full bg-current" />
              <span className="block h-[1.5px] w-full bg-current" />
            </span>
            {!compact ? <span>{item.label || (isMenuOpen ? "Закрыть" : "Меню")}</span> : null}
          </button>
        );
      case "search":
        return (
          <button
            key={key}
            type="button"
            aria-label={item.label || "Поиск"}
            className={compact
              ? "inline-flex h-11 w-11 items-center justify-center bg-transparent text-white transition-opacity hover:opacity-80"
              : inheritRowTheme
                ? "hidden h-11 w-11 items-center justify-center bg-transparent text-white transition-opacity hover:opacity-80 sm:inline-flex"
                : "hidden h-11 w-11 items-center justify-center bg-transparent text-white transition-opacity hover:opacity-80 sm:inline-flex"
            }
            style={compact ? themedStyle : { ...(themedStyle ?? {}), minHeight: "var(--header-control-height, 2.75rem)" }}
            onClick={() => {
              setSearchOpenPath((value) => (value !== pathname ? pathname : null));
            }}
          >
            <HeaderIcon kind="search" />
          </button>
        );
      case "theme-toggle":
        return <ThemeToggle key={key} colors={item} compact={compact} inheritRowTheme={inheritRowTheme} />;
      case "socials":
        return (
            <SocialLinks
              key={key}
              widget={item.socialLinks}
              fallbackWidget={socialLinks}
              className="min-w-0"
              listClassName={compact ? "mt-0 gap-2" : "mt-0 gap-2"}
              itemClassName={compact ? "opacity-90 hover:opacity-100" : inheritRowTheme ? "opacity-90 hover:opacity-100" : "opacity-90 hover:opacity-100"}
            iconClassName={compact ? "h-9 w-9" : "h-10 w-10"}
          />
        );
      case "ticker":
        if (!item.text && !tickerText && !item.label) {
          return null;
        }

        const tickerLabel = item.text || tickerText || item.label || "";
        const tickerSegments = repeatTickerItems([
          <span className="header-ticker__segment" key={`${key}-segment-base`}>
            {item.image?.url ? (
              <Image
                src={item.image.url}
                alt={item.image.alternativeText ?? tickerLabel}
                width={28}
                height={28}
                className="header-ticker__image"
              />
            ) : null}
            <span>{tickerLabel}</span>
          </span>,
        ]);

        return (
          <div
            key={key}
            className={inheritRowTheme
                ? "font-menu header-ticker min-w-0 overflow-hidden border border-current/15 bg-transparent px-0 py-2 text-inherit"
                : "font-menu header-ticker min-w-0 overflow-hidden border border-black/5 bg-black/[0.02] px-0 py-2 text-zinc-700"}
            style={inheritRowTheme
              ? buildHeaderStyle({
                  textColor: isDarkTheme
                    ? item.activeTextColor ?? item.textColor
                    : item.textColor,
                })
              : themedStyle}
          >
            <div className="header-ticker__track" aria-label={tickerLabel}>
              {tickerSegments.map((segment, segmentIndex) => (
                <span key={`${key}-segment-${segmentIndex}`}>{segment}</span>
              ))}
            </div>
          </div>
        );
      case "account":
      case "link": {
        if (item.kind === "account") {
          return (
            <AuthWidget
              key={key}
              label={item.label || "Аккаунт"}
              compact
              className="shrink-0"
              buttonStyle={compact
                ? themedStyle
                : {
                    ...(themedStyle ?? {}),
                    minHeight: "var(--header-control-height, 2.75rem)",
                  }}
              buttonClassName={compact
                ? "inline-flex h-11 w-11 items-center justify-center transition-colors hover:bg-emerald-50 hover:text-emerald-950 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-100"
                : inheritRowTheme
                  ? "inline-flex h-11 w-11 items-center justify-center border border-current/15 bg-transparent text-inherit transition-colors hover:bg-white/10 hover:text-inherit"
                  : "inline-flex h-11 w-11 items-center justify-center border border-black/6 bg-white transition-colors hover:border-emerald-900/10 hover:bg-emerald-50 hover:text-emerald-950 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-300/15 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-100"}
            />
          );
        }

        if (!item.label || !item.href) {
          if (!item.label || compact) {
            return null;
          }
        }

        const href = item.href || "/";
        const children = normalizeNavigationChildren(item.children);
        const hasChildren = children.length > 0;
        const isActive = Boolean(item.href && isActivePath(pathname, href));
        const isChildActive = children.some((child) => child.href && isActivePath(pathname, child.href));
        const isCurrent = isActive || isChildActive;
        const baseClassName = compact
          ? isCurrent
            ? "font-menu bg-[#10351d] px-4 py-3 text-white dark:bg-emerald-500 dark:text-[#05210d]"
            : "font-menu px-4 py-3 text-zinc-700 transition-colors hover:bg-emerald-50 hover:text-emerald-950 dark:text-zinc-200 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-100"
          : inheritRowTheme
            ? isCurrent
              ? "font-menu border border-current/20 bg-white/12 px-4 text-inherit shadow-[0_14px_35px_rgba(16,53,29,0.18)]"
              : "font-menu border border-current/15 bg-transparent px-4 text-inherit transition-colors hover:bg-white/10 hover:text-inherit"
            : isCurrent
              ? "font-menu border border-emerald-900/15 bg-[#10351d] px-4 text-white shadow-[0_14px_35px_rgba(16,53,29,0.18)] dark:border-emerald-300/20 dark:bg-emerald-500 dark:text-[#05210d]"
              : "font-menu border border-black/6 bg-white px-4 text-zinc-700 transition-colors hover:border-emerald-900/10 hover:bg-emerald-50 hover:text-emerald-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:border-emerald-300/15 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-100";
        const baseStyle = compact
          ? themedStyle
          : {
              ...(themedStyle ?? {}),
              minHeight: "var(--header-control-height, 2.75rem)",
            };
        const desktopMenuItemClassName = compact ? baseClassName : `${baseClassName} inline-flex items-center justify-center`;

        if (compact || !hasChildren) {
          if (!item.href) {
            return null;
          }

          return (
            <Link key={key} href={href} aria-current={isActive ? "page" : undefined} className={desktopMenuItemClassName} style={baseStyle}>
              {item.label}
            </Link>
          );
        }

        const triggerContent = <span>{item.label}</span>;

        return (
          <div key={key} className="group/menu-item relative">
            {item.href ? (
              <Link href={href} aria-current={isActive ? "page" : undefined} className={`${desktopMenuItemClassName} gap-2`} style={baseStyle}>
                {triggerContent}
              </Link>
            ) : (
              <span className={`${desktopMenuItemClassName} gap-2`} style={baseStyle}>
                {triggerContent}
              </span>
            )}

            <div className="invisible absolute left-0 top-full z-[90] min-w-[16rem] pt-2 opacity-0 transition-all duration-150 group-hover/menu-item:visible group-hover/menu-item:opacity-100 group-focus-within/menu-item:visible group-focus-within/menu-item:opacity-100">
              <div className="border border-black/8 bg-white p-2 text-zinc-900 shadow-[0_24px_80px_rgba(8,18,12,0.18)] dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-100">
                <div className="grid gap-1">
                  {children.map((child, childIndex) => {
                    const childHref = child.href ?? "/";
                    const childActive = child.href ? isActivePath(pathname, childHref) : false;

                    return (
                      <Link
                        key={`${key}-child-${childIndex}`}
                        href={childHref}
                        aria-current={childActive ? "page" : undefined}
                        className={childActive
                          ? "font-menu border border-emerald-900/15 bg-[#10351d] px-4 py-3 text-white dark:border-emerald-300/20 dark:bg-emerald-500 dark:text-[#05210d]"
                          : "font-menu border border-transparent px-4 py-3 text-zinc-900 transition-colors hover:border-emerald-900/10 hover:bg-emerald-50 hover:text-emerald-950 dark:text-zinc-200 dark:hover:border-emerald-300/15 dark:hover:bg-emerald-950/35 dark:hover:text-emerald-100"}
                      >
                        <span className="block">{child.label}</span>
                        {child.description ? <span className="type-caption mt-1 block text-zinc-500 dark:text-zinc-400">{child.description}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderGroup = (group: ResolvedHeaderGroup, index: number, compact = false, inheritRowTheme = false) => (
    <div
      key={`${group.title ?? "group"}-${index}`}
      className={compact ? "flex min-w-0 flex-nowrap items-center gap-3" : "flex flex-wrap items-center gap-3"}
      style={buildHeaderStyle({ backgroundColor: group.backgroundColor })}
    >
      {group.title && !compact ? (
        <span className={inheritRowTheme ? "type-caption text-inherit/70" : "type-caption text-zinc-500"} style={group.titleColor ? { color: group.titleColor } : undefined}>
          {group.title}
        </span>
      ) : null}
      <div className={compact ? "flex min-w-0 flex-nowrap items-center gap-2" : "flex flex-wrap items-center gap-2"}>
        {group.items.map((item, itemIndex) => renderHeaderItem(item, `${group.title ?? "group"}-${index}-${itemIndex}`, compact, inheritRowTheme))}
      </div>
    </div>
  );

  const collectTickerItems = (slots: HeaderSlots) => {
    return [...slots.left, ...slots.center, ...slots.right].flatMap((group) =>
      group.items.map((item, itemIndex) => ({
        item,
        key: `${group.title ?? "group"}-${group.position}-${itemIndex}`,
      })),
    );
  };

  const isDarkTheme = currentTheme === "dark";
  const mobileThemeStyle = buildHeaderStyle({
    backgroundColor: isDarkTheme
      ? theme.mobileBackgroundColor ?? theme.middleBackgroundColor ?? theme.backgroundColor
      : theme.middleBackgroundColor ?? theme.backgroundColor ?? theme.mobileBackgroundColor,
    textColor: isDarkTheme
      ? theme.mobileTextColor ?? theme.textColor
      : theme.textColor ?? theme.mobileTextColor,
    borderColor: theme.mobileBorderColor ?? theme.borderColor,
    opacity: theme.mobileOpacity,
  });
  const mobileRowMetrics = resolveRowMetrics(theme.mobileHeight);
  const desktopTopPinned = false;
  const desktopMiddlePinned = theme.middlePinned ?? true;
  const desktopBottomPinned = theme.bottomPinned ?? false;
  const derivedDesktopMobileMenu = buildMobileMenuFromHeaderGroups([
    ...resolvedTopGroups,
    ...resolvedMiddleGroups,
    ...resolvedBottomGroups,
  ]);
  const fallbackMobileMenu = buildMobileMenuFromSections(mobileMenuSections);
  const resolvedMobileMenu =
    derivedDesktopMobileMenu.length
      ? derivedDesktopMobileMenu
      : fallbackMobileMenu;
  const activeMobileMenuSection = mobileMenuStack[mobileMenuStack.length - 1] ?? null;

  const renderRow = (
    slots: ReturnType<typeof splitGroupsByPosition>,
    options?: {
      topBorder?: boolean;
      rowClassName?: string;
      backgroundColor?: string | null;
      pinned?: boolean;
      opacity?: number | null;
      height?: number | null;
      topOffset?: number;
      zIndexClassName?: string;
      rowRef?: React.RefObject<HTMLDivElement | null>;
      inheritRowTheme?: boolean;
    },
  ) => {
    const hasContent = slots.left.length || slots.center.length || slots.right.length;
    const rowMetrics = resolveRowMetrics(options?.height);
    const tickerItems = collectTickerItems(slots).filter(({ item }) => item.kind === "ticker");
    const nonTickerItemsCount = collectTickerItems(slots).length - tickerItems.length;
    const isFullWidthTickerRow = tickerItems.length > 0 && nonTickerItemsCount === 0;

    if (!hasContent) {
      return null;
    }

    return (
      <div
        ref={options?.rowRef}
        className={`${options?.topBorder ? "border-t border-black/5 dark:border-white/10" : ""} ${
          options?.pinned ? `sticky ${options?.zIndexClassName ?? "z-40"}` : ""
        } ${options?.rowClassName ?? ""}`}
        style={{
          ...(buildHeaderStyle({
            backgroundColor: options?.backgroundColor ?? theme.backgroundColor,
            borderColor: theme.borderColor,
            textColor: theme.textColor,
            opacity: options?.opacity,
          }) ?? {}),
          ...(rowMetrics.rowHeight
            ? {
                ["--header-row-height" as string]: `${rowMetrics.rowHeight}px`,
                ["--header-control-height" as string]: `${rowMetrics.controlHeight}px`,
                ["--header-logo-size" as string]: `${rowMetrics.logoSize}px`,
                ["--header-row-padding-y" as string]: `${rowMetrics.verticalPadding}px`,
              }
            : {}),
          ...(options?.pinned ? { top: `${options.topOffset ?? 0}px` } : {}),
        }}
      >
        {isFullWidthTickerRow ? (
          <div
            className="w-full"
            style={rowMetrics.rowHeight
              ? {
                  minHeight: `${rowMetrics.rowHeight}px`,
                  paddingTop: `${rowMetrics.verticalPadding}px`,
                  paddingBottom: `${rowMetrics.verticalPadding}px`,
                }
              : { paddingTop: "1rem", paddingBottom: "1rem" }}
          >
            {tickerItems.map(({ item, key }) => renderHeaderItem(item, key, false, options?.inheritRowTheme ?? false))}
          </div>
        ) : (
          <div
            className="mx-auto grid max-w-[1440px] gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8"
            style={rowMetrics.rowHeight
              ? {
                  minHeight: `${rowMetrics.rowHeight}px`,
                  paddingTop: `${rowMetrics.verticalPadding}px`,
                  paddingBottom: `${rowMetrics.verticalPadding}px`,
                }
              : { paddingTop: "1rem", paddingBottom: "1rem" }}
          >
            <div className="flex flex-wrap items-center gap-3">{slots.left.map((group, index) => renderGroup(group, index, false, options?.inheritRowTheme ?? false))}</div>
            <div className="flex flex-wrap items-center justify-center gap-3">{slots.center.map((group, index) => renderGroup(group, index, false, options?.inheritRowTheme ?? false))}</div>
            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">{slots.right.map((group, index) => renderGroup(group, index, false, options?.inheritRowTheme ?? false))}</div>
          </div>
        )}
      </div>
    );
  };

  const renderMobileMenuLink = (item: MobileMenuLinkItem, key: string) => {
    if (!item?.label) {
      return null;
    }

    if (item.kind === "account") {
      return (
        <AuthWidget
          key={key}
          label={item.label}
          className="w-full"
          buttonClassName="type-button inline-flex w-full items-center justify-start border-t border-white/15 px-0 py-4 !text-white transition-colors hover:!text-white/80"
          panelClassName="relative right-auto top-auto mt-4 w-full border border-white/15 bg-transparent !text-white shadow-none"
        />
      );
    }

    if (!item.href) {
      return (
        <div
          key={key}
          className="type-body border-t border-white/15 py-4 !text-white"
        >
          {item.label}
        </div>
      );
    }

    return (
      <Link
        key={key}
        href={item.href}
        className="type-body flex items-start justify-between gap-3 border-t border-white/15 py-4 !text-white transition-colors hover:!text-white/80"
        onClick={() => {
          closeMobileMenu();
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block">{item.label}</span>
          {item.description ? <span className="type-caption mt-1 block !text-white">{item.description}</span> : null}
        </span>
      </Link>
    );
  };

  const renderMobileMenuEntry = (item: MobileMenuEntry, key: string) => {
    if (!item.label) {
      return null;
    }

    if (item.children.length) {
      return (
        <button
          key={key}
          type="button"
          className="flex items-start justify-between gap-3 border-t border-white/15 py-4 text-left !text-white transition-colors hover:!text-white/80"
          onClick={() => {
            setMobileMenuStack((stack) => [...stack, item]);
          }}
        >
          <span className="min-w-0 flex-1">
            <span className="type-body block">{item.label}</span>
            {item.description ? <span className="type-caption mt-1 block !text-white">{item.description}</span> : null}
          </span>
          <span className="mt-1 shrink-0">
            <ChevronIcon />
          </span>
        </button>
      );
    }

    return renderMobileMenuLink(
      {
        kind: item.kind,
        label: item.label,
        href: item.href,
        description: item.description,
      },
      key,
    );
  };

  const renderMobileMenuContent = () => {
    if (activeMobileMenuSection) {
      return (
        <div className="grid gap-0">
          {activeMobileMenuSection.description ? (
            <p className="type-small pb-4 !text-white">{activeMobileMenuSection.description}</p>
          ) : null}

          {activeMobileMenuSection.href ? renderMobileMenuLink({
            kind: activeMobileMenuSection.kind,
            label: "Открыть раздел",
            href: activeMobileMenuSection.href,
            description: activeMobileMenuSection.label,
          }, `mobile-menu-open-section-${activeMobileMenuSection.label}`) : null}

          {activeMobileMenuSection.children.map((item, itemIndex) =>
            renderMobileMenuLink(item, `mobile-menu-leaf-${activeMobileMenuSection.label}-${itemIndex}`),
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-0">
        {resolvedMobileMenu.map((item, itemIndex) => renderMobileMenuEntry(item, `mobile-root-entry-${itemIndex}`))}

        {!resolvedMobileMenu.length ? (
          <div className="type-body border-t border-white/15 py-4 !text-white">
            Пункты мобильного меню не настроены.
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="z-50 md:contents">
      {renderRow(topSlots, {
        rowClassName: "hidden md:block",
        backgroundColor: theme.topBackgroundColor ?? theme.backgroundColor,
        pinned: desktopTopPinned,
        opacity: theme.topOpacity,
        height: theme.topHeight,
        topOffset: 0,
        zIndexClassName: "z-50",
        rowRef: topRowRef,
        inheritRowTheme: true,
      })}
      {renderRow(middleSlots, {
        topBorder: true,
        rowClassName: "hidden md:block",
        backgroundColor: theme.middleBackgroundColor ?? theme.backgroundColor,
        pinned: desktopMiddlePinned,
        opacity: theme.middleOpacity,
        height: theme.middleHeight,
        topOffset: desktopTopPinned ? topRowHeight : 0,
        zIndexClassName: "z-40",
        rowRef: middleRowRef,
      })}
      {renderRow(bottomSlots, {
        topBorder: true,
        rowClassName: "hidden md:block",
        backgroundColor: theme.bottomBackgroundColor ?? theme.backgroundColor,
        pinned: desktopBottomPinned,
        opacity: theme.bottomOpacity,
        height: theme.bottomHeight,
        topOffset: (desktopTopPinned ? topRowHeight : 0) + (desktopMiddlePinned ? middleRowHeight : 0),
        zIndexClassName: "z-30",
        rowRef: bottomRowRef,
      })}

      {isSearchOpen ? (
        <>
          <button
            type="button"
            aria-label="Закрыть поиск"
            className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[2px]"
            style={{ top: "var(--site-header-offset, 0px)" }}
            onClick={() => setSearchOpenPath(null)}
          />
          <div
            className="fixed inset-x-0 z-[80] border-t border-black/5 shadow-[0_24px_80px_rgba(8,18,12,0.22)] dark:border-white/10"
            style={{
              top: "var(--site-header-offset, 0px)",
              ...(buildHeaderStyle({
                borderColor: theme.borderColor,
                backgroundColor: theme.middleBackgroundColor ?? theme.backgroundColor,
                textColor: theme.textColor,
              }) ?? {}),
            }}
          >
            <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <form className="flex items-center gap-3" onSubmit={(event) => handleSearchSubmit(event)}>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Поиск по сайту"
                    className="font-menu h-14 min-w-0 flex-1 border border-white bg-transparent px-5 text-white outline-none transition-opacity placeholder:text-white/70 focus:border-white"
                  />
                  <button
                    type="submit"
                    aria-label="Запустить поиск"
                    className="inline-flex h-14 w-14 shrink-0 items-center justify-center bg-transparent text-white transition-opacity hover:opacity-80"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="6" />
                      <path d="m20 20-4.2-4.2" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div
        ref={mobileRowRef}
        className="sticky top-0 z-[90] border-t border-black/5 md:hidden dark:border-white/10"
        style={mobileThemeStyle}
      >
        <div
          className="grid gap-3 px-4"
          style={mobileRowMetrics.rowHeight
            ? {
                minHeight: `${mobileRowMetrics.rowHeight}px`,
                paddingTop: `${mobileRowMetrics.verticalPadding}px`,
                paddingBottom: `${mobileRowMetrics.verticalPadding}px`,
              }
            : { paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
        >
          {mobileGroups.length ? (
            <div className="flex flex-nowrap items-center justify-between gap-3 overflow-hidden">
              <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
                {mobileSlots.left.map((group, index) => renderGroup(group, index, true, true))}
              </div>
              {mobileSlots.center.length ? (
                <div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-center gap-2">
                  {mobileSlots.center.map((group, index) => renderGroup(group, index, true, true))}
                </div>
              ) : null}
              {mobileSlots.right.length ? (
                <div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2">
                  {mobileSlots.right.map((group, index) => renderGroup(group, index, true, true))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="font-menu text-white">Сейчас: {currentSection}</span>
              {renderHeaderItem({ kind: "menu-toggle", label: isMenuOpen ? "Закрыть" : "Меню" }, "mobile-fallback-menu-toggle", true, true)}
            </div>
          )}
        </div>

        {isMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Закрыть меню"
              className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[2px] md:hidden"
              style={{ top: "var(--site-header-offset, 0px)" }}
              onClick={() => {
                closeMobileMenu();
              }}
            />

            <div
              id="mobile-site-menu"
              className="fixed inset-x-0 bottom-0 z-[80] overflow-hidden border-t border-black/5 shadow-[0_24px_80px_rgba(8,18,12,0.22)] md:hidden dark:border-white/10"
              style={{
                top: "var(--site-header-offset, 0px)",
                ...(mobileThemeStyle ?? {}),
              }}
            >
              <div className="flex h-full flex-col">
                <div
                  className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-4 dark:border-white/10"
                  style={buildHeaderStyle({ borderColor: theme.mobileBorderColor ?? theme.borderColor })}
                >
                  {activeMobileMenuSection ? (
                    <button
                      type="button"
                      className="inline-flex min-w-0 items-center gap-2 text-left text-white transition-colors hover:text-white/80"
                      onClick={() => setMobileMenuStack((stack) => stack.slice(0, -1))}
                    >
                      <ChevronIcon direction="left" />
                      <span className="type-body">Назад</span>
                    </button>
                  ) : (
                    <span className="type-body text-white">Меню</span>
                  )}

                  <button
                    type="button"
                    aria-label="Закрыть меню"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-white transition-colors hover:text-white/80"
                    onClick={() => {
                      closeMobileMenu();
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6 18 18" />
                      <path d="M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
                     {activeMobileMenuSection ? (
                        <div className="mb-4">
                        <h2 className="type-h4 text-white">{activeMobileMenuSection.label}</h2>
                        </div>
                     ) : null}

                    {renderMobileMenuContent()}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
