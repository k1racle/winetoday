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

const { getAdminAuthors, createAuthor } = useApi();

const authors = ref<AdminAuthor[]>([]);
const loading = ref(false);
const error = ref('');

const showForm = ref(false);
const submitLoading = ref(false);
const submitError = ref('');
const newAuthor = ref({
  name: '',
  slug: '',
  position: '',
  bio: '',
});

function dedupeAuthors(list: AdminAuthor[]): AdminAuthor[] {
  const map = new Map<string, AdminAuthor>();
  for (const author of list) {
    const name = author.name.trim();
    const existing = map.get(name);
    if (!existing) {
      map.set(name, author);
      continue;
    }
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

async function onSubmit() {
  submitLoading.value = true;
  submitError.value = '';
  try {
    const body: Record<string, string> = { name: newAuthor.value.name.trim() };
    if (newAuthor.value.slug.trim()) body.slug = newAuthor.value.slug.trim();
    if (newAuthor.value.position.trim()) body.position = newAuthor.value.position.trim();
    if (newAuthor.value.bio.trim()) body.bio = newAuthor.value.bio.trim();

    await createAuthor(body);
    newAuthor.value = { name: '', slug: '', position: '', bio: '' };
    showForm.value = false;
    await fetchAuthors();
  } catch (err: any) {
    submitError.value = err?.data?.message || err?.message || 'Ошибка создания автора';
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  fetchAuthors();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Авторы</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 flex items-center justify-between">
      <button
        class="bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Отменить' : 'Добавить автора' }}
      </button>
      <button class="text-sm text-accent hover:underline" @click="fetchAuthors">Обновить</button>
    </div>

    <form
      v-if="showForm"
      class="mt-6 space-y-4 border border-foreground/10 bg-card p-5 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <div>
        <label class="mb-1 block text-sm font-normal">Имя <span class="text-red-600">*</span></label>
        <input
          v-model="newAuthor.name"
          type="text"
          required
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="Иван Иванов"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-normal">Slug</label>
        <input
          v-model="newAuthor.slug"
          type="text"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="ivan-ivanov"
        />
        <p class="mt-1 text-xs text-foreground/50">Если не указан, будет сгенерирован автоматически.</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-normal">Должность</label>
        <input
          v-model="newAuthor.position"
          type="text"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="Винный критик"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-normal">Биография</label>
        <textarea
          v-model="newAuthor.bio"
          rows="3"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="Краткая биография"
        />
      </div>
      <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
      <button
        type="submit"
        :disabled="submitLoading"
        class="bg-accent px-5 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50"
      >
        {{ submitLoading ? 'Сохранение...' : 'Создать автора' }}
      </button>
    </form>

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
            <th class="border border-foreground/10 px-4 py-2 text-left">Действия</th>
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
            <td class="border border-foreground/10 px-4 py-2">
              <NuxtLink
                :to="`/account/admin/authors/${a.id}`"
                class="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent transition hover:bg-accent hover:text-black"
              >
                Редактировать
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !authors.length" class="mt-6 text-sm text-foreground/60">Нет авторов</p>
  </div>
</template>
