"use client";

import { useEffect } from "react";

import { useMobileWidgets } from "@/components/mobile-widgets-provider";
import type { SidebarEntry } from "@/lib/strapi";

type MobileSidebarBridgeProps = {
  sidebar?: SidebarEntry | null;
};

export function MobileSidebarBridge({ sidebar }: MobileSidebarBridgeProps) {
  const { setSidebar, close } = useMobileWidgets();

  useEffect(() => {
    setSidebar(sidebar ?? null);
    close();

    return () => {
      setSidebar(null);
      close();
    };
  }, [close, setSidebar, sidebar]);

  return null;
}
