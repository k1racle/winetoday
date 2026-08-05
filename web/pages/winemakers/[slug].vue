<script setup lang="ts">
import type { PersonDetail } from '~/types/winemakers';

definePageMeta({
  layout: 'winemakers',
  middleware: 'winemakers-access',
});

const route = useRoute();
const { getWinemaker } = useApi();

const { data: person } = await useAsyncData(
  `winemaker-${route.params.slug}`,
  async () => {
    try {
      return await getWinemaker(String(route.params.slug)) as PersonDetail;
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || error?.response?.status || 404,
        statusMessage: 'Винодел не найден',
      });
    }
  },
);

const relations = computed(() => {
  if (!person.value) return [];

  const direct = person.value.relationsFrom.map((entry) => ({
    type: entry.type,
    person: entry.related,
  }));
  const reverse = person.value.relationsTo.map((entry) => ({
    type: entry.type === 'parent' ? 'child' : entry.type,
    person: entry.person,
  }));

  return [...direct, ...reverse];
});

function relationLabel(type: string) {
  if (type === 'parent') return 'Родитель';
  if (type === 'child') return 'Ребенок';
  if (type === 'spouse') return 'Супруги';
  if (type === 'sibling') return 'Сиблинг';
  if (type === 'founder') return 'Династия';
  return type;
}

useCanonical();
useSeoMeta({
  title: () => (person.value ? `${person.value.name} — Виноделы России` : 'Виноделы России'),
  description: () => person.value?.summary || 'Профиль винодела в каталоге «Виноделы России».',
});
</script>

<template>
  <div v-if="person" class="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <nav class="text-xs font-bold uppercase tracking-wider text-foreground/45">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/winemakers">Виноделы России</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/winemakers/persons">Виноделы</NuxtLink>
      <span class="mx-2">/</span>
      <span>{{ person.name }}</span>
    </nav>

    <section class="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div class="overflow-hidden border border-foreground/10 bg-card">
        <NuxtImg
          v-if="person.photo?.path"
          :src="useMediaUrl(person.photo.path)"
          :alt="person.name"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex aspect-[4/5] items-center justify-center px-6 text-center font-heading text-2xl text-foreground/35">
          {{ person.name }}
        </div>
      </div>

      <div>
        <h1 class="inline-block border-b-2 border-accent pb-1 font-heading text-4xl font-bold">
          {{ person.name }}
        </h1>
        <p class="mt-4 text-sm uppercase tracking-wider text-foreground/50">
          <span v-if="person.birthYear">{{ person.birthYear }}</span>
          <span v-if="person.birthYear || person.deathYear">–</span>
          <span>{{ person.deathYear || 'н.в.' }}</span>
        </p>
        <p v-if="person.winery?.name" class="mt-3 text-base text-foreground/72">
          <NuxtLink :to="`/wineries/${person.winery.slug}`" class="text-accent hover:underline">
            {{ person.winery.name }}
          </NuxtLink>
          <span v-if="person.winery.region?.name"> · {{ person.winery.region.name }}</span>
        </p>
        <p v-if="person.summary" class="mt-5 max-w-3xl text-lg leading-8 text-foreground/72">
          {{ person.summary }}
        </p>
      </div>
    </section>

    <section v-if="Array.isArray(person.bioBlocks) && person.bioBlocks.length" class="mt-12 max-w-3xl">
      <h2 class="mb-6 font-heading text-2xl font-bold">Биография</h2>
      <WinemakersBlocks :blocks="person.bioBlocks" :title="person.name" />
    </section>

    <section v-if="person.career?.length" class="mt-12 max-w-3xl">
      <h2 class="mb-6 font-heading text-2xl font-bold">Карьера</h2>
      <div class="space-y-4 border-l-2 border-accent pl-5">
        <div v-for="(step, index) in person.career" :key="index" class="relative">
          <span class="absolute -left-[29px] top-2 h-3 w-3 rounded-full bg-accent" />
          <p class="text-xs font-bold uppercase tracking-wider text-foreground/50">
            {{ step.from || '—' }}<span v-if="step.to || step.from">–</span>{{ step.to || 'н.в.' }}
          </p>
          <p class="mt-1 font-heading text-xl">{{ step.role || 'Этап карьеры' }}</p>
          <p v-if="step.place" class="mt-1 text-sm text-foreground/70">{{ step.place }}</p>
          <p v-if="step.note" class="mt-2 text-sm leading-6 text-foreground/70">{{ step.note }}</p>
        </div>
      </div>
    </section>

    <section v-if="relations.length" class="mt-12">
      <h2 class="mb-6 font-heading text-2xl font-bold">Связи и династии</h2>
      <WinemakersPersonTree :person="person" :relations="relations" />

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="entry in relations"
          :key="`${entry.type}-${entry.person.id}`"
          :to="`/winemakers/${entry.person.slug}`"
          class="block border border-foreground/10 bg-card p-4 transition hover:border-accent/40 hover:bg-foreground/5"
        >
          <p class="text-[11px] font-bold uppercase tracking-wider text-foreground/50">{{ relationLabel(entry.type) }}</p>
          <p class="mt-3 font-heading text-xl">{{ entry.person.name }}</p>
          <p v-if="entry.person.winery?.name" class="mt-2 text-sm text-foreground/70">{{ entry.person.winery.name }}</p>
        </NuxtLink>
      </div>
    </section>

    <section v-if="person.wines?.length" class="mt-12">
      <h2 class="mb-6 font-heading text-2xl font-bold">Вина</h2>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WinemakersWineCard
          v-for="entry in person.wines"
          :key="entry.wine.id"
          :wine="entry.wine"
        />
      </div>
    </section>
  </div>
</template>
