<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick, watch } from 'vue';
import { isTiptapJson, tiptapToHtml } from '~/utils/tiptap-html';

const props = defineProps<{
  type?: 'article' | 'news' | 'video' | 'gallery';
  draftId?: string;
}>();
const emit = defineEmits<{ (e: 'saved', id: string): void }>();

const config = useRuntimeConfig();
const { getCategories, getTags, uploadMedia, uploadCoverMedia, saveDraft, getDraft, getAuthors, getMediaById } = useApi();
const coverBaseUrl = (config.public.mediaBaseUrl || (config.public.apiUrl as string).replace('/api', '') || 'http://localhost:4000').replace(/\/$/, '');

const typeLabels: Record<string, string> = {
  article: 'Статья',
  news: 'Новость',
  video: 'Видео',
  gallery: 'Галерея',
};

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  in_review: 'На проверке',
  published: 'Опубликовано',
  rejected: 'Отклонено',
};

const labelOptions = [
  { value: '', label: 'Нет' },
  { value: 'important', label: 'Важно' },
  { value: 'hot', label: 'Горячая новость' },
  { value: 'exclusive', label: 'Эксклюзив' },
];

function emptyForm() {
  return {
    id: '',
    type: props.type || 'article',
    title: '',
    slug: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'in_review' | 'published' | 'rejected',
    publishedDate: '',
    publishedTime: '',
    materialLabel: '',
    featured: false,
    homepageSpecialBlock: false,
    coverMediaId: '',
    coverPath: '',
    coverShowWatermark: false,
    coverSource: '',
    videoUrl: '',
    duration: 0,
    authorId: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    contentBlocks: [] as Array<{ id: string; type: string; title?: string; content?: string; data?: any }>,
    sources: [] as Array<{ name: string; url: string }>,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  };
}

const form = reactive(emptyForm());

function formatDurationInput(seconds: number): string {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function parseDurationInput(value: string): number {
  const parts = value
    .split(':')
    .map((p) => parseInt(p.trim(), 10))
    .filter((n) => !isNaN(n));
  if (parts.length === 0) return 0;
  if (parts.length === 1) return Math.max(0, parts[0] || 0);
  if (parts.length === 2) return Math.max(0, (parts[0] || 0) * 60 + (parts[1] || 0));
  return Math.max(0, (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0));
}

const durationInput = computed({
  get: () => formatDurationInput(form.duration),
  set: (value: string) => { form.duration = parseDurationInput(value); },
});

const categories = ref<Array<{ id: string; name: string; slug: string }>>([]);
const tags = ref<Array<{ id: string; name: string; slug: string }>>([]);
const authors = ref<Array<{ id: string; name: string; slug: string }>>([]);
const dedupedAuthors = computed(() => {
  const map = new Map<string, { id: string; name: string; slug: string }>();
  for (const author of authors.value) {
    const key = author.name.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, author);
      continue;
    }
    const existingNumbered = /-\d+$/.test(existing.slug);
    const authorNumbered = /-\d+$/.test(author.slug);
    if (existingNumbered && !authorNumbered) {
      map.set(key, author);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ru') || a.slug.localeCompare(b.slug, 'ru'),
  );
});

const selectedAuthorId = computed({
  get() {
    if (!form.authorId) return '';
    const current = authors.value.find((a) => a.id === form.authorId);
    if (!current) return form.authorId;
    const rep = dedupedAuthors.value.find(
      (a) => a.name.toLowerCase() === current.name.toLowerCase(),
    );
    return rep?.id ?? form.authorId;
  },
  set(id: string) {
    form.authorId = id;
  },
});
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
const coverInput = ref<HTMLInputElement | null>(null);
const helpOpen = ref(false);

const typeRouteMap: Record<string, string> = {
  article: 'articles',
  news: 'news',
  video: 'videos',
  gallery: 'gallery',
};

const publicUrl = computed(() => {
  if (form.status !== 'published' || !form.slug) return '';
  return `/${typeRouteMap[form.type]}/${form.slug}`;
});

const previewUrl = computed(() => {
  if (form.status === 'published' || !form.slug) return '';
  return `/${typeRouteMap[form.type]}/${form.slug}?preview=1`;
});

const editorEls = new Map<string, HTMLElement>();

async function resolveMediaPaths(blocks: any[]): Promise<Map<string, string>> {
  const ids = new Set<string>();
  blocks.forEach((b) => {
    if (b.type === 'image-highlight' && b.imageId) ids.add(b.imageId);
    if ((b.type === 'image-gallery' || b.type === 'image-slider') && Array.isArray(b.imageIds)) {
      b.imageIds.forEach((id: string) => ids.add(id));
    }
  });

  const map = new Map<string, string>();
  await Promise.all(
    Array.from(ids).map(async (id) => {
      try {
        const media: any = await getMediaById(id);
        if (media?.path) map.set(id, media.path);
      } catch (e) {
        console.warn(`Failed to resolve media ${id}`, e);
      }
    }),
  );
  return map;
}

function normalizeBlock(b: any, mediaMap: Map<string, string>) {
  const id = b.id || crypto.randomUUID();

  // Legacy Strapi block types -> new editor block types
  if (b.type === 'html-editor' || b.type === 'rich-text') {
    const content = b.content || '';
    return { id, type: 'text', title: b.title, content: isTiptapJson(content) ? tiptapToHtml(content) : content };
  }

  if (b.type === 'image-highlight') {
    const path = b.imageId ? mediaMap.get(b.imageId) : '';
    return {
      id,
      type: 'image',
      title: b.title,
      data: {
        mediaId: b.imageId || '',
        path: path || '',
        caption: b.caption || '',
        source: b.credit || '',
        showWatermark: false,
      },
    };
  }

  if (b.type === 'image-gallery' || b.type === 'image-slider') {
    const items = (b.imageIds || [])
      .map((imageId: string) => ({
        mediaId: imageId,
        path: mediaMap.get(imageId) || '',
        source: b.photoSource || '',
        showWatermark: false,
      }))
      .filter((it: any) => it.path);
    return {
      id,
      type: b.type === 'image-gallery' ? 'gallery' : 'slider',
      title: b.title,
      data: { items },
    };
  }

  // New-format blocks
  if (b.type === 'text') {
    const content = b.content || '';
    return { id, type: b.type, title: b.title, content: isTiptapJson(content) ? tiptapToHtml(content) : content };
  }

  const data = b.data || {};
  if (b.type === 'image') {
    data.source = data.source || '';
    data.showWatermark = data.showWatermark ?? false;
  } else if ((b.type === 'slider' || b.type === 'gallery') && Array.isArray(data.items)) {
    const legacyBlockWatermark = data.showWatermark === true;
    data.items.forEach((it: any) => {
      it.source = it.source || '';
      it.showWatermark = legacyBlockWatermark || (it.showWatermark ?? false);
    });
    data.showWatermark = false;
  }

  return { id, type: b.type, title: b.title, data };
}

async function loadDraft(id: string) {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await getDraft(id);
    const rawBlocks = Array.isArray(res.contentBlocks) ? res.contentBlocks : [];
    const mediaMap = await resolveMediaPaths(rawBlocks);

    Object.assign(form, {
      id: res.id,
      type: res.type,
      title: res.title || '',
      slug: res.slug || '',
      excerpt: res.excerpt || '',
      status: res.status,
      publishedDate: res.publishedAt ? new Date(res.publishedAt).toISOString().slice(0, 10) : '',
      publishedTime: res.publishedAt ? new Date(res.publishedAt).toTimeString().slice(0, 5) : '',
      materialLabel: res.materialLabel || '',
      featured: res.featured,
      homepageSpecialBlock: res.homepageSpecialBlock,
      coverMediaId: res.coverMediaId || '',
      coverPath: res.coverMedia?.path || '',
      coverShowWatermark: res.coverShowWatermark,
      coverSource: res.coverSource || '',
      videoUrl: res.videoUrl || '',
      duration: res.duration || 0,
      authorId: res.authorId || '',
      categoryIds: (res.categories || []).map((c: any) => c.id),
      tagIds: (res.tags || []).map((t: any) => t.id),
      contentBlocks: rawBlocks.length ? rawBlocks.map((b: any) => normalizeBlock(b, mediaMap)) : [],
      sources: Array.isArray(res.sources) && res.sources.length ? res.sources : [{ name: '', url: '' }],
      seoTitle: res.seo?.title || '',
      seoDescription: res.seo?.description || '',
      seoKeywords: res.seo?.keywords || '',
    });
    await nextTick();
    form.contentBlocks.forEach((b) => {
      const el = editorEls.get(b.id);
      if (el) el.innerHTML = b.content || '';
    });
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить материал';
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, emptyForm());
  editorEls.clear();
  nextTick(() => {
    if (!form.contentBlocks.length) addTextBlock();
    if (!form.sources.length) form.sources.push({ name: '', url: '' });
  });
}

watch(() => props.draftId, (id) => {
  if (id) loadDraft(id);
  else resetForm();
}, { immediate: true });

watch(() => props.type, (t) => {
  if (t && !props.draftId) form.type = t;
});

onMounted(async () => {
  loading.value = true;
  try {
    const [catRes, tagRes, authorRes] = await Promise.all([getCategories(), getTags(), getAuthors()]);
    categories.value = Array.isArray(catRes) ? catRes : [];
    tags.value = Array.isArray(tagRes) ? tagRes : [];
    authors.value = Array.isArray(authorRes) ? authorRes : [];
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить рубрики и теги';
  } finally {
    loading.value = false;
  }
});

function setEditorEl(el: HTMLElement | null, block: typeof form.contentBlocks[0]) {
  if (el) {
    editorEls.set(block.id, el);
    if (el.innerHTML !== (block.content || '')) {
      el.innerHTML = block.content || '';
    }
  }
}

function addTextBlock() {
  form.contentBlocks.push({
    id: crypto.randomUUID(),
    type: 'text',
    title: 'Текстовый блок',
    content: '<p></p>',
  });
}

function addBlock(type: string) {
  const labels: Record<string, string> = {
    text: 'Текст',
    image: 'Изображение',
    slider: 'Слайдер',
    gallery: 'Галерея',
    embed: 'Embed',
    accent: 'Акцент',
  };
  const block: any = {
    id: crypto.randomUUID(),
    type,
    title: labels[type] || type,
  };
  if (type === 'text') {
    block.content = '<p></p>';
  } else if (type === 'image') {
    block.data = { mediaId: '', path: '', caption: '', source: '', showWatermark: false };
  } else if (type === 'slider' || type === 'gallery') {
    block.data = { items: [] };
  } else if (type === 'embed') {
    block.data = { code: '' };
  }
  form.contentBlocks.push(block);
}

function removeBlock(id: string) {
  form.contentBlocks = form.contentBlocks.filter((b) => b.id !== id);
  editorEls.delete(id);
}

function moveBlock(index: number, dir: number) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= form.contentBlocks.length) return;
  const arr = form.contentBlocks.slice();
  const temp = arr[index];
  arr[index] = arr[newIndex];
  arr[newIndex] = temp;
  form.contentBlocks = arr;
}

function onBlockInput(id: string) {
  const el = editorEls.get(id);
  if (el) {
    const block = form.contentBlocks.find((b) => b.id === id);
    if (block) block.content = el.innerHTML;
  }
}

function formatBlock(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (target.value) format('formatBlock', target.value);
}

function format(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
  const sel = window.getSelection();
  const node = sel?.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement | null;
  if (node) {
    const id = node.dataset.id;
    if (id) onBlockInput(id);
  }
}

function addSource() {
  form.sources.push({ name: '', url: '' });
}

function removeSource(index: number) {
  form.sources.splice(index, 1);
  if (!form.sources.length) form.sources.push({ name: '', url: '' });
}

function toggleCategory(id: string) {
  const idx = form.categoryIds.indexOf(id);
  if (idx === -1) form.categoryIds.push(id);
  else form.categoryIds.splice(idx, 1);
}

function toggleTag(id: string) {
  const idx = form.tagIds.indexOf(id);
  if (idx === -1) form.tagIds.push(id);
  else form.tagIds.splice(idx, 1);
}

async function onCoverSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const res: any = await uploadCoverMedia(file, form.coverShowWatermark);
    form.coverMediaId = res.id;
    form.coverPath = res.path;
  } catch (e: any) {
    error.value = e?.data?.message || 'Ошибка загрузки обложки';
  }
}

function removeCover() {
  form.coverMediaId = '';
  form.coverPath = '';
  if (coverInput.value) coverInput.value.value = '';
}

async function uploadBlockImage(e: Event, block: typeof form.contentBlocks[0]) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const res: any = await uploadMedia(file);
    if (!block.data) block.data = {};
    block.data.mediaId = res.id;
    block.data.path = res.path;
  } catch (e: any) {
    error.value = e?.data?.message || 'Ошибка загрузки изображения';
  }
  if (input) input.value = '';
}

async function addMediaItems(e: Event, block: typeof form.contentBlocks[0]) {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  for (const file of Array.from(files)) {
    try {
      const res: any = await uploadMedia(file);
      if (!block.data) block.data = { items: [] };
      if (!Array.isArray(block.data.items)) block.data.items = [];
      block.data.items.push({ mediaId: res.id, path: res.path, source: '', showWatermark: false });
    } catch (e: any) {
      error.value = e?.data?.message || 'Ошибка загрузки изображения';
    }
  }
  if (input) input.value = '';
}

function removeMediaItem(block: typeof form.contentBlocks[0], index: number) {
  if (block.data?.items) block.data.items.splice(index, 1);
}

let typografQuoteCounter = 0;
function typografText(text: string): string {
  if (!text) return text;
  typografQuoteCounter = 0;
  return text
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)-(\s|$)/g, '$1—$2')
    .replace(/(\w)-(\s)/g, '$1—$2')
    .replace(/"/g, () => {
      typografQuoteCounter += 1;
      return typografQuoteCounter % 2 ? '«' : '»';
    });
}

function applyTypograf() {
  form.title = typografText(form.title);
  form.excerpt = typografText(form.excerpt);
  form.seoTitle = typografText(form.seoTitle);
  form.seoDescription = typografText(form.seoDescription);
  form.contentBlocks.forEach((b) => {
    if (b.title) b.title = typografText(b.title);
    if (b.type === 'text' && b.content) {
      b.content = typografText(b.content);
      const el = editorEls.get(b.id);
      if (el) el.innerHTML = b.content;
    } else if (b.type === 'image' && b.data) {
      b.data.caption = typografText(b.data.caption || '');
      b.data.source = typografText(b.data.source || '');
    } else if ((b.type === 'slider' || b.type === 'gallery') && Array.isArray(b.data?.items)) {
      b.data.items.forEach((it: any) => {
        it.source = typografText(it.source || '');
      });
    }
  });
}

function publishedAtISO(): string | undefined {
  if (!form.publishedDate) return undefined;
  const time = form.publishedTime || '00:00';
  return new Date(`${form.publishedDate}T${time}`).toISOString();
}

function buildBody(status?: 'draft' | 'published'): Record<string, unknown> {
  const blocks = form.contentBlocks.map((b) => {
    const base: any = { id: b.id, type: b.type, title: b.title };
    if (b.type === 'text') {
      base.content = b.content;
    } else {
      base.data = b.data;
    }
    return base;
  });
  return {
    id: form.id || undefined,
    type: form.type,
    title: form.title,
    slug: form.slug || undefined,
    excerpt: form.excerpt,
    status: status || form.status,
    publishedAt: status === 'published' && !form.publishedDate
      ? new Date().toISOString()
      : publishedAtISO(),
    materialLabel: form.materialLabel || undefined,
    featured: form.featured,
    homepageSpecialBlock: form.homepageSpecialBlock,
    coverMediaId: form.coverMediaId || undefined,
    coverShowWatermark: form.coverShowWatermark,
    coverSource: form.coverSource || undefined,
    categoryIds: form.categoryIds,
    tagIds: form.tagIds,
    authorId: form.authorId || undefined,
    videoUrl: form.type === 'video' ? form.videoUrl || undefined : undefined,
    duration: form.type === 'video' ? form.duration || undefined : undefined,
    contentBlocks: blocks,
    sources: form.sources.filter((s) => s.name.trim() || s.url.trim()),
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
      keywords: form.seoKeywords,
    },
  };
}

async function submit(status?: 'draft' | 'published') {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    if (!form.title.trim()) throw new Error('Заголовок обязателен');
    const body = buildBody(status);
    const res: any = await saveDraft(body);
    form.id = res.id;
    message.value = status === 'published' ? 'Материал опубликован' : 'Черновик сохранён';
    emit('saved', res.id);
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="font-heading text-2xl font-bold">Создание материала</h2>
        <p class="mt-1 text-sm text-foreground/60">
          Полноценное редактирование контента с блоками и rich text
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-secondary" @click="helpOpen = true">? Помощь</button>
        <select v-model="form.type" class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
          <option v-for="(label, key) in typeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
        <button class="btn-secondary" @click="submit('draft')" :disabled="saving">
          💾 {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
        <button class="btn-primary" @click="submit('published')" :disabled="saving">
          🚀 Опубликовать
        </button>
        <NuxtLink
          v-if="publicUrl"
          :to="publicUrl"
          target="_blank"
          class="btn-secondary"
        >
          🔗 На сайте
        </NuxtLink>
        <NuxtLink
          v-else-if="previewUrl"
          :to="previewUrl"
          target="_blank"
          class="btn-secondary"
        >
          👁 Предпросмотр
        </NuxtLink>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>
    <div v-if="message" class="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {{ message }}
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border border-foreground/10 bg-card p-4">
      <div class="text-sm text-foreground/60">
        <span v-if="form.id" class="text-accent">ID: {{ form.id }}</span>
        <span v-else>Новый материал</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-foreground/50">Статус:</span>
        <span class="font-medium">{{ statusLabels[form.status] }}</span>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <!-- Left column -->
      <div class="space-y-6">
        <!-- Main info -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Основная информация
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">
                Заголовок <span class="text-red-600">*</span>
              </label>
              <input v-model="form.title" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Введите заголовок...">
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">
                Ссылка (slug) <span class="text-foreground/40">необязательно</span>
              </label>
              <input v-model="form.slug" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="slug-materiala">
            </div>
            <button type="button" class="btn-secondary w-full justify-center" @click="applyTypograf">
              ✨ Применить типографику
            </button>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Краткое описание</label>
              <textarea v-model="form.excerpt" rows="3" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Для публикации обязательно..." />
            </div>
          </div>
        </div>

        <!-- Publication settings -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Настройки публикации
          </div>
          <div class="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Статус</label>
              <select v-model="form.status" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Метка</label>
              <select v-model="form.materialLabel" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                <option v-for="opt in labelOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Автор</label>
              <select v-model="selectedAuthorId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                <option value="">— Автоматически —</option>
                <option v-for="a in dedupedAuthors" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-medium text-foreground/70">Дата публикации</label>
              <div class="flex gap-2">
                <input v-model="form.publishedDate" type="date" class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                <input v-model="form.publishedTime" type="time" class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
              </div>
            </div>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 sm:col-span-2">
              <input v-model="form.homepageSpecialBlock" type="checkbox" class="h-4 w-4 accent-accent">
              Вывести на главную в спецблок
            </label>
          </div>
        </div>

        <!-- Content blocks -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Блоки материала
          </div>
          <div class="space-y-4 p-4">
            <p class="text-xs text-foreground/50">Rich-text блоки + блоки изображений</p>
            <div class="space-y-4">
              <div v-for="(block, index) in form.contentBlocks" :key="block.id" class="border border-foreground/10">
                <div class="flex items-center justify-between border-b border-foreground/10 bg-muted px-3 py-2">
                  <div class="flex items-center gap-2">
                    <span class="cursor-grab text-foreground/40">⋮⋮</span>
                    <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" :class="block.type === 'text' ? 'bg-accent/10 text-accent' : 'bg-orange-100 text-orange-700'">
                      {{ block.type === 'text' ? 'Текст' : block.type === 'image' ? 'Изображение' : block.type === 'slider' ? 'Слайдер' : block.type === 'gallery' ? 'Галерея' : block.type === 'embed' ? 'Embed' : block.type }}
                    </span>
                    <input v-model="block.title" type="text" class="w-40 border-none bg-transparent text-xs font-medium outline-none placeholder:text-foreground/40" placeholder="Название блока">
                  </div>
                  <div class="flex items-center gap-1">
                    <button class="px-1.5 py-1 text-xs hover:bg-foreground/5" @click="moveBlock(index, -1)">↑</button>
                    <button class="px-1.5 py-1 text-xs hover:bg-foreground/5" @click="moveBlock(index, 1)">↓</button>
                    <button class="px-1.5 py-1 text-xs text-red-600 hover:bg-red-50" @click="removeBlock(block.id)">✕</button>
                  </div>
                </div>
                <div class="p-3">
                  <!-- Text block -->
                  <div v-if="block.type === 'text'" class="overflow-hidden border border-foreground/10">
                    <div class="flex flex-wrap items-center gap-1 border-b border-foreground/10 bg-muted px-2 py-1.5">
                      <select class="h-7 border border-foreground/10 bg-card px-1 text-xs" @change="formatBlock($event)">
                        <option value="p">Абзац</option>
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                      </select>
                      <span class="mx-1 h-4 w-px bg-foreground/10" />
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('bold')"><b>Ж</b></button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('italic')"><i>К</i></button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('underline')"><u>Ч</u></button>
                      <span class="mx-1 h-4 w-px bg-foreground/10" />
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('insertUnorderedList')">≡</button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('insertOrderedList')">1.</button>
                      <span class="mx-1 h-4 w-px bg-foreground/10" />
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('justifyLeft')">⬅</button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('justifyCenter')">↔</button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('justifyRight')">➡</button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('justifyFull')">⇹</button>
                      <span class="mx-1 h-4 w-px bg-foreground/10" />
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('formatBlock', 'BLOCKQUOTE')">❝</button>
                      <button class="h-7 w-7 text-xs hover:bg-foreground/5" @click="format('createLink', prompt('Введите URL', '') || '')">🔗</button>
                    </div>
                    <div
                      :ref="(el) => setEditorEl(el as HTMLElement, block)"
                      :data-id="block.id"
                      contenteditable="true"
                      class="min-h-[120px] px-3 py-2 text-sm leading-relaxed outline-none"
                      @input="onBlockInput(block.id)"
                    />
                  </div>

                  <!-- Image block -->
                  <div v-else-if="block.type === 'image'" class="space-y-3">
                    <div v-if="block.data?.path" class="relative inline-block">
                      <img :src="`${coverBaseUrl}${block.data.path}`" class="max-h-48 rounded border border-foreground/10 object-contain" alt="">
                      <button class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white" @click="block.data.mediaId = ''; block.data.path = ''">✕</button>
                    </div>
                    <label v-else class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-8 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground">
                      <input type="file" accept="image/*" class="hidden" @change="uploadBlockImage($event, block)">
                      🖼 Нажмите, чтобы загрузить изображение
                    </label>
                    <input v-model="block.data.caption" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent" placeholder="Подпись к изображению">
                    <input v-model="block.data.source" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent" placeholder="Источник фото">
                    <label class="flex cursor-pointer items-center gap-2 text-xs text-foreground/70">
                      <div class="relative h-4 w-8 cursor-pointer rounded-full bg-foreground/10 transition" :class="block.data.showWatermark ? 'bg-accent' : ''" @click="block.data.showWatermark = !block.data.showWatermark">
                        <span class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-card transition" :class="block.data.showWatermark ? 'translate-x-4' : ''" />
                      </div>
                      Водяной знак
                    </label>
                  </div>

                  <!-- Slider / Gallery block -->
                  <div v-else-if="block.type === 'slider' || block.type === 'gallery'" class="space-y-3">
                    <div v-if="block.data?.items?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div v-for="(item, i) in block.data.items" :key="i" class="space-y-2 rounded border border-foreground/10 p-2">
                        <div class="relative">
                          <img :src="`${coverBaseUrl}${item.path}`" class="h-24 w-full rounded border border-foreground/10 object-cover" alt="">
                          <button class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white" @click="removeMediaItem(block, i)">✕</button>
                        </div>
                        <input v-model="item.source" type="text" class="w-full border border-foreground/10 bg-card px-2 py-1.5 text-[11px] outline-none focus:border-accent" placeholder="Источник фото">
                        <label class="flex cursor-pointer items-center gap-2 text-[11px] text-foreground/70">
                          <div class="relative h-4 w-8 cursor-pointer rounded-full bg-foreground/10 transition" :class="item.showWatermark ? 'bg-accent' : ''" @click="item.showWatermark = !item.showWatermark">
                            <span class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-card transition" :class="item.showWatermark ? 'translate-x-4' : ''" />
                          </div>
                          Водяной знак
                        </label>
                      </div>
                    </div>
                    <label class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-6 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground">
                      <input type="file" accept="image/*" multiple class="hidden" @change="addMediaItems($event, block)">
                      🖼 Добавить изображения
                    </label>
                  </div>

                  <!-- Embed block -->
                  <div v-else-if="block.type === 'embed'" class="space-y-2">
                    <textarea v-model="block.data.code" rows="4" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-xs font-mono outline-none focus:border-accent" placeholder="Вставьте HTML-код, ссылку на Youube, iframe..." />
                  </div>

                  <!-- Fallback / accent -->
                  <div v-else class="border-2 border-dashed border-foreground/10 px-4 py-8 text-center text-xs text-foreground/50">
                    Блок «{{ block.title }}» — заглушка.
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addTextBlock">＋ Текстовый блок</button>
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addBlock('image')">＋ Изображение</button>
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addBlock('slider')">＋ Слайдер</button>
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addBlock('gallery')">＋ Галерея</button>
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addBlock('embed')">＋ Embed</button>
              <button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" @click="addBlock('accent')">＋ Акцент</button>
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            SEO-настройки
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Meta Title</label>
              <input v-model="form.seoTitle" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Заголовок для поисковиков">
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Meta Description</label>
              <textarea v-model="form.seoDescription" rows="2" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Краткое описание..." />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-foreground/70">Keywords</label>
              <input v-model="form.seoKeywords" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="вино, виноделие, виноград">
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- Cover -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Обложка
          </div>
          <div class="space-y-4 p-4">
            <div class="flex gap-4">
              <div
                class="flex h-24 w-36 shrink-0 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-foreground/10 text-center text-xs text-foreground/50 transition hover:border-accent hover:text-foreground"
                @click="coverInput?.click()"
              >
                <template v-if="form.coverPath">
                  <img :src="`${coverBaseUrl}${form.coverPath}`" class="h-full w-full object-cover" alt="">
                </template>
                <template v-else>
                  🖼<br>Нет файла
                </template>
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected">
                <button class="btn-secondary w-full text-xs" @click="coverInput?.click()">Загрузить</button>
                <button class="btn-danger w-full text-xs" :disabled="!form.coverMediaId" @click="removeCover">🗑 Удалить</button>
                <label class="flex cursor-pointer items-center gap-2 text-xs text-foreground/70">
                  <div class="relative h-4 w-8 cursor-pointer rounded-full bg-foreground/10 transition" :class="form.coverShowWatermark ? 'bg-accent' : ''" @click="form.coverShowWatermark = !form.coverShowWatermark">
                    <span class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-card transition" :class="form.coverShowWatermark ? 'translate-x-4' : ''" />
                  </div>
                  Водяной знак
                </label>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Источник фото</label>
                  <input v-model="form.coverSource" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent" placeholder="Источник обложки">
                </div>
              </div>
            </div>
            <div v-if="form.type === 'video'" class="mt-3 space-y-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-foreground/70">Источник видео</label>
                <input v-model="form.videoUrl" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="https://youtube.com/...">
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-foreground/70">Продолжительность (чч:мм:сс)</label>
                <input v-model="durationInput" type="text" inputmode="numeric" pattern="[0-9:]+" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="0:05:30">
              </div>
            </div>
          </div>
        </div>

        <!-- Categories & tags -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Рубрики и теги
          </div>
          <div class="space-y-4 p-4">
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Рубрики</p>
              <div v-if="loading" class="text-xs text-foreground/50">Загрузка…</div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  class="flex items-center gap-1.5 rounded px-2 py-1 text-xs transition"
                  :class="form.categoryIds.includes(cat.id) ? 'bg-accent text-black' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'"
                  @click="toggleCategory(cat.id)"
                >
                  <span class="h-3 w-3 rounded-sm border border-current flex items-center justify-center text-[8px]">
                    {{ form.categoryIds.includes(cat.id) ? '✓' : '' }}
                  </span>
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Темы</p>
              <div v-if="loading" class="text-xs text-foreground/50">Загрузка…</div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="tag in tags"
                  :key="tag.id"
                  class="flex items-center gap-1.5 rounded px-2 py-1 text-xs transition"
                  :class="form.tagIds.includes(tag.id) ? 'bg-accent/10 text-accent' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'"
                  @click="toggleTag(tag.id)"
                >
                  <span class="h-3 w-3 rounded-sm border border-current flex items-center justify-center text-[8px]">
                    {{ form.tagIds.includes(tag.id) ? '✓' : '' }}
                  </span>
                  {{ tag.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sources -->
        <div class="border border-foreground/10 bg-card">
          <div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold">
            Источники
          </div>
          <div class="space-y-2 p-4">
            <div v-for="(src, i) in form.sources" :key="i" class="flex gap-2">
              <input v-model="src.name" type="text" class="flex-1 border border-foreground/10 bg-card px-2 py-1.5 text-xs outline-none focus:border-accent" placeholder="Название">
              <input v-model="src.url" type="text" class="flex-1 border border-foreground/10 bg-card px-2 py-1.5 text-xs outline-none focus:border-accent" placeholder="https://...">
              <button class="px-2 text-xs text-red-600 hover:bg-red-50" @click="removeSource(i)">✕</button>
            </div>
            <button class="btn-secondary w-full text-xs" @click="addSource">＋ Добавить источник</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4">
      <button class="btn-danger" @click="form.status = 'draft'">🗑 Удалить материал</button>
      <div class="flex gap-2">
        <button class="btn-secondary" :disabled="saving" @click="submit('draft')">
          💾 {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
        <button class="btn-primary" :disabled="saving" @click="submit('published')">
          🚀 Создать материал
        </button>
      </div>
    </div>
  </div>

  <EditorHelpModal v-model="helpOpen" />
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50;
}
.btn-danger {
  @apply inline-flex items-center gap-1.5 border border-red-200 bg-card px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50;
}
</style>
