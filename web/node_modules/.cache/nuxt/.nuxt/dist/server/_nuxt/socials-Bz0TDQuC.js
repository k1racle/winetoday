import { _ as __nuxt_component_0 } from "./nuxt-link-M1kxXMe5.js";
import { _ as __nuxt_component_1 } from "./AdminTabs-Dtsr-Vu5.js";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { u as useAuth } from "./useAuth-By8wIj1o.js";
import { u as useApi } from "./useApi-DkRD3FHh.js";
import "C:/Project/winemaking/winetoday/web/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "C:/Project/winemaking/winetoday/web/node_modules/ufo/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/defu/dist/defu.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Project/winemaking/winetoday/web/node_modules/unctx/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Project/winemaking/winetoday/web/node_modules/klona/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "socials",
  __ssrInlineRender: true,
  setup(__props) {
    const ICON_OPTIONS = [
      { value: "youtube", label: "YouTube" },
      { value: "vk", label: "ВКонтакте" },
      { value: "ok", label: "Одноклассники" },
      { value: "telegram", label: "Telegram" },
      { value: "rutube", label: "RuTube" },
      { value: "dzen", label: "Дзен" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "link", label: "Общая ссылка" }
    ];
    useAuth();
    useApi();
    const title = ref("");
    const links = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref("");
    const message = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-35e40f08><div class="mb-6 border-b border-foreground/10 pb-4" data-v-35e40f08><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-35e40f08>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-35e40f08>Социальные сети</h1></div>`);
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
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-35e40f08>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-35e40f08>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(message)) {
        _push(`<p class="mt-6 text-sm text-green-600" data-v-35e40f08>${ssrInterpolate(unref(message))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading)) {
        _push(`<div class="mt-6 space-y-6" data-v-35e40f08><div data-v-35e40f08><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-35e40f08>Заголовок блока</label><input${ssrRenderAttr("value", unref(title))} type="text" class="w-full max-w-md border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Например, Мы в соцсетях" data-v-35e40f08></div><div class="space-y-4" data-v-35e40f08><!--[-->`);
        ssrRenderList(unref(links), (link, index) => {
          _push(`<div class="flex flex-col gap-3 rounded border border-foreground/10 bg-foreground/5 p-4 md:flex-row md:items-end" data-v-35e40f08><div class="flex-1" data-v-35e40f08><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-35e40f08>Название</label><input${ssrRenderAttr("value", link.label)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="YouTube" data-v-35e40f08></div><div class="flex-[2]" data-v-35e40f08><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-35e40f08>Ссылка</label><input${ssrRenderAttr("value", link.href)} type="url" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="https://youtube.com/@channel" data-v-35e40f08></div><div class="w-full md:w-48" data-v-35e40f08><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-35e40f08>Иконка</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-35e40f08><!--[-->`);
          ssrRenderList(ICON_OPTIONS, (opt) => {
            _push(`<option${ssrRenderAttr("value", opt.value)} data-v-35e40f08${ssrIncludeBooleanAttr(Array.isArray(link.icon) ? ssrLooseContain(link.icon, opt.value) : ssrLooseEqual(link.icon, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
          });
          _push(`<!--]--></select></div><button class="text-sm text-red-600 hover:underline" data-v-35e40f08>Удалить</button></div>`);
        });
        _push(`<!--]--></div><div class="flex flex-wrap items-center gap-3" data-v-35e40f08><button class="btn-primary" data-v-35e40f08>＋ Добавить соцсеть</button><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-35e40f08>${ssrInterpolate(unref(saving) ? "Сохранение..." : "Сохранить")}</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/socials.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const socials = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-35e40f08"]]);
export {
  socials as default
};
//# sourceMappingURL=socials-Bz0TDQuC.js.map
