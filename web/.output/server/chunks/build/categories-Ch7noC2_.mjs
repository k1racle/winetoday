import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1 } from './AdminTabs-X7QJWm1s.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { a as useAuth, u as useApi } from './useAuth-8H_2G1XE.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
  __name: "categories",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useApi();
    const categories2 = ref([]);
    const loading = ref(false);
    const error = ref("");
    const message = ref("");
    const showModal = ref(false);
    const editing = ref(null);
    const form = reactive({
      name: "",
      slug: "",
      parentId: ""
    });
    function parentName(id) {
      if (!id) return "—";
      const parent = categories2.value.find((c) => c.id === id);
      return parent ? parent.name : "—";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-a73efa6c><div class="mb-6 border-b border-foreground/10 pb-4" data-v-a73efa6c><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-a73efa6c>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-a73efa6c>Рубрики</h1></div>`);
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
      _push(`<div class="mt-6 flex items-center justify-between" data-v-a73efa6c><button class="btn-primary" data-v-a73efa6c>＋ Добавить рубрику</button><button class="text-sm text-accent hover:underline" data-v-a73efa6c>Обновить</button></div>`);
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-a73efa6c>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-a73efa6c>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(message)) {
        _push(`<p class="mt-6 text-sm text-green-600" data-v-a73efa6c>${ssrInterpolate(unref(message))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && unref(categories2).length) {
        _push(`<div class="mt-6 overflow-x-auto" data-v-a73efa6c><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-a73efa6c><thead class="bg-foreground/10" data-v-a73efa6c><tr data-v-a73efa6c><th class="border border-foreground/10 px-4 py-2 text-left" data-v-a73efa6c>Название</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-a73efa6c>Slug</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-a73efa6c>Родитель</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-a73efa6c>Действия</th></tr></thead><tbody data-v-a73efa6c><!--[-->`);
        ssrRenderList(unref(categories2), (item) => {
          _push(`<tr class="bg-foreground/5" data-v-a73efa6c><td class="border border-foreground/10 px-4 py-2" data-v-a73efa6c>${ssrInterpolate(item.name)}</td><td class="border border-foreground/10 px-4 py-2" data-v-a73efa6c>${ssrInterpolate(item.slug)}</td><td class="border border-foreground/10 px-4 py-2" data-v-a73efa6c>${ssrInterpolate(parentName(item.parentId))}</td><td class="border border-foreground/10 px-4 py-2" data-v-a73efa6c><div class="flex flex-wrap gap-2" data-v-a73efa6c><button class="text-xs text-foreground/70 hover:underline" data-v-a73efa6c>Изменить</button><button class="text-xs text-red-600 hover:underline" data-v-a73efa6c>Удалить</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(categories2).length) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-a73efa6c>Нет рубрик</p>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-a73efa6c>`);
          if (unref(showModal)) {
            _push2(`<div class="relative mt-8 w-full max-w-md overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl" data-v-a73efa6c><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-a73efa6c><h2 class="text-lg font-bold" data-v-a73efa6c>${ssrInterpolate(unref(editing) ? "Редактировать рубрику" : "Добавить рубрику")}</h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" data-v-a73efa6c>✕</button></div><div class="space-y-4 p-6" data-v-a73efa6c><div data-v-a73efa6c><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-a73efa6c>Название <span class="text-red-600" data-v-a73efa6c>*</span></label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Например, Российское виноделие" data-v-a73efa6c></div><div data-v-a73efa6c><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-a73efa6c>Slug <span class="text-red-600" data-v-a73efa6c>*</span></label><input${ssrRenderAttr("value", unref(form).slug)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="rossiyskoe-vinodelie" data-v-a73efa6c></div><div data-v-a73efa6c><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-a73efa6c>Родительская рубрика</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-a73efa6c><option value="" data-v-a73efa6c${ssrIncludeBooleanAttr(Array.isArray(unref(form).parentId) ? ssrLooseContain(unref(form).parentId, "") : ssrLooseEqual(unref(form).parentId, "")) ? " selected" : ""}>— нет —</option><!--[-->`);
            ssrRenderList(unref(categories2), (c) => {
              _push2(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(unref(editing) && c.id === unref(editing).id) ? " disabled" : ""} data-v-a73efa6c${ssrIncludeBooleanAttr(Array.isArray(unref(form).parentId) ? ssrLooseContain(unref(form).parentId, c.id) : ssrLooseEqual(unref(form).parentId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
            });
            _push2(`<!--]--></select></div><div class="flex justify-end gap-2 pt-2" data-v-a73efa6c><button class="btn-secondary" data-v-a73efa6c>Отмена</button><button class="btn-primary" data-v-a73efa6c>Сохранить</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/categories.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const categories = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a73efa6c"]]);

export { categories as default };
//# sourceMappingURL=categories-Ch7noC2_.mjs.map
