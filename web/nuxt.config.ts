export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  devtools: { enabled: false },
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
      meilisearchUrl: process.env.NUXT_PUBLIC_MEILISEARCH_URL || 'http://localhost/search',
      editorUrl: process.env.NUXT_PUBLIC_EDITOR_URL || 'http://localhost:3000/account',
      uploadsUrl: process.env.NUXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000/uploads',
    },
  },
  image: {
    provider: 'none',
  },
  routeRules: {
    '/': { swr: 60 },
    '/articles/**': { swr: 60 },
    '/news/**': { swr: 60 },
    '/videos/**': { swr: 60 },
    '/gallery/**': { swr: 60 },
    '/account/**': { ssr: false },
    '/api/og-image': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
});
