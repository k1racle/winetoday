<script setup lang="ts">
import type { AuthorProfile, ContentItem } from '~/types/content';

const route = useRoute();
const slug = route.params.slug as string;
const { getAuthor, getAuthorContent } = useApi();

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

useSeoMeta({
  title: `${profile.value?.name || slug} — Автор`,
  description: profile.value?.bio || `Материалы автора ${profile.value?.name || slug}`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumbs -->
    <nav class="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Автор</span>
    </nav>

    <!-- Author header -->
    <div class="grid gap-6 border-b border-foreground/10 pb-8 md:grid-cols-[160px_1fr]">
      <div class="shrink-0">
        <div v-if="avatarSrc" class="h-40 w-40 overflow-hidden rounded-full">
          <NuxtImg
            :src="avatarSrc"
            :alt="profile?.name || ''"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          v-else
          class="flex h-40 w-40 items-center justify-center rounded-full bg-green-600 text-4xl font-bold uppercase text-white"
        >
          {{ initials }}
        </div>
      </div>

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
    </div>

    <!-- Publications -->
    <div class="mt-10">
      <h2 class="mb-6 font-heading text-2xl font-bold">Все публикации автора</h2>
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
          class="h-[320px]"
        />
      </div>
    </div>
  </div>
</template>
