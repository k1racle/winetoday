<script setup lang="ts">
import type { AuthorProfile, ContentItem } from '~/types/content';

const route = useRoute();
const slug = route.params.slug as string;
const { getAuthor, getAuthorContent, subscribeToAuthor, unsubscribeFromAuthor } = useApi();
const { isAuthenticated } = useAuth();

const [{ data: author }, { data: content }] = await Promise.all([
  useAsyncData(`author-${slug}`, () =>
    getAuthor(slug).catch(() => null),
  ),
  useAsyncData(`author-content-${slug}`, () =>
    getAuthorContent(slug).catch(() => ({ items: [] })),
  ),
]);

if (!author.value) {
  throw createError({ statusCode: 404, statusMessage: 'Автор не найден' });
}

const profile = computed(() => author.value as AuthorProfile | null);
const items = computed(() => (content.value?.items || []) as ContentItem[]);
const avatarSrc = computed(() => useMediaUrl(profile.value?.avatarMedia?.path));
const initials = computed(() => {
  const name = profile.value?.name || '';
  return name.trim().charAt(0).toUpperCase() || 'А';
});

const authOpen = ref(false);
const subscribed = ref(profile.value?.isSubscribed ?? false);
const subLoading = ref(false);

const lightboxOpen = ref(false);

function onLightboxKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    lightboxOpen.value = false;
  }
}

watch(lightboxOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onLightboxKeydown);
  } else {
    window.removeEventListener('keydown', onLightboxKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onLightboxKeydown);
});

async function toggleSubscribe() {
  if (!isAuthenticated.value) {
    authOpen.value = true;
    return;
  }
  subLoading.value = true;
  try {
    if (subscribed.value) {
      await unsubscribeFromAuthor(slug);
      subscribed.value = false;
    } else {
      await subscribeToAuthor(slug);
      subscribed.value = true;
    }
  } catch {
    // ignore
  } finally {
    subLoading.value = false;
  }
}

useSeoMeta({
  title: `${profile.value?.name || slug} — Автор`,
  description: profile.value?.bio || `Материалы автора ${profile.value?.name || slug}`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Автор</span>
    </nav>

    <!-- Author header -->
    <div class="grid grid-cols-[96px_1fr] gap-4 border-b border-foreground/10 pb-8 md:grid-cols-[160px_1fr_220px] md:gap-6">
      <!-- Photo + desktop subscribe -->
      <div class="order-1 shrink-0 md:col-start-1">
        <button
          v-if="avatarSrc"
          type="button"
          class="mx-auto block h-24 w-24 cursor-zoom-in overflow-hidden rounded-full md:mx-0 md:h-40 md:w-40"
          :aria-label="`Увеличить фото: ${profile?.name || 'автор'}`"
          @click="lightboxOpen = true"
        >
          <NuxtImg
            :src="avatarSrc"
            :alt="profile?.name || ''"
            class="h-full w-full object-cover"
          />
        </button>
        <div
          v-else
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent text-2xl font-normal uppercase text-black md:mx-0 md:h-40 md:w-40 md:text-4xl"
        >
          {{ initials }}
        </div>
        <button
          type="button"
          :disabled="subLoading"
          class="mt-4 hidden w-40 items-center justify-center gap-2 rounded border border-foreground/20 bg-transparent px-4 py-2 text-sm font-normal text-foreground/80 transition hover:border-accent hover:text-accent disabled:opacity-60 md:inline-flex"
          @click="toggleSubscribe"
        >
          <svg v-if="!subscribed" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25" />
          </svg>
          {{ subscribed ? 'Вы подписаны' : 'Подписаться' }}
        </button>
      </div>

      <!-- Name / position / bio -->
      <div class="order-2 flex flex-col justify-center md:col-start-2 md:row-span-2 md:justify-start">
        <h1 class="font-heading text-2xl font-bold md:text-4xl">
          {{ profile?.name }}
        </h1>
        <p v-if="profile?.position" class="mt-1 text-xs text-foreground/60 md:text-sm">
          {{ profile.position }}
        </p>
        <button
          type="button"
          :disabled="subLoading"
          class="mt-3 inline-flex items-center justify-center gap-2 rounded border border-foreground/20 bg-transparent px-3 py-1.5 text-xs font-normal text-foreground/80 transition hover:border-accent hover:text-accent disabled:opacity-60 md:hidden"
          @click="toggleSubscribe"
        >
          <svg v-if="!subscribed" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25" />
          </svg>
          {{ subscribed ? 'Вы подписаны' : 'Подписаться' }}
        </button>
        <p v-if="profile?.bio" class="mt-4 text-sm leading-relaxed text-foreground/80 md:mt-6 md:text-base">
          {{ profile.bio }}
        </p>
      </div>

      <!-- Stats -->
      <div class="order-3 col-span-2 grid grid-cols-2 gap-3 md:order-2 md:col-span-1 md:col-start-3 md:row-span-2 md:flex md:flex-col">
        <div class="border border-foreground/10 bg-card p-3 text-center md:p-4">
          <div class="font-heading text-2xl font-bold text-accent md:text-3xl">
            {{ profile?.articlesCount ?? 0 }}
          </div>
          <div class="mt-1 text-xs text-foreground/60 md:text-sm">
            {{ (profile?.articlesCount ?? 0) === 1 ? 'Статья' : (profile?.articlesCount ?? 0) >= 2 && (profile?.articlesCount ?? 0) <= 4 ? 'Статьи' : 'Статей' }}
          </div>
        </div>
        <div class="border border-foreground/10 bg-card p-3 text-center md:p-4">
          <div class="font-heading text-2xl font-bold text-accent md:text-3xl">
            {{ profile?.newsCount ?? 0 }}
          </div>
          <div class="mt-1 text-xs text-foreground/60 md:text-sm">
            {{ (profile?.newsCount ?? 0) === 1 ? 'Новость' : (profile?.newsCount ?? 0) >= 2 && (profile?.newsCount ?? 0) <= 4 ? 'Новости' : 'Новостей' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Publications -->
    <div class="mt-10">
      <h2 class="mb-6 font-heading text-2xl font-normal">Все публикации автора</h2>
      <div v-if="!items.length" class="text-sm text-foreground/60">
        У автора пока нет публикаций.
      </div>
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          image-aspect="video"
          variant="compact"
        />
      </div>
    </div>
  </div>

  <AuthDrawer v-model="authOpen" />

  <!-- Avatar lightbox -->
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="lightboxOpen && avatarSrc"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click="lightboxOpen = false"
      >
        <button
          type="button"
          class="absolute right-4 top-4 text-white/70 transition hover:text-white"
          aria-label="Закрыть"
          @click="lightboxOpen = false"
        >
          <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          :src="avatarSrc"
          :alt="profile?.name || ''"
          class="max-h-full max-w-full object-contain"
          @click.stop
        >
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
