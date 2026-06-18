"use client";

import { EditorPanel } from "./EditorPanel";
import { MediaPicker, MediaSummaryCard } from "./media";
import type { FormState, UploadedAsset, ActiveMediaPanel } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type CoverPanelProps = {
  form: Pick<FormState, "cover" | "coverSource">;
  assets: UploadedAsset[];
  activePanel: ActiveMediaPanel;
  onOpenPanel: () => void;
  onClosePanel: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSelectCover: (id: number | null) => void;
  onChangeSource: (value: string) => void;
};

export function CoverPanel({
  form,
  assets,
  activePanel,
  onOpenPanel,
  onClosePanel,
  onUpload,
  onSelectCover,
  onChangeSource,
}: CoverPanelProps) {
  const isCoverPanelOpen = activePanel?.kind === "cover";

  return (
    <EditorPanel title={<>🖼 Обложка</>}>
      <div className="grid gap-4">
        <MediaSummaryCard
          asset={assets.find((asset) => asset.id === form.cover) ?? null}
          accept="image"
          emptyLabel="Основная обложка"
          onOpen={onOpenPanel}
          onClear={() => onSelectCover(null)}
          openLabel="Выбрать обложку"
        />

        {isCoverPanelOpen ? (
          <div className="rounded border border-black/10 p-3 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Выбор обложки</h4>
              <button type="button" onClick={onClosePanel} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Закрыть</button>
            </div>
            <MediaPicker
              assets={assets}
              accept="image"
              selectedId={form.cover}
              onSelect={onSelectCover}
              onUpload={onUpload}
              uploadLabel="Загрузить новое изображение"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Источник фото</label>
          <input
            type="text"
            value={form.coverSource}
            onChange={(event) => onChangeSource(event.target.value)}
            placeholder="© Фото: ..."
            className={inputClassName}
          />
        </div>
      </div>
    </EditorPanel>
  );
}
