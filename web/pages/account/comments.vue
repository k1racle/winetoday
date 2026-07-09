<script setup lang="ts">
interface ContentItemPreview {
  id: string;
  type: string;
  title: string;
  slug: string;
}

interface UserComment {
  id: string;
  body: string;
  createdAt: string;
  status: string;
  contentItem: ContentItemPreview | null;
}

const { isAuthenticated } = useAuth();
const { getMyComments } = useApi();

const comments = ref<UserComment[]>([]);
const loading = ref(false);
const error = ref('');

const typeRouteMap: Record<string, string> = {
  article: 'articles',
  news: 'news',
  video: 'videos',
  gallery: 'gallery',
};

function itemLink(item: ContentItemPreview) {
  const base = typeRouteMap[item.type] || item.type;
  return `/${base}/${item.slug}`;
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    comments.value = (await getMyComments()) as UserComment[];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/');
    return;
  }
  load();
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-2 font-heading text-2xl font-bold">Личный кабинет</h1>
    <AccountTabs class="mb-6" />

    <h2 class="mb-4 font-heading text-xl font-bold">Мои комментарии</h2>

    <p v-if="loading" class="text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div v-if="!loading && !comments.length" class="text-sm text-foreground/60">
      Вы ещё не оставляли комментариев.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border border-foreground/10 bg-card p-4"
      >
        <div class="mb-2 flex items-center justify-between text-xs text-foreground/50">
          <span>{{ new Date(comment.createdAt).toLocaleDateString('ru-RU') }}</span>
          <span v-if="comment.status !== 'approved'" class="text-yellow-500">{{ comment.status }}</span>
        </div>
        <p class="text-sm leading-relaxed">{{ comment.body }}</p>
        <div v-if="comment.contentItem" class="mt-2 text-sm">
          <span class="text-foreground/50">К материалу:</span>
          <NuxtLink :to="itemLink(comment.contentItem)" class="ml-1 text-accent hover:underline">
            {{ comment.contentItem.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
