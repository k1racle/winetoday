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
  <CmsPageShell
    title="Спецпроекты"
    legacyEyebrow="Спецпроекты"
    legacyTitle="Управление спецпроектами"
    description="Отдельный контур управления проектами, их витринами и каталогами сущностей."
    :show-admin-tabs="false"
    :show-account-tabs="true"
    :show-project-tabs="true"
    content-class="mt-8"
  >
    <div class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        :to="isCmsRoute ? '/cms/projects/winemakers' : '/account/projects/winemakers'"
        class="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] transition hover:border-accent"
      >
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Спецпроект</p>
        <h2 class="mt-2 font-heading text-xl font-normal">Виноделы России</h2>
        <p class="mt-3 text-sm leading-6 text-foreground/70">
          Отдельное управление доступом к разделу, витриной спецпроекта и каталогом виноделов, вин, регионов, терруаров и виноделен.
        </p>
      </NuxtLink>
    </div>
  </CmsPageShell>
</template>
