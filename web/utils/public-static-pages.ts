export interface PublicStaticPageDefinition {
  slug: string;
  label: string;
}

export const PUBLIC_STATIC_PAGES: PublicStaticPageDefinition[] = [
  { slug: 'about', label: 'О проекте' },
  { slug: 'contacts', label: 'Контакты' },
  { slug: 'legal', label: 'Правовая информация' },
  { slug: 'privacy', label: 'Политика обработки персональных данных' },
  { slug: 'editorial-policy', label: 'Редакционная политика' },
  { slug: 'corrections-policy', label: 'Политика исправлений' },
];
