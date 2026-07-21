<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  item: ContentItem;
  typeLabel: string;
  typeRoute: string;
}>();

const { getLatestByCategory, getVideos, getReactions, react, getComments, createComment } = useApi();
const { user, isAuthenticated } = useAuth();
const viewerId = ref('');
const { data: categoryGroups } = await useAsyncData('latest-by-category-detail', () =>
  getLatestByCategory(10).catch(() => []),
);

const { data: relatedVideosList } = await useAsyncData(
  `related-videos-${props.item.id}`,
  () =>
    props.item.type === 'video'
      ? getVideos({ limit: 4 }).catch(() => ({ items: [] }))
      : Promise.resolve({ items: [] }),
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
const shareUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''));

const reactions = ref({ likes: 0, dislikes: 0, userReaction: null as 'like' | 'dislike' | null });
const comments = ref<any[]>([]);
const commentLoading = ref(false);
const commentError = ref('');
const commentSuccess = ref('');
const reactionError = ref('');
const readIds = ref<Set<string>>(new Set());

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
    commentError.value = 'Чтобы оставить комментарий, войдите в аккаунт';
    return;
  }
  if (!commentText.value.trim()) {
    commentError.value = 'Введите текст комментария';
    return;
  }
  commentLoading.value = true;
  try {
    await createComment(props.item.id, commentText.value.trim());
    commentText.value = '';
    commentSuccess.value = 'Комментарий отправлен';
    await loadComments();
  } catch (e: any) {
    commentError.value = e?.data?.message || 'Не удалось отправить комментарий';
  } finally {
    commentLoading.value = false;
  }
}

onMounted(() => {
  ensureViewerId();
  loadReadIds();
  markAsRead(props.item.id);
  loadReactions();
  loadComments();
});


function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = h > 0 ? [h, m, s] : [m, s];
  return parts.map((n) => String(n).padStart(2, '0')).join(':');
}

const bodyBlocks = computed(() => {
  const blocks = props.item.contentBlocks || [];
  if (props.item.type !== 'video') return blocks;
  return blocks.filter((b) => b?.type !== 'video-player');
});

const relatedItems = computed(() => {
  const currentId = props.item.id;
  const currentType = props.item.type;
  const excludeIds = new Set([currentId, ...readIds.value]);
  const typeFilter = (i: ContentItem) => !excludeIds.has(i.id);

  if (currentType === 'video') {
    const videos = (relatedVideosList.value?.items || []).filter(typeFilter);
    return videos.slice(0, 3);
  }

  const groups = categoryGroups.value || [];
  if (!groups.length) return [];
  const categoryId = props.item.categories?.[0]?.id;

  let items: ContentItem[] = [];
  if (categoryId) {
    const group = groups.find((g) => g.category.id === categoryId);
    if (group) items = group.items.filter(typeFilter);
  }
  if (items.length < 3) {
    const existingIds = new Set(items.map((i) => i.id));
    const allItems = groups.flatMap((g) => g.items).filter(typeFilter);
    for (const item of allItems) {
      if (!existingIds.has(item.id)) {
        items.push(item);
        if (items.length >= 3) break;
      }
    }
  }
  return items.slice(0, 3);
});

</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <article class="w-full lg:w-3/4">
        <!-- Breadcrumbs -->
        <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
          <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
          <span>/</span>
          <NuxtLink :to="typeRoute" class="hover:text-foreground">{{ typeLabel }}</NuxtLink>
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

        <AuthorByline v-if="item.author && item.type !== 'video'" :author="item.author" class="mt-4" />

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
          <figcaption v-if="item.duration" class="mt-2 text-xs text-foreground/50">
            Продолжительность: {{ formatDuration(item.duration) }}
          </figcaption>
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
        <div class="mt-8">
          <ContentBlocks v-if="bodyBlocks.length" :blocks="bodyBlocks" :item="item" />
          <p v-else-if="item.excerpt" class="text-lg leading-relaxed opacity-80">
            {{ item.excerpt }}
          </p>
        </div>

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
              <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25" />
              </svg>
              <span v-if="reactions.likes > 0" class="text-xl">{{ reactions.likes }}</span>
            </button>
            <button type="button" class="flex items-center gap-2 text-foreground/60 transition hover:text-foreground" aria-label="Комментарии">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-4">
            <ShareMenu :url="shareUrl" :title="item.title" />
          </div>
        </div>
        <p v-if="reactionError" class="mt-2 text-xs text-red-500">{{ reactionError }}</p>


        <!-- Related articles -->
        <div v-if="relatedItems.length" class="mt-10">
          <h2 class="mb-4 font-heading text-xl font-normal">Читайте также</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ArticleCard
              v-for="item in relatedItems"
              :key="item.id"
              :item="item"
              image-aspect="video"
              variant="compact"
            />
          </div>
        </div>

        <!-- Comments -->
        <div class="mt-10">
          <h2 class="mb-4 font-heading text-xl font-normal">Комментарии</h2>
          <div class="border border-foreground/10 bg-card p-4">
            <div class="relative">
              <textarea
                v-model="commentText"
                rows="4"
                placeholder="Поделитесь мнением о материале"
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
            </div>
          </div>
          <p v-else-if="!commentLoading" class="mt-6 text-sm text-foreground/50">Пока нет комментариев</p>
        </div>
      </article>

      <aside class="order-last flex w-full flex-col gap-4 lg:w-1/4">
        <SidebarByCategory :groups="categoryGroups || []" />
      </aside>
    </div>
  </div>
</template>
