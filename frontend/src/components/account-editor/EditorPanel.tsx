"use client";

import { useState, type ReactNode } from "react";

type EditorPanelProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function EditorPanel({ title, children, defaultOpen = true }: EditorPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-black/10 bg-[#f5f5f5] dark:border-white/10 dark:bg-[#1e1e1e]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">{title}</span>
        <span className={`text-xs transition-transform ${isOpen ? "" : "-rotate-90"}`}>▼</span>
      </button>
      {isOpen ? <div className="border-t border-black/10 px-4 py-4 dark:border-white/10">{children}</div> : null}
    </div>
  );
}
