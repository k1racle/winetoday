<script setup lang="ts">
declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

const route = useRoute();
const { ymId } = useYm();
const { user } = useAuth();
useUtm();

const isAccountRoute = () => route.path.startsWith('/account');

useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();`,
    },
    ...(!isAccountRoute()
      ? [
          {
            type: 'text/javascript',
            innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymId}','ym');ym(${ymId},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
          },
        ]
      : []),
  ],
  noscript: !isAccountRoute()
    ? [
        {
          innerHTML: `<div><img src="https://mc.yandex.ru/watch/${ymId}" style="position:absolute; left:-9999px;" alt="" /></div>`,
        },
      ]
    : [],
});

// Lazy Metrika init: if the page was loaded directly on /account (init script
// skipped in useHead), inject tag.js and run init once on the first navigation
// to a public route, then keep sending hits as usual.
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
    if (import.meta.client && !isAccountRoute()) {
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
    if (isAccountRoute()) return;
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
