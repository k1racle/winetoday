<script setup lang="ts">
import type { MediaAsset } from '~/types/media';
const props = defineProps<{
  picker?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', media: MediaAsset): void;
  (e: 'upload', media: MediaAsset): void;
}>();

const { getMediaList, deleteMedia, uploadMedia, getMediaUsage } = useApi();

const items = ref<MediaAsset[]>([]);
const total = ref(0);
const limit = ref(24);
const offset = ref(0);
const loading = ref(false);
const type = ref('');
const search = ref('');
const deleting = ref<Record<string, boolean>>({});
const usageMap = ref<Record<string, any[]>>({});

const typeOptions = [
  { value: '', label: 'Все' },
  { value: 'image', label: 'Изображения' },
  { value: 'video', label: 'Видео' },
  { value: 'document', label: 'Документы' },
  { value: 'other', label: 'Прочее' },
];

async function load() {
  loading.value = true;
  try {
    const res: any = await getMediaList({
      limit: limit.value,
      offset: offset.value,
      type: type.value || undefined,
      search: search.value || undefined,
    });
    items.value = res.items || [];
    total.value = res.total || 0;
  } catch (e) {
    items.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function isImage(media: MediaAsset) {
  return media.mime?.startsWith('image/') || /\.(avif|jpe?g|png|gif|webp|svg)$/i.test(media.path);
}

function formatSize(bytes?: string | number | null) {
  if (!bytes) return '';
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} КБ`;
  return `${n} Б`;
}

function fileName(path: string) {
  return path.split('/').pop() || path;
}

async function loadUsage(media: MediaAsset) {
  if (usageMap.value[media.id]) return;
  try {
    const res: any = await getMediaUsage(media.id);
    usageMap.value[media.id] = res || [];
  } catch {
    usageMap.value[media.id] = [];
  }
}

async function remove(media: MediaAsset) {
  if (!confirm(`Удалить файл ${fileName(media.path)}?`)) return;
  deleting.value[media.id] = true;
  try {
    await deleteMedia(media.id);
    await load();
  } catch (e: any) {
    alert(e?.data?.message || 'Не удалось удалить файл');
  } finally {
    deleting.value[media.id] = false;
  }
}

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const res: any = await uploadMedia(file);
    emit('upload', res as MediaAsset);
    await load();
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка загрузки');
  } finally {
    uploading.value = false;
    if (input) input.value = '';
  }
}

function totalPages() {
  return Math.ceil(total.value / limit.value) || 1;
}

function currentPage() {
  return Math.floor(offset.value / limit.value) + 1;
}

function goToPage(page: number) {
  offset.value = (page - 1) * limit.value;
  load();
}

watch([type, search], () => {
  offset.value = 0;
  load();
});

onMounted(() => {
  load();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Поиск по имени или ID"
        class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none transition focus:border-accent sm:w-64"
      >
      <select
        v-model="type"
        class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <button
        type="button"
        class="btn-secondary"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        {{ uploading ? 'Загрузка…' : 'Загрузить файл' }}
      </button>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="onFileSelected"
      >
      <span class="ml-auto text-sm text-foreground/50">{{ total }} файлов</span>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="py-10 text-center text-sm text-foreground/50">
      Загрузка…
    </div>
    <div v-else-if="!items.length" class="py-10 text-center text-sm text-foreground/50">
      Файлы не найдены.
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <div
        v-for="media in items"
        :key="media.id"
        class="group relative overflow-hidden border border-foreground/10 bg-card transition hover:border-accent"
        @mouseenter="loadUsage(media)"
      >
        <div class="relative aspect-square bg-muted">
          <NuxtImg
            v-if="isImage(media)"
            :src="useMediaUrl(media.path)"
            alt=""
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-foreground/40">
            <svg class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>

          <!-- Usage badge -->
          <div
            v-if="usageMap[media.id]?.length"
            class="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-normal text-black"
          >
            Используется
          </div>

          <!-- Overlay actions -->
          <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              v-if="picker"
              type="button"
              class="rounded bg-accent px-3 py-1.5 text-sm font-normal text-black transition hover:bg-accent/90"
              @click="emit('select', media)"
            >
              Выбрать
            </button>
            <template v-else>
              <a
                :href="useMediaUrl(media.path)"
                download
                class="rounded bg-card px-3 py-1.5 text-sm text-foreground transition hover:bg-white"
                title="Скачать"
              >
                ⬇
              </a>
              <button
                type="button"
                class="rounded bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700 disabled:opacity-60"
                :disabled="deleting[media.id]"
                @click="remove(media)"
              >
                {{ deleting[media.id] ? '…' : '✕' }}
              </button>
            </template>
          </div>
        </div>

        <div class="space-y-1 p-2 text-xs">
          <div class="truncate text-foreground" :title="fileName(media.path)">
            {{ fileName(media.path) }}
          </div>
          <div class="text-foreground/50">
            {{ formatSize(media.sizeBytes) }} • {{ media.mime || '—' }}
          </div>
          <div v-if="usageMap[media.id]?.length" class="text-[10px] text-accent">
            {{ usageMap[media.id].length }} использований
          </div>
          <div v-else-if="usageMap[media.id] !== undefined" class="text-[10px] text-foreground/40">
            Не используется
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="flex items-center justify-center gap-2 pt-4">
      <button
        type="button"
        class="px-3 py-1 text-sm text-foreground/70 transition hover:text-foreground disabled:opacity-40"
        :disabled="currentPage() <= 1"
        @click="goToPage(currentPage() - 1)"
      >
        ← Назад
      </button>
      <span class="text-sm text-foreground/60">{{ currentPage() }} / {{ totalPages() }}</span>
      <button
        type="button"
        class="px-3 py-1 text-sm text-foreground/70 transition hover:text-foreground disabled:opacity-40"
        :disabled="currentPage() >= totalPages()"
        @click="goToPage(currentPage() + 1)"
      >
        Вперёд →
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-card px-4 py-2 text-sm font-normal text-foreground transition hover:bg-foreground/5 disabled:opacity-50;
}
</style>
