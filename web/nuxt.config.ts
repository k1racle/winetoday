export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'ВИНОДЕЛИЕ СЕГОДНЯ - Федеральное отраслевое медиа',
      titleTemplate: '%s | ВИНОДЕЛИЕ СЕГОДНЯ - Федеральное отраслевое медиа',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.' },
        { property: 'og:site_name', content: 'ВИНОДЕЛИЕ СЕГОДНЯ - Федеральное отраслевое медиа' },
        { property: 'og:title', content: 'ВИНОДЕЛИЕ СЕГОДНЯ - Федеральное отраслевое медиа' },
        { property: 'og:description', content: 'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ВИНОДЕЛИЕ СЕГОДНЯ - Федеральное отраслевое медиа' },
        { name: 'twitter:description', content: 'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preload', href: '/fonts/Lato-Regular.ttf', as: 'font', type: 'font/ttf', crossorigin: '' },
        { rel: 'preload', href: '/fonts/Lato-Bold.ttf', as: 'font', type: 'font/ttf', crossorigin: '' },
      ],
    },
  },
  devtools: { enabled: false },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { visibility: false, interaction: true },
      },
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiUrl: process.env.API_URL || 'http://api:4000/api',
    revalidateSecret: process.env.REVALIDATE_SECRET,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:4000',
      editorUrl: process.env.NUXT_PUBLIC_EDITOR_URL || 'http://localhost:3000/account',
      uploadsUrl: process.env.NUXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000/uploads',
    },
  },
  image: {
    provider: 'none',
  },
  routeRules: {
    '/': { swr: 60 },
    '/articles/**': { swr: 300 },
    '/news/**': { swr: 300 },
    '/videos/**': { swr: 300 },
    '/gallery/**': { swr: 300 },
    '/author/**': { swr: 300 },
    '/category/**': { swr: 300 },
    '/account/**': { ssr: false },
    '/api/og-image': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
});
