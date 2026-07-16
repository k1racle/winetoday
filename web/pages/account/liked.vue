<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const { isAuthenticated } = useAuth();
const { getMyLikes } = useApi();

const items = ref<ContentItem[]>([]);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    items.value = (await getMyLikes()) as ContentItem[];
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

    <h2 class="mb-4 font-heading text-xl font-normal">Понравившиеся записи</h2>

    <p v-if="loading" class="text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div v-if="!loading && !items.length" class="text-sm text-foreground/60">
      У вас пока нет понравившихся записей.
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ArticleCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        image-aspect="video"
        variant="compact"
        class="h-[320px]"
      />
    </div>
  </div>
</template>
