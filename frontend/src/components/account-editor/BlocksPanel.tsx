"use client";

import { EditorPanel } from "./EditorPanel";
import { HtmlEditorBlock } from "./HtmlEditorBlock";
import { EmbedBlock } from "./EmbedBlock";
import { ImageGalleryBlock } from "./ImageGalleryBlock";
import { ImageSliderBlock } from "./ImageSliderBlock";
import { ImageHighlightBlock } from "./ImageHighlightBlock";
import { blockLabel, blockBadgeClass } from "./utils";
import type { EditorBlock, EditorContentType, UploadedAsset, ChangeEvent } from "./types";

const BLOCK_BUTTONS: { type: EditorBlock["__component"]; label: string }[] = [
  { type: "blocks.html-editor", label: "＋ Текстовый блок" },
  { type: "blocks.image-highlight", label: "＋ Изображение" },
  { type: "blocks.image-slider", label: "＋ Слайдер" },
  { type: "blocks.embed", label: "＋ Embed" },
  { type: "blocks.image-gallery", label: "＋ Галерея" },
];

type BlocksPanelProps = {
  type: EditorContentType;
  blocks: EditorBlock[];
  assets: UploadedAsset[];
  onAdd: (type: EditorBlock["__component"]) => void;
  onUpdate: (index: number, block: EditorBlock) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpload: (index: number, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function BlocksPanel({ type, blocks, assets, onAdd, onUpdate, onRemove, onMove, onUpload }: BlocksPanelProps) {
  if (type === "gallery") {
    return null;
  }

  return (
    <EditorPanel title={<> Блоки материала</>}>
      <div className="grid gap-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Rich-text блоки TipTap + блоки изображений</p>

        <div className="flex flex-wrap gap-2">
          {BLOCK_BUTTONS.map(({ type: blockType, label }) => (
            <button
              key={blockType}
              type="button"
              onClick={() => onAdd(blockType)}
              className="rounded border border-dashed border-black/20 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-[#1a4d2e] hover:text-[#1a4d2e] dark:border-white/20 dark:text-zinc-300 dark:hover:border-[#4ade80] dark:hover:text-[#4ade80]"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {blocks.map((block, index) => (
            <div key={`${block.__component}-${index}`} className="overflow-hidden rounded border border-black/10 bg-white dark:border-white/10 dark:bg-[#141414]">
              <div className="flex items-center justify-between border-b border-black/10 bg-[#eeeeee] px-3 py-2 dark:border-white/10 dark:bg-[#2a2a2a]">
                <div className="flex items-center gap-2">
                  <span className="cursor-grab text-zinc-400">⋮⋮</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${blockBadgeClass(block.__component)}`}>
                    {blockLabel(block.__component)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="flex h-6 w-6 items-center justify-center rounded text-xs text-zinc-500 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded text-xs text-zinc-500 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="flex h-6 w-6 items-center justify-center rounded text-xs text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-3">
                {block.__component === "blocks.html-editor" ? (
                  <HtmlEditorBlock block={block} onChange={(next) => onUpdate(index, next)} />
                ) : block.__component === "blocks.embed" ? (
                  <EmbedBlock block={block} onChange={(next) => onUpdate(index, next)} />
                ) : block.__component === "blocks.image-gallery" ? (
                  <ImageGalleryBlock block={block} assets={assets} onChange={(next) => onUpdate(index, next)} onUpload={(event) => onUpload(index, event)} />
                ) : block.__component === "blocks.image-slider" ? (
                  <ImageSliderBlock block={block} assets={assets} onChange={(next) => onUpdate(index, next)} onUpload={(event) => onUpload(index, event)} />
                ) : (
                  <ImageHighlightBlock block={block} assets={assets} onChange={(next) => onUpdate(index, next)} onUpload={(event) => onUpload(index, event)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditorPanel>
  );
}
