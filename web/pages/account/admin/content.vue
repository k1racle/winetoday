<script setup lang="ts">
interface Material {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt?: string | null;
  viewsTotal: number;
  author?: { name: string } | null;
}

const { user, isAuthenticated } = useAuth();
const { getEditorMaterials } = useApi();

const materials = ref<Material[]>([]);
const total = ref(0);
const counts = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

const typeFilter = ref('');
const statusFilter = ref('');
const search = ref('');

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'article', label: 'Статьи' },
  { value: 'news', label: 'Новости' },
  { value: 'video', label: 'Видео' },
  { value: 'gallery', label: 'Галереи' },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'draft', label: 'Черновик' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'rejected', label: 'Отклонено' },
];

const typeLabels: Record<string, string> = {
  article: 'Статья',
  news: 'Новость',
  video: 'Видео',
  gallery: 'Галерея',
};

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  in_review: 'На проверке',
  published: 'Опубликовано',
  rejected: 'Отклонено',
};

const statusColors: Record<string, string> = {
  draft: 'bg-orange-500',
  in_review: 'bg-yellow-500',
  published: 'bg-accent',
  rejected: 'bg-red-600',
};

async function fetchMaterials() {
  loading.value = true;
  error.value = '';
  try {
    const query: Record<string, string> = {};
    if (typeFilter.value) query.type = typeFilter.value;
    if (statusFilter.value) query.status = statusFilter.value;
    if (search.value.trim()) query.search = search.value.trim();
    const res: any = await getEditorMaterials(query);
    materials.value = Array.isArray(res?.items) ? res.items : [];
    total.value = res?.total || 0;
    counts.value = Array.isArray(res?.counts) ? res.counts : [];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки материалов';
  } finally {
    loading.value = false;
  }
}

function countForType(type: string) {
  return counts.value.find((c) => c.type === type)?._count?.type || 0;
}

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchMaterials();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Материалы</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <!-- Counts -->
    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="opt in typeOptions.filter(o => o.value)" :key="opt.value" class="border border-foreground/10 bg-foreground/5 p-3">
        <p class="text-xs text-foreground/60">{{ opt.label }}</p>
        <p class="text-xl font-bold">{{ countForType(opt.value) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap items-end gap-3">
      <div>
        <label class="mb-1 block text-xs font-medium text-foreground/70">Тип</label>
        <select v-model="typeFilter" class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" @change="fetchMaterials">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-foreground/70">Статус</label>
        <select v-model="statusFilter" class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" @change="fetchMaterials">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-foreground/70">Поиск по заголовку</label>
        <input v-model="search" type="text" class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Введите заголовок..." @keyup.enter="fetchMaterials">
      </div>
      <button class="btn-primary" @click="fetchMaterials">Найти</button>
      <button class="btn-secondary" @click="typeFilter = ''; statusFilter = ''; search = ''; fetchMaterials()">Сбросить</button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <p class="mt-4 text-xs text-foreground/60">Всего: {{ total }}</p>

    <div v-if="!loading && materials.length" class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse border border-foreground/10 text-sm">
        <thead class="bg-foreground/10">
          <tr>
            <th class="border border-foreground/10 px-4 py-2 text-left">Статус</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Тип</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Заголовок</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Автор</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Просмотры</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Обновлено</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.id" class="bg-foreground/5">
            <td class="border border-foreground/10 px-4 py-2">
              <span class="inline-flex items-center gap-1.5 text-xs">
                <span class="h-2 w-2 rounded-full" :class="statusColors[m.status] || 'bg-gray-400'" />
                {{ statusLabels[m.status] || m.status }}
              </span>
            </td>
            <td class="border border-foreground/10 px-4 py-2">{{ typeLabels[m.type] || m.type }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              <NuxtLink :to="`/${m.type === 'article' ? 'articles' : m.type === 'news' ? 'news' : m.type === 'video' ? 'videos' : 'gallery'}/${m.slug}`" class="hover:text-foreground hover:underline" target="_blank">
                {{ m.title }}
              </NuxtLink>
            </td>
            <td class="border border-foreground/10 px-4 py-2">{{ m.author?.name || '—' }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ m.viewsTotal || 0 }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ formatDate(m.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !materials.length" class="mt-6 text-sm text-foreground/60">Материалы не найдены</p>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
