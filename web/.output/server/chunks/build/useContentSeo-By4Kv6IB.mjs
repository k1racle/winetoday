import { _ as __nuxt_component_0$1 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1$1 } from './AuthorByline-HqjiVauP.mjs';
import { c as useRoute, b as useSeoMeta, u as useHead, a as useRuntimeConfig, _ as __nuxt_component_2 } from './server.mjs';
import { _ as __nuxt_component_1$2 } from './NuxtImg-Cgs3E8D7.mjs';
import { u as useMediaUrl } from './useMediaUrl-DKS3WinY.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, toDisplayString, unref, openBlock, createBlock, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { i as isTiptapJson, t as tiptapToHtml } from './tiptap-html-DAudj7L6.mjs';
import { u as useContentMeta, _ as __nuxt_component_1$3 } from './ArticleCard-DJRcCNft.mjs';
import { _ as __nuxt_component_2$1 } from './SidebarByCategory-Hn42nTi1.mjs';
import { u as useApi, a as useAuth } from './useAuth-8H_2G1XE.mjs';
import { u as useAsyncData } from './asyncData-Ct_s6X-a.mjs';
import { u as useOgImageUrl } from './useOgImageUrl-BmwPGeNg.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BlockSlider",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    const props = __props;
    const current = ref(0);
    ref();
    const total = computed(() => props.items.length);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_1$2;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="group relative overflow-hidden rounded bg-black/5 aspect-video"><div class="flex h-full transition-transform duration-300 ease-out" style="${ssrRenderStyle({ transform: `translateX(-${unref(current) * 100}%)` })}"><!--[-->`);
      ssrRenderList(__props.items, (item, i) => {
        _push(`<div class="relative h-full w-full flex-shrink-0">`);
        if (item.path) {
          _push(ssrRenderComponent(_component_NuxtImg, {
            src: ("useMediaUrl" in _ctx ? _ctx.useMediaUrl : unref(useMediaUrl))(item.path),
            alt: item.source || "",
            class: "h-full w-full object-cover"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(total) > 1) {
        _push(`<!--[--><button type="button" aria-label="Предыдущий слайд" class="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 focus:opacity-100 group-hover:opacity-100"> ‹ </button><button type="button" aria-label="Следующий слайд" class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 focus:opacity-100 group-hover:opacity-100"> › </button><div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"><!--[-->`);
        ssrRenderList(__props.items, (_, i) => {
          _push(`<button type="button" class="${ssrRenderClass([i === unref(current) ? "bg-white" : "bg-white/50 hover:bg-white/80", "h-2 w-2 rounded-full transition"])}"${ssrRenderAttr("aria-label", `Перейти к слайду ${i + 1}`)}></button>`);
        });
        _push(`<!--]--></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.items[unref(current)]?.source) {
        _push(`<div class="mt-2 text-xs text-foreground/60">${ssrInterpolate(__props.items[unref(current)].source)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BlockSlider.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$2, { __name: "BlockSlider" });
function getVideoEmbedUrl(url) {
  if (!url) return "";
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return url;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContentBlocks",
  __ssrInlineRender: true,
  props: {
    blocks: {},
    item: {}
  },
  setup(__props) {
    const props = __props;
    function renderContent(content) {
      if (typeof content !== "string") return "";
      if (isTiptapJson(content)) return tiptapToHtml(content);
      return content;
    }
    function getEmbedUrl(url) {
      return getVideoEmbedUrl(url);
    }
    function formatSource(source) {
      if (!source) return "";
      const normalized = source.trim().toLowerCase();
      if (/^(источник|автор|фото|пресс-служба|photo by|source)/.test(normalized)) {
        return source.trim();
      }
      return `Источник: ${source.trim()}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_1$2;
      const _component_BlockSlider = __nuxt_component_1;
      const _component_ClientOnly = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><!--[-->`);
      ssrRenderList(props.blocks, (block) => {
        _push(`<!--[-->`);
        if (block.type === "rich-text" || block.type === "html-editor" || block.type === "text") {
          _push(`<div class="prose prose-lg max-w-none text-foreground [&amp;_h2]:text-2xl [&amp;_h2]:font-bold [&amp;_h2]:mt-6 [&amp;_h2]:mb-4 [&amp;_h3]:text-xl [&amp;_h3]:font-bold [&amp;_h3]:mt-5 [&amp;_h3]:mb-3">${renderContent(block.content) ?? ""}</div>`);
        } else if (block.type === "image-highlight") {
          _push(`<figure class="my-6">`);
          if (block.imageId) {
            _push(ssrRenderComponent(_component_NuxtImg, {
              src: `/api/media/${block.imageId}/file`,
              alt: block.caption || "",
              class: "w-full"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          if (block.caption || block.credit) {
            _push(`<figcaption class="mt-2 text-sm text-foreground/60">`);
            if (block.caption) {
              _push(`<span>${ssrInterpolate(block.caption)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (block.caption && block.credit) {
              _push(`<span> / </span>`);
            } else {
              _push(`<!---->`);
            }
            if (block.credit) {
              _push(`<span>${ssrInterpolate(formatSource(block.credit))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</figcaption>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</figure>`);
        } else if (block.type === "image") {
          _push(`<figure class="my-6">`);
          if (block.data?.path) {
            _push(ssrRenderComponent(_component_NuxtImg, {
              src: ("useMediaUrl" in _ctx ? _ctx.useMediaUrl : unref(useMediaUrl))(block.data.path),
              alt: block.data.caption || "",
              class: "w-full"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          if (block.data?.caption || block.data?.source) {
            _push(`<figcaption class="mt-2 text-sm text-foreground/60">`);
            if (block.data.caption) {
              _push(`<span>${ssrInterpolate(block.data.caption)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (block.data.caption && block.data.source) {
              _push(`<span> / </span>`);
            } else {
              _push(`<!---->`);
            }
            if (block.data.source) {
              _push(`<span>${ssrInterpolate(formatSource(block.data.source))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</figcaption>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</figure>`);
        } else if (block.type === "slider") {
          _push(ssrRenderComponent(_component_BlockSlider, {
            items: block.data?.items || [],
            class: "my-6"
          }, null, _parent));
        } else if (block.type === "gallery") {
          _push(`<div class="my-6"><div class="grid grid-cols-2 gap-3 sm:grid-cols-3"><!--[-->`);
          ssrRenderList(block.data?.items, (item, i) => {
            _push(`<figure>`);
            if (item.path) {
              _push(ssrRenderComponent(_component_NuxtImg, {
                src: ("useMediaUrl" in _ctx ? _ctx.useMediaUrl : unref(useMediaUrl))(item.path),
                alt: item.source || "",
                class: "w-full"
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            if (item.source) {
              _push(`<figcaption class="mt-1 text-xs text-foreground/60">${ssrInterpolate(formatSource(item.source))}</figcaption>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</figure>`);
          });
          _push(`<!--]--></div></div>`);
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
        } else if (block.type === "video-player" && getEmbedUrl(block.videoUrl || props.item.videoUrl)) {
          _push(ssrRenderComponent(_component_ClientOnly, null, {
            fallback: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="my-6 aspect-video w-full bg-black" aria-hidden="true"${_scopeId}></div>`);
              } else {
                return [
                  createVNode("div", {
                    class: "my-6 aspect-video w-full bg-black",
                    "aria-hidden": "true"
                  })
                ];
              }
            })
          }, _parent));
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
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "ContentBlocks" });
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
    const { getLatestByCategory, getVideos } = useApi();
    const { user } = useAuth();
    ref("");
    const { data: categoryGroups } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "latest-by-category",
      () => getLatestByCategory(10).catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const { data: relatedVideosList } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `related-videos-${props.item.id}`,
      () => props.item.type === "video" ? getVideos({ limit: 4 }).catch(() => ({ items: [] })) : Promise.resolve({ items: [] })
    )), __temp = await __temp, __restore(), __temp);
    computed(() => useContentMeta(props.item));
    const coverSrc = computed(() => useMediaUrl(props.item.coverMedia?.path));
    const canEdit = computed(() => ["admin", "editor"].includes(user.value?.role || ""));
    function editUrl(item) {
      return `/account?type=${item.type}&id=${item.id}`;
    }
    const commentText = ref("");
    const shareMessage = ref("");
    const reactions = ref({ likes: 0, dislikes: 0, userReaction: null });
    const comments = ref([]);
    const commentLoading = ref(false);
    const commentError = ref("");
    const commentSuccess = ref("");
    const reactionError = ref("");
    function formatDuration(seconds) {
      if (!seconds || seconds <= 0) return "";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      const s = seconds % 60;
      const parts = h > 0 ? [h, m, s] : [m, s];
      return parts.map((n) => String(n).padStart(2, "0")).join(":");
    }
    const bodyBlocks = computed(() => {
      const blocks = props.item.contentBlocks || [];
      if (props.item.type !== "video") return blocks;
      return blocks.filter((b) => b?.type !== "video-player");
    });
    const relatedItems = computed(() => {
      const currentId = props.item.id;
      const currentType = props.item.type;
      if (currentType === "video") {
        const videos = (relatedVideosList.value?.items || []).filter((i) => i.id !== currentId);
        return videos.slice(0, 3);
      }
      const groups = categoryGroups.value || [];
      if (!groups.length) return [];
      const categoryId = props.item.categories?.[0]?.id;
      const typeFilter = (i) => i.id !== currentId;
      let items = [];
      if (categoryId) {
        const group = groups.find((g) => g.category.id === categoryId);
        if (group) items = group.items.filter(typeFilter);
      }
      if (items.length < 3) {
        const existingIds = new Set(items.map((i) => i.id));
        const allItems = groups.flatMap((g) => g.items).filter(typeFilter);
        for (const item of allItems) {
          if (!existingIds.has(item.id)) {
            items.push(item);
            if (items.length >= 3) break;
          }
        }
      }
      return items.slice(0, 3);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_AuthorByline = __nuxt_component_1$1;
      const _component_ClientOnly = __nuxt_component_2;
      const _component_NuxtImg = __nuxt_component_1$2;
      const _component_ContentBlocks = __nuxt_component_4;
      const _component_ArticleCard = __nuxt_component_1$3;
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
      _push(`</nav><h1 class="font-heading text-3xl font-bold leading-tight md:text-4xl">${ssrInterpolate(__props.item.title)}</h1>`);
      if (__props.item.author) {
        _push(ssrRenderComponent(_component_AuthorByline, {
          author: __props.item.author,
          class: "mt-4"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(canEdit)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: editUrl(__props.item),
          class: "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"${_scopeId}></path></svg> Редактировать `);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  class: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  })
                ])),
                createTextVNode(" Редактировать ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.item.type === "video" && __props.item.videoUrl) {
        _push(`<figure class="mt-6">`);
        _push(ssrRenderComponent(_component_ClientOnly, null, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aspect-video w-full bg-black" aria-hidden="true"${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "aspect-video w-full bg-black",
                  "aria-hidden": "true"
                })
              ];
            }
          })
        }, _parent));
        if (__props.item.duration) {
          _push(`<figcaption class="mt-2 text-xs text-foreground/50"> Продолжительность: ${ssrInterpolate(formatDuration(__props.item.duration))}</figcaption>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</figure>`);
      } else if (unref(coverSrc) && __props.item.type !== "video") {
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
      if (unref(bodyBlocks).length) {
        _push(ssrRenderComponent(_component_ContentBlocks, {
          blocks: unref(bodyBlocks),
          item: __props.item
        }, null, _parent));
      } else if (__props.item.excerpt) {
        _push(`<p class="text-lg leading-relaxed opacity-80">${ssrInterpolate(__props.item.excerpt)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mt-10 flex items-center justify-between border-t border-foreground/10 pt-4"><div class="flex items-center gap-4"><button type="button" class="${ssrRenderClass([unref(reactions).userReaction === "like" ? "text-green-500 hover:text-green-400" : "text-foreground/60 hover:text-foreground", "flex items-center gap-1.5 transition"])}" aria-label="Нравится"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12.784 12.784 0 0 1-.52-3.369c0-1.242.2-2.489.58-3.628M5.904 18.5H10.5m-4.596 0v-9.75m0 9.75v2.25"></path></svg>`);
      if (unref(reactions).likes > 0) {
        _push(`<span class="text-sm">${ssrInterpolate(unref(reactions).likes)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Комментарии"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"></path></svg></button></div><div class="flex items-center gap-4"><button type="button" class="${ssrRenderClass([unref(reactions).userReaction === "dislike" ? "text-red-500 hover:text-red-400" : "text-foreground/60 hover:text-foreground", "flex items-center gap-1.5 transition"])}" aria-label="Не нравится"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.49809 15.25H4.37227C3.34564 15.25 2.4267 14.556 2.31801 13.5351C2.27306 13.1129 2.25 12.6841 2.25 12.25C2.25 9.40238 3.24188 6.78642 4.899 4.72878C5.2866 4.24749 5.88581 4 6.50377 4L10.5198 4C11.0034 4 11.4839 4.07798 11.9428 4.23093L15.0572 5.26908C15.5161 5.42203 15.9966 5.5 16.4803 5.5L17.7745 5.5M7.49809 15.25C8.11638 15.25 8.48896 15.974 8.22337 16.5323C7.75956 17.5074 7.5 18.5984 7.5 19.75C7.5 20.9926 8.50736 22 9.75 22C10.1642 22 10.5 21.6642 10.5 21.25V20.6166C10.5 20.0441 10.6092 19.4769 10.8219 18.9454C11.1257 18.1857 11.7523 17.6144 12.4745 17.2298C13.5883 16.6366 14.5627 15.8162 15.3359 14.8303C15.8335 14.1958 16.5611 13.75 17.3674 13.75H17.7511M17.7745 5.5C17.7851 5.55001 17.802 5.59962 17.8258 5.6478C18.4175 6.84708 18.75 8.19721 18.75 9.625C18.75 11.1117 18.3895 12.5143 17.7511 13.75M17.7745 5.5C17.6975 5.13534 17.9575 4.75 18.3493 4.75H19.2571C20.1458 4.75 20.9701 5.26802 21.2294 6.11804C21.5679 7.22737 21.75 8.40492 21.75 9.625C21.75 11.1775 21.4552 12.6611 20.9185 14.0229C20.6135 14.797 19.8327 15.25 19.0006 15.25H17.9479C17.476 15.25 17.2027 14.6941 17.4477 14.2907C17.5548 14.1144 17.6561 13.934 17.7511 13.75"></path></svg></button><button type="button" class="flex items-center gap-1.5 text-foreground/60 transition hover:text-foreground" aria-label="Поделиться"><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5C6.25736 8.25 5.25 9.25736 5.25 10.5V19.5C5.25 20.7426 6.25736 21.75 7.5 21.75H16.5C17.7426 21.75 18.75 20.7426 18.75 19.5V10.5C18.75 9.25736 17.7426 8.25 16.5 8.25H15M15 5.25L12 2.25M12 2.25L9 5.25M12 2.25L12 15"></path></svg></button></div></div>`);
      if (unref(reactionError)) {
        _push(`<p class="mt-2 text-xs text-red-500">${ssrInterpolate(unref(reactionError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(shareMessage)) {
        _push(`<p class="mt-2 text-xs text-foreground/60">${ssrInterpolate(unref(shareMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
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
      _push(`<div class="mt-10"><h2 class="mb-4 font-heading text-xl font-bold">Комментарии</h2><div class="border border-foreground/10 bg-card p-4"><textarea rows="4" placeholder="Поделитесь мнением о материале" maxlength="3000" class="w-full resize-none border border-foreground/10 bg-card p-3 text-sm outline-none transition focus:border-accent">${ssrInterpolate(unref(commentText))}</textarea><div class="mt-3 flex items-center justify-between"><span class="text-xs text-foreground/50">${ssrInterpolate(unref(commentText).length)} / 3000</span><button type="button" class="rounded bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(commentLoading)) ? " disabled" : ""}>${ssrInterpolate(unref(commentLoading) ? "Отправка..." : "Отправить")}</button></div>`);
      if (unref(commentError)) {
        _push(`<p class="mt-2 text-xs text-red-500">${ssrInterpolate(unref(commentError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(commentSuccess)) {
        _push(`<p class="mt-2 text-xs text-green-500">${ssrInterpolate(unref(commentSuccess))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(comments).length) {
        _push(`<div class="mt-6 space-y-4"><!--[-->`);
        ssrRenderList(unref(comments), (comment) => {
          _push(`<div class="border border-foreground/10 bg-card p-4"><div class="flex items-center justify-between text-xs text-foreground/50"><span class="font-medium text-foreground">${ssrInterpolate(comment.author)}</span><span>${ssrInterpolate(new Date(comment.createdAt).toLocaleDateString("ru-RU"))}</span></div><p class="mt-2 text-sm leading-relaxed">${ssrInterpolate(comment.body)}</p></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (!unref(commentLoading)) {
        _push(`<p class="mt-6 text-sm text-foreground/50">Пока нет комментариев</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></article><aside class="lg:col-span-1">`);
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
const SITE_DESCRIPTION = "Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.";
function useContentSeo(item) {
  const route = useRoute();
  const config = useRuntimeConfig();
  if (!item) return;
  const extended = item;
  const title = extended.seo?.metaTitle || item.title;
  const description = extended.seo?.metaDescription || item.excerpt || SITE_DESCRIPTION;
  const siteUrl = config.public.siteUrl?.replace(/\/$/, "") || "";
  const canonicalUrl = `${siteUrl}${route.path}`;
  const coverUrl = item.coverMedia?.path ? useMediaUrl(item.coverMedia.path) : "";
  const ogImageUrl = useOgImageUrl(coverUrl);
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogType: "article",
    ogImage: ogImageUrl,
    ogImageWidth: ogImageUrl ? 1200 : void 0,
    ogImageHeight: ogImageUrl ? 630 : void 0,
    ogImageType: ogImageUrl ? "image/jpeg" : void 0,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImageUrl
  });
  useHead({
    link: [{ rel: "canonical", href: canonicalUrl }]
  });
}

export { __nuxt_component_0 as _, useContentSeo as u };
//# sourceMappingURL=useContentSeo-By4Kv6IB.mjs.map
