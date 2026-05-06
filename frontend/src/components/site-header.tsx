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
  stickyDesktop?: boolean | null;
  stickyTablet?: boolean | null;
  stickyMobile?: boolean | null;
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

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function SiteHeader({ siteName, lightLogo, darkLogo, stickyDesktop = true, stickyTablet = true, stickyMobile = true, menuLinks, navigationItems }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useSyncExternalStore<ThemeMode>(subscribeToTheme, readThemeSnapshot, () => "light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");

  const sticky = isDesktop ? stickyDesktop : isTablet ? stickyTablet : stickyMobile;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setDrawerOpen(false);
  };

  const openSearchOverlay = () => {
    // минимально воссоздаем поведение "старого" поиска: оверлей с инпутом
    window.dispatchEvent(new CustomEvent("vino-search-open"));
    setDrawerOpen(false);
  };

  const containerClass = sticky ? "sticky top-0 z-50" : "relative z-50";

  return (
    <header className={containerClass}>
      <div className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-[#081623]">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Desktop top row */}
          <div className="hidden h-20 grid-cols-[1fr_auto_1fr] items-center gap-6 xl:grid">
            <div className="flex justify-start">
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

            <div />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                aria-label="Поиск"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={openSearchOverlay}
              >
                <SearchIcon />
              </button>
              <ThemeToggle compact />
              <AuthWidget
                label="Войти"
                buttonClassName="type-button inline-flex items-center justify-center rounded-full bg-transparent px-4 py-2 text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
              />
            </div>
          </div>

          {/* Desktop bottom row */}
          <nav className="hidden h-14 items-center justify-center xl:flex xl:gap-6 2xl:gap-10">
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
          <div className="grid h-16 grid-cols-[auto_1fr_44px] items-center gap-3 xl:hidden">
            <Link href="/" className="min-w-0 justify-self-start px-2">
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt={logo.alternativeText ?? siteName}
                  width={360}
                  height={120}
                  sizes="(max-width: 1279px) 220px, 220px"
                  className="h-8 w-auto max-w-[220px] object-contain"
                  priority
                />
              ) : (
                <span className="line-clamp-1 text-[16px] font-semibold tracking-[0.06em] text-[#0b3b27] dark:text-emerald-200">
                  {siteName || "ВИНОДЕЛИЕ СЕГОДНЯ"}
                </span>
              )}
            </Link>

            <div />

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

      {/* Search overlay */}
      <SearchOverlay onSubmit={submitSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onClose={() => setDrawerOpen(false)} />

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
            <div className="h-full w-full bg-white shadow-[0_24px_80px_rgba(8,18,12,0.22)] dark:bg-[#081623]">
              <div className="mx-auto flex h-full max-w-2xl flex-col px-4 pb-8">
                <div className="flex h-16 items-center justify-between gap-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Поиск"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={openSearchOverlay}
                    >
                      <SearchIcon />
                    </button>
                    <ThemeToggle compact />
                    <AuthWidget
                      label="Войти"
                      compact
                      buttonClassName="inline-flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                    />
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

                <nav className="mt-6 grid gap-3 overflow-y-auto">
                  <Link
                    href="/"
                    className="font-menu px-0 py-1 text-[16px] text-zinc-900 transition-colors hover:text-zinc-950 dark:text-zinc-100 dark:hover:text-white"
                  >
                    Главная
                  </Link>
                  {resolvedMenu.map((item) => (
                    <Link
                      key={`mobile-${item.href}-${item.label}`}
                      href={item.href}
                      className="font-menu px-0 py-1 text-[16px] text-zinc-900 transition-colors hover:text-zinc-950 dark:text-zinc-100 dark:hover:text-white"
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

function SearchOverlay({
  onSubmit,
  searchQuery,
  setSearchQuery,
  onClose,
}: {
  onSubmit: (event?: FormEvent) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("vino-search-open", onOpen as EventListener);
    return () => window.removeEventListener("vino-search-open", onOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const id = window.setTimeout(() => {
      const input = document.getElementById("site-search-overlay-input") as HTMLInputElement | null;
      input?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Закрыть поиск"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={() => {
          setOpen(false);
          onClose();
        }}
      />
      <div className="relative mx-auto mt-20 w-full max-w-2xl px-4">
        <form
          onSubmit={(e) => {
            onSubmit(e);
            setOpen(false);
            onClose();
          }}
          className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_24px_80px_rgba(8,18,12,0.22)] dark:border-white/10 dark:bg-[#081623]"
        >
          <input
            id="site-search-overlay-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            className="font-menu h-12 min-w-0 flex-1 border-0 bg-transparent px-2 text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Искать"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-transparent text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Закрыть"
            onClick={() => {
              setOpen(false);
              onClose();
            }}
          >
            <CloseIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
