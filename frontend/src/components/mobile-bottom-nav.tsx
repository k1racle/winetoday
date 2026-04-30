"use client";

import { useEffect, useState } from "react";

export function MobileBottomNav() {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        setReadingProgress(0);
        return;
      }

      setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100)));
    };

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] h-1 md:hidden">
      <div className="h-full w-full bg-black/5 dark:bg-white/10">
        <div className="h-full bg-emerald-600 transition-[width] duration-150 dark:bg-emerald-400" style={{ width: `${readingProgress}%` }} />
      </div>
    </div>
  );
}
