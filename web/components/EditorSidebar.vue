<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps<{ activeType?: string }>();
const emit = defineEmits<{
  (e: 'selectType', type: string): void;
  (e: 'selectMaterial', material: any): void;
  (e: 'newMaterial'): void;
}>();

const { user } = useAuth();
const { getEditorMaterials } = useApi();

const typeLabels: Record<string, { label: string; icon: string }> = {
  all: { label: 'Все материалы', icon: '📁' },
  article: { label: 'Статьи', icon: '📄' },
  news: { label: 'Новости', icon: '✎' },
  video: { label: 'Видео', icon: '🎬' },
  gallery: { label: 'Галереи', icon: '🖼' },
};

const typeOrder = ['all', 'article', 'news', 'video', 'gallery'];

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  author: 'Автор',
  member: 'Участник',
};

const search = ref('');
const materials = ref<any[]>([]);
const counts = ref<Record<string, number>>({});
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = 20;

const initials = computed(() => {
  const name = user.value?.displayName || user.value?.username || user.value?.email || '';
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

async function load() {
  loading.value = true;
  try {
    const query: Record<string, unknown> = {
      search: search.value || undefined,
      limit,
      offset: (page.value - 1) * limit,
    };
    if (props.activeType && props.activeType !== 'all') {
      query.type = props.activeType;
    }
    const res: any = await getEditorMaterials(query);
    materials.value = res.items || [];
    total.value = res.total || 0;
    const map: Record<string, number> = {};
    (res.counts || []).forEach((c: any) => {
      map[c.type] = c._count?.type || 0;
    });
    map.all = Object.values(map).reduce((sum: number, n) => sum + (typeof n === 'number' ? n : 0), 0);
    counts.value = map;
  } catch (e) {
    materials.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function goToPage(newPage: number) {
  const target = Math.max(1, Math.min(totalPages.value, newPage));
  if (target !== page.value) {
    page.value = target;
    load();
  }
}

defineExpose({ load });

onMounted(load);
watch(() => props.activeType, () => {
  page.value = 1;
  load();
});
watch(search, () => {
  page.value = 1;
  // simple debounce could be added
  load();
});

const statusMeta: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-orange-500' },
  in_review: { label: 'На проверке', color: 'bg-blue-500' },
  published: { label: 'Опубликовано', color: 'bg-accent' },
  rejected: { label: 'Отклонено', color: 'bg-red-600' },
};

function relativeTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} дн назад`;
  return d.toLocaleDateString('ru-RU');
}

function selectType(type: string) {
  emit('selectType', type);
}
</script>

<template>
  <aside class="flex h-full flex-col border border-foreground/10 bg-card">
    <!-- User -->
    <div class="flex items-center gap-3 border-b border-foreground/10 p-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-normal text-black">
        {{ initials }}
      </div>
      <div class="min-w-0">
        <div class="truncate text-sm font-normal">
          {{ user?.displayName || user?.username || user?.email }}
        </div>
        <div class="text-xs text-foreground/50">
          Роль: {{ roleLabels[user?.role || 'member'] }}
        </div>
      </div>
    </div>

    <!-- Type list -->
    <div class="px-3 pt-3">
      <p class="px-2 text-[10px] font-normal uppercase tracking-wider text-foreground/40">
        Тип материала
      </p>
      <div class="mt-2 space-y-1">
        <button
          v-for="type in typeOrder"
          :key="type"
          class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition"
          :class="activeType === type ? 'bg-accent/10 text-accent' : 'text-foreground/70 hover:bg-foreground/5'"
          @click="selectType(type)"
        >
          <span>{{ typeLabels[type].icon }}</span>
          <span class="flex-1">{{ typeLabels[type].label }}</span>
          <span
            class="rounded px-1.5 py-0.5 text-[10px] font-normal"
            :class="activeType === type ? 'bg-accent text-black' : 'bg-foreground/5 text-foreground/60'"
          >
            {{ counts[type] || 0 }}
          </span>
        </button>
      </div>
      <button
        class="mt-3 w-full rounded bg-accent px-3 py-2 text-sm font-normal text-black transition hover:bg-accent/90"
        @click="emit('newMaterial')"
      >
        ＋ Новый материал
      </button>
    </div>

    <!-- Recent materials -->
    <div class="flex min-h-0 flex-1 flex-col border-t border-foreground/10 mt-4">
      <p class="px-5 pt-3 pb-2 text-[10px] font-normal uppercase tracking-wider text-foreground/40">
        Все материалы
      </p>
      <div class="px-4 pb-2">
        <input
          v-model="search"
          type="text"
          placeholder="Фильтр по заголовку..."
          class="w-full border border-foreground/10 bg-card px-3 py-1.5 text-xs outline-none focus:border-accent"
        >
      </div>
      <div class="flex-1 overflow-y-auto px-3 pb-3">
        <div v-if="loading" class="px-2 py-4 text-xs text-foreground/50">Загрузка…</div>
        <div v-else-if="!materials.length" class="px-2 py-4 text-xs text-foreground/50">
          Нет материалов
        </div>
        <div v-else class="space-y-1">
          <button
            v-for="item in materials"
            :key="item.id"
            class="w-full rounded px-2 py-2 text-left transition hover:bg-foreground/5"
            @click="emit('selectMaterial', item)"
          >
            <div class="truncate text-xs font-normal leading-tight">
              {{ item.title }}
            </div>
            <div class="mt-1 flex items-center gap-1.5 text-[10px] text-foreground/50">
              <span class="h-1.5 w-1.5 rounded-full" :class="statusMeta[item.status]?.color || 'bg-gray-400'" />
              <span>{{ statusMeta[item.status]?.label || item.status }}</span>
              <span>·</span>
              <span>{{ relativeTime(item.updatedAt) }}</span>
            </div>
          </button>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-2 flex items-center justify-between border-t border-foreground/10 px-2 pt-2">
          <button
            class="px-2 py-1 text-xs text-foreground/70 transition hover:text-foreground disabled:opacity-40"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            ← Назад
          </button>
          <span class="text-[10px] text-foreground/50">
            {{ page }} / {{ totalPages }}
          </span>
          <button
            class="px-2 py-1 text-xs text-foreground/70 transition hover:text-foreground disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
