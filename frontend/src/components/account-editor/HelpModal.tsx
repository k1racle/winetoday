"use client";

import { useEffect, useRef, type MouseEvent } from "react";

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function HelpItem({ title, badge, description, example }: { title: string; badge?: string; description: string; example: React.ReactNode }) {
  return (
    <div className="grid overflow-hidden rounded-lg border border-black/10 bg-[#f5f5f5] dark:border-white/10 dark:bg-[#1e1e1e] md:grid-cols-2">
      <div className="border-b border-black/10 p-4 md:border-b-0 md:border-r dark:border-white/10">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-3.5 w-0.5 rounded bg-[#1a4d2e] dark:bg-[#4ade80]" />
            {title}
          </div>
          {badge ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{badge}</span> : null}
        </div>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>
      <div className="bg-white p-4 dark:bg-[#141414]">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#1a4d2e] dark:text-[#4ade80]">
          <span className="h-3 w-0.5 rounded bg-[#1a4d2e] dark:bg-[#4ade80]" />
          Пример на сайте
        </div>
        {example}
      </div>
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === overlayRef.current) {
      onClose();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/55 p-4"
    >
      <div className="my-6 flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#141414]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#1a4d2e] text-sm text-white dark:bg-[#4ade80] dark:text-black">?</span>
            Справка по редактору материалов
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded bg-[#eeeeee] text-zinc-500 transition-colors hover:bg-red-600 hover:text-white dark:bg-[#2a2a2a] dark:hover:bg-red-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
          <div className="mb-5 rounded-lg border border-[#1a4d2e] bg-emerald-50 p-3 text-xs leading-relaxed text-zinc-700 dark:border-[#4ade80] dark:bg-emerald-950/20 dark:text-zinc-200">
            Этот редактор позволяет создавать и редактировать материалы для сайта <b>ВИНОДЕЛИЕ СЕГОДНЯ</b>. Слева — описание поля, справа — пример того, как оно выглядит на сайте.
          </div>

          <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Основная информация</div>
          <div className="mb-5 grid gap-2">
            <HelpItem
              title="Заголовок"
              badge="обязательно"
              description="Главный заголовок материала. Отображается крупным шрифтом на странице и в превью на главной."
              example={<div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Сергей Левожинский: «Виноделы все меньше готовы инвестировать в продвижение»</div>}
            />
            <HelpItem
              title="Ссылка (slug)"
              badge="URL"
              description="Часть адреса страницы. Латиница, без пробелов, через дефис. Если пусто — генерируется автоматически из заголовка."
              example={<div className="text-sm text-[#1a4d2e] dark:text-[#4ade80]">winemaking-today.ru › news › sergej-levozhinskij</div>}
            />
            <HelpItem
              title="Краткое описание"
              badge="обязательно"
              description="Краткое вступление (лид). Отображается под заголовком в превью на главной."
              example={<div className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">Руководитель винной категории сети «Магнит» рассказал о доле на полке и противоречиях с виноделами...</div>}
            />
          </div>

          <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Настройки публикации</div>
          <div className="mb-5 grid gap-2">
            <HelpItem
              title="Статус"
              description="Черновик — виден только в редакторе. Опубликовано — видно всем на сайте."
              example={
                <div className="text-xs text-zinc-700 dark:text-zinc-200">
                  🟡 Черновик · 🟢 Опубликовано
                </div>
              }
            />
            <HelpItem
              title="Дата публикации"
              description="Дата и время, когда материал станет доступен читателям."
              example={<div className="text-sm font-semibold text-[#1a4d2e] dark:text-[#4ade80]">2 июня · 09:45</div>}
            />
            <HelpItem
              title="Метка материала"
              description="Выделяет материал особым бейджем в списке новостей."
              example={
                <div className="flex items-center gap-2 text-xs">
                  <span>Gunko Winery расширит линейку</span>
                  <span className="rounded bg-[#1a4d2e] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white dark:bg-[#4ade80] dark:text-black">Эксклюзив</span>
                </div>
              }
            />
          </div>

          <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Блоки материала</div>
          <div className="mb-5 grid gap-2">
            <HelpItem
              title="Текстовый блок"
              badge="rich-text"
              description="Основной блок для текста. Поддерживает жирный, курсив, заголовки, списки, ссылки."
              example={<div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">Виноделие как <b>искусство</b> и наука объединяет в себе традиции и инновации.</div>}
            />
            <HelpItem
              title="Галерея / Слайдер"
              badge="media"
              description="Несколько изображений. Галерея — сетка, слайдер — карусель."
              example={
                <div className="flex gap-1">
                  <div className="h-9 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-9 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-9 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              }
            />
            <HelpItem
              title="Embed HTML"
              badge="код"
              description="Вставка стороннего HTML: YouTube, Яндекс.Карты, Telegram-посты."
              example={<div className="text-xs text-zinc-600 dark:text-zinc-300">📺 Видео с YouTube<br />🗺 Яндекс.Карты</div>}
            />
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-zinc-700 dark:bg-emerald-950/20 dark:text-zinc-200">
            <b>⌨ Горячие клавиши:</b><br />
            <b>Ctrl+B</b> — жирный · <b>Ctrl+I</b> — курсив · <b>Ctrl+U</b> — подчёркивание
          </div>
        </div>
      </div>
    </div>
  );
}
