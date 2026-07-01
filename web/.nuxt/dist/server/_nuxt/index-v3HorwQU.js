import { _ as __nuxt_component_0 } from "./VideoThumb-DMCw6jdJ.js";
import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import { u as useApi } from "./useApi-DkRD3FHh.js";
import { u as useAsyncData } from "./NuxtImg-BJV0ypiM.js";
import { a as useSeoMeta } from "../server.mjs";
import "./nuxt-link-M1kxXMe5.js";
import "C:/Project/winemaking/winetoday/web/node_modules/ufo/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/defu/dist/defu.mjs";
import "./useMediaUrl-BBfhl7w5.js";
import "C:/Project/winemaking/winetoday/web/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/h3/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Project/winemaking/winetoday/web/node_modules/hookable/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Project/winemaking/winetoday/web/node_modules/klona/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getVideos } = useApi();
    const { data: list } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "videos-list",
      () => getVideos({ limit: 24 })
    )), __temp = await __temp, __restore(), __temp);
    useSeoMeta({
      title: "Видео — Виноделие сегодня",
      description: "Видеоматериалы о вине, виноделии и виноградарстве."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VideoThumb = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))}><h1 class="mb-8 font-heading text-3xl font-bold">Видео</h1><div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(unref(list)?.items, (item) => {
        _push(ssrRenderComponent(_component_VideoThumb, {
          key: item.id,
          item,
          class: "w-full"
        }, null, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/videos/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-v3HorwQU.js.map
