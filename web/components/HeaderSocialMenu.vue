<script setup lang="ts">
interface SocialLink {
  icon?: string;
  label?: string;
  href: string;
}

const props = defineProps<{
  links: SocialLink[];
}>();

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);

function toggle() {
  open.value = !open.value;
}
function close() {
  open.value = false;
}

onClickOutside(panelRef, close, { ignore: [triggerRef] });
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="flex h-9 w-9 items-center justify-center text-foreground/60 transition hover:text-foreground"
      aria-label="Социальные сети"
      :aria-expanded="open"
      @click="toggle"
    >
      <IconMenu class="h-5 w-5" />
    </button>

    <Transition name="header-social-menu">
      <div
        v-if="open && links.length"
        ref="panelRef"
        class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-foreground/10 bg-card p-2 shadow-xl"
      >
        <ul class="space-y-1">
          <li v-for="link in links" :key="link.href + (link.label || '')">
            <a
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-accent/10"
              @click="close"
            >
              <SocialIcon
                :name="link.icon"
                :label="link.label"
                :href="link.href"
                variant="black"
                class="!h-6 !w-6 dark:hidden"
              />
              <SocialIcon
                :name="link.icon"
                :label="link.label"
                :href="link.href"
                variant="dark"
                class="hidden !h-6 !w-6 dark:block"
              />
              <span class="text-sm text-foreground">{{ link.label || link.href }}</span>
            </a>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.header-social-menu-enter-active,
.header-social-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.header-social-menu-enter-from,
.header-social-menu-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
