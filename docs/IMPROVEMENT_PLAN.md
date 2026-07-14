# План аккуратного исправления сайта

## Принципы

- Не терять базу данных и uploads.
- Каждое изменение — отдельным коммитом.
- Перед изменением инфраструктуры делать бэкап volume.
- Сначала стабилизировать деплой, потом чинить функционал.
- Каждый пункт тестировать на stage/локально перед push в main.

---

## Этап 1. Стабилизация инфраструктуры

**Цель:** сделать так, чтобы redeploy в Portainer не терял данные и работал из Git.

1.1. **docker-compose.yml**
- `name: winemakingtodayyy` (фиксируем project name).
- `build context` вернуть к `./api`, `./watermark`, `./web` (как в рабочей версии 5.2.5).
- Сделать volumes `postgres_data`, `media_uploads`, `backend_uploads` `external: true` и привязать к существующим volumes:
  - `winemakingtoday_postgres_data`
  - `winemakingtoday_media_uploads`
  - `winemakingtoday_backend_uploads`
- Временно оставить `redis` и `meilisearch`, чтобы не сломать текущий код.

1.2. **Настроить Git-деплой в Portainer**
- Удалить старый стек `winemakingtodayyy` только после создания нового.
- Создать новый стек `winemakingtodayyy` через **Repository**.
- Добавить webhook в GitHub для автоматического redeploy.

1.3. **Бэкап перед изменением**
```bash
docker exec -e PGPASSWORD="vino_secure_password" -it vino_postgres pg_dump -U vino -d winetoday_api > /root/winetoday_backup_$(date +%F).sql
docker run --rm -v winemakingtoday_media_uploads:/data -v /root:/backup alpine tar czf /backup/media_uploads_$(date +%F).tar.gz -C /data .
docker run --rm -v winemakingtoday_backend_uploads:/data -v /root:/backup alpine tar czf /backup/backend_uploads_$(date +%F).tar.gz -C /data .
```

---

## Этап 2. Админка — замена логотипа

**Цель:** дать возможность загружать/менять логотип в админке.

- Добавить в `site_settings` поле для логотипа (light/dark версии или SVG).
- Обновить API endpoint `/api/site-settings` для сохранения логотипа.
- В `web/components/SiteHeader.vue` заменить статичный `/logo-light.png` / `/logo-dark.png` на значение из `siteSettings`.
- Загруженный логотип сохранять в `/uploads/` (volume `media_uploads`).

---

## Этап 3. Пользователи и роли Автора/Редактора

**Цель:** создание пользователя и автоматическое создание связанного автора.

- При создании пользователя с ролью `author` или `editor` автоматически создавать запись в таблице `authors`.
- В админке на странице "Пользователи" показывать связанного автора.
- Исправить баг: новый автор не появляется в разделе "Авторы".
- Добавить возможность привязать существующего пользователя к существующему автору.

---

## Этап 4. Сессия админки

**Цель:** админка не должна выбрасывать пользователя постоянно.

- Проверить настройки JWT access/refresh токенов:
  - Время жизни access токена.
  - Время жизни refresh токена и cookies.
  - Правильность обновления access через refresh.
- Проверить `COOKIE_DOMAIN`, `COOKIE_SECURE` — должны соответствовать production-домену.
- Убедиться, что refresh token сохраняется в httpOnly cookie и не теряется при redeploy.
- Добавить механизм "silent refresh" на фронтенде.

---

## Этап 5. Текстовый редактор

**Цель:** починить функциональность редактора.

- Заменить текущий редактор на проверенный WYSIWYG (например, TipTap или Quill) с поддержкой:
  - заголовков H2/H3;
  - ссылок;
  - списков;
  - цвета текста (в том числе при вставке из внешних источников).
- При вставке текста очищать стили и устанавливать цвет по умолчанию (`#000000` для светлой темы, `#ffffff` для тёмной).
- Сохранять контент в виде JSON/HTML в `contentBlocks`.

---

## Этап 6. Дедупликация рубрик и тегов

**Цель:** убрать задвоенные категории и теги.

- Добавить уникальный индекс по `slug` для `categories` и `tags`.
- Скрипт для слияния дубликатов:
  - Обновить связи `ContentItem` → `Category` / `Tag`.
  - Удалить дубликаты, оставив каноническую запись.
- В админке при создании категории/тега проверять уникальность `slug`.

---

## Этап 7. Гиперссылки в тексте

**Цель:** ссылки в статьях выделяются цветом сайта и подчёркиваются.

- Добавить в глобальные Tailwind-стили или в prose-стили:
```css
.prose a,
.article-content a {
  color: var(--accent-color); /* зелёный цвет сайта */
  text-decoration: underline;
}
.prose a:hover {
  text-decoration: none;
}
```
- Убедиться, что стили не переопределяются редактором.

---

## Этап 8. Галереи и слайдеры

**Цель:** починить отображение галерей и слайдеров в материалах.

- Проверить тип контента `gallery` и обработку `contentBlocks` типа `gallery`/`slider`.
- Починить компоненты `GalleryBlock.vue` / `SliderBlock.vue` (если есть) или создать новые.
- Убедиться, что изображения галереи берутся из `media_assets` и правильно отдаются через `/uploads/`.

---

## Этап 9. Удаление лишнего (только после стабилизации)

- Убедиться, что код не использует redis/meilisearch.
- Удалить сервисы `redis` и `meilisearch` из `docker-compose.yml`.
- Удалить связанные env-переменные (`REDIS_PASSWORD`, `MEILI_MASTER_KEY`, `MEILISEARCH_URL`).

---

## Порядок работы

1. Выполнить Этап 1 и убедиться, что сайт стабильно деплоится.
2. По одному выполнять Этапы 2–8, каждый — отдельным коммитом.
3. После каждого коммита делать redeploy и проверять.
4. Этап 9 — в самом конце, когда всё остальное работает.
