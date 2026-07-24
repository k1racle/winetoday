<script setup lang="ts">
import type { ContentItem } from '~/types/content';

const { user, isAuthenticated } = useAuth();
const { getAdminHomepage, updateAdminHomepage, getContent } = useApi();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const message = ref('');

const leadItems = ref<(ContentItem | undefined)[]>([]);
const videoItems = ref<ContentItem[]>([]);

const searchLead = ref(['', '', '']);
const leadResults = ref<ContentItem[][]>([[], [], []]);
const leadLoading = ref([false, false, false]);

const searchVideo = ref('');
const videoResults = ref<ContentItem[]>([]);
const videoLoading = ref(false);

async function fetchConfig() {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await getAdminHomepage();
    leadItems.value = Array.isArray(res?.lead) ? res.lead : [];
    videoItems.value = Array.isArray(res?.videos) ? res.videos : [];
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
}

function removeLead(index: number) {
  leadItems.value[index] = undefined;
}

async function onVideoSearch() {
  videoResults.value = [];
  if (!searchVideo.value.trim()) return;
  videoLoading.value = true;
  videoResults.value = await searchContent(searchVideo.value, 'video');
  videoLoading.value = false;
}

function addVideo(item: ContentItem) {
  if (videoItems.value.find((v) => v.id === item.id)) return;
  videoItems.value.push(item);
  searchVideo.value = '';
  videoResults.value = [];
}

function removeVideo(index: number) {
  videoItems.value.splice(index, 1);
}

function moveVideo(index: number, dir: number) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= videoItems.value.length) return;
  const arr = videoItems.value.slice();
  const temp = arr[index];
  arr[index] = arr[newIndex];
  arr[newIndex] = temp;
  videoItems.value = arr;
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    await updateAdminHomepage({
      leadItemIds: leadItems.value.filter(Boolean).map((item) => item!.id),
      videoItemIds: videoItems.value.map((item) => item.id).filter(Boolean),
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
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Главная страница</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
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
            Добавьте видео в нужном порядке. Первое видео будет большим, остальные — в ленте.
          </p>
        </div>

        <div class="rounded border border-foreground/10 bg-foreground/5 p-4">
          <div class="relative mb-4">
            <input
              v-model="searchVideo"
              type="text"
              class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Найти видео по заголовку..."
              @input="onVideoSearch"
            >
            <p v-if="videoLoading" class="mt-1 text-xs text-foreground/50">Поиск...</p>
            <div v-else-if="videoResults.length" class="absolute z-10 mt-1 w-full rounded border border-foreground/10 bg-card shadow-lg">
              <button
                v-for="item in videoResults"
                :key="item.id"
                type="button"
                class="flex w-full items-center gap-3 border-b border-foreground/10 p-2 text-left text-sm transition hover:bg-foreground/5 last:border-b-0"
                @click="addVideo(item)"
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
            <p v-else-if="searchVideo.trim()" class="mt-1 text-xs text-foreground/50">Ничего не найдено</p>
          </div>

          <div v-if="videoItems.length" class="space-y-2">
            <div
              v-for="(item, index) in videoItems"
              :key="item.id"
              class="flex items-center gap-3 rounded border border-foreground/10 bg-card p-2"
            >
              <span class="w-6 text-center text-sm text-foreground/50">{{ index + 1 }}</span>
              <img
                v-if="itemCover(item)"
                :src="itemCover(item)"
                alt=""
                class="h-12 w-16 shrink-0 rounded object-cover"
              >
              <span class="flex-1 truncate text-sm">{{ item.title }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="px-2 py-1 text-xs hover:bg-foreground/10 disabled:opacity-30"
                  :disabled="index === 0"
                  @click="moveVideo(index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="px-2 py-1 text-xs hover:bg-foreground/10 disabled:opacity-30"
                  :disabled="index === videoItems.length - 1"
                  @click="moveVideo(index, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  @click="removeVideo(index)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-foreground/50">Видео не выбраны</p>
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
</template>
