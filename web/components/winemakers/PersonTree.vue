<script setup lang="ts">
import type { PersonSummary } from '~/types/winemakers';

interface TreeRelation {
  type: string;
  person: PersonSummary;
}

const props = defineProps<{
  person: PersonSummary;
  relations: TreeRelation[];
}>();

const relationGroups = computed(() => {
  const parents: TreeRelation[] = [];
  const children: TreeRelation[] = [];
  const spouses: TreeRelation[] = [];
  const siblings: TreeRelation[] = [];
  const founders: TreeRelation[] = [];
  const other: TreeRelation[] = [];

  for (const relation of props.relations) {
    if (relation.type === 'parent') parents.push(relation);
    else if (relation.type === 'child') children.push(relation);
    else if (relation.type === 'spouse') spouses.push(relation);
    else if (relation.type === 'sibling') siblings.push(relation);
    else if (relation.type === 'founder') founders.push(relation);
    else other.push(relation);
  }

  return { parents, children, spouses, siblings, founders, other };
});

function relationLabel(type: string) {
  if (type === 'parent') return 'Родитель';
  if (type === 'child') return 'Ребенок';
  if (type === 'spouse') return 'Супруги';
  if (type === 'sibling') return 'Сиблинг';
  if (type === 'founder') return 'Династия';
  return type;
}

function cardMeta(person: PersonSummary) {
  const years = [person.birthYear, person.deathYear].filter((value) => value !== null && value !== undefined);
  if (years.length === 2) return `${years[0]}–${years[1]}`;
  if (years.length === 1 && person.birthYear) return `${person.birthYear}–н.в.`;
  return person.winery?.name || '';
}
</script>

<template>
  <div class="border border-foreground/10 bg-card/40 p-5 md:p-6">
    <div class="flex flex-col items-center">
      <div v-if="relationGroups.parents.length" class="tree-row">
        <NuxtLink
          v-for="entry in relationGroups.parents"
          :key="`parent-${entry.person.id}`"
          :to="`/winemakers/${entry.person.slug}`"
          class="tree-card"
        >
          <p class="tree-label">{{ relationLabel(entry.type) }}</p>
          <div class="tree-name">{{ entry.person.name }}</div>
          <p class="tree-meta">{{ cardMeta(entry.person) }}</p>
        </NuxtLink>
      </div>

      <div v-if="relationGroups.parents.length" class="tree-branch" aria-hidden="true">
        <span class="tree-branch-line" />
      </div>

      <div class="tree-middle">
        <div v-if="relationGroups.siblings.length || relationGroups.founders.length" class="tree-side">
          <NuxtLink
            v-for="entry in [...relationGroups.siblings, ...relationGroups.founders]"
            :key="`${entry.type}-${entry.person.id}`"
            :to="`/winemakers/${entry.person.slug}`"
            class="tree-card tree-card--small"
          >
            <p class="tree-label">{{ relationLabel(entry.type) }}</p>
            <div class="tree-name">{{ entry.person.name }}</div>
          </NuxtLink>
        </div>

        <div class="tree-current">
          <p class="tree-label">Текущий профиль</p>
          <div class="tree-current-name">{{ person.name }}</div>
          <p class="tree-meta">{{ cardMeta(person) }}</p>
        </div>

        <div v-if="relationGroups.spouses.length || relationGroups.other.length" class="tree-side">
          <NuxtLink
            v-for="entry in [...relationGroups.spouses, ...relationGroups.other]"
            :key="`${entry.type}-${entry.person.id}`"
            :to="`/winemakers/${entry.person.slug}`"
            class="tree-card tree-card--small"
          >
            <p class="tree-label">{{ relationLabel(entry.type) }}</p>
            <div class="tree-name">{{ entry.person.name }}</div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="relationGroups.children.length" class="tree-branch" aria-hidden="true">
        <span class="tree-branch-line" />
      </div>

      <div v-if="relationGroups.children.length" class="tree-row">
        <NuxtLink
          v-for="entry in relationGroups.children"
          :key="`child-${entry.person.id}`"
          :to="`/winemakers/${entry.person.slug}`"
          class="tree-card"
        >
          <p class="tree-label">{{ relationLabel(entry.type) }}</p>
          <div class="tree-name">{{ entry.person.name }}</div>
          <p class="tree-meta">{{ cardMeta(entry.person) }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-row {
  @apply flex flex-wrap items-stretch justify-center gap-4;
}

.tree-middle {
  @apply flex w-full flex-col items-center justify-center gap-4 xl:flex-row;
}

.tree-side {
  @apply flex max-w-full flex-wrap justify-center gap-4 xl:w-[32%];
}

.tree-card {
  @apply min-w-[180px] max-w-[220px] border border-foreground/10 bg-background px-4 py-3 text-center transition hover:border-accent hover:bg-foreground/5;
}

.tree-card--small {
  @apply min-w-[160px];
}

.tree-current {
  @apply min-w-[220px] max-w-[260px] border-2 border-accent bg-background px-5 py-5 text-center;
}

.tree-label {
  @apply text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/45;
}

.tree-name {
  @apply mt-2 font-heading text-lg font-bold;
}

.tree-current-name {
  @apply mt-3 font-heading text-2xl font-bold;
}

.tree-meta {
  @apply mt-2 text-sm text-foreground/60;
}

.tree-branch {
  @apply flex h-8 items-center justify-center;
}

.tree-branch-line {
  @apply h-full w-px bg-accent/60;
}
</style>
