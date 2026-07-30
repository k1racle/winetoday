<script setup lang="ts">
declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

const route = useRoute();
const { ymId } = useYm();
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

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client && !isAccountRoute() && window.ym) {
      window.ym(ymId, 'hit', location.href, {
        title: document.title,
        referer: document.referrer,
      });
    }
  },
  { flush: 'post' },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ShareModal />
</template>
