import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1, a as __nuxt_component_2 } from './SidebarByCategory-DFuBu4iH.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { c as useRoute, b as useSeoMeta } from './server.mjs';
import { u as useApi } from './useAuth-2AbBXMNZ.mjs';
import { u as useAsyncData } from './sidebar-categories-B7iei0NP.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const slug = route.params.slug;
    const { getContent, getCategories, getLatestByCategory } = useApi();
    const { data: categories } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "categories",
      () => getCategories().catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const { data: content, error: contentError } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `category-content-${slug}`,
      () => getContent({ categorySlug: slug, limit: 1e4 }).catch((err) => {
        console.error("Failed to load category content:", err);
        return { items: [], total: 0 };
      })
    )), __temp = await __temp, __restore(), __temp);
    const { data: latestByCategory } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "latest-by-category",
      () => getLatestByCategory(5).catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const category = computed(
      () => (categories.value || []).find((c) => c.slug === slug)
    );
    const items = computed(() => {
      const list = content.value?.items || [];
      return [...list].sort(
        (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      );
    });
    useSeoMeta({
      title: `${category.value?.name || slug} — Виноделие сегодня`,
      description: `Материалы по рубрике «${category.value?.name || slug}».`
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ArticleCard = __nuxt_component_1;
      const _component_SidebarByCategory = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-7xl px-4 py-8" }, _attrs))}><nav class="mb-4 text-xs font-medium uppercase tracking-wider text-foreground/50">`);
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
      _push(`<span class="mx-2">/</span><span>${ssrInterpolate(unref(category)?.name || unref(slug))}</span></nav><h1 class="mb-6 font-heading text-3xl font-bold md:text-4xl">${ssrInterpolate(unref(category)?.name || unref(slug))}</h1><div class="grid gap-8 lg:grid-cols-4"><div class="lg:col-span-3">`);
      if (unref(contentError)) {
        _push(`<div class="rounded border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700"> Ошибка загрузки материалов рубрики. </div>`);
      } else if (!unref(items).length) {
        _push(`<div class="rounded border border-foreground/10 bg-card px-4 py-12 text-center text-sm text-foreground/60"> В этой рубрике пока нет материалов. </div>`);
      } else {
        _push(`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(ssrRenderComponent(_component_ArticleCard, {
            key: item.id,
            item,
            "image-aspect": "video",
            variant: "compact",
            class: "h-[320px]"
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div><aside class="lg:col-span-1">`);
      _push(ssrRenderComponent(_component_SidebarByCategory, {
        groups: unref(latestByCategory) || []
      }, null, _parent));
      _push(`</aside></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/category/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-Cbb_lgzS.mjs.map
