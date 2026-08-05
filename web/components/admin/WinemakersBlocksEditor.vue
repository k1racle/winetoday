<script setup lang="ts">
import type { MediaAsset } from '~/types/media';

type BlockType = 'text' | 'image' | 'slider' | 'gallery' | 'embed';

interface MediaItem {
  mediaId?: string;
  path?: string;
  source?: string;
}

interface EditorBlock {
  id: string;
  type: BlockType;
  title: string;
  content?: string;
  data?: {
    mediaId?: string;
    path?: string;
    caption?: string;
    source?: string;
    items?: MediaItem[];
    code?: string;
  };
}

const props = defineProps<{
  modelValue?: any[] | null;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void;
}>();

const config = useRuntimeConfig();
const { uploadMedia, getMediaById } = useApi();
const mediaBaseUrl = (config.public.mediaBaseUrl || (config.public.apiUrl as string).replace('/api', '') || '').replace(/\/$/, '');

const localBlocks = ref<EditorBlock[]>([]);
const imagePickerOpen = ref(false);
const collectionPickerOpen = ref(false);
const imageBlockTarget = ref<EditorBlock | null>(null);
const collectionBlockTarget = ref<EditorBlock | null>(null);
let syncToken = 0;

function mediaUrl(path?: string) {
  if (!path) return '';
  return `${mediaBaseUrl}${path}`;
}

function emptyImageData() {
  return {
    mediaId: '',
    path: '',
    caption: '',
    source: '',
  };
}

function emptyCollectionData() {
  return {
    items: [] as MediaItem[],
  };
}

function normalizeBlockType(type?: string): BlockType {
  if (type === 'image' || type === 'slider' || type === 'gallery' || type === 'embed') {
    return type;
  }
  return 'text';
}

async function resolveMediaPath(mediaId?: string, path?: string) {
  if (path) return path;
  if (!mediaId) return '';
  try {
    const media = await getMediaById(mediaId) as MediaAsset | null;
    return media?.path || '';
  } catch {
    return '';
  }
}

async function normalizeBlocks(blocks?: any[] | null): Promise<EditorBlock[]> {
  if (!Array.isArray(blocks)) return [];

  return Promise.all(
    blocks.map(async (block) => {
      const type = normalizeBlockType(block?.type);
      const id = block?.id || crypto.randomUUID();
      const title = typeof block?.title === 'string' ? block.title : '';

      if (type === 'text') {
        return {
          id,
          type: 'text' as const,
          title,
          content: typeof block?.content === 'string' ? block.content : '<p></p>',
        };
      }

      if (type === 'image') {
        const data = block?.data && typeof block.data === 'object' ? block.data : {};
        return {
          id,
          type,
          title,
          data: {
            mediaId: typeof data.mediaId === 'string' ? data.mediaId : '',
            path: await resolveMediaPath(data.mediaId, data.path),
            caption: typeof data.caption === 'string' ? data.caption : '',
            source: typeof data.source === 'string' ? data.source : '',
          },
        };
      }

      if (type === 'slider' || type === 'gallery') {
        const data = block?.data && typeof block.data === 'object' ? block.data : {};
        const items = Array.isArray(data.items) ? data.items : [];

        return {
          id,
          type,
          title,
          data: {
            items: await Promise.all(
              items.map(async (item: any) => ({
                mediaId: typeof item?.mediaId === 'string' ? item.mediaId : '',
                path: await resolveMediaPath(item?.mediaId, item?.path),
                source: typeof item?.source === 'string' ? item.source : '',
              })),
            ),
          },
        };
      }

      const data = block?.data && typeof block.data === 'object' ? block.data : {};
      return {
        id,
        type: 'embed',
        title,
        data: {
          code: typeof block?.html === 'string'
            ? block.html
            : typeof data.code === 'string'
              ? data.code
              : '',
        },
      };
    }),
  );
}

function serializePayload(blocks: any[]) {
  return JSON.stringify(blocks);
}

function buildPayload() {
  return localBlocks.value.map((block) => {
    if (block.type === 'text') {
      return {
        id: block.id,
        type: 'text',
        title: block.title?.trim() || undefined,
        content: block.content || '<p></p>',
      };
    }

    if (block.type === 'embed') {
      return {
        id: block.id,
        type: 'embed',
        title: block.title?.trim() || undefined,
        html: block.data?.code?.trim() || '',
        data: {
          code: block.data?.code?.trim() || '',
        },
      };
    }

    return {
      id: block.id,
      type: block.type,
      title: block.title?.trim() || undefined,
      data: block.type === 'image'
        ? {
            mediaId: block.data?.mediaId || undefined,
            path: block.data?.path || undefined,
            caption: block.data?.caption?.trim() || undefined,
            source: block.data?.source?.trim() || undefined,
          }
        : {
            items: (block.data?.items || [])
              .filter((item) => item.path || item.mediaId)
              .map((item) => ({
                mediaId: item.mediaId || undefined,
                path: item.path || undefined,
                source: item.source?.trim() || undefined,
              })),
          },
    };
  });
}

function sync() {
  emit('update:modelValue', buildPayload());
}

watch(
  () => props.modelValue,
  async (value) => {
    const token = ++syncToken;
    const normalized = await normalizeBlocks(value);
    if (token !== syncToken) return;

    if (serializePayload(buildPayload()) === serializePayload(
      normalized.map((block) => {
        if (block.type === 'text') {
          return {
            id: block.id,
            type: block.type,
            title: block.title?.trim() || undefined,
            content: block.content || '<p></p>',
          };
        }

        if (block.type === 'embed') {
          return {
            id: block.id,
            type: block.type,
            title: block.title?.trim() || undefined,
            html: block.data?.code?.trim() || '',
            data: { code: block.data?.code?.trim() || '' },
          };
        }

        return {
          id: block.id,
          type: block.type,
          title: block.title?.trim() || undefined,
          data: block.data,
        };
      }),
    )) {
      return;
    }

    localBlocks.value = normalized;
  },
  { deep: true, immediate: true },
);

function addTextBlock() {
  localBlocks.value.push({
    id: crypto.randomUUID(),
    type: 'text',
    title: '',
    content: '<p></p>',
  });
  sync();
}

function addBlock(type: Exclude<BlockType, 'text'>) {
  localBlocks.value.push({
    id: crypto.randomUUID(),
    type,
    title: '',
    data: type === 'image' ? emptyImageData() : type === 'embed' ? { code: '' } : emptyCollectionData(),
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

function selectMediaForImage(block: EditorBlock) {
  imageBlockTarget.value = block;
  imagePickerOpen.value = true;
}

function selectMediaForCollection(block: EditorBlock) {
  collectionBlockTarget.value = block;
  collectionPickerOpen.value = true;
}

function onImageSelected(media: MediaAsset) {
  const block = imageBlockTarget.value;
  if (!block) return;
  block.data = {
    ...emptyImageData(),
    ...block.data,
    mediaId: media.id,
    path: media.path,
  };
  imageBlockTarget.value = null;
  sync();
}

function onCollectionSelected(media: MediaAsset) {
  const block = collectionBlockTarget.value;
  if (!block) return;
  if (!block.data) block.data = emptyCollectionData();
  if (!Array.isArray(block.data.items)) block.data.items = [];
  block.data.items.push({
    mediaId: media.id,
    path: media.path,
    source: '',
  });
  sync();
}

async function uploadBlockImage(event: Event, block: EditorBlock) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const media = await uploadMedia(file) as MediaAsset;
    block.data = {
      ...emptyImageData(),
      ...block.data,
      mediaId: media.id,
      path: media.path,
    };
    sync();
  } finally {
    input.value = '';
  }
}

async function addMediaItems(event: Event, block: EditorBlock) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;

  if (!block.data) block.data = emptyCollectionData();
  if (!Array.isArray(block.data.items)) block.data.items = [];

  for (const file of Array.from(files)) {
    try {
      const media = await uploadMedia(file) as MediaAsset;
      block.data.items.push({
        mediaId: media.id,
        path: media.path,
        source: '',
      });
    } catch {
      // Keep the editor responsive; upload API errors are surfaced globally by $fetch.
    }
  }

  input.value = '';
  sync();
}

function removeMediaItem(block: EditorBlock, index: number) {
  if (!block.data?.items) return;
  block.data.items.splice(index, 1);
  sync();
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-normal">{{ label || 'Основной текст' }}</p>
        <p class="mt-1 text-xs text-foreground/55">
          Здесь редактируется полный текст карточки. Внутри текстовых блоков доступны списки, ссылки, выравнивание и другие настройки, как в новостях и статьях.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-secondary text-xs" @click="addTextBlock">Текст</button>
        <button type="button" class="btn-secondary text-xs" @click="addBlock('image')">Изображение</button>
        <button type="button" class="btn-secondary text-xs" @click="addBlock('slider')">Слайдер</button>
        <button type="button" class="btn-secondary text-xs" @click="addBlock('gallery')">Галерея</button>
        <button type="button" class="btn-secondary text-xs" @click="addBlock('embed')">Embed</button>
      </div>
    </div>

    <div v-if="localBlocks.length" class="space-y-3">
      <div v-for="(block, index) in localBlocks" :key="block.id" class="border border-foreground/10 bg-card">
        <div class="flex items-center justify-between gap-3 border-b border-foreground/10 bg-foreground/5 px-3 py-2">
          <div class="flex min-w-0 items-center gap-2">
            <span class="rounded bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/70">
              {{ block.type }}
            </span>
            <input
              v-model="block.title"
              type="text"
              class="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Название блока"
              @input="sync"
            >
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="px-2 py-1 text-xs hover:bg-foreground/10" @click="moveBlock(index, -1)">↑</button>
            <button type="button" class="px-2 py-1 text-xs hover:bg-foreground/10" @click="moveBlock(index, 1)">↓</button>
            <button type="button" class="px-2 py-1 text-xs text-red-600 hover:bg-red-50" @click="removeBlock(index)">✕</button>
          </div>
        </div>

        <div class="p-3">
          <div v-if="block.type === 'text'">
            <TiptapEditor v-model="block.content" @update:model-value="sync" />
          </div>

          <div v-else-if="block.type === 'image'" class="space-y-3">
            <div v-if="block.data?.path" class="relative inline-block">
              <img :src="mediaUrl(block.data.path)" class="max-h-56 rounded border border-foreground/10 object-contain" alt="">
              <button
                type="button"
                class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                @click="block.data = emptyImageData(); sync()"
              >
                ✕
              </button>
            </div>

            <div v-else class="flex flex-col gap-2">
              <label class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-6 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground">
                <input type="file" accept="image/*" class="hidden" @change="uploadBlockImage($event, block)">
                Загрузить изображение
              </label>
              <button type="button" class="btn-secondary w-full text-xs" @click="selectMediaForImage(block)">Выбрать из библиотеки</button>
            </div>

            <input
              v-model="block.data!.caption"
              type="text"
              class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent"
              placeholder="Подпись к изображению"
              @input="sync"
            >
            <input
              v-model="block.data!.source"
              type="text"
              class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent"
              placeholder="Источник фото"
              @input="sync"
            >
          </div>

          <div v-else-if="block.type === 'slider' || block.type === 'gallery'" class="space-y-3">
            <div v-if="block.data?.items?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div v-for="(item, itemIndex) in block.data.items" :key="`${block.id}-${itemIndex}`" class="space-y-2 rounded border border-foreground/10 p-2">
                <div class="relative">
                  <img :src="mediaUrl(item.path)" class="h-24 w-full rounded border border-foreground/10 object-cover" alt="">
                  <button
                    type="button"
                    class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white"
                    @click="removeMediaItem(block, itemIndex)"
                  >
                    ✕
                  </button>
                </div>
                <input
                  v-model="item.source"
                  type="text"
                  class="w-full border border-foreground/10 bg-card px-2 py-1.5 text-[11px] outline-none focus:border-accent"
                  placeholder="Источник фото"
                  @input="sync"
                >
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-6 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground">
                <input type="file" accept="image/*" multiple class="hidden" @change="addMediaItems($event, block)">
                Добавить изображения
              </label>
              <button type="button" class="btn-secondary w-full text-xs" @click="selectMediaForCollection(block)">Выбрать из библиотеки</button>
            </div>
          </div>

          <div v-else-if="block.type === 'embed'" class="space-y-2">
            <textarea
              v-model="block.data!.code"
              rows="5"
              class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-xs font-mono outline-none focus:border-accent"
              placeholder="Вставьте iframe или другой embed-код"
              @input="sync"
            />
          </div>
        </div>
      </div>
    </div>

    <p v-else class="border border-dashed border-foreground/10 px-4 py-6 text-sm text-foreground/50">
      Пока нет основного текста. Добавьте текстовый блок или медиаблок.
    </p>

    <MediaPicker v-model="imagePickerOpen" @select="onImageSelected" />
    <MediaPicker v-model="collectionPickerOpen" @select="onCollectionSelected" />
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-sm font-normal text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
