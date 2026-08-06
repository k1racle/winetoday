<script setup lang="ts">
const props = defineProps<{
  targetType: 'person' | 'wine';
  targetId: string;
  slug: string;
  title: string;
}>();

const { user, isAuthenticated } = useAuth();
const { getEntityComments, createEntityComment, deleteEntityComment, incrementView } = useApi();

const commentText = ref('');
const comments = ref<any[]>([]);
const views = ref<number | null>(null);
const loading = ref(false);
const error = ref('');
const success = ref('');
const replyTo = ref<any | null>(null);
const authOpen = ref(false);
const authTab = ref<'login' | 'register'>('login');
const showAuthPrompt = ref(false);
const commentsSection = ref<HTMLDivElement | null>(null);
const commentTextarea = ref<HTMLTextAreaElement | null>(null);
const shareUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''));

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

const canDeleteComment = (comment: any) => {
  if (!user.value) return false;
  if (['admin', 'editor'].includes(user.value.role)) return true;
  return comment.userId && comment.userId === user.value.id;
};

async function loadComments() {
  try {
    comments.value = await getEntityComments(props.targetType, props.targetId);
  } catch {
    comments.value = [];
  }
}

async function trackView() {
  try {
    const result: any = await incrementView({
      contentType: props.targetType,
      contentId: props.targetId,
      slug: props.slug,
      viewerId: useViewerId(),
    });
    views.value = typeof result?.views === 'number' ? result.views : null;
  } catch {
    views.value = null;
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

async function submitComment() {
  error.value = '';
  success.value = '';

  if (!isAuthenticated.value) {
    showAuthPrompt.value = true;
    return;
  }

  if (!commentText.value.trim()) {
    error.value = 'Введите текст комментария';
    return;
  }

  loading.value = true;
  try {
    const body = replyTo.value
      ? `@${replyTo.value.author} ${commentText.value.trim()}`
      : commentText.value.trim();
    await createEntityComment(props.targetType, props.targetId, body);
    commentText.value = '';
    replyTo.value = null;
    success.value = 'Комментарий отправлен';
    await loadComments();
  } catch (err: any) {
    error.value = err?.data?.message || 'Не удалось отправить комментарий';
  } finally {
    loading.value = false;
  }
}

async function removeComment(commentId: string) {
  error.value = '';
  try {
    comments.value = await deleteEntityComment(props.targetType, props.targetId, commentId);
  } catch (err: any) {
    error.value = err?.data?.message || 'Не удалось удалить комментарий';
  }
}

onMounted(async () => {
  await Promise.all([loadComments(), trackView()]);
});
</script>

<template>
  <section ref="commentsSection" class="mt-12 border-t border-foreground/10 pt-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="font-heading text-2xl font-bold">Обсуждение</h2>
        <p class="mt-2 text-sm text-foreground/55">
          <span v-if="views !== null">Просмотры: {{ views }}</span>
          <span v-if="views !== null" class="mx-2">·</span>
          <span>Комментарии: {{ comments.length }}</span>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded border border-foreground/10 px-4 py-2 text-sm transition hover:border-accent hover:text-accent"
          @click="scrollToComments"
        >
          Написать комментарий
        </button>
        <ShareMenu :url="shareUrl" :title="title" />
      </div>
    </div>

    <div class="mt-6 border border-foreground/10 bg-card p-4">
      <div v-if="replyTo" class="mb-2 flex items-center justify-between text-xs text-foreground/70">
        <span>Ответ для <span class="text-foreground">@{{ replyTo.author }}</span></span>
        <button type="button" class="text-accent hover:underline" @click="cancelReply">Отменить</button>
      </div>

      <div class="relative">
        <textarea
          ref="commentTextarea"
          v-model="commentText"
          rows="4"
          :placeholder="replyTo ? `Ответ для @${replyTo.author}` : 'Поделитесь мнением о публикации'"
          maxlength="3000"
          class="w-full resize-none border border-foreground/10 bg-background p-3 pr-10 text-sm outline-none transition focus:border-accent"
        />
        <button
          type="button"
          class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded bg-accent text-black transition hover:bg-accent/90 disabled:opacity-60"
          :disabled="loading"
          :title="loading ? 'Отправка...' : 'Отправить'"
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
      <p v-if="error" class="mt-2 text-xs text-red-500">{{ error }}</p>
      <p v-if="showAuthPrompt" class="mt-2 text-xs text-foreground/70">
        Чтобы оставить комментарий,
        <button type="button" class="text-accent hover:underline" @click="openAuthLogin">войдите</button>
        или
        <button type="button" class="text-accent hover:underline" @click="openAuthRegister">зарегистрируйтесь</button>.
      </p>
      <p v-if="success" class="mt-2 text-xs text-green-500">{{ success }}</p>
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
    <p v-else class="mt-6 text-sm text-foreground/50">Пока нет комментариев</p>

    <AuthDrawer v-model="authOpen" :start-tab="authTab" />
  </section>
</template>
