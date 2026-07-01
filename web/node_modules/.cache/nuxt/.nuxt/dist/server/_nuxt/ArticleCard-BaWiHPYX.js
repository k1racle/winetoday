import { _ as __nuxt_component_0 } from "./nuxt-link-M1kxXMe5.js";
import { _ as __nuxt_component_1$1 } from "./NuxtImg-BJV0ypiM.js";
import { computed, defineComponent, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
import { u as useMediaUrl } from "./useMediaUrl-BBfhl7w5.js";
function useContentMeta(item) {
  const date = computed(() => {
    const d = item.publishedAt || item.createdAt;
    if (!d) return "";
    return new Date(d).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  });
  const shortDate = computed(() => {
    const d = item.publishedAt || item.createdAt;
    if (!d) return "";
    return new Date(d).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  });
  const category = computed(() => {
    return item.categories?.[0]?.name || "";
  });
  const categorySlug = computed(() => {
    return item.categories?.[0]?.slug || "";
  });
  const typeLabel = computed(() => {
    switch (item.type) {
      case "article":
        return "Статья";
      case "news":
        return "Новость";
      case "video":
        return "Видео";
      case "gallery":
        return "Галерея";
      default:
        return "";
    }
  });
  return { date, shortDate, category, categorySlug, typeLabel };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ArticleCard",
  __ssrInlineRender: true,
  props: {
    item: {},
    imageAspect: { default: "square" },
    variant: { default: "default" }
  },
  setup(__props) {
    const props = __props;
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const { date, category, typeLabel } = useContentMeta(props.item);
    const link = computed(() => {
      switch (props.item.type) {
        case "article":
          return `/articles/${props.item.slug}`;
        case "news":
          return `/news/${props.item.slug}`;
        case "video":
          return `/videos/${props.item.slug}`;
        case "gallery":
          return `/gallery/${props.item.slug}`;
        default:
          return "/";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_NuxtImg = __nuxt_component_1$1;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: unref(link),
        class: ["group min-w-0 overflow-hidden border border-foreground/10 bg-card", __props.variant === "compact" ? "flex h-[320px] flex-col" : "block"]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="${ssrRenderClass([{
              "aspect-square": __props.imageAspect === "square" && __props.variant !== "compact",
              "aspect-video": __props.imageAspect === "video" || __props.variant === "compact"
            }, "relative w-full overflow-hidden bg-foreground/10"])}"${_scopeId}>`);
            if (__props.item.coverMedia?.path) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: unref(coverSrc),
                alt: __props.item.coverMedia.altText || __props.item.title,
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(typeLabel)) {
              _push2(`<span class="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background"${_scopeId}>${ssrInterpolate(unref(typeLabel))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.item.pinned) {
              _push2(`<span class="absolute bottom-2 right-2 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"${_scopeId}> Эксклюзив </span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="${ssrRenderClass([__props.variant === "compact" ? "flex flex-1 flex-col p-3" : "p-4", "overflow-hidden"])}"${_scopeId}><div class="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-foreground/50"${_scopeId}>`);
            if (unref(category)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(category))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(date)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(date))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><h3 class="${ssrRenderClass([__props.variant === "compact" ? "break-words text-sm line-clamp-3" : "break-words text-lg", "font-heading font-bold leading-snug group-hover:text-foreground"])}"${_scopeId}>${ssrInterpolate(__props.item.title)}</h3>`);
            if (__props.item.excerpt && __props.variant !== "compact") {
              _push2(`<p class="mt-2 line-clamp-2 text-sm opacity-80"${_scopeId}>${ssrInterpolate(__props.item.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", {
                class: ["relative w-full overflow-hidden bg-foreground/10", {
                  "aspect-square": __props.imageAspect === "square" && __props.variant !== "compact",
                  "aspect-video": __props.imageAspect === "video" || __props.variant === "compact"
                }]
              }, [
                __props.item.coverMedia?.path ? (openBlock(), createBlock(_component_NuxtImg, {
                  key: 0,
                  src: unref(coverSrc),
                  alt: __props.item.coverMedia.altText || __props.item.title,
                  class: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                unref(typeLabel) ? (openBlock(), createBlock("span", {
                  key: 1,
                  class: "absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background"
                }, toDisplayString(unref(typeLabel)), 1)) : createCommentVNode("", true),
                __props.item.pinned ? (openBlock(), createBlock("span", {
                  key: 2,
                  class: "absolute bottom-2 right-2 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                }, " Эксклюзив ")) : createCommentVNode("", true)
              ], 2),
              createVNode("div", {
                class: ["overflow-hidden", __props.variant === "compact" ? "flex flex-1 flex-col p-3" : "p-4"]
              }, [
                createVNode("div", { class: "mb-1.5 flex flex-wrap items-center gap-2 text-xs text-foreground/50" }, [
                  unref(category) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(category)), 1)) : createCommentVNode("", true),
                  unref(date) ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(date)), 1)) : createCommentVNode("", true)
                ]),
                createVNode("h3", {
                  class: ["font-heading font-bold leading-snug group-hover:text-foreground", __props.variant === "compact" ? "break-words text-sm line-clamp-3" : "break-words text-lg"]
                }, toDisplayString(__props.item.title), 3),
                __props.item.excerpt && __props.variant !== "compact" ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-2 line-clamp-2 text-sm opacity-80"
                }, toDisplayString(__props.item.excerpt), 1)) : createCommentVNode("", true)
              ], 2)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ArticleCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "ArticleCard" });
export {
  __nuxt_component_1 as _,
  useContentMeta as u
};
//# sourceMappingURL=ArticleCard-BaWiHPYX.js.map
