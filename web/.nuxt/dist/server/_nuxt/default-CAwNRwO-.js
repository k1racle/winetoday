import { _ as __nuxt_component_0$1 } from "./nuxt-link-M1kxXMe5.js";
import { u as useAsyncData, _ as __nuxt_component_1$2 } from "./NuxtImg-BJV0ypiM.js";
import { defineComponent, computed, unref, mergeProps, useSSRContext, ref, withAsyncContext, watch, nextTick, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock } from "vue";
import { ssrRenderAttrs, ssrRenderTeleport, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";
import { u as useAuth } from "./useAuth-By8wIj1o.js";
import "C:/Project/winemaking/winetoday/web/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { u as useApi } from "./useApi-DkRD3FHh.js";
import "C:/Project/winemaking/winetoday/web/node_modules/ufo/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/defu/dist/defu.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/h3/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Project/winemaking/winetoday/web/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Project/winemaking/winetoday/web/node_modules/klona/dist/index.mjs";
import "C:/Project/winemaking/winetoday/web/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SocialIcon",
  __ssrInlineRender: true,
  setup(__props) {
    const props = defineProps;
    const icon = computed(() => (props.name || "link").toLowerCase());
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(icon) === "youtube") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81zM9.55 15.5V8.5l6.27 3.5-6.27 3.5z"></path></svg>`);
      } else if (unref(icon) === "vk") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.07 14.51h-1.36c-.52 0-.68-.42-1.62-1.38-.82-.81-1.18-.92-1.38-.92-.28 0-.36.08-.36.48v1.25c0 .34-.11.55-1.03.55-1.51 0-3.19-.92-4.37-2.62-1.77-2.5-2.26-4.39-2.26-4.78 0-.21.08-.41.48-.41h1.36c.36 0 .5.16.64.56.72 2.08 1.92 3.9 2.42 3.9.19 0 .28-.08.28-.48V9.32c-.06-.86-.5-.93-.5-1.24 0-.15.12-.3.33-.3h2.14c.28 0 .38.14.38.46v2.49c0 .27.12.37.2.37.19 0 .35-.12.7-.49 1.08-1.21 1.85-3.08 1.85-3.08.1-.22.28-.42.66-.42h1.36c.41 0 .5.21.41.5-.17.8-1.84 3.56-1.84 3.56-.14.25-.2.35 0 .62.15.2.63.61.95.98.59.67 1.04 1.23 1.16 1.62.1.38-.08.57-.5.57z"></path></svg>`);
      } else if (unref(icon) === "ok") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm4.88 9.03c-.2.55-.8.84-1.35.64-1.16-.43-2.43-.66-3.53-.66s-2.37.23-3.53.66a1.006 1.006 0 0 1-.71-1.88c1.36-.5 2.82-.78 4.24-.78s2.88.28 4.24.78c.55.2.84.8.64 1.35zm1.64 3.35c-.46.63-1.2.98-1.97.98-.46 0-.92-.14-1.32-.43l-1.7-1.23 1.7-1.23c.79-.57 1.9-.39 2.47.4.57.79.39 1.9-.4 2.47h.22zm-4.62-.6l-1.42 1.03 1.42 1.03c.75.55.9 1.6.35 2.35-.55.75-1.6.9-2.35.35l-2.5-1.82a1.01 1.01 0 0 1 0-1.63l2.5-1.82c.75-.55 1.8-.4 2.35.35.55.75.4 1.8-.35 2.35z"></path></svg>`);
      } else if (unref(icon) === "telegram") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path></svg>`);
      } else if (unref(icon) === "rutube") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg>`);
      } else if (unref(icon) === "dzen") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          class: "h-5 w-5",
          viewBox: "0 0 24 24",
          fill: "currentColor"
        }, _attrs))}><circle cx="12" cy="12" r="3"></circle><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>`);
      } else if (unref(icon) === "whatsapp") {
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
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SiteHeader",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getCategories, getSiteSettings } = useApi();
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "site-settings",
      () => getSiteSettings().catch(() => null)
    )), __temp = await __temp, __restore(), __temp);
    const socialLinks = computed(() => {
      const links = siteSettings.value?.socialLinks?.links;
      return Array.isArray(links) ? links : [];
    });
    const { user, isAuthenticated } = useAuth();
    const { data: categories } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "categories",
      () => getCategories().catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
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
    const headerCategoryOrder = [
      "Российское виноделие",
      "Зарубежное виноделие",
      "Алкогольный рынок",
      "Розничный бизнес",
      "Ресторанный бизнес",
      "Туризм"
    ];
    const headerCategories = computed(() => {
      if (!categories.value) return [];
      const map = new Map(
        categories.value.map((c) => [String(c.name || "").trim().toLowerCase(), c])
      );
      return headerCategoryOrder.map((name) => map.get(name.toLowerCase())).filter(Boolean);
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
      _push(`<!--[--><header class="border-b border-foreground/10 bg-background" data-v-ff0959fa><div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" data-v-ff0959fa>`);
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
      _push(`<div class="hidden items-center gap-3 md:gap-5 lg:flex" data-v-ff0959fa><div class="relative flex items-center" data-v-ff0959fa>`);
      if (searchOpen.value) {
        _push(`<form class="absolute right-10 top-0 w-48 lg:w-56" data-v-ff0959fa><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="Поиск" class="w-full border border-foreground/10 bg-card py-2 pl-3 pr-4 text-sm outline-none transition focus:border-accent" data-v-ff0959fa></form>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card text-foreground/60 transition hover:text-foreground" aria-label="Поиск" data-v-ff0959fa><svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-ff0959fa></path></svg></button></div>`);
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
        _push(`<button type="button" class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground" data-v-ff0959fa><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12h3m0 0-3-3m3 3-3 3" data-v-ff0959fa></path></svg><span data-v-ff0959fa>Выйти</span></button><!--]-->`);
      } else {
        _push(`<button type="button" class="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground" data-v-ff0959fa><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-ff0959fa></path></svg><span data-v-ff0959fa>Войти</span></button>`);
      }
      _push(`<button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Переключить тему" data-v-ff0959fa><svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" data-v-ff0959fa></path></svg><svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" data-v-ff0959fa></path></svg></button></div><button type="button" class="flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-foreground lg:hidden" aria-label="Меню" data-v-ff0959fa><svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" data-v-ff0959fa></path></svg></button></div><nav class="hidden border-t border-foreground/10 lg:block" data-v-ff0959fa><div class="mx-auto max-w-7xl px-4" data-v-ff0959fa><ul class="flex items-center gap-2 overflow-x-auto py-3 text-xs font-medium uppercase tracking-wider text-foreground/80 md:gap-4 md:text-sm" data-v-ff0959fa><li class="shrink-0" data-v-ff0959fa>`);
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
      ssrRenderList(headerCategories.value, (cat) => {
        _push(`<li class="shrink-0" data-v-ff0959fa>`);
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
        _push(`<div class="fixed inset-0 z-50 flex flex-col bg-background px-4 py-4" data-v-ff0959fa><div class="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4" data-v-ff0959fa><div class="flex items-center gap-4" data-v-ff0959fa><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Поиск" data-v-ff0959fa><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-ff0959fa></path></svg></button><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Переключить тему" data-v-ff0959fa><svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" data-v-ff0959fa></path></svg><svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" data-v-ff0959fa></path></svg></button>`);
        if (unref(isAuthenticated) && unref(user)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/account",
            class: "text-foreground/70 hover:text-foreground",
            onClick: closeMobileMenu
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-ff0959fa${_scopeId}></path></svg>`);
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
          _push(`<button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Войти" data-v-ff0959fa><svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" data-v-ff0959fa></path></svg></button>`);
        }
        _push(`</div><button type="button" class="text-foreground/70 hover:text-foreground" aria-label="Закрыть" data-v-ff0959fa><svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ff0959fa><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" data-v-ff0959fa></path></svg></button></div>`);
        if (searchOpen.value) {
          _push(`<form class="mb-6" data-v-ff0959fa><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="Поиск" class="w-full border border-foreground/10 bg-card py-3 px-4 text-sm outline-none transition focus:border-accent" data-v-ff0959fa></form>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<nav class="flex-1 overflow-y-auto" data-v-ff0959fa><ul class="space-y-10" data-v-ff0959fa><li data-v-ff0959fa>`);
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
        _push(`</li><li data-v-ff0959fa>`);
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
        ssrRenderList(headerCategories.value, (cat) => {
          _push(`<li data-v-ff0959fa>`);
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
          _push(`<div class="mt-auto border-t border-foreground/10 pt-6" data-v-ff0959fa><div class="flex items-center justify-between" data-v-ff0959fa><!--[-->`);
          ssrRenderList(socialLinks.value, (link) => {
            _push(`<a${ssrRenderAttr("href", link.href)} target="_blank" rel="noopener" class="text-foreground/70 transition hover:text-accent"${ssrRenderAttr("aria-label", link.label)} data-v-ff0959fa>`);
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
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-ff0959fa"]]), { __name: "SiteHeader" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SiteFooter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { getSiteSettings, getCategories } = useApi();
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "footer-site-settings",
      () => getSiteSettings().catch(() => null)
    )), __temp = await __temp, __restore(), __temp);
    const { data: footerCategories } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "footer-categories",
      () => getCategories().catch(() => [])
    )), __temp = await __temp, __restore(), __temp);
    const socialLinks = computed(() => {
      const links = siteSettings.value?.socialLinks?.links;
      return Array.isArray(links) ? links : [];
    });
    const footerCats = computed(() => (footerCategories.value || []).slice(0, 6));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_SocialIcon = __nuxt_component_1$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "border-t border-foreground/10 bg-background py-10" }, _attrs))}><div class="mx-auto max-w-6xl px-4"><div class="grid gap-8 md:grid-cols-4"><div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "font-heading text-xl font-bold"
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
      _push(`<p class="mt-3 max-w-xs text-sm text-foreground/70"> Русскоязычный портал о вине, виноградарстве и виноделии. </p></div><div><h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Разделы</h4><ul class="space-y-2 text-sm text-foreground/70"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/articles",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Статьи`);
          } else {
            return [
              createTextVNode("Статьи")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/news",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Новости`);
          } else {
            return [
              createTextVNode("Новости")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/videos",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Видео`);
          } else {
            return [
              createTextVNode("Видео")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/gallery",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Галерея`);
          } else {
            return [
              createTextVNode("Галерея")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contacts",
        class: "hover:text-foreground"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Контакты`);
          } else {
            return [
              createTextVNode("Контакты")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Рубрики</h4><ul class="space-y-2 text-sm text-foreground/70"><!--[-->`);
      ssrRenderList(unref(footerCats), (cat) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/category/${cat.slug}`,
          class: "hover:text-foreground"
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
      _push(`<!--]-->`);
      if (!unref(footerCats).length) {
        _push(`<li class="text-foreground/50">Нет рубрик</li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</ul></div><div><h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Контакты</h4><ul class="space-y-2 text-sm text-foreground/70"><li><a href="mailto:red@winetoday.ru" class="hover:text-foreground">red@winetoday.ru</a></li><li><a href="tel:+74951234567" class="hover:text-foreground">+7 (495) 123-45-67</a></li><li>Москва, Россия</li></ul>`);
      if (unref(socialLinks).length) {
        _push(`<div class="mt-4 flex flex-wrap gap-3"><!--[-->`);
        ssrRenderList(unref(socialLinks), (link) => {
          _push(`<a${ssrRenderAttr("href", link.href)} target="_blank" rel="noopener" class="text-foreground/60 transition hover:text-accent"${ssrRenderAttr("aria-label", link.label)}>`);
          _push(ssrRenderComponent(_component_SocialIcon, {
            name: link.icon,
            class: "h-5 w-5"
          }, null, _parent));
          _push(`</a>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="mt-10 border-t border-foreground/10 pt-6 text-sm text-foreground/60"> © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Виноделие сегодня. Все права защищены. </div></div></footer>`);
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
export {
  _default as default
};
//# sourceMappingURL=default-CAwNRwO-.js.map
