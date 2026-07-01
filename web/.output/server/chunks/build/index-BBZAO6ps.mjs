import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, watch, reactive, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-By8wIj1o.mjs';
import { u as useApi } from './useApi-DkRD3FHh.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { d as useRuntimeConfig } from './server.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-M1kxXMe5.mjs';
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

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "EditorSidebar",
  __ssrInlineRender: true,
  props: {
    activeType: {}
  },
  emits: ["selectType", "selectMaterial", "newMaterial"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const { user } = useAuth();
    const { getEditorMaterials } = useApi();
    const typeLabels = {
      article: { label: "Статьи", icon: "📄" },
      news: { label: "Новости", icon: "✎" },
      video: { label: "Видео", icon: "🎬" },
      gallery: { label: "Галереи", icon: "🖼" }
    };
    const typeOrder = ["article", "news", "video", "gallery"];
    const roleLabels = {
      admin: "Администратор",
      editor: "Редактор",
      author: "Автор",
      member: "Участник"
    };
    const search = ref("");
    const materials = ref([]);
    const counts = ref({});
    const loading = ref(false);
    const initials = computed(() => {
      const name = user.value?.displayName || user.value?.username || user.value?.email || "";
      return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    });
    async function load() {
      loading.value = true;
      try {
        const res = await getEditorMaterials({
          type: props.activeType,
          search: search.value || void 0,
          limit: 50
        });
        materials.value = res.items || [];
        const map = {};
        (res.counts || []).forEach((c) => {
          map[c.type] = c._count?.type || 0;
        });
        counts.value = map;
      } catch (e) {
        materials.value = [];
      } finally {
        loading.value = false;
      }
    }
    __expose({ load });
    watch(() => props.activeType, load);
    watch(search, () => {
      load();
    });
    const statusMeta = {
      draft: { label: "Черновик", color: "bg-orange-500" },
      in_review: { label: "На проверке", color: "bg-blue-500" },
      published: { label: "Опубликовано", color: "bg-accent" },
      rejected: { label: "Отклонено", color: "bg-red-600" }
    };
    function relativeTime(date) {
      const d = new Date(date);
      const now = /* @__PURE__ */ new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1e3);
      if (diff < 60) return "только что";
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
      if (diff < 2592e3) return `${Math.floor(diff / 86400)} дн назад`;
      return d.toLocaleDateString("ru-RU");
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "flex h-full flex-col border border-foreground/10 bg-card" }, _attrs))}><div class="flex items-center gap-3 border-b border-foreground/10 p-4"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">${ssrInterpolate(initials.value)}</div><div class="min-w-0"><div class="truncate text-sm font-semibold">${ssrInterpolate(unref(user)?.displayName || unref(user)?.username || unref(user)?.email)}</div><div class="text-xs text-foreground/50"> Роль: ${ssrInterpolate(roleLabels[unref(user)?.role || "member"])}</div></div></div><div class="px-3 pt-3"><p class="px-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40"> Тип материала </p><div class="mt-2 space-y-1"><!--[-->`);
      ssrRenderList(typeOrder, (type) => {
        _push(`<button class="${ssrRenderClass([__props.activeType === type ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-foreground/5", "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition"])}"><span>${ssrInterpolate(typeLabels[type].icon)}</span><span class="flex-1">${ssrInterpolate(typeLabels[type].label)}</span><span class="${ssrRenderClass([__props.activeType === type ? "bg-accent text-white" : "bg-foreground/5 text-foreground/60", "rounded px-1.5 py-0.5 text-[10px] font-semibold"])}">${ssrInterpolate(counts.value[type] || 0)}</span></button>`);
      });
      _push(`<!--]--></div><button class="mt-3 w-full rounded bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"> ＋ Новый материал </button></div><div class="flex min-h-0 flex-1 flex-col border-t border-foreground/10 mt-4"><p class="px-5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40"> Все материалы </p><div class="px-4 pb-2"><input${ssrRenderAttr("value", search.value)} type="text" placeholder="Фильтр по заголовку..." class="w-full border border-foreground/10 bg-card px-3 py-1.5 text-xs outline-none focus:border-accent"></div><div class="flex-1 overflow-y-auto px-3 pb-3">`);
      if (loading.value) {
        _push(`<div class="px-2 py-4 text-xs text-foreground/50">Загрузка…</div>`);
      } else if (!materials.value.length) {
        _push(`<div class="px-2 py-4 text-xs text-foreground/50"> Нет материалов </div>`);
      } else {
        _push(`<div class="space-y-1"><!--[-->`);
        ssrRenderList(materials.value, (item) => {
          _push(`<button class="w-full rounded px-2 py-2 text-left transition hover:bg-foreground/5"><div class="truncate text-xs font-medium leading-tight">${ssrInterpolate(item.title)}</div><div class="mt-1 flex items-center gap-1.5 text-[10px] text-foreground/50"><span class="${ssrRenderClass([statusMeta[item.status]?.color || "bg-gray-400", "h-1.5 w-1.5 rounded-full"])}"></span><span>${ssrInterpolate(statusMeta[item.status]?.label || item.status)}</span><span>·</span><span>${ssrInterpolate(relativeTime(item.updatedAt))}</span></div></button>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div></aside>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EditorSidebar.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0$1 = Object.assign(_sfc_main$3, { __name: "EditorSidebar" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "EditorHelpModal",
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
      set: (v) => emit("update:modelValue", v)
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(isOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" data-v-49b2fc17>`);
          if (unref(isOpen)) {
            _push2(`<div class="relative mt-8 w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-foreground/10 bg-card shadow-2xl" data-v-49b2fc17><div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4" data-v-49b2fc17><h2 class="flex items-center gap-3 text-xl font-bold" data-v-49b2fc17><span class="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-bold text-white" data-v-49b2fc17>?</span> Справка по редактору материалов </h2><button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/5 hover:text-red-600" data-v-49b2fc17>✕</button></div><div class="overflow-y-auto p-6" data-v-49b2fc17><div class="mb-6 rounded border border-accent/30 bg-accent/5 px-4 py-3 text-sm leading-relaxed" data-v-49b2fc17> Этот редактор позволяет создавать и редактировать материалы для сайта <b data-v-49b2fc17>ВИНОДЕЛИЕ СЕГОДНЯ</b>. Слева — описание поля, справа — пример того, как оно выглядит на сайте. </div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>Основная информация</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Заголовок</span><span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" data-v-49b2fc17>обязательно</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Главный заголовок материала. Отображается крупным шрифтом на странице и в превью на главной.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-sm font-bold" data-v-49b2fc17>Сергей Левожинский: «Виноделы все меньше готовы инвестировать в продвижение»</p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Ссылка (slug)</span><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent" data-v-49b2fc17>URL</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Часть адреса страницы. Латиница, без пробелов, через дефис. Если пусто — генерируется автоматически из заголовка.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример URL</p><p class="text-xs text-foreground/60" data-v-49b2fc17>winemaking-today.ru › news ›</p><p class="text-sm text-accent" data-v-49b2fc17>sergej-levozhinskij-vinodely-menshe</p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Краткое описание</span><span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" data-v-49b2fc17>обязательно</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Краткое вступление (лид). Отображается под заголовком в превью на главной. 150–200 символов.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Руководитель винной категории сети «Магнит» в рамках выставки рассказал о доле на полке и противоречиях с виноделами...</p></div></div></div></div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>Настройки публикации</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Статус</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Определяет видимость материала. Черновик — только редактору. Опубликовано — всем.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs" data-v-49b2fc17><span class="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500" data-v-49b2fc17></span>Черновик · <span class="mr-2 inline-block h-2 w-2 rounded-full bg-accent" data-v-49b2fc17></span>Опубликовано</p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Дата публикации</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Дата и время, когда материал станет доступен читателям.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-sm font-semibold text-accent" data-v-49b2fc17>2 июня · 09:45</p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Метка материала</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Выделяет материал особым бейджем в списке новостей: Важно, Горячая новость, Эксклюзив.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs" data-v-49b2fc17>Gunko Winery расширит линейку <span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" data-v-49b2fc17>Эксклюзив</span></p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Автор</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Автор материала. Для admin можно выбрать из списка, для редакторов подставляется автоматически.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs text-foreground/70" data-v-49b2fc17>Андрей Маленков · Редактор</p></div></div></div></div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>Обложка и медиа</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Обложка</span><span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" data-v-49b2fc17>важно</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Главное изображение. Превью на главной, в списке новостей и соцсетях. Рекомендуется 1200×630 px.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><div class="h-20 w-full rounded bg-accent/10" data-v-49b2fc17></div></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Источник видео</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Ссылка на видео YouTube, Vimeo или другой внешний источник, если тип материала — видео.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример</p><p class="text-xs text-accent" data-v-49b2fc17>https://www.youtube.com/watch?v=...</p></div></div></div></div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>Блоки материала</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Текстовый блок</span><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent" data-v-49b2fc17>rich-text</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Основной блок для текста. Поддерживает жирный, курсив, заголовки, списки, ссылки, выравнивание, цитаты.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs leading-relaxed" data-v-49b2fc17>Виноделие как <b data-v-49b2fc17>искусство</b> и наука объединяет в себе традиции и инновации.</p></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Галерея / Слайдер</span><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent" data-v-49b2fc17>media</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Несколько изображений. Галерея — сетка, слайдер — карусель.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><div class="flex gap-1" data-v-49b2fc17><div class="h-12 w-16 rounded bg-foreground/10" data-v-49b2fc17></div><div class="h-12 w-16 rounded bg-foreground/10" data-v-49b2fc17></div><div class="h-12 w-16 rounded bg-foreground/10" data-v-49b2fc17></div></div></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Embed HTML</span><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent" data-v-49b2fc17>код</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Вставка стороннего HTML: YouTube, Яндекс.Карты, Telegram-посты, iframe.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><div class="space-y-1 text-xs text-foreground/70" data-v-49b2fc17><p data-v-49b2fc17>📺 Видео с YouTube</p><p data-v-49b2fc17>🗺 Яндекс.Карты</p></div></div></div></div></div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>Рубрики, теги и источники</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Рубрики и темы</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Рубрики определяют раздел сайта. Темы — узкие метки для связанных материалов.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><div class="flex flex-wrap gap-1" data-v-49b2fc17><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent" data-v-49b2fc17>Российское виноделие</span><span class="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent" data-v-49b2fc17>Игристые вина</span></div></div></div><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Источники</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Ссылки на источники информации. Отображаются в конце материала.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример на сайте</p><p class="text-xs text-accent" data-v-49b2fc17>• Wine Spectator — winespectator.com</p></div></div></div></div><div class="mb-6" data-v-49b2fc17><h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40" data-v-49b2fc17>SEO</h3><div class="space-y-3" data-v-49b2fc17><div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2" data-v-49b2fc17><div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r" data-v-49b2fc17><div class="mb-1 flex items-center gap-2" data-v-49b2fc17><span class="h-4 w-1 rounded bg-accent" data-v-49b2fc17></span><span class="text-sm font-semibold" data-v-49b2fc17>Meta Title / Description</span></div><p class="text-xs leading-relaxed text-foreground/70" data-v-49b2fc17>Заголовок и описание для поисковиков. Если пусто — берутся из основного заголовка и лида.</p></div><div class="p-4" data-v-49b2fc17><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent" data-v-49b2fc17>Пример в Google</p><p class="text-sm text-accent" data-v-49b2fc17>Виноделие 2026: тренды и новости отрасли</p><p class="text-xs text-foreground/60" data-v-49b2fc17>Актуальные новости виноделия, обзоры выставок...</p></div></div></div></div><div class="rounded border border-accent/30 bg-accent/5 px-4 py-3 text-sm" data-v-49b2fc17><b data-v-49b2fc17>Горячие клавиши:</b> <b data-v-49b2fc17>Ctrl+B</b> — жирный · <b data-v-49b2fc17>Ctrl+I</b> — курсив · <b data-v-49b2fc17>Ctrl+U</b> — подчёркивание </div></div></div>`);
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EditorHelpModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-49b2fc17"]]), { __name: "EditorHelpModal" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "EditorPanel",
  __ssrInlineRender: true,
  props: {
    type: {},
    draftId: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const config = useRuntimeConfig();
    const { getDraft } = useApi();
    const coverBaseUrl = config.public.uploadsUrl || config.public.apiUrl.replace("/api", "") || "http://localhost:4000";
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
    const labelOptions = [
      { value: "", label: "Нет" },
      { value: "important", label: "Важно" },
      { value: "hot", label: "Горячая новость" },
      { value: "exclusive", label: "Эксклюзив" }
    ];
    function emptyForm() {
      return {
        id: "",
        type: props.type || "article",
        title: "",
        slug: "",
        excerpt: "",
        status: "draft",
        publishedDate: "",
        publishedTime: "",
        materialLabel: "",
        featured: false,
        homepageSpecialBlock: false,
        coverMediaId: "",
        coverPath: "",
        coverShowWatermark: false,
        videoUrl: "",
        authorId: "",
        categoryIds: [],
        tagIds: [],
        contentBlocks: [],
        sources: [],
        seoTitle: "",
        seoDescription: "",
        seoKeywords: ""
      };
    }
    const form = reactive(emptyForm());
    const categories = ref([]);
    const tags = ref([]);
    const authors = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const message = ref("");
    const error = ref("");
    ref(null);
    const helpOpen = ref(false);
    const editorEls = /* @__PURE__ */ new Map();
    async function loadDraft(id) {
      loading.value = true;
      error.value = "";
      try {
        const res = await getDraft(id);
        Object.assign(form, {
          id: res.id,
          type: res.type,
          title: res.title || "",
          slug: res.slug || "",
          excerpt: res.excerpt || "",
          status: res.status,
          publishedDate: res.publishedAt ? new Date(res.publishedAt).toISOString().slice(0, 10) : "",
          publishedTime: res.publishedAt ? new Date(res.publishedAt).toTimeString().slice(0, 5) : "",
          materialLabel: res.materialLabel || "",
          featured: res.featured,
          homepageSpecialBlock: res.homepageSpecialBlock,
          coverMediaId: res.coverMediaId || "",
          coverPath: res.coverMedia?.path || "",
          coverShowWatermark: res.coverShowWatermark,
          videoUrl: res.videoUrl || "",
          authorId: res.authorId || "",
          categoryIds: (res.categories || []).map((c) => c.id),
          tagIds: (res.tags || []).map((t) => t.id),
          contentBlocks: Array.isArray(res.contentBlocks) && res.contentBlocks.length ? res.contentBlocks.map((b) => {
            const id2 = b.id || crypto.randomUUID();
            if (b.type === "text") {
              return { id: id2, type: b.type, title: b.title, content: b.content || "" };
            }
            const data = b.data || {};
            if (b.type === "image") {
              data.source = data.source || "";
            } else if ((b.type === "slider" || b.type === "gallery") && Array.isArray(data.items)) {
              data.items.forEach((it) => {
                it.source = it.source || "";
              });
            }
            return { id: id2, type: b.type, title: b.title, data };
          }) : [],
          sources: Array.isArray(res.sources) && res.sources.length ? res.sources : [{ name: "", url: "" }],
          seoTitle: res.seo?.title || "",
          seoDescription: res.seo?.description || "",
          seoKeywords: res.seo?.keywords || ""
        });
        await nextTick();
        form.contentBlocks.forEach((b) => {
          const el = editorEls.get(b.id);
          if (el) el.innerHTML = b.content || "";
        });
      } catch (e) {
        error.value = e?.data?.message || "Не удалось загрузить материал";
      } finally {
        loading.value = false;
      }
    }
    function resetForm() {
      Object.assign(form, emptyForm());
      editorEls.clear();
      nextTick(() => {
        if (!form.contentBlocks.length) addTextBlock();
        if (!form.sources.length) form.sources.push({ name: "", url: "" });
      });
    }
    watch(() => props.draftId, (id) => {
      if (id) loadDraft(id);
      else resetForm();
    }, { immediate: true });
    watch(() => props.type, (t) => {
      if (t && !props.draftId) form.type = t;
    });
    function addTextBlock() {
      form.contentBlocks.push({
        id: crypto.randomUUID(),
        type: "text",
        title: "Текстовый блок",
        content: "<p></p>"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EditorHelpModal = __nuxt_component_0;
      _push(`<!--[--><div class="space-y-6" data-v-8127905e><div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between" data-v-8127905e><div data-v-8127905e><h2 class="font-heading text-2xl font-bold" data-v-8127905e>Создание материала</h2><p class="mt-1 text-sm text-foreground/60" data-v-8127905e> Полноценное редактирование контента с блоками и rich text </p></div><div class="flex flex-wrap items-center gap-2" data-v-8127905e><button class="btn-secondary" data-v-8127905e>? Помощь</button><select class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e><!--[-->`);
      ssrRenderList(typeLabels, (label, key) => {
        _push(`<option${ssrRenderAttr("value", key)} data-v-8127905e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, key) : ssrLooseEqual(form.type, key)) ? " selected" : ""}>${ssrInterpolate(label)}</option>`);
      });
      _push(`<!--]--></select><button class="btn-secondary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-8127905e> 💾 ${ssrInterpolate(saving.value ? "Сохранение…" : "Сохранить")}</button><button class="btn-primary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-8127905e> 🚀 Опубликовать </button></div></div>`);
      if (error.value) {
        _push(`<div class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-v-8127905e>${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (message.value) {
        _push(`<div class="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" data-v-8127905e>${ssrInterpolate(message.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap items-center justify-between gap-3 border border-foreground/10 bg-card p-4" data-v-8127905e><div class="text-sm text-foreground/60" data-v-8127905e>`);
      if (form.id) {
        _push(`<span class="text-accent" data-v-8127905e>ID: ${ssrInterpolate(form.id)}</span>`);
      } else {
        _push(`<span data-v-8127905e>Новый материал</span>`);
      }
      _push(`</div><div class="flex items-center gap-2 text-sm" data-v-8127905e><span class="text-foreground/50" data-v-8127905e>Статус:</span><span class="font-medium" data-v-8127905e>${ssrInterpolate(statusLabels[form.status])}</span></div></div><div class="grid gap-6 lg:grid-cols-[1fr_320px]" data-v-8127905e><div class="space-y-6" data-v-8127905e><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Основная информация </div><div class="space-y-4 p-4" data-v-8127905e><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e> Заголовок <span class="text-red-600" data-v-8127905e>*</span></label><input${ssrRenderAttr("value", form.title)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Введите заголовок..." data-v-8127905e></div><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e> Ссылка (slug) <span class="text-foreground/40" data-v-8127905e>необязательно</span></label><input${ssrRenderAttr("value", form.slug)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="slug-materiala" data-v-8127905e></div><button type="button" class="btn-secondary w-full justify-center" data-v-8127905e> ✨ Применить типографику </button><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Краткое описание</label><textarea rows="3" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Для публикации обязательно..." data-v-8127905e>${ssrInterpolate(form.excerpt)}</textarea></div></div></div><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Настройки публикации </div><div class="grid gap-4 p-4 sm:grid-cols-2" data-v-8127905e><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Статус</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e><!--[-->`);
      ssrRenderList(statusLabels, (label, key) => {
        _push(`<option${ssrRenderAttr("value", key)} data-v-8127905e${ssrIncludeBooleanAttr(Array.isArray(form.status) ? ssrLooseContain(form.status, key) : ssrLooseEqual(form.status, key)) ? " selected" : ""}>${ssrInterpolate(label)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Метка</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e><!--[-->`);
      ssrRenderList(labelOptions, (opt) => {
        _push(`<option${ssrRenderAttr("value", opt.value)} data-v-8127905e${ssrIncludeBooleanAttr(Array.isArray(form.materialLabel) ? ssrLooseContain(form.materialLabel, opt.value) : ssrLooseEqual(form.materialLabel, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Автор</label><select class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e><option value="" data-v-8127905e${ssrIncludeBooleanAttr(Array.isArray(form.authorId) ? ssrLooseContain(form.authorId, "") : ssrLooseEqual(form.authorId, "")) ? " selected" : ""}>— Автоматически —</option><!--[-->`);
      ssrRenderList(authors.value, (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)} data-v-8127905e${ssrIncludeBooleanAttr(Array.isArray(form.authorId) ? ssrLooseContain(form.authorId, a.id) : ssrLooseEqual(form.authorId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="sm:col-span-2" data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Дата публикации</label><div class="flex gap-2" data-v-8127905e><input${ssrRenderAttr("value", form.publishedDate)} type="date" class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e><input${ssrRenderAttr("value", form.publishedTime)} type="time" class="border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" data-v-8127905e></div></div><label class="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 sm:col-span-2" data-v-8127905e><input${ssrIncludeBooleanAttr(Array.isArray(form.homepageSpecialBlock) ? ssrLooseContain(form.homepageSpecialBlock, null) : form.homepageSpecialBlock) ? " checked" : ""} type="checkbox" class="h-4 w-4 accent-accent" data-v-8127905e> Вывести на главную в спецблок </label></div></div><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Блоки материала </div><div class="space-y-4 p-4" data-v-8127905e><p class="text-xs text-foreground/50" data-v-8127905e>Rich-text блоки + блоки изображений</p><div class="space-y-4" data-v-8127905e><!--[-->`);
      ssrRenderList(form.contentBlocks, (block, index) => {
        _push(`<div class="border border-foreground/10" data-v-8127905e><div class="flex items-center justify-between border-b border-foreground/10 bg-muted px-3 py-2" data-v-8127905e><div class="flex items-center gap-2" data-v-8127905e><span class="cursor-grab text-foreground/40" data-v-8127905e>⋮⋮</span><span class="${ssrRenderClass([block.type === "text" ? "bg-accent/10 text-accent" : "bg-orange-100 text-orange-700", "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"])}" data-v-8127905e>${ssrInterpolate(block.type === "text" ? "Текст" : block.type === "image" ? "Изображение" : block.type === "slider" ? "Слайдер" : block.type === "gallery" ? "Галерея" : block.type === "embed" ? "Embed" : block.type)}</span><input${ssrRenderAttr("value", block.title)} type="text" class="w-40 border-none bg-transparent text-xs font-medium outline-none placeholder:text-foreground/40" placeholder="Название блока" data-v-8127905e></div><div class="flex items-center gap-1" data-v-8127905e><button class="px-1.5 py-1 text-xs hover:bg-foreground/5" data-v-8127905e>↑</button><button class="px-1.5 py-1 text-xs hover:bg-foreground/5" data-v-8127905e>↓</button><button class="px-1.5 py-1 text-xs text-red-600 hover:bg-red-50" data-v-8127905e>✕</button></div></div><div class="p-3" data-v-8127905e>`);
        if (block.type === "text") {
          _push(`<div class="overflow-hidden border border-foreground/10" data-v-8127905e><div class="flex flex-wrap items-center gap-1 border-b border-foreground/10 bg-muted px-2 py-1.5" data-v-8127905e><select class="h-7 border border-foreground/10 bg-card px-1 text-xs" data-v-8127905e><option value="" data-v-8127905e>Абзац</option><option value="H2" data-v-8127905e>H2</option><option value="H3" data-v-8127905e>H3</option></select><span class="mx-1 h-4 w-px bg-foreground/10" data-v-8127905e></span><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e><b data-v-8127905e>Ж</b></button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e><i data-v-8127905e>К</i></button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e><u data-v-8127905e>Ч</u></button><span class="mx-1 h-4 w-px bg-foreground/10" data-v-8127905e></span><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>≡</button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>1.</button><span class="mx-1 h-4 w-px bg-foreground/10" data-v-8127905e></span><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>⬅</button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>↔</button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>➡</button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>⇹</button><span class="mx-1 h-4 w-px bg-foreground/10" data-v-8127905e></span><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>❝</button><button class="h-7 w-7 text-xs hover:bg-foreground/5" data-v-8127905e>🔗</button></div><div${ssrRenderAttr("data-id", block.id)} contenteditable="true" class="min-h-[120px] px-3 py-2 text-sm leading-relaxed outline-none" data-v-8127905e></div></div>`);
        } else if (block.type === "image") {
          _push(`<div class="space-y-3" data-v-8127905e>`);
          if (block.data?.path) {
            _push(`<div class="relative inline-block" data-v-8127905e><img${ssrRenderAttr("src", `${unref(coverBaseUrl)}${block.data.path}`)} class="max-h-48 rounded border border-foreground/10 object-contain" alt="" data-v-8127905e><button class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white" data-v-8127905e>✕</button></div>`);
          } else {
            _push(`<label class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-8 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground" data-v-8127905e><input type="file" accept="image/*" class="hidden" data-v-8127905e> 🖼 Нажмите, чтобы загрузить изображение </label>`);
          }
          _push(`<input${ssrRenderAttr("value", block.data.caption)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent" placeholder="Подпись к изображению" data-v-8127905e><input${ssrRenderAttr("value", block.data.source)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:border-accent" placeholder="Источник фото" data-v-8127905e></div>`);
        } else if (block.type === "slider" || block.type === "gallery") {
          _push(`<div class="space-y-3" data-v-8127905e>`);
          if (block.data?.items?.length) {
            _push(`<div class="grid grid-cols-2 gap-3 sm:grid-cols-3" data-v-8127905e><!--[-->`);
            ssrRenderList(block.data.items, (item, i) => {
              _push(`<div class="space-y-2 rounded border border-foreground/10 p-2" data-v-8127905e><div class="relative" data-v-8127905e><img${ssrRenderAttr("src", `${unref(coverBaseUrl)}${item.path}`)} class="h-24 w-full rounded border border-foreground/10 object-cover" alt="" data-v-8127905e><button class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white" data-v-8127905e>✕</button></div><input${ssrRenderAttr("value", item.source)} type="text" class="w-full border border-foreground/10 bg-card px-2 py-1.5 text-[11px] outline-none focus:border-accent" placeholder="Источник фото" data-v-8127905e></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<label class="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/10 px-4 py-6 text-xs text-foreground/50 transition hover:border-accent hover:text-foreground" data-v-8127905e><input type="file" accept="image/*" multiple class="hidden" data-v-8127905e> 🖼 Добавить изображения </label></div>`);
        } else if (block.type === "embed") {
          _push(`<div class="space-y-2" data-v-8127905e><textarea rows="4" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-xs font-mono outline-none focus:border-accent" placeholder="Вставьте HTML-код, ссылку на Youube, iframe..." data-v-8127905e>${ssrInterpolate(block.data.code)}</textarea></div>`);
        } else {
          _push(`<div class="border-2 border-dashed border-foreground/10 px-4 py-8 text-center text-xs text-foreground/50" data-v-8127905e> Блок «${ssrInterpolate(block.title)}» — заглушка. </div>`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div><div class="flex flex-wrap gap-2" data-v-8127905e><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Текстовый блок</button><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Изображение</button><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Слайдер</button><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Галерея</button><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Embed</button><button class="border border-dashed border-black/20 px-3 py-1.5 text-xs transition hover:border-accent hover:text-foreground" data-v-8127905e>＋ Акцент</button></div></div></div><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> SEO-настройки </div><div class="space-y-4 p-4" data-v-8127905e><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Meta Title</label><input${ssrRenderAttr("value", form.seoTitle)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Заголовок для поисковиков" data-v-8127905e></div><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Meta Description</label><textarea rows="2" class="w-full resize-y border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Краткое описание..." data-v-8127905e>${ssrInterpolate(form.seoDescription)}</textarea></div><div data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Keywords</label><input${ssrRenderAttr("value", form.seoKeywords)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="вино, виноделие, виноград" data-v-8127905e></div></div></div></div><div class="space-y-6" data-v-8127905e><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Обложка </div><div class="space-y-4 p-4" data-v-8127905e><div class="flex gap-4" data-v-8127905e><div class="flex h-24 w-36 shrink-0 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-foreground/10 text-center text-xs text-foreground/50 transition hover:border-accent hover:text-foreground" data-v-8127905e>`);
      if (form.coverPath) {
        _push(`<img${ssrRenderAttr("src", `${unref(coverBaseUrl)}${form.coverPath}`)} class="h-full w-full object-cover" alt="" data-v-8127905e>`);
      } else {
        _push(`<!--[--> 🖼<br data-v-8127905e>Нет файла <!--]-->`);
      }
      _push(`</div><div class="flex flex-1 flex-col gap-2" data-v-8127905e><input type="file" accept="image/*" class="hidden" data-v-8127905e><button class="btn-secondary w-full text-xs" data-v-8127905e>Загрузить</button><button class="btn-danger w-full text-xs"${ssrIncludeBooleanAttr(!form.coverMediaId) ? " disabled" : ""} data-v-8127905e>🗑 Удалить</button><label class="flex cursor-pointer items-center gap-2 text-xs text-foreground/70" data-v-8127905e><div class="${ssrRenderClass([form.coverShowWatermark ? "bg-accent" : "", "relative h-4 w-8 cursor-pointer rounded-full bg-foreground/10 transition"])}" data-v-8127905e><span class="${ssrRenderClass([form.coverShowWatermark ? "translate-x-4" : "", "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-card transition"])}" data-v-8127905e></span></div> Водяной знак </label></div></div><div class="mt-3" data-v-8127905e><label class="mb-1 block text-xs font-medium text-foreground/70" data-v-8127905e>Источник видео</label><input${ssrRenderAttr("value", form.videoUrl)} type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="https://youtube.com/..." data-v-8127905e></div></div></div><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Рубрики и теги </div><div class="space-y-4 p-4" data-v-8127905e><div data-v-8127905e><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50" data-v-8127905e>Рубрики</p>`);
      if (loading.value) {
        _push(`<div class="text-xs text-foreground/50" data-v-8127905e>Загрузка…</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-2" data-v-8127905e><!--[-->`);
        ssrRenderList(categories.value, (cat) => {
          _push(`<button class="${ssrRenderClass([form.categoryIds.includes(cat.id) ? "bg-accent text-white" : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10", "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition"])}" data-v-8127905e><span class="h-3 w-3 rounded-sm border border-current flex items-center justify-center text-[8px]" data-v-8127905e>${ssrInterpolate(form.categoryIds.includes(cat.id) ? "✓" : "")}</span> ${ssrInterpolate(cat.name)}</button>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div><div data-v-8127905e><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50" data-v-8127905e>Темы</p>`);
      if (loading.value) {
        _push(`<div class="text-xs text-foreground/50" data-v-8127905e>Загрузка…</div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-2" data-v-8127905e><!--[-->`);
        ssrRenderList(tags.value, (tag) => {
          _push(`<button class="${ssrRenderClass([form.tagIds.includes(tag.id) ? "bg-accent/10 text-accent" : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10", "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition"])}" data-v-8127905e><span class="h-3 w-3 rounded-sm border border-current flex items-center justify-center text-[8px]" data-v-8127905e>${ssrInterpolate(form.tagIds.includes(tag.id) ? "✓" : "")}</span> ${ssrInterpolate(tag.name)}</button>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div></div><div class="border border-foreground/10 bg-card" data-v-8127905e><div class="border-b border-foreground/10 bg-muted px-4 py-3 text-sm font-semibold" data-v-8127905e> Источники </div><div class="space-y-2 p-4" data-v-8127905e><!--[-->`);
      ssrRenderList(form.sources, (src, i) => {
        _push(`<div class="flex gap-2" data-v-8127905e><input${ssrRenderAttr("value", src.name)} type="text" class="flex-1 border border-foreground/10 bg-card px-2 py-1.5 text-xs outline-none focus:border-accent" placeholder="Название" data-v-8127905e><input${ssrRenderAttr("value", src.url)} type="text" class="flex-1 border border-foreground/10 bg-card px-2 py-1.5 text-xs outline-none focus:border-accent" placeholder="https://..." data-v-8127905e><button class="px-2 text-xs text-red-600 hover:bg-red-50" data-v-8127905e>✕</button></div>`);
      });
      _push(`<!--]--><button class="btn-secondary w-full text-xs" data-v-8127905e>＋ Добавить источник</button></div></div></div></div><div class="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4" data-v-8127905e><button class="btn-danger" data-v-8127905e>🗑 Удалить материал</button><div class="flex gap-2" data-v-8127905e><button class="btn-secondary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-8127905e> 💾 ${ssrInterpolate(saving.value ? "Сохранение…" : "Сохранить")}</button><button class="btn-primary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-8127905e> 🚀 Создать материал </button></div></div></div>`);
      _push(ssrRenderComponent(_component_EditorHelpModal, {
        modelValue: helpOpen.value,
        "onUpdate:modelValue": ($event) => helpOpen.value = $event
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EditorPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-8127905e"]]), { __name: "EditorPanel" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    const canCreate = computed(() => ["admin", "editor", "author"].includes(user.value?.role || ""));
    const activeType = ref("article");
    const editingId = ref("");
    const sidebarRef = ref(null);
    function selectType(type) {
      activeType.value = type;
      editingId.value = "";
    }
    function newMaterial() {
      editingId.value = "";
    }
    function selectMaterial(item) {
      activeType.value = item.type;
      editingId.value = item.id;
    }
    function onSaved(id) {
      editingId.value = id;
      sidebarRef.value?.load();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EditorSidebar = __nuxt_component_0$1;
      const _component_EditorPanel = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-[1600px] px-4 py-10" }, _attrs))}>`);
      if (unref(user)) {
        _push(`<div class="space-y-8">`);
        if (unref(canCreate)) {
          _push(`<div class="grid gap-6 lg:grid-cols-[260px_1fr] items-start">`);
          _push(ssrRenderComponent(_component_EditorSidebar, {
            ref_key: "sidebarRef",
            ref: sidebarRef,
            "active-type": unref(activeType),
            onSelectType: selectType,
            onNewMaterial: newMaterial,
            onSelectMaterial: selectMaterial
          }, null, _parent));
          _push(`<section class="border border-foreground/10 bg-card p-4 shadow-sm md:p-6">`);
          _push(ssrRenderComponent(_component_EditorPanel, {
            type: unref(activeType),
            "draft-id": unref(editingId),
            onSaved
          }, null, _parent));
          _push(`</section></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid gap-8 md:grid-cols-3"><section class="border border-foreground/10 bg-card p-6 shadow-sm md:col-span-2"><p class="text-xs font-medium uppercase tracking-wider text-foreground/50"> Настройки </p><h2 class="mt-2 font-heading text-xl font-bold">Профиль</h2><div class="mt-4 space-y-3 text-sm"><p><span class="text-foreground/60">Email:</span> ${ssrInterpolate(unref(user).email)}</p>`);
        if (unref(user).username) {
          _push(`<p><span class="text-foreground/60">Логин:</span> ${ssrInterpolate(unref(user).username)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(user).displayName) {
          _push(`<p><span class="text-foreground/60">Отображаемое имя:</span> ${ssrInterpolate(unref(user).displayName)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section>`);
        if (unref(user).role === "admin") {
          _push(`<section class="border border-foreground/10 bg-card p-6 shadow-sm"><p class="text-xs font-medium uppercase tracking-wider text-foreground/50"> Администрирование </p><h2 class="mt-2 font-heading text-xl font-bold">Пользователи</h2><p class="mt-2 text-sm text-foreground/70"> Управляйте ролями пользователей. </p><div class="mt-4">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/account/admin",
            class: "inline-block bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Управление пользователями `);
              } else {
                return [
                  createTextVNode(" Управление пользователями ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></section>`);
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BBZAO6ps.mjs.map
