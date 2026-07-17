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
    <div class="grid gap-6 border-b border-foreground/10 pb-8 md:grid-cols-[160px_1fr_220px]">
      <!-- Photo -->
      <div class="shrink-0">
        <div v-if="avatarSrc" class="mx-auto h-40 w-40 overflow-hidden rounded-full md:mx-0">
          <NuxtImg
            :src="avatarSrc"
            :alt="profile?.name || ''"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          v-else
          class="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-accent text-4xl font-normal uppercase text-black md:mx-0"
        >
          {{ initials }}
        </div>
        <button
          type="button"
          :disabled="subLoading"
          class="mt-4 w-full rounded bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-60 md:w-auto"
          @click="toggleSubscribe"
        >
          {{ subscribed ? 'Вы подписаны' : 'Подписаться на автора' }}
        </button>
      </div>

      <!-- Bio -->
      <div class="flex flex-col justify-center">
        <h1 class="font-heading text-3xl font-bold md:text-4xl">
          {{ profile?.name }}
        </h1>
        <p v-if="profile?.position" class="mt-1 text-sm text-foreground/60">
          {{ profile.position }}
        </p>
        <p v-if="profile?.bio" class="mt-4 max-w-3xl text-base leading-relaxed text-foreground/80">
          {{ profile.bio }}
        </p>
      </div>

      <!-- Stats -->
      <div class="flex flex-col gap-3">
        <div class="border border-foreground/10 bg-card p-4 text-center">
          <div class="font-heading text-3xl font-bold text-accent">
            {{ profile?.articlesCount ?? 0 }}
          </div>
          <div class="mt-1 text-sm text-foreground/60">
            {{ (profile?.articlesCount ?? 0) === 1 ? 'Статья' : (profile?.articlesCount ?? 0) >= 2 && (profile?.articlesCount ?? 0) <= 4 ? 'Статьи' : 'Статей' }}
          </div>
        </div>
        <div class="border border-foreground/10 bg-card p-4 text-center">
          <div class="font-heading text-3xl font-bold text-accent">
            {{ profile?.newsCount ?? 0 }}
          </div>
          <div class="mt-1 text-sm text-foreground/60">
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
</template>
