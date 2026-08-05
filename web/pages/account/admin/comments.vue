<script setup lang="ts">
interface AdminComment {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  author: string;
  contentItem: { id: string; title: string; slug: string; type: string };
}

interface StopWord {
  id: string;
  word: string;
}

const { user, isAuthenticated } = useAuth();
const {
  getAdminComments,
  deleteAdminComment,
  getCommentStopWords,
  addCommentStopWord,
  deleteCommentStopWord,
} = useApi();

const items = ref<AdminComment[]>([]);
const total = ref(0);
const limit = 20;
const offset = ref(0);
const loading = ref(false);
const error = ref('');
const deleting = ref<Record<string, boolean>>({});

const stopWords = ref<StopWord[]>([]);
const newWord = ref('');
const stopWordsLoading = ref(false);
const stopWordsError = ref('');

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / limit)));
const currentPage = computed(() => Math.floor(offset.value / limit) + 1);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await getAdminComments({ limit, offset: offset.value });
    items.value = res?.items || [];
    total.value = res?.total || 0;
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки комментариев';
  } finally {
    loading.value = false;
  }
}

function goToPage(page: number) {
  offset.value = (page - 1) * limit;
  load();
}

async function removeComment(comment: AdminComment) {
  if (!confirm('Удалить этот комментарий?')) return;
  deleting.value[comment.id] = true;
  try {
    await deleteAdminComment(comment.id);
    await load();
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Не удалось удалить комментарий');
  } finally {
    deleting.value[comment.id] = false;
  }
}

async function loadStopWords() {
  try {
    const res: any = await getCommentStopWords();
    stopWords.value = Array.isArray(res) ? res : [];
  } catch {
    stopWords.value = [];
  }
}

async function onAddStopWord() {
  const word = newWord.value.trim();
  if (!word || stopWordsLoading.value) return;
  stopWordsLoading.value = true;
  stopWordsError.value = '';
  try {
    await addCommentStopWord(word);
    newWord.value = '';
    await loadStopWords();
  } catch (err: any) {
    stopWordsError.value = err?.data?.message || err?.message || 'Не удалось добавить слово';
  } finally {
    stopWordsLoading.value = false;
  }
}

async function onDeleteStopWord(word: StopWord) {
  try {
    await deleteCommentStopWord(word.id);
    await loadStopWords();
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Не удалось удалить слово');
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function materialUrl(comment: AdminComment) {
  const type = comment.contentItem?.type;
  const slug = comment.contentItem?.slug;
  if (!slug) return '#';
  if (type === 'article') return `/articles/${slug}`;
  if (type === 'news') return `/news/${slug}`;
  if (type === 'video') return `/videos/${slug}`;
  if (type === 'gallery') return `/gallery/${slug}`;
  return '#';
}

onMounted(() => {
  if (!isAuthenticated.value || !['admin', 'editor'].includes(user.value?.role || '')) {
    navigateTo('/account');
    return;
  }
  load();
  loadStopWords();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Комментарии</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <template v-if="!loading">
      <p class="mt-6 text-sm text-foreground/60">Всего: {{ total }}</p>

      <div v-if="items.length" class="mt-4 overflow-x-auto">
        <table class="w-full border-collapse border border-foreground/10 text-sm">
          <thead class="bg-foreground/10">
            <tr>
              <th class="border border-foreground/10 px-4 py-2 text-left">Дата/время</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Материал</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Автор</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Комментарий</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in items" :key="c.id" class="bg-foreground/5 align-top">
              <td class="whitespace-nowrap border border-foreground/10 px-4 py-2 text-xs text-foreground/70">
                {{ formatDate(c.createdAt) }}
              </td>
              <td class="border border-foreground/10 px-4 py-2">
                <NuxtLink :to="materialUrl(c)" class="text-accent hover:underline" target="_blank">
                  {{ c.contentItem?.title || '—' }}
                </NuxtLink>
              </td>
              <td class="border border-foreground/10 px-4 py-2">{{ c.author }}</td>
              <td class="max-w-md border border-foreground/10 px-4 py-2">{{ c.body }}</td>
              <td class="border border-foreground/10 px-4 py-2">
                <button
                  type="button"
                  class="inline-flex items-center rounded border border-red-600/40 px-3 py-1 text-xs text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  :disabled="deleting[c.id]"
                  @click="removeComment(c)"
                >
                  {{ deleting[c.id] ? '…' : 'Удалить' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="mt-6 text-sm text-foreground/60">Комментариев нет</p>

      <nav v-if="pageCount > 1" aria-label="Пагинация" class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          v-if="currentPage > 1"
          type="button"
          class="pg-btn"
          @click="goToPage(currentPage - 1)"
        >
          ←
        </button>
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          :class="['pg-btn', page === currentPage && 'pg-btn-active']"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          v-if="currentPage < pageCount"
          type="button"
          class="pg-btn"
          @click="goToPage(currentPage + 1)"
        >
          →
        </button>
      </nav>
    </template>

    <!-- Stop words -->
    <div class="mt-12 border-t border-foreground/10 pt-6">
      <h2 class="font-heading text-lg font-normal">Стоп-слова</h2>
      <p class="mt-1 text-sm text-foreground/60">
        Комментарии, содержащие эти слова (с начала слова), не будут опубликованы.
      </p>

      <form class="mt-4 flex flex-wrap items-center gap-2" @submit.prevent="onAddStopWord">
        <input
          v-model="newWord"
          type="text"
          placeholder="Новое стоп-слово"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none sm:w-64"
        >
        <button
          type="submit"
          :disabled="stopWordsLoading || !newWord.trim()"
          class="bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50"
        >
          {{ stopWordsLoading ? 'Добавление...' : 'Добавить' }}
        </button>
      </form>
      <p v-if="stopWordsError" class="mt-2 text-sm text-red-600">{{ stopWordsError }}</p>

      <div v-if="stopWords.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="w in stopWords"
          :key="w.id"
          class="inline-flex items-center gap-2 rounded border border-foreground/10 bg-card px-3 py-1 text-sm"
        >
          {{ w.word }}
          <button
            type="button"
            class="text-red-600 transition hover:text-red-400"
            :aria-label="`Удалить ${w.word}`"
            @click="onDeleteStopWord(w)"
          >
            ✕
          </button>
        </span>
      </div>
      <p v-else class="mt-4 text-sm text-foreground/60">Список пуст</p>
    </div>
  </div>
</template>

<style scoped>
.pg-btn {
  @apply flex h-9 min-w-9 items-center justify-center rounded border border-foreground/10 px-3 text-sm transition-colors hover:border-accent hover:text-accent;
}
.pg-btn-active {
  @apply border-accent bg-accent text-black hover:text-black;
}
</style>
