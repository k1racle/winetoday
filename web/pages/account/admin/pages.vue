<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const TiptapEditor = defineAsyncComponent(() => import('~/components/TiptapEditor.vue'));

const { getStaticPage, updateStaticPage } = useApi();

const pages = [
  { slug: 'legal', label: 'Правовая информация' },
  { slug: 'privacy', label: 'Политика обработки персональных данных' },
];

const activeSlug = ref('legal');
const title = ref('');
const content = ref('');
const seoDescription = ref('');
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');

const activePageLabel = computed(() => pages.find((p) => p.slug === activeSlug.value)?.label || activeSlug.value);

async function loadPage(slug: string) {
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    const page = await getStaticPage(slug);
    title.value = page?.title || '';
    const blocks = Array.isArray(page?.contentBlocks) ? page.contentBlocks : [];
    const textBlock = blocks.find((b: any) => b.type === 'text');
    content.value = textBlock?.content || '';
    seoDescription.value = page?.seo?.description || '';
  } catch (err: any) {
    title.value = '';
    content.value = '';
    seoDescription.value = '';
    error.value = err?.data?.message || err?.message || 'Не удалось загрузить страницу';
  } finally {
    loading.value = false;
  }
}

watch(activeSlug, (slug) => {
  loadPage(slug);
}, { immediate: true });

async function savePage() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    await updateStaticPage(activeSlug.value, {
      title: title.value || activePageLabel.value,
      contentBlocks: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: content.value,
        },
      ],
      seo: {
        description: seoDescription.value,
      },
    });
    message.value = 'Страница сохранена';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Статические страницы</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="page in pages"
        :key="page.slug"
        type="button"
        class="rounded border px-4 py-2 text-sm transition"
        :class="activeSlug === page.slug ? 'border-accent bg-accent/10 text-foreground' : 'border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10'"
        @click="activeSlug = page.slug"
      >
        {{ page.label }}
      </button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading" class="mt-6 space-y-6">
      <div>
        <label class="mb-1 block text-sm font-normal text-foreground/70">Заголовок страницы</label>
        <input
          v-model="title"
          type="text"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
      </div>

      <div>
        <label class="mb-1 block text-sm font-normal text-foreground/70">Содержимое</label>
        <component :is="TiptapEditor" v-model="content" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-normal text-foreground/70">SEO Description</label>
        <textarea
          v-model="seoDescription"
          rows="2"
          class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="button"
        class="bg-accent px-5 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50"
        :disabled="saving"
        @click="savePage"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить страницу' }}
      </button>
    </div>
  </div>
</template>
