import { u as useContentSeo, _ as __nuxt_component_0 } from './useContentSeo-By4Kv6IB.mjs';
import { defineComponent, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { c as useRoute, d as createError } from './server.mjs';
import { u as useApi } from './useAuth-8H_2G1XE.mjs';
import { u as useAsyncData } from './asyncData-Ct_s6X-a.mjs';
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
import './AuthorByline-HqjiVauP.mjs';
import './NuxtImg-Cgs3E8D7.mjs';
import './useMediaUrl-DKS3WinY.mjs';
import './tiptap-html-DAudj7L6.mjs';
import './ArticleCard-DJRcCNft.mjs';
import './SidebarByCategory-Hn42nTi1.mjs';
import './sidebar-categories-DiHE4apX.mjs';
import './useOgImageUrl-BmwPGeNg.mjs';
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
    const { getGallery } = useApi();
    const { data: gallery, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `gallery-${route.params.slug}`,
      () => getGallery(route.params.slug, route.query.preview === "1")
    )), __temp = await __temp, __restore(), __temp);
    if (!gallery.value && error.value) {
      throw createError({ statusCode: 404, statusMessage: "Галерея не найдена" });
    }
    useContentSeo(gallery.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentDetail = __nuxt_component_0;
      if (unref(gallery)) {
        _push(ssrRenderComponent(_component_ContentDetail, mergeProps({
          item: unref(gallery),
          "type-label": "Галереи",
          "type-route": "/gallery"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/gallery/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-B7d9w04d.mjs.map
