<script setup lang="ts">
const props = defineProps<{
  modelValue?: any[] | null;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void;
}>();

function normalizeBlocks(blocks?: any[] | null) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => ({
    id: block?.id || crypto.randomUUID(),
    type: 'text',
    title: typeof block?.title === 'string' ? block.title : '',
    content: typeof block?.content === 'string' ? block.content : '<p></p>',
  }));
}

const localBlocks = ref(normalizeBlocks(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    localBlocks.value = normalizeBlocks(value);
  },
  { deep: true },
);

function sync() {
  emit(
    'update:modelValue',
    localBlocks.value.map((block) => ({
      id: block.id,
      type: 'text',
      title: block.title?.trim() || undefined,
      content: block.content || '<p></p>',
    })),
  );
}

function addBlock() {
  localBlocks.value.push({
    id: crypto.randomUUID(),
    type: 'text',
    title: '',
    content: '<p></p>',
  });
  sync();
}

function removeBlock(index: number) {
  localBlocks.value.splice(index, 1);
  sync();
}

function moveBlock(index: number, offset: number) {
  const nextIndex = index + offset;
  if (nextIndex < 0 || nextIndex >= localBlocks.value.length) return;
  const next = localBlocks.value.slice();
  const temp = next[index];
  next[index] = next[nextIndex];
  next[nextIndex] = temp;
  localBlocks.value = next;
  sync();
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-normal">{{ label || 'Текстовые блоки' }}</p>
      <button type="button" class="btn-secondary text-xs" @click="addBlock">Добавить блок</button>
    </div>

    <div v-if="localBlocks.length" class="space-y-3">
      <div v-for="(block, index) in localBlocks" :key="block.id" class="border border-foreground/10 bg-card">
        <div class="flex items-center justify-between border-b border-foreground/10 bg-foreground/5 px-3 py-2">
          <input
            v-model="block.title"
            type="text"
            class="w-full bg-transparent text-sm outline-none"
            placeholder="Подзаголовок блока"
            @input="sync"
          >
          <div class="ml-3 flex items-center gap-1">
            <button type="button" class="px-2 py-1 text-xs hover:bg-foreground/10" @click="moveBlock(index, -1)">↑</button>
            <button type="button" class="px-2 py-1 text-xs hover:bg-foreground/10" @click="moveBlock(index, 1)">↓</button>
            <button type="button" class="px-2 py-1 text-xs text-red-600 hover:bg-red-50" @click="removeBlock(index)">✕</button>
          </div>
        </div>
        <div class="p-3">
          <TiptapEditor v-model="block.content" @update:model-value="sync" />
        </div>
      </div>
    </div>

    <p v-else class="border border-dashed border-foreground/10 px-4 py-6 text-sm text-foreground/50">
      Пока нет текстовых блоков.
    </p>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-sm font-normal text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
