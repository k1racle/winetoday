"use client";

import { EditorPanel } from "./EditorPanel";
import type { FormState } from "./types";

const inputClassName =
  "w-full rounded border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100";

type EventFieldsPanelProps = {
  form: Pick<FormState, "readingTime" | "startsAt" | "endsAt" | "locationName" | "city" | "address" | "ticketUrl">;
  onChange: <K extends "readingTime" | "startsAt" | "endsAt" | "locationName" | "city" | "address" | "ticketUrl">(
    key: K,
    value: FormState[K],
  ) => void;
};

export function EventFieldsPanel({ form, onChange }: EventFieldsPanelProps) {
  return (
    <EditorPanel title={<>📅 Время чтения и событие</>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Время чтения</label>
          <input
            type="text"
            value={form.readingTime}
            onChange={(event) => onChange("readingTime", event.target.value)}
            placeholder="например, 5 мин"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Начало события</label>
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => onChange("startsAt", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Окончание события</label>
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => onChange("endsAt", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Место проведения</label>
          <input
            type="text"
            value={form.locationName}
            onChange={(event) => onChange("locationName", event.target.value)}
            placeholder="Название площадки"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Город</label>
          <input
            type="text"
            value={form.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="Город"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Адрес</label>
          <input
            type="text"
            value={form.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="Адрес"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Ссылка на билеты</label>
          <input
            type="text"
            value={form.ticketUrl}
            onChange={(event) => onChange("ticketUrl", event.target.value)}
            placeholder="https://"
            className={inputClassName}
          />
        </div>
      </div>
    </EditorPanel>
  );
}
