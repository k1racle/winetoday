<script setup lang="ts">
interface DataPoint {
  label: string;
  value: number;
  title?: string;
}

const props = defineProps<{
  data: DataPoint[];
  color?: string;
  height?: number;
}>();

const height = computed(() => props.height || 200);
const padding = { top: 10, right: 10, bottom: 40, left: 40 };

const ticks = 5;

const maxValue = computed(() => {
  const max = Math.max(...props.data.map((d) => d.value), 0);
  if (max === 0) return ticks;
  // Round max up to the next multiple of the tick count so Y-axis labels
  // are evenly spaced integers (no skipped values like 3, 4, 6, 7).
  return Math.ceil(max / ticks) * ticks;
});

const chartWidth = computed(() => Math.max(props.data.length * 32, 320));
const chartHeight = computed(() => height.value);
const plotWidth = computed(() => chartWidth.value - padding.left - padding.right);
const plotHeight = computed(() => chartHeight.value - padding.top - padding.bottom);

const barWidth = computed(() => {
  if (!props.data.length) return 0;
  return Math.max(4, Math.min(32, plotWidth.value / props.data.length - 4));
});

function barX(index: number) {
  if (!props.data.length) return 0;
  const step = plotWidth.value / props.data.length;
  return padding.left + step * index + step / 2 - barWidth.value / 2;
}

function barHeight(value: number) {
  return (value / maxValue.value) * plotHeight.value;
}

function barY(value: number) {
  return padding.top + plotHeight.value - barHeight(value);
}

function yAxisTicks() {
  const arr: number[] = [];
  for (let i = 0; i <= ticks; i++) {
    arr.push(Math.round((maxValue.value / ticks) * i));
  }
  return arr;
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      v-if="data.length"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="none"
      class="h-full w-full"
      style="min-width: 100%"
    >
      <!-- Grid lines -->
      <line
        v-for="tick in yAxisTicks()"
        :key="`grid-${tick}`"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="barY(tick)"
        :y2="barY(tick)"
        stroke="currentColor"
        stroke-opacity="0.1"
        stroke-width="1"
      />

      <!-- Y-axis labels -->
      <text
        v-for="tick in yAxisTicks()"
        :key="`label-${tick}`"
        :x="padding.left - 6"
        :y="barY(tick) + 4"
        text-anchor="end"
        class="fill-current text-[10px]"
      >
        {{ tick }}
      </text>

      <!-- Bars -->
      <rect
        v-for="(d, i) in data"
        :key="i"
        :x="barX(i)"
        :y="barY(d.value)"
        :width="barWidth"
        :height="barHeight(d.value)"
        :fill="color || 'currentColor'"
        class="opacity-80"
        rx="2"
      >
        <title>{{ d.title || `${d.label}: ${d.value}` }}</title>
      </rect>

      <!-- X-axis labels -->
      <text
        v-for="(d, i) in data"
        :key="`x-${i}`"
        :x="barX(i) + barWidth / 2"
        :y="chartHeight - 12"
        text-anchor="end"
        class="fill-current text-[9px]"
        :transform="`rotate(-45, ${barX(i) + barWidth / 2}, ${chartHeight - 12})`"
      >
        {{ d.label }}
      </text>
    </svg>
    <p v-else class="text-sm text-foreground/60">Нет данных для графика</p>
  </div>
</template>
