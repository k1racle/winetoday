<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
const route = useRoute();
const { isCmsRoute } = useUiContext();

onMounted(() => {
  if (route.path === '/account/projects') {
    navigateTo('/cms/projects');
    return;
  }
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
  }
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <template v-if="isCmsRoute">
      <CmsPageHeader
        eyebrow="CMS"
        title="Спецпроекты"
        description="Отдельный контур управления спецпроектами и их витринами."
      />
    </template>
    <template v-else>
      <div class="mb-6 border-b border-foreground/10 pb-4">
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Спецпроекты</p>
        <h1 class="mt-2 font-heading text-2xl font-bold">Управление спецпроектами</h1>
      </div>

      <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

      <AccountTabs class="mt-6" />
      <ProjectTabs class="mt-6" />
    </template>

    <div class="mt-8 grid gap-6 md:grid-cols-2">
      <NuxtLink
        :to="isCmsRoute ? '/cms/projects/winemakers' : '/account/projects/winemakers'"
        class="border border-foreground/10 bg-card p-6 shadow-sm transition hover:border-accent"
      >
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Спецпроект</p>
        <h2 class="mt-2 font-heading text-xl font-normal">Виноделы России</h2>
        <p class="mt-3 text-sm leading-6 text-foreground/70">
          Отдельное управление доступом к разделу, витриной спецпроекта и каталогом виноделов, вин, регионов, терруаров и виноделен.
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
