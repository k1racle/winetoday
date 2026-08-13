<script setup lang="ts">
const route = useRoute();
const { getNewsletterPreferences, updateNewsletterPreferences } = useApi();

const topics = [
  { id: 'morning_brief', label: 'Утренний обзор — главное за день' },
  { id: 'week_digest', label: 'Недельная аналитика' },
  { id: 'regulation', label: 'Регулирование: срочные изменения' },
  { id: 'data', label: 'Новые данные и исследования' },
  { id: 'events', label: 'События и календарь отрасли' },
];

const token = computed(() => String(route.query.token || ''));

const email = ref('');
const selectedTopics = ref<string[]>([]);
const paused = ref(false);
const loading = ref(true);
const saving = ref(false);
const loadError = ref('');
const saveSuccess = ref(false);
const saveError = ref('');

onMounted(async () => {
  if (!token.value) {
    loading.value = false;
    loadError.value = 'Некорректная ссылка на настройки подписки';
    return;
  }
  try {
    const prefs = await getNewsletterPreferences(token.value) as {
      email: string;
      topics: string[];
      isActive: boolean;
    };
    email.value = prefs.email;
    selectedTopics.value = Array.isArray(prefs.topics) ? prefs.topics : [];
    paused.value = !prefs.isActive;
  } catch (err: any) {
    loadError.value = err?.data?.message || err?.message || 'Не удалось загрузить настройки подписки';
  } finally {
    loading.value = false;
  }
});

async function onSave() {
  if (saving.value) return;
  saving.value = true;
  saveSuccess.value = false;
  saveError.value = '';
  try {
    await updateNewsletterPreferences(token.value, {
      topics: selectedTopics.value,
      isActive: !paused.value,
    });
    saveSuccess.value = true;
  } catch (err: any) {
    saveError.value = err?.data?.message || err?.message || 'Не удалось сохранить настройки';
  } finally {
    saving.value = false;
  }
}

useSeoMeta({
  title: 'Настройки подписки',
  description: 'Управление темами и статусом подписки на рассылку «Виноделие Сегодня».',
  robots: 'noindex,follow',
});

useCanonical();
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Настройки подписки</span>
    </nav>

    <h1 class="mb-8 font-heading text-3xl font-bold">Настройки подписки</h1>

    <div class="rounded-lg border border-foreground/10 bg-foreground/5 p-6">
      <p v-if="loading" class="text-sm text-foreground/60">Загрузка...</p>

      <template v-else-if="loadError">
        <p class="text-sm text-red-600">{{ loadError }}</p>
        <NuxtLink to="/subscribe" class="mt-4 inline-block text-sm text-accent hover:underline">
          Оформить подписку
        </NuxtLink>
      </template>

      <form v-else @submit.prevent="onSave">
        <p class="mb-6 text-sm text-foreground/60">
          Подписка оформлена на <span class="font-medium text-foreground">{{ email }}</span>
        </p>

        <fieldset>
          <legend class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/50">
            Темы рассылки
          </legend>
          <label
            v-for="topic in topics"
            :key="topic.id"
            class="mb-2 flex cursor-pointer items-center gap-3 text-sm"
          >
            <input
              v-model="selectedTopics"
              type="checkbox"
              :value="topic.id"
              class="h-4 w-4 accent-accent"
            >
            <span>{{ topic.label }}</span>
          </label>
        </fieldset>

        <label class="mt-6 flex cursor-pointer items-center gap-3 text-sm">
          <input v-model="paused" type="checkbox" class="h-4 w-4 accent-accent">
          <span>Приостановить рассылку</span>
        </label>

        <button
          type="submit"
          :disabled="saving"
          class="mt-6 w-full bg-accent px-4 py-3 text-sm font-bold text-black transition hover:bg-accent/90 disabled:opacity-50 sm:w-auto"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>

        <p v-if="saveSuccess" class="mt-3 text-sm text-green-600">Настройки сохранены</p>
        <p v-if="saveError" class="mt-3 text-sm text-red-600">{{ saveError }}</p>
      </form>
    </div>
  </div>
</template>
