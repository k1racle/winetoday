<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const { user, isAuthenticated } = useAuth();
const { getAdminHomepage, updateAdminHomepage, getContent, uploadArchiveCoverMedia, getMediaById } = useApi();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const message = ref('');

const leadItems = ref<(ContentItem | undefined)[]>([]);
const featuredVideo = ref<ContentItem | null>(null);
const autoVideos = ref<ContentItem[]>([]);

const searchLead = ref(['', '', '']);
const leadResults = ref<ContentItem[][]>([[], [], []]);
const leadLoading = ref([false, false, false]);

const searchFeaturedVideo = ref('');
const featuredVideoResults = ref<ContentItem[]>([]);
const featuredVideoLoading = ref(false);

const leadArchiveCoverMediaId = ref('');
const leadArchiveCoverPath = ref('');
const leadArchiveCoverPickerOpen = ref(false);
const leadArchiveCoverInput = ref<HTMLInputElement | null>(null);

function setLeadArchiveCoverInputRef(el: any) {
  if (el) leadArchiveCoverInput.value = el as HTMLInputElement;
}

function syncLeadArchiveCover() {
  const item = leadItems.value[0];
  if (item?.archiveCoverMedia) {
    leadArchiveCoverMediaId.value = item.archiveCoverMedia.id;
    leadArchiveCoverPath.value = item.archiveCoverMedia.path;
  } else {
    leadArchiveCoverMediaId.value = '';
    leadArchiveCoverPath.value = '';
  }
}

async function fetchConfig() {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await getAdminHomepage();
    leadItems.value = Array.isArray(res?.lead) ? res.lead : [];
    featuredVideo.value = res?.featuredVideo || null;
    autoVideos.value = Array.isArray(res?.autoVideos) ? res.autoVideos : [];
    syncLeadArchiveCover();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки настроек главной';
  } finally {
    loading.value = false;
  }
}

async function searchContent(term: string, type?: string) {
  if (!term.trim()) return [];
  try {
    const res: any = await getContent({
      search: term.trim(),
      type,
      limit: 10,
    });
    return Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    return [];
  }
}

async function onLeadSearch(index: number) {
  const term = searchLead.value[index];
  leadResults.value[index] = [];
  if (!term.trim()) return;
  leadLoading.value[index] = true;
  leadResults.value[index] = await searchContent(term);
  leadLoading.value[index] = false;
}

function selectLead(index: number, item: ContentItem) {
  leadItems.value[index] = item;
  searchLead.value[index] = '';
  leadResults.value[index] = [];
  if (index === 0) syncLeadArchiveCover();
}

function removeLead(index: number) {
  leadItems.value[index] = undefined;
  if (index === 0) syncLeadArchiveCover();
}

async function onFeaturedVideoSearch() {
  featuredVideoResults.value = [];
  if (!searchFeaturedVideo.value.trim()) return;
  featuredVideoLoading.value = true;
  featuredVideoResults.value = await searchContent(searchFeaturedVideo.value, 'video');
  featuredVideoLoading.value = false;
}

function selectFeaturedVideo(item: ContentItem) {
  featuredVideo.value = item;
  searchFeaturedVideo.value = '';
  featuredVideoResults.value = [];
}

function removeFeaturedVideo() {
  featuredVideo.value = null;
}

async function onLeadArchiveCoverSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const res: any = await uploadArchiveCoverMedia(file);
    leadArchiveCoverMediaId.value = res.id;
    leadArchiveCoverPath.value = res.path;
  } catch (e: any) {
    error.value = e?.data?.message || 'Ошибка загрузки обложки';
  }
}

function onLeadArchiveCoverSelectedFromLibrary(media: any) {
  leadArchiveCoverMediaId.value = media.id;
  leadArchiveCoverPath.value = media.path;
}

function removeLeadArchiveCover() {
  leadArchiveCoverMediaId.value = '';
  leadArchiveCoverPath.value = '';
  if (leadArchiveCoverInput.value) leadArchiveCoverInput.value.value = '';
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    await updateAdminHomepage({
      leadItemIds: leadItems.value.filter(Boolean).map((item) => item!.id),
      featuredVideoId: featuredVideo.value?.id || null,
      leadArchiveCoverMediaId: leadArchiveCoverMediaId.value || null,
    });
    message.value = 'Главная страница сохранена';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}

function itemTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    article: 'Статья',
    news: 'Новость',
    video: 'Видео',
    gallery: 'Галерея',
  };
  return labels[type || ''] || type || '';
}

function itemCover(item?: ContentItem) {
  return useMediaUrl(item?.coverMedia?.path);
}

onMounted(() => {
  if (!isAuthenticated.value || !['admin', 'editor'].includes(user.value?.role || '')) {
    navigateTo('/account');
    return;
  }
  fetchConfig();
});
</script>

<template>
  <div class="py-10">
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold">Личный кабинет</h1>
      <AccountTabs class="mb-6" />
    </div>

    <h2 class="mb-6 font-heading text-xl font-normal">Главная страница</h2>

    <p v-if="loading" class="text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading" class="mt-6 space-y-10">
      <!-- Lead block -->
      <div class="space-y-4">
        <div>
          <h2 class="text-lg font-normal">Спецблок</h2>
          <p class="text-sm text-foreground/60">
            Выберите 3 материала. Первый станет большой карточкой слева, следующие две — обычными справа.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="i in 3"
            :key="`lead-${i}`"
            class="rounded border border-foreground/10 bg-foreground/5 p-4"
          >
            <p class="mb-2 text-xs font-normal uppercase tracking-wide text-foreground/50">
              {{ i === 1 ? 'Большая карточка' : `Карточка ${i}` }}
            </p>

            <div v-if="leadItems[i - 1]" class="space-y-3">
              <img
                v-if="itemCover(leadItems[i - 1])"
                :src="itemCover(leadItems[i - 1])"
                alt=""
                class="h-32 w-full rounded object-cover"
              >
              <p class="text-sm font-normal">{{ leadItems[i - 1].title }}</p>
              <p class="text-xs text-foreground/50">{{ itemTypeLabel(leadItems[i - 1].type) }}</p>
              <button
                type="button"
                class="text-xs text-red-600 hover:underline"
                @click="removeLead(i - 1)"
              >
                Убрать
              </button>

              <div v-if="i === 1" class="space-y-2 border-t border-foreground/10 pt-3">
                <p class="text-xs text-foreground/50">Обложка большой карточки (ПК)</p>
                <img
                  v-if="leadArchiveCoverPath"
                  :src="useMediaUrl(leadArchiveCoverPath)"
                  alt=""
                  class="h-24 w-full rounded object-cover"
                >
                <div class="flex flex-wrap gap-2">
                  <input :ref="setLeadArchiveCoverInputRef" type="file" accept="image/*" class="hidden" @change="onLeadArchiveCoverSelected">
                  <button type="button" class="btn-secondary text-xs" @click="leadArchiveCoverInput?.click()">Загрузить</button>
                  <button type="button" class="btn-secondary text-xs" @click="leadArchiveCoverPickerOpen = true">Выбрать</button>
                  <button type="button" class="btn-danger text-xs" :disabled="!leadArchiveCoverMediaId" @click="removeLeadArchiveCover">Удалить</button>
                </div>
              </div>
            </div>

            <div v-else class="space-y-2">
              <input
                v-model="searchLead[i - 1]"
                type="text"
                class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Поиск по заголовку..."
                @input="onLeadSearch(i - 1)"
              >
              <p v-if="leadLoading[i - 1]" class="text-xs text-foreground/50">Поиск...</p>
              <div v-else-if="leadResults[i - 1].length" class="space-y-1">
                <button
                  v-for="item in leadResults[i - 1]"
                  :key="item.id"
                  type="button"
                  class="w-full rounded border border-foreground/10 bg-card p-2 text-left text-sm transition hover:border-accent"
                  @click="selectLead(i - 1, item)"
                >
                  <span class="text-xs text-foreground/50">{{ itemTypeLabel(item.type) }}</span>
                  <span class="block truncate">{{ item.title }}</span>
                </button>
              </div>
              <p v-else-if="searchLead[i - 1].trim()" class="text-xs text-foreground/50">Ничего не найдено</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Videos block -->
      <div class="space-y-4">
        <div>
          <h2 class="text-lg font-normal">Видео на главной</h2>
          <p class="text-sm text-foreground/60">
            Выберите главное видео. Остальные видео на главной подберутся автоматически по дате публикации.
          </p>
        </div>

        <div class="rounded border border-foreground/10 bg-foreground/5 p-4">
          <div class="relative mb-4">
            <input
              v-model="searchFeaturedVideo"
              type="text"
              class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Найти главное видео по заголовку..."
              @input="onFeaturedVideoSearch"
            >
            <p v-if="featuredVideoLoading" class="mt-1 text-xs text-foreground/50">Поиск...</p>
            <div v-else-if="featuredVideoResults.length" class="absolute z-10 mt-1 w-full rounded border border-foreground/10 bg-card shadow-lg">
              <button
                v-for="item in featuredVideoResults"
                :key="item.id"
                type="button"
                class="flex w-full items-center gap-3 border-b border-foreground/10 p-2 text-left text-sm transition hover:bg-foreground/5 last:border-b-0"
                @click="selectFeaturedVideo(item)"
              >
                <img
                  v-if="itemCover(item)"
                  :src="itemCover(item)"
                  alt=""
                  class="h-12 w-16 shrink-0 rounded object-cover"
                >
                <span class="truncate">{{ item.title }}</span>
              </button>
            </div>
            <p v-else-if="searchFeaturedVideo.trim()" class="mt-1 text-xs text-foreground/50">Ничего не найдено</p>
          </div>

          <div v-if="featuredVideo" class="space-y-4">
            <div class="flex items-center gap-3 rounded border border-foreground/10 bg-card p-2">
              <span class="w-6 text-center text-sm font-normal text-accent">1</span>
              <img
                v-if="itemCover(featuredVideo)"
                :src="itemCover(featuredVideo)"
                alt=""
                class="h-12 w-16 shrink-0 rounded object-cover"
              >
              <span class="flex-1 truncate text-sm">{{ featuredVideo.title }}</span>
              <button
                type="button"
                class="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                @click="removeFeaturedVideo"
              >
                ✕
              </button>
            </div>

            <div v-if="autoVideos.length">
              <p class="mb-2 text-xs text-foreground/50">Автоматически добавленные видео</p>
              <div class="space-y-2">
                <div
                  v-for="(item, index) in autoVideos"
                  :key="item.id"
                  class="flex items-center gap-3 rounded border border-foreground/10 bg-card p-2 opacity-70"
                >
                  <span class="w-6 text-center text-sm text-foreground/50">{{ index + 2 }}</span>
                  <img
                    v-if="itemCover(item)"
                    :src="itemCover(item)"
                    alt=""
                    class="h-12 w-16 shrink-0 rounded object-cover"
                  >
                  <span class="flex-1 truncate text-sm">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-foreground/50">Главное видео не выбрано</p>
        </div>
      </div>

      <button
        type="button"
        class="bg-accent px-6 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить главную' }}
      </button>
    </div>
  </div>

  <MediaPicker v-model="leadArchiveCoverPickerOpen" @select="onLeadArchiveCoverSelectedFromLibrary" />
</template>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-card px-3 py-1.5 text-xs font-normal text-foreground transition hover:bg-foreground/5 disabled:opacity-50;
}
.btn-danger {
  @apply inline-flex items-center gap-1.5 border border-red-600 bg-transparent px-3 py-1.5 text-xs font-normal text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50;
}
</style>
