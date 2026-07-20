<script setup lang="ts">
const props = defineProps<{
  url: string;
  title?: string;
}>();

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const copied = ref(false);

const encodedUrl = computed(() => encodeURIComponent(props.url));
const encodedTitle = computed(() =>
  encodeURIComponent(props.title || (typeof document !== 'undefined' ? document.title : '')),
);
const encodedText = computed(() =>
  encodeURIComponent(
    `${props.title || (typeof document !== 'undefined' ? document.title : '')}\n${props.url}`,
  ),
);

const items = computed(() => [
  { id: 'copy', label: 'Скопировать ссылку', type: 'copy' as const },
  {
    id: 'max',
    label: 'MAX',
    type: 'link' as const,
    href: `https://max.ru/:share?text=${encodedText.value}`,
    icon: 'max',
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    type: 'link' as const,
    href: `https://vk.com/share.php?url=${encodedUrl.value}&title=${encodedTitle.value}`,
    icon: 'vk',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    type: 'link' as const,
    href: `https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`,
    icon: 'telegram',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    type: 'link' as const,
    href: `https://wa.me/?text=${encodedText.value}`,
    icon: 'whatsapp',
  },
  {
    id: 'ok',
    label: 'Одноклассники',
    type: 'link' as const,
    href: `https://connect.ok.ru/offer?url=${encodedUrl.value}&title=${encodedTitle.value}`,
    icon: 'ok',
  },
]);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

async function copyLink() {
  if (!props.url) return;
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // ignore
  }
  close();
}

onClickOutside(panelRef, close, { ignore: [triggerRef] });
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="flex items-center gap-2 text-foreground/60 transition hover:text-foreground"
      aria-label="Поделиться"
      :aria-expanded="open"
      @click="toggle"
    >
      <img src="/icons/share.png" alt="" class="h-8 w-8" />
    </button>

    <Transition name="share-menu">
      <div
        v-if="open"
        ref="panelRef"
        class="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-foreground/10 bg-card p-2 shadow-xl"
      >
        <ul class="space-y-1">
          <li v-for="item in items" :key="item.id">
            <button
              v-if="item.type === 'copy'"
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-accent/10"
              @click="copyLink"
            >
              <span class="flex h-7 w-7 items-center justify-center text-foreground">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184m-1.927-.184-.001.009M9 3.888l.001.009M18.5 9.5H19a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 19 21.75H5a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 5 9.5h.5m13 0v-1.25a2.25 2.25 0 0 0-2.25-2.25h-9a2.25 2.25 0 0 0-2.25 2.25v1.25m13 0h-13"
                  />
                </svg>
              </span>
              <span class="text-sm text-foreground">{{ copied ? 'Скопировано' : item.label }}</span>
            </button>
            <a
              v-else
              :href="item.href"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-accent/10"
              @click="close"
            >
              <SocialIcon
                :name="item.icon"
                :label="item.label"
                :href="item.href"
                variant="black"
                class="!h-7 !w-7 dark:hidden"
              />
              <SocialIcon
                :name="item.icon"
                :label="item.label"
                :href="item.href"
                variant="dark"
                class="hidden !h-7 !w-7 dark:block"
              />
              <span class="text-sm text-foreground">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.share-menu-enter-active,
.share-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.share-menu-enter-from,
.share-menu-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
