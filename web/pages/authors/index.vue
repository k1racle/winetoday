<script setup lang="ts">
const { getAuthorsList } = useApi();

const { data: authors } = await useAsyncData('authors-list', () =>
  getAuthorsList().catch(() => []),
);

const list = computed<any[]>(() => (Array.isArray(authors.value) ? authors.value : []));

// API может вернуть количество материалов как materialsCount, либо как _count (число или объект).
function materialsCount(author: any): number {
  if (typeof author?.materialsCount === 'number') return author.materialsCount;
  const c = author?._count;
  if (typeof c === 'number') return c;
  if (c && typeof c === 'object') {
    const first = Object.values(c).find((v) => typeof v === 'number');
    return typeof first === 'number' ? first : 0;
  }
  return 0;
}

function materialsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'материал';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'материала';
  return 'материалов';
}

function initials(name?: string): string {
  return (name || '').trim().charAt(0).toUpperCase() || 'А';
}

useSeoMeta({
  title: 'Авторы',
  description: 'Авторы и эксперты редакции — их материалы о вине, виноделии и виноградарстве.',
});

useCanonical();
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Авторы</span>
    </nav>

    <h1 class="mb-8 font-heading text-3xl font-bold">Авторы</h1>

    <div v-if="!list.length" class="py-12 text-center text-foreground/60">
      Пока нет авторов.
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="author in list"
        :key="author.id"
        :to="`/author/${author.slug}`"
        class="group flex items-center gap-4 border border-foreground/10 bg-card p-4 transition hover:border-accent"
      >
        <NuxtImg
          v-if="author.avatarMedia?.path"
          :src="useMediaUrl(author.avatarMedia.path)"
          :alt="author.avatarMedia?.altText || author.name || ''"
          class="h-16 w-16 shrink-0 rounded-full object-cover"
        />
        <span
          v-else
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-normal uppercase text-black"
        >
          {{ initials(author.name) }}
        </span>
        <span class="min-w-0">
          <span class="block truncate font-heading text-lg font-normal leading-snug transition group-hover:text-accent">
            {{ author.name }}
          </span>
          <span v-if="author.position" class="mt-0.5 block truncate text-xs text-foreground/60">
            {{ author.position }}
          </span>
          <span class="mt-1 block text-xs text-foreground/50">
            {{ materialsCount(author) }} {{ materialsLabel(materialsCount(author)) }}
          </span>
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
