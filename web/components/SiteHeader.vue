<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

const { getSiteHeader } = useApi();
const { siteSettings } = useSharedSiteSettings();
const { data: siteHeader } = await useAsyncData('site-header', () =>
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
const { user, isAuthenticated, signOut } = useAuth();
const { headerCategories } = useHeaderCategories();

const userAvatar = computed(() => useMediaUrl(user.value?.avatarMedia?.path));
const userInitials = computed(() => {
  const name = user.value?.displayName || user.value?.username || user.value?.email || '';
  return name.trim().charAt(0).toUpperCase() || 'П';
});

const menuItems = computed(() => [
  { name: 'Новости', to: '/news' },
  ...headerCategories.value.map((c) => ({ name: c.name, to: `/category/${c.slug}` })),
]);

const searchQuery = ref('');
const searchOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const authOpen = ref(false);
const mobileMenuOpen = ref(false);

function openMobileMenu() {
  mobileMenuOpen.value = true;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

watch(mobileMenuOpen, (open) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : '';
  }
});



const isDark = ref(false);

function updateDarkClass() {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleDark() {
  isDark.value = !isDark.value;
  updateDarkClass();
  try {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  } catch {
    // ignore
  }
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});

watch(searchOpen, (open) => {
  if (open) {
    nextTick(() => searchInput.value?.focus());
  }
});

function onSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    searchOpen.value = false;
    mobileMenuOpen.value = false;
  }
}

</script>

<template>
  <header class="bg-background shadow-md">
    <!-- Top bar -->
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex max-w-[60%] flex-col md:max-w-none">
        <img
          :src="lightLogoUrl"
          alt="Виноделие Сегодня"
          class="block h-8 w-auto dark:hidden md:h-10"
        />
        <img
          :src="darkLogoUrl"
          alt="Виноделие Сегодня"
          class="hidden h-8 w-auto dark:block md:h-10"
        />
      </NuxtLink>

      <!-- Right side: search + actions (desktop) -->
      <div class="hidden items-center gap-3 md:gap-5 lg:flex">
        <div class="relative flex items-center">
          <Transition name="search-expand">
            <form
              v-if="searchOpen"
              class="absolute right-10 top-0 w-48 lg:w-56"
              @submit.prevent="onSearch"
            >
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Поиск"
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
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>

        <HeaderSocialMenu :links="socialLinks" />

        <button
          type="button"
          class="text-foreground/70 hover:text-foreground"
          aria-label="Переключить тему"
          @click="toggleDark()"
        >
          <svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
          <svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
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
          :title="'Войти'"
          @click="authOpen = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </button>
      </div>

      <!-- Burger (mobile/tablet) -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground lg:hidden"
        aria-label="Меню"
        @click="openMobileMenu"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>

    <!-- Categories nav (desktop) -->
    <nav class="hidden shadow-sm lg:block">
      <div class="mx-auto max-w-7xl px-4">
        <ul class="flex w-full items-center overflow-x-auto py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 md:text-xs">
          <template v-for="(item, index) in menuItems" :key="item.to">
            <li class="shrink-0">
              <NuxtLink
                :to="item.to"
                class="block whitespace-nowrap border-b-2 border-transparent pb-0.5 transition hover:border-accent hover:text-foreground"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
            <li
              v-if="index < menuItems.length - 1"
              class="flex min-w-0 flex-1 items-center justify-center"
              aria-hidden="true"
            >
              <span class="h-4 w-px bg-foreground/10" />
            </li>
          </template>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Mobile menu -->
  <Transition name="mobile-menu">
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-50 flex flex-col bg-background px-4 py-4"
    >
      <!-- Top bar: actions + close -->
      <div class="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="mr-2" @click="closeMobileMenu">
            <img
              :src="lightLogoUrl"
              alt="Виноделие Сегодня"
              class="block h-7 w-auto dark:hidden"
            />
            <img
              :src="darkLogoUrl"
              alt="Виноделие Сегодня"
              class="hidden h-7 w-auto dark:block"
            />
          </NuxtLink>
          <button
            type="button"
            class="text-foreground/70 hover:text-foreground"
            aria-label="Поиск"
            @click="searchOpen = !searchOpen"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <button
            type="button"
            class="text-foreground/70 hover:text-foreground"
            aria-label="Переключить тему"
            @click="toggleDark()"
          >
            <svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
            <svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
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
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
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

      <!-- Mobile search -->
      <form
        v-if="searchOpen"
        class="mb-6"
        @submit.prevent="onSearch"
      >
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск"
          class="w-full border border-foreground/10 bg-card py-3 px-4 text-sm outline-none transition focus:border-accent"
        >
      </form>

      <!-- Links -->
      <nav class="mt-auto overflow-y-auto">
        <ul class="space-y-4">
          <li>
            <NuxtLink
              to="/news"
              class="block border-b-2 border-transparent py-2 text-left font-heading text-sm font-bold uppercase tracking-wider text-foreground transition hover:border-accent hover:text-accent"
              @click="closeMobileMenu"
            >
              Новости
            </NuxtLink>
          </li>
          <li v-for="cat in headerCategories" :key="cat.id">
            <NuxtLink
              :to="`/category/${cat.slug}`"
              class="block border-b-2 border-transparent py-2 text-left font-heading text-sm font-bold uppercase tracking-wider text-foreground transition hover:border-accent hover:text-accent"
              @click="closeMobileMenu"
            >
              {{ cat.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Socials -->
      <div v-if="socialLinks.length" class="-mx-4 border-t border-foreground/10 py-6">
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
