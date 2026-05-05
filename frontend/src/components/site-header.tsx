"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { AuthWidget } from "@/components/auth-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import type { MediaAsset, NavigationLink } from "@/lib/strapi";

type NavigationItem = {
  href: string;
  label: string;
};

type ThemeMode = "light" | "dark";

type SiteHeaderProps = {
  siteName: string;
  lightLogo?: MediaAsset | null;
  darkLogo?: MediaAsset | null;
  sticky?: boolean | null;
  menuLinks?: NavigationLink[] | null;
  /** fallback, пока Strapi меню пустое */
  navigationItems?: NavigationItem[];
};

const THEME_CHANGE_EVENT = "vino-theme-change";

function readThemeSnapshot(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function normalizeMenuLinks(menuLinks?: NavigationLink[] | null, fallback?: NavigationItem[]) {
  const normalized = (menuLinks ?? [])
    .filter((item) => item && item.label?.trim() && item.href?.trim())
    .map((item) => ({ href: item.href!.trim(), label: item.label.trim() }));

  if (normalized.length) {
    return normalized;
  }

  return (fallback ?? []).filter((item) => item.href && item.label);
}

export function SiteHeader({ siteName, lightLogo, darkLogo, sticky = true, menuLinks, navigationItems }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useSyncExternalStore<ThemeMode>(subscribeToTheme, readThemeSnapshot, () => "light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resolvedMenu = useMemo(() => normalizeMenuLinks(menuLinks, navigationItems), [menuLinks, navigationItems]);
  const logo = theme === "dark" ? (darkLogo?.url ? darkLogo : lightLogo) : (lightLogo?.url ? lightLogo : darkLogo);

  useEffect(() => {
    // чтобы у страниц с sticky сайдбаром оставался корректный отступ
    const root = document.documentElement;
    root.style.setProperty("--site-header-offset", sticky ? "136px" : "0px");
    root.style.setProperty("--site-header-offset-with-gap", sticky ? "calc(136px + 1.5rem)" : "7rem");
    return () => {
      root.style.removeProperty("--site-header-offset");
      root.style.removeProperty("--site-header-offset-with-gap");
    };
  }, [sticky]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    // при переходах закрываем дровер
    setDrawerOpen(false);
  }, [pathname]);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setDrawerOpen(false);
  };

  const containerClass = sticky ? "sticky top-0 z-50" : "relative z-50";

  return (
    <header className={containerClass}>
      <div className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-[#081623]">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Desktop top row */}
          <div className="hidden h-20 grid-cols-[1fr_auto_1fr] items-center gap-6 xl:grid">
            <form onSubmit={submitSearch} className="flex items-center gap-3">
              <button type="submit" aria-label="Поиск" className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white">
                <SearchIcon />
              </button>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="font-menu h-10 w-full max-w-[320px] border-b border-transparent bg-transparent text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/20"
              />
            </form>

            <div className="flex justify-center">
              <Link href="/" className="inline-flex items-center justify-center">
                {logo?.url ? (
                  <Image
                    src={logo.url}
                    alt={logo.alternativeText ?? siteName}
                    width={520}
                    height={160}
                    sizes="(min-width: 1280px) 420px, 60vw"
                    className="h-12 w-auto object-contain"
                    priority
                  />
                ) : (
                  <span className="type-h2 text-[40px] leading-[1] tracking-[-0.02em] text-[#0b3b27] dark:text-emerald-200">
                    ВИНОДЕЛИЕ СЕГОДНЯ
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center justify-end gap-3">
              <AuthWidget
                label="Войти"
                buttonClassName="type-button inline-flex items-center justify-center rounded-full bg-transparent px-4 py-2 text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
              />
              <ThemeToggle compact />
            </div>
          </div>

          {/* Desktop bottom row */}
          <nav className="hidden h-14 items-center justify-center gap-10 xl:flex">
            {resolvedMenu.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="font-menu text-[13px] font-medium tracking-[0.12em] text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white"
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Mobile/tablet row */}
          <div className="flex h-16 items-center justify-between xl:hidden">
            <Link href="/" className="min-w-0 pr-4">
              <span className="line-clamp-1 text-[16px] font-semibold tracking-[0.06em] text-[#0b3b27] dark:text-emerald-200">
                {siteName || "ВИНОДЕЛИЕ СЕГОДНЯ"}
              </span>
            </Link>

            <button
              type="button"
              aria-label={drawerOpen ? "Закрыть меню" : "Открыть меню"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px] xl:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-x-0 top-0 z-[70] h-[100dvh] xl:hidden">
            <div className="h-full w-full bg-[color:var(--background)] shadow-[0_24px_80px_rgba(8,18,12,0.22)] dark:bg-[#08110b]">
              <div className="mx-auto flex h-full max-w-2xl flex-col px-4 pb-8 pt-5">
                <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Поиск"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => {
                        const input = document.getElementById("mobile-header-search") as HTMLInputElement | null;
                        input?.focus();
                      }}
                    >
                      <SearchIcon />
                    </button>
                    <AuthWidget
                      label="Войти"
                      compact
                      buttonClassName="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                    />
                    <ThemeToggle compact />
                  </div>
                  <button
                    type="button"
                    aria-label="Закрыть"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>

                <form onSubmit={submitSearch} className="mt-4 flex items-center gap-3">
                  <input
                    id="mobile-header-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по сайту"
                    className="font-menu h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Искать"
                  >
                    <SearchIcon />
                  </button>
                </form>

                <nav className="mt-6 grid gap-2 overflow-y-auto">
                  {resolvedMenu.map((item) => (
                    <Link
                      key={`mobile-${item.href}-${item.label}`}
                      href={item.href}
                      className="font-menu rounded-xl border border-black/10 bg-white px-4 py-3 text-zinc-900 transition-colors hover:border-emerald-700 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-emerald-950/35"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
