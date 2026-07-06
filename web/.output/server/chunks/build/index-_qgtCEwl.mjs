import { _ as __nuxt_component_0$1 } from './nuxt-link-D9D3wLLz.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { u as useAsyncData, _ as __nuxt_component_1$2 } from './NuxtImg-DCUDb8v0.mjs';
import { _ as __nuxt_component_2$1, u as useMediaUrl } from './SidebarByCategory-CS-C-5mH.mjs';
import { _ as __nuxt_component_1$1, u as useContentMeta } from './ArticleCard-BzTIibt-.mjs';
import { _ as __nuxt_component_0$2 } from './VideoThumb-he-_xf-j.mjs';
import { u as useApi } from './useApi-DaYJsQyz.mjs';
import { a as useSeoMeta } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "FreshList",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    const props = __props;
    const activeTab = ref("fresh");
    const isExpanded = ref(false);
    function link(item) {
      switch (item.type) {
        case "article":
          return `/articles/${item.slug}`;
        case "news":
          return `/news/${item.slug}`;
        case "video":
          return `/videos/${item.slug}`;
        case "gallery":
          return `/gallery/${item.slug}`;
        default:
          return "/";
      }
    }
    function formatDayMonth(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    }
    function truncatedTitle(title, exclusive) {
      const max = exclusive ? 40 : 200;
      if (title.length <= max) return title;
      return title.slice(0, max).trim().replace(/[\s.,!?;:]$/, "") + "…";
    }
    const displayedItems = computed(() => {
      const list = props.items || [];
      if (activeTab.value === "popular") {
        return [...list].sort((a, b) => (b.viewsTotal || 0) - (a.viewsTotal || 0)).slice(0, 17);
      }
      return list.slice(0, 17);
    });
    const hasMobileMore = computed(() => displayedItems.value.length > 4);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col border border-foreground/5 bg-card p-5 shadow-sm md:p-6" }, _attrs))}><div class="mb-4 flex items-center justify-between"><button type="button" class="${ssrRenderClass([unref(activeTab) === "fresh" ? "text-foreground border-accent" : "text-foreground/50 border-transparent hover:text-foreground", "flex-1 pb-1 text-center font-heading text-xs font-bold uppercase tracking-wider transition border-b-2"])}"> Свежие </button><button type="button" class="${ssrRenderClass([unref(activeTab) === "popular" ? "text-foreground border-accent" : "text-foreground/50 border-transparent hover:text-foreground", "flex-1 pb-1 text-center font-heading text-xs font-bold uppercase tracking-wider transition border-b-2"])}"> Популярные </button></div><ul class="divide-y divide-foreground/10"><!--[-->`);
      ssrRenderList(unref(displayedItems), (item, index) => {
        _push(`<li class="${ssrRenderClass([{ "hidden md:block": !unref(isExpanded) && index >= 4 }, "py-3 first:pt-0 last:pb-0"])}">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: link(item),
          class: "group flex min-w-0 items-start gap-3 transition-transform duration-200 hover:scale-[1.01]"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="shrink-0 pt-0.5 text-sm font-bold text-accent"${_scopeId}>${ssrInterpolate(formatDayMonth(item.publishedAt || item.createdAt))}</span><div class="min-w-0 flex-1"${_scopeId}><span class="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-foreground"${_scopeId}>${ssrInterpolate(truncatedTitle(item.title, item.materialLabel === "exclusive"))} `);
              if (item.materialLabel === "exclusive") {
                _push2(`<span class="ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"${_scopeId}> Эксклюзив </span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span></div>`);
            } else {
              return [
                createVNode("span", { class: "shrink-0 pt-0.5 text-sm font-bold text-accent" }, toDisplayString(formatDayMonth(item.publishedAt || item.createdAt)), 1),
                createVNode("div", { class: "min-w-0 flex-1" }, [
                  createVNode("span", { class: "line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-foreground" }, [
                    createTextVNode(toDisplayString(truncatedTitle(item.title, item.materialLabel === "exclusive")) + " ", 1),
                    item.materialLabel === "exclusive" ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    }, " Эксклюзив ")) : createCommentVNode("", true)
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul>`);
      if (unref(hasMobileMore) && !unref(isExpanded)) {
        _push(`<button type="button" class="mt-3 w-full text-center text-sm font-medium text-foreground/70 transition hover:text-foreground md:hidden"> Ещё </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/news",
        class: "mt-4 inline-flex items-center text-sm font-medium text-foreground/70 transition hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Все новости <span class="ml-1"${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(" Все новости "),
              createVNode("span", { class: "ml-1" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FreshList.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$4, { __name: "FreshList" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "NewsThumbCard",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const props = __props;
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
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const { shortDate, category } = useContentMeta(props.item);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1$2;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: unref(link),
        class: "group flex h-full min-w-0 flex-col overflow-hidden bg-card shadow-sm transition duration-300 hover:scale-[1.02] hover:shadow-md"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="relative aspect-video overflow-hidden bg-foreground/10"${_scopeId}>`);
            if (unref(coverSrc)) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "h-full w-full object-cover"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (__props.item.materialLabel === "exclusive") {
              _push2(`<span class="absolute bottom-2 right-2 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"${_scopeId}> Эксклюзив </span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex flex-1 flex-col p-3 md:p-4"${_scopeId}><div class="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] text-foreground/50 md:text-xs"${_scopeId}>`);
            if (unref(category)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(category))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(shortDate)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(shortDate))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><h3 class="font-heading text-sm font-bold leading-snug text-foreground group-hover:text-foreground line-clamp-2 break-words md:text-base md:line-clamp-3"${_scopeId}>${ssrInterpolate(__props.item.title)}</h3></div>`);
          } else {
            return [
              createVNode("div", { class: "relative aspect-video overflow-hidden bg-foreground/10" }, [
                unref(coverSrc) ? (openBlock(), createBlock(_component_NuxtImg, {
                  key: 0,
                  src: unref(coverSrc),
                  alt: __props.item.coverMedia?.altText || __props.item.title,
                  class: "h-full w-full object-cover"
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                __props.item.materialLabel === "exclusive" ? (openBlock(), createBlock("span", {
                  key: 1,
                  class: "absolute bottom-2 right-2 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                }, " Эксклюзив ")) : createCommentVNode("", true)
              ]),
              createVNode("div", { class: "flex flex-1 flex-col p-3 md:p-4" }, [
                createVNode("div", { class: "mb-1.5 flex flex-wrap items-center gap-2 text-[10px] text-foreground/50 md:text-xs" }, [
                  unref(category) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(category)), 1)) : createCommentVNode("", true),
                  unref(shortDate) ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(shortDate)), 1)) : createCommentVNode("", true)
                ]),
                createVNode("h3", { class: "font-heading text-sm font-bold leading-snug text-foreground group-hover:text-foreground line-clamp-2 break-words md:text-base md:line-clamp-3" }, toDisplayString(__props.item.title), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NewsThumbCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$3, { __name: "NewsThumbCard" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "HeroCard",
  __ssrInlineRender: true,
  props: {
    item: {},
    size: {}
  },
  setup(__props) {
    const props = __props;
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
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const { shortDate, category } = useContentMeta(props.item);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1$2;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: unref(link),
        class: ["group relative flex min-w-0 flex-col justify-end overflow-hidden bg-foreground/10", {
          "aspect-video md:aspect-square": __props.size === "small" || __props.size === "medium",
          "aspect-square": __props.size === "large",
          "min-h-[280px] md:min-h-[360px]": !__props.size
        }]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(coverSrc)) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"${_scopeId}></div><div class="relative z-10 p-3 text-white md:p-6"${_scopeId}><div class="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/80 md:text-xs"${_scopeId}>`);
            if (unref(category)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(category))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(shortDate)) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(shortDate))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><h3 class="${ssrRenderClass([{ "md:text-2xl": __props.size === "large" }, "break-words font-heading text-base font-bold leading-snug md:text-xl"])}"${_scopeId}>${ssrInterpolate(__props.item.title)}</h3>`);
            if (__props.item.excerpt && __props.size === "large") {
              _push2(`<p class="mt-1 line-clamp-1 text-xs text-white/80 md:mt-2 md:line-clamp-2 md:text-sm"${_scopeId}>${ssrInterpolate(__props.item.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              unref(coverSrc) ? (openBlock(), createBlock(_component_NuxtImg, {
                key: 0,
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" }),
              createVNode("div", { class: "relative z-10 p-3 text-white md:p-6" }, [
                createVNode("div", { class: "mb-1.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/80 md:text-xs" }, [
                  unref(category) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(category)), 1)) : createCommentVNode("", true),
                  unref(shortDate) ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(shortDate)), 1)) : createCommentVNode("", true)
                ]),
                createVNode("h3", {
                  class: ["break-words font-heading text-base font-bold leading-snug md:text-xl", { "md:text-2xl": __props.size === "large" }]
                }, toDisplayString(__props.item.title), 3),
                __props.item.excerpt && __props.size === "large" ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 line-clamp-1 text-xs text-white/80 md:mt-2 md:line-clamp-2 md:text-sm"
                }, toDisplayString(__props.item.excerpt), 1)) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HeroCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$2, { __name: "HeroCard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VideoFeatureCard",
  __ssrInlineRender: true,
  props: {
    item: {},
    showTitle: { type: Boolean, default: true },
    showPlay: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const { date, category } = useContentMeta(props.item);
    const duration = computed(() => {
      const block = props.item.contentBlocks?.find((b) => b.type === "video-player");
      return block?.duration || props.item.duration;
    });
    function formatDuration(seconds) {
      if (!seconds) return "";
      const total = Math.floor(seconds);
      const h = Math.floor(total / 3600);
      const m = Math.floor(total % 3600 / 60);
      const s = total % 60;
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "group" }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "title", {}, null, _push, _parent);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/videos/${__props.item.slug}`,
        class: "relative flex w-full flex-col justify-end overflow-hidden bg-foreground/10 aspect-video"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(coverSrc)) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"${_scopeId}></div>`);
            if (__props.showPlay) {
              _push2(`<div class="absolute inset-0 flex items-center justify-center"${_scopeId}><div class="flex h-16 w-16 items-center justify-center bg-card/90 text-accent transition group-hover:scale-110 group-hover:bg-card md:h-20 md:w-20"${_scopeId}><svg class="h-7 w-7 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24"${_scopeId}><path d="M8 5v14l11-7z"${_scopeId}></path></svg></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.showTitle) {
              _push2(`<div class="relative z-10 p-5 text-white md:p-8"${_scopeId}><div class="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80"${_scopeId}>`);
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
              if (unref(duration)) {
                _push2(`<span${_scopeId}>${ssrInterpolate(formatDuration(unref(duration)))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><h3 class="font-heading text-xl font-bold leading-snug md:text-2xl lg:text-3xl"${_scopeId}>${ssrInterpolate(__props.item.title)}</h3>`);
              if (__props.item.excerpt) {
                _push2(`<p class="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 md:text-base"${_scopeId}>${ssrInterpolate(__props.item.excerpt)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(coverSrc) ? (openBlock(), createBlock(_component_NuxtImg, {
                key: 0,
                src: unref(coverSrc),
                alt: __props.item.coverMedia?.altText || __props.item.title,
                class: "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" }),
              __props.showPlay ? (openBlock(), createBlock("div", {
                key: 1,
                class: "absolute inset-0 flex items-center justify-center"
              }, [
                createVNode("div", { class: "flex h-16 w-16 items-center justify-center bg-card/90 text-accent transition group-hover:scale-110 group-hover:bg-card md:h-20 md:w-20" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7 md:h-8 md:w-8",
                    fill: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", { d: "M8 5v14l11-7z" })
                  ]))
                ])
              ])) : createCommentVNode("", true),
              __props.showTitle ? (openBlock(), createBlock("div", {
                key: 2,
                class: "relative z-10 p-5 text-white md:p-8"
              }, [
                createVNode("div", { class: "mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80" }, [
                  unref(category) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(unref(category)), 1)) : createCommentVNode("", true),
                  unref(date) ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(date)), 1)) : createCommentVNode("", true),
                  unref(duration) ? (openBlock(), createBlock("span", { key: 2 }, toDisplayString(formatDuration(unref(duration))), 1)) : createCommentVNode("", true)
                ]),
                createVNode("h3", { class: "font-heading text-xl font-bold leading-snug md:text-2xl lg:text-3xl" }, toDisplayString(__props.item.title), 1),
                __props.item.excerpt ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 md:text-base"
                }, toDisplayString(__props.item.excerpt), 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoFeatureCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "VideoFeatureCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getHomepage, getContent, getLatestByCategory } = useApi();
    const { data: homepage } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "homepage",
      () => getHomepage().catch(() => ({ lead: [], articles: [], news: [], videos: [], galleries: [] }))
    )), __temp = await __temp, __restore(), __temp);
    const { data: fresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "fresh",
      () => getContent({ limit: 40 }).catch(() => ({ items: [] }))
    )), __temp = await __temp, __restore(), __temp);
    const { data: latestByCategory } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "latest-by-category",
      () => getLatestByCategory(5).catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const topItems = computed(() => {
      const h = homepage.value;
      if (!h) return [];
      if (h.lead?.length) return h.lead.slice(0, 3);
      return h.articles?.slice(0, 3) || [];
    });
    const freshItems = computed(() => {
      const items = fresh.value?.items || [];
      return [...items].sort((a, b) => {
        const da = new Date(b.publishedAt || b.createdAt).getTime();
        const db = new Date(a.publishedAt || a.createdAt).getTime();
        return da - db;
      }).slice(0, 17);
    });
    const mixedItems = computed(() => {
      const h = homepage.value;
      if (!h) return [];
      const items = [...h.news || [], ...h.articles || [], ...h.videos || []];
      return items.sort((a, b) => {
        const da = new Date(b.publishedAt || b.createdAt).getTime();
        const db = new Date(a.publishedAt || a.createdAt).getTime();
        return da - db;
      }).slice(0, 24);
    });
    ref(null);
    useSeoMeta({
      title: "Виноделие сегодня",
      description: "Русскоязычный портал о вине, виноградарстве и виноделии.",
      ogTitle: "Виноделие сегодня",
      ogDescription: "Русскоязычный портал о вине, виноградарстве и виноделии.",
      ogImage: "/og-image.jpg"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FreshList = __nuxt_component_0;
      const _component_NewsThumbCard = __nuxt_component_1;
      const _component_HeroCard = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_VideoFeatureCard = __nuxt_component_4;
      const _component_VideoThumb = __nuxt_component_0$2;
      const _component_ArticleCard = __nuxt_component_1$1;
      const _component_SidebarByCategory = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pb-16" }, _attrs))}>`);
      if (unref(topItems).length) {
        _push(`<section class="mx-auto max-w-7xl px-4 py-4"><div class="grid grid-cols-1 gap-4 lg:grid-cols-4"><aside class="order-first w-full self-start lg:order-none lg:col-start-4 lg:row-start-1 lg:row-span-3">`);
        _push(ssrRenderComponent(_component_FreshList, { items: unref(freshItems) }, null, _parent));
        _push(`</aside><div class="flex flex-col gap-4 lg:hidden"><!--[-->`);
        ssrRenderList(unref(topItems).slice(0, 3), (item) => {
          _push(ssrRenderComponent(_component_NewsThumbCard, {
            key: `mob-${item.id}`,
            item
          }, null, _parent));
        });
        _push(`<!--]--></div><div class="hidden w-full flex-col gap-4 lg:col-span-3 lg:flex"><div class="flex flex-col gap-4 lg:flex-row"><div class="w-full lg:w-2/3">`);
        if (unref(topItems)[0]) {
          _push(ssrRenderComponent(_component_HeroCard, {
            item: unref(topItems)[0],
            size: "large"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex w-full flex-col gap-4 lg:w-1/3"><!--[-->`);
        ssrRenderList(unref(topItems).slice(1, 3), (item) => {
          _push(ssrRenderComponent(_component_NewsThumbCard, {
            key: `top-${item.id}`,
            item,
            class: "min-h-0 flex-1"
          }, null, _parent));
        });
        _push(`<!--]--></div></div></div>`);
        if (unref(homepage)?.videos?.length) {
          _push(`<div class="w-full lg:col-span-3 lg:col-start-1 lg:row-start-3"><div class="mb-4 flex items-center justify-between"><div class="flex items-center gap-2"><svg class="h-5 w-5 fill-current text-accent" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg><h2 class="font-heading text-xl font-bold uppercase tracking-wider"><span class="rounded bg-accent px-2 py-0.5 text-black">Видео</span></h2></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/videos",
            class: "text-sm font-medium text-foreground transition hover:text-foreground/80"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Все видео → `);
              } else {
                return [
                  createTextVNode(" Все видео → ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          _push(ssrRenderComponent(_component_VideoFeatureCard, {
            item: unref(homepage).videos[0],
            "show-title": false,
            "show-play": false
          }, {
            title: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="mb-3 font-heading text-lg font-bold leading-snug text-foreground md:text-xl"${_scopeId}>${ssrInterpolate(unref(homepage).videos[0].title)}</h3>`);
              } else {
                return [
                  createVNode("h3", { class: "mb-3 font-heading text-lg font-bold leading-snug text-foreground md:text-xl" }, toDisplayString(unref(homepage).videos[0].title), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="mt-4"><div class="flex min-w-0 gap-4 overflow-x-auto pb-2 scroll-smooth"><!--[-->`);
          ssrRenderList(unref(homepage).videos.slice(1), (item) => {
            _push(ssrRenderComponent(_component_VideoThumb, {
              key: item.id,
              item
            }, null, _parent));
          });
          _push(`<!--]--></div><div class="mt-2 hidden justify-end gap-2 md:flex"><button type="button" class="flex h-9 w-9 items-center justify-center rounded border border-foreground/10 bg-card text-foreground/70 transition hover:border-accent hover:text-accent" aria-label="Назад"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button><button type="button" class="flex h-9 w-9 items-center justify-center rounded border border-foreground/10 bg-card text-foreground/70 transition hover:border-accent hover:text-accent" aria-label="Вперёд"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path></svg></button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mixedItems).length) {
        _push(`<section class="mx-auto max-w-7xl px-4 py-10"><h2 class="mb-6 font-heading text-2xl font-bold">Последние новости</h2><div class="grid items-start gap-4 lg:grid-cols-4"><div class="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(mixedItems), (item) => {
          _push(ssrRenderComponent(_component_ArticleCard, {
            key: item.id,
            item,
            "image-aspect": "video",
            variant: "compact",
            class: "h-[320px]"
          }, null, _parent));
        });
        _push(`<!--]--></div><aside class="lg:col-span-1">`);
        _push(ssrRenderComponent(_component_SidebarByCategory, {
          groups: unref(latestByCategory) || []
        }, null, _parent));
        _push(`</aside></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-_qgtCEwl.mjs.map
