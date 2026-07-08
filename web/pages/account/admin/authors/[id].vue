<script setup lang="ts">
interface Author {
  id: string;
  name: string;
  slug: string;
  position?: string | null;
  bio?: string | null;
  user?: {
    id: string;
    email: string;
    username: string | null;
    role: string;
  } | null;
}

interface Material {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string | null;
  updatedAt: string;
  viewsTotal: number;
}

interface DailyView {
  date: string;
  articleViews: number;
  newsViews: number;
  videoViews: number;
  galleryViews: number;
  totalViews: number;
}

interface Analytics {
  author: Author;
  materials: Material[];
  totalViews: number;
  dailyViews: DailyView[];
}

const route = useRoute();
const { user, isAuthenticated } = useAuth();
const { getAuthorAnalytics } = useApi();

const data = ref<Analytics | null>(null);
const loading = ref(false);
const error = ref('');

const materialsLimit = 20;
const materialsOffset = ref(0);
const materialsSort = ref<'updatedAt' | 'publishedAt' | 'viewsTotal' | 'title'>('updatedAt');
const materialsOrder = ref<'asc' | 'desc'>('desc');

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

const typeRouteMap: Record<string, string> = {
  article: 'articles',
  news: 'news',
  video: 'videos',
  gallery: 'gallery',
};

async function fetchAnalytics() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getAuthorAnalytics(route.params.id as string) as Analytics;
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки аналитики';
  } finally {
    loading.value = false;
  }
}

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
}

const chartData = computed(() => {
  if (!data.value?.dailyViews.length) return [];
  return data.value.dailyViews.map((day) => ({
    label: formatDate(day.date),
    value: day.totalViews || 0,
    title: `${formatDate(day.date)}\nВсего: ${day.totalViews || 0}\nСтатьи: ${day.articleViews || 0}\nНовости: ${day.newsViews || 0}\nВидео: ${day.videoViews || 0}\nГалереи: ${day.galleryViews || 0}`,
  }));
});

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  if (!data.value) return counts;
  for (const m of data.value.materials) {
    counts[m.type] = (counts[m.type] || 0) + 1;
  }
  return counts;
});

const sortedMaterials = computed(() => {
  if (!data.value) return [];
  const field = materialsSort.value;
  const order = materialsOrder.value;
  return [...data.value.materials].sort((a, b) => {
    let av: any = a[field];
    let bv: any = b[field];
    if (av === null || av === undefined) av = '';
    if (bv === null || bv === undefined) bv = '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });
});

const paginatedMaterials = computed(() => {
  return sortedMaterials.value.slice(materialsOffset.value, materialsOffset.value + materialsLimit);
});

const materialsTotalPages = computed(() => Math.max(1, Math.ceil((data.value?.materials.length || 0) / materialsLimit)));
const materialsCurrentPage = computed(() => Math.floor(materialsOffset.value / materialsLimit) + 1);

function toggleMaterialsSort(field: 'updatedAt' | 'publishedAt' | 'viewsTotal' | 'title') {
  if (materialsSort.value === field) {
    materialsOrder.value = materialsOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    materialsSort.value = field;
    materialsOrder.value = 'asc';
  }
  materialsOffset.value = 0;
}

function goToMaterialsPage(page: number) {
  const target = Math.max(1, Math.min(materialsTotalPages.value, page));
  materialsOffset.value = (target - 1) * materialsLimit;
}

function materialsSortIcon(field: string) {
  if (materialsSort.value !== field) return '↕';
  return materialsOrder.value === 'asc' ? '↑' : '↓';
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchAnalytics();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Кабинет автора</h1>
    </div>

    <NuxtLink to="/account/admin/authors" class="text-sm text-accent hover:underline">← Назад к авторам</NuxtLink>

    <AdminTabs class="mt-6" />

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <template v-if="data && !loading">
      <!-- Author header -->
      <div class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div class="border border-foreground/10 bg-foreground/5 p-5">
          <h2 class="mb-4 text-lg font-bold">{{ data.author.name }}</h2>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-xs text-foreground/60">Slug</dt>
              <dd class="font-mono text-xs">{{ data.author.slug }}</dd>
            </div>
            <div>
              <dt class="text-xs text-foreground/60">Должность</dt>
              <dd>{{ data.author.position || '—' }}</dd>
            </div>
            <div v-if="data.author.user">
              <dt class="text-xs text-foreground/60">Пользователь</dt>
              <dd>
                <NuxtLink
                  :to="`/account/admin/users/${data.author.user.id}`"
                  class="text-accent hover:underline"
                >
                  {{ data.author.user.username || data.author.user.email }}
                </NuxtLink>
                <span class="ml-2 text-xs text-foreground/50">({{ data.author.user.role }})</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-foreground/60">Всего материалов</dt>
              <dd class="text-2xl font-bold">{{ data.materials.length }}</dd>
            </div>
            <div>
              <dt class="text-xs text-foreground/60">Всего просмотров</dt>
              <dd class="text-2xl font-bold">{{ data.totalViews.toLocaleString('ru-RU') }}</dd>
            </div>
          </dl>
        </div>

        <!-- Type breakdown -->
        <div class="border border-foreground/10 bg-foreground/5 p-5">
          <h3 class="mb-4 text-lg font-bold">Материалы по типам</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              v-for="type in ['article', 'news', 'video', 'gallery']"
              :key="type"
              class="border border-foreground/10 bg-foreground/5 p-3"
            >
              <p class="text-xs text-foreground/60">{{ typeLabels[type] || type }}</p>
              <p class="text-xl font-bold">{{ typeCounts[type] || 0 }}</p>
            </div>
          </div>

          <h3 class="mb-2 mt-6 text-lg font-bold">Просмотры по датам</h3>
          <div class="h-48 w-full overflow-hidden border border-foreground/10 bg-foreground/5 p-2">
            <SimpleBarChart v-if="chartData.length" :data="chartData" color="var(--color-accent)" :height="180" />
            <p v-else class="flex h-full items-center justify-center text-sm text-foreground/60">Нет данных о просмотрах по дням</p>
          </div>
        </div>
      </div>

      <!-- Materials table -->
      <div class="mt-8">
        <h3 class="mb-4 text-lg font-bold">Все записи автора</h3>
        <div class="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
          <p>Всего: {{ data.materials.length }}</p>
          <p>Страница {{ materialsCurrentPage }} из {{ materialsTotalPages }}</p>
        </div>
        <div v-if="!data.materials.length" class="text-sm text-foreground/60">Нет записей</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse border border-foreground/10 text-sm">
            <thead class="bg-foreground/10">
              <tr>
                <th class="border border-foreground/10 px-3 py-2 text-left">Статус</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Тип</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Заголовок</th>
                <th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" @click="toggleMaterialsSort('viewsTotal')">
                  <span class="inline-flex items-center gap-1">Просмотры <span class="text-foreground/40">{{ materialsSortIcon('viewsTotal') }}</span></span>
                </th>
                <th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" @click="toggleMaterialsSort('publishedAt')">
                  <span class="inline-flex items-center gap-1">Опубликовано <span class="text-foreground/40">{{ materialsSortIcon('publishedAt') }}</span></span>
                </th>
                <th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" @click="toggleMaterialsSort('updatedAt')">
                  <span class="inline-flex items-center gap-1">Обновлено <span class="text-foreground/40">{{ materialsSortIcon('updatedAt') }}</span></span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in paginatedMaterials" :key="m.id" class="bg-foreground/5">
                <td class="border border-foreground/10 px-3 py-2">
                  <span class="inline-flex items-center gap-1.5 text-xs">
                    <span class="h-2 w-2 rounded-full" :class="statusColors[m.status] || 'bg-gray-400'" />
                    {{ statusLabels[m.status] || m.status }}
                  </span>
                </td>
                <td class="border border-foreground/10 px-3 py-2">{{ typeLabels[m.type] || m.type }}</td>
                <td class="border border-foreground/10 px-3 py-2">
                  <NuxtLink
                    :to="`/${typeRouteMap[m.type] || m.type}/${m.slug}`"
                    class="hover:text-foreground hover:underline"
                    target="_blank"
                  >
                    {{ m.title }}
                  </NuxtLink>
                </td>
                <td class="border border-foreground/10 px-3 py-2">{{ m.viewsTotal || 0 }}</td>
                <td class="border border-foreground/10 px-3 py-2">{{ formatDate(m.publishedAt) }}</td>
                <td class="border border-foreground/10 px-3 py-2">{{ formatDate(m.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="materialsTotalPages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button class="btn-secondary" :disabled="materialsCurrentPage <= 1" @click="goToMaterialsPage(materialsCurrentPage - 1)">← Назад</button>
          <div class="flex flex-wrap items-center gap-1">
            <button
              v-for="page in materialsTotalPages"
              :key="page"
              class="h-8 min-w-[2rem] px-2 text-xs transition"
              :class="page === materialsCurrentPage ? 'bg-accent text-black' : 'border border-foreground/10 bg-foreground/5 hover:bg-foreground/10'"
              @click="goToMaterialsPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button class="btn-secondary" :disabled="materialsCurrentPage >= materialsTotalPages" @click="goToMaterialsPage(materialsCurrentPage + 1)">Вперёд →</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
