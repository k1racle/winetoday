<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

const statusCode = computed(() => props.error?.statusCode || 500);
const is404 = computed(() => statusCode.value === 404);

const title = computed(() =>
  is404.value ? 'Страница не найдена' : 'Произошла ошибка',
);

const description = computed(() => {
  if (is404.value) {
    return 'К сожалению, такой страницы не существует или она была удалена. Попробуйте найти нужное через поиск или перейдите в один из разделов.';
  }
  return (
    props.error?.statusMessage ||
    props.error?.message ||
    'Что-то пошло не так. Попробуйте обновить страницу или вернуться позже.'
  );
});

useHead({
  title: `${statusCode.value} — ${title.value} — Виноделие сегодня`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: description.value },
  ],
});

const sections = [
  { label: 'Новости', to: '/news' },
  { label: 'Статьи', to: '/articles' },
  { label: 'Видео', to: '/videos' },
  { label: 'Галереи', to: '/gallery' },
  { label: 'Авторы', to: '/authors' },
];

const go = (path: string) => clearError({ redirect: path });
const goHome = () => clearError({ redirect: '/' });

const searchQuery = ref('');
const submitSearch = () => {
  const q = searchQuery.value.trim();
  if (!q) return;
  clearError({ redirect: `/search?q=${encodeURIComponent(q)}` });
};

// Свежие материалы подгружаем только на клиенте: страница ошибки должна
// отрисоваться всегда, даже если API недоступен.
const { getContent } = useApi();
const latest = ref<any[]>([]);

onMounted(async () => {
  if (!is404.value) return;
  try {
    const res: any = await getContent({ limit: 4 });
    latest.value = Array.isArray(res?.items) ? res.items : [];
  } catch {
    latest.value = [];
  }
});

const typeRouteMap: Record<string, string> = {
  article: '/articles',
  news: '/news',
  video: '/videos',
  gallery: '/gallery',
};

const itemLink = (item: any) => `${typeRouteMap[item.type] || ''}/${item.slug}`;
const itemCover = (item: any) => useMediaUrl(item.coverMedia?.path);
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

    <!-- Поиск (только для 404) -->
    <form
      v-if="is404"
      class="mt-8 flex w-full max-w-md items-stretch gap-2"
      @submit.prevent="submitSearch"
    >
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Поиск по сайту…"
        class="min-w-0 flex-1 rounded border border-foreground/15 bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-accent"
      >
      <button
        type="submit"
        class="shrink-0 rounded bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-80"
      >
        Найти
      </button>
    </form>

    <!-- Разделы сайта -->
    <nav class="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="section in sections"
        :key="section.to"
        type="button"
        class="rounded border border-foreground/15 px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-accent hover:text-accent"
        @click="go(section.to)"
      >
        {{ section.label }}
      </button>
    </nav>

    <!-- Свежие материалы (только для 404) -->
    <div v-if="is404 && latest.length" class="mt-12 w-full max-w-4xl">
      <h2 class="font-heading text-lg font-bold text-foreground/80">Свежие материалы</h2>
      <div class="mt-4 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
        <a
          v-for="item in latest"
          :key="item.id"
          :href="itemLink(item)"
          class="group block overflow-hidden rounded border border-foreground/10 bg-card transition-colors hover:border-accent"
          @click.prevent="go(itemLink(item))"
        >
          <div class="aspect-video w-full overflow-hidden bg-foreground/10">
            <img
              v-if="itemCover(item)"
              :src="itemCover(item)"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            >
          </div>
          <p class="line-clamp-3 p-3 text-xs font-medium text-foreground/80 group-hover:text-accent md:text-sm">
            {{ item.title }}
          </p>
        </a>
      </div>
    </div>

    <button
      type="button"
      class="mt-10 rounded bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-80"
      @click="goHome"
    >
      На главную
    </button>
  </div>
</template>
