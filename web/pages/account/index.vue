<script setup lang="ts">
const { user, signOut } = useAuth();
const {
  getMySubscriptions,
  getMyLikes,
  getMyComments,
  getTelegramLinkStatus,
  createTelegramLinkCode,
  unlinkTelegram,
} = useApi();

const stats = ref({ subscriptions: 0, likes: 0, comments: 0 });
const statsLoading = ref(false);
const canOpenCms = computed(() => ['admin', 'editor', 'author'].includes(user.value?.role || ''));
const telegramStatus = ref<any>(null);
const telegramLink = ref<any>(null);
const telegramLoading = ref(false);

async function loadTelegramStatus() {
  if (!canOpenCms.value) return;
  telegramStatus.value = await getTelegramLinkStatus().catch(() => null);
}

async function connectTelegram() {
  telegramLoading.value = true;
  try {
    telegramLink.value = await createTelegramLinkCode();
  } finally {
    telegramLoading.value = false;
  }
}

async function disconnectTelegram() {
  telegramLoading.value = true;
  try {
    await unlinkTelegram();
    telegramLink.value = null;
    await loadTelegramStatus();
  } finally {
    telegramLoading.value = false;
  }
}

async function loadStats() {
  statsLoading.value = true;
  try {
    const [subs, likes, comments] = await Promise.all([
      getMySubscriptions().catch(() => []),
      getMyLikes().catch(() => []),
      getMyComments().catch(() => []),
    ]);
    stats.value = {
      subscriptions: (subs as any[]).length,
      likes: (likes as any[]).length,
      comments: (comments as any[]).length,
    };
  } finally {
    statsLoading.value = false;
  }
}

onMounted(() => {
  loadStats();
  loadTelegramStatus();
});

async function signOutAndRedirect() {
  await signOut();
  navigateTo('/');
}
</script>

<template>
  <div class="py-10">
    <div v-if="user" class="space-y-8">
      <div>
        <div class="mb-2 flex items-start justify-between gap-4">
          <h1 class="font-heading text-2xl font-bold">Личный кабинет</h1>
          <button
            type="button"
            class="shrink-0 text-sm text-foreground/60 transition hover:text-foreground"
            @click="signOutAndRedirect"
          >
            Выйти из аккаунта
          </button>
        </div>
        <AccountTabs class="mb-6" />
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <NuxtLink
          to="/account/subscriptions"
          class="border border-foreground/10 bg-card p-5 shadow-sm transition hover:border-accent"
        >
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Подписки</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ statsLoading ? '...' : stats.subscriptions }}</p>
        </NuxtLink>
        <NuxtLink
          to="/account/liked"
          class="border border-foreground/10 bg-card p-5 shadow-sm transition hover:border-accent"
        >
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Понравилось</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ statsLoading ? '...' : stats.likes }}</p>
        </NuxtLink>
        <NuxtLink
          to="/account/comments"
          class="border border-foreground/10 bg-card p-5 shadow-sm transition hover:border-accent"
        >
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Комментарии</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ statsLoading ? '...' : stats.comments }}</p>
        </NuxtLink>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <section class="border border-foreground/10 bg-card p-6 shadow-sm md:col-span-2">
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">
            Настройки
          </p>
          <h2 class="mt-2 font-heading text-xl font-normal">Профиль</h2>
          <div class="mt-4 space-y-3 text-sm">
            <p>
              <span class="text-foreground/60">Email:</span>
              {{ user.email }}
            </p>
            <p v-if="user.username">
              <span class="text-foreground/60">Логин:</span>
              {{ user.username }}
            </p>
            <p v-if="user.displayName">
              <span class="text-foreground/60">Отображаемое имя:</span>
              {{ user.displayName }}
            </p>
          </div>
        </section>

        <section
          v-if="canOpenCms"
          class="border border-foreground/10 bg-card p-6 shadow-sm"
        >
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">
            CMS
          </p>
          <h2 class="mt-2 font-heading text-xl font-normal">Панель управления</h2>
          <p class="mt-2 text-sm text-foreground/70">
            Отдельный контур для материалов, страниц, медиа, настроек сайта и спецпроектов.
          </p>
          <div class="mt-4">
            <NuxtLink
              to="/cms"
              class="inline-block bg-accent px-5 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90"
            >
              Открыть CMS
            </NuxtLink>
          </div>
        </section>
      </div>

      <section
        v-if="canOpenCms"
        class="border border-foreground/10 bg-card p-6 shadow-sm"
      >
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Telegram Mini App</p>
        <h2 class="mt-2 font-heading text-xl font-normal">Мобильный редактор материалов</h2>
        <p class="mt-2 max-w-2xl text-sm text-foreground/70">
          Привяжите Telegram, чтобы создавать и редактировать новости и статьи через Mini App.
        </p>

        <div v-if="telegramStatus?.linked" class="mt-4 flex flex-wrap items-center gap-3">
          <span class="text-sm text-foreground/70">
            Подключено<span v-if="telegramStatus.telegramUsername">: @{{ telegramStatus.telegramUsername }}</span>
          </span>
          <button class="btn-secondary" :disabled="telegramLoading" @click="disconnectTelegram">
            Отключить
          </button>
        </div>

        <div v-else class="mt-4">
          <button class="btn-secondary" :disabled="telegramLoading" @click="connectTelegram">
            {{ telegramLoading ? 'Создаём код…' : 'Подключить Telegram' }}
          </button>
          <div v-if="telegramLink" class="mt-4 border border-accent/30 bg-accent/5 p-4">
            <p class="text-sm">Одноразовый код действует 10 минут:</p>
            <p class="mt-2 font-mono text-2xl tracking-widest">{{ telegramLink.code }}</p>
            <a
              v-if="telegramLink.botUrl"
              :href="telegramLink.botUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-block text-sm text-accent underline"
            >
              Открыть бота и завершить подключение
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
