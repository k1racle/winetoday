<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
const { getMySubscriptions, getMyLikes, getMyComments } = useApi();
const route = useRoute();

const canCreate = computed(() => ['admin', 'editor', 'author'].includes(user.value?.role || ''));

const stats = ref({ subscriptions: 0, likes: 0, comments: 0 });
const statsLoading = ref(false);

const activeType = ref('all');
const editingId = ref('');
const sidebarRef = ref<any>(null);

function selectType(type: string) {
  activeType.value = type;
  editingId.value = '';
}

function newMaterial() {
  editingId.value = '';
}

function selectMaterial(item: any) {
  activeType.value = item.type;
  editingId.value = item.id;
}

function onSaved(id: string) {
  editingId.value = id;
  sidebarRef.value?.load();
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
  const editId = route.query.id;
  if (editId && typeof editId === 'string') {
    editingId.value = editId;
    const editType = route.query.type;
    if (editType && typeof editType === 'string') {
      activeType.value = editType;
    }
  }
});
</script>

<template>
  <div class="mx-auto max-w-[1600px] px-4 py-10">
    <div v-if="user" class="space-y-8">
      <div>
        <h1 class="mb-2 font-heading text-2xl font-bold">Личный кабинет</h1>
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
      <!-- Editor workspace -->
      <div v-if="canCreate" class="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
        <EditorSidebar
          ref="sidebarRef"
          :active-type="activeType"
          @select-type="selectType"
          @new-material="newMaterial"
          @select-material="selectMaterial"
        />
        <section class="border border-foreground/10 bg-card p-4 shadow-sm md:p-6">
          <EditorPanel :type="activeType === 'all' ? undefined : activeType" :draft-id="editingId" @saved="onSaved" />
        </section>
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
