type CmsNavItem = {
  label: string;
  to: string;
  roles?: string[];
  children?: CmsNavItem[];
};

type CmsNavSection = {
  label: string;
  items: CmsNavItem[];
};

const cmsNavSections: CmsNavSection[] = [
  {
    label: 'Рабочее место',
    items: [
      { label: 'Дашборд', to: '/cms', roles: ['admin', 'editor', 'author'] },
      { label: 'Редактор', to: '/cms/editor', roles: ['admin', 'editor', 'author'] },
      { label: 'Материалы', to: '/cms/materials', roles: ['admin'] },
      { label: 'Комментарии', to: '/cms/comments', roles: ['admin'] },
    ],
  },
  {
    label: 'Структура сайта',
    items: [
      { label: 'Главная сайта', to: '/cms/homepage', roles: ['admin', 'editor'] },
      { label: 'Страницы', to: '/cms/pages', roles: ['admin'] },
      { label: 'Медиа', to: '/cms/media', roles: ['admin'] },
      {
        label: 'Рубрики и теги',
        to: '/cms/categories',
        roles: ['admin'],
        children: [
          { label: 'Рубрики', to: '/cms/categories', roles: ['admin'] },
          { label: 'Теги', to: '/cms/tags', roles: ['admin'] },
        ],
      },
    ],
  },
  {
    label: 'Каталог и спецпроекты',
    items: [
      { label: 'Авторы', to: '/cms/authors', roles: ['admin'] },
      {
        label: 'Спецпроекты',
        to: '/cms/projects',
        roles: ['admin'],
        children: [
          { label: 'Все проекты', to: '/cms/projects', roles: ['admin'] },
          { label: 'Виноделы России', to: '/cms/projects/winemakers', roles: ['admin'] },
        ],
      },
    ],
  },
  {
    label: 'Аудитория и маркетинг',
    items: [
      {
        label: 'Маркетинг',
        to: '/cms/socials',
        roles: ['admin'],
        children: [
          { label: 'Соцсети', to: '/cms/socials', roles: ['admin'] },
          { label: 'UTM', to: '/cms/utm', roles: ['admin'] },
          { label: 'Подписчики', to: '/cms/subscribers', roles: ['admin'] },
        ],
      },
      {
        label: 'Пользователи',
        to: '/cms/users',
        roles: ['admin'],
        children: [
          { label: 'Все пользователи', to: '/cms/users', roles: ['admin'] },
          { label: 'Авторы', to: '/cms/authors', roles: ['admin'] },
        ],
      },
    ],
  },
  {
    label: 'Система',
    items: [
      { label: 'Настройки', to: '/cms/settings', roles: ['admin'] },
    ],
  },
];

function canSee(item: CmsNavItem, role: string | undefined) {
  if (!item.roles?.length) return true;
  return !!role && item.roles.includes(role);
}

function filterItems(items: CmsNavItem[], role: string | undefined) {
  return items
    .filter((item) => canSee(item, role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => canSee(child, role)) || [],
    }));
}

export function useCmsNavigation() {
  const { user } = useAuth();

  const sections = computed(() => {
    const role = user.value?.role;
    return cmsNavSections
      .map((section) => ({
        ...section,
        items: filterItems(section.items, role),
      }))
      .filter((section) => section.items.length);
  });

  const items = computed(() => sections.value.flatMap((section) => section.items));

  return {
    items,
    sections,
  };
}
