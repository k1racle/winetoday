<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

const { getSiteSettings } = useApi();
const { data: siteSettings } = await useAsyncData('site-settings', () =>
  getSiteSettings().catch(() => null),
);
const socialLinks = computed(() => {
  const links = siteSettings.value?.socialLinks?.links;
  return Array.isArray(links) ? links : [];
});
const { user, isAuthenticated, signOut } = useAuth();
const { headerCategories } = useHeaderCategories();

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

async function handleLogout() {
  await signOut();
}
</script>

<template>
  <header class="border-b border-foreground/10 bg-background">
    <!-- Top bar -->
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex max-w-[60%] flex-col md:max-w-none">
        <NuxtImg
          src="/logo-light.png"
          alt="Виноделие Сегодня"
          class="block h-8 w-auto dark:hidden md:h-10"
        />
        <NuxtImg
          src="/logo-dark.png"
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
            class="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card text-foreground/60 transition hover:text-foreground"
            aria-label="Поиск"
            @click="searchOpen = !searchOpen"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>

        <template v-if="isAuthenticated && user">
          <NuxtLink
            to="/account"
            class="max-w-[160px] truncate text-sm text-foreground/80 hover:text-foreground"
          >
            {{ user.displayName || user.username || user.email }}
          </NuxtLink>
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground"
            @click="handleLogout"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12h3m0 0-3-3m3 3-3 3" />
            </svg>
            <span>Выйти</span>
          </button>
        </template>
        <button
          v-else
          type="button"
          class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground"
          @click="authOpen = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>Войти</span>
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
    <nav class="hidden border-t border-foreground/10 lg:block">
      <div class="mx-auto max-w-7xl px-4">
        <ul class="flex items-center justify-between overflow-x-auto py-3 text-xs font-medium uppercase tracking-wider text-foreground/80 md:text-sm">
          <li class="shrink-0">
            <NuxtLink
              to="/news"
              class="whitespace-nowrap px-2 py-1 transition hover:text-foreground"
            >
              Новости
            </NuxtLink>
          </li>
          <li v-for="cat in headerCategories" :key="cat.id" class="shrink-0">
            <NuxtLink
              :to="`/category/${cat.slug}`"
              class="whitespace-nowrap px-2 py-1 transition hover:text-foreground"
            >
              {{ cat.name }}
            </NuxtLink>
          </li>
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
              class="text-foreground/70 hover:text-foreground"
              @click="closeMobileMenu"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
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
      <nav class="flex-1 overflow-y-auto">
        <ul class="space-y-10">
          <li>
            <NuxtLink
              to="/"
              class="block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent"
              @click="closeMobileMenu"
            >
              Главная
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/news"
              class="block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent"
              @click="closeMobileMenu"
            >
              Новости
            </NuxtLink>
          </li>
          <li v-for="cat in headerCategories" :key="cat.id">
            <NuxtLink
              :to="`/category/${cat.slug}`"
              class="block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent"
              @click="closeMobileMenu"
            >
              {{ cat.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Socials -->
      <div v-if="socialLinks.length" class="mt-auto border-t border-foreground/10 pt-6">
        <div class="flex items-center justify-between">
          <a
            v-for="link in socialLinks"
            :key="link.href + link.label"
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="text-foreground/70 transition hover:text-accent"
            :aria-label="link.label"
          >
            <SocialIcon :name="link.icon" :label="link.label" :href="link.href" variant="black" class="h-6 w-6 dark:hidden" />
            <SocialIcon :name="link.icon" :label="link.label" :href="link.href" class="hidden h-6 w-6 dark:block" />
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
