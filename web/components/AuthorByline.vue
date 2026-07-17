<script setup lang="ts">
import type { Author } from '~/types/content';

const props = defineProps<{
  author: Author;
  hideSubscribe?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', subscribed: boolean): void;
}>();

const { isAuthenticated } = useAuth();
const { getAuthorSubscription, subscribeToAuthor, unsubscribeFromAuthor } = useApi();
const route = useRoute();

const authorLink = computed(() => `/author/${props.author.slug}`);
const avatarSrc = computed(() => useMediaUrl(props.author.avatarMedia?.path));
const initials = computed(() => {
  const name = props.author.name || '';
  return name.trim().charAt(0).toUpperCase() || 'А';
});

const subscribed = ref(false);
const loading = ref(false);

async function loadSubscription() {
  if (!isAuthenticated.value || props.hideSubscribe) return;
  try {
    const res = await getAuthorSubscription(props.author.slug);
    subscribed.value = (res as any).subscribed || false;
  } catch {
    subscribed.value = false;
  }
}

async function toggleSubscribe() {
  if (!isAuthenticated.value) {
    navigateTo(`/account?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }
  loading.value = true;
  try {
    if (subscribed.value) {
      await unsubscribeFromAuthor(props.author.slug);
      subscribed.value = false;
      emit('change', false);
    } else {
      await subscribeToAuthor(props.author.slug);
      subscribed.value = true;
      emit('change', true);
    }
  } catch (err: any) {
    // silently ignore
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSubscription();
});
</script>

<template>
  <div class="flex items-center gap-3">
    <NuxtLink :to="authorLink" class="shrink-0">
      <div v-if="avatarSrc" class="h-10 w-10 overflow-hidden rounded-full">
        <NuxtImg
          :src="avatarSrc"
          :alt="author.name"
          class="h-full w-full object-cover"
        />
      </div>
      <div
        v-else
        class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-normal uppercase text-white"
      >
        {{ initials }}
      </div>
    </NuxtLink>
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span class="text-foreground/60">Автор:</span>
      <NuxtLink :to="authorLink" class="font-normal text-foreground hover:text-accent">
        {{ author.name }}
      </NuxtLink>
      <button
        v-if="!hideSubscribe"
        type="button"
        :disabled="loading"
        class="text-2xl text-accent transition hover:text-accent/80 disabled:opacity-60"
        @click="toggleSubscribe"
      >
        {{ subscribed ? 'Вы подписаны' : 'Подписаться' }}
      </button>
    </div>
  </div>
</template>
