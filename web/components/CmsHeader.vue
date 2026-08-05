<script setup lang="ts">
defineProps<{
  sidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const route = useRoute();
const { user, signOut } = useAuth();

const title = computed(() => {
  if (route.path.startsWith('/cms/projects/winemakers')) return 'Спецпроект: Виноделы России';
  if (route.path.startsWith('/cms/projects')) return 'Спецпроекты';
  if (route.path.startsWith('/cms/editor')) return 'Редактор';
  if (route.path.startsWith('/cms/materials')) return 'Материалы';
  if (route.path.startsWith('/cms/media')) return 'Медиа';
  if (route.path.startsWith('/cms/comments')) return 'Комментарии';
  if (route.path.startsWith('/cms/authors')) return 'Авторы';
  if (route.path.startsWith('/cms/users')) return 'Пользователи';
  if (route.path.startsWith('/cms/settings')) return 'Настройки';
  return 'CMS';
});

async function logoutAndExit() {
  await signOut();
  await navigateTo('/');
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-foreground/10 bg-background/95 backdrop-blur">
    <div class="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded border border-foreground/10 lg:hidden"
          :aria-expanded="sidebarOpen"
          @click="emit('toggle-sidebar')"
        >
          <span class="text-lg">≡</span>
        </button>
        <div class="min-w-0">
          <div class="text-[11px] font-normal uppercase tracking-[0.2em] text-foreground/45">
            Content Management
          </div>
          <div class="truncate text-base font-normal text-foreground">{{ title }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="hidden text-sm text-foreground/60 transition hover:text-foreground md:inline">
          Открыть сайт
        </NuxtLink>
        <NuxtLink to="/account" class="hidden text-sm text-foreground/60 transition hover:text-foreground md:inline">
          Аккаунт
        </NuxtLink>
        <span class="hidden text-sm text-foreground/50 lg:inline">
          {{ user?.displayName || user?.username || user?.email }}
        </span>
        <button
          type="button"
          class="text-sm text-foreground/60 transition hover:text-foreground"
          @click="logoutAndExit"
        >
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>
