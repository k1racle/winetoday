<script setup lang="ts">
interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  authorId: string | null;
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

const route = useRoute();
const { user, isAuthenticated } = useAuth();
const { getUser, getEditorMaterials } = useApi();

const profile = ref<AdminUser | null>(null);
const materials = ref<Material[]>([]);
const loading = ref(false);
const error = ref('');

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

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    profile.value = await getUser(route.params.id as string) as AdminUser;
    if (profile.value?.authorId) {
      const res: any = await getEditorMaterials({ authorId: profile.value.authorId });
      materials.value = Array.isArray(res?.items) ? res.items : [];
    } else {
      materials.value = [];
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки данных';
  } finally {
    loading.value = false;
  }
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
        <h3 class="mb-4 text-lg font-bold">Записи пользователя</h3>
        <p v-if="!profile.authorId" class="text-sm text-foreground/60">У пользователя ещё нет автора, записей нет.</p>
        <div v-else-if="!materials.length" class="text-sm text-foreground/60">Нет записей</div>
        <div v-else class="overflow-x-auto">
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
      </div>
    </div>
  </div>
</template>
