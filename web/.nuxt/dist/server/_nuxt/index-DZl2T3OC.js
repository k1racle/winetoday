import { _ as __nuxt_component_0 } from "./nuxt-link-M1kxXMe5.js";
import { _ as __nuxt_component_1 } from "./AdminTabs-Dtsr-Vu5.js";
import { defineComponent, ref, reactive, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useApi();
    const users = ref([]);
    const loading = ref(false);
    const error = ref("");
    const message = ref("");
    const roles = ["member", "editor", "author", "admin"];
    const roleLabels = {
      member: "Читатель",
      author: "Автор",
      editor: "Редактор",
      admin: "Админ"
    };
    const statusLabels = {
      draft: "Черновик",
      in_review: "На проверке",
      published: "Опубликовано",
      rejected: "Отклонено"
    };
    const typeLabels = {
      article: "Статья",
      news: "Новость",
      video: "Видео",
      gallery: "Галерея"
    };
    const showUserModal = ref(false);
    const editingUser = ref(null);
    const userForm = reactive({
      email: "",
      username: "",
      displayName: "",
      role: "member",
      password: ""
    });
    const showMaterialsModal = ref(false);
    const materialsUser = ref(null);
    const materials = ref([]);
    const materialsLoading = ref(false);
    function formatDate(date) {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminTabs = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-4427c1a1><div class="mb-6 border-b border-foreground/10 pb-4" data-v-4427c1a1><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-4427c1a1>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-4427c1a1>Пользователи</h1></div>`);
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
      _push(`<div class="mt-6 flex items-center justify-between" data-v-4427c1a1><div class="flex gap-4" data-v-4427c1a1><button class="btn-primary" data-v-4427c1a1>＋ Добавить пользователя</button></div><button class="text-sm text-accent hover:underline" data-v-4427c1a1>Обновить</button></div>`);
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-4427c1a1>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-4427c1a1>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(message)) {
        _push(`<p class="mt-6 text-sm text-green-600" data-v-4427c1a1>${ssrInterpolate(unref(message))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && unref(users).length) {
        _push(`<div class="mt-6 overflow-x-auto" data-v-4427c1a1><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-4427c1a1><thead class="bg-foreground/10" data-v-4427c1a1><tr data-v-4427c1a1><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Логин</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Email</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Имя</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Роль</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Создан</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-4427c1a1>Действия</th></tr></thead><tbody data-v-4427c1a1><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          _push(`<tr class="bg-foreground/5" data-v-4427c1a1><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1>${ssrInterpolate(u.username || "—")}</td><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1>${ssrInterpolate(u.email)}</td><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1>${ssrInterpolate(u.displayName || "—")}</td><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1><select${ssrRenderAttr("value", u.role)} class="border border-foreground/10 bg-card px-2 py-1 outline-none focus:border-accent" data-v-4427c1a1><!--[-->`);
          ssrRenderList(roles, (role) => {
            _push(`<option${ssrRenderAttr("value", role)} data-v-4427c1a1>${ssrInterpolate(roleLabels[role] || role)}</option>`);
          });
          _push(`<!--]--></select></td><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1>${ssrInterpolate(new Date(u.createdAt).toLocaleDateString("ru-RU"))}</td><td class="border border-foreground/10 px-4 py-2" data-v-4427c1a1><div class="flex flex-wrap gap-2" data-v-4427c1a1>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/account/admin/users/${u.id}`,
            class: "text-xs text-accent hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Профиль`);
              } else {
                return [
                  createTextVNode("Профиль")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="text-xs text-foreground/70 hover:underline" data-v-4427c1a1>Изменить</button><button class="text-xs text-red-600 hover:underline" data-v-4427c1a1>Удалить</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(users).length) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-4427c1a1>Нет пользователей</p>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showUserModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-4427c1a1>`);
          if (unref(showUserModal)) {
            _push2(`<div class="relative mt-8 w-full max-w-md overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl" data-v-4427c1a1><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-4427c1a1><h2 class="text-lg font-bold" data-v-4427c1a1>${ssrInterpolate(unref(editingUser) ? "Редактировать пользователя" : "Добавить пользователя")}</h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" data-v-4427c1a1>✕</button></div><div class="space-y-4 p-6" data-v-4427c1a1><div data-v-4427c1a1><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-4427c1a1>Email <span class="text-red-600" data-v-4427c1a1>*</span></label><input${ssrRenderAttr("value", unref(userForm).email)} type="email" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="user@example.com" data-v-4427c1a1></div><div data-v-4427c1a1><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-4427c1a1>Логин</label><input${ssrRenderAttr("value", unref(userForm).username)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="username" data-v-4427c1a1></div><div data-v-4427c1a1><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-4427c1a1>Отображаемое имя</label><input${ssrRenderAttr("value", unref(userForm).displayName)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Иван Иванов" data-v-4427c1a1></div><div data-v-4427c1a1><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-4427c1a1>Роль</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-4427c1a1><!--[-->`);
            ssrRenderList(roles, (role) => {
              _push2(`<option${ssrRenderAttr("value", role)} data-v-4427c1a1${ssrIncludeBooleanAttr(Array.isArray(unref(userForm).role) ? ssrLooseContain(unref(userForm).role, role) : ssrLooseEqual(unref(userForm).role, role)) ? " selected" : ""}>${ssrInterpolate(roleLabels[role] || role)}</option>`);
            });
            _push2(`<!--]--></select></div><div data-v-4427c1a1><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-4427c1a1>Пароль ${ssrInterpolate(unref(editingUser) ? "(оставьте пустым, чтобы не менять)" : "*")}</label><input${ssrRenderAttr("value", unref(userForm).password)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Минимум 6 символов" data-v-4427c1a1></div><div class="flex justify-end gap-2 pt-2" data-v-4427c1a1><button class="btn-secondary" data-v-4427c1a1>Отмена</button><button class="btn-primary" data-v-4427c1a1>Сохранить</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showMaterialsModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-4427c1a1>`);
          if (unref(showMaterialsModal)) {
            _push2(`<div class="relative mt-8 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl" data-v-4427c1a1><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-4427c1a1><h2 class="text-lg font-bold" data-v-4427c1a1>Материалы: ${ssrInterpolate(unref(materialsUser)?.username || unref(materialsUser)?.email)}</h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" data-v-4427c1a1>✕</button></div><div class="overflow-y-auto p-6" data-v-4427c1a1>`);
            if (unref(materialsLoading)) {
              _push2(`<p class="text-sm text-foreground/60" data-v-4427c1a1>Загрузка...</p>`);
            } else if (!unref(materials).length) {
              _push2(`<div class="text-sm text-foreground/60" data-v-4427c1a1>Нет материалов</div>`);
            } else {
              _push2(`<table class="w-full border-collapse border border-foreground/10 text-sm" data-v-4427c1a1><thead class="bg-foreground/10" data-v-4427c1a1><tr data-v-4427c1a1><th class="border border-foreground/10 px-3 py-2 text-left" data-v-4427c1a1>Тип</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-4427c1a1>Заголовок</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-4427c1a1>Статус</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-4427c1a1>Обновлено</th></tr></thead><tbody data-v-4427c1a1><!--[-->`);
              ssrRenderList(unref(materials), (m) => {
                _push2(`<tr class="bg-foreground/5" data-v-4427c1a1><td class="border border-foreground/10 px-3 py-2" data-v-4427c1a1>${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-3 py-2" data-v-4427c1a1>${ssrInterpolate(m.title)}</td><td class="border border-foreground/10 px-3 py-2" data-v-4427c1a1>${ssrInterpolate(statusLabels[m.status] || m.status)}</td><td class="border border-foreground/10 px-3 py-2" data-v-4427c1a1>${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
              });
              _push2(`<!--]--></tbody></table>`);
            }
            _push2(`</div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4427c1a1"]]);
export {
  index as default
};
//# sourceMappingURL=index-DZl2T3OC.js.map
