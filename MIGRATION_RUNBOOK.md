# Запуск миграции на сервере

## Что уже сделано локально

- Meilisearch и watermark удалены из API, frontend, `docker-compose.yml`.
- Prisma-схема очищена, создана единая init-миграция `api/prisma/migrations/20260715000000_init`.
- Написан мигратор `api/src/migration/migrate-v2.ts` (winetoday_api + vino_portal → winetoday_v2).
- API собирается (`npm run build`).

## Подготовка

1. Убедитесь, что код из репозитория актуален и задеплоен в Portainer / на сервер.
2. Убедитесь, что в `.env` (или в переменных окружения стека) установлено:
   - `API_POSTGRES_DB=winetoday_v2`
   - `SOURCE_API_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_api`
   - `SOURCE_STRAPI_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/vino_portal`
   - остальные переменные из `.env.example`.

## Предварительная проверка (выполнить и прислать вывод)

Перед запуском миграции убедимся, что в Strapi нет неизвестных типов контента для комментариев/реакций:

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "SELECT DISTINCT content_type_uid FROM comments;"
docker exec vino_postgres psql -U vino -d vino_portal -c "SELECT DISTINCT content_type_uid FROM reactions;"
docker exec vino_postgres psql -U vino -d vino_portal -c "SELECT DISTINCT related_type FROM files_related_mph WHERE field = 'cover';"
```

Ожидаемые значения `content_type_uid`: `api::article.article`, `api::news.news`, `api::video.video`, `api::gallery.gallery`.

## Шаг 1. Создать новую базу

Подключитесь к контейнеру postgres и создайте БД:

```bash
docker exec -it vino_postgres psql -U vino -d vino_portal -c "CREATE DATABASE winetoday_v2;"
```

## Шаг 2. Применить init-миграцию Prisma

Соберите образ API (если ещё не собран) и примените миграцию:

```bash
cd /path/to/repo/api
docker build -t vino_api:migrate .

docker run --rm --network winemakingtodayyy_default \
  -e DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_v2 \
  -v winemakingtoday_backend_uploads:/app/public/uploads \
  -v winemakingtoday_media_uploads:/app/uploads \
  vino_api:migrate \
  sh -c "npx prisma migrate deploy"
```

## Шаг 3. Запустить миграцию данных

```bash
docker run --rm --network winemakingtodayyy_default \
  -e DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_v2 \
  -e SOURCE_API_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_api \
  -e SOURCE_STRAPI_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/vino_portal \
  -v winemakingtoday_backend_uploads:/app/public/uploads \
  -v winemakingtoday_media_uploads:/app/uploads \
  vino_api:migrate \
  npm run db:migrate-v2
```

Ожидаемый вывод (примерно):

```
Target tables truncated.
Migrated 18 API users + 17 Strapi users.
Migrated 17 API authors + 17 Strapi authors.
Migrated 5 member profiles.
Migrated 20 API categories + 20 Strapi categories.
Migrated 10 API tags + N Strapi tags.
Migrated 1076 API media + 946 Strapi files.
Migrated 380 API content items.
Migrated ... Strapi articles (... raw rows).
Migrated ... Strapi news (... raw rows).
Migrated ... Strapi videos (... raw rows).
Migrated ... Strapi galleries (... raw rows).
Migrated ... category relations + ... tag relations.
Migrated ... API comments.
Migrated ... API reactions.
Migrated ... Strapi comments.
Migrated ... Strapi reactions.
Migrated ... view totals.
...
Migration complete.
```

## Шаг 4. Проверить количества

```bash
docker exec vino_postgres psql -U vino -d winetoday_v2 -c "
SELECT 'content_items', count(*) FROM content_items UNION ALL
SELECT 'media_assets', count(*) FROM media_assets UNION ALL
SELECT 'categories', count(*) FROM categories UNION ALL
SELECT 'tags', count(*) FROM tags UNION ALL
SELECT 'authors', count(*) FROM authors UNION ALL
SELECT 'users', count(*) FROM users UNION ALL
SELECT 'comments', count(*) FROM comments UNION ALL
SELECT 'reactions', count(*) FROM reactions UNION ALL
SELECT 'content_view_totals', count(*) FROM content_view_totals UNION ALL
SELECT 'content_view_daily', count(*) FROM content_view_daily;
"
```

Ожидается:
- content_items ≥ 380
- media_assets ≥ 1076
- categories ≥ 20
- tags ≥ 10
- authors ≥ 17
- users ≥ 18
- comments ≥ 9
- reactions ≥ 92 (1 из winetoday_api + 91 из Strapi)

## Шаг 5. Переключить стек на winetoday_v2

1. В Portainer / `.env` установите `API_POSTGRES_DB=winetoday_v2`.
2. Пересоздайте/перезапустите стек.
3. API при старте сам применит `prisma migrate deploy` (запись в `_prisma_migrations` уже есть).

## Шаг 6. Проверить сайт

- Откройте главную страницу.
- Проверьте несколько старых URL (`/articles/slug`, `/news/slug`, `/videos/slug`).
- Проверьте авторизацию в админку.
- Проверьте загрузку медиа (`/uploads/...`).

## Откат

Если что-то пошло не так, просто удалите `winetoday_v2` и верните `API_POSTGRES_DB=winetoday_api`:

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "DROP DATABASE winetoday_v2;"
```

Старые базы `winetoday_api` и `vino_portal` не изменяются.
