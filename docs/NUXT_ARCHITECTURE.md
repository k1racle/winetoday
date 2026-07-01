# Архитектура «Виноделие сегодня» на Nuxt 4 + NestJS

Документ описывает **полную целевую структуру** проекта при переходе:

- **Frontend:** Nuxt 4 (Vue 3, TypeScript, SSR) — вместо Next.js  
- **Backend:** NestJS + Prisma + PostgreSQL — вместо Strapi  
- **Новые подсистемы:** водяные метки, расширенная аналитика просмотров  

> **Статус:** проектный план. Код не внедрён.  
> **Связанный документ:** `docs/NEW_ARCHITECTURE.md` — общая схема БД и backend; здесь акцент на Nuxt-слой.  
> **Ограничение:** сохранить все данные (контент, пользователи, медиа, просмотры, связи).

---

## Содержание

1. [Почему Nuxt и что меняется](#1-почему-nuxt-и-что-меняется)
2. [Целевой стек](#2-целевой-стек)
3. [Схема сервисов](#3-схема-сервисов)
4. [Структура репозитория](#4-структура-репозитория)
5. [Маршрутизация и страницы](#5-маршрутизация-и-страницы)
6. [Слои frontend: composables, stores, server](#6-слои-frontend-composables-stores-server)
7. [SEO и метаданные](#7-seo-и-метаданные)
8. [Редактор материалов (Vue)](#8-редактор-материалов-vue)
9. [Водяные метки](#9-водяные-метки)
10. [Аналитика просмотров](#10-аналитика-просмотров)
11. [Аутентификация](#11-аутентификация)
12. [Backend API (NestJS)](#12-backend-api-nestjs)
13. [Схема базы данных](#13-схема-базы-данных)
14. [Миграция: Next.js → Nuxt](#14-миграция-nextjs--nuxt)
15. [Миграция: Strapi → NestJS](#15-миграция-strapi--nestjs)
16. [Инфраструктура и nginx](#16-инфраструктура-и-nginx)
17. [План внедрения по спринтам](#17-план-внедрения-по-спринтам)
18. [Маппинг Next.js → Nuxt](#18-маппинг-nextjs--nuxt)
19. [Риски и решения](#19-риски-и-решения)

---

## 1. Почему Nuxt и что меняется

### Что остаётся концептуально тем же

- SSR для SEO (статьи, новости, теги, категории)
- Редактор в `/account` для авторов и редакторов
- Отдельный API-сервис (не CMS)
- PostgreSQL как источник правды
- Meilisearch, Redis, Docker, nginx

### Что переписывается полностью

| Область | Было (Next.js) | Станет (Nuxt) |
|---|---|---|
| UI-фреймворк | React 19 | Vue 3 |
| Роутинг | App Router `app/` | `pages/` или hybrid `app/` (Nuxt 4) |
| Data fetching | RSC + `fetch` в server components | `useAsyncData` / `useFetch` + server routes |
| Метаданные | `generateMetadata()` | `useSeoMeta()` / `definePageMeta()` |
| API routes | `app/api/*/route.ts` | `server/api/*.ts` (Nitro) |
| Состояние редактора | React state + props | Pinia stores |
| Rich text | `@tiptap/react` | `@tiptap/vue-3` |
| Стили | Tailwind 4 | Tailwind 4 + `@nuxtjs/tailwindcss` |

### Когда Nuxt оправдан

- Команда хочет Vue как основной стек
- Нужен единый fullstack-фреймворк с Nitro (server routes без отдельного Express)
- Планируется долгосрочная поддержка без React-зависимостей

### Когда Nuxt — дорогой выбор

- Уже есть ~100+ React-компонентов и тяжёлый `account-editor`
- OG/SEO/BFF уже работают на Next.js
- Миграция Strapi + Next → NestJS одновременно с Nuxt = **двойной рефакторинг**

**Рекомендуемый порядок:** сначала NestJS вместо Strapi на текущем Next.js, потом Nuxt — **или** один большой проект с чётким разбиением на спринты (см. §17).

---

## 2. Целевой стек

```
┌──────────────────────────────────────────────────────────────┐
│  Nuxt 4                                                      │
│  • Vue 3 + TypeScript + Composition API                      │
│  • SSR / SSG / route rules                                   │
│  • Nitro server routes (BFF: og-image, proxy, revalidate)    │
│  • Pinia — состояние редактора и auth                        │
│  • @nuxt/image — оптимизация изображений                     │
│  • @tiptap/vue-3 — редактор                                  │
│  • Tailwind CSS 4                                            │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP (server-side + client)
┌────────────────────────────▼─────────────────────────────────┐
│  NestJS API (:4000)                                            │
│  content · editor · media · auth · community · analytics       │
└────────────────────────────┬───────────────────────────────────┘
                             │ Prisma
┌────────────────────────────▼───────────────────────────────────┐
│  PostgreSQL 17                                                 │
└────────────────────────────────────────────────────────────────┘

Вспомогательно:
  Redis 7         — сессии, rate limit, очереди агрегации
  Meilisearch     — поиск
  Nginx           — reverse proxy, TLS
  Docker Compose  — оркестрация
```

### Основные npm-пакеты (web)

| Пакет | Назначение |
|---|---|
| `nuxt` ^4 | фреймворк |
| `@pinia/nuxt` | state management |
| `@vueuse/nuxt` | утилиты (viewport, storage, debounce) |
| `@nuxtjs/tailwindcss` | стили |
| `@nuxt/image` | `<NuxtImg>`, lazy, formats |
| `@tiptap/vue-3` + extensions | HTML-редактор в блоках |
| `typograf` | типографика (как сейчас) |
| `zod` | валидация форм редактора |
| `ofetch` / `$fetch` | HTTP-клиент (встроен в Nuxt) |

### Серверные зависимости (Nitro routes)

| Пакет | Назначение |
|---|---|
| `sharp` | `/api/og-image` — WebP → JPEG 1200×630 |

---

## 3. Схема сервисов

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │    Nginx    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
    │  Nuxt :3000 │ │ NestJS :4000│ │ Meili :7700│
    │  (web)      │ │  (api)      │ │ (search)  │
    └──────┬──────┘ └──────┬──────┘ └───────────┘
           │               │
           │         ┌─────▼─────┐
           │         │ Postgres  │
           │         └─────┬─────┘
           │               │
           └───────────────┤
                     ┌─────▼─────┐
                     │   Redis   │
                     └───────────┘

/uploads/  → volume, отдаётся через nginx или NestJS static
```

### Разделение ответственности

| Задача | Кто выполняет |
|---|---|
| HTML страниц, layout, hydration | Nuxt SSR |
| Публичное чтение контента | Nuxt SSR → NestJS API |
| Сохранение материалов, upload | Nuxt client → NestJS `/api/editor/*` |
| Auth JWT / session cookie | NestJS; Nuxt читает через BFF или cookie |
| og:image конвертация | Nuxt Nitro `server/api/og-image.get.ts` |
| Инвалидация кэша страниц | NestJS → Nitro `server/api/revalidate.post.ts` |
| Подсчёт просмотров | Nuxt client → NestJS `/api/views/increment` |
| CSV export статистики | Nuxt `/account/analytics` → NestJS export |
| Поиск | Nuxt → Meilisearch (proxy через Nitro или напрямую) |

---

## 4. Структура репозитория

```
winetoday/
├── web/                          # НОВЫЙ Nuxt-проект (заменяет frontend/)
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── package.json
│   │
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Tailwind entry
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── og-image.jpg
│   │   └── manifest.json
│   │
│   ├── pages/                    # файловый роутинг
│   │   ├── index.vue             # главная
│   │   ├── articles/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── news/
│   │   ├── videos/
│   │   ├── gallery/
│   │   ├── categories/[slug].vue
│   │   ├── tags/[slug].vue
│   │   ├── search.vue
│   │   ├── [slug].vue            # статические страницы (o-proekte)
│   │   ├── account/
│   │   │   ├── index.vue         # кабинет / редактор
│   │   │   └── analytics.vue     # статистика просмотров
│   │   └── auth-error.vue
│   │
│   ├── layouts/
│   │   ├── default.vue           # header + footer + main
│   │   └── account.vue           # редактор без лишнего chrome
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SiteHeader.vue
│   │   │   ├── SiteFooter.vue
│   │   │   └── MobileBottomNav.vue
│   │   ├── content/
│   │   │   ├── RichContent.vue       # рендер content_blocks
│   │   │   ├── blocks/               # hero, quote, cta, embed...
│   │   │   └── ImageCollections.vue  # gallery + slider
│   │   ├── media/
│   │   │   └── WatermarkedImageFrame.vue
│   │   ├── community/
│   │   │   ├── CommunitySection.vue
│   │   │   └── ViewTracker.vue
│   │   ├── seo/
│   │   │   └── JsonLdScript.vue
│   │   ├── account-editor/           # полный порт редактора на Vue
│   │   │   ├── AccountEditor.vue
│   │   │   ├── EditorSidebar.vue
│   │   │   ├── blocks/
│   │   │   └── panels/
│   │   └── analytics/
│   │       ├── StatsDashboard.vue
│   │       └── StatsExportButton.vue
│   │
│   ├── composables/
│   │   ├── useApi.ts             # базовый $fetch к NestJS
│   │   ├── useSiteSettings.ts
│   │   ├── useSeoForContent.ts
│   │   ├── useViewerId.ts
│   │   ├── useAuth.ts
│   │   └── useWatermarkSettings.ts
│   │
│   ├── stores/
│   │   ├── auth.ts               # Pinia
│   │   ├── editor.ts             # черновик, блоки, dirty state
│   │   └── ui.ts                 # theme, mobile widgets
│   │
│   ├── middleware/
│   │   ├── auth.ts               # guard для /account
│   │   └── editor-role.ts
│   │
│   ├── plugins/
│   │   ├── typograf.client.ts
│   │   └── viewer-id.client.ts
│   │
│   ├── server/
│   │   ├── api/
│   │   │   ├── og-image.get.ts
│   │   │   ├── revalidate.post.ts
│   │   │   ├── health.get.ts
│   │   │   └── proxy/            # опциональный BFF-proxy
│   │   │       ├── auth/[...].ts
│   │   │       └── community/[...].ts
│   │   ├── routes/
│   │   │   ├── sitemap.xml.ts
│   │   │   └── robots.txt.ts
│   │   └── utils/
│   │       ├── seo.ts
│   │       └── og-image.ts
│   │
│   ├── types/
│   │   ├── content.ts            # ContentItem, ContentBlock
│   │   ├── api.ts
│   │   └── editor.ts
│   │
│   └── utils/
│       ├── format-date.ts
│       ├── slug.ts
│       └── csv.ts
│
├── api/                          # NestJS (как в NEW_ARCHITECTURE.md)
│   ├── prisma/
│   └── src/modules/...
│
├── nginx/
├── docker-compose.yml
├── docs/
│   ├── NEW_ARCHITECTURE.md
│   └── NUXT_ARCHITECTURE.md      # этот файл
│
├── frontend/                     # старый Next.js — удалить после cutover
└── backend/                      # Strapi — удалить после cutover
```

---

## 5. Маршрутизация и страницы

### Таблица маршрутов

| URL | Файл | Тип рендера | Данные |
|---|---|---|---|
| `/` | `pages/index.vue` | SSR | homepage, settings, sidebars |
| `/articles` | `pages/articles/index.vue` | SSR | список статей |
| `/articles/:slug` | `pages/articles/[slug].vue` | SSR | статья + community |
| `/news` | `pages/news/index.vue` | SSR | лента новостей |
| `/news/:slug` | `pages/news/[slug].vue` | SSR | новость |
| `/videos` | `pages/videos/index.vue` | SSR | список |
| `/videos/:slug` | `pages/videos/[slug].vue` | SSR | видео |
| `/gallery` | `pages/gallery/index.vue` | SSR | альбомы |
| `/gallery/:slug` | `pages/gallery/[slug].vue` | SSR | галерея |
| `/categories/:slug` | `pages/categories/[slug].vue` | SSR | рубрика |
| `/tags/:slug` | `pages/tags/[slug].vue` | SSR | тег |
| `/search` | `pages/search.vue` | SSR + client | Meilisearch |
| `/:slug` | `pages/[slug].vue` | SSR | статические страницы |
| `/account` | `pages/account/index.vue` | SPA island | редактор (client-heavy) |
| `/account/analytics` | `pages/account/analytics.vue` | SSR + auth | статистика |

### Route rules (`nuxt.config.ts`)

```ts
export default defineNuxtConfig({
  routeRules: {
    // Публичный контент — SSR с кэшем
    '/': { swr: 3600 },
    '/articles/**': { swr: 1800 },
    '/news/**': { swr: 600 },
    '/videos/**': { swr: 1800 },
    '/gallery/**': { swr: 1800 },

    // Редактор — только client, без SSR HTML
    '/account/**': { ssr: false },

    // API Nitro
    '/api/og-image': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
})
```

### Пример страницы материала

```vue
<!-- pages/articles/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: article } = await useAsyncData(
  `article-${route.params.slug}`,
  () => $fetch(`/api/articles/${route.params.slug}`)
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

useSeoForContent(article.value)  // composable: title, og, canonical

const jsonLd = computed(() => buildArticleJsonLd(article.value))
</script>

<template>
  <article>
    <JsonLdScript :data="jsonLd" />
    <ViewTracker
      content-type="article"
      :content-id="article.id"
      :slug="article.slug"
    />
    <RichContent :blocks="article.contentBlocks" />
    <CommunitySection :content="article" />
  </article>
</template>
```

---

## 6. Слои frontend: composables, stores, server

### 6.1. `composables/useApi.ts`

Единая точка доступа к NestJS:

```ts
export function useApi() {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiUrl,  // https://winemaking-today.ru/api
    credentials: 'include',
  })

  return {
    getArticle: (slug: string) => api(`/articles/${slug}`),
    getHomepage: () => api('/homepage'),
    // ...
  }
}
```

На SSR запросы идут server-to-server (`api:4000` в Docker network).  
На клиенте — через публичный URL.

### 6.2. `runtimeConfig` (`nuxt.config.ts`)

```ts
runtimeConfig: {
  apiUrl: process.env.API_URL || 'http://api:4000/api',
  revalidateSecret: process.env.REVALIDATE_SECRET,
  public: {
    siteUrl: process.env.SITE_URL,
    apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',  // или прямой NestJS
    meilisearchUrl: process.env.NUXT_PUBLIC_MEILISEARCH_URL,
  },
}
```

### 6.3. Pinia stores

| Store | Содержимое |
|---|---|
| `auth` | user, role, login/logout, providers |
| `editor` | documentId, type, blocks[], cover, seo, dirty, saving |
| `ui` | theme (dark/light), mobile nav state |

Редактор — **client-only** (`ssr: false` на `/account`), store живёт только в браузере.

### 6.4. Nitro server routes

Замена Next.js `app/api/*`:

| Next.js | Nuxt Nitro |
|---|---|
| `app/api/og-image/route.ts` | `server/api/og-image.get.ts` |
| `app/api/revalidate/route.ts` | `server/api/revalidate.post.ts` |
| `app/api/health/route.ts` | `server/api/health.get.ts` |
| `app/sitemap.ts` | `server/routes/sitemap.xml.ts` |
| `app/robots.txt/route.ts` | `server/routes/robots.txt.ts` |

Пример og-image:

```ts
// server/api/og-image.get.ts
import sharp from 'sharp'
import { resolveOgImageUpstreamUrl, getAllowedOgImageHosts } from '~/server/utils/og-image'

export default defineEventHandler(async (event) => {
  const src = getQuery(event).src as string
  if (!src) throw createError({ statusCode: 400, message: 'missing src' })

  const upstreamUrl = resolveOgImageUpstreamUrl(src)
  const hostname = new URL(upstreamUrl).hostname
  if (!getAllowedOgImageHosts().has(hostname)) {
    throw createError({ statusCode: 403, message: 'forbidden' })
  }

  const upstream = await fetch(upstreamUrl)
  if (!upstream.ok) throw createError({ statusCode: 502, message: 'upstream error' })

  const input = Buffer.from(await upstream.arrayBuffer())
  const output = await sharp(input)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toBuffer()

  setHeader(event, 'Content-Type', 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return output
})
```

---

## 7. SEO и метаданные

### Composable `useSeoForContent`

Замена `buildSeoMetadata()` из `strapi.ts`:

```ts
// composables/useSeoForContent.ts
export function useSeoForContent(item: ContentItem, options?: { type?: 'article' | 'website' }) {
  const config = useRuntimeConfig()
  const siteOrigin = config.public.siteUrl
  const canonical = `${siteOrigin}/${item.type}s/${item.slug}`  // или path resolver
  const ogImage = toOgImage(item.cover?.url ?? item.seo?.image, siteOrigin)

  useSeoMeta({
    title: item.seo?.metaTitle || item.title,
    description: item.seo?.metaDescription || item.excerpt,
    ogTitle: item.seo?.metaTitle || item.title,
    ogDescription: item.seo?.metaDescription || item.excerpt,
    ogUrl: canonical,
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/jpeg',
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
```

### JSON-LD

Компонент `JsonLdScript.vue` вставляет `<script type="application/ld+json">` через `useHead`.

Утилиты `utils/json-ld.ts` — порт из `frontend/src/lib/json-ld.ts` (логика та же, синтаксис TS).

### Sitemap и robots

- `server/routes/sitemap.xml.ts` — генерирует XML из NestJS API (`/api/sitemap-data`) или напрямую из Prisma через internal call
- `server/routes/robots.txt.ts` — из `site_seo` settings

### Кэш и revalidate

NestJS после publish вызывает:

```
POST https://web:3000/api/revalidate
{ "secret": "...", "paths": ["/", "/articles/foo"] }
```

Nitro route сбрасывает `swr`/`cached` через `cacheStorage` или custom cache keys в `useAsyncData`.

---

## 8. Редактор материалов (Vue)

Самый трудоёмкий модуль. Порт `frontend/src/components/account-editor/*` → `web/components/account-editor/*`.

### Архитектура редактора

```
pages/account/index.vue
  └── AccountEditor.vue
        ├── EditorTopbar.vue
        ├── EditorSidebar.vue
        ├── EditorBreadcrumb.vue
        ├── panels/ (Cover, Seo, Publication, CategoriesTags...)
        └── BlocksPanel.vue
              ├── HtmlEditorBlock.vue    → TipTap Vue
              ├── ImageHighlightBlock.vue
              ├── ImageGalleryBlock.vue
              ├── ImageSliderBlock.vue
              └── EmbedBlock.vue
```

### TipTap: React → Vue

| React | Vue |
|---|---|
| `@tiptap/react` `useEditor()` | `@tiptap/vue-3` `useEditor()` |
| `<EditorContent editor={editor} />` | `<EditorContent :editor="editor" />` |
| extensions | те же `@tiptap/extension-*` |

Контент хранится в том же JSON-формате — **блоки в БД не меняются**.

### Pinia store `editor`

```ts
interface EditorState {
  contentType: 'article' | 'news' | 'video' | 'gallery'
  documentId: string | null
  title: string
  slug: string
  blocks: ContentBlock[]
  cover: MediaRef | null
  coverShowWatermark: boolean
  seo: SeoFields
  status: 'draft' | 'in_review' | 'published' | 'rejected'
  isDirty: boolean
  isSaving: boolean
}
```

Actions: `loadDocument`, `saveDocument`, `uploadMedia`, `addBlock`, `updateBlock`, `removeBlock`.

### API вызовы редактора

Напрямую к NestJS (без Strapi):

```
GET  /api/editor/session
GET  /api/editor/content/:type
GET  /api/editor/content/:type/:id
PUT  /api/editor/content/:type/:id
POST /api/editor/upload
```

### Checkbox водяной метки в редакторе

В `ImageHighlightBlock.vue`, `CoverPanel.vue`, `ImageGalleryBlock.vue`:

```vue
<label>
  <input type="checkbox" v-model="block.showWatermark" />
  Добавить водяную метку
</label>
<WatermarkedImageFrame
  v-if="previewUrl"
  :src="previewUrl"
  :show-watermark="block.showWatermark"
  class="mt-2 aspect-[16/10] w-full"
/>
```

---

## 9. Водяные метки

Логика **идентична** `NEW_ARCHITECTURE.md` §8; ниже — Nuxt-реализация.

### Принцип

- **Не вшивать** в файл
- Overlay в отдельном контейнере `.watermark-layer`
- Позиция в **% от `.image-frame`**, не от исходного изображения
- Флаг `showWatermark` на **экземпляре блока**, не на `media_assets`

### Компонент `WatermarkedImageFrame.vue`

```vue
<script setup lang="ts">
const props = defineProps<{
  src: string
  alt?: string
  showWatermark?: boolean
  watermarkPosition?: WatermarkPosition | null
  class?: string
}>()

const { settings } = useWatermarkSettings()  // composable, SSR-friendly

const visible = computed(() =>
  settings.value?.enabled && props.showWatermark === true
)

const badgeStyle = computed(() => resolveWatermarkStyle(
  props.watermarkPosition ?? settings.value?.position,
  settings.value
))
</script>

<template>
  <div class="image-frame relative overflow-hidden" :class="props.class">
    <NuxtImg
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <div
      v-if="visible"
      class="watermark-layer pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="watermark-badge absolute" :style="badgeStyle">
        <img
          :src="settings.logoUrl"
          alt=""
          class="h-auto w-full opacity-[var(--wm-opacity)]"
        />
      </div>
    </div>
  </div>
</template>
```

### Где используется

| Компонент | Источник `showWatermark` |
|---|---|
| `RichContent.vue` → image-highlight | `block.showWatermark` |
| `ImageCollections.vue` → gallery/slider | `block.showWatermark` или per-image |
| `pages/articles/[slug].vue` cover | `article.coverShowWatermark` |
| Homepage infographic cards | `card.showWatermark` |

### Глобальные настройки

Composable `useWatermarkSettings()`:

```ts
export async function useWatermarkSettings() {
  const { data } = await useAsyncData('watermark-settings', () =>
    $fetch('/api/settings/watermark')
  )
  return { settings: data }
}
```

---

## 10. Аналитика просмотров

Схема БД и API — как в `NEW_ARCHITECTURE.md` §9. Ниже — Nuxt UI.

### `ViewTracker.vue`

```vue
<script setup lang="ts">
const props = defineProps<{
  contentType: 'article' | 'news' | 'video' | 'gallery'
  contentId: string
  slug?: string
  enabled?: boolean
}>()

onMounted(() => {
  if (!props.enabled) return
  const viewerId = useViewerId()
  if (!viewerId) return

  $fetch('/api/views/increment', {
    method: 'POST',
    headers: { 'X-Viewer-Id': viewerId },
    body: {
      contentType: props.contentType,
      contentId: props.contentId,
      slug: props.slug,
    },
  }).catch(() => {})
})
</script>

<template><!-- пустой --></template>
```

`useViewerId` — composable + plugin (localStorage cookie, как `viewer-id.ts`).

### Страница `/account/analytics`

```
pages/account/analytics.vue
  ├── StatsSummaryCards     — всего / статьи / новости / видео
  ├── StatsFilters          — период, тип, автор (для editor)
  ├── StatsTable            — материалы с views
  └── StatsExportButton     — GET /api/analytics/export?format=csv
```

Middleware `auth.ts` + `editor-role.ts` — доступ по роли.

### CSV export (клиент)

```ts
async function downloadCsv(params: AnalyticsExportParams) {
  const blob = await $fetch('/api/analytics/export', {
    query: { ...params, format: 'csv' },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stats-${params.scope}-${date}.csv`
  a.click()
}
```

---

## 11. Аутентификация

### Модель

- NestJS выдаёт **httpOnly cookie** `vino_auth` (JWT) или session id в Redis
- Nuxt middleware проверяет auth через `GET /api/auth/me`
- OAuth Google/VK: redirect flow через NestJS → callback → cookie → redirect `/account`

### Nuxt middleware

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  if (!auth.user) {
    await auth.fetchMe()
  }
  if (!auth.user) {
    return navigateTo('/auth-error')
  }
})
```

### Альтернатива: `nuxt-auth-utils`

Можно использовать модуль для session seal в cookie, если не хранить JWT в NestJS.  
Для единообразия с API рекомендуется **auth полностью в NestJS**, Nuxt — только consumer.

### Роли

| Роль | Доступ |
|---|---|
| `member` | комментарии, реакции |
| `author` | редактор своих материалов, своя статистика |
| `editor` | все материалы, полная статистика |
| `admin` | настройки сайта, watermark, export |

---

## 12. Backend API (NestJS)

Backend **совпадает** с `NEW_ARCHITECTURE.md` §5–§6. Nuxt не меняет API-контракт.

### Модули

```
api/src/modules/
  auth/
  content/
  editor/
  media/
  settings/        # + watermark
  community/
  analytics/
  search/
```

### Endpoint-ы (краткий список)

Публичные: `GET /articles`, `GET /articles/:slug`, `GET /homepage`, ...  
Редактор: `PUT /editor/content/article/:id`, `POST /editor/upload`  
Analytics: `POST /views/increment`, `GET /analytics/export`  
Settings: `GET /settings/watermark`

Nuxt **не дублирует** бизнес-логику — только UI и тонкий BFF (og-image, revalidate, опциональный proxy).

---

## 13. Схема базы данных

Полностью описана в `NEW_ARCHITECTURE.md` §5. Ключевые таблицы:

| Таблица | Назначение |
|---|---|
| `content_items` | статьи, новости, видео, галереи |
| `content_blocks` (JSONB) | блоки контента + `showWatermark` |
| `media_assets` | метаданные `/uploads/` |
| `users`, `member_profiles`, `authors` | auth и авторы |
| `site_settings` | watermark_*, logo, typography |
| `content_view_events` | журнал просмотров |
| `content_view_daily` | агрегаты для отчётов |

**Ни одна таблица не зависит от Nuxt vs Next** — фронт только потребляет API.

---

## 14. Миграция Next.js → Nuxt

### Маппинг компонентов (приоритет)

| Приоритет | Next.js | Nuxt | Сложность |
|---|---|---|---|
| P0 | `layout.tsx` | `layouts/default.vue` | средняя |
| P0 | `page.tsx` (главная) | `pages/index.vue` | высокая |
| P0 | `articles/[slug]/page.tsx` | `pages/articles/[slug].vue` | средняя |
| P0 | `lib/strapi.ts` | `composables/useApi.ts` + `types/` | высокая |
| P1 | `rich-content.tsx` | `RichContent.vue` | высокая |
| P1 | `site-header.tsx` | `SiteHeader.vue` | средняя |
| P1 | `community-section.tsx` | `CommunitySection.vue` | средняя |
| P2 | `account-editor/*` | `account-editor/*` | **очень высокая** |
| P2 | `image-collections.tsx` | `ImageCollections.vue` | средняя |
| P3 | `homepage-special-video-*` | `components/homepage/*` | высокая |

### Порядок портирования

1. **Скелет Nuxt** — layout, header, footer, tailwind, runtimeConfig
2. **Одна страница end-to-end** — `/articles/[slug]` + SEO + ViewTracker
3. **Все публичные маршруты** — lists, categories, tags, search
4. **Главная** — infographic, sidebar, special blocks
5. **Auth flow** — login, OAuth, `/account` guard
6. **Редактор** — по одному блоку TipTap / image
7. **Analytics** — dashboard + CSV
8. **Watermark** — компонент + editor checkbox

### Что можно переиспользовать без портирования

| Актив | Переиспользование |
|---|---|
| TypeScript types | скопировать + адаптировать `React` → `Vue` props |
| `json-ld.ts` | почти 1:1 |
| `og-image.ts` utils | 1:1 в `server/utils/` |
| `typograf.ts` | 1:1 |
| `viewer-id.ts` | 1:1 в composable |
| CSS / Tailwind классы | 1:1 в template |
| NestJS API | без изменений |

### Что нельзя автоматически мигрировать

- JSX → Vue SFC (ручной порт)
- React hooks → composables
- `use client` / RSC границы → `ssr: false` route rules
- `next/image` → `<NuxtImg>`
- `next/link` → `<NuxtLink>`

---

## 15. Миграция Strapi → NestJS

Идентична `NEW_ARCHITECTURE.md` §10. Nuxt и Next одинаково зависят от нового API.

**Рекомендуемая последовательность:**

```
Вариант A (меньше риска):
  Strapi → NestJS на Next.js → потом Next.js → Nuxt

Вариант B (один проект):
  NestJS + ETL параллельно с Nuxt skeleton → cutover одновременно
```

Для варианта B нужна большая команда и staging-среда.

---

## 16. Инфраструктура и nginx

### docker-compose (целевой)

```yaml
services:
  web:          # Nuxt (Nitro) :3000
  api:          # NestJS :4000
  postgres:
  redis:
  meilisearch:
  nginx:
```

### nginx

```nginx
# Nuxt — сайт и Nitro /api (og-image, revalidate, health)
location / {
  proxy_pass http://web_upstream;
}

# NestJS — основной REST API
location /api/ {
  # исключения: Nitro обрабатывает на web, nginx маршрутизирует точечно
  location = /api/og-image {
    proxy_pass http://web_upstream;
  }
  location = /api/revalidate {
    proxy_pass http://web_upstream;
  }
  location /api/ {
    proxy_pass http://api_upstream/api/;
  }
}

location ^~ /uploads/ {
  proxy_pass http://api_upstream/uploads/;
}
```

### Переменные окружения (`web`)

| Переменная | Пример |
|---|---|
| `NUXT_PUBLIC_SITE_URL` | `https://winemaking-today.ru` |
| `API_URL` | `http://api:4000/api` (SSR internal) |
| `NUXT_PUBLIC_API_URL` | `https://winemaking-today.ru/api` |
| `REVALIDATE_SECRET` | secret |
| `MEDIA_URL` | `https://winemaking-today.ru/uploads` |

---

## 17. План внедрения по спринтам

### Спринт 1–2: Backend foundation
- NestJS + Prisma schema
- ETL: media, users, content
- Public read API

### Спринт 3–4: Nuxt skeleton
- `web/` project init, layouts, tailwind
- `pages/articles/[slug].vue` + SEO
- Nitro: og-image, health, sitemap

### Спринт 5–6: Публичный сайт
- Все list/detail pages
- Главная, sidebar, homepage blocks
- Community, search

### Спринт 7–9: Редактор (Vue)
- Pinia editor store
- TipTap blocks
- Image blocks + watermark checkbox
- Upload, save, publish

### Спринт 10: Auth + Analytics
- OAuth, /account middleware
- ViewTracker, analytics dashboard, CSV

### Спринт 11: Cutover
- Production ETL
- nginx switch `frontend` → `web`
- Удалить Next.js + Strapi

### Оценка сроков

| Команда | Strapi→NestJS + Next→Nuxt |
|---|---|
| 1 fullstack | 8–12 месяцев |
| 2 dev (BE + FE) | 5–8 месяцев |
| 3 dev | 4–6 месяцев |

---

## 18. Маппинг Next.js → Nuxt

| Next.js | Nuxt 4 |
|---|---|
| `app/layout.tsx` | `app.vue` + `layouts/default.vue` |
| `app/page.tsx` | `pages/index.vue` |
| `app/[slug]/page.tsx` | `pages/[slug].vue` |
| `generateMetadata()` | `useSeoMeta()` + `useHead()` |
| `export const dynamic` | `routeRules` |
| `export const revalidate` | `routeRules: { swr: N }` |
| Server Components | SSR `useAsyncData` на setup |
| `use client` | `ssr: false` или `<ClientOnly>` |
| `next/image` | `<NuxtImg>` |
| `next/link` | `<NuxtLink>` |
| `next/script` JSON-LD | `useHead({ script: [...] })` |
| `app/api/*/route.ts` | `server/api/*` |
| React Context | Pinia / `provide/inject` |
| `cookies()` server | `useCookie()` / `getCookie(event)` |

---

## 19. Риски и решения

| Риск | Вероятность | Решение |
|---|---|---|
| Двойная миграция (Strapi + Next) | высокая | Вариант A: сначала API, потом Nuxt |
| Редактор — 3+ месяца портирования | высокая | Поэтапный порт блоков; feature parity checklist |
| TipTap различия React/Vue | средняя | Одинаковый JSON; тесты на save/load |
| SEO регрессия | средняя | Сравнение og-тегов staging vs prod |
| SSR hydration mismatch | средняя | `ClientOnly` для editor; единый data source |
| Производительность главной | средняя | `swr`, lazy components, `@nuxt/image` |
| Потеря данных при ETL | низкая | Dump + сверка counts + rollback plan |

---

## Чеклист готовности Nuxt cutover

- [ ] Все URL из sitemap отдают 200
- [ ] `useSeoMeta` на каждой странице: title, og:image, canonical
- [ ] `/api/og-image` отдаёт JPEG для Telegram
- [ ] Редактор: create → edit blocks → upload → publish → preview
- [ ] Watermark: checkbox → preview → publish → visible on site
- [ ] ViewTracker increment + analytics CSV
- [ ] OAuth Google/VK
- [ ] Поиск Meilisearch
- [ ] Dark/light theme
- [ ] Mobile nav + bottom bar
- [ ] Lighthouse SEO ≥ 90 на статье

---

## Связь документов

| Документ | Содержание |
|---|---|
| `docs/NEW_ARCHITECTURE.md` | Next.js + NestJS — общая БД, API, миграция Strapi |
| `docs/NUXT_ARCHITECTURE.md` | этот файл — Nuxt-слой, порт с Next, Nitro, Vue editor |

---

*Документ создан: июнь 2026. Обновлять по мере принятия решения о переходе на Nuxt.*
