<script setup lang="ts">
const props = defineProps<{
  src: string;
  alt?: string;
  wrapperClass?: string;
  imgClass?: string;
}>();

const loaded = ref(false);
const imgRef = ref<HTMLImageElement | null>(null);

onMounted(() => {
  if (imgRef.value?.complete) {
    loaded.value = true;
  }
});
</script>

<template>
  <div class="relative overflow-hidden bg-foreground/10" :class="wrapperClass">
    <div
      v-if="!loaded"
      class="absolute inset-0 animate-pulse bg-foreground/10"
    />
    <NuxtImg
      ref="imgRef"
      :src="src"
      :alt="alt || ''"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition-opacity duration-700"
      :class="[loaded ? 'opacity-100' : 'opacity-0', imgClass]"
      @load="loaded = true"
    />
  </div>
</template>
