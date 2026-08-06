<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { isTiptapJson, tiptapToHtml } from '~/utils/tiptap-html';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  item: ContentItem;
  typeLabel: string;
  typeRoute: string;
}>();

const { getLatestByCategory, getRelated, getNeighbors, getReactions, react, getComments, createComment, deleteComment } = useApi();
const { user, isAuthenticated } = useAuth();
const viewerId = ref('');
const { data: categoryGroups } = await useAsyncData('latest-by-category-detail', () =>
  getLatestByCategory(10).catch(() => []),
);

const { data: relatedList } = await useAsyncData(`related-${props.item.id}`, () =>
  getRelated(props.item.type, props.item.slug).catch(() => []),
);

const { data: neighbors } = await useAsyncData(`neighbors-${props.item.id}`, () =>
  getNeighbors(props.item.type, props.item.slug).catch(() => ({ prev: null, next: null })),
);

const meta = computed(() => useContentMeta(props.item));
const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
const canEdit = computed(() => ['admin', 'editor'].includes(user.value?.role || ''));

const publishedTime = computed(() => {
  const d = props.item.publishedAt || props.item.createdAt;
  if (!d) return '';
  return new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
});

function editUrl(item: ContentItem) {
  return `/account/editor?type=${item.type}&id=${item.id}`;
}
const commentText = ref('');
const commentsSection = ref<HTMLDivElement | null>(null);
const commentTextarea = ref<HTMLTextAreaElement | null>(null);
const replyTo = ref<any | null>(null);
const shareUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''));

const reactions = ref({ likes: 0, dislikes: 0, userReaction: null as 'like' | 'dislike' | null });
const comments = ref<any[]>([]);
const commentLoading = ref(false);
const commentError = ref('');
const commentSuccess = ref('');
const reactionError = ref('');
const readIds = ref<Set<string>>(new Set());

const authOpen = ref(false);
const authTab = ref<'login' | 'register'>('login');
const showAuthPrompt = ref(false);

function openAuthLogin() {
  authTab.value = 'login';
  authOpen.value = true;
  showAuthPrompt.value = false;
}

function openAuthRegister() {
  authTab.value = 'register';
  authOpen.value = true;
  showAuthPrompt.value = false;
}

function loadReadIds() {
  try {
    const ids = JSON.parse(sessionStorage.getItem('vino_read_ids') || '[]');
    readIds.value = new Set(Array.isArray(ids) ? ids : []);
  } catch {
    readIds.value = new Set();
  }
}

function markAsRead(id: string) {
  try {
    readIds.value.add(id);
    sessionStorage.setItem('vino_read_ids', JSON.stringify([...readIds.value]));
  } catch {
    // ignore
  }
}

function ensureViewerId(): string {
  if (viewerId.value) return viewerId.value;
  let id = '';
  try {
    id = useViewerId();
  } catch {
    // ignore
  }
  if (!id) {
    id = uuidv4();
    try {
      localStorage.setItem('vino_viewer_id', id);
    } catch {
      // localStorage недоступен — используем временный id в памяти
    }
  }
  viewerId.value = id;
  return id;
}

async function loadReactions() {
  try {
    reactions.value = await getReactions(props.item.id, viewerId.value || undefined);
  } catch {
    // ignore
  }
}

async function loadComments() {
  try {
    comments.value = await getComments(props.item.id);
  } catch {
    comments.value = [];
  }
}

async function toggleReaction(type: 'like' | 'dislike') {
  reactionError.value = '';
  const currentViewerId = ensureViewerId();
  if (!currentViewerId) {
    reactionError.value = 'Не удалось определить голосующего';
    return;
  }
  try {
    reactions.value = await react(props.item.id, type, currentViewerId);
  } catch (e: any) {
    reactionError.value = e?.data?.message || 'Не удалось поставить оценку';
  }
}

async function submitComment() {
  commentError.value = '';
  commentSuccess.value = '';
  if (!isAuthenticated.value) {
    showAuthPrompt.value = true;
    return;
  }
  if (!commentText.value.trim()) {
    commentError.value = 'Введите текст комментария';
    return;
  }
  commentLoading.value = true;
  try {
    const body = replyTo.value
      ? `@${replyTo.value.author} ${commentText.value.trim()}`
      : commentText.value.trim();
    await createComment(props.item.id, body);
    commentText.value = '';
    replyTo.value = null;
    commentSuccess.value = 'Комментарий отправлен';
    await loadComments();
  } catch (e: any) {
    commentError.value = e?.data?.message || 'Не удалось отправить комментарий';
  } finally {
    commentLoading.value = false;
  }
}

function scrollToComments() {
  commentsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  nextTick(() => commentTextarea.value?.focus());
}

function startReply(comment: any) {
  replyTo.value = comment;
  nextTick(() => commentTextarea.value?.focus());
}

function cancelReply() {
  replyTo.value = null;
}

const canDeleteComment = (comment: any) => {
  if (!user.value) return false;
  if (['admin', 'editor'].includes(user.value.role)) return true;
  return comment.userId && comment.userId === user.value.id;
};

async function removeComment(commentId: string) {
  try {
    comments.value = await deleteComment(props.item.id, commentId);
  } catch (e: any) {
    commentError.value = e?.data?.message || 'Не удалось удалить комментарий';
  }
}

onMounted(() => {
  ensureViewerId();
  loadReadIds();
  markAsRead(props.item.id);
  loadReactions();
  loadComments();
});

const bodyBlocks = computed(() => {
  const blocks = props.item.contentBlocks || [];
  if (props.item.type !== 'video') return blocks;
  return blocks.filter((b) => b?.type !== 'video-player');
});

const relatedItems = computed(() => {
  const excludeIds = new Set([props.item.id, ...readIds.value]);
  const raw = relatedList.value;
  const list: ContentItem[] = Array.isArray(raw) ? raw : ((raw as any)?.items || []);
  return list.filter((i) => i && !excludeIds.has(i.id));
});

const linkedPersons = computed(() =>
  Array.isArray(props.item.personLinks)
    ? props.item.personLinks
        .map((entry) => entry.person)
        .filter(Boolean)
    : [],
);

const linkedRegions = computed(() =>
  Array.isArray(props.item.regionLinks)
    ? props.item.regionLinks
        .map((entry) => entry.region)
        .filter(Boolean)
    : [],
);

const linkedTerroirs = computed(() =>
  Array.isArray(props.item.terroirLinks)
    ? props.item.terroirLinks
        .map((entry) => entry.terroir)
        .filter(Boolean)
    : [],
);

const linkedWineries = computed(() =>
  Array.isArray(props.item.wineryLinks)
    ? props.item.wineryLinks
        .map((entry) => entry.winery)
        .filter(Boolean)
    : [],
);

const linkedProjectEntities = computed(() => [
  ...linkedPersons.value.map((person) => ({
    id: `person-${person.id}`,
    to: `/winemakers/${person.slug}`,
    eyebrow: 'Винодел',
    title: person.name,
    summary: person.winery?.name || '',
  })),
  ...linkedRegions.value.map((region) => ({
    id: `region-${region.id}`,
    to: `/regions/${region.slug}`,
    eyebrow: 'Регион',
    title: region.name,
    summary: region.summary || '',
  })),
  ...linkedTerroirs.value.map((terroir) => ({
    id: `terroir-${terroir.id}`,
    to: `/terroirs/${terroir.slug}`,
    eyebrow: 'Терруар',
    title: terroir.name,
    summary: terroir.region?.name || terroir.summary || '',
  })),
  ...linkedWineries.value.map((winery) => ({
    id: `winery-${winery.id}`,
    to: `/wineries/${winery.slug}`,
    eyebrow: 'Винодельня',
    title: winery.name,
    summary: winery.region?.name || winery.summary || '',
  })),
]);

function itemUrl(item: ContentItem) {
  switch (item.type) {
    case 'article':
      return `/articles/${item.slug}`;
    case 'news':
      return `/news/${item.slug}`;
    case 'video':
      return `/videos/${item.slug}`;
    case 'gallery':
      return `/gallery/${item.slug}`;
    default:
      return '/';
  }
}

const prevItem = computed<ContentItem | null>(() => (neighbors.value as any)?.prev || null);
const nextItem = computed<ContentItem | null>(() => (neighbors.value as any)?.next || null);

// Для галерей архив живёт на /gallery, для остальных типов берём typeRoute из пропсов.
const archiveRoute = computed(() => (props.item.type === 'gallery' ? '/gallery' : props.typeRoute));

const firstCategory = computed(() => props.item.categories?.[0] || null);

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const siteUrl = ((runtimeConfig.public.siteUrl as string) || '').replace(/\/$/, '');

const breadcrumbItems = computed(() => {
  const items: { name: string; url: string }[] = [
    { name: 'Главная', url: '/' },
    { name: props.typeLabel, url: archiveRoute.value },
  ];
  if (firstCategory.value) {
    items.push({ name: firstCategory.value.name, url: `/category/${firstCategory.value.slug}` });
  }
  items.push({ name: props.item.title, url: route.path });
  return items;
});

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.value.map((it, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: it.name,
          item: `${siteUrl}${it.url}`,
        })),
      }),
    },
  ],
}));

const relatedLimit = ref(3);
const displayedRelatedItems = computed(() => relatedItems.value.slice(0, relatedLimit.value));
const hasMoreRelated = computed(() => relatedLimit.value < relatedItems.value.length);

function loadMoreRelated() {
  relatedLimit.value += 3;
}

// --- Аналитика: события чтения и переходы по навигационным блокам ---
const { event } = useYm();
const contentBodyEl = ref<HTMLElement | null>(null);

const wordCount = computed(() => {
  const parts: string[] = [];
  if (props.item.excerpt) parts.push(props.item.excerpt);
  for (const block of bodyBlocks.value) {
    const raw = (block as any)?.content;
    if (typeof raw !== 'string') continue;
    parts.push(isTiptapJson(raw) ? tiptapToHtml(raw) : raw);
  }
  const text = parts.join(' ').replace(/<[^>]*>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
});

useReadingEvents({
  articleId: props.item.slug,
  author: props.item.author?.name || undefined,
  rubric: firstCategory.value?.name || undefined,
  contentType: props.item.type,
  wordCount: wordCount.value,
  contentEl: contentBodyEl,
});

function trackNeighborClick(target: ContentItem) {
  event('next_article_click', {
    from_article: props.item.slug,
    to_article: target.slug,
    module: 'prev_next',
  });
}

function trackRelatedClick(target: ContentItem) {
  event('related_click', {
    from_article: props.item.slug,
    to_article: target.slug,
    module: 'related',
  });
}

function onAuthorBylineClick(e: MouseEvent) {
  if (!props.item.author) return;
  if (!(e.target as HTMLElement | null)?.closest('a')) return;
  event('dossier_click', {
    from_page: props.item.slug,
    entity_id: props.item.author.slug,
    entity_type: 'author',
    placement: 'byline',
  });
}

</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <article class="w-full lg:w-3/4">
        <!-- Breadcrumbs -->
        <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
          <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
          <span>/</span>
          <NuxtLink :to="archiveRoute" class="hover:text-foreground">{{ typeLabel }}</NuxtLink>
          <template v-if="firstCategory">
            <span>/</span>
            <NuxtLink :to="`/category/${firstCategory.slug}`" class="hover:text-foreground">{{ firstCategory.name }}</NuxtLink>
          </template>
        </nav>

        <!-- Title -->
        <h1 class="font-heading text-3xl font-bold leading-tight md:text-4xl">
          {{ item.title }}
        </h1>

        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/50">
          <span v-if="meta.date">{{ meta.date }}</span>
          <span v-if="publishedTime">{{ publishedTime }}</span>
          <span v-if="meta.category">{{ meta.category }}</span>
        </div>

        <AuthorByline v-if="item.author && item.type !== 'video'" :author="item.author" class="mt-4" @click="onAuthorBylineClick" />

        <NuxtLink
          v-if="canEdit"
          :to="editUrl(item)"
          class="mt-3 inline-flex items-center gap-1.5 text-sm font-normal text-accent hover:text-accent/80"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Редактировать
        </NuxtLink>

        <!-- Video player (client-only mount avoids VK/Rutube cacheframe race on SSR) -->
        <figure v-if="item.type === 'video' && item.videoUrl" class="mt-6">
          <ClientOnly>
            <VideoEmbed :key="item.videoUrl" :url="item.videoUrl" :title="item.title || 'Видео'" />
            <template #fallback>
              <div class="aspect-video w-full bg-black" aria-hidden="true" />
            </template>
          </ClientOnly>
        </figure>
        <div v-if="item.type === 'video' && item.sources?.length" class="mt-3 w-full text-sm text-foreground/70">
          <div
            v-for="(src, idx) in item.sources"
            :key="idx"
            class="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span class="font-normal uppercase tracking-wider text-foreground/50">Источник:</span>
            <a
              v-if="src.url"
              :href="src.url"
              target="_blank"
              rel="noopener"
              class="break-all text-accent hover:underline"
            >
              {{ src.name || src.url }}
            </a>
            <span v-else>{{ src.name }}</span>
          </div>
        </div>

        <!-- Cover image (hidden for videos so the player appears immediately) -->
        <figure v-else-if="coverSrc && item.type !== 'video'" class="mt-6">
          <NuxtImg
            :src="coverSrc"
            :alt="item.coverMedia?.altText || item.title"
            class="aspect-video w-full object-cover"
          />
          <figcaption v-if="item.coverSource" class="mt-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
            Источник: {{ item.coverSource }}
          </figcaption>
        </figure>

        <!-- Content -->
        <div ref="contentBodyEl" class="mt-8">
          <ContentBlocks v-if="bodyBlocks.length" :blocks="bodyBlocks" :item="item" />
          <p v-else-if="item.excerpt" class="text-lg leading-relaxed opacity-80">
            {{ item.excerpt }}
          </p>
        </div>

        <section v-if="false && (linkedPersons.length || linkedTerroirs.length)" class="mt-10 border-t border-foreground/10 pt-6">
          <h2 class="font-heading text-xl font-normal">Связано со спецпроектом</h2>
          <div class="mt-4 space-y-4">
            <div v-if="linkedPersons.length">
              <p class="mb-2 text-xs font-normal uppercase tracking-wide text-foreground/50">Виноделы</p>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="person in linkedPersons"
                  :key="person.id"
                  :to="`/winemakers/${person.slug}`"
                  class="rounded border border-foreground/10 px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
                >
                  {{ person.name }}
                </NuxtLink>
              </div>
            </div>

            <div v-if="linkedTerroirs.length">
              <p class="mb-2 text-xs font-normal uppercase tracking-wide text-foreground/50">Терруары</p>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="terroir in linkedTerroirs"
                  :key="terroir.id"
                  :to="`/terroirs/${terroir.slug}`"
                  class="rounded border border-foreground/10 px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
                >
                  {{ terroir.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Prev / next navigation -->
        <nav v-if="prevItem || nextItem" class="mt-10 grid gap-3 border-t border-foreground/10 pt-6 sm:grid-cols-2">
          <NuxtLink
            v-if="prevItem"
            :to="itemUrl(prevItem)"
            class="group flex flex-col gap-1 border border-foreground/10 bg-card p-4 transition hover:border-accent"
            @click="prevItem && trackNeighborClick(prevItem)"
          >
            <span class="text-xs font-normal uppercase tracking-wider text-foreground/50 transition group-hover:text-accent">
              ← Предыдущий материал
            </span>
            <span class="line-clamp-2 font-heading text-base font-normal leading-snug">
              {{ prevItem.title }}
            </span>
          </NuxtLink>
          <span v-else class="hidden sm:block" />
          <NuxtLink
            v-if="nextItem"
            :to="itemUrl(nextItem)"
            class="group flex flex-col gap-1 border border-foreground/10 bg-card p-4 text-right transition hover:border-accent"
            @click="nextItem && trackNeighborClick(nextItem)"
          >
            <span class="text-xs font-normal uppercase tracking-wider text-foreground/50 transition group-hover:text-accent">
              Следующий материал →
            </span>
            <span class="line-clamp-2 font-heading text-base font-normal leading-snug">
              {{ nextItem.title }}
            </span>
          </NuxtLink>
        </nav>

        <!-- Reactions -->
        <div class="mt-10 flex items-center justify-between border-t border-foreground/10 pt-4">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex items-center gap-2 transition"
              :class="reactions.userReaction === 'like' ? 'text-green-500 hover:text-green-400' : 'text-foreground/60 hover:text-foreground'"
              aria-label="Нравится"
              @click="toggleReaction('like')"
            >
              <IconLike class="h-8 w-8" />
              <span v-if="reactions.likes > 0" class="text-xl">{{ reactions.likes }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 text-foreground/60 transition hover:text-foreground"
              aria-label="Комментарии"
              @click="scrollToComments"
            >
              <IconComment class="h-8 w-8" />
              <span v-if="comments.length > 0" class="text-sm font-normal">{{ comments.length }}</span>
            </button>
          </div>
          <div class="flex items-center gap-4">
            <ShareMenu :url="shareUrl" :title="item.title" />
          </div>
        </div>
        <p v-if="reactionError" class="mt-2 text-xs text-red-500">{{ reactionError }}</p>

        <section v-if="linkedProjectEntities.length" class="mt-8 border-t border-foreground/10 pt-6">
          <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-[11px] font-normal uppercase tracking-[0.24em] text-foreground/45">
                Спецпроект
              </p>
              <h2 class="mt-2 font-heading text-2xl font-normal">Связано с «Виноделами России»</h2>
            </div>
            <NuxtLink
              to="/winemakers"
              class="text-sm font-normal text-accent transition hover:text-accent/80"
            >
              Открыть каталог →
            </NuxtLink>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NuxtLink
              v-for="entry in linkedProjectEntities"
              :key="entry.id"
              :to="entry.to"
              class="group flex h-full flex-col border border-foreground/10 bg-card p-4 transition hover:border-accent/40 hover:bg-foreground/5"
            >
              <p class="text-[11px] font-normal uppercase tracking-[0.24em] text-foreground/45">
                {{ entry.eyebrow }}
              </p>
              <h3 class="mt-3 font-heading text-xl font-normal transition group-hover:text-accent">
                {{ entry.title }}
              </h3>
              <p v-if="entry.summary" class="mt-2 text-sm leading-6 text-foreground/65">
                {{ entry.summary }}
              </p>
            </NuxtLink>
          </div>
        </section>


        <!-- Related articles -->
        <div v-if="relatedItems.length" class="mt-10">
          <h2 class="mb-4 font-heading text-xl font-normal">
            {{ item.type === 'video' ? 'Смотрите ещё' : 'Читайте также' }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ArticleCard
              v-for="item in displayedRelatedItems"
              :key="item.id"
              :item="item"
              image-aspect="video"
              variant="compact"
              @click="trackRelatedClick(item)"
            />
          </div>
          <div v-if="hasMoreRelated" class="mt-6">
            <LoadMoreButton
              :loading="false"
              :has-more="true"
              @load="loadMoreRelated"
            />
          </div>
        </div>

        <!-- Comments -->
        <div ref="commentsSection" class="mt-10 scroll-mt-20">
          <h2 class="mb-4 font-heading text-xl font-normal">Комментарии</h2>
          <div class="border border-foreground/10 bg-card p-4">
            <div v-if="replyTo" class="mb-2 flex items-center justify-between text-xs text-foreground/70">
              <span>Ответ для <span class="text-foreground">@{{ replyTo.author }}</span></span>
              <button type="button" class="text-accent hover:underline" @click="cancelReply">Отменить</button>
            </div>
            <div class="relative">
              <textarea
                ref="commentTextarea"
                v-model="commentText"
                rows="4"
                :placeholder="replyTo ? `Ответ для @${replyTo.author}` : 'Поделитесь мнением о материале'"
                maxlength="3000"
                class="w-full resize-none border border-foreground/10 bg-card p-3 pr-10 text-sm outline-none transition focus:border-accent"
              />
              <button
                type="button"
                class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded bg-accent text-black transition hover:bg-accent/90 disabled:opacity-60"
                :disabled="commentLoading"
                :title="commentLoading ? 'Отправка...' : 'Отправить'"
                aria-label="Отправить"
                @click="submitComment"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs text-foreground/50">{{ commentText.length }} / 3000</span>
            </div>
            <p v-if="commentError" class="mt-2 text-xs text-red-500">{{ commentError }}</p>
            <p v-if="showAuthPrompt" class="mt-2 text-xs text-foreground/70">
              Чтобы оставить комментарий,
              <button type="button" class="text-accent hover:underline" @click="openAuthLogin">войдите</button>
              или
              <button type="button" class="text-accent hover:underline" @click="openAuthRegister">зарегистрируйтесь</button>.
            </p>
            <p v-if="commentSuccess" class="mt-2 text-xs text-green-500">{{ commentSuccess }}</p>
          </div>
          <div v-if="comments.length" class="mt-6 space-y-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="border border-foreground/10 bg-card p-4"
            >
              <div class="flex items-center justify-between text-xs text-foreground/50">
                <span class="font-normal text-foreground">{{ comment.author }}</span>
                <span>{{ new Date(comment.createdAt).toLocaleDateString('ru-RU') }}</span>
              </div>
              <p class="mt-2 text-sm leading-relaxed">{{ comment.body }}</p>
              <div class="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  class="text-xs text-foreground/60 transition hover:text-accent"
                  @click="startReply(comment)"
                >
                  Ответить
                </button>
                <button
                  v-if="canDeleteComment(comment)"
                  type="button"
                  class="text-xs text-red-500 transition hover:text-red-400"
                  @click="removeComment(comment.id)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="!commentLoading" class="mt-6 text-sm text-foreground/50">Пока нет комментариев</p>
        </div>
      </article>

      <AuthDrawer v-model="authOpen" :start-tab="authTab" />

      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="categoryGroups || []" />
      </aside>
    </div>
  </div>
</template>
