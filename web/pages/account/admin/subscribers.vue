<script setup lang="ts">
interface Subscriber {
  id: string;
  email: string;
  topics: string[];
  confirmedAt: string | null;
  createdAt: string;
}

const topicLabels: Record<string, string> = {
  morning_brief: 'Утренний обзор',
  week_digest: 'Недельная аналитика',
  regulation: 'Регулирование',
  data: 'Данные и исследования',
  events: 'События',
};

function formatTopics(topics: string[]) {
  if (!Array.isArray(topics) || !topics.length) return '—';
  return topics.map((t) => topicLabels[t] || t).join(', ');
}

const { user, isAuthenticated } = useAuth();
const { getNewsletterSubscribers } = useApi();

const subscribers = ref<Subscriber[]>([]);
const loading = ref(false);
const error = ref('');

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU');
}

async function fetchSubscribers() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getNewsletterSubscribers() as Subscriber[];
    subscribers.value = Array.isArray(res) ? res : [];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки подписчиков';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!isAuthenticated.value || !['admin', 'editor'].includes(user.value?.role || '')) {
    navigateTo('/account');
    return;
  }
  fetchSubscribers();
});
</script>

<template>
  <CmsPageShell
    title="Подписчики"
    legacyTitle="Подписки"
    description="База email-подписок, темы интереса и статусы подтверждения рассылки."
  >
    <div class="flex items-center justify-between">
      <p class="text-sm text-foreground/60">Всего подписчиков: {{ subscribers.length }}</p>
      <button class="text-sm text-accent hover:underline" @click="fetchSubscribers">Обновить</button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <div v-if="!loading && subscribers.length" class="mt-6 overflow-x-auto">
      <table class="w-full border-collapse border border-foreground/10 text-sm">
        <thead class="bg-foreground/10">
          <tr>
            <th class="border border-foreground/10 px-4 py-2 text-left">E-mail</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Темы</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Подтверждён</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Дата подписки</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in subscribers" :key="item.id" class="bg-foreground/5">
            <td class="border border-foreground/10 px-4 py-2">{{ item.email }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ formatTopics(item.topics) }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              {{ item.confirmedAt ? formatDate(item.confirmedAt) : 'Нет' }}
            </td>
            <td class="border border-foreground/10 px-4 py-2">{{ formatDate(item.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !subscribers.length" class="mt-6 text-sm text-foreground/60">Нет подписчиков</p>
  </CmsPageShell>
</template>
