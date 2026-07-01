import { _ as __nuxt_component_1 } from './ArticleCard-BaWiHPYX.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useApi-DkRD3FHh.mjs';
import { u as useAsyncData } from './NuxtImg-BJV0ypiM.mjs';
import { a as useSeoMeta } from './server.mjs';
import './nuxt-link-M1kxXMe5.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './useMediaUrl-BBfhl7w5.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getArticles } = useApi();
    const { data: list } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "articles-list",
      () => getArticles({ limit: 24 })
    )), __temp = await __temp, __restore(), __temp);
    useSeoMeta({
      title: "Статьи",
      description: "Статьи о вине, виноделии и виноградарстве."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ArticleCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))}><h1 class="mb-8 font-heading text-3xl font-bold">Статьи</h1><div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(unref(list)?.items, (article) => {
        _push(ssrRenderComponent(_component_ArticleCard, {
          key: article.id,
          item: article
        }, null, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-PmhuvRdm.mjs.map
