"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "vino-first-visit-notice-dismissed";
const NOTICE_CHANGE_EVENT = "vino-first-visit-notice-change";

function subscribe(onStoreChange: () => void) {
  const handleChange = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(NOTICE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(NOTICE_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) !== "true";
}

export function FirstVisitNotice() {
  const open = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleClose() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new Event(NOTICE_CHANGE_EVENT));
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-visit-notice-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[36rem] rounded-[28px] border border-black/10 bg-white p-6 text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#08110b] dark:text-zinc-100 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Закрыть уведомление"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-500 transition-colors hover:border-black hover:text-black dark:border-white/10 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>

        <div className="pr-10">
          <h2 id="first-visit-notice-title" className="type-h4 text-[20px] leading-6 sm:text-[22px]">
            Уважаемые пользователи!
          </h2>
          <div className="type-body mt-4 space-y-4 text-zinc-700 dark:text-zinc-300">
            <p>
              Сайт работает в техническом режиме. Некоторые функции могут быть временно недоступны или работать нестабильно.
            </p>
            <p>
              Приносим извинения за возможные неудобства и благодарим за понимание.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
