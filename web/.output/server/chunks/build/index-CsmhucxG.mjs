import { _ as __nuxt_component_1 } from './ArticleCard-llyqGrup.mjs';
import { _ as __nuxt_component_2 } from './SidebarByCategory-BSLAwApa.mjs';
import { withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useAuth-8H_2G1XE.mjs';
import { u as useAsyncData } from './asyncData-Ct_s6X-a.mjs';
import { b as useSeoMeta } from './server.mjs';
import './nuxt-link-DHNkfH9n.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './NuxtImg-Cgs3E8D7.mjs';
import './useMediaUrl-DKS3WinY.mjs';
import './sidebar-categories-DiHE4apX.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getArticles, getLatestByCategory } = useApi();
    const { data: list } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "articles-list",
      () => getArticles({ limit: 24 }).catch(() => ({ items: [], total: 0 }))
    )), __temp = await __temp, __restore(), __temp);
    const { data: latestByCategory } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "latest-by-category-articles",
      () => getLatestByCategory(10).catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const items = computed(() => list.value?.items || []);
    useSeoMeta({
      title: "Статьи",
      description: "Статьи о вине, виноделии и виноградарстве."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ArticleCard = __nuxt_component_1;
      const _component_SidebarByCategory = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-7xl px-4 py-8" }, _attrs))}><h1 class="mb-8 font-heading text-3xl font-bold">Статьи</h1><div class="grid gap-8 lg:grid-cols-4"><div class="lg:col-span-3"><div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(unref(items), (article) => {
        _push(ssrRenderComponent(_component_ArticleCard, {
          key: article.id,
          item: article,
          imageAspect: "video",
          hideExcerpt: ""
        }, null, _parent));
      });
      _push(`<!--]--></div></div><aside class="lg:col-span-1">`);
      _push(ssrRenderComponent(_component_SidebarByCategory, {
        groups: unref(latestByCategory) || []
      }, null, _parent));
      _push(`</aside></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CsmhucxG.mjs.map
