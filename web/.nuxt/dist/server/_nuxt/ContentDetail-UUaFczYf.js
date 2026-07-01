import { _ as __nuxt_component_0$1 } from "./nuxt-link-M1kxXMe5.js";
import { _ as __nuxt_component_1, u as useAsyncData } from "./NuxtImg-BJV0ypiM.js";
import { defineComponent, mergeProps, useSSRContext, withAsyncContext, computed, ref, withCtx, createTextVNode, toDisplayString, unref } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { u as useContentMeta, _ as __nuxt_component_1$1 } from "./ArticleCard-BaWiHPYX.js";
import { _ as __nuxt_component_2$1 } from "./SidebarByCategory-zEk3F-tL.js";
import { u as useApi } from "./useApi-DkRD3FHh.js";
import { u as useMediaUrl } from "./useMediaUrl-BBfhl7w5.js";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContentBlocks",
  __ssrInlineRender: true,
  props: {
    blocks: {},
    item: {}
  },
  setup(__props) {
    const props = __props;
    function getEmbedUrl(url) {
      if (!url) return "";
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      return url;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><!--[-->`);
      ssrRenderList(props.blocks, (block) => {
        _push(`<!--[-->`);
        if (block.type === "rich-text" || block.type === "html-editor") {
          _push(`<div class="prose prose-lg max-w-none text-foreground">${block.content ?? ""}</div>`);
        } else if (block.type === "image-highlight") {
          _push(`<figure class="my-6">`);
          if (block.imageId) {
            _push(ssrRenderComponent(_component_NuxtImg, {
              src: `/api/media/${block.imageId}`,
              alt: block.caption || "",
              class: "w-full"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          if (block.caption || block.credit) {
            _push(`<figcaption class="mt-2 text-sm text-foreground/60">${ssrInterpolate(block.caption)} `);
            if (block.credit) {
              _push(`<span> / ${ssrInterpolate(block.credit)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</figcaption>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</figure>`);
        } else if (block.type === "quote") {
          _push(`<blockquote class="border-l-4 border-accent bg-accent/5 p-6 italic"><p class="text-lg">${ssrInterpolate(block.text)}</p>`);
          if (block.author) {
            _push(`<footer class="mt-3 text-sm font-medium not-italic">${ssrInterpolate(block.author)}`);
            if (block.role) {
              _push(`<span>, ${ssrInterpolate(block.role)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</footer>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</blockquote>`);
        } else if (block.type === "embed" && block.html) {
          _push(`<div class="my-6">${block.html ?? ""}</div>`);
        } else if (block.type === "video-player") {
          _push(`<div class="my-6 aspect-video w-full bg-black">`);
          if (getEmbedUrl(block.videoUrl || props.item.videoUrl)) {
            _push(`<iframe${ssrRenderAttr("src", getEmbedUrl(block.videoUrl || props.item.videoUrl))} class="h-full w-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContentBlocks.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "ContentBlocks" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ContentDetail",
  __ssrInlineRender: true,
  props: {
    item: {},
    typeLabel: {},
    typeRoute: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const { getLatestByCategory } = useApi();
    const { data: categoryGroups } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "latest-by-category",
      () => getLatestByCategory(5).catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    computed(() => useContentMeta(props.item));
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const commentText = ref("");
    const relatedItems = computed(() => {
      const groups = categoryGroups.value || [];
      if (!groups.length) return [];
      const currentId = props.item.id;
      const categoryId = props.item.categories?.[0]?.id;
      let items = [];
      if (categoryId) {
        const group = groups.find((g) => g.category.id === categoryId);
        if (group) items = group.items.filter((i) => i.id !== currentId);
      }
      if (items.length < 3) {
        const existingIds = new Set(items.map((i) => i.id));
        const allItems = groups.flatMap((g) => g.items).filter((i) => i.id !== currentId);
        for (const item of allItems) {
          if (!existingIds.has(item.id)) {
            items.push(item);
            if (items.length >= 3) break;
          }
        }
      }
      return items.slice(0, 3);
    });
    function formatTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1;
      const _component_ContentBlocks = __nuxt_component_2;
      const _component_ArticleCard = __nuxt_component_1$1;
      const _component_SidebarByCategory = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-7xl px-4 py-8" }, _attrs))}><div class="grid gap-8 lg:grid-cols-4"><article class="lg:col-span-3"><nav class="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/50">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Главная`);
          } else {
            return [
              createTextVNode("Главная")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span>/</span>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: __props.typeRoute,
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.typeLabel)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.typeLabel), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav><div class="mb-3 text-sm text-foreground/50">${ssrInterpolate(formatTime(__props.item.publishedAt || __props.item.createdAt))}</div><h1 class="font-heading text-3xl font-bold leading-tight md:text-4xl">${ssrInterpolate(__props.item.title)}</h1>`);
      if (unref(coverSrc)) {
        _push(`<figure class="mt-6">`);
        _push(ssrRenderComponent(_component_NuxtImg, {
          src: unref(coverSrc),
          alt: __props.item.coverMedia?.altText || __props.item.title,
          class: "aspect-video w-full object-cover"
        }, null, _parent));
        if (__props.item.coverSource) {
          _push(`<figcaption class="mt-2 text-xs font-medium uppercase tracking-wider text-foreground/50"> Источник: ${ssrInterpolate(__props.item.coverSource)}</figcaption>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</figure>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-8">`);
      if (__props.item.contentBlocks?.length) {
        _push(ssrRenderComponent(_component_ContentBlocks, {
          blocks: __props.item.contentBlocks,
          item: __props.item
        }, null, _parent));
      } else if (__props.item.excerpt) {
        _push(`<p class="text-lg leading-relaxed opacity-80">${ssrInterpolate(__props.item.excerpt)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mt-10 flex items-center justify-between border-t border-foreground/10 pt-4"><div class="flex items-center gap-4"><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Нравится"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25"></path></svg></button><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Комментарии"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"></path></svg></button></div><div class="flex items-center gap-4"><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Не нравится"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a6 6 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.272 1.067.844.064.455.27.867.585 1.18.317.313.728.515 1.178.515M7.498 15.25H13.5m-6 0v2.25m0-2.25h6m-6 0V5.75m6 9.75v2.25m0-2.25h-6m6 0V5.75"></path></svg></button><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Поделиться"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m9.566-1.43a2.25 2.25 0 1 0 0-2.186m-9.566 1.43a2.25 2.25 0 0 0 1.992-1.992m7.574-3.818a2.25 2.25 0 0 0 1.992 1.992M16.5 7.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"></path></svg></button></div></div>`);
      if (unref(relatedItems).length) {
        _push(`<div class="mt-10"><h2 class="mb-4 font-heading text-xl font-bold">Читайте также</h2><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(relatedItems), (item) => {
          _push(ssrRenderComponent(_component_ArticleCard, {
            key: item.id,
            item,
            "image-aspect": "video",
            variant: "compact",
            class: "h-[320px]"
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-10"><h2 class="mb-4 font-heading text-xl font-bold">Комментарии</h2><div class="border border-foreground/10 bg-card p-4"><textarea rows="4" placeholder="Поделитесь мнением о материале" maxlength="3000" class="w-full resize-none border border-foreground/10 bg-card p-3 text-sm outline-none transition focus:border-accent">${ssrInterpolate(unref(commentText))}</textarea><div class="mt-3 flex items-center justify-between"><span class="text-xs text-foreground/50">${ssrInterpolate(unref(commentText).length)} / 3000</span><button type="button" class="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"> Отправить </button></div></div></div></article><aside class="lg:col-span-1">`);
      _push(ssrRenderComponent(_component_SidebarByCategory, {
        groups: unref(categoryGroups) || []
      }, null, _parent));
      _push(`</aside></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContentDetail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "ContentDetail" });
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=ContentDetail-UUaFczYf.js.map
