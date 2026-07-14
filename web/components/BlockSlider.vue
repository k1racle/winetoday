<script setup lang="ts">
const props = defineProps<{
  items: any[];
}>();

const current = ref(0);
const container = ref<HTMLElement>();
let touchStartX = 0;

const total = computed(() => props.items.length);

function go(index: number) {
  if (index < 0) current.value = total.value - 1;
  else if (index >= total.value) current.value = 0;
  else current.value = index;
}

function next() {
  go(current.value + 1);
}

function prev() {
  go(current.value - 1);
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX;
}

function onTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0].screenX;
  const diff = touchStartX - endX;
  if (Math.abs(diff) > 40) {
    diff > 0 ? next() : prev();
  }
}
</script>

<template>
  <div>
    <div
      ref="container"
      class="group relative overflow-hidden rounded bg-black/5 aspect-video"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
    <div
      class="flex h-full transition-transform duration-300 ease-out"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div
        v-for="(item, i) in items"
        :key="i"
        class="relative h-full w-full flex-shrink-0"
      >
        <img
          v-if="item.path"
          :src="useMediaUrl(item.path)"
          :alt="item.source || ''"
          class="h-full w-full object-cover"
        >
      </div>
    </div>

    <template v-if="total > 1">
      <button
        type="button"
        aria-label="Предыдущий слайд"
        class="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 focus:opacity-100 group-hover:opacity-100"
        @click="prev"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Следующий слайд"
        class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 focus:opacity-100 group-hover:opacity-100"
        @click="next"
      >
        ›
      </button>

      <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        <button
          v-for="(_, i) in items"
          :key="i"
          type="button"
          class="h-2 w-2 rounded-full transition"
          :class="i === current ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
          :aria-label="`Перейти к слайду ${i + 1}`"
          @click="go(i)"
        />
      </div>
    </template>
  </div>

  <div
    v-if="items[current]?.source"
    class="mt-2 text-xs text-foreground/60"
  >
    {{ items[current].source }}
  </div>
  </div>
</template>
