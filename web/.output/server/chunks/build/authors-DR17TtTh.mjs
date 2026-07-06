import { _ as __nuxt_component_0 } from './nuxt-link-D9D3wLLz.mjs';
import { _ as __nuxt_component_1 } from './AdminTabs-DT1QtKYB.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-CCtjg5A5.mjs';
import { u as useApi } from './useApi-Bz4iiPAp.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "authors",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useApi();
    const authors = ref([]);
    const loading = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))}><div class="mb-6 border-b border-foreground/10 pb-4"><p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold">Авторы</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account",
        class: "text-sm text-accent hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Назад в кабинет`);
          } else {
            return [
              createTextVNode("← Назад в кабинет")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminTabs, { class: "mt-6" }, null, _parent));
      _push(`<div class="mt-6 flex items-center justify-end"><button class="text-sm text-accent hover:underline">Обновить</button></div>`);
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60">Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && unref(authors).length) {
        _push(`<p class="mt-4 text-sm text-foreground/60"> Всего: ${ssrInterpolate(unref(authors).length)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && unref(authors).length) {
        _push(`<div class="mt-4 overflow-x-auto"><table class="w-full border-collapse border border-foreground/10 text-sm"><thead class="bg-foreground/10"><tr><th class="border border-foreground/10 px-4 py-2 text-left">Имя</th><th class="border border-foreground/10 px-4 py-2 text-left">Slug</th><th class="border border-foreground/10 px-4 py-2 text-left">Должность</th><th class="border border-foreground/10 px-4 py-2 text-left">Материалов</th><th class="border border-foreground/10 px-4 py-2 text-left">Пользователь</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(authors), (a) => {
          _push(`<tr class="bg-foreground/5"><td class="border border-foreground/10 px-4 py-2">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/account/admin/authors/${a.id}`,
            class: "text-accent hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(a.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(a.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="border border-foreground/10 px-4 py-2 font-mono text-xs">${ssrInterpolate(a.slug)}</td><td class="border border-foreground/10 px-4 py-2">${ssrInterpolate(a.position || "—")}</td><td class="border border-foreground/10 px-4 py-2">${ssrInterpolate(a.materialsCount)}</td><td class="border border-foreground/10 px-4 py-2">`);
          if (a.user) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/account/admin/users/${a.user.id}`,
              class: "text-accent hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(a.user.username || a.user.email)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(a.user.username || a.user.email), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span class="text-foreground/50">—</span>`);
          }
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(authors).length) {
        _push(`<p class="mt-6 text-sm text-foreground/60">Нет авторов</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/authors.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=authors-DR17TtTh.mjs.map
