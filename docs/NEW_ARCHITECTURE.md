# Новая архитектура проекта «Виноделие сегодня»

Документ описывает целевую структуру после ухода со Strapi, миграцию данных без потери контента и реализацию двух новых подсистем: **водяных меток** и **аналитики просмотров**.

> **Статус:** проектный план. Код по этому документу ещё не внедрён.  
> **Ограничение:** сохранить все данные (контент, пользователи, медиа, просмотры, связи). Схема PostgreSQL будет новой; данные переносятся через ETL из Strapi.

---

## Содержание

1. [Цели и принципы](#1-цели-и-принципы)
2. [Текущее состояние](#2-текущее-состояние)
3. [Целевой стек](#3-целевой-стек)
4. [Структура репозитория](#4-структура-репозитория)
5. [Схема базы данных](#5-схема-базы-данных)
6. [API и модули backend](#6-api-и-модули-backend)
7. [Frontend](#7-frontend)
8. [Водяные метки](#8-водяные-метки)
9. [Аналитика просмотров](#9-аналитика-просмотров)
10. [Миграция из Strapi](#10-миграция-из-strapi)
11. [Инфраструктура и nginx](#11-инфраструктура-и-nginx)
12. [План внедрения по этапам](#12-план-внедрения-по-этапам)
13. [Что переиспользуем из текущего кода](#13-что-переиспользуем-из-текущего-кода)

---

## 1. Цели и принципы

### Цели

- Полностью убрать Strapi как CMS/backend.
- Сохранить весь контент и связи (статьи, новости, видео, галереи, настройки, пользователи, медиа, просмотры).
- Оставить публичный сайт на Next.js.
- Использовать уже существующий редактор в `/account` как основной UI для авторов и редакторов.
- Добавить водяные метки на уровне **блока показа**, а не файла.
- Расширить аналитику просмотров: по авторам, типам материалов, сайту в целом, с выгрузкой CSV.

### Принципы

| Принцип | Пояснение |
|---|---|
| Данные не теряем | ETL из Strapi-таблиц в новую схему + сверка counts |
| Один источник правды для контента | PostgreSQL + Prisma |
| Минимум изменений на фронте на старте | API parity-слой повторяет текущие endpoint-контракты |
| Блоки контента в JSONB | Dynamic zones Strapi → `content_blocks JSONB` |
| Медиа-файлы не перекодируем | Volume `/uploads/` остаётся; меняются только metadata-таблицы |
| Водяной знак — overlay | Не вшиваем в файл; позиция относительно контейнера блока |

---

## 2. Текущее состояние

```
Браузер
   ↓
Nginx
   ├── /           → Next.js 16 (frontend)
   ├── /api/*      → часть в Next.js BFF, часть в Strapi
   ├── /uploads/   → Strapi (backend)
   └── /admin/     → Strapi Admin

Next.js ──fetch──→ Strapi REST API
Strapi ──PostgreSQL──→ cms-специфичная схема
```

### Что уже есть и важно сохранить

| Подсистема | Где сейчас |
|---|---|
| Публичный сайт | `frontend/src/app/*` |
| Редактор материалов | `frontend/src/components/account-editor/*` |
| SEO / og:image | `frontend/src/lib/strapi.ts`, `og-image` API |
| Просмотры | `views` collection + поле `views` на материалах |
| Статистика автора | `author-stats-panel` + `/api/editor/author-stats` |
| Комментарии / реакции | Strapi + Next.js BFF |
| Поиск | Meilisearch |
| Медиа | `/uploads/` на backend volume |

### Почему нельзя «просто убрать Strapi»

Strapi хранит данные в своей внутренней схеме (`articles`, `articles_cmps`, `components_*`, `up_users`, `files_related_*` и т.д.). Без Strapi эти таблицы напрямую использовать неудобно. Нужна **новая нормализованная схема** + **скрипты миграции**.

---

## 3. Целевой стек

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router, React 19, TypeScript)          │
│  • публичные страницы                                   │
│  • /account — редактор и кабинет                        │
│  • BFF routes (auth, revalidate, og-image)              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / internal network
┌──────────────────────────▼──────────────────────────────┐
│  API (NestJS + TypeScript)                              │
│  • content, editor, media, auth, community              │
│  • analytics, watermark settings, search sync           │
└──────────────────────────┬──────────────────────────────┘
                           │ Prisma
┌──────────────────────────▼──────────────────────────────┐
│  PostgreSQL 17                                          │
└─────────────────────────────────────────────────────────┘

Вспомогательные сервисы (без изменений):
  Redis 7        — сессии, rate limit, очереди
  Meilisearch    — полнотекстовый поиск
  Nginx          — reverse proxy
  Docker Compose — оркестрация
```

### Почему NestJS, а не «всё в Next.js»

В проекте много доменной логики: editor save, роли, OAuth, community, views aggregation, category tree validation, revalidation hooks. Отдельный API-сервис даёт:

- чёткие модули и тестируемость;
- фоновые задачи (cron, export, reindex);
- независимый деплой и масштабирование;
- Next.js остаётся UI-слоем, а не «бог-объектом».

---

## 4. Структура репозитория

```
winetoday/
├── frontend/                 # Next.js — без Strapi-зависимости
│   ├── src/
│   │   ├── app/              # страницы, BFF routes
│   │   ├── components/
│   │   │   ├── account-editor/
│   │   │   ├── media/        # WatermarkedImageFrame
│   │   │   └── analytics/    # дашборд просмотров
│   │   └── lib/
│   │       ├── api-client.ts # typed client к новому API
│   │       ├── auth.ts
│   │       └── og-image.ts
│   └── ...
│
├── api/                      # НОВЫЙ сервис (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── content/
│   │   │   ├── editor/
│   │   │   ├── media/
│   │   │   ├── settings/
│   │   │   ├── community/
│   │   │   ├── analytics/
│   │   │   ├── watermark/
│   │   │   └── search/
│   │   ├── jobs/             # cron: daily views, meili sync
│   │   └── migration/        # ETL из Strapi (одноразовые скрипты)
│   └── package.json
│
├── nginx/
│   └── default.conf
├── docker-compose.yml
├── docs/
│   └── NEW_ARCHITECTURE.md   # этот файл
└── backend/                  # Strapi — удаляется после cutover
```

### Переменные окружения (ключевые)

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | PostgreSQL для Prisma |
| `API_URL` / `CMS_URL` | адрес NestJS API (заменяет Strapi) |
| `SITE_URL` | публичный URL сайта |
| `MEDIA_URL` | базовый URL медиа (`/uploads/`) |
| `REDIS_URL` | кэш и очереди |
| `MEILISEARCH_URL` | поиск |
| `REVALIDATE_SECRET` | инвалидация Next.js cache |

---

## 5. Схема базы данных

Ниже — логическая модель. В Prisma она оформляется как `schema.prisma`.

### 5.1. Пользователи и роли

```sql
users (
  id              UUID PK,
  email           TEXT UNIQUE,
  password_hash   TEXT NULL,
  role            ENUM(admin, editor, author, member),
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)

oauth_accounts (
  id, user_id, provider, provider_account_id, ...
)

member_profiles (
  id, user_id, display_name, account_type, author_id NULL, ...
)

authors (
  id, name, slug, member_profile_id NULL, ...
)
```

Миграция: `up_users` + `member_profiles` + `authors` из Strapi.

### 5.2. Контент

Единая модель для статей, новостей, видео, галерей:

```sql
content_items (
  id              UUID PK,
  type            ENUM(article, news, video, gallery),
  title           TEXT,
  slug            TEXT,
  excerpt         TEXT,
  status          ENUM(draft, in_review, published, rejected),
  published_at    TIMESTAMPTZ NULL,
  published_at_custom TIMESTAMPTZ NULL,

  -- обложки
  cover_media_id       UUID NULL,
  archive_cover_media_id UUID NULL,
  cover_source         TEXT NULL,
  cover_show_watermark BOOLEAN DEFAULT FALSE,

  -- флаги
  featured, pinned, homepage_lead, homepage_special_block,
  material_label, reading_time, preview,

  -- контент
  content_blocks  JSONB NOT NULL DEFAULT '[]',
  sources         JSONB,
  tasting_note    JSONB,
  seo             JSONB,

  -- счётчики (денормализация)
  views_total     INT DEFAULT 0,

  author_id       UUID NULL,
  created_at, updated_at, submitted_at, reviewed_at, review_comment
)

content_categories (content_id, category_id)
content_tags       (content_id, tag_id)

categories (id, name, slug, parent_id NULL, ...)
tags       (id, name, slug, ...)
```

### 5.3. Формат `content_blocks` (JSONB)

Каждый блок — объект с полем `type` (бывший `__component`):

```json
{
  "id": "block-uuid",
  "type": "image-highlight",
  "imageId": "media-uuid",
  "caption": "Подпись",
  "credit": "Фото: ...",
  "showWatermark": true,
  "watermarkPosition": null
}
```

Поддерживаемые типы (из текущего Strapi):

| type | Описание |
|---|---|
| `hero` | герой-блок |
| `rich-text` | текст |
| `html-editor` | TipTap JSON |
| `embed` | встраиваемый HTML |
| `image-highlight` | акцентное фото |
| `image-gallery` | галерея |
| `image-slider` | слайдер |
| `quote` | цитата |
| `cta` | call-to-action |
| `link-grid` | сетка ссылок |
| `archive-feed` | лента архива |

### 5.4. Настройки сайта (single types)

```sql
site_settings       -- siteName, logo, typography, socialLinks, watermark_*
homepage            -- title, infographic cards, blocks JSONB
site_header         -- menu, logos
site_footer         -- columns JSONB
site_seo            -- defaultSeo, robots, sitemap
sidebars            -- path rules, links, sections
community_settings  -- moderation, stop words, share networks
social_auth_settings
archive_settings
static_pages        -- o-proekte, kontakty-redaktsii (type=page)
```

### 5.5. Медиа

```sql
media_assets (
  id          UUID PK,
  path        TEXT NOT NULL,     -- /uploads/foo.webp
  mime        TEXT,
  width       INT,
  height      INT,
  alt_text    TEXT,
  size_bytes  BIGINT,
  created_at  TIMESTAMPTZ
)
```

Физические файлы остаются в volume `backend_uploads` → переименовать в `media_uploads` при cutover.

### 5.6. Community

```sql
comments (id, content_item_id, user_id NULL, body, status, ...)
reactions (id, content_item_id, user_id, type, ...)
```

### 5.7. Водяные метки (глобальные настройки)

Поля в `site_settings`:

```sql
watermark_enabled           BOOLEAN DEFAULT TRUE
watermark_media_id          UUID NULL       -- PNG/SVG логотип
watermark_opacity           FLOAT DEFAULT 0.85
watermark_size_percent      FLOAT DEFAULT 18  -- % от ширины блока
watermark_position          TEXT DEFAULT 'bottom-right'
watermark_offset_x_percent  FLOAT DEFAULT 4
watermark_offset_y_percent  FLOAT DEFAULT 4
watermark_min_size_px       INT DEFAULT 48
watermark_max_size_px       INT DEFAULT 220
```

Флаг `showWatermark` хранится **в JSONB блока** или в поле материала (`cover_show_watermark`), не в `media_assets`.

### 5.8. Аналитика просмотров

```sql
-- журнал (source of truth)
content_view_events (
  id              UUID PK,
  content_type    ENUM(article, news, video, gallery),
  content_id      UUID,
  slug            TEXT,
  author_id       UUID NULL,
  viewer_id       TEXT NOT NULL,
  viewed_at       TIMESTAMPTZ,
  ip_hash         TEXT NULL,
  user_agent      TEXT NULL,
  referrer        TEXT NULL,

  UNIQUE(content_type, content_id, viewer_id)
)

-- быстрый счётчик на карточках
content_view_totals (
  content_type, content_id  PK,
  views_total       INT,
  unique_viewers    INT,
  last_viewed_at    TIMESTAMPTZ
)

-- дневные агрегаты для отчётов
content_view_daily (
  date, content_type, content_id, author_id,
  views INT, unique_viewers INT,
  UNIQUE(date, content_type, content_id)
)

author_view_daily (
  date, author_id,
  article_views, news_views, video_views, gallery_views, total_views,
  UNIQUE(date, author_id)
)
```

---

## 6. API и модули backend

### 6.1. Модули NestJS

| Модуль | Ответственность |
|---|---|
| `auth` | login, register, OAuth Google/VK, JWT/session, роли |
| `content` | публичное чтение статей/новостей/видео/галерей |
| `editor` | save, upload, list, session — parity с текущим `/api/editor/*` |
| `media` | upload, list, resolve URL |
| `settings` | header, footer, homepage, seo, sidebars |
| `community` | comments, reactions |
| `analytics` | increment, summary, author stats, export CSV |
| `watermark` | глобальные настройки watermark |
| `search` | sync в Meilisearch, query proxy |

### 6.2. Ключевые endpoint-ы

#### Публичное чтение (замена Strapi REST)

```
GET  /api/articles
GET  /api/articles/:slug
GET  /api/news
GET  /api/news/:slug
GET  /api/videos/:slug
GET  /api/galleries/:slug
GET  /api/homepage
GET  /api/site-header
GET  /api/site-footer
GET  /api/site-seo
GET  /api/categories/:slug
GET  /api/tags/:slug
```

#### Редактор (parity с текущим BFF)

```
GET  /api/editor/session
GET  /api/editor/content/:type
GET  /api/editor/content/:type/:id
POST /api/editor/content/:type
PUT  /api/editor/content/:type/:id
DELETE /api/editor/content/:type/:id
POST /api/editor/upload
GET  /api/editor/authors
GET  /api/editor/categories
GET  /api/editor/tags
GET  /api/editor/media
```

#### Просмотры и аналитика

```
POST /api/views/increment
GET  /api/views/summary?contentType=&contentId=
GET  /api/analytics/author/:id
GET  /api/analytics/overview?from=&to=
GET  /api/analytics/export?scope=&format=csv
```

#### Настройки watermark

```
GET  /api/settings/watermark          -- публично (для фронта)
PUT  /api/settings/watermark          -- admin only
```

### 6.3. Бизнес-логика, которую нужно перенести из Strapi

Из `backend/src/index.ts` и controllers:

| Логика | Куда |
|---|---|
| auto-slug при create/update | `content` service `beforeSave` |
| валидация иерархии категорий | `categories` service |
| revalidate Next.js при публикации | `content` service → HTTP POST `/api/revalidate` |
| sync author ↔ member profile | `authors` job / `onProfileUpdate` |
| OAuth providers config | `auth` module + `social_auth_settings` |
| editor permissions по ролям | `editor` guard |
| preview mode (`?preview=1`) | `content` controller |

---

## 7. Frontend

### 7.1. Что меняется

| Было | Станет |
|---|---|
| `lib/strapi.ts` (2500+ строк) | `lib/api-client/*` — модули по доменам |
| `CMS_URL` → Strapi | `API_URL` → NestJS |
| `buildSeoMetadata()` | остаётся, источник данных — новый API |
| Strapi Admin | убирается; `/account` + admin-раздел |
| `ViewTracker` | без изменений контракта, новый backend URL |

### 7.2. Новые компоненты

```
frontend/src/components/media/
  watermarked-image-frame.tsx   -- единый фрейм с overlay

frontend/src/components/analytics/
  stats-dashboard.tsx           -- таблица + фильтры
  stats-export-button.tsx       -- CSV download
  stats-summary-cards.tsx
```

### 7.3. Изменения в редакторе

В панелях image-блоков (`ImageHighlightBlock`, `ImageGalleryBlock`, `ImageSliderBlock`, `CoverPanel`):

- checkbox **«Добавить водяную метку»** → поле `showWatermark` в JSON блока;
- preview через `WatermarkedImageFrame`;
- при save — `showWatermark` уходит в `content_blocks` JSONB.

---

## 8. Водяные метки

### 8.1. Требование

> Одно фото может стоять в разных блоках. Водяной знак должен позиционироваться **относительно блока**, в котором фото показано. Включается checkbox-ом в админке/редакторе.

### 8.2. Решение: CSS overlay, не правка файла

```
┌─ .image-frame (position: relative) ─────────────┐
│  <img class="object-cover w-full h-full" />     │
│  ┌─ .watermark-layer (absolute inset-0) ──────┐ │
│  │  ┌─ .watermark-badge (absolute) ─────────┐ │ │
│  │  │  <img src={logo} style={{ opacity }} />│ │ │
│  │  └────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Отдельный контейнер** — `.watermark-layer` поверх изображения, `pointer-events: none`, `aria-hidden="true"`.

### 8.3. Позиционирование

Позиция задаётся в процентах от **размеров `.image-frame`**, не от исходного файла:

| position | CSS |
|---|---|
| `bottom-right` | `right: offsetX%; bottom: offsetY%` |
| `bottom-left` | `left: offsetX%; bottom: offsetY%` |
| `top-right` | `right: offsetX%; top: offsetY%` |
| `top-left` | `left: offsetX%; top: offsetY%` |
| `center` | `left: 50%; top: 50%; transform: translate(-50%,-50%)` |

Ширина badge: `width: clamp(minPx, sizePercent%, maxPx)` относительно ширины фрейма.

### 8.4. Уровни настроек

1. **Глобально** (`site_settings`) — логотип, opacity, размер, позиция по умолчанию.
2. **На блоке** (`showWatermark: true/false`) — checkbox в редакторе.
3. **Опционально на блоке** (`watermarkPosition`) — override позиции для конкретного блока.

### 8.5. Где применять

| Место | Поле |
|---|---|
| `image-highlight` | `showWatermark` |
| `image-gallery` | `showWatermark` на блок + опционально на каждом `images[]` |
| `image-slider` | то же |
| обложка материала | `cover_show_watermark` |
| homepage infographic card | `showWatermark` на карточке |

### 8.6. Компонент (контракт)

```tsx
type WatermarkedImageFrameProps = {
  src: string;
  alt: string;
  showWatermark?: boolean;
  watermarkPosition?: WatermarkPosition | null;
  globalSettings: WatermarkSettings;
  className?: string;
  aspectRatio?: string;
};
```

Условие показа: `globalSettings.enabled && showWatermark === true`.

### 8.7. Что НЕ делать

- Не вшивать watermark через sharp в `/uploads/` — сломает кейс «одно фото в разных блоках».
- Не хранить `showWatermark` в `media_assets` — только в экземпляре использования.

---

## 9. Аналитика просмотров

### 9.1. Текущая реализация (для ориентира)

- `ViewTracker` → `POST /api/views/increment`
- уникальность: `contentTypeUid + targetDocumentId + viewerId`
- денормализованный счётчик `views` на материале
- `author-stats-panel` в Strapi Admin с CSV

### 9.2. Целевая модель

Три слоя (см. [§5.8](#58-аналитика-просмотров)):

1. **events** — журнал, source of truth
2. **daily** — агрегаты по дням для графиков и отчётов
3. **totals** — быстрый счётчик для UI

### 9.3. Поток increment

```
1. ViewTracker на странице материала
2. POST /api/views/increment { contentType, contentId, viewerId, slug }
3. Если UNIQUE нарушен → вернуть текущий totals, counted: false
4. Иначе:
   - INSERT content_view_events
   - UPSERT content_view_totals (views_total++, unique_viewers++)
   - UPSERT content_view_daily (за сегодня)
   - UPSERT author_view_daily (если есть author_id)
5. Ответ: { views, counted: true }
```

### 9.4. Отчёты и CSV

#### UI: `/account` → вкладка «Статистика»

| Роль | Видит |
|---|---|
| author | только свои материалы |
| editor / admin | все материалы + сводка по сайту |

Фильтры: период, тип (статьи/новости/видео/галереи), автор.

Кнопка **«Скачать CSV»** → `GET /api/analytics/export?...&format=csv`.

#### Формат CSV (пример по автору)

```csv
Автор;Тип;Название;Слаг;Просмотры;Уникальные;Опубликовано;URL
Иванов И.;Статья;Название;slug;1240;980;2026-03-01;https://winemaking-today.ru/articles/slug
```

#### Формат CSV (сводка по сайту за период)

```csv
Дата;Статьи;Новости;Видео;Галереи;Всего
2026-06-01;420;180;95;30;725
```

### 9.5. Фоновые задачи

| Job | Расписание | Действие |
|---|---|---|
| `aggregate-views-daily` | каждую ночь 03:00 | пересчёт `*_daily` из events |
| `rebuild-view-totals` | по запросу admin | полная сверка totals |
| `sync-search-index` | при publish/update | Meilisearch |

---

## 10. Миграция из Strapi

### Фаза 0. Подготовка (1–2 недели)

- [ ] Полный dump PostgreSQL Strapi
- [ ] Экспорт schema Strapi (`backend/src/api`, `components`)
- [ ] Инвентаризация всех API-вызовов фронта (`grep CMS_URL`, `fetchStrapi`)
- [ ] Карта lifecycle-логики (`backend/src/index.ts`)
- [ ] Список nginx location-ов для `/api/`

### Фаза 1. Новая схема + ETL (2–4 недели)

- [ ] Создать `api/` с Prisma schema
- [ ] Написать ETL-скрипты в `api/src/migration/`:

| Скрипт | Источник Strapi | Назначение |
|---|---|---|
| `migrate-media.ts` | `files` | `media_assets` |
| `migrate-users.ts` | `up_users`, roles | `users`, `member_profiles` |
| `migrate-authors.ts` | `authors` | `authors` |
| `migrate-taxonomy.ts` | categories, tags | `categories`, `tags` |
| `migrate-content.ts` | articles, news, video, gallery | `content_items` + blocks JSONB |
| `migrate-settings.ts` | single types | `site_settings`, `homepage`, ... |
| `migrate-community.ts` | comments, reactions | `comments`, `reactions` |
| `migrate-views.ts` | `views` + поля `views` | events + totals |

- [ ] Конвертер dynamic zone → JSONB blocks (маппинг `__component` → `type`)
- [ ] Сверка: количество записей, spot-check 50–100 материалов

### Фаза 2. API parity (4–8 недель)

- [ ] Реализовать публичные GET endpoint-ы
- [ ] Реализовать editor API (save, upload, list)
- [ ] Перенести auth + OAuth
- [ ] Перенести community
- [ ] Перенести analytics (increment + export)
- [ ] Подключить Meilisearch sync
- [ ] Feature flag: `USE_NEW_API=true` на staging

### Фаза 3. Frontend switch (1–2 недели)

- [ ] Заменить `lib/strapi.ts` на `lib/api-client`
- [ ] Обновить BFF routes (`CMS_URL` → `API_URL`)
- [ ] Добавить `WatermarkedImageFrame` во все image-рендереры
- [ ] Добавить checkbox watermark в editor
- [ ] Добавить analytics dashboard в `/account`
- [ ] Smoke tests: публикация, preview, OG, поиск, login

### Фаза 4. Cutover (1 неделя)

- [ ] Staging: полный прогон ETL + тесты
- [ ] Production: maintenance window или blue-green
- [ ] Переключить nginx: `/api/` → NestJS (не Strapi)
- [ ] `/uploads/` → NestJS/media service или nginx static
- [ ] Мониторинг 48 часов
- [ ] Strapi container → read-only → удалить

### Фаза 5. Cleanup

- [ ] Удалить `backend/` (Strapi)
- [ ] Удалить Strapi-специфичные nginx rules (`/admin/`, content-manager)
- [ ] Обновить `PLAN.md` и README
- [ ] Архивировать ETL-скрипты

---

## 11. Инфраструктура и nginx

### docker-compose (целевой)

```yaml
services:
  frontend:    # Next.js :3000
  api:         # NestJS :4000  (НОВЫЙ)
  postgres:    # PostgreSQL 17
  redis:
  meilisearch:
  nginx:
```

### nginx: маршрутизация `/api/`

**Было:** большая часть `/api/` → Strapi.

**Станет:** `/api/` → NestJS, кроме BFF-роутов Next.js:

```nginx
# Next.js BFF (как сейчас)
location = /api/revalidate { proxy_pass http://frontend_upstream; }
location = /api/og-image    { proxy_pass http://frontend_upstream; }
location ^~ /api/auth/      { proxy_pass http://frontend_upstream; }
location ^~ /api/editor/    { ... }  # либо BFF, либо напрямую api — решить на этапе 2

# Новый API (основной)
location /api/ {
  proxy_pass http://api_upstream/api/;
}

location ^~ /uploads/ {
  proxy_pass http://api_upstream/uploads/;
  # или alias на volume
}
```

> На этапе перехода можно держать Strapi и NestJS параллельно с feature flag в nginx или env.

---

## 12. План внедрения по этапам

### Спринт 1–2: Фундамент

- Prisma schema
- NestJS scaffold + health check
- `media_assets` + upload
- ETL: media, users, authors

### Спринт 3–4: Контент

- ETL: content_items + blocks JSONB
- Public read API
- Подключить frontend на staging

### Спринт 5–6: Редактор

- Editor API parity
- Auth + roles
- Watermark: settings + `WatermarkedImageFrame` + editor checkbox

### Спринт 7: Community + Search

- Comments, reactions
- Meilisearch sync

### Спринт 8: Analytics

- Views increment (миграция данных)
- Daily aggregation jobs
- Analytics dashboard + CSV export в `/account`

### Спринт 9: Cutover

- Production ETL
- nginx switch
- Strapi decommission

### Оценка сроков

| Команда | Срок |
|---|---|
| 1 fullstack | 5–7 месяцев |
| 2 разработчика (backend + frontend) | 3–5 месяцев |

---

## 13. Что переиспользуем из текущего кода

| Компонент | Действие |
|---|---|
| `frontend/src/app/*` страницы | оставить, сменить data layer |
| `account-editor/*` | оставить, добавить watermark checkbox |
| `rich-content.tsx`, `image-collections.tsx` | обернуть фото в `WatermarkedImageFrame` |
| `view-tracker.tsx` | оставить контракт |
| `og-image` API route | оставить в Next.js |
| `buildSeoMetadata()` | оставить логику |
| `nginx/default.conf` | адаптировать маршруты |
| `docker-compose.yml` | добавить `api`, убрать `backend` |
| Strapi `editor.ts` controller | переписать как NestJS `editor` module |
| Strapi `view.ts` controller | переписать как `analytics` module |
| `author-stats-panel.tsx` | перенести UI в `/account/analytics` |

---

## Чеклист готовности к cutover

- [ ] ETL прошёл без расхождений в counts
- [ ] Все публичные страницы открываются
- [ ] Редактор: create → save → publish → preview
- [ ] Auth: email + Google + VK
- [ ] Комментарии и реакции работают
- [ ] Поиск возвращает результаты
- [ ] View increment и stats корректны
- [ ] CSV export скачивается
- [ ] Watermark показывается в нужных блоках
- [ ] og:image / Telegram preview работают
- [ ] sitemap.xml и robots.txt актуальны
- [ ] Бэкап Strapi DB сохранён

---

## Связанные файлы в текущем проекте

| Файл | Роль при миграции |
|---|---|
| `frontend/src/lib/strapi.ts` | заменяется api-client |
| `backend/src/api/editor/controllers/editor.ts` | эталон editor API |
| `backend/src/api/view/controllers/view.ts` | эталон analytics |
| `backend/src/index.ts` | список lifecycle-логики |
| `frontend/src/components/view-tracker.tsx` | сохраняем |
| `frontend/src/app/api/og-image/route.ts` | сохраняем |
| `nginx/default.conf` | обновляем маршруты |

---

*Документ создан: июнь 2026. Обновлять по мере внедрения этапов.*
