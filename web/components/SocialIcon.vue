<script setup lang="ts">
import { computed } from 'vue';
import { getSocialIconUrl } from '~/utils/social-icons';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  href: {
    type: String,
    default: '',
  },
  inverted: {
    type: Boolean,
    default: false,
  },
});

const iconUrl = computed(() =>
  getSocialIconUrl(props.name, props.label, props.href),
);
</script>

<template>
  <span
    class="inline-flex h-5 w-5 items-center justify-center"
    aria-hidden="true"
  >
    <img
      v-if="iconUrl"
      :src="iconUrl"
      alt=""
      class="h-full w-full object-contain"
      :class="inverted ? 'brightness-0 invert' : ''"
    />
  </span>
</template>
