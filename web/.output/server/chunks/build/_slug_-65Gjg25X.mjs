import { _ as __nuxt_component_0 } from './ContentDetail-B1BsWK3p.mjs';
import { defineComponent, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { b as useRoute, c as createError, a as useSeoMeta } from './server.mjs';
import { u as useApi } from './useApi-DaYJsQyz.mjs';
import { u as useAsyncData } from './NuxtImg-DCUDb8v0.mjs';
import './nuxt-link-D9D3wLLz.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './SidebarByCategory-CS-C-5mH.mjs';
import './ArticleCard-BzTIibt-.mjs';
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
    const { getNewsItem } = useApi();
    const { data: newsItem, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `news-${route.params.slug}`,
      () => getNewsItem(route.params.slug, route.query.preview === "1")
    )), __temp = await __temp, __restore(), __temp);
    if (!newsItem.value && error.value) {
      throw createError({ statusCode: 404, statusMessage: "Новость не найдена" });
    }
    useSeoMeta({
      title: newsItem.value?.seo?.metaTitle || newsItem.value?.title,
      description: newsItem.value?.seo?.metaDescription || newsItem.value?.excerpt
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentDetail = __nuxt_component_0;
      if (unref(newsItem)) {
        _push(ssrRenderComponent(_component_ContentDetail, mergeProps({
          item: unref(newsItem),
          "type-label": "Новости",
          "type-route": "/news"
        }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/news/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-65Gjg25X.mjs.map
