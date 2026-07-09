<script setup lang="ts">
import type { Author } from '~/types/content';

interface Subscription {
  id: string;
  author: Author;
  createdAt: string;
}

const { isAuthenticated } = useAuth();
const { getMySubscriptions } = useApi();

const subscriptions = ref<Subscription[]>([]);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    subscriptions.value = (await getMySubscriptions()) as Subscription[];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
}

function remove(id: string) {
  subscriptions.value = subscriptions.value.filter((s) => s.id !== id);
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

    <h2 class="mb-4 font-heading text-xl font-bold">Подписки на авторов</h2>

    <p v-if="loading" class="text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div v-if="!loading && !subscriptions.length" class="text-sm text-foreground/60">
      Вы пока ни на кого не подписаны.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="sub in subscriptions"
        :key="sub.id"
        class="flex items-center justify-between border border-foreground/10 bg-card p-4"
      >
        <AuthorByline :author="sub.author" @change="(v) => !v && remove(sub.id)" />
        <span class="text-xs text-foreground/50">
          {{ new Date(sub.createdAt).toLocaleDateString('ru-RU') }}
        </span>
      </div>
    </div>
  </div>
</template>
