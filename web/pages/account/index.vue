<script setup lang="ts">
const { user, signOut } = useAuth();
const { getMySubscriptions, getMyLikes, getMyComments } = useApi();

const stats = ref({ subscriptions: 0, likes: 0, comments: 0 });
const statsLoading = ref(false);

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
});

async function signOutAndRedirect() {
  await signOut();
  navigateTo('/');
}
</script>

<template>
  <div class="mx-auto max-w-[1600px] overflow-x-hidden px-4 py-10">
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

      <!-- Reader summary -->
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
        <!-- Profile -->
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

        <!-- Admin panel -->
        <section
          v-if="user.role === 'admin'"
          class="border border-foreground/10 bg-card p-6 shadow-sm"
        >
          <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">
            Администрирование
          </p>
          <h2 class="mt-2 font-heading text-xl font-normal">Пользователи</h2>
          <p class="mt-2 text-sm text-foreground/70">
            Управляйте ролями пользователей.
          </p>
          <div class="mt-4">
            <NuxtLink
              to="/account/admin"
              class="inline-block bg-accent px-5 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90"
            >
              Управление пользователями
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
