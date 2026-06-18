"use client";

import { useState } from "react";
import { MediaPicker, MediaSummaryCard } from "./media";
import type { EditorHighlightBlock, UploadedAsset } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type ImageHighlightBlockProps = {
  block: EditorHighlightBlock;
  assets: UploadedAsset[];
  onChange: (block: EditorHighlightBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function ImageHighlightBlock({ block, assets, onChange, onUpload }: ImageHighlightBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAsset = assets.find((asset) => asset.id === block.image) ?? null;

  return (
    <div className="grid gap-3">
      <MediaSummaryCard
        asset={selectedAsset}
        accept="image"
        emptyLabel="Акцентное изображение"
        onOpen={() => setIsOpen(true)}
        onClear={() => onChange({ ...block, image: null })}
        openLabel="Выбрать изображение"
      />

      {isOpen ? (
        <div className="rounded border border-black/10 p-3 dark:border-white/10">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Выбор изображения</h4>
            <button type="button" onClick={() => setIsOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Закрыть</button>
          </div>
          <MediaPicker
            assets={assets}
            accept="image"
            selectedId={block.image}
            onSelect={(id) => {
              onChange({ ...block, image: id });
              if (id !== null) {
                setIsOpen(false);
              }
            }}
            onUpload={onUpload}
            uploadLabel="Загрузить новое изображение"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Подпись</label>
        <input
          type="text"
          value={block.caption ?? ""}
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Автор / источник</label>
        <input
          type="text"
          value={block.credit ?? ""}
          onChange={(event) => onChange({ ...block, credit: event.target.value })}
          className={inputClassName}
        />
      </div>
    </div>
  );
}
