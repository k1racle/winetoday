import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import { Inter, Oswald } from "next/font/google";
import Link from "next/link";
import Script from "next/script";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AuthWidget } from "@/components/auth-widget";
import { FirstVisitNotice } from "@/components/first-visit-notice";
import { MobileWidgetsProvider } from "@/components/mobile-widgets-provider";
import { PreviewBanner } from "@/components/preview-banner";
import { SocialLinks } from "@/components/social-links";
import { SiteHeader } from "@/components/site-header";
import { TagCloud } from "@/components/tag-cloud";
import { buildSeoMetadata, getGlobalSettings, getSiteFooter, getSiteHeader, getSiteSeo, getTagCloud, type FooterItem, withLoggedFallback } from "@/lib/strapi";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
  display: "swap",
});

const yandexMetrikaInitScript = `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108722624', 'ym');

ym(108722624, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteSeo] = await Promise.all([
    withLoggedFallback("layout metadata global settings", () => getGlobalSettings(), null),
    withLoggedFallback("layout metadata site seo", () => getSiteSeo(), null),
  ]);

  const metadata = buildSeoMetadata({
    title: settings?.siteName ?? "Виноделие сегодня",
    description:
      settings?.siteDescription ?? "Современный русскоязычный портал о виноделии: новости, статьи, видео и аналитика.",
    siteSeo,
    path: "/",
    image: settings?.logo?.url ?? siteSeo?.openGraphImage?.url ?? siteSeo?.twitterImage?.url ?? null,
  });

  return {
    ...metadata,
    title: {
      default: typeof metadata.title === "string" ? metadata.title : settings?.siteName ?? "Виноделие сегодня",
      template: "%s | Виноделие сегодня",
    },
    applicationName: settings?.siteName ?? "Виноделие сегодня",
    manifest: "/manifest.json",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#08110b" },
  ],
};

const fallbackNavigationItems = [
  { href: "/", label: "Главная" },
  { href: "/articles", label: "Статьи" },
  { href: "/news", label: "Новости" },
  { href: "/videos", label: "Видео" },
];

function FooterContactIcon({ kind }: { kind: "phone" | "email" | "address" }) {
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5.5 4.5h3.1l1.3 3.6-1.9 1.7a14 14 0 0 0 6.2 6.2l1.7-1.9 3.6 1.3v3.1a1.5 1.5 0 0 1-1.7 1.5A17.3 17.3 0 0 1 4 6.2 1.5 1.5 0 0 1 5.5 4.5Z" />
      </svg>
    );
  }

  if (kind === "email") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m5 7 7 5 7-5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-5.5-5-5.5-10a5.5 5.5 0 1 1 11 0c0 5-5.5 10-5.5 10Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

const themeScript = `(() => {
  const storageKey = "vino-theme";
  const root = document.documentElement;
  const storedTheme = window.localStorage.getItem(storageKey);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : systemPrefersDark
      ? "dark"
      : "light";

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
})();`;

function resolveFontFamily(
  fontFamily?:
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
    | "system-serif"
    | null,
) {
  switch (fontFamily) {
    case "oswald":
      return 'var(--font-oswald), "Arial Narrow", "Arial", sans-serif';
    case "tt-norms-regular":
      return '"TT Norms Pro Regular", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-normal":
      return '"TT Norms Pro Normal", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-medium":
      return '"TT Norms Pro Medium", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-light":
      return '"TT Norms Pro Light", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-extra-light":
      return '"TT Norms Pro ExtraLight", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-thin":
      return '"TT Norms Pro Thin", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-bold":
      return '"TT Norms Pro Bold", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-extra-bold":
      return '"TT Norms Pro ExtraBold", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-black":
      return '"TT Norms Pro Black", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "tt-norms-extra-black":
      return '"TT Norms Pro ExtraBlack", var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "system-sans":
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case "system-serif":
      return 'Georgia, "Times New Roman", serif';
    case "inter":
    default:
      return 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { isEnabled: isPreview } = await draftMode();
  const [settings, headerSettings, footerSettings, tagCloud] = await Promise.all([
    withLoggedFallback("layout global settings", () => getGlobalSettings(), null),
    withLoggedFallback("layout site header", () => getSiteHeader(), null),
    withLoggedFallback("layout site footer", () => getSiteFooter(), null),
    withLoggedFallback("layout tag cloud", () => getTagCloud(), []),
  ]);

  const navigationItems = headerSettings?.menuLinks?.length
    ? headerSettings.menuLinks
        .filter((item) => Boolean(item?.label?.trim() && item?.href?.trim()))
        .map((item) => ({ href: item.href as string, label: item.label as string }))
    : fallbackNavigationItems;
  const hasHeaderContent = Boolean(
    headerSettings?.lightLogo ||
      headerSettings?.darkLogo ||
      (headerSettings?.menuLinks?.length ?? 0) ||
      (navigationItems.length ?? 0),
  );

  const footerColumns = [
    footerSettings?.column1 ?? null,
    footerSettings?.column2 ?? null,
    footerSettings?.column3 ?? null,
    footerSettings?.column4 ?? null,
  ];
  const hasFooterColumnContent = (column: typeof footerColumns[number]) => Boolean(
    column?.title || column?.items?.some((item) => item.kind === "tagCloud" || item.kind === "socials" || item.label || item.text || item.href || item.image?.url || item.socialLinks?.links?.length),
  );
  const hasCustomFooterColumns = footerColumns.some(
    (column) => hasFooterColumnContent(column),
  );
  const footerDisplayColumns = footerColumns
    .filter((column) => hasFooterColumnContent(column))
    .reduce<typeof footerColumns[number][][]>((groups, column, index) => {
      if (index < 2) {
        groups.push([column]);
        return groups;
      }

      if (!groups[2]) {
        groups[2] = [];
      }

      groups[2].push(column);
      return groups;
    }, []);

  function renderFooterItem(item: FooterItem, index: number) {
    if (item.kind === "image" && item.image?.url) {
      return (
        <div key={`footer-item-${index}`} className="mt-1">
          <Image
            src={item.image.url}
            alt={item.image.alternativeText ?? item.label ?? ""}
            width={160}
            height={96}
            className="max-h-24 w-auto object-contain"
          />
          {item.label ? <p className="type-small mt-2 opacity-80">{item.label}</p> : null}
        </div>
      );
    }

    if (item.kind === "tagCloud") {
      return tagCloud?.length ? (
        <TagCloud
          key={`footer-item-${index}`}
          tags={tagCloud}
          title={item.label || undefined}
          className="mt-1"
        />
      ) : null;
    }

    if (item.kind === "socials") {
      return (
        <SocialLinks
          key={`footer-item-${index}`}
          widget={item.socialLinks}
          fallbackWidget={settings?.socialLinks ?? null}
          className="mt-1"
          titleClassName="opacity-80"
          itemClassName="opacity-85 hover:opacity-100"
          iconClassName="h-9 w-9"
        />
      );
    }

    if (item.kind === "account") {
      return <AuthWidget key={`footer-item-${index}`} label={item.label || "Войти"} className="mt-1" buttonClassName="type-button inline-flex border border-white/15 px-4 py-2 transition-colors hover:text-white hover:border-white/30" panelClassName="relative right-auto top-auto mt-4 w-full border border-white/10 bg-[#0f1d14] p-5 text-white shadow-none" />;
    }

    if (item.kind === "link" && item.href && item.label) {
      return (
        <Link key={`footer-item-${index}`} href={item.href} className="font-menu transition-opacity hover:opacity-100" style={{ color: "inherit" }}>
          {item.label}
        </Link>
      );
    }

    if (item.kind === "phone" || item.kind === "email" || item.kind === "address") {
      const content = item.text || item.label;

      if (!content) {
        return null;
      }

      const href = item.href
        ?? (item.kind === "phone"
          ? `tel:${content.replace(/[^\d+]/g, "")}`
          : item.kind === "email"
            ? `mailto:${content}`
            : null);
      const icon = item.iconLabel ? <span className="type-caption opacity-60">{item.iconLabel}</span> : <FooterContactIcon kind={item.kind} />;
      const row = (
        <span className="flex items-center gap-3">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-80">
            {icon}
          </span>
          <span className="type-small">{content}</span>
        </span>
      );

      return href ? (
        <Link key={`footer-item-${index}`} href={href} className="transition-opacity hover:opacity-100" style={{ color: "inherit" }}>
          {row}
        </Link>
      ) : (
        <div key={`footer-item-${index}`}>{row}</div>
      );
    }

    if (item.text || item.label) {
      return <p key={`footer-item-${index}`} className="type-small opacity-80">{item.text || item.label}</p>;
    }

    return null;
  }

  const mobileBottomMenuLinks = settings?.mobileBottomNav?.length ? settings.mobileBottomNav : navigationItems;
  const typography = settings?.typography;
  const typographyStyleVars = (slot: {
    fontFamily?: string | null;
    fontSize?: string | null;
    mobileFontSize?: string | null;
    fontWeight?: string | null;
    lineHeight?: string | null;
    mobileLineHeight?: string | null;
    letterSpacing?: string | null;
    mobileLetterSpacing?: string | null;
    textTransform?: "none" | "uppercase" | null;
  } | null | undefined, prefix: string, fallback: {
    family: string;
    size: string;
    mobileSize: string;
    weight: string;
    lineHeight: string;
    mobileLineHeight: string;
    letterSpacing: string;
    mobileLetterSpacing: string;
    textTransform: "none" | "uppercase";
  }) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [`--font-${prefix}-family`]: resolveFontFamily((slot?.fontFamily ?? fallback.family) as any),
    [`--font-${prefix}-size`]: slot?.fontSize ?? fallback.size,
    [`--font-${prefix}-size-mobile`]: slot?.mobileFontSize ?? slot?.fontSize ?? fallback.mobileSize,
    [`--font-${prefix}-weight`]: slot?.fontWeight ?? fallback.weight,
    [`--font-${prefix}-line-height`]: slot?.lineHeight ?? fallback.lineHeight,
    [`--font-${prefix}-line-height-mobile`]: slot?.mobileLineHeight ?? slot?.lineHeight ?? fallback.mobileLineHeight,
    [`--font-${prefix}-letter-spacing`]: slot?.letterSpacing ?? fallback.letterSpacing,
    [`--font-${prefix}-letter-spacing-mobile`]: slot?.mobileLetterSpacing ?? slot?.letterSpacing ?? fallback.mobileLetterSpacing,
    [`--font-${prefix}-transform`]: slot?.textTransform ?? fallback.textTransform,
  });
  const typographyVars = {
    ...typographyStyleVars(typography?.menu, "menu", { family: "inter", size: "14px", mobileSize: "14px", weight: "500", lineHeight: "1.4", mobileLineHeight: "1.4", letterSpacing: "0.02em", mobileLetterSpacing: "0.02em", textTransform: "none" }),
    ...typographyStyleVars(typography?.body, "body", { family: "inter", size: "16px", mobileSize: "16px", weight: "400", lineHeight: "1.7", mobileLineHeight: "1.7", letterSpacing: "normal", mobileLetterSpacing: "normal", textTransform: "none" }),
    ...typographyStyleVars(typography?.hero ?? typography?.h1, "hero", { family: "oswald", size: "56px", mobileSize: "56px", weight: "700", lineHeight: "1", mobileLineHeight: "1", letterSpacing: "-0.03em", mobileLetterSpacing: "-0.03em", textTransform: "none" }),
    ...typographyStyleVars(typography?.heroEyebrow ?? typography?.menu, "hero-eyebrow", { family: "inter", size: "14px", mobileSize: "14px", weight: "500", lineHeight: "1.4", mobileLineHeight: "1.4", letterSpacing: "0.24em", mobileLetterSpacing: "0.24em", textTransform: "uppercase" }),
    ...typographyStyleVars(typography?.h1, "h1", { family: "oswald", size: "56px", mobileSize: "56px", weight: "700", lineHeight: "1", mobileLineHeight: "1", letterSpacing: "-0.03em", mobileLetterSpacing: "-0.03em", textTransform: "none" }),
    ...typographyStyleVars(typography?.h2, "h2", { family: "oswald", size: "32px", mobileSize: "32px", weight: "700", lineHeight: "1.1", mobileLineHeight: "1.1", letterSpacing: "-0.02em", mobileLetterSpacing: "-0.02em", textTransform: "none" }),
    ...typographyStyleVars(typography?.h3, "h3", { family: "oswald", size: "24px", mobileSize: "24px", weight: "700", lineHeight: "1.15", mobileLineHeight: "1.15", letterSpacing: "-0.02em", mobileLetterSpacing: "-0.02em", textTransform: "none" }),
    ...typographyStyleVars(typography?.h4, "h4", { family: "oswald", size: "20px", mobileSize: "20px", weight: "700", lineHeight: "1.2", mobileLineHeight: "1.2", letterSpacing: "-0.01em", mobileLetterSpacing: "-0.01em", textTransform: "none" }),
    ...typographyStyleVars(typography?.small, "small", { family: "inter", size: "14px", mobileSize: "14px", weight: "400", lineHeight: "1.6", mobileLineHeight: "1.6", letterSpacing: "normal", mobileLetterSpacing: "normal", textTransform: "none" }),
    ...typographyStyleVars(typography?.caption, "caption", { family: "inter", size: "12px", mobileSize: "12px", weight: "500", lineHeight: "1.4", mobileLineHeight: "1.4", letterSpacing: "0.24em", mobileLetterSpacing: "0.24em", textTransform: "uppercase" }),
    ...typographyStyleVars(typography?.button, "button", { family: "inter", size: "14px", mobileSize: "14px", weight: "500", lineHeight: "1.4", mobileLineHeight: "1.4", letterSpacing: "normal", mobileLetterSpacing: "normal", textTransform: "none" }),
  } as React.CSSProperties;

  return (
    <html
      lang="ru"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${oswald.variable} min-h-full bg-background text-foreground`}
        style={typographyVars}
      >
        <MobileWidgetsProvider>
          <FirstVisitNotice />
          <Script id="yandex-metrika" strategy="afterInteractive">
            {yandexMetrikaInitScript}
          </Script>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <noscript>
            <div>
              <img src="https://mc.yandex.ru/watch/108722624" style={{ position: "absolute", left: "-9999px" }} alt="" />
            </div>
          </noscript>
          <div className="flex min-h-full flex-col bg-white dark:bg-[#081623]">
            {isPreview ? <PreviewBanner exitHref="/" /> : null}
            <SiteHeader
              lightLogo={headerSettings?.lightLogo ?? null}
              darkLogo={headerSettings?.darkLogo ?? null}
              siteName={settings?.siteName ?? "Виноделие сегодня"}
              stickyDesktop={headerSettings?.stickyDesktop ?? true}
              stickyTablet={headerSettings?.stickyTablet ?? true}
              stickyMobile={headerSettings?.stickyMobile ?? true}
              menuLinks={headerSettings?.menuLinks ?? []}
              navigationItems={navigationItems}
            />

            <AuthWidget label="Открыть вход" listenOnly className="hidden" />

          <main className="flex-1 pb-3 md:pb-0">{children}</main>

          <footer
            className="mt-12 border-t border-black/5 dark:border-white/10"
            style={{
              backgroundColor: footerSettings?.backgroundColor ?? "#0b140d",
              color: footerSettings?.textColor ?? "#ffffff",
            }}
          >
            <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
              {hasCustomFooterColumns
                ? footerDisplayColumns.map((columnGroup, groupIndex) => (
                    <div key={`footer-column-group-${groupIndex}`} className="grid gap-10">
                      {columnGroup.map((column, columnIndex) => (
                        <section key={`footer-column-${groupIndex}-${columnIndex}`}>
                          {column?.title ? (
                            <p className="type-h4 text-[20px] leading-6 opacity-80">
                              {column.title}
                            </p>
                          ) : null}
                          {column?.items?.length ? (
                            <div className="mt-4 grid gap-3">
                              {column.items.map((item: FooterItem, itemIndex: number) => renderFooterItem(item, itemIndex))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  ))
                : (
                  <>
                    <section>
                      <p className="type-h4 text-[20px] leading-6">
                        {settings?.siteName ?? "Виноделие сегодня"}
                      </p>
                      <p className="type-small mt-4 max-w-xl opacity-80">
                        Редакционный портал о современной винной индустрии: аналитика, регионы, события, интервью и отраслевые новости.
                      </p>
                    </section>

                    <section>
                      <p className="type-h4 text-[20px] leading-6 opacity-80">
                        Разделы
                      </p>
                      <div className="font-menu mt-4 grid gap-3 opacity-90">
                        {navigationItems.map((item) => (
                          <Link key={`${item.href}-${item.label}`} href={item.href} className="transition-colors hover:text-white">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </section>

                    <section>
                      <p className="type-h4 text-[20px] leading-6 opacity-80">
                        Редакция
                      </p>
                      <div className="font-menu mt-4 grid gap-3 opacity-90">
                        <Link href="/o-proekte" className="transition-colors hover:text-white">О проекте</Link>
                        <Link href="/kontakty-redaktsii" className="transition-colors hover:text-white">Контакты редакции</Link>
                        <p className="pt-3">editor@vinotoday.local</p>
                        <p>+7 (900) 555-21-21</p>
                        <AuthWidget label="Войти" buttonClassName="type-button inline-flex rounded-full border border-white/15 px-4 py-2 transition-colors hover:text-white hover:border-white/30" panelClassName="relative right-auto top-auto mt-4 w-full rounded-[24px] border border-white/10 bg-[#0f1d14] p-5 text-white shadow-none" />
                      </div>
                    </section>

                    <section className="lg:col-span-3">
                      <TagCloud tags={tagCloud} className="pt-2" />
                    </section>
                  </>
                )}
            </div>
            {footerSettings?.bottomBarText ? (
              <div
                className="border-t"
                style={{
                  borderColor: footerSettings?.bottomBarTextColor ? `${footerSettings.bottomBarTextColor}22` : "rgba(255,255,255,0.1)",
                  backgroundColor: footerSettings?.bottomBarBackgroundColor ?? "rgba(0, 0, 0, 0.2)",
                  color: footerSettings?.bottomBarTextColor ?? footerSettings?.textColor ?? "#ffffff",
                }}
              >
                <div className="mx-auto max-w-[1440px] px-4 py-4 text-center sm:px-6 lg:px-8">
                  <p className="type-small">{footerSettings.bottomBarText}</p>
                </div>
              </div>
            ) : null}
          </footer>

            {hasHeaderContent ? <MobileBottomNav /> : null}
          </div>
        </MobileWidgetsProvider>
      </body>
    </html>
  );
}
