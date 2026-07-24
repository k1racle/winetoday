<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  startTab?: 'login' | 'register';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { signIn, signUp } = useAuth();

const activeTab = ref<'login' | 'register'>('login');

watch(() => props.modelValue, (open) => {
  if (open && props.startTab) {
    activeTab.value = props.startTab;
  }
});

function socialUrl(provider: 'vk' | 'yandex') {
  const redirect = typeof window !== 'undefined' ? window.location.href : '';
  return `/api/auth/${provider}?redirect=${encodeURIComponent(redirect)}`;
}

const username = ref('');
const displayName = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

function close() {
  isOpen.value = false;
  error.value = '';
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close();
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submit() {
  error.value = '';

  if (activeTab.value === 'register') {
    if (!username.value.trim() || username.value.trim().length < 3) {
      error.value = 'Логин должен содержать не менее 3 символов';
      return;
    }
    if (displayName.value.trim() && displayName.value.trim().length < 2) {
      error.value = 'Отображаемое имя должно содержать не менее 2 символов';
      return;
    }
  }

  if (!email.value.trim()) {
    error.value = activeTab.value === 'login'
      ? 'Введите логин или email'
      : 'Введите email';
    return;
  }
  if (activeTab.value === 'register' && !emailRegex.test(email.value.trim())) {
    error.value = 'Введите корректный email';
    return;
  }
  if (!password.value) {
    error.value = 'Введите пароль';
    return;
  }
  if (activeTab.value === 'register' && password.value.length < 6) {
    error.value = 'Пароль должен содержать не менее 6 символов';
    return;
  }

  loading.value = true;
  try {
    if (activeTab.value === 'login') {
      await signIn(email.value.trim(), password.value);
    } else {
      await signUp({
        username: username.value.trim(),
        displayName: displayName.value.trim() || undefined,
        email: email.value.trim(),
        password: password.value,
      });
      await signIn(email.value.trim(), password.value);
    }
    username.value = '';
    displayName.value = '';
    email.value = '';
    password.value = '';
    close();
    navigateTo('/account');
  } catch (err: any) {
    const backendMessage = err?.data?.message || err?.message || '';
    if (backendMessage.includes('Invalid credentials')) {
      error.value = 'Неверный email или пароль';
    } else if (backendMessage.includes('Email already registered')) {
      error.value = 'Этот email уже зарегистрирован';
    } else if (backendMessage.includes('Username already taken')) {
      error.value = 'Этот логин уже занят';
    } else {
      error.value = backendMessage || 'Ошибка входа. Проверьте данные.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="auth-backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/50"
        @click="onBackdropClick"
      >
        <Transition name="auth-drawer">
          <div
            v-if="isOpen"
            class="absolute right-0 top-0 h-full w-full max-w-md bg-card p-6 shadow-xl"
          >
            <div class="mb-6 flex items-start justify-between">
              <div>
                <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Аккаунт</p>
                <h2 class="mt-1 font-heading text-xl font-normal">Личный кабинет</h2>
              </div>
              <button
                type="button"
                class="text-foreground/50 transition hover:text-foreground"
                aria-label="Закрыть"
                @click="close"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Tabs -->
            <div class="mb-4 inline-flex border border-foreground/10">
              <button
                type="button"
                class="px-4 py-2 text-sm font-normal transition"
                :class="activeTab === 'login' ? 'bg-accent text-white' : 'bg-card text-foreground hover:bg-foreground/5'"
                @click="activeTab = 'login'"
              >
                Вход
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-normal transition"
                :class="activeTab === 'register' ? 'bg-accent text-white' : 'bg-card text-foreground hover:bg-foreground/5'"
                @click="activeTab = 'register'"
              >
                Регистрация
              </button>
            </div>

            <!-- Social login -->
            <div class="mb-4 space-y-2">
              <a
                :href="socialUrl('vk')"
                class="flex w-full items-center justify-center gap-2 rounded bg-[#0077FF] px-4 py-2.5 text-sm font-normal text-white transition hover:bg-[#0066dd]"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.624 10.857 4 8.946 4 8.522c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.456 2.274 4.607 2.862 4.607.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
                Войти через VK
              </a>
              <a
                :href="socialUrl('yandex')"
                class="flex w-full items-center justify-center gap-2 rounded bg-[#FC3F1D] px-4 py-2.5 text-sm font-normal text-white transition hover:bg-[#e63617]"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.6h-2.15l-3.213-6.14v6.14h-1.96V6.4h2.15l3.213 6.14V6.4h1.96v11.2z"/>
                </svg>
                Войти через Яндекс
              </a>
            </div>

            <div class="mb-4 flex items-center gap-3">
              <span class="h-px flex-1 bg-foreground/10"></span>
              <span class="text-xs text-foreground/50">или</span>
              <span class="h-px flex-1 bg-foreground/10"></span>
            </div>

            <form class="space-y-4" @submit.prevent="submit">
              <template v-if="activeTab === 'register'">
                <div>
                  <label class="mb-1.5 block text-sm font-normal">Логин</label>
                  <input
                    v-model="username"
                    type="text"
                    placeholder="username"
                    class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-normal">Отображаемое имя</label>
                  <input
                    v-model="displayName"
                    type="text"
                    placeholder="Как вас показывать на сайте"
                    class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                  >
                </div>
              </template>
              <div>
                <label class="mb-1.5 block text-sm font-normal">{{ activeTab === 'login' ? 'Логин или email' : 'Email' }}</label>
                <input
                  v-model="email"
                  type="text"
                  :placeholder="activeTab === 'login' ? 'admin или you@example.com' : 'you@example.com'"
                  class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-normal">Пароль</label>
                <input
                  v-model="password"
                  type="password"
                  :placeholder="activeTab === 'register' ? 'Минимум 6 символов' : '•••••••'"
                  class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                >
              </div>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-accent px-4 py-2.5 text-sm font-normal text-white transition hover:bg-accent/90 disabled:opacity-60"
              >
                {{ activeTab === 'login' ? (loading ? 'Вход...' : 'Войти') : (loading ? 'Регистрация...' : 'Зарегистрироваться') }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-backdrop-enter-active,
.auth-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.auth-backdrop-enter-from,
.auth-backdrop-leave-to {
  opacity: 0;
}

.auth-drawer-enter-active,
.auth-drawer-leave-active {
  transition: transform 0.25s ease;
}
.auth-drawer-enter-from,
.auth-drawer-leave-to {
  transform: translateX(100%);
}
</style>
