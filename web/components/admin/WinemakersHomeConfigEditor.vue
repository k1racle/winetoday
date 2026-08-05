<script setup lang="ts">
import type { WinemakersHomeConfig, WinemakersHomeSectionEntity } from '~/types/winemakers';
import {
  cloneWinemakersHomeConfig,
  defaultWinemakersHomeConfig,
  normalizeWinemakersHomeConfig,
} from '~/utils/winemakersHome';

const props = defineProps<{
  modelValue: WinemakersHomeConfig;
  saving?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: WinemakersHomeConfig];
  save: [];
}>();

const entityLabels: Record<WinemakersHomeSectionEntity, string> = {
  person: 'Виноделы',
  terroir: 'Терруары',
  wine: 'Вина',
  winery: 'Винодельни',
  region: 'Регионы',
};

const localValue = ref<WinemakersHomeConfig>(
  cloneWinemakersHomeConfig(normalizeWinemakersHomeConfig(props.modelValue)),
);

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = cloneWinemakersHomeConfig(normalizeWinemakersHomeConfig(value));
  },
  { deep: true },
);

watch(
  localValue,
  (value) => {
    emit('update:modelValue', cloneWinemakersHomeConfig(value));
  },
  { deep: true },
);

function moveSection(index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= localValue.value.sections.length) return;
  const sections = [...localValue.value.sections];
  const [current] = sections.splice(index, 1);
  sections.splice(nextIndex, 0, current);
  localValue.value.sections = sections;
}

function resetDefaults() {
  localValue.value = cloneWinemakersHomeConfig(defaultWinemakersHomeConfig);
}
</script>

<template>
  <section class="space-y-5 rounded border border-foreground/10 bg-card/40 p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-normal">Главная страница спецпроекта</h2>
        <p class="mt-1 text-sm text-foreground/60">
          Здесь задаются первый экран, порядок блоков, их заголовки, описания и число карточек.
        </p>
      </div>
      <button
        type="button"
        class="btn-secondary text-xs"
        :disabled="saving"
        @click="resetDefaults"
      >
        Сбросить по умолчанию
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div>
        <label class="mb-1 block text-xs font-normal text-foreground/70">Надзаголовок</label>
        <input
          v-model="localValue.intro.eyebrow"
          type="text"
          class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
      </div>
      <div class="md:col-span-2">
        <label class="mb-1 block text-xs font-normal text-foreground/70">Заголовок</label>
        <input
          v-model="localValue.intro.title"
          type="text"
          class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
      </div>
      <div class="md:col-span-3">
        <label class="mb-1 block text-xs font-normal text-foreground/70">Описание</label>
        <textarea
          v-model="localValue.intro.description"
          rows="4"
          class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="(section, index) in localValue.sections"
        :key="section.entity"
        class="space-y-4 rounded border border-foreground/10 bg-background/70 p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-sm font-normal">{{ entityLabels[section.entity] }}</span>
            <label class="flex items-center gap-2 text-xs text-foreground/60">
              <input v-model="section.enabled" type="checkbox" class="h-4 w-4 accent-accent">
              Показывать блок
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-secondary px-3 py-1.5 text-xs"
              :disabled="index === 0 || saving"
              @click="moveSection(index, -1)"
            >
              Выше
            </button>
            <button
              type="button"
              class="btn-secondary px-3 py-1.5 text-xs"
              :disabled="index === localValue.sections.length - 1 || saving"
              @click="moveSection(index, 1)"
            >
              Ниже
            </button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">Заголовок блока</label>
            <input
              v-model="section.title"
              type="text"
              class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
          </div>
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">Текст кнопки</label>
            <input
              v-model="section.buttonLabel"
              type="text"
              class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
          </div>
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">Карточек в блоке</label>
            <input
              v-model.number="section.limit"
              type="number"
              min="1"
              max="12"
              class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
          </div>
          <div class="md:col-span-2 xl:col-span-1">
            <label class="mb-1 block text-xs font-normal text-foreground/70">Сущность</label>
            <input
              :value="entityLabels[section.entity]"
              type="text"
              disabled
              class="w-full border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground/60 outline-none"
            >
          </div>
          <div class="md:col-span-2 xl:col-span-4">
            <label class="mb-1 block text-xs font-normal text-foreground/70">Описание блока</label>
            <textarea
              v-model="section.description"
              rows="3"
              class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        class="btn-primary"
        :disabled="saving"
        @click="$emit('save')"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить витрину' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-normal text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
