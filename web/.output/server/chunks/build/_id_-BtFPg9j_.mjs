import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1 } from './SimpleBarChart-DHDsPXwd.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { c as useRoute } from './server.mjs';
import { a as useAuth, u as useApi } from './useAuth-2AbBXMNZ.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const limit = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    useAuth();
    useApi();
    const profile = ref(null);
    const materials = ref([]);
    const loading = ref(false);
    const error = ref("");
    const total = ref(0);
    const page = ref(1);
    const analytics = ref(null);
    const analyticsError = ref("");
    const currentPage = computed(() => page.value);
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));
    const roleLabels = {
      member: "Читатель",
      author: "Автор",
      editor: "Редактор",
      admin: "Админ"
    };
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
    const chartData = computed(() => {
      if (!analytics.value?.dailyViews.length) return [];
      return analytics.value.dailyViews.map((day) => ({
        label: formatDate(day.date),
        value: day.totalViews || 0,
        title: `${formatDate(day.date)}
Всего: ${day.totalViews || 0}
Статьи: ${day.articleViews || 0}
Новости: ${day.newsViews || 0}
Видео: ${day.videoViews || 0}
Галереи: ${day.galleryViews || 0}`
      }));
    });
    const analyticsTypeCounts = computed(() => {
      const counts = {};
      if (!analytics.value) return counts;
      for (const m of analytics.value.materials) {
        counts[m.type] = (counts[m.type] || 0) + 1;
      }
      return counts;
    });
    function formatDate(date) {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_SimpleBarChart = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-d43e4ac4><div class="mb-6 border-b border-foreground/10 pb-4" data-v-d43e4ac4><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-d43e4ac4>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-d43e4ac4>Профиль пользователя</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account/admin",
        class: "text-sm text-accent hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Назад к пользователям`);
          } else {
            return [
              createTextVNode("← Назад к пользователям")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-d43e4ac4>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-d43e4ac4>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(profile)) {
        _push(`<div class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]" data-v-d43e4ac4><div class="border border-foreground/10 bg-foreground/5 p-5" data-v-d43e4ac4><h2 class="mb-4 text-lg font-bold" data-v-d43e4ac4>${ssrInterpolate(unref(profile).displayName || unref(profile).username || unref(profile).email)}</h2><dl class="space-y-3 text-sm" data-v-d43e4ac4><div data-v-d43e4ac4><dt class="text-xs text-foreground/60" data-v-d43e4ac4>Email</dt><dd data-v-d43e4ac4>${ssrInterpolate(unref(profile).email)}</dd></div><div data-v-d43e4ac4><dt class="text-xs text-foreground/60" data-v-d43e4ac4>Логин</dt><dd data-v-d43e4ac4>${ssrInterpolate(unref(profile).username || "—")}</dd></div><div data-v-d43e4ac4><dt class="text-xs text-foreground/60" data-v-d43e4ac4>Отображаемое имя</dt><dd data-v-d43e4ac4>${ssrInterpolate(unref(profile).displayName || "—")}</dd></div><div data-v-d43e4ac4><dt class="text-xs text-foreground/60" data-v-d43e4ac4>Роль</dt><dd data-v-d43e4ac4>${ssrInterpolate(roleLabels[unref(profile).role] || unref(profile).role)}</dd></div><div data-v-d43e4ac4><dt class="text-xs text-foreground/60" data-v-d43e4ac4>Создан</dt><dd data-v-d43e4ac4>${ssrInterpolate(formatDate(unref(profile).createdAt))}</dd></div></dl></div><div data-v-d43e4ac4>`);
        if (unref(analyticsError)) {
          _push(`<p class="mb-2 text-sm text-red-600" data-v-d43e4ac4>${ssrInterpolate(unref(analyticsError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(analytics)) {
          _push(`<div class="mb-6 border border-foreground/10 bg-foreground/5 p-5" data-v-d43e4ac4><div class="mb-4 flex flex-wrap items-center justify-between gap-3" data-v-d43e4ac4><h3 class="text-lg font-bold" data-v-d43e4ac4>Статистика автора</h3><button class="btn-secondary text-xs" data-v-d43e4ac4>⬇ Скачать CSV</button></div><div class="grid grid-cols-2 gap-3 sm:grid-cols-4" data-v-d43e4ac4><!--[-->`);
          ssrRenderList(["article", "news", "video", "gallery"], (type) => {
            _push(`<div class="border border-foreground/10 bg-foreground/5 p-3" data-v-d43e4ac4><p class="text-xs text-foreground/60" data-v-d43e4ac4>${ssrInterpolate(typeLabels[type] || type)}</p><p class="text-xl font-bold" data-v-d43e4ac4>${ssrInterpolate(unref(analyticsTypeCounts)[type] || 0)}</p></div>`);
          });
          _push(`<!--]--></div><div class="mt-4 grid grid-cols-2 gap-3" data-v-d43e4ac4><div class="border border-foreground/10 bg-foreground/5 p-3" data-v-d43e4ac4><p class="text-xs text-foreground/60" data-v-d43e4ac4>Всего материалов</p><p class="text-xl font-bold" data-v-d43e4ac4>${ssrInterpolate(unref(analytics).materials.length)}</p></div><div class="border border-foreground/10 bg-foreground/5 p-3" data-v-d43e4ac4><p class="text-xs text-foreground/60" data-v-d43e4ac4>Всего просмотров</p><p class="text-xl font-bold" data-v-d43e4ac4>${ssrInterpolate(unref(analytics).totalViews.toLocaleString("ru-RU"))}</p></div></div><h4 class="mb-2 mt-6 text-sm font-bold" data-v-d43e4ac4>Просмотры по датам</h4><div class="h-48 w-full overflow-hidden border border-foreground/10 bg-foreground/5 p-2" data-v-d43e4ac4>`);
          if (unref(chartData).length) {
            _push(ssrRenderComponent(_component_SimpleBarChart, {
              data: unref(chartData),
              color: "var(--color-accent)",
              height: 180
            }, null, _parent));
          } else {
            _push(`<p class="flex h-full items-center justify-center text-sm text-foreground/60" data-v-d43e4ac4> Нет данных о просмотрах по дням </p>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h3 class="mb-4 text-lg font-bold" data-v-d43e4ac4>Записи пользователя</h3>`);
        if (!unref(profile).authorId) {
          _push(`<p class="text-sm text-foreground/60" data-v-d43e4ac4>У пользователя ещё нет автора, записей нет.</p>`);
        } else if (!unref(materials).length) {
          _push(`<div class="text-sm text-foreground/60" data-v-d43e4ac4>Нет записей</div>`);
        } else {
          _push(`<div data-v-d43e4ac4><p class="mb-2 text-xs text-foreground/60" data-v-d43e4ac4>Всего: ${ssrInterpolate(unref(total))} · Страница ${ssrInterpolate(unref(currentPage))} из ${ssrInterpolate(unref(totalPages))}</p><div class="overflow-x-auto" data-v-d43e4ac4><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-d43e4ac4><thead class="bg-foreground/10" data-v-d43e4ac4><tr data-v-d43e4ac4><th class="border border-foreground/10 px-3 py-2 text-left" data-v-d43e4ac4>Статус</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-d43e4ac4>Тип</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-d43e4ac4>Заголовок</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-d43e4ac4>Просмотры</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-d43e4ac4>Обновлено</th></tr></thead><tbody data-v-d43e4ac4><!--[-->`);
          ssrRenderList(unref(materials), (m) => {
            _push(`<tr class="bg-foreground/5" data-v-d43e4ac4><td class="border border-foreground/10 px-3 py-2" data-v-d43e4ac4><span class="inline-flex items-center gap-1.5 text-xs" data-v-d43e4ac4><span class="${ssrRenderClass([statusColors[m.status] || "bg-gray-400", "h-2 w-2 rounded-full"])}" data-v-d43e4ac4></span> ${ssrInterpolate(statusLabels[m.status] || m.status)}</span></td><td class="border border-foreground/10 px-3 py-2" data-v-d43e4ac4>${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-3 py-2" data-v-d43e4ac4>`);
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
            _push(`</td><td class="border border-foreground/10 px-3 py-2" data-v-d43e4ac4>${ssrInterpolate(m.viewsTotal || 0)}</td><td class="border border-foreground/10 px-3 py-2" data-v-d43e4ac4>${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
          if (!unref(loading) && unref(totalPages) > 1) {
            _push(`<div class="mt-4 flex flex-wrap items-center justify-between gap-3" data-v-d43e4ac4><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(currentPage) <= 1) ? " disabled" : ""} data-v-d43e4ac4> ← Назад </button><div class="flex flex-wrap items-center gap-1" data-v-d43e4ac4><!--[-->`);
            ssrRenderList(unref(totalPages), (p) => {
              _push(`<button class="${ssrRenderClass([p === unref(currentPage) ? "bg-accent text-black" : "border border-foreground/10 bg-foreground/5 hover:bg-foreground/10", "h-8 min-w-[2rem] px-2 text-xs transition"])}" data-v-d43e4ac4>${ssrInterpolate(p)}</button>`);
            });
            _push(`<!--]--></div><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(currentPage) >= unref(totalPages)) ? " disabled" : ""} data-v-d43e4ac4> Вперёд → </button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/users/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d43e4ac4"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-BtFPg9j_.mjs.map
