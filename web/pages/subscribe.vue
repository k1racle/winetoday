<script setup lang="ts">
const { subscribeNewsletter } = useApi();

const topics = [
  { id: 'morning_brief', label: 'Утренний обзор — главное за день' },
  { id: 'week_digest', label: 'Недельная аналитика' },
  { id: 'regulation', label: 'Регулирование: срочные изменения' },
  { id: 'data', label: 'Новые данные и исследования' },
  { id: 'events', label: 'События и календарь отрасли' },
];

const selectedTopics = ref<string[]>([]);
const email = ref('');
const consent = ref(false);
const loading = ref(false);
const success = ref(false);
const error = ref('');

async function onSubmit() {
  if (loading.value) return;
  error.value = '';
  if (!consent.value) {
    error.value = 'Необходимо согласие на обработку персональных данных';
    return;
  }
  loading.value = true;
  try {
    await subscribeNewsletter(
      email.value.trim(),
      selectedTopics.value.length ? selectedTopics.value : undefined,
    );
    success.value = true;
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Не удалось оформить подписку';
  } finally {
    loading.value = false;
  }
}

useSeoMeta({
  title: 'Подписка на рассылку',
  description: 'Выберите темы рассылки «Виноделие Сегодня»: утренний обзор, недельная аналитика, регулирование, данные и события отрасли.',
});

useCanonical();
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Подписка</span>
    </nav>

    <h1 class="mb-4 font-heading text-3xl font-bold">Подписка на рассылку</h1>
    <p class="mb-8 text-sm text-foreground/60">
      Выберите интересные темы — будем присылать только то, что важно вам.
    </p>

    <div v-if="success" class="rounded-lg border border-foreground/10 bg-foreground/5 p-6">
      <p class="font-heading text-lg font-bold">Проверьте почту и подтвердите подписку</p>
      <p class="mt-2 text-sm text-foreground/60">
        Мы отправили письмо со ссылкой подтверждения на {{ email }}.
      </p>
    </div>

    <form v-else class="rounded-lg border border-foreground/10 bg-foreground/5 p-6" @submit.prevent="onSubmit">
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

      <div class="mt-6">
        <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/50" for="subscribe-email">
          E-mail
        </label>
        <input
          id="subscribe-email"
          v-model="email"
          type="email"
          required
          placeholder="Ваш e-mail"
          class="w-full border border-foreground/10 bg-transparent px-3 py-2 text-sm outline-none transition placeholder:text-foreground/40 focus:border-accent"
        >
      </div>

      <label class="mt-4 flex cursor-pointer items-start gap-3 text-sm">
        <input v-model="consent" type="checkbox" class="mt-0.5 h-4 w-4 accent-accent">
        <span>
          Соглашаюсь на обработку персональных данных в соответствии с
          <NuxtLink to="/privacy" class="text-accent hover:underline">политикой конфиденциальности</NuxtLink>
        </span>
      </label>

      <button
        type="submit"
        :disabled="loading"
        class="mt-6 w-full bg-accent px-4 py-3 text-sm font-bold text-black transition hover:bg-accent/90 disabled:opacity-50 sm:w-auto"
      >
        {{ loading ? 'Отправка...' : 'Подписаться' }}
      </button>

      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    </form>
  </div>
</template>
