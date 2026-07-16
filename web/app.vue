<script setup lang="ts">
declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

const route = useRoute();
useUtm();

useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();`,
    },
    {
      type: 'text/javascript',
      innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108722624','ym');ym(108722624,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
    },
  ],
  noscript: [
    {
      innerHTML: '<div><img src="https://mc.yandex.ru/watch/108722624" style="position:absolute; left:-9999px;" alt="" /></div>',
    },
  ],
});

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client && window.ym) {
      window.ym(108722624, 'hit', location.href);
    }
  },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ShareModal />
</template>
