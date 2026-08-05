<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description?: string;
  eyebrow?: string;
  legacyEyebrow?: string;
  legacyTitle?: string;
  backTo?: string;
  backLabel?: string;
  showAdminTabs?: boolean;
  showAccountTabs?: boolean;
  showProjectTabs?: boolean;
  contentClass?: string;
}>(), {
  eyebrow: 'CMS',
  legacyEyebrow: 'Администрирование',
  legacyTitle: undefined,
  backTo: '/account',
  backLabel: '← Назад в кабинет',
  showAdminTabs: true,
  showAccountTabs: false,
  showProjectTabs: false,
  contentClass: 'mt-6',
});

const { isCmsRoute } = useUiContext();
</script>

<template>
  <div class="w-full py-8">
    <template v-if="isCmsRoute">
      <CmsPageHeader :eyebrow="eyebrow" :title="title" :description="description">
        <template v-if="$slots.actions" #actions>
          <slot name="actions" />
        </template>
      </CmsPageHeader>
    </template>
    <template v-else>
      <div class="mb-6 border-b border-foreground/10 pb-4">
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">{{ legacyEyebrow }}</p>
        <h1 class="mt-2 font-heading text-2xl font-bold">{{ legacyTitle || title }}</h1>
      </div>

      <NuxtLink v-if="backTo" :to="backTo" class="text-sm text-accent hover:underline">{{ backLabel }}</NuxtLink>
      <AdminTabs v-if="showAdminTabs" class="mt-6" />
      <AccountTabs v-if="showAccountTabs" class="mt-6" />
      <ProjectTabs v-if="showProjectTabs" class="mt-6" />
    </template>

    <div :class="contentClass">
      <slot />
    </div>
  </div>
</template>
