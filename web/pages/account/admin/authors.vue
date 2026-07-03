<script setup lang="ts">
interface AdminAuthor {
  id: string;
  name: string;
  slug: string;
  position?: string | null;
  materialsCount: number;
  user?: {
    id: string;
    email: string;
    username: string | null;
    role: string;
  } | null;
}

const { user, isAuthenticated } = useAuth();
const { getAdminAuthors } = useApi();

const authors = ref<AdminAuthor[]>([]);
const loading = ref(false);
const error = ref('');

function dedupeAuthors(list: AdminAuthor[]): AdminAuthor[] {
  const map = new Map<string, AdminAuthor>();
  for (const author of list) {
    const name = author.name.trim();
    const existing = map.get(name);
    if (!existing) {
      map.set(name, author);
      continue;
    }
    // Prefer the author linked to a user. If both have (or lack) a user,
    // keep the one with more materials.
    const authorHasUser = !!author.user;
    const existingHasUser = !!existing.user;
    if (
      (authorHasUser && !existingHasUser) ||
      (authorHasUser === existingHasUser && author.materialsCount > existing.materialsCount)
    ) {
      map.set(name, author);
    }
  }
  return Array.from(map.values());
}

async function fetchAuthors() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminAuthors() as AdminAuthor[];
    authors.value = dedupeAuthors(Array.isArray(res) ? res : []);
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки авторов';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchAuthors();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Авторы</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 flex items-center justify-end">
      <button class="text-sm text-accent hover:underline" @click="fetchAuthors">Обновить</button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <p v-if="!loading && authors.length" class="mt-4 text-sm text-foreground/60">
      Всего: {{ authors.length }}
    </p>

    <div v-if="!loading && authors.length" class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse border border-foreground/10 text-sm">
        <thead class="bg-foreground/10">
          <tr>
            <th class="border border-foreground/10 px-4 py-2 text-left">Имя</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Slug</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Должность</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Материалов</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Пользователь</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in authors" :key="a.id" class="bg-foreground/5">
            <td class="border border-foreground/10 px-4 py-2">
              <NuxtLink :to="`/account/admin/authors/${a.id}`" class="text-accent hover:underline">
                {{ a.name }}
              </NuxtLink>
            </td>
            <td class="border border-foreground/10 px-4 py-2 font-mono text-xs">{{ a.slug }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ a.position || '—' }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ a.materialsCount }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              <NuxtLink
                v-if="a.user"
                :to="`/account/admin/users/${a.user.id}`"
                class="text-accent hover:underline"
              >
                {{ a.user.username || a.user.email }}
              </NuxtLink>
              <span v-else class="text-foreground/50">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !authors.length" class="mt-6 text-sm text-foreground/60">Нет авторов</p>
  </div>
</template>
