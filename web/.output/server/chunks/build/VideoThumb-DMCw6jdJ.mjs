import { _ as __nuxt_component_0$1 } from './nuxt-link-M1kxXMe5.mjs';
import { _ as __nuxt_component_1 } from './NuxtImg-BJV0ypiM.mjs';
import { defineComponent, computed, mergeProps, withCtx, unref, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useMediaUrl } from './useMediaUrl-BBfhl7w5.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VideoThumb",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const props = __props;
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const duration = computed(() => {
      const block = props.item.contentBlocks?.find((b) => b.type === "video-player");
      return block?.duration;
    });
    function formatDuration(seconds) {
      if (!seconds) return "";
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/videos/${__props.item.slug}`,
        class: "group relative block w-64 shrink-0 overflow-hidden bg-card shadow-sm transition hover:shadow-md md:w-72"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="relative aspect-video overflow-hidden bg-foreground/10"${_scopeId}>`);
            if (unref(coverSrc)) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"${_scopeId}></div>`);
            if (unref(duration)) {
              _push2(`<span class="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white"${_scopeId}>${ssrInterpolate(formatDuration(unref(duration)))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="absolute inset-x-0 bottom-0 p-3"${_scopeId}><h4 class="line-clamp-2 font-heading text-sm font-bold leading-snug text-white"${_scopeId}>${ssrInterpolate(__props.item.title)}</h4></div></div>`);
          } else {
            return [
              createVNode("div", { class: "relative aspect-video overflow-hidden bg-foreground/10" }, [
                unref(coverSrc) ? (openBlock(), createBlock(_component_NuxtImg, {
                  key: 0,
                  src: unref(coverSrc),
                  alt: __props.item.coverMedia?.altText || __props.item.title,
                  class: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" }),
                unref(duration) ? (openBlock(), createBlock("span", {
                  key: 1,
                  class: "absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white"
                }, toDisplayString(formatDuration(unref(duration))), 1)) : createCommentVNode("", true),
                createVNode("div", { class: "absolute inset-x-0 bottom-0 p-3" }, [
                  createVNode("h4", { class: "line-clamp-2 font-heading text-sm font-bold leading-snug text-white" }, toDisplayString(__props.item.title), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoThumb.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "VideoThumb" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=VideoThumb-DMCw6jdJ.mjs.map
