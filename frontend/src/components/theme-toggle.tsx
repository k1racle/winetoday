"use client";

import { useSyncExternalStore } from "react";

type ThemeToggleColors = {
  textColor?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  activeTextColor?: string | null;
  activeBackgroundColor?: string | null;
};

type ThemeToggleProps = {
  colors?: ThemeToggleColors;
  compact?: boolean;
  inheritRowTheme?: boolean;
};

const STORAGE_KEY = "vino-theme";
const THEME_CHANGE_EVENT = "vino-theme-change";

type ThemeMode = "light" | "dark";
type StoredThemeMode = ThemeMode | "system";

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

function readStoredThemePreference(): StoredThemeMode {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function readThemeSnapshot(): ThemeMode {
  const rootTheme = document.documentElement.dataset.theme;
  if (rootTheme === "light" || rootTheme === "dark") {
    return rootTheme;
  }

  const storedTheme = readStoredThemePreference();
  return storedTheme === "system" ? getSystemTheme() : storedTheme;
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (readStoredThemePreference() === "system") {
      applyTheme(getSystemTheme());
    }

    onStoreChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  mediaQuery.addEventListener("change", handleChange);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

export function ThemeToggle({ colors, compact = false, inheritRowTheme = false }: ThemeToggleProps) {
  const theme = useSyncExternalStore<ThemeMode>(subscribeToTheme, readThemeSnapshot, () => "light");

  const toggleTheme = () => {
    const storedTheme = readStoredThemePreference();
    const nextTheme = storedTheme === "system"
      ? theme === "dark" ? "light" : "dark"
      : theme === "dark"
        ? "light"
        : "dark";

    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const resolvedTextColor = theme === "dark"
    ? colors?.activeTextColor ?? colors?.textColor
    : colors?.textColor;
  const resolvedBackgroundColor = theme === "dark"
    ? colors?.activeBackgroundColor ?? colors?.backgroundColor
    : colors?.backgroundColor;
  const className = compact
    ? "inline-flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent shadow-none transition-colors hover:bg-black/5 dark:hover:bg-white/10"
    : inheritRowTheme
      ? "inline-flex h-11 w-11 items-center justify-center border border-current/15 bg-transparent text-inherit shadow-sm transition-colors hover:bg-white/10 hover:text-inherit"
      : "inline-flex h-11 w-11 items-center justify-center border border-black/8 bg-white shadow-sm transition-colors hover:border-emerald-900/12 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-emerald-950/35";

  return (
    <button
      type="button"
      aria-label={`Переключить тему. Сейчас: ${theme === "dark" ? "темная" : "светлая"}`}
      aria-pressed={theme === "dark"}
      className={className}
      style={{
        ...(resolvedBackgroundColor ? { backgroundColor: resolvedBackgroundColor } : null),
        ...(resolvedTextColor ? { color: resolvedTextColor } : null),
        ...(colors?.borderColor ? { borderColor: colors.borderColor } : null),
      }}
      onClick={toggleTheme}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3c-.05.33-.08.66-.08 1a8 8 0 0 0 8 8c.34 0 .67-.03 1-.08Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
