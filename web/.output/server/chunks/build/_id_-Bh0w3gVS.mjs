import { _ as __nuxt_component_0 } from './nuxt-link-M1kxXMe5.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { b as useRoute } from './server.mjs';
import { u as useAuth } from './useAuth-By8wIj1o.mjs';
import { u as useApi } from './useApi-DkRD3FHh.mjs';
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
    function formatDate(date) {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))}><div class="mb-6 border-b border-foreground/10 pb-4"><p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold">Профиль пользователя</h1></div>`);
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
        _push(`<p class="mt-6 text-sm text-foreground/60">Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(profile)) {
        _push(`<div class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]"><div class="border border-foreground/10 bg-foreground/5 p-5"><h2 class="mb-4 text-lg font-bold">${ssrInterpolate(unref(profile).displayName || unref(profile).username || unref(profile).email)}</h2><dl class="space-y-3 text-sm"><div><dt class="text-xs text-foreground/60">Email</dt><dd>${ssrInterpolate(unref(profile).email)}</dd></div><div><dt class="text-xs text-foreground/60">Логин</dt><dd>${ssrInterpolate(unref(profile).username || "—")}</dd></div><div><dt class="text-xs text-foreground/60">Отображаемое имя</dt><dd>${ssrInterpolate(unref(profile).displayName || "—")}</dd></div><div><dt class="text-xs text-foreground/60">Роль</dt><dd>${ssrInterpolate(roleLabels[unref(profile).role] || unref(profile).role)}</dd></div><div><dt class="text-xs text-foreground/60">Создан</dt><dd>${ssrInterpolate(formatDate(unref(profile).createdAt))}</dd></div></dl></div><div><h3 class="mb-4 text-lg font-bold">Записи пользователя</h3>`);
        if (!unref(profile).authorId) {
          _push(`<p class="text-sm text-foreground/60">У пользователя ещё нет автора, записей нет.</p>`);
        } else if (!unref(materials).length) {
          _push(`<div class="text-sm text-foreground/60">Нет записей</div>`);
        } else {
          _push(`<div class="overflow-x-auto"><table class="w-full border-collapse border border-foreground/10 text-sm"><thead class="bg-foreground/10"><tr><th class="border border-foreground/10 px-3 py-2 text-left">Статус</th><th class="border border-foreground/10 px-3 py-2 text-left">Тип</th><th class="border border-foreground/10 px-3 py-2 text-left">Заголовок</th><th class="border border-foreground/10 px-3 py-2 text-left">Просмотры</th><th class="border border-foreground/10 px-3 py-2 text-left">Обновлено</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(materials), (m) => {
            _push(`<tr class="bg-foreground/5"><td class="border border-foreground/10 px-3 py-2"><span class="inline-flex items-center gap-1.5 text-xs"><span class="${ssrRenderClass([statusColors[m.status] || "bg-gray-400", "h-2 w-2 rounded-full"])}"></span> ${ssrInterpolate(statusLabels[m.status] || m.status)}</span></td><td class="border border-foreground/10 px-3 py-2">${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-3 py-2">`);
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
            _push(`</td><td class="border border-foreground/10 px-3 py-2">${ssrInterpolate(m.viewsTotal || 0)}</td><td class="border border-foreground/10 px-3 py-2">${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
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

export { _sfc_main as default };
//# sourceMappingURL=_id_-Bh0w3gVS.mjs.map
