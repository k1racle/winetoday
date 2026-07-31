<script setup lang="ts">
const route = useRoute();
const { unsubscribeNewsletter } = useApi();

const state = ref<'loading' | 'success' | 'error'>('loading');

useSeoMeta({
  title: 'Отписка от рассылки — Виноделие сегодня',
  robots: 'noindex',
});

onMounted(async () => {
  const token = String(route.query.token || '');
  if (!token) {
    state.value = 'error';
    return;
  }
  try {
    await unsubscribeNewsletter(token);
    state.value = 'success';
  } catch {
    state.value = 'error';
  }
});
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16 text-center">
    <h1 class="mb-4 font-heading text-3xl font-normal">Отписка от рассылки</h1>

    <p v-if="state === 'loading'" class="text-foreground/60">Отписываем...</p>

    <template v-else-if="state === 'success'">
      <p class="text-foreground/70">
        Вы отписаны от рассылки. Если передумаете — подписку можно оформить заново.
      </p>
      <NuxtLink
        to="/subscribe"
        class="mt-6 inline-block border border-accent px-5 py-2 text-sm text-accent transition hover:bg-accent hover:text-black"
      >
        Оформить подписку
      </NuxtLink>
    </template>

    <template v-else>
      <p class="text-foreground/70">
        Ссылка недействительна или устарела. Если письма продолжают приходить — напишите нам через страницу контактов.
      </p>
      <NuxtLink
        to="/contacts"
        class="mt-6 inline-block border border-accent px-5 py-2 text-sm text-accent transition hover:bg-accent hover:text-black"
      >
        Контакты
      </NuxtLink>
    </template>
  </div>
</template>
