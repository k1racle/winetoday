<script setup lang="ts">
const props = defineProps<{
  url: string;
  title?: string;
}>();

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const copied = ref(false);

const encodedTitle = computed(() =>
  encodeURIComponent(props.title || (typeof document !== 'undefined' ? document.title : '')),
);
const encodedText = computed(() =>
  encodeURIComponent(
    `${props.title || (typeof document !== 'undefined' ? document.title : '')}\n${props.url}`,
  ),
);

function shareUrl(source: string, medium: string) {
  return appendUtm(props.url, source, medium);
}

const items = computed(() => [
  { id: 'copy', label: 'Скопировать ссылку', type: 'copy' as const },
  {
    id: 'max',
    label: 'MAX',
    type: 'link' as const,
    href: `https://max.ru/:share?text=${encodeURIComponent(`${props.title || (typeof document !== 'undefined' ? document.title : '')}\n${shareUrl('max', 'messenger')}`)}`,
    icon: 'max',
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    type: 'link' as const,
    href: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl('vk', 'social'))}&title=${encodedTitle.value}`,
    icon: 'vk',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    type: 'link' as const,
    href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl('telegram', 'messenger'))}&text=${encodedTitle.value}`,
    icon: 'telegram',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    type: 'link' as const,
    href: `https://wa.me/?text=${encodeURIComponent(`${props.title || (typeof document !== 'undefined' ? document.title : '')}\n${shareUrl('whatsapp', 'messenger')}`)}`,
    icon: 'whatsapp',
  },
  {
    id: 'ok',
    label: 'Одноклассники',
    type: 'link' as const,
    href: `https://connect.ok.ru/offer?url=${encodeURIComponent(shareUrl('ok', 'social'))}&title=${encodedTitle.value}`,
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
      <span class="text-base">Поделиться</span>
      <IconShare class="h-8 w-8" />
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
                <svg class="h-6 w-6" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
                    <path d="M3768 5104 c-393 -71 -712 -380 -793 -769 -24 -115 -22 -287 4 -395 11 -46 17 -87 13 -91 -14 -11 -1081 -619 -1088 -619 -3 0 -34 26 -68 57 -115 107 -259 185 -421 229 -94 25 -313 30 -416 9 -270 -54 -484 -196 -635 -421 -62 -94 -94 -162 -131 -283 -25 -79 -27 -100 -27 -261 0 -161 2 -182 27 -261 37 -121 69 -189 131 -283 187 -278 481 -436 815 -436 211 0 400 60 573 182 13 10 114 -44 611 -328 l595 -339 0 -115 c1 -134 20 -241 66 -356 170 -428 628 -688 1072 -610 389 69 692 343 794 721 31 114 38 313 16 425 -79 390 -346 677 -722 777 -84 22 -120 26 -239 26 -149 0 -229 -13 -347 -56 -155 -56 -325 -180 -426 -312 -30 -39 -58 -71 -62 -73 -7 -3 -1035 579 -1049 593 -2 3 7 31 21 62 82 187 103 393 59 578 -12 49 -18 91 -14 93 4 1 251 142 547 311 l540 309 60 -55 c356 -321 871 -348 1252 -65 200 149 327 353 380 612 22 112 15 311 -16 425 -42 154 -122 299 -230 418 -222 242 -570 359 -892 301z m307 -396 c154 -32 317 -161 389 -308 85 -175 85 -355 1 -528 -68 -138 -200 -250 -349 -298 -137 -43 -314 -31 -435 31 -119 60 -224 166 -277 280 -82 174 -67 405 37 565 140 216 376 313 634 258z m-2703 -1591 c156 -57 269 -158 337 -300 45 -95 61 -161 61 -257 0 -96 -16 -162 -61 -257 -167 -350 -628 -442 -921 -183 -65 57 -140 172 -169 261 -19 59 -24 95 -24 179 0 131 27 221 97 326 83 124 196 206 339 244 102 28 246 22 341 -13z m2768 -1579 c226 -83 390 -314 390 -553 0 -265 -200 -516 -460 -575 -292 -68 -603 109 -693 395 -31 99 -31 261 0 360 69 218 271 382 498 404 86 9 190 -4 265 -31z"/>
                  </g>
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
