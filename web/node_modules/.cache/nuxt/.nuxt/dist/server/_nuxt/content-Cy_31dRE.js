import { _ as __nuxt_component_0 } from "./nuxt-link-M1kxXMe5.js";
import { _ as __nuxt_component_1 } from "./AdminTabs-Dtsr-Vu5.js";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from "vue/server-renderer";
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
  __name: "content",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useApi();
    const materials = ref([]);
    const total = ref(0);
    const counts = ref([]);
    const loading = ref(false);
    const error = ref("");
    const typeFilter = ref("");
    const statusFilter = ref("");
    const search = ref("");
    const typeOptions = [
      { value: "", label: "Все типы" },
      { value: "article", label: "Статьи" },
      { value: "news", label: "Новости" },
      { value: "video", label: "Видео" },
      { value: "gallery", label: "Галереи" }
    ];
    const statusOptions = [
      { value: "", label: "Все статусы" },
      { value: "draft", label: "Черновик" },
      { value: "in_review", label: "На проверке" },
      { value: "published", label: "Опубликовано" },
      { value: "rejected", label: "Отклонено" }
    ];
    const typeLabels = {
      article: "Статья",
      news: "Новость",
      video: "Видео",
      gallery: "Галерея"
    };
    const statusLabels = {
      draft: "Черновик",
      in_review: "На проверке",
      published: "Опубликовано",
      rejected: "Отклонено"
    };
    const statusColors = {
      draft: "bg-orange-500",
      in_review: "bg-yellow-500",
      published: "bg-accent",
      rejected: "bg-red-600"
    };
    function countForType(type) {
      return counts.value.find((c) => c.type === type)?._count?.type || 0;
    }
    function formatDate(date) {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-1b1ed9c2><div class="mb-6 border-b border-foreground/10 pb-4" data-v-1b1ed9c2><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-1b1ed9c2>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-1b1ed9c2>Материалы</h1></div>`);
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
      _push(`<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-v-1b1ed9c2><!--[-->`);
      ssrRenderList(typeOptions.filter((o) => o.value), (opt) => {
        _push(`<div class="border border-foreground/10 bg-foreground/5 p-3" data-v-1b1ed9c2><p class="text-xs text-foreground/60" data-v-1b1ed9c2>${ssrInterpolate(opt.label)}</p><p class="text-xl font-bold" data-v-1b1ed9c2>${ssrInterpolate(countForType(opt.value))}</p></div>`);
      });
      _push(`<!--]--></div><div class="mt-6 flex flex-wrap items-end gap-3" data-v-1b1ed9c2><div data-v-1b1ed9c2><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-1b1ed9c2>Тип</label><select class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" data-v-1b1ed9c2><!--[-->`);
      ssrRenderList(typeOptions, (opt) => {
        _push(`<option${ssrRenderAttr("value", opt.value)} data-v-1b1ed9c2${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), opt.value) : ssrLooseEqual(unref(typeFilter), opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-1b1ed9c2><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-1b1ed9c2>Статус</label><select class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" data-v-1b1ed9c2><!--[-->`);
      ssrRenderList(statusOptions, (opt) => {
        _push(`<option${ssrRenderAttr("value", opt.value)} data-v-1b1ed9c2${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), opt.value) : ssrLooseEqual(unref(statusFilter), opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-1b1ed9c2><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-1b1ed9c2>Поиск по заголовку</label><input${ssrRenderAttr("value", unref(search))} type="text" class="border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Введите заголовок..." data-v-1b1ed9c2></div><button class="btn-primary" data-v-1b1ed9c2>Найти</button><button class="btn-secondary" data-v-1b1ed9c2>Сбросить</button></div>`);
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-1b1ed9c2>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-1b1ed9c2>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-4 text-xs text-foreground/60" data-v-1b1ed9c2>Всего: ${ssrInterpolate(unref(total))}</p>`);
      if (!unref(loading) && unref(materials).length) {
        _push(`<div class="mt-4 overflow-x-auto" data-v-1b1ed9c2><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-1b1ed9c2><thead class="bg-foreground/10" data-v-1b1ed9c2><tr data-v-1b1ed9c2><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Статус</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Тип</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Заголовок</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Автор</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Просмотры</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-1b1ed9c2>Обновлено</th></tr></thead><tbody data-v-1b1ed9c2><!--[-->`);
        ssrRenderList(unref(materials), (m) => {
          _push(`<tr class="bg-foreground/5" data-v-1b1ed9c2><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2><span class="inline-flex items-center gap-1.5 text-xs" data-v-1b1ed9c2><span class="${ssrRenderClass([statusColors[m.status] || "bg-gray-400", "h-2 w-2 rounded-full"])}" data-v-1b1ed9c2></span> ${ssrInterpolate(statusLabels[m.status] || m.status)}</span></td><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2>${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/${m.type === "article" ? "articles" : m.type === "news" ? "news" : m.type === "video" ? "videos" : "gallery"}/${m.slug}`,
            class: "hover:text-foreground hover:underline",
            target: "_blank"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(m.title)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(m.title), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2>${ssrInterpolate(m.author?.name || "—")}</td><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2>${ssrInterpolate(m.viewsTotal || 0)}</td><td class="border border-foreground/10 px-4 py-2" data-v-1b1ed9c2>${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(materials).length) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-1b1ed9c2>Материалы не найдены</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/content.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const content = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1b1ed9c2"]]);
export {
  content as default
};
//# sourceMappingURL=content-Cy_31dRE.js.map
