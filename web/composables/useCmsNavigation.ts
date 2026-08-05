type CmsNavItem = {
  label: string;
  to: string;
  roles?: string[];
  children?: CmsNavItem[];
};

const cmsNavItems: CmsNavItem[] = [
  { label: 'Дашборд', to: '/cms', roles: ['admin', 'editor', 'author'] },
  { label: 'Редактор', to: '/cms/editor', roles: ['admin', 'editor', 'author'] },
  { label: 'Материалы', to: '/cms/materials', roles: ['admin'] },
  { label: 'Страницы', to: '/cms/pages', roles: ['admin'] },
  { label: 'Медиа', to: '/cms/media', roles: ['admin'] },
  { label: 'Комментарии', to: '/cms/comments', roles: ['admin'] },
  {
    label: 'Рубрики и теги',
    to: '/cms/categories',
    roles: ['admin'],
    children: [
      { label: 'Рубрики', to: '/cms/categories', roles: ['admin'] },
      { label: 'Теги', to: '/cms/tags', roles: ['admin'] },
    ],
  },
  { label: 'Авторы', to: '/cms/authors', roles: ['admin'] },
  { label: 'Главная сайта', to: '/cms/homepage', roles: ['admin', 'editor'] },
  {
    label: 'Спецпроекты',
    to: '/cms/projects',
    roles: ['admin'],
    children: [
      { label: 'Все проекты', to: '/cms/projects', roles: ['admin'] },
      { label: 'Виноделы России', to: '/cms/projects/winemakers', roles: ['admin'] },
    ],
  },
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
  { label: 'Настройки', to: '/cms/settings', roles: ['admin'] },
];

function canSee(item: CmsNavItem, role: string | undefined) {
  if (!item.roles?.length) return true;
  return !!role && item.roles.includes(role);
}

export function useCmsNavigation() {
  const { user } = useAuth();

  const items = computed(() => {
    const role = user.value?.role;
    return cmsNavItems
      .filter((item) => canSee(item, role))
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => canSee(child, role)) || [],
      }));
  });

  return {
    items,
  };
}
