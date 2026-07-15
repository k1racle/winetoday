# Пошаговое развёртывание: переход на winetoday_v2

> **Важно:** не удаляй старый стек в Portainer. Мы обновляем существующий стек, предварительно подготовив новую БД. Старые базы `winetoday_api` и `vino_portal` остаются нетронутыми — при необходимости можно быстро откатиться.

## 0. Сохрани текущие env-переменные стека

В Portainer:
1. Открой **Stacks** → выбери стек `winemakingtodayyy`.
2. Перейди во вкладку **Editor**.
3. Прокрути вниз до блока **Environment variables**.
4. Скопируй все переменные и сохрани в файл на компьютере, например `winemakingtodayyy-env-backup-20260715.txt`.
5. (Опционально) Сделай скриншот страницы стека.

Эти переменные понадобятся при обновлении стека. Особенно важны:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_PASSWORD`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `REVALIDATE_SECRET`
- `SITE_URL`, `NUXT_PUBLIC_*`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VK_CLIENT_ID`, `VK_CLIENT_SECRET`

## 1. Залей код на Git

На своей машине:

```bash
cd /path/to/winetoday
git add .
git commit -m "refactor: remove watermark/meilisearch, add v2 migration"
git push
```

Убедись, что в репозитории теперь:
- нет watermark-сервиса и meilisearch в `docker-compose.yml`,
- `api/prisma/migrations/20260715000000_init/` присутствует,
- `api/src/migration/migrate-v2.ts` присутствует.

## 2. Подготовь новые env-переменные для стека

В Portainer открой стек и замени/добавь переменные. Минимальный набор:

```
POSTGRES_USER=vino
POSTGRES_PASSWORD=vino_secure_password
POSTGRES_DB=vino_portal
API_POSTGRES_DB=winetoday_v2
REDIS_PASSWORD=vino_redis_password

SITE_URL=https://winemaking-today.ru
NUXT_PUBLIC_SITE_URL=https://winemaking-today.ru
NUXT_PUBLIC_API_URL=https://winemaking-today.ru/api
NUXT_PUBLIC_MEDIA_BASE_URL=https://winemaking-today.ru
NUXT_PUBLIC_UPLOADS_URL=https://winemaking-today.ru/uploads
NUXT_PUBLIC_EDITOR_URL=https://winemaking-today.ru/account
MEDIA_URL=https://winemaking-today.ru/uploads

JWT_SECRET=<старый_значение>
JWT_REFRESH_SECRET=<старый_значение>
REVALIDATE_SECRET=<старый_значение>
COOKIE_DOMAIN=winemaking-today.ru
COOKIE_SECURE=true
CORS_ORIGIN=https://winemaking-today.ru,https://winemaking-today.ru:3001

SOURCE_API_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_api
SOURCE_STRAPI_DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/vino_portal

GOOGLE_CLIENT_ID=<если_было>
GOOGLE_CLIENT_SECRET=<если_было>
VK_CLIENT_ID=<если_было>
VK_CLIENT_SECRET=<если_было>
```

**Что убрать:**
- `MEILI_MASTER_KEY`
- `MEILISEARCH_URL`
- `NUXT_PUBLIC_MEILISEARCH_URL`
- любые `WATERMARK_*` переменные
- старые `STRAPI_*` переменные, если они больше не нужны

**Не нажимай "Update the stack" пока.** Сначала подготовим БД.

## 3. Создай новую базу winetoday_v2

Подключись к серверу по SSH и выполни:

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "CREATE DATABASE winetoday_v2;"
```

Если база уже есть (например, после неудачной попытки), удали и создай заново:

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "DROP DATABASE winetoday_v2;"
docker exec vino_postgres psql -U vino -d vino_portal -c "CREATE DATABASE winetoday_v2;"
```

## 4. Собери образ API для миграции

На сервере:

```bash
cd /root/winetoday   # или куда ты клонируешь/обновляешь репозиторий
# обнови код из git
git pull

# собери образ
docker build -t vino_api:migrate ./api
```

Если репозиторий не клонирован на сервер, клонируй:

```bash
cd /root
git clone <url-репозитория> winetoday
cd winetoday
docker build -t vino_api:migrate ./api
```

## 5. Примени init-миграцию Prisma к winetoday_v2

```bash
docker run --rm --network winemakingtodayyy_default \
  -e DATABASE_URL=postgres://vino:vino_secure_password@postgres:5432/winetoday_v2 \
  -v winemakingtoday_backend_uploads:/app/public/uploads \
  -v winemakingtoday_media_uploads:/app/uploads \
  vino_api:migrate \
  sh -c "npx prisma migrate deploy"
```

Ожидаемый результат:

```
Applying migration `20260715000000_init`
All migrations have been successfully applied.
```

## 6. Запусти миграцию данных

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

Дождись завершения. Ожидаемый вывод в конце:

```
content map: <число>
Migration complete.
```

Если видишь много `insert failed` — пришли лог, разберёмся.

## 7. Проверь количества в новой базе

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

Минимальные ожидаемые значения:
- content_items ≥ 380
- media_assets ≥ 1076
- categories ≥ 20
- tags ≥ 10
- authors ≥ 17
- users ≥ 18
- comments ≥ 9
- reactions ≥ 92

## 8. Проверь, что старые URL на месте

```bash
docker exec vino_postgres psql -U vino -d winetoday_v2 -c "
SELECT type, slug FROM content_items WHERE status = 'published' ORDER BY published_at DESC LIMIT 10;
"
```

Убедись, что slug-ы знакомые.

## 9. Обнови стек в Portainer

Вернись в Portainer:
1. Убедись, что env-переменные из шага 2 сохранены и `API_POSTGRES_DB=winetoday_v2`.
2. Нажми **Pull and redeploy?** / **Update the stack** (зависит от версии Portainer).
3. Если Portainer спрашивает "Pull latest changes?" — ответь **Yes**.
4. Дождись, пока все контейнеры пересоздадутся и статус станет **Healthy**.

Что произойдёт:
- Старые контейнеры `vino_api`, `vino_web` и т.д. будут пересозданы.
- `vino_postgres` перезапустится, init-скрипт увидит, что `winetoday_v2` уже существует, и не будет пытаться её пересоздать.
- `vino_api` при старте выполнит `prisma migrate deploy` — миграция уже применена, это займёт секунду.
- `vino_web` и `vino_api` поднимутся.

## 10. Проверь логи API

```bash
docker logs -f vino_api --tail 100
```

Должно быть что-то вроде:

```
All migrations have been successfully applied.
Nest application successfully started
```

Если API падает — пришли логи.

## 11. Обнови Nginx Proxy Manager

В панели Nginx Proxy Manager:
1. Открой хост `winemaking-today.ru`.
2. Перейди во вкладку **Advanced** или **Custom locations**.
3. Удали location `/search/` (Meilisearch больше не используется).
4. Убедись, что есть location `/uploads/` → `http://vino_api:4000/uploads/`.
5. Добавь location `/api/revalidate` → `http://vino_web:3000/api/revalidate`.

Пример конфигурации locations:

```
Location: /api/revalidate
Scheme: http
Forward Hostname / IP: vino_web
Forward Port: 3000
```

```
Location: /uploads/
Scheme: http
Forward Hostname / IP: vino_api
Forward Port: 4000
```

```
Location: /api/
Scheme: http
Forward Hostname / IP: vino_api
Forward Port: 4000
```

Сохрани и примени изменения.

## 12. Проверь сайт

В браузере:
1. Открой `https://winemaking-today.ru/`.
2. Проверь несколько старых ссылок:
   - `/articles/<slug>`
   - `/news/<slug>`
   - `/videos/<slug>`
   - `/author/<slug>`
3. Проверь, что изображения загружаются (`/uploads/...`).
4. Проверь вход в админку `/account`.
5. Проверь создание/редактирование материала в админке.

## 13. Если что-то не так — откат

В Portainer:
1. Верни `API_POSTGRES_DB=winetoday_api`.
2. Перезапусти стек.

Сайт снова заработает на старой базе.

Если хочешь начать миграцию заново:

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "DROP DATABASE winetoday_v2;"
```

Затем повтори шаги 3–12.

## 14. После успешной проверки

Через несколько дней, когда убедишься, что всё стабильно, можно удалить старые базы `winetoday_api` и `vino_portal` (необязательно, они занимают место):

```bash
docker exec vino_postgres psql -U vino -d vino_portal -c "DROP DATABASE winetoday_api;"
docker exec vino_postgres psql -U vino -d vino_portal -c "DROP DATABASE vino_portal;"
```

**Не делай этого сразу.** Оставь старые базы на всякий случай.
