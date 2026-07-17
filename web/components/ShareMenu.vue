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
      class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground"
      aria-label="Поделиться"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg class="h-5 w-5" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z"
          fill="currentColor"
        />
      </svg>
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
