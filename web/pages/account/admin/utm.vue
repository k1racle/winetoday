<script setup lang="ts">
interface UtmEntry {
  url: string;
  createdAt: string;
}

const { user, isAuthenticated } = useAuth();

const SOURCES = ['telegram', 'vk', 'instagram', 'youtube', 'zen', 'email', 'partner'];
const MEDIUMS = ['messenger', 'social', 'video', 'email', 'referral', 'paid_social', 'qr', 'print'];
const CAMPAIGNS = ['morning_brief', 'week_digest', 'regulation', 'interview', 'event', 'special_project'];
const CONTENTS = ['post', 'story', 'bio', 'pinned', 'description', 'card_1', 'newsletter_top', 'partner_news'];

const STORAGE_KEY = 'utm-generator-history';
const VALUE_RE = /^[a-z0-9_]+$/;

const requestURL = useRequestURL();
const targetUrl = ref(`${requestURL.origin}/`);
const source = ref(SOURCES[0]);
const medium = ref(MEDIUMS[0]);
const campaign = ref(CAMPAIGNS[0]);
const content = ref(CONTENTS[0]);
const contentSuffix = ref('');
const copied = ref(false);
const history = ref<UtmEntry[]>([]);

const urlError = computed(() => {
  try {
    new URL(targetUrl.value);
    return '';
  } catch {
    return 'Некорректный URL';
  }
});

const suffixError = computed(() => {
  const suffix = contentSuffix.value.trim();
  if (!suffix) return '';
  return VALUE_RE.test(suffix)
    ? ''
    : 'Только латиница в нижнем регистре, цифры и подчёркивания';
});

const utmContent = computed(() => {
  const suffix = contentSuffix.value.trim();
  return suffix && !suffixError.value ? `${content.value}_${suffix}` : content.value;
});

const resultUrl = computed(() => {
  if (urlError.value || suffixError.value) return '';
  try {
    const u = new URL(targetUrl.value);
    u.searchParams.set('utm_source', source.value);
    u.searchParams.set('utm_medium', medium.value);
    u.searchParams.set('utm_campaign', campaign.value);
    u.searchParams.set('utm_content', utmContent.value);
    return u.toString();
  } catch {
    return '';
  }
});

function pushHistory(link: string) {
  history.value = [{ url: link, createdAt: new Date().toISOString() }, ...history.value].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function copyResult() {
  if (!resultUrl.value) return;
  if (await copyText(resultUrl.value)) {
    copied.value = true;
    pushHistory(resultUrl.value);
    setTimeout(() => (copied.value = false), 2000);
  }
}

async function copyEntry(link: string) {
  await copyText(link);
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem(STORAGE_KEY);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU');
}

onMounted(() => {
  if (!isAuthenticated.value || !['admin', 'editor'].includes(user.value?.role || '')) {
    navigateTo('/account');
    return;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) history.value = JSON.parse(raw);
  } catch {
    // ignore
  }
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Генератор UTM-ссылок</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 rounded-lg border border-foreground/10 bg-foreground/5 p-6">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-xs font-normal text-foreground/70">Целевой URL <span class="text-red-600">*</span></label>
          <input
            v-model="targetUrl"
            type="text"
            class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="https://winetoday.ru/"
          >
          <p v-if="urlError" class="mt-1 text-xs text-red-600">{{ urlError }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">utm_source</label>
            <select v-model="source" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
              <option v-for="item in SOURCES" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">utm_medium</label>
            <select v-model="medium" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
              <option v-for="item in MEDIUMS" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">utm_campaign</label>
            <select v-model="campaign" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
              <option v-for="item in CAMPAIGNS" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-normal text-foreground/70">utm_content</label>
            <select v-model="content" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
              <option v-for="item in CONTENTS" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs font-normal text-foreground/70">Суффикс utm_content (необязательно)</label>
          <input
            v-model="contentSuffix"
            type="text"
            class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="1045 → post_1045"
          >
          <p v-if="suffixError" class="mt-1 text-xs text-red-600">{{ suffixError }}</p>
        </div>
      </div>

      <div class="mt-6 border-t border-foreground/10 pt-4">
        <label class="mb-1 block text-xs font-normal text-foreground/70">Итоговая ссылка</label>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code class="flex-1 break-all rounded border border-foreground/10 bg-card px-3 py-2 text-sm text-foreground/80">
            {{ resultUrl || '—' }}
          </code>
          <button class="btn-primary shrink-0" :disabled="!resultUrl" @click="copyResult">
            {{ copied ? 'Скопировано' : 'Скопировать' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="mt-6 rounded-lg border border-foreground/10 bg-foreground/5 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-normal">Последние ссылки</h2>
        <button class="text-xs text-foreground/70 hover:underline" @click="clearHistory">Очистить</button>
      </div>
      <ul class="mt-4 space-y-2">
        <li
          v-for="(entry, index) in history"
          :key="index"
          class="flex flex-col gap-1 rounded border border-foreground/10 bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <p class="break-all text-sm text-foreground/80">{{ entry.url }}</p>
            <p class="text-xs text-foreground/50">{{ formatDate(entry.createdAt) }}</p>
          </div>
          <button class="shrink-0 text-xs text-accent hover:underline" @click="copyEntry(entry.url)">Копировать</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center justify-center gap-1.5 bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50;
}
</style>
