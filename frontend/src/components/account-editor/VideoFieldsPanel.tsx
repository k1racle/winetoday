"use client";

import { EditorPanel } from "./EditorPanel";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type VideoFieldsPanelProps = {
  videoUrl: string;
  duration: string;
  onChangeVideoUrl: (value: string) => void;
  onChangeDuration: (value: string) => void;
};

export function VideoFieldsPanel({ videoUrl, duration, onChangeVideoUrl, onChangeDuration }: VideoFieldsPanelProps) {
  return (
    <EditorPanel title={<>🎬 Видео</>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">URL видео</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(event) => onChangeVideoUrl(event.target.value)}
            placeholder="https://youtube.com/..."
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Длительность (мин)</label>
          <input
            type="number"
            value={duration}
            onChange={(event) => onChangeDuration(event.target.value)}
            min={1}
            className={inputClassName}
          />
        </div>
      </div>
    </EditorPanel>
  );
}
