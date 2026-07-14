<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
const { getAdminSiteHeader, updateSiteHeader, uploadMedia } = useApi();

const siteHeader = ref<any>(null);
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

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchHeader();
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

    <div v-if="!loading" class="mt-6 space-y-8">
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
    </div>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
