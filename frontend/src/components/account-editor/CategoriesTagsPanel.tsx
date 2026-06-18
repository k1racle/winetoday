"use client";

import { EditorPanel } from "./EditorPanel";
import type { EditorTaxonomyOption } from "./types";

type CategoriesTagsPanelProps = {
  categories: EditorTaxonomyOption[];
  selectedCategories: number[];
  tags: EditorTaxonomyOption[];
  selectedTags: number[];
  showTags: boolean;
  onToggleCategory: (id: number) => void;
  onToggleTag: (id: number) => void;
};

function CheckboxChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded border px-2.5 py-1.5 text-xs transition-colors ${checked ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-200" : "border-black/10 bg-white hover:bg-zinc-100 dark:border-white/10 dark:bg-[#141414] dark:hover:bg-zinc-800"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${checked ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-black" : "border-zinc-300 dark:border-zinc-600"}`}>
        {checked ? "✓" : null}
      </span>
      {label}
    </label>
  );
}

export function CategoriesTagsPanel({
  categories,
  selectedCategories,
  tags,
  selectedTags,
  showTags,
  onToggleCategory,
  onToggleTag,
}: CategoriesTagsPanelProps) {
  return (
    <EditorPanel title={<>🏷 Рубрики и теги</>}>
      <div className="grid gap-4">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Рубрики</div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <CheckboxChip
                key={category.id}
                label={category.name}
                checked={selectedCategories.includes(category.id)}
                onChange={() => onToggleCategory(category.id)}
              />
            ))}
            {categories.length === 0 ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Нет доступных рубрик</span>
            ) : null}
          </div>
        </div>

        {showTags ? (
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Темы</div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <CheckboxChip
                  key={tag.id}
                  label={tag.name}
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => onToggleTag(tag.id)}
                />
              ))}
              {tags.length === 0 ? (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Нет доступных тегов</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </EditorPanel>
  );
}
