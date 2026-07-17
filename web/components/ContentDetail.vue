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
const { data: categoryGroups } = await useAsyncData('latest-by-category', () =>
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

function editUrl(item: ContentItem) {
  return `/account?type=${item.type}&id=${item.id}`;
}
const commentText = ref('');
const shareMessage = ref('');

const reactions = ref({ likes: 0, dislikes: 0, userReaction: null as 'like' | 'dislike' | null });
const comments = ref<any[]>([]);
const commentLoading = ref(false);
const commentError = ref('');
const commentSuccess = ref('');
const reactionError = ref('');

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
  loadReactions();
  loadComments();
});

function shareItem() {
  const { open } = useShare();
  open(window.location.href, props.item.title || document.title);
}

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

  if (currentType === 'video') {
    const videos = (relatedVideosList.value?.items || []).filter((i: ContentItem) => i.id !== currentId);
    return videos.slice(0, 3);
  }

  const groups = categoryGroups.value || [];
  if (!groups.length) return [];
  const categoryId = props.item.categories?.[0]?.id;
  const typeFilter = (i: ContentItem) => i.id !== currentId;

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
    <div class="grid gap-8 lg:grid-cols-4">
      <article class="lg:col-span-3">
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
              class="flex items-center gap-1.5 transition"
              :class="reactions.userReaction === 'like' ? 'text-green-500 hover:text-green-400' : 'text-foreground/60 hover:text-foreground'"
              aria-label="Нравится"
              @click="toggleReaction('like')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25" />
              </svg>
              <span v-if="reactions.likes > 0" class="text-sm">{{ reactions.likes }}</span>
            </button>
            <button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Комментарии">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex items-center gap-1.5 transition"
              :class="reactions.userReaction === 'dislike' ? 'text-red-500 hover:text-red-400' : 'text-foreground/60 hover:text-foreground'"
              aria-label="Не нравится"
              @click="toggleReaction('dislike')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.49809 15.25H4.37227C3.34564 15.25 2.4267 14.556 2.31801 13.5351C2.27306 13.1129 2.25 12.6841 2.25 12.25C2.25 9.40238 3.24188 6.78642 4.899 4.72878C5.2866 4.24749 5.88581 4 6.50377 4L10.5198 4C11.0034 4 11.4839 4.07798 11.9428 4.23093L15.0572 5.26908C15.5161 5.42203 15.9966 5.5 16.4803 5.5L17.7745 5.5M7.49809 15.25C8.11638 15.25 8.48896 15.974 8.22337 16.5323C7.75956 17.5074 7.5 18.5984 7.5 19.75C7.5 20.9926 8.50736 22 9.75 22C10.1642 22 10.5 21.6642 10.5 21.25V20.6166C10.5 20.0441 10.6092 19.4769 10.8219 18.9454C11.1257 18.1857 11.7523 17.6144 12.4745 17.2298C13.5883 16.6366 14.5627 15.8162 15.3359 14.8303C15.8335 14.1958 16.5611 13.75 17.3674 13.75H17.7511M17.7745 5.5C17.7851 5.55001 17.802 5.59962 17.8258 5.6478C18.4175 6.84708 18.75 8.19721 18.75 9.625C18.75 11.1117 18.3895 12.5143 17.7511 13.75M17.7745 5.5C17.6975 5.13534 17.9575 4.75 18.3493 4.75H19.2571C20.1458 4.75 20.9701 5.26802 21.2294 6.11804C21.5679 7.22737 21.75 8.40492 21.75 9.625C21.75 11.1775 21.4552 12.6611 20.9185 14.0229C20.6135 14.797 19.8327 15.25 19.0006 15.25H17.9479C17.476 15.25 17.2027 14.6941 17.4477 14.2907C17.5548 14.1144 17.6561 13.934 17.7511 13.75" />
              </svg>
            </button>
            <button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Поделиться" @click="shareItem">
              <svg class="h-5 w-5" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        <p v-if="reactionError" class="mt-2 text-xs text-red-500">{{ reactionError }}</p>
        <p v-if="shareMessage" class="mt-2 text-xs text-foreground/60">{{ shareMessage }}</p>

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
              class="h-[320px]"
            />
          </div>
        </div>

        <!-- Comments -->
        <div class="mt-10">
          <h2 class="mb-4 font-heading text-xl font-normal">Комментарии</h2>
          <div class="border border-foreground/10 bg-card p-4">
            <textarea
              v-model="commentText"
              rows="4"
              placeholder="Поделитесь мнением о материале"
              maxlength="3000"
              class="w-full resize-none border border-foreground/10 bg-card p-3 text-sm outline-none transition focus:border-accent"
            />
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs text-foreground/50">{{ commentText.length }} / 3000</span>
              <button
                type="button"
                class="rounded bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-60"
                :disabled="commentLoading"
                @click="submitComment"
              >
                {{ commentLoading ? 'Отправка...' : 'Отправить' }}
              </button>
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

      <aside class="lg:col-span-1">
        <SidebarByCategory :groups="categoryGroups || []" />
      </aside>
    </div>
  </div>
</template>
