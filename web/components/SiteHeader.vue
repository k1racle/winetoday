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
const showWinemakersLink = computed(() =>
  Boolean(siteSettings.value?.winemakersEnabled) || user.value?.role === 'admin',
);
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
        <NuxtLink
          v-if="showWinemakersLink"
          to="/winemakers"
          class="text-xs font-bold uppercase tracking-wider text-foreground/70 transition hover:text-accent"
        >
          Виноделы России
        </NuxtLink>

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
          :title="'Войти'"
          @click="authOpen = true"
        >
          <IconAccount class="h-5 w-5" />
        </button>
      </div>

      <!-- Burger (mobile/tablet) -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground lg:hidden"
        aria-label="Меню"
        @click="openMobileMenu"
      >
        <IconMenu class="h-6 w-6" />
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
              <span class="h-4 w-px bg-foreground/20 dark:bg-foreground/40" />
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

      <!-- Mobile logo -->
      <NuxtLink
        to="/"
        class="mb-6 flex flex-col items-start"
        @click="closeMobileMenu"
      >
        <img
          src="/logo-footer.svg"
          alt="Виноделие Сегодня"
          class="block h-20 w-auto max-w-full"
        />
      </NuxtLink>

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
          <li v-if="showWinemakersLink">
            <NuxtLink
              to="/winemakers"
              class="block border-b-2 border-transparent py-2 text-left font-heading text-sm font-bold uppercase tracking-wider text-accent transition hover:border-accent"
              @click="closeMobileMenu"
            >
              Виноделы России
            </NuxtLink>
          </li>
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
