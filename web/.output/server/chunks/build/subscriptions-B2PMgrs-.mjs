import { _ as __nuxt_component_0 } from './AccountTabs-VzxNK_zy.mjs';
import { _ as __nuxt_component_1 } from './AuthorByline-HqjiVauP.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useAuth, u as useApi } from './useAuth-8H_2G1XE.mjs';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './NuxtImg-Cgs3E8D7.mjs';
import './useMediaUrl-DKS3WinY.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "subscriptions",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useApi();
    const subscriptions = ref([]);
    const loading = ref(false);
    const error = ref("");
    function remove(id) {
      subscriptions.value = subscriptions.value.filter((s) => s.id !== id);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AccountTabs = __nuxt_component_0;
      const _component_AuthorByline = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-7xl px-4 py-8" }, _attrs))}><h1 class="mb-2 font-heading text-2xl font-bold">Личный кабинет</h1>`);
      _push(ssrRenderComponent(_component_AccountTabs, { class: "mb-6" }, null, _parent));
      _push(`<h2 class="mb-4 font-heading text-xl font-bold">Подписки на авторов</h2>`);
      if (unref(loading)) {
        _push(`<p class="text-sm text-foreground/60">Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="text-sm text-red-500">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(subscriptions).length) {
        _push(`<div class="text-sm text-foreground/60"> Вы пока ни на кого не подписаны. </div>`);
      } else {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(subscriptions), (sub) => {
          _push(`<div class="flex items-center justify-between border border-foreground/10 bg-card p-4">`);
          _push(ssrRenderComponent(_component_AuthorByline, {
            author: sub.author,
            onChange: (v) => !v && remove(sub.id)
          }, null, _parent));
          _push(`<span class="text-xs text-foreground/50">${ssrInterpolate(new Date(sub.createdAt).toLocaleDateString("ru-RU"))}</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/subscriptions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=subscriptions-B2PMgrs-.mjs.map
