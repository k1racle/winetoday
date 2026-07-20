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
      <span class="text-sm">Поделиться</span>
      <svg class="h-8 w-8" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
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
