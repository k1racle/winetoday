<script setup lang="ts">
const { active, url, title, close } = useShare();
const copied = ref(false);

const encodedUrl = computed(() => encodeURIComponent(url.value));
const encodedTitle = computed(() => encodeURIComponent(title.value || document.title));
const encodedText = computed(() => encodeURIComponent(`${title.value || document.title}\n${url.value}`));

const networks = computed(() => [
  {
    id: 'telegram',
    name: 'Telegram',
    href: `https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`,
    icon: 'telegram',
  },
  {
    id: 'vk',
    name: 'ВКонтакте',
    href: `https://vk.com/share.php?url=${encodedUrl.value}&title=${encodedTitle.value}`,
    icon: 'vk',
  },
  {
    id: 'max',
    name: 'Макс',
    href: `https://max.ru/:share?text=${encodedText.value}`,
    icon: 'max',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: `https://www.instagram.com/`,
    icon: 'instagram',
  },
  {
    id: 'x',
    name: 'X',
    href: `https://twitter.com/intent/tweet?url=${encodedUrl.value}&text=${encodedTitle.value}`,
    svg: true,
  },
  {
    id: 'email',
    name: 'Email',
    href: `mailto:?subject=${encodedTitle.value}&body=${encodedText.value}`,
    svg: true,
  },
]);

async function copyLink() {
  if (!url.value) return;
  try {
    await navigator.clipboard.writeText(url.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // ignore
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="active"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="font-heading text-lg font-normal">Поделиться</h3>
            <button
              type="button"
              class="text-foreground/60 transition hover:text-foreground"
              aria-label="Закрыть"
              @click="close"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <a
              v-for="net in networks"
              :key="net.id"
              :href="net.href"
              target="_blank"
              rel="noopener"
              class="flex flex-col items-center gap-2 rounded-lg border border-foreground/10 p-3 transition hover:border-accent hover:bg-accent/5"
              @click="close"
            >
              <SocialIcon
                v-if="!net.svg"
                :name="net.icon"
                :label="net.name"
                :href="net.href"
                variant="black"
                class="h-7 w-7 dark:hidden"
              />
              <SocialIcon
                v-if="!net.svg"
                :name="net.icon"
                :label="net.name"
                :href="net.href"
                variant="dark"
                class="hidden h-7 w-7 dark:block"
              />
              <template v-else-if="net.id === 'x'">
                <svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </template>
              <template v-else-if="net.id === 'email'">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </template>
              <span class="text-xs text-foreground/80">{{ net.name }}</span>
            </a>

            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-lg border border-foreground/10 p-3 transition hover:border-accent hover:bg-accent/5"
              @click="copyLink"
            >
              <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184m-1.927-.184-.001.009M9 3.888l.001.009M18.5 9.5H19a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 19 21.75H5a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 5 9.5h.5m13 0v-1.25a2.25 2.25 0 0 0-2.25-2.25h-9a2.25 2.25 0 0 0-2.25 2.25v1.25m13 0h-13" />
              </svg>
              <span class="text-xs text-foreground/80">{{ copied ? 'Скопировано' : 'Ссылка' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
