<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  middleware: 'cms-editor',
});

const { user } = useAuth();
const { getEditorMaterials, getMyComments, getAdminSiteSettings } = useApi();

const loading = ref(false);
const draftCount = ref(0);
const reviewCount = ref(0);
const publishedCount = ref(0);
const lastMaterials = ref<any[]>([]);
const lastCommentsCount = ref(0);
const winemakersEnabled = ref<boolean | null>(null);

async function loadDashboard() {
  loading.value = true;
  try {
    const [materialsRes, commentsRes, settingsRes] = await Promise.all([
      getEditorMaterials({ limit: 8, offset: 0 }).catch(() => ({ items: [], counts: [] })),
      getMyComments().catch(() => []),
      user.value?.role === 'admin' ? getAdminSiteSettings().catch(() => null) : Promise.resolve(null),
    ]);

    lastMaterials.value = Array.isArray((materialsRes as any)?.items) ? (materialsRes as any).items : [];
    const counts = Array.isArray((materialsRes as any)?.counts) ? (materialsRes as any).counts : [];
    draftCount.value = counts.find((item: any) => item.status === 'draft')?._count?.status || 0;
    reviewCount.value = counts.find((item: any) => item.status === 'in_review')?._count?.status || 0;
    publishedCount.value = counts.find((item: any) => item.status === 'published')?._count?.status || 0;
    lastCommentsCount.value = Array.isArray(commentsRes) ? commentsRes.length : 0;
    winemakersEnabled.value = (settingsRes as any)?.winemakersEnabled ?? null;
  } finally {
    loading.value = false;
  }
}

function materialEditLink(item: any) {
  return `/cms/editor?type=${item.type}&id=${item.id}`;
}

onMounted(loadDashboard);
</script>

<template>
  <div>
    <CmsPageHeader
      eyebrow="CMS"
      title="Дашборд"
      description="Быстрый вход в редакционные задачи, последние материалы и состояние ключевых разделов."
    >
      <template #actions>
        <NuxtLink
          to="/cms/editor"
          class="inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90"
        >
          + Новый материал
        </NuxtLink>
      </template>
    </CmsPageHeader>

    <div v-if="loading" class="text-sm text-foreground/60">Загрузка...</div>

    <div v-else class="space-y-8">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="border border-foreground/10 bg-card p-5">
          <p class="text-xs uppercase tracking-wider text-foreground/50">Черновики</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ draftCount }}</p>
        </div>
        <div class="border border-foreground/10 bg-card p-5">
          <p class="text-xs uppercase tracking-wider text-foreground/50">На проверке</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ reviewCount }}</p>
        </div>
        <div class="border border-foreground/10 bg-card p-5">
          <p class="text-xs uppercase tracking-wider text-foreground/50">Опубликовано</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ publishedCount }}</p>
        </div>
        <div class="border border-foreground/10 bg-card p-5">
          <p class="text-xs uppercase tracking-wider text-foreground/50">Мои комментарии</p>
          <p class="mt-2 font-heading text-3xl font-normal">{{ lastCommentsCount }}</p>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section class="border border-foreground/10 bg-card">
          <div class="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
            <div>
              <p class="text-xs uppercase tracking-wider text-foreground/50">Материалы</p>
              <h2 class="mt-1 font-heading text-xl font-normal">Последние материалы</h2>
            </div>
            <NuxtLink to="/cms/editor" class="text-sm text-accent hover:underline">
              Открыть редактор
            </NuxtLink>
          </div>
          <div v-if="lastMaterials.length" class="divide-y divide-foreground/10">
            <NuxtLink
              v-for="item in lastMaterials"
              :key="item.id"
              :to="materialEditLink(item)"
              class="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-foreground/5"
            >
              <div class="min-w-0">
                <p class="truncate text-sm">{{ item.title }}</p>
                <p class="mt-1 text-xs text-foreground/50">{{ item.type }} · {{ item.status }}</p>
              </div>
              <span class="shrink-0 text-xs text-foreground/45">
                {{ new Date(item.updatedAt).toLocaleDateString('ru-RU') }}
              </span>
            </NuxtLink>
          </div>
          <div v-else class="px-5 py-6 text-sm text-foreground/60">Материалов пока нет.</div>
        </section>

        <section class="space-y-6">
          <div class="border border-foreground/10 bg-card p-5">
            <p class="text-xs uppercase tracking-wider text-foreground/50">Быстрые действия</p>
            <div class="mt-4 grid gap-2">
              <NuxtLink to="/cms/editor" class="rounded border border-foreground/10 px-4 py-3 text-sm transition hover:border-accent">
                Открыть редактор материалов
              </NuxtLink>
              <NuxtLink
                v-if="['admin', 'editor'].includes(user?.role || '')"
                to="/cms/homepage"
                class="rounded border border-foreground/10 px-4 py-3 text-sm transition hover:border-accent"
              >
                Настроить главную сайта
              </NuxtLink>
              <NuxtLink
                v-if="user?.role === 'admin'"
                to="/cms/projects/winemakers"
                class="rounded border border-foreground/10 px-4 py-3 text-sm transition hover:border-accent"
              >
                Открыть спецпроект «Виноделы России»
              </NuxtLink>
            </div>
          </div>

          <div
            v-if="user?.role === 'admin'"
            class="border border-foreground/10 bg-card p-5"
          >
            <p class="text-xs uppercase tracking-wider text-foreground/50">Спецпроекты</p>
            <h2 class="mt-2 font-heading text-xl font-normal">Виноделы России</h2>
            <p class="mt-3 text-sm text-foreground/65">
              {{
                winemakersEnabled
                  ? 'Раздел открыт для всех посетителей.'
                  : 'Раздел скрыт для посетителей и доступен только администраторам.'
              }}
            </p>
            <NuxtLink to="/cms/projects/winemakers" class="mt-4 inline-block text-sm text-accent hover:underline">
              Перейти к управлению проектом
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
