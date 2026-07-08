import { u as useContentSeo, _ as __nuxt_component_0 } from './useContentSeo-Dr0WBYsf.mjs';
import { defineComponent, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { c as useRoute, d as createError } from './server.mjs';
import { u as useApi } from './useAuth-2AbBXMNZ.mjs';
import { u as useAsyncData } from './sidebar-categories-B7iei0NP.mjs';
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
import './tiptap-html-DAudj7L6.mjs';
import './SidebarByCategory-DFuBu4iH.mjs';
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
    const { getVideo } = useApi();
    const { data: video, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `video-${route.params.slug}`,
      () => getVideo(route.params.slug, route.query.preview === "1")
    )), __temp = await __temp, __restore(), __temp);
    if (!video.value && error.value) {
      throw createError({ statusCode: 404, statusMessage: "Видео не найдено" });
    }
    useContentSeo(video.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentDetail = __nuxt_component_0;
      if (unref(video)) {
        _push(ssrRenderComponent(_component_ContentDetail, mergeProps({
          item: unref(video),
          "type-label": "Видео",
          "type-route": "/videos"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/videos/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DBYwxEOR.mjs.map
