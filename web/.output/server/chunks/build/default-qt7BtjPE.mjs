import { _ as __nuxt_component_0$1 } from './nuxt-link-M1kxXMe5.mjs';
import { u as useAsyncData, _ as __nuxt_component_1$2 } from './NuxtImg-BJV0ypiM.mjs';
import { useSSRContext, defineComponent, computed, mergeProps, ref, unref, withAsyncContext, watch, nextTick, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock } from 'vue';
import { ssrRenderAttrs, ssrRenderTeleport, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-By8wIj1o.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SocialIcon",
  __ssrInlineRender: true,
  props: {
    name: {
      type: String,
      default: "link"
    }
  },
  setup(__props) {
    const props = __props;
    const icon = computed(() => (props.name || "link").toLowerCase());
    return (_ctx, _push, _parent, _attrs) => {
      if (icon.value === "youtube") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81zM9.55 15.5V8.5l6.27 3.5-6.27 3.5z"></path></svg>`);
      } else if (icon.value === "vk") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.07 14.51h-1.36c-.52 0-.68-.42-1.62-1.38-.82-.81-1.18-.92-1.38-.92-.28 0-.36.08-.36.48v1.25c0 .34-.11.55-1.03.55-1.51 0-3.19-.92-4.37-2.62-1.77-2.5-2.26-4.39-2.26-4.78 0-.21.08-.41.48-.41h1.36c.36 0 .5.16.64.56.72 2.08 1.92 3.9 2.42 3.9.19 0 .28-.08.28-.48V9.32c-.06-.86-.5-.93-.5-1.24 0-.15.12-.3.33-.3h2.14c.28 0 .38.14.38.46v2.49c0 .27.12.37.2.37.19 0 .35-.12.7-.49 1.08-1.21 1.85-3.08 1.85-3.08.1-.22.28-.42.66-.42h1.36c.41 0 .5.21.41.5-.17.8-1.84 3.56-1.84 3.56-.14.25-.2.35 0 .62.15.2.63.61.95.98.59.67 1.04 1.23 1.16 1.62.1.38-.08.57-.5.57z"></path></svg>`);
      } else if (icon.value === "ok") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm3.5 6.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S14 10.83 14 10s.67-1.5 1.5-1.5Zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 10 8.5 10 7 9.33 7 8.5s.67-1.5 1.5-1.5Zm7 5.5c0 2-1.5 3.5-3.5 3.5S8.5 14 8.5 12H7c0 3.5 2.5 6 5 6s5-2.5 5-6h-1.5Z"></path></svg>`);
      } else if (icon.value === "telegram") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path></svg>`);
      } else if (icon.value === "rutube") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg>`);
      } else if (icon.value === "dzen") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><circle cx="12" cy="12" r="3"></circle><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>`);
      } else if (icon.value === "whatsapp") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.899 9.899 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.921 9.921 0 0 0 12.04 2zm5.72 13.82c-.24.67-1.38 1.27-1.92 1.35-.51.08-1.01.1-1.51-.03-.35-.09-.79-.24-1.34-.49-2.35-1.01-3.88-3.35-4-3.51-.12-.16-.96-1.27-.96-2.42 0-1.15.6-1.71.82-1.94.22-.23.48-.29.64-.29h.46c.15 0 .35-.06.55.41.2.48.7 1.65.76 1.77.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.3-.36.4-.12.12-.24.24-.11.48.13.24.6 1 1.29 1.62.89.79 1.64 1.03 1.87 1.15.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.36.64 1.59.76.24.12.4.18.46.28.06.1.06.58-.18 1.25z"></path></svg>`);
      } else {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }, _attrs))}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SocialIcon.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1$1 = Object.assign(_sfc_main$4, { __name: "SocialIcon" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AuthDrawer",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    useAuth();
    const activeTab = ref("login");
    const username = ref("");
    const displayName = ref("");
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(isOpen)) {
          _push2(`<div class="fixed inset-0 z-50 bg-black/50" data-v-a9a5650f>`);
          if (unref(isOpen)) {
            _push2(`<div class="absolute right-0 top-0 h-full w-full max-w-md bg-card p-6 shadow-xl" data-v-a9a5650f><div class="mb-6 flex items-start justify-between" data-v-a9a5650f><div data-v-a9a5650f><p class="text-xs font-medium uppercase tracking-wider text-foreground/50" data-v-a9a5650f>Аккаунт</p><h2 class="mt-1 font-heading text-xl font-bold" data-v-a9a5650f>Личный кабинет</h2></div><button type="button" class="text-foreground/50 transition hover:text-foreground" aria-label="Закрыть" data-v-a9a5650f><svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-a9a5650f><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" data-v-a9a5650f></path></svg></button></div><div class="mb-6 inline-flex border border-foreground/10" data-v-a9a5650f><button type="button" class="${ssrRenderClass([unref(activeTab) === "login" ? "bg-accent text-white" : "bg-card text-foreground hover:bg-foreground/5", "px-4 py-2 text-sm font-medium transition"])}" data-v-a9a5650f> Вход </button><button type="button" class="${ssrRenderClass([unref(activeTab) === "register" ? "bg-accent text-white" : "bg-card text-foreground hover:bg-foreground/5", "px-4 py-2 text-sm font-medium transition"])}" data-v-a9a5650f> Регистрация </button></div><form class="space-y-4" data-v-a9a5650f>`);
            if (unref(activeTab) === "register") {
              _push2(`<!--[--><div data-v-a9a5650f><label class="mb-1.5 block text-sm font-medium" data-v-a9a5650f>Логин</label><input${ssrRenderAttr("value", unref(username))} type="text" placeholder="username" class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent" data-v-a9a5650f></div><div data-v-a9a5650f><label class="mb-1.5 block text-sm font-medium" data-v-a9a5650f>Отображаемое имя</label><input${ssrRenderAttr("value", unref(displayName))} type="text" placeholder="Как вас показывать на сайте" class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent" data-v-a9a5650f></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div data-v-a9a5650f><label class="mb-1.5 block text-sm font-medium" data-v-a9a5650f>${ssrInterpolate(unref(activeTab) === "login" ? "Логин или email" : "Email")}</label><input${ssrRenderAttr("value", unref(email))} type="text"${ssrRenderAttr("placeholder", unref(activeTab) === "login" ? "admin или you@example.com" : "you@example.com")} class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent" data-v-a9a5650f></div><div data-v-a9a5650f><label class="mb-1.5 block text-sm font-medium" data-v-a9a5650f>Пароль</label><input${ssrRenderAttr("value", unref(password))} type="password"${ssrRenderAttr("placeholder", unref(activeTab) === "register" ? "Минимум 6 символов" : "•••••••")} class="w-full border border-foreground/10 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent" data-v-a9a5650f></div>`);
            if (unref(error)) {
              _push2(`<p class="text-sm text-red-600" data-v-a9a5650f>${ssrInterpolate(unref(error))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60" data-v-a9a5650f>${ssrInterpolate(unref(activeTab) === "login" ? unref(loading) ? "Вход..." : "Войти" : unref(loading) ? "Регистрация..." : "Зарегистрироваться")}</button></form></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AuthDrawer.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-a9a5650f"]]), { __name: "AuthDrawer" });
const headerCategoryOrder = [
  "Российское виноделие",
  "Зарубежное виноделие",
  "Алкогольный рынок",
  "Розничный бизнес",
  "Ресторанный бизнес",
  "Туризм"
];
function useHeaderCategories() {
  const { getCategories } = useApi();
  const { data: categories } = useAsyncData(
    "categories",
    () => getCategories().catch(() => [])
  );
  const headerCategories = computed(() => {
    if (!categories.value) return [];
    const map = new Map(
      categories.value.map((c) => [
        String(c.name || "").trim().toLowerCase(),
        c
      ])
    );
    return headerCategoryOrder.map((name) => map.get(name.toLowerCase())).filter(Boolean);
  });
  return { categories, headerCategories };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SiteHeader",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getSiteSettings } = useApi();
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "site-settings",
      () => getSiteSettings().catch(() => null)
    )), __temp = await __temp, __restore(), __temp);
    const socialLinks = computed(() => {
      const links = siteSettings.value?.socialLinks?.links;
      return Array.isArray(links) ? links : [];
    });
    const { user, isAuthenticated } = useAuth();
    const { headerCategories } = useHeaderCategories();
    const searchQuery = ref("");
    const searchOpen = ref(false);
    const searchInput = ref(null);
    const authOpen = ref(false);
    const mobileMenuOpen = ref(false);
    function closeMobileMenu() {
      mobileMenuOpen.value = false;
    }
    watch(mobileMenuOpen, (open) => {
    });
    ref(false);
    watch(searchOpen, (open) => {
      if (open) {
        nextTick(() => searchInput.value?.focus());
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = __nuxt_component_1$2;
      const _component_SocialIcon = __nuxt_component_1$1;
      const _component_AuthDrawer = __nuxt_component_3;
      _push(`<!--[--><header class="border-b border-foreground/10 bg-background" data-v-c29f9784><div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" data-v-c29f9784>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex max-w-[60%] flex-col md:max-w-none"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/logo-light.png",
              alt: "Виноделие Сегодня",
              class: "block h-8 w-auto dark:hidden md:h-10"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/logo-dark.png",
              alt: "Виноделие Сегодня",
              class: "hidden h-8 w-auto dark:block md:h-10"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtImg, {
                src: "/logo-light.png",
                alt: "Виноделие Сегодня",
                class: "block h-8 w-auto dark:hidden md:h-10"
              }),
              createVNode(_component_NuxtImg, {
                src: "/logo-dark.png",
                alt: "Виноделие Сегодня",
                class: "hidden h-8 w-auto dark:block md:h-10"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden items-center gap-3 md:gap-5 lg:flex" data-v-c29f9784><div class="relative flex items-center" data-v-c29f9784>`);
      if (searchOpen.value) {
        _push(`<form class="absolute right-10 top-0 w-48 lg:w-56" data-v-c29f9784><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="Поиск" class="w-full border border-foreground/10 bg-card py-2 pl-3 pr-4 text-sm outline-none transition focus:border-accent" data-v-c29f9784></form>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card text-foreground/60 transition hover:text-foreground" aria-label="Поиск" data-v-c29f9784><svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-c29f9784></path></svg></button></div>`);
      if (unref(isAuthenticated) && unref(user)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/account",
          class: "max-w-[160px] truncate text-sm text-foreground/80 hover:text-foreground"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(user).displayName || unref(user).username || unref(user).email)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(user).displayName || unref(user).username || unref(user).email), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button type="button" class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground" data-v-c29f9784><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12h3m0 0-3-3m3 3-3 3" data-v-c29f9784></path></svg><span data-v-c29f9784>Выйти</span></button><!--]-->`);
      } else {
        _push(`<button type="button" class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground" data-v-c29f9784><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-c29f9784></path></svg><span data-v-c29f9784>Войти</span></button>`);
      }
      _push(`<button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Переключить тему" data-v-c29f9784><svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" data-v-c29f9784></path></svg><svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" data-v-c29f9784></path></svg></button></div><button type="button" class="flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground lg:hidden" aria-label="Меню" data-v-c29f9784><svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" data-v-c29f9784></path></svg></button></div><nav class="hidden border-t border-foreground/10 lg:block" data-v-c29f9784><div class="mx-auto max-w-7xl px-4" data-v-c29f9784><ul class="flex items-center gap-2 overflow-x-auto py-3 text-xs font-medium uppercase tracking-wider text-foreground/80 md:gap-4 md:text-sm" data-v-c29f9784><li class="shrink-0" data-v-c29f9784>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/news",
        class: "whitespace-nowrap px-2 py-1 transition hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Новости `);
          } else {
            return [
              createTextVNode(" Новости ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><!--[-->`);
      ssrRenderList(unref(headerCategories), (cat) => {
        _push(`<li class="shrink-0" data-v-c29f9784>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/category/${cat.slug}`,
          class: "whitespace-nowrap px-2 py-1 transition hover:text-foreground"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(cat.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(cat.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></div></nav></header>`);
      if (mobileMenuOpen.value) {
        _push(`<div class="fixed inset-0 z-50 flex flex-col bg-background px-4 py-4" data-v-c29f9784><div class="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4" data-v-c29f9784><div class="flex items-center gap-4" data-v-c29f9784><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Поиск" data-v-c29f9784><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-c29f9784></path></svg></button><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Переключить тему" data-v-c29f9784><svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" data-v-c29f9784></path></svg><svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" data-v-c29f9784></path></svg></button>`);
        if (unref(isAuthenticated) && unref(user)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/account",
            class: "text-foreground/70 hover:text-foreground",
            onClick: closeMobileMenu
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-c29f9784${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "h-5 w-5",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.5",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Войти" data-v-c29f9784><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-c29f9784></path></svg></button>`);
        }
        _push(`</div><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Закрыть" data-v-c29f9784><svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c29f9784><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" data-v-c29f9784></path></svg></button></div>`);
        if (searchOpen.value) {
          _push(`<form class="mb-6" data-v-c29f9784><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="Поиск" class="w-full border border-foreground/10 bg-card py-3 px-4 text-sm outline-none transition focus:border-accent" data-v-c29f9784></form>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<nav class="flex-1 overflow-y-auto" data-v-c29f9784><ul class="space-y-10" data-v-c29f9784><li data-v-c29f9784>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent",
          onClick: closeMobileMenu
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Главная `);
            } else {
              return [
                createTextVNode(" Главная ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li><li data-v-c29f9784>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/news",
          class: "block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent",
          onClick: closeMobileMenu
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Новости `);
            } else {
              return [
                createTextVNode(" Новости ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li><!--[-->`);
        ssrRenderList(unref(headerCategories), (cat) => {
          _push(`<li data-v-c29f9784>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/category/${cat.slug}`,
            class: "block py-2 text-left font-heading text-base font-bold uppercase tracking-wider text-foreground transition hover:text-accent",
            onClick: closeMobileMenu
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(cat.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(cat.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></nav>`);
        if (socialLinks.value.length) {
          _push(`<div class="mt-auto border-t border-foreground/10 pt-6" data-v-c29f9784><div class="flex items-center justify-between" data-v-c29f9784><!--[-->`);
          ssrRenderList(socialLinks.value, (link) => {
            _push(`<a${ssrRenderAttr("href", link.href)} target="_blank" rel="noopener" class="text-foreground/70 transition hover:text-accent"${ssrRenderAttr("aria-label", link.label)} data-v-c29f9784>`);
            _push(ssrRenderComponent(_component_SocialIcon, {
              name: link.icon,
              class: "h-6 w-6"
            }, null, _parent));
            _push(`</a>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AuthDrawer, {
        modelValue: authOpen.value,
        "onUpdate:modelValue": ($event) => authOpen.value = $event
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SiteHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-c29f9784"]]), { __name: "SiteHeader" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SiteFooter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getSiteSettings } = useApi();
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "footer-site-settings",
      () => getSiteSettings().catch(() => null)
    )), __temp = await __temp, __restore(), __temp);
    const { headerCategories } = useHeaderCategories();
    const socialLinks = computed(() => {
      const links = siteSettings.value?.socialLinks?.links;
      return Array.isArray(links) ? links : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_SocialIcon = __nuxt_component_1$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "bg-[#0B3D2E] text-white" }, _attrs))}><div class="mx-auto max-w-7xl px-4 py-12 md:py-16"><div class="grid gap-10 md:grid-cols-3 md:gap-8"><div class="space-y-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "font-heading text-xl font-bold uppercase tracking-wider"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Виноделие сегодня `);
          } else {
            return [
              createTextVNode(" Виноделие сегодня ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(socialLinks).length) {
        _push(`<div class="flex flex-wrap gap-4"><!--[-->`);
        ssrRenderList(unref(socialLinks), (link) => {
          _push(`<a${ssrRenderAttr("href", link.href)} target="_blank" rel="noopener" class="text-white/80 transition hover:text-white"${ssrRenderAttr("aria-label", link.label)}>`);
          _push(ssrRenderComponent(_component_SocialIcon, {
            name: link.icon,
            class: "h-6 w-6"
          }, null, _parent));
          _push(`</a>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><h4 class="mb-5 text-xs font-semibold uppercase tracking-wider text-white/60"> Рубрики </h4><ul class="space-y-3 text-sm font-medium uppercase tracking-wide"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/news",
        class: "text-white/90 transition hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Новости `);
          } else {
            return [
              createTextVNode(" Новости ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><!--[-->`);
      ssrRenderList(unref(headerCategories), (cat) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/category/${cat.slug}`,
          class: "text-white/90 transition hover:text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(cat.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(cat.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/events",
        class: "text-white/90 transition hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Афиша `);
          } else {
            return [
              createTextVNode(" Афиша ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><h4 class="mb-5 text-xs font-semibold uppercase tracking-wider text-white/60"> О нас </h4><ul class="space-y-3 text-sm font-medium uppercase tracking-wide"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal",
        class: "text-white/90 transition hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Правовая информация `);
          } else {
            return [
              createTextVNode(" Правовая информация ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/privacy",
        class: "text-white/90 transition hover:text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Политика в отношении обработки персональных данных `);
          } else {
            return [
              createTextVNode(" Политика в отношении обработки персональных данных ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div></div></div><div class="border-t border-white/10"><div class="mx-auto max-w-7xl px-4 py-5"><p class="text-center text-xs text-white/60"> Все права защищены. Копирование и иное использование материалов возможны только с письменного согласия правообладателя и с обязательным указанием источника. </p></div></div></footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SiteFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "SiteFooter" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_SiteHeader = __nuxt_component_0;
  const _component_SiteFooter = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col overflow-x-hidden" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_SiteHeader, null, null, _parent));
  _push(`<main class="flex-1">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main>`);
  _push(ssrRenderComponent(_component_SiteFooter, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-qt7BtjPE.mjs.map
