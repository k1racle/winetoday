import { _ as __nuxt_component_0 } from './nuxt-link-DHNkfH9n.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { s as sortBySidebarCategoryOrder, r as resolveSidebarCategoryLabel } from './sidebar-categories-DiHE4apX.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SidebarByCategory",
  __ssrInlineRender: true,
  props: {
    groups: {}
  },
  setup(__props) {
    const props = __props;
    const orderedGroups = computed(
      () => sortBySidebarCategoryOrder(props.groups).map((group) => ({
        ...group,
        category: {
          ...group.category,
          name: resolveSidebarCategoryLabel(group.category)
        }
      }))
    );
    function link(item) {
      switch (item.type) {
        case "article":
          return `/articles/${item.slug}`;
        case "news":
          return `/news/${item.slug}`;
        case "video":
          return `/videos/${item.slug}`;
        case "gallery":
          return `/gallery/${item.slug}`;
        default:
          return "/";
      }
    }
    function formatDayMonth(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    }
    function truncatedTitle(title, exclusive) {
      const max = exclusive ? 40 : 200;
      if (title.length <= max) return title;
      return title.slice(0, max).trim().replace(/[\s.,!?;:]$/, "") + "…";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border border-foreground/5 bg-card p-5 shadow-sm md:p-6" }, _attrs))}><div class="space-y-8"><!--[-->`);
      ssrRenderList(unref(orderedGroups), (group) => {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/category/${group.category.slug}`,
          class: "mb-3 block text-base font-normal text-foreground uppercase border-b-2 border-accent pb-2 hover:text-foreground/80"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(group.category.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(group.category.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(group.items.slice(0, 10), (item) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: link(item),
            class: "group flex items-start gap-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="shrink-0 flex flex-col items-center justify-center text-center text-sm font-bold text-accent"${_scopeId}><span${_scopeId}>${ssrInterpolate(formatDayMonth(item.publishedAt || item.createdAt))}</span><span class="text-[10px] opacity-80"${_scopeId}>${ssrInterpolate(new Date(item.publishedAt || item.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }))}</span></span><div class="min-w-0 flex-1"${_scopeId}><p class="text-sm font-medium leading-snug text-foreground group-hover:text-foreground line-clamp-2"${_scopeId}>${ssrInterpolate(truncatedTitle(item.title, item.materialLabel === "exclusive"))} `);
                if (item.materialLabel === "exclusive") {
                  _push2(`<span class="ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"${_scopeId}> Эксклюзив </span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p></div>`);
              } else {
                return [
                  createVNode("span", { class: "shrink-0 flex flex-col items-center justify-center text-center text-sm font-bold text-accent" }, [
                    createVNode("span", null, toDisplayString(formatDayMonth(item.publishedAt || item.createdAt)), 1),
                    createVNode("span", { class: "text-[10px] opacity-80" }, toDisplayString(new Date(item.publishedAt || item.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })), 1)
                  ]),
                  createVNode("div", { class: "min-w-0 flex-1" }, [
                    createVNode("p", { class: "text-sm font-medium leading-snug text-foreground group-hover:text-foreground line-clamp-2" }, [
                      createTextVNode(toDisplayString(truncatedTitle(item.title, item.materialLabel === "exclusive")) + " ", 1),
                      item.materialLabel === "exclusive" ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "ml-1 inline-block whitespace-nowrap align-middle rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      }, " Эксклюзив ")) : createCommentVNode("", true)
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SidebarByCategory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "SidebarByCategory" });

export { __nuxt_component_2 as _ };
//# sourceMappingURL=SidebarByCategory-Csi2LxSy.mjs.map
