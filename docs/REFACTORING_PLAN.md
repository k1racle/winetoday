# План рефакторинга «Виноделие сегодня» → Nuxt 4 + NestJS + PostgreSQL

> Живой документ. По мере выполнения задачи отмечаются `[x]`.  
> Исходники: `docs/NUXT_ARCHITECTURE.md`, `docs/NEW_ARCHITECTURE.md`.

---

## Стратегия

1. **Backend first:** сначала NestJS + Prisma + новая PostgreSQL-схема. Текущий Next.js-фронтенд остаётся работать.
2. **API parity:** Next.js переключается на новый API через feature flag / env `API_URL`.
3. **Nuxt-переписывание параллельно:** в `web/` создаётся новый фронтенд на Nuxt 4.
4. **Cutover:** nginx переключает трафик с `frontend` на `web`, Strapi удаляется.

---

## Фаза 0. Подготовка

- [x] Создать `REFACTORING_PLAN.md` (этот файл).
- [ ] Инвентаризация всех вызовов Strapi во фронтенде:
  - `grep -R "CMS_URL\|fetchStrapi\|getSiteSeo\|getGlobalSettings" frontend/src`;
  - таблица endpoint → новый NestJS endpoint.
- [ ] Инвентаризация lifecycle-логики Strapi (`backend/src/index.ts`, controllers).
- [ ] Список nginx location-ов, которые уйдут к NestJS.
- [x] Расширить `.env.example` переменными для нового стека:
  - `DATABASE_URL`, `API_URL`, `NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_SITE_URL`, `MEDIA_URL`, `REDIS_URL`, `MEILISEARCH_URL`, `REVALIDATE_SECRET`.
- [x] Обновить `docker-compose.yml`:
  - добавить `api` (NestJS :4000);
  - добавить/обновить `postgres` (PostgreSQL 17);
  - оставить `frontend` (Next.js), `redis`, `meilisearch`, `nginx`;
  - `backend` (Strapi) пока остаётся, на cutover удаляется.
- [x] Создать `api/Dockerfile` и `web/Dockerfile`.

---

## Фаза 1. Backend (NestJS + Prisma)

### 1.1. Скелетон и схема БД

- [x] Создать `api/package.json` с NestJS, Prisma, TypeScript, Zod, JWT, bcrypt, cookie-parser, @nestjs/config.
- [x] `api/tsconfig.json`, `api/nest-cli.json`.
- [x] `api/src/main.ts`:
  - CORS;
  - `ValidationPipe`;
  - cookie-parser;
  - health check `GET /health`.
- [x] `api/prisma/schema.prisma` по `docs/NEW_ARCHITECTURE.md` §5 (валидирована, клиент сгенерирован).
  - `users`, `oauth_accounts`, `member_profiles`, `authors`;
  - `content_items` (JSONB `content_blocks`, `seo`, `sources`, `tasting_note`);
  - `categories`, `tags`, связи `content_categories`, `content_tags`;
  - `media_assets`;
  - `comments`, `reactions`;
  - `content_view_events`, `content_view_totals`, `content_view_daily`, `author_view_daily`;
  - single types: `site_settings`, `homepage`, `site_header`, `site_footer`, `site_seo`, `sidebars`, `community_settings`, `social_auth_settings`, `archive_settings`, `static_pages`.
- [ ] Первая миграция Prisma: `npx prisma migrate dev --name init` (требуется запущенный PostgreSQL).
- [ ] Seed-скрипт минимальных данных (admin user, базовые настройки).

### 1.2. Модули NestJS

- [x] `prisma` module/service — единая точка доступа к БД.
- [x] `auth` module:
  - register/login/password;
  - JWT access + refresh в httpOnly cookie;
  - роли (`admin`, `editor`, `author`, `member`);
  - guard `@Roles()`.
- [ ] `auth` module — OAuth Google/VK.
- [ ] `users` module — CRUD пользователей и профилей.
- [ ] `authors` module — авторы, связь с member_profile.
- [ ] `taxonomy` module — категории и теги (иерархия категорий).
- [x] `media` module:
  - upload → `/uploads/`;
  - `media_assets` CRUD.
- [ ] `media` module — resolve URL / public serve.
- [x] `content` module — публичное чтение:
  - `GET /api/articles`, `GET /api/articles/:slug`;
  - `GET /api/news`, `GET /api/news/:slug`;
  - `GET /api/videos/:slug`, `GET /api/galleries/:slug`;
  - `GET /api/homepage`;
  - preview mode `?preview=1` для черновиков.
- [ ] `content` module — `GET /api/categories/:slug`, `GET /api/tags/:slug`.
- [ ] `content` module — публикация → POST `/api/revalidate` в Next.js/Nuxt.
- [ ] `editor` module — parity с текущим `/api/editor/*` (save, upload, list, session).
  - session, content list/detail, create/update/delete;
  - upload;
  - authors/categories/tags/media endpoints;
  - guards по ролям.
- [ ] `community` module:
  - comments CRUD + moderation;
  - reactions (like/dislike).
- [x] `analytics` module:
  - `POST /api/views/increment`;
  - `GET /api/views/summary`;
  - агрегация daily/totals.
- [ ] `analytics` module:
  - `GET /api/analytics/overview`;
  - `GET /api/analytics/export?format=csv`.
- [x] `watermark` module — `GET /api/settings/watermark`.
- [ ] `watermark` module — `PUT /api/settings/watermark` (admin).
- [ ] `search` module:
  - sync в Meilisearch при publish/update;
  - proxy/query endpoint.
- [ ] `jobs` — фоновые задачи:
  - `aggregate-views-daily` (cron 03:00);
  - `rebuild-view-totals` (по запросу);
  - `sync-search-index`.

### 1.3. ETL (одноразовые скрипты)

- [ ] `api/src/migration/migrate-media.ts` — `files` → `media_assets`.
- [ ] `api/src/migration/migrate-users.ts` — `up_users` → `users` + `member_profiles`.
- [ ] `api/src/migration/migrate-authors.ts` — `authors` → `authors`.
- [ ] `api/src/migration/migrate-taxonomy.ts` — categories/tags.
- [ ] `api/src/migration/migrate-content.ts` — articles/news/videos/galleries → `content_items` + JSONB blocks.
- [ ] `api/src/migration/migrate-settings.ts` — single types.
- [ ] `api/src/migration/migrate-community.ts` — comments/reactions.
- [ ] `api/src/migration/migrate-views.ts` — views → events + totals.
- [ ] Сверка counts после ETL.

### 1.4. Интеграция с текущим фронтендом (временная)

- [ ] `frontend/src/lib/api-client.ts` — новый typed клиент к NestJS.
- [ ] Feature flag `USE_NEW_API` в `frontend/.env`.
- [ ] Постепенная замена `fetchStrapi` → `apiClient` для публичных страниц.
- [ ] Обновить Next.js BFF routes (`/api/views/increment`, `/api/og-image`) для работы с новым API.

---

## Фаза 2. Новый фронтенд Nuxt (`web/`)

### 2.1. Скелетон

- [x] Ручной scaffold `web/`.
- [x] `web/package.json`: Nuxt 3 с `compatibilityVersion: 4`, Vue 3, TypeScript, Tailwind (v3 через `@nuxtjs/tailwindcss`), `@pinia/nuxt`, `@vueuse/nuxt`, `@nuxt/image`, `zod`, `typograf`.
- [x] `web/nuxt.config.ts`:
  - `runtimeConfig`;
  - `routeRules`;
  - Tailwind, Pinia, VueUse, `@nuxt/image`.
- [x] `web/assets/css/main.css` — Tailwind entry, дизайн-токены.
- [x] `web/app.vue` + `web/layouts/default.vue` + `SiteHeader`/`SiteFooter`.
- [ ] `web/layouts/account.vue` — редактор без хрома.

### 2.2. Базовые слои

- [x] `web/composables/useApi.ts` — `$fetch` к NestJS.
- [ ] `web/composables/useSiteSettings.ts`.
- [x] Используется `useSeoMeta` на страницах; отдельный composable `useSeoForContent` в плане.
- [ ] `web/composables/useAuth.ts`.
- [x] `web/composables/useViewerId.ts`.
- [ ] `web/composables/useWatermarkSettings.ts`.
- [ ] `web/stores/auth.ts`, `web/stores/editor.ts`, `web/stores/ui.ts`.
- [ ] `web/plugins/viewer-id.client.ts`, `web/plugins/typograf.client.ts`.
- [x] `web/types/content.ts`.

### 2.3. Публичные страницы

- [x] `web/pages/index.vue` — главная.
- [x] `web/pages/articles/index.vue` — список статей.
- [x] `web/pages/articles/[slug].vue` — детальная статьи.
- [ ] `web/pages/news/index.vue`, `web/pages/news/[slug].vue`.
- [ ] `web/pages/videos/index.vue`, `web/pages/videos/[slug].vue`.
- [ ] `web/pages/gallery/index.vue`, `web/pages/gallery/[slug].vue`.
- [ ] `web/pages/categories/[slug].vue`.
- [ ] `web/pages/tags/[slug].vue`.
- [ ] `web/pages/search.vue` — Meilisearch.
- [ ] `web/pages/[slug].vue` — статические страницы.

### 2.4. Компоненты

- [ ] `web/components/layout/SiteHeader.vue`.
- [ ] `web/components/layout/SiteFooter.vue`.
- [ ] `web/components/layout/MobileBottomNav.vue`.
- [ ] `web/components/content/RichContent.vue`.
- [ ] `web/components/content/blocks/*.vue` — hero, quote, cta, embed, image-highlight, image-gallery, image-slider, archive-feed.
- [ ] `web/components/content/ImageCollections.vue`.
- [ ] `web/components/media/WatermarkedImageFrame.vue`.
- [ ] `web/components/community/CommunitySection.vue`.
- [ ] `web/components/community/ViewTracker.vue`.

### 2.5. SEO / server routes

- [ ] `web/server/api/og-image.get.ts` — sharp, resize 1200×630, cache headers.
- [ ] `web/server/api/revalidate.post.ts` — сброс SWR-кэша.
- [ ] `web/server/routes/sitemap.xml.ts`.
- [ ] `web/server/routes/robots.txt.ts`.
- [ ] `web/server/utils/seo.ts`, `web/server/utils/og-image.ts`.
- [ ] `web/components/seo/JsonLdScript.vue`.
- [ ] Порт `web/utils/json-ld.ts` из `frontend/src/lib/json-ld.ts`.

### 2.6. Редактор (Vue)

- [ ] `web/components/account-editor/AccountEditor.vue`.
- [ ] `web/components/account-editor/EditorSidebar.vue`.
- [ ] `web/components/account-editor/EditorTopbar.vue`.
- [ ] `web/components/account-editor/panels/CoverPanel.vue`.
- [ ] `web/components/account-editor/panels/SeoPanel.vue`.
- [ ] `web/components/account-editor/panels/PublicationPanel.vue`.
- [ ] `web/components/account-editor/panels/CategoriesTagsPanel.vue`.
- [ ] `web/components/account-editor/blocks/HtmlEditorBlock.vue` (TipTap).
- [ ] `web/components/account-editor/blocks/ImageHighlightBlock.vue`.
- [ ] `web/components/account-editor/blocks/ImageGalleryBlock.vue`.
- [ ] `web/components/account-editor/blocks/ImageSliderBlock.vue`.
- [ ] `web/components/account-editor/blocks/EmbedBlock.vue`.
- [ ] Checkbox watermark в панелях изображений.
- [ ] `web/pages/account/index.vue`.

### 2.7. Auth

- [ ] `web/middleware/auth.ts` — guard `/account/**`.
- [ ] `web/middleware/editor-role.ts`.
- [ ] `web/pages/auth-error.vue`.
- [ ] OAuth callback flow.

### 2.8. Analytics

- [ ] `web/pages/account/analytics.vue`.
- [ ] `web/components/analytics/StatsDashboard.vue`.
- [ ] `web/components/analytics/StatsExportButton.vue`.
- [ ] `web/components/analytics/StatsSummaryCards.vue`.

---

## Фаза 3. Инфраструктура и cutover

- [x] Добавить `api` и `web` сервисы в `docker-compose.yml`.
- [ ] Обновить `nginx/default.conf`:
  - `/api/og-image`, `/api/revalidate`, `/api/auth/*` → Nuxt `web`;
  - остальной `/api/` → NestJS `api`;
  - `/uploads/` → NestJS `api`;
  - `/` → Nuxt `web` (на cutover).
- [ ] Blue-green или maintenance window для переключения `/` с Next.js на Nuxt.
- [ ] Production ETL и сверка counts.
- [ ] Мониторинг 48 часов.
- [ ] Удалить `backend/` (Strapi).
- [ ] Удалить `frontend/` (Next.js) или заархивировать.
- [ ] Обновить README, `.env.example`, документацию.

---

## Чеклист готовности к cutover

- [ ] ETL прошёл без расхождений.
- [ ] Все URL из sitemap отдают 200.
- [ ] `useSeoMeta` на каждой странице: title, og:image, canonical.
- [ ] `/api/og-image` отдаёт JPEG 1200×630.
- [ ] Редактор: create → edit blocks → upload → publish → preview.
- [ ] Watermark: checkbox → preview → publish → visible on site.
- [ ] ViewTracker increment + analytics CSV.
- [ ] OAuth Google/VK.
- [ ] Поиск Meilisearch.
- [ ] Dark/light theme.
- [ ] Mobile nav + bottom bar.
- [ ] Lighthouse SEO ≥ 90 на статье.

---

## История изменений

| Дата | Что сделано |
|---|---|
| 2026-06-17 | Создан план, скелетон NestJS + Prisma, публичные API (content/settings/analytics/auth/media), Nuxt-скелетон с главной и статьями, обновлён docker-compose. |
