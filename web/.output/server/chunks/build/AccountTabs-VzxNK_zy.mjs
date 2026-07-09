import { _ as __nuxt_component_0$1 } from './nuxt-link-DHNkfH9n.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { c as useRoute } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AccountTabs",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const tabs = [
      { label: "Профиль", to: "/account" },
      { label: "Подписки", to: "/account/subscriptions" },
      { label: "Понравилось", to: "/account/liked" },
      { label: "Комментарии", to: "/account/comments" }
    ];
    function isActive(to) {
      if (to === "/account") {
        return route.path === to;
      }
      return route.path === to || route.path.startsWith(`${to}/`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "flex gap-2 border-b border-foreground/10" }, _attrs))}><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: tab.to,
          to: tab.to,
          class: ["px-4 py-2 text-sm font-medium transition", isActive(tab.to) ? "border-b-2 border-accent text-accent" : "text-foreground/60 hover:text-foreground"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(tab.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(tab.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AccountTabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "AccountTabs" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=AccountTabs-VzxNK_zy.mjs.map
