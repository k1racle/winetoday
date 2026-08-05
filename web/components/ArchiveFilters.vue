<script setup lang="ts">
interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

withDefaults(
  defineProps<{
    authors?: FilterOption[];
    tags?: FilterOption[];
    showAuthor?: boolean;
    showTag?: boolean;
  }>(),
  { authors: () => [], tags: () => [], showAuthor: true, showTag: true },
);

const route = useRoute();

const sortOptions = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'old', label: 'Сначала старые' },
  { value: 'popular', label: 'По популярности' },
  { value: 'author', label: 'По автору' },
];

const currentSort = computed(() => String(route.query.sort || 'new'));
const currentAuthor = computed(() => String(route.query.author || ''));
const currentTag = computed(() => String(route.query.tag || ''));

const hasActive = computed(
  () => currentSort.value !== 'new' || !!currentAuthor.value || !!currentTag.value,
);

// Любая смена фильтра сбрасывает страницу на первую.
function apply(patch: Record<string, string>) {
  const query: Record<string, unknown> = { ...route.query, ...patch };
  for (const key of Object.keys(query)) {
    if (!query[key]) delete query[key];
  }
  delete query.page;
  navigateTo({ path: route.path, query });
}

function onChange(key: 'sort' | 'author' | 'tag', event: Event) {
  apply({ [key]: (event.target as HTMLSelectElement).value });
}

function reset() {
  apply({ sort: '', author: '', tag: '' });
}

const selectClass =
  'appearance-none rounded border border-foreground/15 bg-card py-2 pl-3 pr-9 text-sm text-foreground outline-none transition hover:border-accent focus:border-accent';
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-foreground/10 pb-5">
    <label class="flex items-center gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-foreground/50">Сортировка</span>
      <span class="relative">
        <select
          :value="currentSort"
          :class="selectClass"
          aria-label="Сортировка"
          @change="onChange('sort', $event)"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </label>

    <label v-if="showAuthor && authors.length" class="flex items-center gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-foreground/50">Автор</span>
      <span class="relative">
        <select
          :value="currentAuthor"
          :class="selectClass"
          aria-label="Фильтр по автору"
          @change="onChange('author', $event)"
        >
          <option value="">Все авторы</option>
          <option v-for="author in authors" :key="author.id" :value="author.slug">
            {{ author.name }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </label>

    <label v-if="showTag && tags.length" class="flex items-center gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-foreground/50">Тег</span>
      <span class="relative">
        <select
          :value="currentTag"
          :class="selectClass"
          aria-label="Фильтр по тегу"
          @change="onChange('tag', $event)"
        >
          <option value="">Все теги</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.slug">
            {{ tag.name }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </label>

    <button
      v-if="hasActive"
      type="button"
      class="text-sm text-foreground/60 underline decoration-foreground/30 underline-offset-4 transition hover:text-accent hover:decoration-accent"
      @click="reset"
    >
      Сбросить
    </button>
  </div>
</template>
