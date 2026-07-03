<script setup lang="ts">
interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  authorId: string | null;
  authorName: string | null;
}

interface Material {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt?: string | null;
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

interface AnalyticsData {
  author: { id: string; name: string; slug: string };
  materials: Material[];
  totalViews: number;
  dailyViews: DailyView[];
}

const route = useRoute();
const { user, isAuthenticated } = useAuth();
const { getUser, getEditorMaterials, getAuthorAnalytics } = useApi();

const profile = ref<AdminUser | null>(null);
const materials = ref<Material[]>([]);
const loading = ref(false);
const error = ref('');
const total = ref(0);
const page = ref(1);
const limit = 20;

const analytics = ref<AnalyticsData | null>(null);
const analyticsError = ref('');

const currentPage = computed(() => page.value);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

const roleLabels: Record<string, string> = {
  member: 'Читатель',
  author: 'Автор',
  editor: 'Редактор',
  admin: 'Админ',
};

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

async function fetchAnalytics() {
  analyticsError.value = '';
  if (!profile.value?.authorId) {
    analytics.value = null;
    return;
  }
  try {
    analytics.value = await getAuthorAnalytics(profile.value.authorId) as AnalyticsData;
  } catch (err: any) {
    analyticsError.value = err?.data?.message || err?.message || 'Ошибка загрузки аналитики';
  }
}

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    profile.value = await getUser(route.params.id as string) as AdminUser;
    await fetchAnalytics();
    if (profile.value?.authorName) {
      const res: any = await getEditorMaterials({
        authorName: profile.value.authorName,
        limit,
        offset: (page.value - 1) * limit,
      });
      materials.value = Array.isArray(res?.items) ? res.items : [];
      total.value = res?.total || 0;
    } else {
      materials.value = [];
      total.value = 0;
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки данных';
  } finally {
    loading.value = false;
  }
}

function goToPage(targetPage: number) {
  const p = Math.max(1, Math.min(totalPages.value, targetPage));
  if (p === page.value) return;
  page.value = p;
  fetchData();
}

const chartData = computed(() => {
  if (!analytics.value?.dailyViews.length) return [];
  return analytics.value.dailyViews.map((day) => ({
    label: formatDate(day.date),
    value: day.totalViews || 0,
    title: `${formatDate(day.date)}\nВсего: ${day.totalViews || 0}\nСтатьи: ${day.articleViews || 0}\nНовости: ${day.newsViews || 0}\nВидео: ${day.videoViews || 0}\nГалереи: ${day.galleryViews || 0}`,
  }));
});

const analyticsTypeCounts = computed(() => {
  const counts: Record<string, number> = {};
  if (!analytics.value) return counts;
  for (const m of analytics.value.materials) {
    counts[m.type] = (counts[m.type] || 0) + 1;
  }
  return counts;
});

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
}

function downloadStatsCsv() {
  if (!analytics.value?.materials.length) return;
  const rows = [
    ['Тип', 'Заголовок', 'Статус', 'Дата публикации', 'Просмотры'],
    ...analytics.value.materials.map((m) => [
      typeLabels[m.type] || m.type,
      m.title,
      statusLabels[m.status] || m.status,
      formatDate(m.publishedAt),
      m.viewsTotal || 0,
    ]),
    ['Итого', '', '', '', analytics.value.totalViews],
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `materialy-${profile.value?.authorName || 'avtor'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchData();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Профиль пользователя</h1>
    </div>

    <NuxtLink to="/account/admin" class="text-sm text-accent hover:underline">← Назад к пользователям</NuxtLink>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <div v-if="profile" class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      <!-- User card -->
      <div class="border border-foreground/10 bg-foreground/5 p-5">
        <h2 class="mb-4 text-lg font-bold">{{ profile.displayName || profile.username || profile.email }}</h2>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-xs text-foreground/60">Email</dt>
            <dd>{{ profile.email }}</dd>
          </div>
          <div>
            <dt class="text-xs text-foreground/60">Логин</dt>
            <dd>{{ profile.username || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-foreground/60">Отображаемое имя</dt>
            <dd>{{ profile.displayName || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-foreground/60">Роль</dt>
            <dd>{{ roleLabels[profile.role] || profile.role }}</dd>
          </div>
          <div>
            <dt class="text-xs text-foreground/60">Создан</dt>
            <dd>{{ formatDate(profile.createdAt) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Materials -->
      <div>
        <p v-if="analyticsError" class="mb-2 text-sm text-red-600">{{ analyticsError }}</p>
        <div v-if="analytics" class="mb-6 border border-foreground/10 bg-foreground/5 p-5">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-bold">Статистика автора</h3>
            <button class="btn-secondary text-xs" @click="downloadStatsCsv">⬇ Скачать CSV</button>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              v-for="type in ['article', 'news', 'video', 'gallery']"
              :key="type"
              class="border border-foreground/10 bg-foreground/5 p-3"
            >
              <p class="text-xs text-foreground/60">{{ typeLabels[type] || type }}</p>
              <p class="text-xl font-bold">{{ analyticsTypeCounts[type] || 0 }}</p>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="border border-foreground/10 bg-foreground/5 p-3">
              <p class="text-xs text-foreground/60">Всего материалов</p>
              <p class="text-xl font-bold">{{ analytics.materials.length }}</p>
            </div>
            <div class="border border-foreground/10 bg-foreground/5 p-3">
              <p class="text-xs text-foreground/60">Всего просмотров</p>
              <p class="text-xl font-bold">{{ analytics.totalViews.toLocaleString('ru-RU') }}</p>
            </div>
          </div>
          <h4 class="mb-2 mt-6 text-sm font-bold">Просмотры по датам</h4>
          <div class="h-48 w-full overflow-hidden border border-foreground/10 bg-foreground/5 p-2">
            <SimpleBarChart
              v-if="chartData.length"
              :data="chartData"
              color="var(--color-accent)"
              :height="180"
            />
            <p v-else class="flex h-full items-center justify-center text-sm text-foreground/60">
              Нет данных о просмотрах по дням
            </p>
          </div>
        </div>

        <h3 class="mb-4 text-lg font-bold">Записи пользователя</h3>
        <p v-if="!profile.authorId" class="text-sm text-foreground/60">У пользователя ещё нет автора, записей нет.</p>
        <div v-else-if="!materials.length" class="text-sm text-foreground/60">Нет записей</div>
        <div v-else>
          <p class="mb-2 text-xs text-foreground/60">Всего: {{ total }} · Страница {{ currentPage }} из {{ totalPages }}</p>
          <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-foreground/10 text-sm">
            <thead class="bg-foreground/10">
              <tr>
                <th class="border border-foreground/10 px-3 py-2 text-left">Статус</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Тип</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Заголовок</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Просмотры</th>
                <th class="border border-foreground/10 px-3 py-2 text-left">Обновлено</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in materials" :key="m.id" class="bg-foreground/5">
                <td class="border border-foreground/10 px-3 py-2">
                  <span class="inline-flex items-center gap-1.5 text-xs">
                    <span class="h-2 w-2 rounded-full" :class="statusColors[m.status] || 'bg-gray-400'" />
                    {{ statusLabels[m.status] || m.status }}
                  </span>
                </td>
                <td class="border border-foreground/10 px-3 py-2">{{ typeLabels[m.type] || m.type }}</td>
                <td class="border border-foreground/10 px-3 py-2">
                  <NuxtLink :to="`/${m.type === 'article' ? 'articles' : m.type === 'news' ? 'news' : m.type === 'video' ? 'videos' : 'gallery'}/${m.slug}`" class="hover:text-foreground hover:underline" target="_blank">
                    {{ m.title }}
                  </NuxtLink>
                </td>
                <td class="border border-foreground/10 px-3 py-2">{{ m.viewsTotal || 0 }}</td>
                <td class="border border-foreground/10 px-3 py-2">{{ formatDate(m.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            class="btn-secondary"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            ← Назад
          </button>
          <div class="flex flex-wrap items-center gap-1">
            <button
              v-for="p in totalPages"
              :key="p"
              class="h-8 min-w-[2rem] px-2 text-xs transition"
              :class="p === currentPage ? 'bg-accent text-black' : 'border border-foreground/10 bg-foreground/5 hover:bg-foreground/10'"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
          </div>
          <button
            class="btn-secondary"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
