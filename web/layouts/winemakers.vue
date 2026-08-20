<script setup lang="ts">
await useSiteSeoDefaults();

const route = useRoute();
const { getSiteHeader } = useApi();
const { siteSettings } = useSharedSiteSettings();
const { user, isAuthenticated } = useAuth();
const { data: siteHeader } = await useAsyncData('site-header-winemakers', () =>
  getSiteHeader().catch(() => null),
);

const socialLinks = computed(() => {
  const links = siteSettings.value?.socialLinks?.links;
  return Array.isArray(links) ? links : [];
});

const lightLogoUrl = computed(() =>
  useMediaUrl(siteHeader.value?.lightLogo?.path) || '/logo-light.png',
);
const darkLogoUrl = computed(() =>
  useMediaUrl(siteHeader.value?.darkLogo?.path) || '/logo-dark.png',
);

const userAvatar = computed(() => useMediaUrl(user.value?.avatarMedia?.path));
const userInitials = computed(() => {
  const name = user.value?.displayName || user.value?.username || user.value?.email || '';
  return name.trim().charAt(0).toUpperCase() || 'В';
});

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '');
const searchOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const authOpen = ref(false);
const mobileMenuOpen = ref(false);
const isDark = ref(false);

const menuItems = [
  { label: 'Виноделы', to: '/winemakers/persons' },
  { label: 'Регионы', to: '/regions' },
  { label: 'Вина', to: '/wines' },
  { label: 'Винодельни', to: '/wineries' },
];

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = typeof value === 'string' ? value : '';
  },
);

watch(searchOpen, (open) => {
  if (open) nextTick(() => searchInput.value?.focus());
});

watch(mobileMenuOpen, (open) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : '';
  }
});

function submitSearch() {
  const q = searchQuery.value.trim();
  if (!q) return;
  searchOpen.value = false;
  mobileMenuOpen.value = false;
  navigateTo(`/winemakers/search?q=${encodeURIComponent(q)}`);
}

function toggleDark() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  } catch {
    // noop
  }
}

function isMenuActive(path: string) {
  if (path === '/winemakers/persons') {
    return route.path === '/winemakers/persons';
  }
  return route.path === path || route.path.startsWith(`${path}/`);
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
    <header class="border-b border-foreground/10 bg-background/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div class="flex min-w-0 items-center gap-4 md:gap-6">
          <NuxtLink to="/" class="shrink-0">
            <img
              :src="lightLogoUrl"
              alt="Виноделие Сегодня"
              class="block h-8 w-auto dark:hidden md:h-10"
            >
            <img
              :src="darkLogoUrl"
              alt="Виноделие Сегодня"
              class="hidden h-8 w-auto dark:block md:h-10"
            >
          </NuxtLink>

          <NuxtLink to="/winemakers" class="min-w-0 border-l border-foreground/10 pl-4 md:pl-6">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-foreground/45">
              Спецпроект
            </p>
            <p class="font-heading text-xl font-bold text-foreground md:text-3xl">
              Виноделы России
            </p>
          </NuxtLink>
        </div>

        <div class="hidden items-center gap-3 md:gap-5 lg:flex">
          <div class="relative flex items-center">
            <Transition name="search-expand">
              <form
                v-if="searchOpen"
                class="absolute right-10 top-0 w-56"
                @submit.prevent="submitSearch"
              >
                <input
                  ref="searchInput"
                  v-model="searchQuery"
                  type="search"
                  placeholder="Поиск по каталогу"
                  class="w-full border border-foreground/10 bg-card py-2 pl-3 pr-4 text-sm outline-none transition focus:border-accent"
                >
              </form>
            </Transition>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center text-foreground/70 transition hover:text-foreground"
              aria-label="Поиск"
              @click="searchOpen = !searchOpen"
            >
              <IconSearch class="h-5 w-5" />
            </button>
          </div>

          <HeaderSocialMenu :links="socialLinks" />

          <button
            type="button"
            class="text-foreground/70 hover:text-foreground"
            aria-label="Переключить тему"
            @click="toggleDark()"
          >
            <IconMoon class="h-5 w-5 dark:hidden" />
            <IconSun class="hidden h-5 w-5 dark:block" />
          </button>

          <template v-if="isAuthenticated && user">
            <NuxtLink
              to="/account"
              class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent text-black transition hover:opacity-90"
              :title="user.displayName || user.username || user.email"
            >
              <NuxtImg
                v-if="userAvatar"
                :src="userAvatar"
                alt=""
                class="h-full w-full object-cover"
              />
              <span v-else class="text-sm font-bold uppercase">{{ userInitials }}</span>
            </NuxtLink>
          </template>
          <button
            v-else
            type="button"
            class="flex h-9 w-9 items-center justify-center text-foreground/70 transition hover:text-foreground"
            aria-label="Войти"
            @click="authOpen = true"
          >
            <IconAccount class="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground lg:hidden"
          aria-label="Меню"
          @click="mobileMenuOpen = true"
        >
          <IconMenu class="h-6 w-6" />
        </button>
      </div>

      <nav class="hidden border-t border-foreground/10 lg:block">
        <div class="mx-auto max-w-7xl px-4">
          <ul class="flex items-center gap-8 overflow-x-auto py-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
            <li v-for="item in menuItems" :key="item.to" class="shrink-0">
              <NuxtLink
                :to="item.to"
                class="block border-b-2 pb-1 transition"
                :class="isMenuActive(item.to) ? 'border-accent text-foreground' : 'border-transparent hover:border-accent hover:text-accent'"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <SiteFooter />

    <Transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 flex flex-col bg-background px-4 py-4 lg:hidden"
      >
        <div class="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="text-foreground/70 hover:text-foreground"
              aria-label="Поиск"
              @click="searchOpen = !searchOpen"
            >
              <IconSearch class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="text-foreground/70 hover:text-foreground"
              aria-label="Переключить тему"
              @click="toggleDark()"
            >
              <IconMoon class="h-5 w-5 dark:hidden" />
              <IconSun class="hidden h-5 w-5 dark:block" />
            </button>
            <template v-if="isAuthenticated && user">
              <NuxtLink
                to="/account"
                class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent text-black"
                @click="closeMobileMenu"
              >
                <NuxtImg
                  v-if="userAvatar"
                  :src="userAvatar"
                  alt=""
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-sm font-bold uppercase">{{ userInitials }}</span>
              </NuxtLink>
            </template>
            <button
              v-else
              type="button"
              class="text-foreground/70 hover:text-foreground"
              aria-label="Войти"
              @click="authOpen = true; closeMobileMenu()"
            >
              <IconAccount class="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            class="text-foreground/70 hover:text-foreground"
            aria-label="Закрыть"
            @click="closeMobileMenu"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NuxtLink to="/" class="mb-6 inline-flex" @click="closeMobileMenu">
          <img
            :src="lightLogoUrl"
            alt="Виноделие Сегодня"
            class="block h-8 w-auto dark:hidden"
          >
          <img
            :src="darkLogoUrl"
            alt="Виноделие Сегодня"
            class="hidden h-8 w-auto dark:block"
          >
        </NuxtLink>

        <form v-if="searchOpen" class="mb-6" @submit.prevent="submitSearch">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            placeholder="Поиск по каталогу"
            class="w-full border border-foreground/10 bg-card px-4 py-3 text-sm outline-none transition focus:border-accent"
          >
        </form>

        <nav class="space-y-3">
          <NuxtLink
            to="/winemakers"
            class="block border-b border-foreground/10 py-2 font-heading text-lg font-bold"
            @click="closeMobileMenu"
          >
            Виноделы России
          </NuxtLink>
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="block border-b border-foreground/10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-foreground/75"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div v-if="socialLinks.length" class="mt-auto border-t border-foreground/10 pt-6">
          <div class="grid grid-cols-4 gap-y-6">
            <a
              v-for="link in socialLinks"
              :key="link.href + link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="flex items-center justify-center text-foreground/70 transition hover:text-accent"
              :aria-label="link.label"
            >
              <SocialIcon :name="link.icon" :label="link.label" :href="link.href" variant="black" class="h-8 w-8 dark:hidden" />
              <SocialIcon :name="link.icon" :label="link.label" :href="link.href" variant="dark" class="hidden h-8 w-8 dark:block" />
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <AuthDrawer v-model="authOpen" />
  </div>
</template>

<style scoped>
.search-expand-enter-active,
.search-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.search-expand-enter-from,
.search-expand-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
