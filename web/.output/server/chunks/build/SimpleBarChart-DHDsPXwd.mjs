import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const ticks = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SimpleBarChart",
  __ssrInlineRender: true,
  props: {
    data: {},
    color: {},
    height: {}
  },
  setup(__props) {
    const props = __props;
    const height = computed(() => props.height || 200);
    const padding = { top: 10, right: 10, bottom: 40, left: 40 };
    const maxValue = computed(() => {
      const max = Math.max(...props.data.map((d) => d.value), 0);
      if (max === 0) return ticks;
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
    function barX(index) {
      if (!props.data.length) return 0;
      const step = plotWidth.value / props.data.length;
      return padding.left + step * index + step / 2 - barWidth.value / 2;
    }
    function barHeight(value) {
      return value / maxValue.value * plotHeight.value;
    }
    function barY(value) {
      return padding.top + plotHeight.value - barHeight(value);
    }
    function yAxisTicks() {
      const arr = [];
      for (let i = 0; i <= ticks; i++) {
        arr.push(Math.round(maxValue.value / ticks * i));
      }
      return arr;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full overflow-x-auto" }, _attrs))}>`);
      if (__props.data.length) {
        _push(`<svg${ssrRenderAttr("viewBox", `0 0 ${unref(chartWidth)} ${unref(chartHeight)}`)} preserveAspectRatio="none" class="h-full w-full" style="${ssrRenderStyle({ "min-width": "100%" })}"><!--[-->`);
        ssrRenderList(yAxisTicks(), (tick) => {
          _push(`<line${ssrRenderAttr("x1", padding.left)}${ssrRenderAttr("x2", unref(chartWidth) - padding.right)}${ssrRenderAttr("y1", barY(tick))}${ssrRenderAttr("y2", barY(tick))} stroke="currentColor" stroke-opacity="0.1" stroke-width="1"></line>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(yAxisTicks(), (tick) => {
          _push(`<text${ssrRenderAttr("x", padding.left - 6)}${ssrRenderAttr("y", barY(tick) + 4)} text-anchor="end" class="fill-current text-[10px]">${ssrInterpolate(tick)}</text>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(__props.data, (d, i) => {
          _push(`<rect${ssrRenderAttr("x", barX(i))}${ssrRenderAttr("y", barY(d.value))}${ssrRenderAttr("width", unref(barWidth))}${ssrRenderAttr("height", barHeight(d.value))}${ssrRenderAttr("fill", __props.color || "currentColor")} class="opacity-80" rx="2"><title>${ssrInterpolate(d.title || `${d.label}: ${d.value}`)}</title></rect>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(__props.data, (d, i) => {
          _push(`<text${ssrRenderAttr("x", barX(i) + unref(barWidth) / 2)}${ssrRenderAttr("y", unref(chartHeight) - 12)} text-anchor="end" class="fill-current text-[9px]"${ssrRenderAttr("transform", `rotate(-45, ${barX(i) + unref(barWidth) / 2}, ${unref(chartHeight) - 12})`)}>${ssrInterpolate(d.label)}</text>`);
        });
        _push(`<!--]--></svg>`);
      } else {
        _push(`<p class="text-sm text-foreground/60">Нет данных для графика</p>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SimpleBarChart.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "SimpleBarChart" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=SimpleBarChart-DHDsPXwd.mjs.map
