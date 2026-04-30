"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { SidebarEntry } from "@/lib/strapi";

type MobileWidgetsContextValue = {
  sidebar: SidebarEntry | null;
  setSidebar: (sidebar: SidebarEntry | null) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MobileWidgetsContext = createContext<MobileWidgetsContextValue | null>(null);

export function MobileWidgetsProvider({ children }: { children: ReactNode }) {
  const [sidebar, setSidebar] = useState<SidebarEntry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<MobileWidgetsContextValue>(
    () => ({
      sidebar,
      setSidebar,
      isOpen,
      open,
      close,
    }),
    [close, isOpen, open, sidebar],
  );

  return <MobileWidgetsContext.Provider value={value}>{children}</MobileWidgetsContext.Provider>;
}

export function useMobileWidgets() {
  const context = useContext(MobileWidgetsContext);

  if (!context) {
    throw new Error("useMobileWidgets must be used within MobileWidgetsProvider");
  }

  return context;
}
