<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

const statusCode = computed(() => props.error?.statusCode || 500);

const title = computed(() =>
  statusCode.value === 404 ? 'Страница не найдена' : 'Произошла ошибка',
);

const description = computed(() => {
  if (statusCode.value === 404) {
    return 'К сожалению, такой страницы не существует или она была удалена.';
  }
  return (
    props.error?.statusMessage ||
    props.error?.message ||
    'Что-то пошло не так. Попробуйте обновить страницу или вернуться позже.'
  );
});

useHead({
  title: `${statusCode.value} — ${title.value} — Виноделие сегодня`,
});

const goHome = () => clearError({ redirect: '/' });
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground"
  >
    <p class="font-heading text-7xl font-bold text-accent md:text-9xl">{{ statusCode }}</p>
    <h1 class="mt-4 font-heading text-2xl font-bold md:text-3xl">{{ title }}</h1>
    <p class="mt-4 max-w-md text-sm text-foreground/60 md:text-base">
      {{ description }}
    </p>
    <button
      type="button"
      class="mt-8 rounded bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-80"
      @click="goHome"
    >
      На главную
    </button>
  </div>
</template>
