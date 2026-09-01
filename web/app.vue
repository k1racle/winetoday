<script setup lang="ts">
declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

const route = useRoute();
const config = useRuntimeConfig();
const { ymId } = useYm();
const { user } = useAuth();
const { siteSettings } = useSharedSiteSettings();
useUtm();

const siteUrl = (config.public.siteUrl as string)?.replace(/\/+$/, '') || '';
const siteRootUrl = `${siteUrl}/`;
const organizationId = `${siteRootUrl}#organization`;
const websiteId = `${siteRootUrl}#website`;
const logoUrl = `${siteUrl}/logo-light.png`;
const siteNavigation = [
  { name: 'О проекте', url: `${siteUrl}/about` },
  { name: 'Новости', url: `${siteUrl}/news` },
  { name: 'Видео', url: `${siteUrl}/videos` },
  { name: 'Статьи', url: `${siteUrl}/articles` },
  { name: 'Авторы', url: `${siteUrl}/authors` },
  { name: 'Контакты', url: `${siteUrl}/contacts` },
];

function getSocialProfileUrls(settings: unknown): string[] {
  const links = (
    settings as
      | { socialLinks?: { links?: Array<{ href?: unknown }> | null } | null }
      | null
      | undefined
  )?.socialLinks?.links;

  if (!Array.isArray(links)) return [];

  return [...new Set(links.flatMap((link) => {
    if (typeof link?.href !== 'string') return [];

    try {
      const url = new URL(link.href.trim());
      return url.protocol === 'http:' || url.protocol === 'https:' ? [url.href] : [];
    } catch {
      return [];
    }
  }))];
}

const isInternalRoute = () => isAnalyticsExcludedRoute(route.path);

useHead(() => {
  const internal = isInternalRoute();
  const sameAs = getSocialProfileUrls(siteSettings.value);
  const publicScripts = internal
    ? []
    : [
        {
          key: 'metrika-init',
          type: 'text/javascript',
          innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymId}','ym');ym(${ymId},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
        },
        {
          key: 'site-organization-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsMediaOrganization',
            '@id': organizationId,
            name: 'ВИНОДЕЛИЕ СЕГОДНЯ',
            url: siteRootUrl,
            logo: {
              '@type': 'ImageObject',
              '@id': `${siteRootUrl}#logo`,
              url: logoUrl,
            },
            image: logoUrl,
            description:
              'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.',
            sameAs: sameAs.length ? sameAs : undefined,
            masthead: `${siteUrl}/authors`,
            publishingPrinciples: `${siteUrl}/editorial-policy`,
            correctionsPolicy: `${siteUrl}/corrections-policy`,
          }),
        },
        {
          key: 'site-website-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': websiteId,
            name: 'ВИНОДЕЛИЕ СЕГОДНЯ',
            url: siteRootUrl,
            description:
              'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.',
            inLanguage: 'ru-RU',
            publisher: {
              '@id': organizationId,
            },
          }),
        },
        {
          key: 'site-navigation-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: siteNavigation.map((item, index) => ({
              '@type': 'SiteNavigationElement',
              position: index + 1,
              name: item.name,
              url: item.url,
            })),
          }),
        },
      ];

  return {
    meta: internal
      ? [
          { name: 'robots', content: 'noindex, nofollow' },
          { name: 'googlebot', content: 'noindex, nofollow' },
        ]
      : [
          {
            name: 'googlebot',
            content: 'max-image-preview:large',
          },
        ],
    script: [
      {
        key: 'theme-init',
        innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();`,
      },
      ...publicScripts,
    ],
    noscript: internal
      ? []
      : [
          {
            key: 'metrika-noscript',
            innerHTML: `<div><img src="https://mc.yandex.ru/watch/${ymId}" style="position:absolute; left:-9999px;" alt="" /></div>`,
          },
        ],
  };
});

// Lazy Metrika init: if the page was loaded directly on an internal route
// (init script skipped in useHead), inject tag.js and run init once on the
// first navigation to a public route, then keep sending hits as usual.
let ymLazyInited = false;

function lazyInitMetrika() {
  if (ymLazyInited) return;
  ymLazyInited = true;
  const w = window as any;
  w.ym = w.ym || function (...args: any[]) {
    (w.ym.a = w.ym.a || []).push(args);
  };
  w.ym.l = Date.now();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${ymId}`;
  document.head.appendChild(script);
  window.ym!(ymId, 'init', {
    ssr: false,
    webvisor: true,
    clickmap: true,
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client && !isInternalRoute()) {
      if (!window.ym) {
        lazyInitMetrika();
        return;
      }
      window.ym(ymId, 'hit', location.href, {
        title: document.title,
        referer: document.referrer,
      });
    }
  },
  { flush: 'post' },
);

// Один раз помечаем внутренних пользователей (admin/editor) через userParams,
// чтобы их трафик можно было отфильтровать в отчётах Метрики.
let userParamsSent = false;

watch(
  [user, () => route.fullPath],
  () => {
    if (import.meta.server || userParamsSent) return;
    if (isInternalRoute()) return;
    const role = user.value?.role;
    if (!role || !['admin', 'editor'].includes(role)) return;
    if (typeof window.ym !== 'function') return;
    try {
      window.ym(ymId, 'userParams', { internal_user: 1, internal_role: role });
      userParamsSent = true;
    } catch {
      // ignore
    }
  },
  { immediate: true, flush: 'post' },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ShareModal />
</template>
