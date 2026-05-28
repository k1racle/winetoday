import { Eye, Palette } from '@strapi/icons';
import { createElement } from 'react';
import { ADMIN_LOCALES, ADMIN_TRANSLATIONS } from './translations';
import SocialAuthCallbackHints from './components/social-auth-callback-hints';
import AuthorStatsPanel from './components/author-stats-panel';

const FRONTEND_COLLECTION_PATHS: Record<string, string | null> = {
  'api::article.article': '/articles',
  'api::news.news': '/news',
  'api::video.video': '/videos',
  'api::page.page': '',
  'api::tag.tag': '/tags',
};

function buildFrontendHref(uid?: string, slug?: string | null) {
  if (!uid || !slug) {
    return null;
  }

  const basePath = FRONTEND_COLLECTION_PATHS[uid];

  if (basePath === undefined || basePath === null) {
    return null;
  }

  const href = `${basePath}/${slug}`;
  return href.replace(/\/+/g, '/');
}

function getCurrentContentTypeUid() {
  if (typeof window === 'undefined') {
    return null;
  }

  const match = window.location.pathname.match(/\/content-manager\/(?:collection-types|single-types)\/([^/]+)/i);
  const encodedUid = match?.[1];

  if (!encodedUid) {
    return null;
  }

  try {
    return decodeURIComponent(encodedUid);
  } catch {
    return encodedUid;
  }
}

function isRussianAdminLocale() {
  if (typeof document !== 'undefined') {
    const documentLang = document.documentElement.lang?.toLowerCase();

    if (documentLang) {
      return documentLang.startsWith('ru');
    }
  }

  if (typeof navigator !== 'undefined') {
    return navigator.language.toLowerCase().startsWith('ru');
  }

  return false;
}

function getAdminUiLabel(ruLabel: string, enLabel: string) {
  return isRussianAdminLocale() ? ruLabel : enLabel;
}

function renderOpenTrigger(label: string, href: string) {
  return createElement(
    'button',
    {
      type: 'button',
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        minWidth: '2rem',
        minHeight: '2rem',
        padding: '0.35rem 0.5rem',
        border: '1px solid var(--strapi.colors.neutral200)',
        borderRadius: '999px',
        background: 'var(--strapi.colors.neutral0)',
        color: 'var(--strapi.colors.primary600)',
        fontWeight: 600,
        cursor: 'pointer',
      },
      title: label,
      'aria-label': label,
    },
    createElement(Eye, { width: '0.9rem', height: '0.9rem' }),
    createElement(
      'span',
      {
        style: {
          fontSize: '0.75rem',
          lineHeight: 1,
        },
      },
      label,
    ),
  );
}

export default {
  register(app: any) {
    app.customFields.register({
      name: 'color',
      type: 'string',
      intlLabel: {
        id: 'vino.color.label',
        defaultMessage: 'Color',
      },
      intlDescription: {
        id: 'vino.color.description',
        defaultMessage: 'Pick a color from the palette or enter a HEX value manually.',
      },
      icon: Palette,
      components: {
        Input: async () => import('./components/color-input').then((module) => ({ default: module.default })),
      },
    });

  },
  config: {
    locales: ADMIN_LOCALES,
    translations: ADMIN_TRANSLATIONS,
    tutorials: false,
    notifications: {
      releases: false,
    },
    theme: {
      light: {
        colors: {
          primary100: "#e3f3e7",
          primary200: "#b7dfc0",
          primary500: "#1f7a42",
          primary600: "#176235",
          primary700: "#124d2a",
        },
      },
      dark: {
        colors: {
          primary100: "#163121",
          primary200: "#204a31",
          primary500: "#3ca768",
          primary600: "#58c57f",
          primary700: "#7ee09f",
        },
      },
    },
  },
  bootstrap(app: any) {
    const contentManager = app.getPlugin?.('content-manager');

    contentManager?.injectComponent('editView', 'right-links', {
      name: 'vino-social-auth-callback-hints',
      Component: SocialAuthCallbackHints,
    });

    contentManager?.injectComponent('editView', 'right-links', {
      name: 'vino-author-stats-panel',
      Component: AuthorStatsPanel,
    });

    app.registerHook(
      'Admin/CM/pages/ListView/inject-column-in-table',
      ({ displayedHeaders, layout }: { displayedHeaders?: any[]; layout?: any }) => {
        if (!Array.isArray(displayedHeaders) || !Array.isArray(layout)) {
          return { displayedHeaders, layout };
        }

        const uid = getCurrentContentTypeUid();

        if (!uid || !(uid in FRONTEND_COLLECTION_PATHS)) {
          return { displayedHeaders, layout };
        }

        if (displayedHeaders.some((header) => header?.name === 'openFrontend')) {
          return { displayedHeaders, layout };
        }

        const openLabel = getAdminUiLabel('На сайт', 'Open');
        const viewsLabel = getAdminUiLabel('Просмотры', 'Views');

        const viewsColumn = {
          attribute: { type: 'integer' },
          label: viewsLabel,
          name: 'views',
          searchable: false,
          sortable: false,
          cellFormatter: (document: Record<string, unknown>) => {
            const rawViews = Number((document as Record<string, unknown>).views);
            return Number.isFinite(rawViews) && rawViews > 0 ? rawViews.toLocaleString('ru-RU') : '0';
          },
        };

        const openColumn = {
          attribute: { type: 'custom' },
          label: openLabel,
          name: 'openFrontend',
          searchable: false,
          sortable: false,
          cellFormatter: (document: Record<string, unknown>) => {
            const href = buildFrontendHref(uid, typeof document.slug === 'string' ? document.slug : null);

            if (!href) {
              return '-';
            }

            return renderOpenTrigger(openLabel, href);
          },
        };

        const statusIndex = displayedHeaders.findIndex((header) => header?.name === 'status');
        const headersWithOpen = [...displayedHeaders];
        const shouldShowViewsColumn = ['api::article.article', 'api::news.news', 'api::video.video', 'api::gallery.gallery'].includes(uid);

        if (statusIndex >= 0) {
          headersWithOpen.splice(statusIndex, 0, ...(shouldShowViewsColumn ? [viewsColumn, openColumn] : [openColumn]));
        } else {
          headersWithOpen.push(...(shouldShowViewsColumn ? [viewsColumn, openColumn] : [openColumn]));
        }

        return {
          displayedHeaders: headersWithOpen,
          layout,
        };
      },
    );

    app.registerHook(
      'Admin/CM/pages/EditView/mutate-edit-view-layout',
      ({ layout, ...rest }: { layout: any; [key: string]: any }) => {
        if (!Array.isArray(layout)) {
          return {
            ...rest,
            layout,
          };
        }

        const updatedLayout = layout.map((rowGroup: any[]) =>
          rowGroup.map((row: any[]) => row.filter((field) => field?.attribute?.name !== 'views')),
        );

        return {
          ...rest,
          layout: updatedLayout,
        };
      },
    );
  },
};
