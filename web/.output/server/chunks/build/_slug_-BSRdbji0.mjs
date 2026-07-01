import { _ as __nuxt_component_0 } from './ContentDetail-UUaFczYf.mjs';
import { defineComponent, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { b as useRoute, c as createError, a as useSeoMeta } from './server.mjs';
import { u as useApi } from './useApi-DkRD3FHh.mjs';
import { u as useAsyncData } from './NuxtImg-BJV0ypiM.mjs';
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
import './ArticleCard-BaWiHPYX.mjs';
import './useMediaUrl-BBfhl7w5.mjs';
import './SidebarByCategory-zEk3F-tL.mjs';
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
    const { getArticle } = useApi();
    const { data: article, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `article-${route.params.slug}`,
      () => getArticle(route.params.slug, route.query.preview === "1")
    )), __temp = await __temp, __restore(), __temp);
    if (!article.value && error.value) {
      throw createError({ statusCode: 404, statusMessage: "Статья не найдена" });
    }
    useSeoMeta({
      title: article.value?.seo?.metaTitle || article.value?.title,
      description: article.value?.seo?.metaDescription || article.value?.excerpt
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentDetail = __nuxt_component_0;
      if (unref(article)) {
        _push(ssrRenderComponent(_component_ContentDetail, mergeProps({
          item: unref(article),
          "type-label": "Статьи",
          "type-route": "/articles"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-BSRdbji0.mjs.map
