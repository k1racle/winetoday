# План полного пересоздания сайта winemaking.today

## Цель

Пересоздать сайт на стеке **NestJS API + Nuxt 3 frontend + PostgreSQL + Redis**, без Meilisearch и без watermark, с сохранением всех старых URL и контента.

## Что не трогаем

- Внешний вид сайта.
- Расположение элементов на страницах.
- Логика отображения контента во фронтенде (кроме удаления watermark и незначительных правок для видео/автора).

Эти вопросы вернёмся после того, как сайт снова будет работать.

## Стек итоговый

- **API:** NestJS (`api/`), порт 4000.
- **Frontend:** Nuxt 3 (`web/`), порт 3001.
- **БД:** PostgreSQL 17, новая база `winetoday_v2`.
- **Кэш/сессии:** Redis 7.
- **Поиск:** удалён (Meilisearch вырезан).
- **Watermark:** удалён полностью.

## Источники данных

### 1. `winetoday_api` (текущая NestJS-база)

Основной источник. Содержит актуальные данные, введённые уже в новой CMS:

- content_items: 380
- media_assets: 1076
- categories: 20
- tags: 10
- authors: 17
- users: 18
- member_profiles: 5
- comments: 0
- reactions: 1
- author_subscriptions: 1
- content_view_totals: 338
- content_view_daily: 823
- content_view_events: 1624
- author_view_daily: 37
- site_settings: 1

### 2. `vino_portal` (legacy Strapi)

Вторичный источник для того, чего нет в `winetoday_api`, и для старых URL:

- articles: 81 → `article`
- news_items: 503 → `news`
- videos: 41 → `video`
- galleries: 4 → `gallery`
- categories: 20
- authors: 17
- users: 17 (up_users)
- comments: 9
- reactions: 91
- files: 946

## Стратегия миграции

1. **Создать новую БД `winetoday_v2`.**
2. **Применить Prisma миграции** от текущего API.
3. **Мигрировать справочники** из `winetoday_api` с сохранением UUID (первичный источник). Для отсутствующих записей — подтянуть из `vino_portal` по email/slug.
   - users
   - authors
   - member_profiles
   - categories
   - tags
   - media_assets
4. **Мигрировать контент** `content_items`:
   - Сначала перенести все 380 записей из `winetoday_api` **со старыми UUID и slug**.
   - Затем добавить материалы из `vino_portal`, которых нет в `winetoday_api` по паре `(type, slug)`.
5. **Мигрировать связи**:
   - content_items ↔ categories
   - content_items ↔ tags
   - content_items ↔ media_assets (cover)
   - content_items ↔ authors
6. **Мигрировать комментарии и реакции** из `vino_portal`, привязав к `content_items` по `target_document_id`/`target_slug`.
7. **Мигрировать статистику просмотров** из `winetoday_api`.
8. **Мигрировать подписки на авторов** и настройки сайта.

## Технические задачи

### API

- [x] Удалён watermark из сервисов, DTO, контроллеров.
- [x] Убраны лишние `@MaxLength` в админ-редакторе.
- [x] Видео сохраняется без автора.
- [x] Сортировка материалов по `publishedAt desc`.
- [x] Удалён watermark из сервисов, DTO, контроллеров, Prisma-схемы.
- [x] Удалён Meilisearch из `docker-compose.yml`, frontend-конфига, API.
- [x] Prisma-схема очищена от watermark/meilisearch.
- [x] Создана единая init-миграция `20260715000000_init`.
- [x] Проверено локально: init-миграция накатывается на чистую БД.

### Frontend

- [x] Удалён watermark из редактора и загрузки обложек.
- [x] Локальные шрифты Lato + Google Inter.
- [x] Meilisearch убран из `nuxt.config.ts`.
- [ ] Проверить `/api/revalidate` прокси.

### Docker / Compose

- [x] Внешние волюмы настроены (`winemakingtoday_*`).
- [x] watermark сервис убран.
- [x] Meilisearch сервис убран.
- [x] В nginx-конфиге проекта убран `/search/`, добавлен `/api/revalidate` → web.
- [ ] Применить изменения в Nginx Proxy Manager на сервере.

### БД / Миграция

- [x] Создана init-миграция для `winetoday_v2`.
- [x] Написан migration-скрипт `api/src/migration/migrate-v2.ts`.
- [ ] Запустить миграцию на сервере.
- [ ] Проверить количества и корректность связей.

### Деплой

- [ ] Подготовить `.env` с `API_POSTGRES_DB=winetoday_v2`.
- [ ] Пересоздать стек в Portainer.
- [ ] Проверить работу сайта, редиректы, старые URL.

## Бэкап

Полный бэкап live-версии 5.2.5 создан:

```
/root/winetoday-525-full-backup-20260715-0817/
```

Содержит `all-databases.sql`, `backend_uploads/`, `media_uploads/`, schema dumps.

## Следующий шаг

Запустить миграцию на сервере по пошаговой инструкции `DEPLOY_STEP_BY_STEP.md`: сохранить env, залить код, создать `winetoday_v2`, промигрировать, обновить стек в Portainer, настроить Nginx Proxy Manager.
