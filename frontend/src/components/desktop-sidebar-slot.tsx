import type { ReactNode } from "react";

type DesktopSidebarSlotProps = {
  children: ReactNode;
};

export function DesktopSidebarSlot({ children }: DesktopSidebarSlotProps) {
  return <div className="hidden w-[320px] shrink-0 overflow-hidden xl:col-start-2 xl:block">{children}</div>;
}
