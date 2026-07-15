<script setup lang="ts">
const { getAdminSiteHeader, updateSiteHeader, getAdminSiteSeo, updateSiteSeo, uploadMedia } = useApi();

const siteHeader = ref<any>(null);
const siteSeo = ref<any>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const message = ref('');

const lightLogoUrl = computed(() =>
  useMediaUrl(siteHeader.value?.lightLogo?.path),
);
const darkLogoUrl = computed(() =>
  useMediaUrl(siteHeader.value?.darkLogo?.path),
);
const ogImageUrl = computed(() =>
  useMediaUrl(siteSeo.value?.openGraphImage?.path),
);
const twitterImageUrl = computed(() =>
  useMediaUrl(siteSeo.value?.twitterImage?.path),
);

const seoForm = ref({
  defaultTitle: '',
  defaultDescription: '',
  robotsEnabled: true,
  sitemapEnabled: true,
});

async function fetchHeader() {
  loading.value = true;
  error.value = '';
  try {
    siteHeader.value = await getAdminSiteHeader();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки настроек';
  } finally {
    loading.value = false;
  }
}

async function fetchSeo() {
  loading.value = true;
  error.value = '';
  try {
    siteSeo.value = await getAdminSiteSeo();
    const defaultSeo = siteSeo.value?.defaultSeo || {};
    seoForm.value = {
      defaultTitle: defaultSeo.title || '',
      defaultDescription: defaultSeo.description || '',
      robotsEnabled: siteSeo.value?.robotsEnabled ?? true,
      sitemapEnabled: siteSeo.value?.sitemapEnabled ?? true,
    };
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки SEO';
  } finally {
    loading.value = false;
  }
}

async function uploadLogo(file: File, type: 'light' | 'dark') {
  if (!file) return;
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const media: any = await uploadMedia(file);
    const body: any = {};
    if (type === 'light') body.lightLogoMediaId = media?.id;
    else body.darkLogoMediaId = media?.id;
    siteHeader.value = await updateSiteHeader(body);
    message.value = type === 'light' ? 'Светлый логотип сохранён' : 'Тёмный логотип сохранён';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки логотипа';
  } finally {
    saving.value = false;
  }
}

async function removeLogo(type: 'light' | 'dark') {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const body: any = {};
    if (type === 'light') body.lightLogoMediaId = null;
    else body.darkLogoMediaId = null;
    siteHeader.value = await updateSiteHeader(body);
    message.value = type === 'light' ? 'Светлый логотип удалён' : 'Тёмный логотип удалён';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка удаления логотипа';
  } finally {
    saving.value = false;
  }
}

async function uploadSeoImage(file: File, type: 'og' | 'twitter') {
  if (!file) return;
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const media: any = await uploadMedia(file);
    const body: any = {};
    if (type === 'og') body.openGraphImageMediaId = media?.id;
    else body.twitterImageMediaId = media?.id;
    siteSeo.value = await updateSiteSeo(body);
    message.value = type === 'og' ? 'OG-изображение сохранёно' : 'Twitter-изображение сохранёно';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки изображения';
  } finally {
    saving.value = false;
  }
}

async function removeSeoImage(type: 'og' | 'twitter') {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const body: any = {};
    if (type === 'og') body.openGraphImageMediaId = null;
    else body.twitterImageMediaId = null;
    siteSeo.value = await updateSiteSeo(body);
    message.value = type === 'og' ? 'OG-изображение удалёно' : 'Twitter-изображение удалёно';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка удаления изображения';
  } finally {
    saving.value = false;
  }
}

async function saveSeoText() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    siteSeo.value = await updateSiteSeo({
      defaultSeo: {
        title: seoForm.value.defaultTitle,
        description: seoForm.value.defaultDescription,
      },
      robotsEnabled: seoForm.value.robotsEnabled,
      sitemapEnabled: seoForm.value.sitemapEnabled,
    });
    message.value = 'SEO-настройки сохранены';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения SEO';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchHeader();
  fetchSeo();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Настройки сайта</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading" class="mt-6 space-y-10">
      <!-- Logo -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Логотип</h2>
        <p class="text-sm text-foreground/60">
          Загрузите светлую и тёмную версии логотипа. Если не загружено — будет использоваться логотип по умолчанию.
        </p>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-3 rounded border border-foreground/10 p-4">
            <h3 class="text-sm font-medium">Светлый логотип</h3>
            <img
              v-if="lightLogoUrl"
              :src="lightLogoUrl"
              alt="Светлый логотип"
              class="h-10 w-auto object-contain"
            >
            <p v-else class="text-sm text-foreground/40">Не загружен</p>
            <div class="flex flex-wrap items-center gap-2">
              <label class="btn-secondary cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="saving"
                  @change="($event: any) => uploadLogo($event.target.files?.[0], 'light')"
                >
                {{ saving ? 'Сохранение...' : 'Загрузить' }}
              </label>
              <button
                v-if="siteHeader?.lightLogo"
                class="text-sm text-red-600 hover:underline"
                :disabled="saving"
                @click="removeLogo('light')"
              >
                Удалить
              </button>
            </div>
          </div>

          <div class="space-y-3 rounded border border-foreground/10 p-4">
            <h3 class="text-sm font-medium">Тёмный логотип</h3>
            <img
              v-if="darkLogoUrl"
              :src="darkLogoUrl"
              alt="Тёмный логотип"
              class="h-10 w-auto object-contain"
            >
            <p v-else class="text-sm text-foreground/40">Не загружен</p>
            <div class="flex flex-wrap items-center gap-2">
              <label class="btn-secondary cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="saving"
                  @change="($event: any) => uploadLogo($event.target.files?.[0], 'dark')"
                >
                {{ saving ? 'Сохранение...' : 'Загрузить' }}
              </label>
              <button
                v-if="siteHeader?.darkLogo"
                class="text-sm text-red-600 hover:underline"
                :disabled="saving"
                @click="removeLogo('dark')"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">SEO</h2>
        <p class="text-sm text-foreground/60">
          Основные SEO-настройки сайта: мета-заголовок и описание по умолчанию, изображения для соцсетей, индексация.
        </p>

        <div class="space-y-4 rounded border border-foreground/10 p-4">
          <div>
            <label class="mb-1 block text-sm font-medium">Title по умолчанию</label>
            <input
              v-model="seoForm.defaultTitle"
              type="text"
              class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Description по умолчанию</label>
            <textarea
              v-model="seoForm.defaultDescription"
              rows="3"
              class="w-full border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-sm font-medium">OG-изображение</h3>
              <img
                v-if="ogImageUrl"
                :src="ogImageUrl"
                alt="OG-изображение"
                class="h-24 w-auto object-contain"
              >
              <p v-else class="text-sm text-foreground/40">Не загружено</p>
              <div class="flex flex-wrap items-center gap-2">
                <label class="btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="saving"
                    @change="($event: any) => uploadSeoImage($event.target.files?.[0], 'og')"
                  >
                  {{ saving ? 'Сохранение...' : 'Загрузить' }}
                </label>
                <button
                  v-if="siteSeo?.openGraphImage"
                  class="text-sm text-red-600 hover:underline"
                  :disabled="saving"
                  @click="removeSeoImage('og')"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-medium">Twitter-изображение</h3>
              <img
                v-if="twitterImageUrl"
                :src="twitterImageUrl"
                alt="Twitter-изображение"
                class="h-24 w-auto object-contain"
              >
              <p v-else class="text-sm text-foreground/40">Не загружено</p>
              <div class="flex flex-wrap items-center gap-2">
                <label class="btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="saving"
                    @change="($event: any) => uploadSeoImage($event.target.files?.[0], 'twitter')"
                  >
                  {{ saving ? 'Сохранение...' : 'Загрузить' }}
                </label>
                <button
                  v-if="siteSeo?.twitterImage"
                  class="text-sm text-red-600 hover:underline"
                  :disabled="saving"
                  @click="removeSeoImage('twitter')"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="seoForm.robotsEnabled"
                type="checkbox"
                class="h-4 w-4 accent-accent"
              >
              Разрешить индексацию (robots)
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="seoForm.sitemapEnabled"
                type="checkbox"
                class="h-4 w-4 accent-accent"
              >
              Включить sitemap
            </label>
          </div>

          <button
            type="button"
            class="bg-accent px-5 py-2.5 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-50"
            :disabled="saving"
            @click="saveSeoText"
          >
            {{ saving ? 'Сохранение...' : 'Сохранить SEO' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
