import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { _ as __nuxt_component_1 } from './AdminTabs-X7QJWm1s.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-8" }, _attrs))} data-v-7215b20d><div class="mb-6 border-b border-foreground/10 pb-4" data-v-7215b20d><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-7215b20d>Администрирование</p><h1 class="mt-2 font-heading text-2xl font-bold" data-v-7215b20d>Пользователи</h1></div>`);
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
      _push(`<div class="mt-6 flex items-center justify-between" data-v-7215b20d><div class="flex gap-4" data-v-7215b20d><button class="btn-primary" data-v-7215b20d>＋ Добавить пользователя</button></div><button class="text-sm text-accent hover:underline" data-v-7215b20d>Обновить</button></div>`);
      if (unref(loading)) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-7215b20d>Загрузка...</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="mt-6 text-sm text-red-600" data-v-7215b20d>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(message)) {
        _push(`<p class="mt-6 text-sm text-green-600" data-v-7215b20d>${ssrInterpolate(unref(message))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && unref(users).length) {
        _push(`<div class="mt-6 overflow-x-auto" data-v-7215b20d><table class="w-full border-collapse border border-foreground/10 text-sm" data-v-7215b20d><thead class="bg-foreground/10" data-v-7215b20d><tr data-v-7215b20d><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Логин</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Email</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Имя</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Роль</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Создан</th><th class="border border-foreground/10 px-4 py-2 text-left" data-v-7215b20d>Действия</th></tr></thead><tbody data-v-7215b20d><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          _push(`<tr class="bg-foreground/5" data-v-7215b20d><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d>${ssrInterpolate(u.username || "—")}</td><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d>${ssrInterpolate(u.email)}</td><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d>${ssrInterpolate(u.displayName || "—")}</td><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d><select${ssrRenderAttr("value", u.role)} class="border border-foreground/10 bg-card px-2 py-1 outline-none focus:border-accent" data-v-7215b20d><!--[-->`);
          ssrRenderList(roles, (role) => {
            _push(`<option${ssrRenderAttr("value", role)} data-v-7215b20d>${ssrInterpolate(roleLabels[role] || role)}</option>`);
          });
          _push(`<!--]--></select></td><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d>${ssrInterpolate(new Date(u.createdAt).toLocaleDateString("ru-RU"))}</td><td class="border border-foreground/10 px-4 py-2" data-v-7215b20d><div class="flex flex-wrap gap-2" data-v-7215b20d>`);
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
          _push(`<button class="text-xs text-foreground/70 hover:underline" data-v-7215b20d>Изменить</button><button class="text-xs text-red-600 hover:underline" data-v-7215b20d>Удалить</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading) && !unref(users).length) {
        _push(`<p class="mt-6 text-sm text-foreground/60" data-v-7215b20d>Нет пользователей</p>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showUserModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-7215b20d>`);
          if (unref(showUserModal)) {
            _push2(`<div class="relative mt-8 w-full max-w-md overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl" data-v-7215b20d><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-7215b20d><h2 class="text-lg font-bold" data-v-7215b20d>${ssrInterpolate(unref(editingUser) ? "Редактировать пользователя" : "Добавить пользователя")}</h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" data-v-7215b20d>✕</button></div><div class="space-y-4 p-6" data-v-7215b20d><div data-v-7215b20d><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-7215b20d>Email <span class="text-red-600" data-v-7215b20d>*</span></label><input${ssrRenderAttr("value", unref(userForm).email)} type="email" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="user@example.com" data-v-7215b20d></div><div data-v-7215b20d><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-7215b20d>Логин</label><input${ssrRenderAttr("value", unref(userForm).username)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="username" data-v-7215b20d></div><div data-v-7215b20d><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-7215b20d>Отображаемое имя</label><input${ssrRenderAttr("value", unref(userForm).displayName)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Иван Иванов" data-v-7215b20d></div><div data-v-7215b20d><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-7215b20d>Роль</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-7215b20d><!--[-->`);
            ssrRenderList(roles, (role) => {
              _push2(`<option${ssrRenderAttr("value", role)} data-v-7215b20d${ssrIncludeBooleanAttr(Array.isArray(unref(userForm).role) ? ssrLooseContain(unref(userForm).role, role) : ssrLooseEqual(unref(userForm).role, role)) ? " selected" : ""}>${ssrInterpolate(roleLabels[role] || role)}</option>`);
            });
            _push2(`<!--]--></select></div><div data-v-7215b20d><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-7215b20d>Пароль ${ssrInterpolate(unref(editingUser) ? "(оставьте пустым, чтобы не менять)" : "*")}</label><input${ssrRenderAttr("value", unref(userForm).password)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Минимум 6 символов" data-v-7215b20d></div><div class="flex justify-end gap-2 pt-2" data-v-7215b20d><button class="btn-secondary" data-v-7215b20d>Отмена</button><button class="btn-primary" data-v-7215b20d>Сохранить</button></div></div></div>`);
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
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-7215b20d>`);
          if (unref(showMaterialsModal)) {
            _push2(`<div class="relative mt-8 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl" data-v-7215b20d><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-7215b20d><h2 class="text-lg font-bold" data-v-7215b20d>Материалы: ${ssrInterpolate(unref(materialsUser)?.username || unref(materialsUser)?.email)}</h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" data-v-7215b20d>✕</button></div><div class="overflow-y-auto p-6" data-v-7215b20d>`);
            if (unref(materialsLoading)) {
              _push2(`<p class="text-sm text-foreground/60" data-v-7215b20d>Загрузка...</p>`);
            } else if (!unref(materials).length) {
              _push2(`<div class="text-sm text-foreground/60" data-v-7215b20d>Нет материалов</div>`);
            } else {
              _push2(`<table class="w-full border-collapse border border-foreground/10 text-sm" data-v-7215b20d><thead class="bg-foreground/10" data-v-7215b20d><tr data-v-7215b20d><th class="border border-foreground/10 px-3 py-2 text-left" data-v-7215b20d>Тип</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-7215b20d>Заголовок</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-7215b20d>Статус</th><th class="border border-foreground/10 px-3 py-2 text-left" data-v-7215b20d>Обновлено</th></tr></thead><tbody data-v-7215b20d><!--[-->`);
              ssrRenderList(unref(materials), (m) => {
                _push2(`<tr class="bg-foreground/5" data-v-7215b20d><td class="border border-foreground/10 px-3 py-2" data-v-7215b20d>${ssrInterpolate(typeLabels[m.type] || m.type)}</td><td class="border border-foreground/10 px-3 py-2" data-v-7215b20d>${ssrInterpolate(m.title)}</td><td class="border border-foreground/10 px-3 py-2" data-v-7215b20d>${ssrInterpolate(statusLabels[m.status] || m.status)}</td><td class="border border-foreground/10 px-3 py-2" data-v-7215b20d>${ssrInterpolate(formatDate(m.updatedAt))}</td></tr>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7215b20d"]]);

export { index as default };
//# sourceMappingURL=index-YnXudqBu.mjs.map
