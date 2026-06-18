"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { UploadedAsset } from "./types";
import { filterAssetsByAccept } from "./utils";

const fileInputClassName =
  "block w-full cursor-pointer rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded file:border-0 file:bg-emerald-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:bg-black/[0.02] dark:border-white/10 dark:bg-[#12202d] dark:text-zinc-200 dark:file:bg-emerald-600";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#12202d] dark:text-zinc-100";

type MediaPickerProps = {
  assets: UploadedAsset[];
  accept: "image" | "video";
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadLabel: string;
};

export function MediaPicker({ assets, accept, selectedId, onSelect, onUpload, uploadLabel }: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const typedAssets = filterAssetsByAccept(assets, accept);

    if (!normalizedQuery) {
      return typedAssets;
    }

    return typedAssets.filter((asset) => {
      const haystack = [asset.name, asset.alternativeText, asset.url, String(asset.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [accept, assets, query]);
  const selectedAsset = filteredAssets.find((asset) => asset.id === selectedId) ?? assets.find((asset) => asset.id === selectedId) ?? null;
  const visibleAssets = expanded ? filteredAssets : filteredAssets.slice(0, 12);
  const previewUrl = selectedAsset?.previewUrl || selectedAsset?.url || null;

  return (
    <div className="grid gap-3">
      <input type="file" accept={accept === "image" ? "image/*" : "video/*"} onChange={onUpload} className={fileInputClassName} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{uploadLabel}</p>
      <div className="grid gap-3 border border-black/10 p-3 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
            placeholder={accept === "image" ? "Поиск по изображениям" : "Поиск по видео"}
            className={`${inputClassName} min-w-[220px] flex-1 py-2.5 text-sm`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="inline-flex items-center rounded border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              Очистить
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={`min-h-[88px] border px-3 py-3 text-left text-sm transition-colors ${selectedId === null ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"}`}
            >
              Без файла
            </button>
            {visibleAssets.map((asset) => {
              const isSelected = asset.id === selectedId;
              const cardPreviewUrl = asset.previewUrl || asset.url;

              return (
                <button
                  key={`${accept}-${asset.id}`}
                  type="button"
                  onClick={() => onSelect(asset.id)}
                  className={`overflow-hidden border text-left transition-colors ${isSelected ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"}`}
                >
                  <div className="relative aspect-[16/10] bg-black/[0.04] dark:bg-white/[0.04]">
                    {accept === "image" && cardPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cardPreviewUrl} alt={asset.alternativeText || asset.name || ""} className="h-full w-full object-cover" />
                    ) : null}
                    {accept === "video" ? (
                      <div className="flex h-full items-center justify-center px-3 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Видео</div>
                    ) : null}
                  </div>
                  <div className="p-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{asset.name || `Файл #${asset.id}`}</div>
                    <div>ID: {asset.id}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Текущий выбор</p>
            </div>
            {selectedAsset ? (
              <div className="space-y-3 p-4">
                <div className="relative aspect-[16/10] overflow-hidden bg-black/[0.05] dark:bg-white/[0.04]">
                  {accept === "image" && previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={selectedAsset.alternativeText || selectedAsset.name || ""} className="h-full w-full object-cover" />
                  ) : null}
                  {accept === "video" ? (
                    previewUrl ? (
                      <video src={previewUrl} className="h-full w-full object-cover" controls preload="metadata" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Видео выбрано</div>
                    )
                  ) : null}
                </div>
                <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{selectedAsset.name || `Файл #${selectedAsset.id}`}</div>
                  <div>ID: {selectedAsset.id}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Файл пока не выбран.</div>
            )}
          </div>
        </div>

        {filteredAssets.length > 12 ? (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex items-center rounded border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              {expanded ? "Скрыть часть" : `Показать еще (${filteredAssets.length - visibleAssets.length})`}
            </button>
          </div>
        ) : null}

        {!visibleAssets.length ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">По этому запросу ничего не найдено.</div>
        ) : null}
      </div>
    </div>
  );
}

type MediaSummaryCardProps = {
  asset: UploadedAsset | null;
  accept: "image" | "video";
  emptyLabel: string;
  onOpen: () => void;
  onClear?: (() => void) | null;
  openLabel: string;
};

export function MediaSummaryCard({ asset, accept, emptyLabel, onOpen, onClear, openLabel }: MediaSummaryCardProps) {
  const previewUrl = asset?.previewUrl || asset?.url || null;

  return (
    <div className="grid gap-3 rounded border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
            {asset ? (
              accept === "image" && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={asset.alternativeText || asset.name || ""} className="h-full w-full object-cover" />
              ) : accept === "video" && previewUrl ? (
                <video src={previewUrl} className="h-full w-full object-cover" muted preload="metadata" />
              ) : (
                <span className="px-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{accept === "image" ? "Фото" : "Видео"}</span>
              )
            ) : (
              <span className="px-2 text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Нет файла</span>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{asset?.name || emptyLabel}</p>
            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{asset ? `ID: ${asset.id}` : "Файл пока не выбран."}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center rounded border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
          >
            {openLabel}
          </button>
          {asset && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center rounded border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              Очистить
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type GalleryPhotoPickerProps = {
  assets: UploadedAsset[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
};

export function GalleryPhotoPicker({ assets, selectedIds, onToggle, onUpload, onClearAll }: GalleryPhotoPickerProps) {
  const imageAssets = filterAssetsByAccept(assets, "image");

  return (
    <div className="grid gap-4 rounded border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Фотографии галереи</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Загрузите фото или выберите уже загруженные изображения. Порядок в списке определяет порядок на публичной странице.</p>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center rounded border border-red-200 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Очистить список
        </button>
      </div>

      <input type="file" accept="image/*" multiple onChange={onUpload} className={fileInputClassName} />

      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {imageAssets.slice(0, 12).map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            const previewUrl = asset.previewUrl || asset.url || null;

            return (
              <button
                key={`gallery-photo-${asset.id}`}
                type="button"
                onClick={() => onToggle(asset.id)}
                className={`overflow-hidden rounded border text-left transition-colors ${isSelected ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"}`}
              >
                <div className="relative aspect-[4/3] bg-black/[0.04] dark:bg-white/[0.04]">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={asset.alternativeText || asset.name || ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Фото</div>
                  )}
                </div>
                <div className="p-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{asset.name || `Файл #${asset.id}`}</div>
                  <div>ID: {asset.id}</div>
                  <div className="mt-1">{isSelected ? "Добавлено в галерею" : "Нажмите, чтобы добавить"}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedIds.length ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Выбрано фотографий: {selectedIds.length}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">{selectedIds.join(", ")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
