import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1 } from './AdminTabs-X7QJWm1s.mjs';
import { _ as __nuxt_component_1$1 } from './SimpleBarChart-DHDsPXwd.mjs';
import { defineComponent, ref, watch, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { c as useRoute } from './server.mjs';
import { a as useAuth, u as useApi } from './useAuth-8H_2G1XE.mjs';
import { u as useMediaUrl } from './useMediaUrl-DKS3WinY.mjs';
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

const materialsLimit = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    useAuth();
    useApi();
    const editBio = ref("");
    const editPosition = ref("");
    ref(null);
    const avatarPreview = ref(null);
    const saving = ref(false);
    const saveMessage = ref("");
    watch(
      () => data.value?.author,
      (author) => {
        if (author) {
          editBio.value = author.bio || "";
          editPosition.value = author.position || "";
          avatarPreview.value = useMediaUrl(author.avatarMedia?.path) || null;
        }
      },
      { immediate: true }
    );
    const data = ref(null);
    const loading = ref(false);
    const error = ref("");
    const materialsOffset = ref(0);
    const materialsSort = ref("updatedAt");
    const materialsOrder = ref("desc");
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
    const typeRouteMap = {
      article: "articles",
      news: "news",
      video: "videos",
      gallery: "gallery"
    };
    function formatDate(date) {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    }
    const chartData = computed(() => {
      if (!data.value?.dailyViews.length) return [];
      return data.value.dailyViews.map((day) => ({
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
    const typeCounts = computed(() => {
      const counts = {};
      if (!data.value) return counts;
      for (const m of data.value.materials) {
        counts[m.type] = (counts[m.type] || 0) + 1;
      }
      return counts;
    });
    const sortedMaterials = computed(() => {
      if (!data.value) return [];
      const field = materialsSort.value;
      const order = materialsOrder.value;
      return [...data.value.materials].sort((a, b) => {
        let av = a[field];
        let bv = b[field];
        if (av === null || av === void 0) av = "";
        if (bv === null || bv === void 0) bv = "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return order === "asc" ? -1 : 1;
        if (av > bv) return order === "asc" ? 1 : -1;
        return 0;
      });
    });
    const paginatedMaterials = computed(() => {
      return sortedMaterials.value.slice(materialsOffset.value, materialsOffset.value + materialsLimit);
    });
    const materialsTotalPages = computed(() => Math.max(1, Math.ceil((data.value?.materials.length || 0) / materialsLimit)));
    const materialsCurrentPage = computed(() => Math.floor(materialsOffset.value / materialsLimit) + 1);
    function materialsSortIcon(field) {
      if (materialsSort.value !== field) return "↕";
      return materialsOrder.value === "asc" ? "↑" : "↓";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      const _component_SimpleBarChart = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-004911cc><div class="mb-6 border-b border-foreground/10 pb-4" data-v-004911cc><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-004911cc>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-004911cc>Кабинет автора</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account/admin/authors",
        class: "text-sm text-accent hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Назад к авторам`);
          } else {
            return [
              createTextVNode("← Назад к авторам")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="mt-6 border border-foreground/10 bg-foreground/5 p-5" data-v-004911cc><h2 class="mb-4 text-lg font-bold" data-v-004911cc>Редактировать профиль автора</h2><div class="grid gap-6 md:grid-cols-[120px_1fr]" data-v-004911cc><div data-v-004911cc>`);
      if (unref(avatarPreview)) {
        _push(`<div class="mb-2 h-28 w-28 overflow-hidden rounded-full" data-v-004911cc><img${ssrRenderAttr("src", unref(avatarPreview))} alt="Аватар" class="h-full w-full object-cover" data-v-004911cc></div>`);
      } else {
        _push(`<div class="mb-2 flex h-28 w-28 items-center justify-center rounded-full bg-green-600 text-2xl font-bold uppercase text-white" data-v-004911cc>${ssrInterpolate(unref(data)?.author.name?.charAt(0).toUpperCase() || "А")}</div>`);
      }
      _push(`<input type="file" accept="image/*" class="block w-full text-xs text-foreground/70 file:mr-2 file:rounded file:border-0 file:bg-accent file:px-2 file:py-1 file:text-xs file:text-black" data-v-004911cc></div><div class="space-y-4" data-v-004911cc><div data-v-004911cc><label class="mb-1 block text-xs text-foreground/60" data-v-004911cc>Должность</label><input${ssrRenderAttr("value", unref(editPosition))} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-004911cc></div><div data-v-004911cc><label class="mb-1 block text-xs text-foreground/60" data-v-004911cc>О авторе</label><textarea rows="4" class="w-full resize-none border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-004911cc>${ssrInterpolate(unref(editBio))}</textarea></div><div class="flex items-center gap-4" data-v-004911cc><button type="button" class="rounded bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-004911cc>${ssrInterpolate(unref(saving) ? "Сохранение..." : "Сохранить")}</button>`);
      if (unref(saveMessage)) {
        _push(`<span class="${ssrRenderClass([unref(saveMessage) === "Сохранено" ? "text-green-500" : "text-red-500", "text-sm"])}" data-v-004911cc>${ssrInterpolate(unref(saveMessage))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
      _push(ssrRenderComponent(_component_AdminTabs, { class: "mt-6" }, null, _parent));
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-004911cc>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-004911cc>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(data) && !unref(loading)) {
        _push(`<!--[--><div class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]" data-v-004911cc><div class="border border-foreground/10 bg-foreground/5 p-5" data-v-004911cc><h2 class="mb-4 text-lg font-bold" data-v-004911cc>${ssrInterpolate(unref(data).author.name)}</h2><dl class="space-y-3 text-sm" data-v-004911cc><div data-v-004911cc><dt class="text-xs text-foreground/60" data-v-004911cc>Slug</dt><dd class="font-mono text-xs" data-v-004911cc>${ssrInterpolate(unref(data).author.slug)}</dd></div><div data-v-004911cc><dt class="text-xs text-foreground/60" data-v-004911cc>Должность</dt><dd data-v-004911cc>${ssrInterpolate(unref(data).author.position || "—")}</dd></div>`);
        if (unref(data).author.user) {
          _push(`<div data-v-004911cc><dt class="text-xs text-foreground/60" data-v-004911cc>Пользователь</dt><dd data-v-004911cc>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/account/admin/users/${unref(data).author.user.id}`,
            class: "text-accent hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(data).author.user.username || unref(data).author.user.email)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(data).author.user.username || unref(data).author.user.email), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<span class="ml-2 text-xs text-foreground/50" data-v-004911cc>(${ssrInterpolate(unref(data).author.user.role)})</span></dd></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div data-v-004911cc><dt class="text-xs text-foreground/60" data-v-004911cc>Всего материалов</dt><dd class="text-2xl font-bold" data-v-004911cc>${ssrInterpolate(unref(data).materials.length)}</dd></div><div data-v-004911cc><dt class="text-xs text-foreground/60" data-v-004911cc>Всего просмотров</dt><dd class="text-2xl font-bold" data-v-004911cc>${ssrInterpolate(unref(data).totalViews.toLocaleString("ru-RU"))}</dd></div></dl></div><div class="border border-foreground/10 bg-foreground/5 p-5" data-v-004911cc><h3 class="mb-4 text-lg font-bold" data-v-004911cc>Материалы по типам</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-4" data-v-004911cc><!--[-->`);
        ssrRenderList(["article", "news", "video", "gallery"], (type) => {
          _push(`<div class="border border-foreground/10 bg-foreground/5 p-3" data-v-004911cc><p class="text-xs text-foreground/60" data-v-004911cc>${ssrInterpolate(typeLabels[type] || type)}</p><p class="text-xl font-bold" data-v-004911cc>${ssrInterpolate(unref(typeCounts)[type] || 0)}</p></div>`);
        });
        _push(`<!--]--></div><h3 class="mb-2 mt-6 text-lg font-bold" data-v-004911cc>Просмотры по датам</h3><div class="h-48 w-full overflow-hidden border border-foreground/10 bg-foreground/5 p-2" data-v-004911cc>`);
        if (unref(chartData).length) {
          _push(ssrRenderComponent(_component_SimpleBarChart, {
            data: unref(chartData),
            color: "var(--color-accent)",
            height: 180
          }, null, _parent));
        } else {
          _push(`<p class="flex h-full items-center justify-center text-sm text-foreground/60" data-v-004911cc>Нет данных о просмотрах по дням</p>`);
        }
        _push(`</div></div></div><div class="mt-8" data-v-004911cc><h3 class="mb-4 text-lg font-bold" data-v-004911cc>Все записи автора</h3><div class="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60" data-v-004911cc><p data-v-004911cc>Всего: ${ssrInterpolate(unref(data).materials.length)}</p><p data-v-004911cc>Страница ${ssrInterpolate(unref(materialsCurrentPage))} из ${ssrInterpolate(unref(materialsTotalPages))}</p></div>`);
        if (!unref(data).materials.length) {
          _push(`<div class="text-sm text-foreground/60" data-v-004911cc>Нет записей</div>`);
        } else {
          _push(`<div class="overflow-x-auto" data-v-004911cc><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-004911cc><thead class="bg-foreground/10" data-v-004911cc><tr data-v-004911cc><th class="border border-foreground/10 px-3 py-2 text-left" data-v-004911cc>Статус</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-004911cc>Тип</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-004911cc>Заголовок</th><th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" data-v-004911cc><span class="inline-flex items-center gap-1" data-v-004911cc>Просмотры <span class="text-foreground/40" data-v-004911cc>${ssrInterpolate(materialsSortIcon("viewsTotal"))}</span></span></th><th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" data-v-004911cc><span class="inline-flex items-center gap-1" data-v-004911cc>Опубликовано <span class="text-foreground/40" data-v-004911cc>${ssrInterpolate(materialsSortIcon("publishedAt"))}</span></span></th><th class="cursor-pointer select-none border border-foreground/10 px-3 py-2 text-left hover:bg-foreground/10" data-v-004911cc><span class="inline-flex items-center gap-1" data-v-004911cc>Обновлено <span class="text-foreground/40" data-v-004911cc>${ssrInterpolate(materialsSortIcon("updatedAt"))}</span></span></th></tr></thead><tbody data-v-004911cc><!--[-->`);
          ssrRenderList(unref(paginatedMaterials), (m) => {
            _push(`<tr class="bg-foreground/5" data-v-004911cc><td class="border border-foreground/10 px-3 py-2" data-v-004911cc><span class="inline-flex items-center gap-1.5 text-xs" data-v-004911cc><span class="${ssrRenderClass([statusColors[m.status] || "bg-gray-400", "h-2 w-2 rounded-full"])}" data-v-004911cc></span> ${ssrInterpolate(statusLabels[m.status] || m.status)}</span></td><td class="border border-foreground/10 px-3 py-2" data-v-004911cc>${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-3 py-2" data-v-004911cc>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/${typeRouteMap[m.type] || m.type}/${m.slug}`,
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
            _push(`</td><td class="border border-foreground/10 px-3 py-2" data-v-004911cc>${ssrInterpolate(m.viewsTotal || 0)}</td><td class="border border-foreground/10 px-3 py-2" data-v-004911cc>${ssrInterpolate(formatDate(m.publishedAt))}</td><td class="border border-foreground/10 px-3 py-2" data-v-004911cc>${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        if (unref(materialsTotalPages) > 1) {
          _push(`<div class="mt-4 flex flex-wrap items-center justify-between gap-3" data-v-004911cc><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(materialsCurrentPage) <= 1) ? " disabled" : ""} data-v-004911cc>← Назад</button><div class="flex flex-wrap items-center gap-1" data-v-004911cc><!--[-->`);
          ssrRenderList(unref(materialsTotalPages), (page) => {
            _push(`<button class="${ssrRenderClass([page === unref(materialsCurrentPage) ? "bg-accent text-black" : "border border-foreground/10 bg-foreground/5 hover:bg-foreground/10", "h-8 min-w-[2rem] px-2 text-xs transition"])}" data-v-004911cc>${ssrInterpolate(page)}</button>`);
          });
          _push(`<!--]--></div><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(materialsCurrentPage) >= unref(materialsTotalPages)) ? " disabled" : ""} data-v-004911cc>Вперёд →</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/authors/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-004911cc"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-CnMFh12V.mjs.map
