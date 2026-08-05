<script setup lang="ts">
defineProps<{
  sidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const route = useRoute();
const { user, signOut } = useAuth();
const { items } = useCmsNavigation();

const viewMap = [
  {
    match: '/cms/projects/winemakers',
    eyebrow: 'Каталог и спецпроекты',
    title: 'Виноделы России',
    description: 'Отдельный контур настроек, контента и публикации спецпроекта.',
  },
  {
    match: '/cms/projects',
    eyebrow: 'Каталог и спецпроекты',
    title: 'Спецпроекты',
    description: 'Управление витринами, спецразделами и их публичной доступностью.',
  },
  {
    match: '/cms/editor',
    eyebrow: 'Рабочее место',
    title: 'Редактор материалов',
    description: 'Создание, редактирование и выпуск материалов в публикацию.',
  },
  {
    match: '/cms/materials',
    eyebrow: 'Рабочее место',
    title: 'Все материалы',
    description: 'Полный список материалов сайта с редакционными статусами.',
  },
  {
    match: '/cms/homepage',
    eyebrow: 'Структура сайта',
    title: 'Главная сайта',
    description: 'Композиция главной страницы, блоки, приоритеты и ручные подборки.',
  },
  {
    match: '/cms/pages',
    eyebrow: 'Структура сайта',
    title: 'Страницы',
    description: 'Служебные и редакционные страницы сайта.',
  },
  {
    match: '/cms/media',
    eyebrow: 'Структура сайта',
    title: 'Медиабиблиотека',
    description: 'Изображения, обложки и остальные медиа-ресурсы редакции.',
  },
  {
    match: '/cms/comments',
    eyebrow: 'Рабочее место',
    title: 'Комментарии',
    description: 'Модерация пользовательских комментариев и обратной связи.',
  },
  {
    match: '/cms/categories',
    eyebrow: 'Структура сайта',
    title: 'Рубрики',
    description: 'Таксономия материалов, рубрики и вложенность разделов.',
  },
  {
    match: '/cms/tags',
    eyebrow: 'Структура сайта',
    title: 'Теги',
    description: 'Тематические метки и вспомогательная навигация по контенту.',
  },
  {
    match: '/cms/authors',
    eyebrow: 'Каталог и спецпроекты',
    title: 'Авторы',
    description: 'Редакционные профили, биографии и статистика по публикациям.',
  },
  {
    match: '/cms/users',
    eyebrow: 'Аудитория и маркетинг',
    title: 'Пользователи',
    description: 'Учетные записи, роли доступа и внутренняя редакционная команда.',
  },
  {
    match: '/cms/socials',
    eyebrow: 'Аудитория и маркетинг',
    title: 'Соцсети',
    description: 'Ссылки, площадки и представление редакции во внешних каналах.',
  },
  {
    match: '/cms/utm',
    eyebrow: 'Аудитория и маркетинг',
    title: 'UTM-метки',
    description: 'Маркетинговые ссылки и контроль трафика по рекламным каналам.',
  },
  {
    match: '/cms/subscribers',
    eyebrow: 'Аудитория и маркетинг',
    title: 'Подписчики',
    description: 'Аудитория рассылок и контактная база подписок.',
  },
  {
    match: '/cms/settings',
    eyebrow: 'Система',
    title: 'Настройки',
    description: 'Базовые параметры CMS и системные переключатели.',
  },
];

const navigationItems = computed(() =>
  items.value.flatMap((item) => [item, ...(item.children || [])]),
);

const currentView = computed(() => {
  const matched = viewMap.find((item) => route.path.startsWith(item.match));
  if (matched) return matched;

  const activeItem = [...navigationItems.value]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => route.path === item.to || route.path.startsWith(`${item.to}/`));

  return {
    eyebrow: 'Редакционная система',
    title: activeItem?.label || 'CMS',
    description: 'Рабочее пространство редакции, каталогов и служебных настроек.',
  };
});

const userLabel = computed(
  () => user.value?.displayName || user.value?.username || user.value?.email || 'Пользователь',
);

const roleLabelMap: Record<string, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  author: 'Автор',
};

const roleLabel = computed(() => roleLabelMap[user.value?.role || ''] || 'Команда');

async function logoutAndExit() {
  await signOut();
  await navigateTo('/');
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-white/10 bg-[#09131d]/80 backdrop-blur-xl">
    <div class="flex min-h-[84px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 lg:hidden"
          :aria-expanded="sidebarOpen"
          @click="emit('toggle-sidebar')"
        >
          <span class="text-lg">≡</span>
        </button>
        <div class="min-w-0">
          <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">
            {{ currentView.eyebrow }}
          </div>
          <div class="mt-1 truncate font-heading text-2xl font-bold leading-none text-white">
            {{ currentView.title }}
          </div>
          <p class="mt-2 hidden max-w-2xl truncate text-sm text-white/50 xl:block">
            {{ currentView.description }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 lg:gap-3">
        <span class="hidden rounded-full border border-accent/20 bg-accent/15 px-3 py-1.5 text-xs text-accent xl:inline-flex">
          {{ roleLabel }}
        </span>
        <span class="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 2xl:inline-flex">
          {{ userLabel }}
        </span>
        <NuxtLink
          to="/"
          class="hidden rounded-full border border-white/10 px-3 py-2 text-sm text-white/65 transition hover:border-white/20 hover:text-white md:inline-flex"
        >
          Открыть сайт
        </NuxtLink>
        <NuxtLink
          to="/account"
          class="hidden rounded-full border border-white/10 px-3 py-2 text-sm text-white/65 transition hover:border-white/20 hover:text-white md:inline-flex"
        >
          Аккаунт
        </NuxtLink>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-white/10 px-3 py-2 text-sm text-white/65 transition hover:border-white/20 hover:text-white"
          @click="logoutAndExit"
        >
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>
