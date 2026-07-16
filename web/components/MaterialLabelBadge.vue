<script setup lang="ts">
const props = defineProps<{
  label?: string | null;
  type?: 'article' | 'news' | 'video' | 'gallery';
}>();

interface BadgeConfig {
  text: string;
  classes: string;
  icon?: string;
}

const config = computed<BadgeConfig | null>(() => {
  const effective = props.label || (props.type === 'video' ? 'video' : props.type === 'gallery' ? 'photo' : null);
  switch (effective) {
    case 'important':
      return {
        text: 'Важное',
        classes: 'bg-[#EF4444] text-white',
        icon: 'bolt',
      };
    case 'exclusive':
      return {
        text: 'Эксклюзив',
        classes: 'bg-[#D9F99D] text-[#064E3B]',
        icon: 'star',
      };
    case 'trends':
    case 'hot':
      return {
        text: 'Тренды',
        classes: 'bg-[#86EFAC] text-[#064E3B]',
        icon: 'trend',
      };
    case 'photo':
      return {
        text: 'Фото',
        classes: 'bg-[#4ADE80] text-[#064E3B]',
        icon: 'camera',
      };
    case 'video':
      return {
        text: 'Видео',
        classes: 'bg-[#4ADE80] text-[#064E3B]',
        icon: 'play',
      };
    default:
      return null;
  }
});
</script>

<template>
  <span
    v-if="config"
    class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-normal uppercase tracking-wide"
    :class="config.classes"
  >
    <svg
      v-if="config.icon === 'bolt'"
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
    <svg
      v-else-if="config.icon === 'star'"
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006Z" clip-rule="evenodd" />
    </svg>
    <svg
      v-else-if="config.icon === 'trend'"
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8-8 8-4-4-6 6" />
    </svg>
    <svg
      v-else-if="config.icon === 'camera'"
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
      <path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.507 2.429 2.943v5.714c0 1.436-.997 2.704-2.429 2.943-.382.064-.766.123-1.151.178a1.856 1.856 0 0 0-1.11.712l-.822 1.315a2.51 2.51 0 0 1-2.331 1.39 49.52 49.52 0 0 1-5.312 0 2.51 2.51 0 0 1-2.33-1.39l-.823-1.315a1.856 1.856 0 0 0-1.11-.712c-.385-.055-.77-.114-1.15-.178C2.978 17.49 2 16.22 2 14.786V9.071c0-1.436.978-2.704 2.411-2.943.382-.064.766-.123 1.151-.178a1.856 1.856 0 0 0 1.11-.712l.823-1.315a2.51 2.51 0 0 1 2.33-1.39Z" clip-rule="evenodd" />
    </svg>
    <svg
      v-else-if="config.icon === 'play'"
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
    {{ config.text }}
  </span>
</template>
