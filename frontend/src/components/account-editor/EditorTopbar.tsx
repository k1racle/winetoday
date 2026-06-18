"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { EditorSession } from "./types";
import { getAuthModeLabel, resolveAuthMode } from "@/lib/auth-shared";

type EditorTopbarProps = {
  session: EditorSession | null;
  onHelpClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function EditorTopbar({ session, onHelpClick }: EditorTopbarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });
  const displayName = session?.user?.memberProfile?.displayName?.trim()
    || session?.user?.username
    || "Пользователь";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabel = getAuthModeLabel(resolveAuthMode({
    accountType: session?.user?.memberProfile?.accountType ?? null,
  }));

  function toggleTheme() {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextDark);
    root.dataset.theme = nextDark ? "dark" : "light";
    try {
      localStorage.setItem("vino-theme", nextDark ? "dark" : "light");
    } catch {
      // ignore
    }
    setIsDark(nextDark);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-black/10 bg-[#f5f5f5] px-5 dark:border-white/10 dark:bg-[#1e1e1e]">
      <Link href="/" className="text-base font-bold text-[#1a4d2e] dark:text-[#4ade80]">
        ВИНОДЕЛИЕ <span className="text-zinc-900 dark:text-zinc-100">СЕГОДНЯ</span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onHelpClick}
          className="hidden items-center gap-1.5 rounded border border-[#1a4d2e] bg-[#1a4d2e] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2d7a4f] dark:border-[#4ade80] dark:bg-[#4ade80] dark:text-black dark:hover:bg-[#86efac] sm:inline-flex"
        >
          ? Помощь
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded border border-black/10 bg-[#eeeeee] text-base text-zinc-600 transition-colors hover:border-[#1a4d2e] hover:text-[#1a4d2e] dark:border-white/10 dark:bg-[#2a2a2a] dark:text-zinc-300 dark:hover:border-[#4ade80] dark:hover:text-[#4ade80]"
          title="Сменить тему"
        >
          {isDark ? "☀" : "◐"}
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] text-[11px] font-semibold text-white dark:from-[#4ade80] dark:to-[#86efac] dark:text-black"
          title={`${displayName} · ${roleLabel}`}
        >
          {initials || "?"}
        </div>
      </div>
    </header>
  );
}
