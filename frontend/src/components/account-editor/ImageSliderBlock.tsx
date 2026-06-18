"use client";

import { useState } from "react";
import { MediaPicker } from "./media";
import type { EditorSliderBlock, UploadedAsset } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type ImageSliderBlockProps = {
  block: EditorSliderBlock;
  assets: UploadedAsset[];
  onChange: (block: EditorSliderBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function ImageSliderBlock({ block, assets, onChange, onUpload }: ImageSliderBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Заголовок слайдера</label>
        <input
          type="text"
          value={block.title ?? ""}
          onChange={(event) => onChange({ ...block, title: event.target.value })}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Описание</label>
        <input
          type="text"
          value={block.description ?? ""}
          onChange={(event) => onChange({ ...block, description: event.target.value })}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Источник фото</label>
        <input
          type="text"
          value={block.photoSource ?? ""}
          onChange={(event) => onChange({ ...block, photoSource: event.target.value })}
          className={inputClassName}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Изображения: {block.images.length}</span>
          <button type="button" onClick={() => setIsOpen((current) => !current)} className="text-xs text-[#1a4d2e] hover:underline dark:text-[#4ade80]">
            {isOpen ? "Закрыть выбор" : "Выбрать изображения"}
          </button>
        </div>

        {isOpen ? (
          <MediaPicker
            assets={assets}
            accept="image"
            selectedId={block.images[0] ?? null}
            onSelect={(id) => {
              if (id === null) {
                onChange({ ...block, images: [] });
              } else {
                onChange({ ...block, images: block.images.includes(id) ? block.images.filter((imageId) => imageId !== id) : [...block.images, id] });
              }
            }}
            onUpload={onUpload}
            uploadLabel="Загрузить изображения"
          />
        ) : null}

        {block.images.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {block.images.map((id) => (
              <span key={id} className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                ID: {id}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
