<script setup lang="ts">
import type { ContentItem } from '~/types/content';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  item: ContentItem;
  typeLabel: string;
  typeRoute: string;
}>();

const { getLatestByCategory, getReactions, react, getComments, createComment } = useApi();
const { user, isAuthenticated } = useAuth();
const viewerId = ref('');
const { data: categoryGroups } = await useAsyncData('latest-by-category', () =>
  getLatestByCategory(5).catch(() => []),
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

async function shareItem() {
  const url = window.location.href;
  const title = props.item.title || document.title;
  shareMessage.value = '';
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      shareMessage.value = 'Ссылка скопирована';
      setTimeout(() => (shareMessage.value = ''), 2000);
      return;
    }
    shareMessage.value = 'Не удалось поделиться';
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    shareMessage.value = 'Не удалось поделиться';
  }
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = h > 0 ? [h, m, s] : [m, s];
  return parts.map((n) => String(n).padStart(2, '0')).join(':');
}

const relatedItems = computed(() => {
  const groups = categoryGroups.value || [];
  if (!groups.length) return [];
  const currentId = props.item.id;
  const currentType = props.item.type;
  const categoryId = props.item.categories?.[0]?.id;
  const typeFilter = (i: ContentItem) => i.id !== currentId && (currentType !== 'video' || i.type === 'video');

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
        <nav class="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/50">
          <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
          <span>/</span>
          <NuxtLink :to="typeRoute" class="hover:text-foreground">{{ typeLabel }}</NuxtLink>
        </nav>

        <!-- Title -->
        <h1 class="font-heading text-3xl font-bold leading-tight md:text-4xl">
          {{ item.title }}
        </h1>

        <NuxtLink
          v-if="canEdit"
          :to="editUrl(item)"
          class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Редактировать
        </NuxtLink>

        <!-- Video player -->
        <figure v-if="item.type === 'video' && item.videoUrl" class="mt-6">
          <div class="aspect-video w-full overflow-hidden bg-black">
            <iframe
              :src="item.videoUrl"
              class="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
              :title="item.title || 'Видео'"
            />
          </div>
          <figcaption v-if="item.duration" class="mt-2 text-xs text-foreground/50">
            Продолжительность: {{ formatDuration(item.duration) }}
          </figcaption>
        </figure>

        <!-- Cover image (hidden for videos so the player appears immediately) -->
        <figure v-else-if="coverSrc && item.type !== 'video'" class="mt-6">
          <NuxtImg
            :src="coverSrc"
            :alt="item.coverMedia?.altText || item.title"
            class="aspect-video w-full object-cover"
          />
          <figcaption v-if="item.coverSource" class="mt-2 text-xs font-medium uppercase tracking-wider text-foreground/50">
            Источник: {{ item.coverSource }}
          </figcaption>
        </figure>

        <!-- Content -->
        <div class="mt-8">
          <ContentBlocks v-if="item.contentBlocks?.length" :blocks="item.contentBlocks" :item="item" />
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
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5C6.25736 8.25 5.25 9.25736 5.25 10.5V19.5C5.25 20.7426 6.25736 21.75 7.5 21.75H16.5C17.7426 21.75 18.75 20.7426 18.75 19.5V10.5C18.75 9.25736 17.7426 8.25 16.5 8.25H15M15 5.25L12 2.25M12 2.25L9 5.25M12 2.25L12 15" />
              </svg>
            </button>
          </div>
        </div>
        <p v-if="reactionError" class="mt-2 text-xs text-red-500">{{ reactionError }}</p>
        <p v-if="shareMessage" class="mt-2 text-xs text-foreground/60">{{ shareMessage }}</p>

        <!-- Related articles -->
        <div v-if="relatedItems.length" class="mt-10">
          <h2 class="mb-4 font-heading text-xl font-bold">Читайте также</h2>
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
          <h2 class="mb-4 font-heading text-xl font-bold">Комментарии</h2>
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
                class="rounded bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-60"
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
                <span class="font-medium text-foreground">{{ comment.author }}</span>
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
