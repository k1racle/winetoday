# Проект «Виноделы России» — план реализации

> **Статус:** проектный план. Код не внедрён.
> **Решение о размещении:** раздел живёт на основном домене `winemaking-today.ru` (не поддомен), чтобы весь контент и ссылки работали на SEO основного сайта. Дизайн раздела может отличаться — для поисковиков это не имеет значения, важен домен и перелинковка.

Раздел-каталог: биографии виноделов с историей и генеалогическим древом (где учился, что делал, где работал), терруары, регионы, вина. Точка входа — кнопка **«ВИНОДЕЛЫ РОССИИ»** в шапке рядом с иконками поиска/темы/аккаунта.

---

## Содержание

1. [Цели и принципы](#1-цели-и-принципы)
2. [Ключевые решения](#2-ключевые-решения)
3. [Модель данных](#3-модель-данных)
4. [API](#4-api)
5. [Публичные страницы и URL](#5-публичные-страницы-и-url)
6. [Дизайн и layout](#6-дизайн-и-layout)
7. [Админка и связь с материалами](#7-админка-и-связь-с-материалами)
8. [Интерактивная карта](#8-интерактивная-карта)
9. [Генеалогическое древо (граф)](#9-генеалогическое-древо-граф)
10. [Комментарии, просмотры, поиск](#10-комментарии-просмотры-поиск)
11. [SEO](#11-seo)
12. [Дорожная карта](#12-дорожная-карта)
13. [Чеклист запуска](#13-чеклист-запуска)
14. [Что осознанно НЕ делаем в первой версии](#14-что-осознанно-не-делаем-в-первой-версии)

---

## 1. Цели и принципы

- Полноценные биографии виноделов: текст, таймлайн карьеры, родственные связи (династии) с графическим древом.
- Справочник терруаров и регионов с иерархией (страна → регион → субрегион/аппеласьон) и интерактивной картой.
- Каталог вин, связанный с виноделами, хозяйствами, регионами и терруарами.
- Каждая сущность — индексируемая SEO-страница на основном домене.
- Двусторонняя связь с редакционным контентом: из статьи/новости — на профиль винодела и терруар, из профиля — на связанные материалы.

| Принцип | Пояснение |
|---|---|
| Тот же домен | Только раздел сайта, никаких поддоменов — иначе теряется SEO-эффект |
| Свои таблицы, не ContentItem | Каталожные связи (вино → регион, древо персон) через JSONB не делаем — нормальные FK |
| Тексты — в JSONB-блоках | Переиспользуем редактор материалов и рендерер `ContentBlocks` |
| Тот же стек | NestJS-модуль в `api/`, страницы в `web/`, админка в `/account/admin` |
| Соцмеханики общие | Комментарии/просмотры — через существующие модули `community` и `analytics` |

---

## 2. Ключевые решения

| Вопрос | Решение |
|---|---|
| Размещение | Раздел на основном домене |
| URL | `/winemakers`, `/winemakers/search`, `/wines`, `/regions`, `/terroirs`, `/wineries` (англ. пути, как остальной сайт) |
| Точка входа | Кнопка «Виноделы России» в шапке **рядом с иконками** поиска / темы / аккаунта (НЕ в полосе рубрик). На мобильном — в мобильном меню над списком рубрик |
| Дизайн | Отдельный layout `layouts/winemakers.vue` со своей шапкой/стилями; общие только логотип-ссылка на главную и футер |
| Лендинг | `/winemakers` — обложка проекта + **подробный архив всех данных**: персоны (А–Я), регионы (дерево), вина, хозяйства |
| Карта | Leaflet + OpenStreetMap (без API-ключа); маркеры регионов/терруаров, hover → всплывашка с терруаром и виноделами, клик → страница региона |
| Древо | Графическое SVG-дерево (см. §9), данные — типизированная self-relation `PersonRelation` |
| Комментарии/просмотры | Подключаем к страницам персон и вин через существующие модули |
| Поиск | Полнотекстовый по каталогу через отдельный endpoint и страницу результатов `/winemakers/search`; поиск сайта `/search` каталог в v1 не индексирует |

---

## 3. Модель данных

Новые модели в `api/prisma/schema.prisma`. Длинные тексты — JSONB-блоки формата `content_blocks` (как у `ContentItem`), чтобы переиспользовать редактор и рендерер.

Все публичные сущности (`Person`, `Wine`, `Region`, `Terroir`, `Winery`) должны иметь единый публикационный минимум:
- `status` (`draft|published`) — иначе правило из §4 «публичные GET отдают только published» будет работать не для всех моделей;
- `updatedAt` — для `lastmod`, sitemap и переобхода;
- `seo` — ручные `title/description/og`, если нужны переопределения;
- опционально `summary`/`featured`/`sortOrder` там, где это прямо требуется UI.

```prisma
enum PublishStatus {
  draft
  published
}

enum PersonRelationType {
  parent
  spouse
  sibling
  founder
}

model Person {                    // винодел
  id         String      @id @default(uuid()) @db.Uuid
  slug       String      @unique
  name       String
  birthYear  Int?
  deathYear  Int?
  photoId    String?     @db.Uuid
  photo      MediaAsset? @relation("PersonPhoto", fields: [photoId], references: [id])
  summary    String?                // 1–2 предложения для карточки/сниппета
  bioBlocks  Json        @default("[]") @db.JsonB   // полная биография
  career     Json        @default("[]") @db.JsonB   // [{from, to, role, place, note}]
  wineryId   String?     @db.Uuid   // текущее хозяйство
  winery     Winery?     @relation(fields: [wineryId], references: [id])
  featured   Boolean     @default(false)            // блок «Избранные виноделы»
  sortOrder  Int         @default(0)
  seo        Json        @default("{}") @db.JsonB
  status     PublishStatus @default(draft)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  relationsFrom PersonRelation[] @relation("relation_from")
  relationsTo   PersonRelation[] @relation("relation_to")
  wines      WinePerson[]
  contentItems ContentItem[]      // материалы о персоне (см. §7)
}

model PersonRelation {            // генеалогическое древо
  personId  String  @db.Uuid
  relatedId String  @db.Uuid
  type      PersonRelationType
  person    Person  @relation("relation_from", fields: [personId], references: [id], onDelete: Cascade)
  related   Person  @relation("relation_to", fields: [relatedId], references: [id], onDelete: Cascade)
  @@id([personId, relatedId, type])
}

model Winery {                    // хозяйство / винодельня
  id        String   @id @default(uuid()) @db.Uuid
  slug      String   @unique
  name      String
  summary   String?
  foundedYear Int?
  regionId  String?  @db.Uuid
  region    Region?  @relation(fields: [regionId], references: [id])
  logoId    String?  @db.Uuid
  logo      MediaAsset? @relation("WineryLogo", fields: [logoId], references: [id])
  description Json   @default("[]") @db.JsonB
  lat       Float?                // координаты для карты
  lng       Float?
  seo       Json     @default("{}") @db.JsonB
  status    PublishStatus @default(draft)
  updatedAt DateTime @updatedAt
  persons   Person[]
  wines     Wine[]
}

model Region {                    // регион, иерархия как у Category
  id        String   @id @default(uuid()) @db.Uuid
  slug      String   @unique
  name      String
  summary   String?
  parentId  String?  @db.Uuid
  parent    Region?  @relation("RegionTree", fields: [parentId], references: [id])
  children  Region[] @relation("RegionTree")
  description Json   @default("[]") @db.JsonB
  climate   String?
  soil      String?
  lat       Float?                // центр региона — маркер на карте
  lng       Float?
  seo       Json     @default("{}") @db.JsonB
  status    PublishStatus @default(draft)
  updatedAt DateTime @updatedAt
  terroirs  Terroir[]
  wines     Wine[]
}

model Terroir {                   // терруар / виноградник
  id          String  @id @default(uuid()) @db.Uuid
  slug        String  @unique
  name        String
  summary     String?
  regionId    String  @db.Uuid
  region      Region  @relation(fields: [regionId], references: [id])
  exposition  String?             // экспозиция
  elevationM  Int?                // высота
  soil        String?             // почвы
  description Json    @default("[]") @db.JsonB
  lat         Float?              // точка виноградника на карте
  lng         Float?
  seo         Json     @default("{}") @db.JsonB
  status      PublishStatus @default(draft)
  updatedAt   DateTime @updatedAt
  wines       Wine[]
  contentItems ContentItem[]      // материалы о терруаре (см. §7)
}

model Wine {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique
  name        String
  summary     String?
  type        String?             // red | white | rose | sparkling | ...
  style       String?             // dry | semi-dry | sweet | ...
  vintage     Int?
  grapes      Json     @default("[]") @db.JsonB  // ["Каберне Совиньон", ...]
  wineryId    String?  @db.Uuid
  winery      Winery?  @relation(fields: [wineryId], references: [id])
  regionId    String?  @db.Uuid
  region      Region?  @relation(fields: [regionId], references: [id])
  terroirId   String?  @db.Uuid
  terroir     Terroir? @relation(fields: [terroirId], references: [id])
  description Json     @default("[]") @db.JsonB
  seo         Json     @default("{}") @db.JsonB
  winemakers  WinePerson[]
  status      PublishStatus @default(draft)
  updatedAt   DateTime @updatedAt
}

model WinePerson {                // вино ↔ виноделы (винодел + консультант и т.п.)
  wineId   String @db.Uuid
  personId String @db.Uuid
  role     String?               // «главный винодел», «консультант»
  wine     Wine   @relation(fields: [wineId], references: [id], onDelete: Cascade)
  person   Person @relation(fields: [personId], references: [id], onDelete: Cascade)
  @@id([wineId, personId])
}
```

Примечания:
- `PublishStatus` — переиспользовать `ContentStatus` или завести простой `draft|published`. Для v1 достаточно двух значений, но он должен быть на всех публичных сущностях, а не только на `Person` и `Wine`.
- На `ContentItem` добавляются два отношения many-to-many: `persons Person[]` и `terroirs Terroir[]` — это даёт двустороннюю перелинковку статей/новостей с разделом (см. §7).
- Координаты `lat/lng` — точки (маркеры). Полигоны границ регионов в v1 не рисуем (см. §14).
- Комментарии: на модель `Comment` добавляются nullable-поля `personId`, `wineId` (как сейчас `contentItemId`) — общая модерация и стоп-слова продолжают работать (см. §10).
- Просмотры: enum типов аналитики расширяется значениями `person`, `wine` (миграция `ALTER TYPE ... ADD VALUE`) — increment через существующий `POST /api/views/increment` (см. §10).
- Миграция: одна `*_add_winemakers_project`.

### Инварианты данных

- `PersonRelation` хранит только канонические типы `parent`, `spouse`, `sibling`, `founder`. Тип `child` в БД не храним: он выводится на чтении как обратная сторона `parent`.
- Для `spouse` и `sibling` сервис обеспечивает симметрию: если создана связь `A -> B`, то создаётся и `B -> A`.
- Для `parent` сервис запрещает самоссылки и простые циклы вида `A -> B`, `B -> A`.
- Список «виноделы региона» в v1 строится по текущей аффилиации: через `person.winery.regionId` и/или вина, привязанные к региону. Историческая карьера из `career` влияет только на биографический блок, но не на каталожные выборки.
- Блоки дизайна, зависящие от флагов (`featured`, логотип хозяйства, бейджи `type/style`, факты терруара), рендерятся только при наличии данных; пустые декоративные слоты не показываем.

---

## 4. API

Новый модуль `api/src/modules/winemakers/` (controller + service + admin-controller):

```
GET  /api/winemakers                 — список персон (фильтры: region, winery, q — FTS)
GET  /api/winemakers/:slug           — карточка персоны (+ relations, wines, contentItems)
GET  /api/winemakers/:slug/tree      — династия: узлы и связи для графа (2–3 уровня)
GET  /api/regions, /api/regions/:slug
GET  /api/regions/map                — регионы+терруары с координатами и счётчиками
GET  /api/terroirs/:slug
GET  /api/wineries/:slug
GET  /api/wines                      — фильтры: type, region, winery, person, vintage; q — FTS
GET  /api/wines/:slug
GET  /api/winepedia/search?q=        — сквозной FTS по персонам/винам/регионам/хозяйствам

Admin (JwtAuthGuard + RolesGuard(admin, editor)):
POST/PUT/DELETE /api/admin/winemakers[/:id]
POST/PUT/DELETE /api/admin/regions[/:id]
POST/PUT/DELETE /api/admin/terroirs[/:id]
POST/PUT/DELETE /api/admin/wineries[/:id]
POST/PUT/DELETE /api/admin/wines[/:id]
```

Изменения в существующих модулях:
- `community`: комментарии принимают `personId`/`wineId` (взаимоисключающе с `contentItemId`).
- `analytics`: `POST /api/views/increment` принимает `contentType=person|wine`.
- `content` (editor save): DTO материала принимает `personIds[]`, `terroirIds[]`.

Правила:
- публичные GET отдают только `status = published`;
- slug генерируется из имени при создании (как `slugify` в editor);
- `lastmod` = `updatedAt`;
- `GET /api/winepedia/search` — единый источник и для dropdown-поиска, и для страницы `/winemakers/search`;
- для dropdown ввод ограничиваем `q.length >= 2`, debounce ~250ms, ответ короткий: top-N по группам;
- для submit-поиска страница `/winemakers/search?q=` рендерит полный список результатов и фильтры по группам.

---

## 5. Публичные страницы и URL

| URL | Содержимое |
|---|---|
| `/winemakers` | Лендинг проекта: обложка и описание, интерактивная карта, избранные виноделы, **подробный архив всех данных** — персоны (А–Я с поиском), регионы (дерево), вина, хозяйства |
| `/winemakers/search` | Страница результатов поиска по разделу: query из `?q=`, сгруппированные результаты по персонам/винам/регионам/хозяйствам |
| `/winemakers/[slug]` | Персона: фото, годы, хозяйство, summary, биография (блоки), таймлайн карьеры, **графическое древо**, вина, «Материалы о нём», комментарии, счётчик просмотров |
| `/wines` | Каталог вин: фильтры (тип, регион, винодел, винтаж), сортировка, FTS-поиск |
| `/wines/[slug]` | Вино: сорта, винтаж, терруар/регион, винодел(ы), описание, связанные материалы, комментарии, просмотры |
| `/regions` | Список регионов (дерево) + карта |
| `/regions/[slug]` | Регион: описание, климат/почвы, карта с терруарами, вина, виноделы региона, подрегионы |
| `/terroirs/[slug]` | Терруар: экспозиция, почвы, положение на карте, вина, «Материалы о терруаре» |
| `/wineries/[slug]` | Хозяйство: описание, виноделы, вина |

Технически:
- страницы в `web/pages/winemakers/**`, `wines/**`, `regions/**`, `terroirs/**`, `wineries/**`;
- `definePageMeta({ layout: 'winemakers' })`;
- фильтры/пагинация — как в архивах (`usePagedArchive`-подход, `?page=N`, 42/стр);
- 404 для неопубликованных slug'ов;
- просмотры — `ViewTracker` с новыми типами; комментарии — существующий компонент комментариев с `personId`/`wineId`.
- `/winemakers/search` помечаем `noindex,follow`, чтобы не плодить индексируемые thin/duplicate search pages.

---

## 6. Дизайн и layout

- Новый `web/layouts/winemakers.vue`: своя шапка (логотип-ссылка на главную + название проекта + поиск по разделу), свой визуальный стиль; футер общий — для перелинковки.
- **Кнопка входа:** в `SiteHeader.vue` — рядом с иконками поиска, темы и аккаунта (слева от поиска), лейбл «Виноделы России». Не в полосе рубрик. В мобильном меню — отдельным пунктом над списком рубрик.
- Компоненты в `web/components/winemakers/`: `PersonCard`, `PersonTimeline`, `PersonTree` (SVG-граф), `WineCard`, `RegionTree`, `TerroirMap`.
- Текстовые блоки биографий — существующий `ContentBlocks.vue` без изменений.

---

## 7. Админка и связь с материалами

Разделы в `/account/admin` (доступ admin/editor):

| Страница | Что делает |
|---|---|
| `/account/admin/winemakers` | Список персон, поиск, создать/редактировать |
| `/account/admin/winemakers/[id]` | Форма: основное, фото (MediaPicker), биография (редактор блоков), таймлайн карьеры (строки «годы — роль — место»), родственники (выбор персоны + тип связи), SEO |
| `/account/admin/wines` | Каталог вин: привязки к виноделам/хозяйству/региону/терруару |
| `/account/admin/regions` | Дерево регионов, терруары (с координатами lat/lng), хозяйства |

**Связь со статьями и новостями (двусторонняя):**
- В редакторе материала (`EditorPanel`) — новые поля-мультиселекты «Связанные виноделы» и «Связанные терруары» (поиск по имени, как теги). Сохраняются в `personIds[]`/`terroirIds[]`.
- На странице статьи/новости — блок «Профили в "Виноделах России"»: ссылки на персон и терруары.
- На страницах персоны/терруара — блок «Материалы о нём/нём»: список связанных статей и новостей (обратная выборка по `ContentItem.persons`/`terroirs`).

Переиспользуем: `MediaPicker`, редактор блоков (`EditorPanel`), паттерны CRUD-страниц из `admin/categories.vue` / `admin/tags.vue`.

---

## 8. Интерактивная карта

- **Данные:** `GET /api/regions/map` — регионы и терруары с `lat/lng`, счётчиками виноделов и вин. Терруары без координат на карту не попадают (заполняются в админке).
- **Технология:** Leaflet + OpenStreetMap (`leaflet`, подключается только на страницах раздела — отдельный async-чанк). Альтернатива — Яндекс.Карты JS API (нужен ключ); по умолчанию OSM.
- **Поведение:**
  - маркеры регионов (крупные) и терруаров (мелкие, кластеризация при плотности);
  - **hover на маркер → всплывающая карточка**: название терруара/региона, виноделы этого места (ссылки), количество вин;
  - клик → переход на `/regions/[slug]` или `/terroirs/[slug]`;
  - на странице региона карта центрируется на нём и показывает его терруары.
- **Где:** лендинг `/winemakers` (под обложкой), `/regions`, `/regions/[slug]`.
- Источник списка «виноделы этого места» — текущая аффилиация и связанные вина; карьерная история не используется как источник для карты в v1.

---

## 9. Генеалогическое древо (граф)

- **Данные:** `GET /api/winemakers/:slug/tree` — узлы (персоны с фото/годами) и рёбра (`type`: parent/child/spouse/sibling/founder), 2–3 уровня от текущей персоны.
- **Рендер:** компонент `PersonTree` — SVG-граф (без canvas, чтобы узлы были доступными DOM-элементами: focus, title, клик-навигация). Раскладка слоями по поколениям: родители выше, дети ниже, супруги рядом; текущая персона подсвечена.
- **Поведение:** hover → краткая карточка (годы, хозяйство); клик → переход на страницу персоны. На мобильном — горизонтальный скролл графа.
- **Fallback:** если связей нет — блок не показываем; при узких местах раскладки (перекрёстные браки) допустимо дублирование узла с пометкой.

---

## 10. Комментарии, просмотры, поиск

- **Комментарии:** модель `Comment` получает nullable `personId`/`wineId`; контроллер валидирует «ровно один target». UI — существующий блок комментариев на страницах персоны и вина. Модерация и стоп-слова — общие.
- **Просмотры:** enum типов аналитики расширяется `person` и `wine`; `ViewTracker` на страницах персоны/вина; счётчики в карточках каталога и в админской статистике.
- **Полнотекстовый поиск:** PostgreSQL FTS (`tsvector`, GIN-индексы) нужно завести и для новых таблиц раздела; отдельно зафиксировать миграцию/обновление search vector для `Person`, `Wine`, `Region`, `Terroir`, `Winery`. Endpoint `/api/winepedia/search` возвращает сгруппированные результаты (персоны/вина/регионы/хозяйства), используется и в dropdown, и на `/winemakers/search`. Поисковая строка — в шапке layout'а раздела и на лендинге. Поиск сайта (`/search`) каталог не индексирует в v1.

---

## 11. SEO

- `useSeoMeta` на каждой странице; шаблоны title: «{Имя} — биография — Виноделы России», «{Вино} {винтаж} — {Винодельня}».
- Schema.org: `Person` на странице персоны, `Organization` на хозяйстве, `Place` на регионе/терруаре, `BreadcrumbList` везде.
- `sitemap-winemakers.xml` (персоны + хозяйства + регионы + терруары) и `sitemap-wines.xml` (вина), добавить в `sitemap.xml`; `lastmod` из `updatedAt`.
- Перелинковка: блоки «Материалы о нём» / «Профили в Виноделах России» (§7); ссылки из рубрики «Люди отрасли».
- Отдельная регистрация в Яндекс.Вебмастере/Search Console **не нужна** — домен тот же; после запуска отправить новые sitemap на переобход.
- Страница `/winemakers/search` в sitemap не входит и отдаёт `noindex,follow`.

---

## 12. Дорожная карта

| Этап | Содержание | Оценка (1 разработчик) |
|---|---|---|
| 0. Контент-инвентаризация | Список первых персон/хозяйств/вин, источники биографий, фото, координаты регионов/терруаров | вне разработки |
| 1. База и API | Prisma-модели + миграция (включая `Comment.personId/wineId`, расширение enum просмотров), модуль `winemakers` (public GET + admin CRUD + FTS), связи `ContentItem.persons/terroirs` | 3–4 дня |
| 2. Админка | CRUD-страницы персон/вин/регионов/терруаров/хозяйств, координаты, мультиселекты виноделов/терруаров в редакторе материала | 3–4 дня |
| 3. Публичный раздел | Layout, кнопка в шапке рядом с иконками, лендинг с архивом всех данных, страницы персоны/вина/региона/терруара/хозяйства, блоки перелинковки в статьях | 5–6 дней |
| 4. Интерактивная карта | Leaflet + OSM, маркеры, hover-карточки, кластеризация | 2–3 дня |
| 5. Древо + соцмеханики + поиск | SVG-граф династии, комментарии и просмотры на персонах/винах, FTS-поиск в шапке раздела и на `/winemakers/search` | 4–5 дней |
| 6. SEO-пакет | schema.org, sitemap, переобход | 1 день |
| 7. Наполнение и запуск | Первые 20–30 биографий, проверка индексации | параллельно с 2–5 |

**Итого разработка: ~4–5 недель для полного объёма из этого документа.** Если нужен более ранний запуск, разумно резать v1 на две фазы:
- `Phase A / catalog-first` — сущности, админка, страницы, перелинковка, SEO, поиск без карты и без дерева;
- `Phase B` — интерактивная карта, SVG-древо, дополнительные UX-улучшения.

Наполнение — по мере готовности редакции; запускать каталог можно с 10+ заполненными персонами, а карту включать после заполнения координат и проверки данных.

Порядок внутри этапа 3: сначала персона (главная ценность), затем вино, затем регионы/терруары/хозяйства.

---

## 13. Чеклист запуска

- [ ] Миграция применена на проде (новые таблицы + `Comment.personId/wineId` + enum просмотров)
- [ ] CRUD персон/вин/регионов/терруаров/хозяйств работает в админке
- [ ] В редакторе материала выбираются винодел и терруар; блоки-ссылки видны на статье и на профиле
- [ ] Кнопка «Виноделы России» в шапке рядом с иконками (десктоп + мобильное меню)
- [ ] Лендинг `/winemakers` показывает архив всех данных
- [ ] `/winemakers/search` работает как страница результатов и помечен `noindex,follow`
- [ ] Карта отображает регионы/терруары, hover показывает виноделов
- [ ] Древо династии рендерится и кликабельно
- [ ] Комментарии и просмотры работают на персонах и винах
- [ ] Поиск по каталогу находит персону/вино/регион
- [ ] Все публичные сущности (`Person`, `Wine`, `Region`, `Terroir`, `Winery`) имеют `status`, `updatedAt`, SEO-поля; неопубликованные — 404
- [ ] `sitemap-winemakers.xml` / `sitemap-wines.xml` в sitemapindex, 200 + валидный XML
- [ ] schema.org Person валиден (проверка в Яндекс.Вебмастере)
- [ ] robots.txt не блокирует новые пути

---

## 14. Что осознанно НЕ делаем в первой версии

- Полигоны границ регионов на карте (GeoJSON-контуры) — v1 обходится точечными маркерами `lat/lng`.
- Импорт биографий из внешних источников — наполнение вручную через админку.
- Оценки/рейтинги вин, дегустационные заметки пользователей — за рамками справочника.
- Включение каталога в общий поиск сайта `/search` (у раздела свой поиск).
- Историческая «география карьеры» как отдельный слой каталога и карты — только после отдельной модели аффилиаций; в v1 региональные выборки строятся по текущим связям.
- Уведомления подписчикам о новых биографиях.

---

*Документ создан: август 2026. Обновлять по мере внедрения этапов.*
