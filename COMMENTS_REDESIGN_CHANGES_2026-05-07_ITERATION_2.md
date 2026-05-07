## Редизайн блока комментариев/новостей — 2026-05-07, итерация 2

Выполнено без пункта 7.

### Что изменено

- Обновлен блок новостей на главной в `frontend/src/components/homepage-news-sidebar.tsx`:
  - убран принудительный remount по `key={activeTab}`;
  - мобильное раскрытие теперь сбрасывается через `useEffect` при смене вкладки;
  - вкладки `Свежие` / `Популярные` стали спокойнее по подаче, без underline-индикатора;
  - мобильные элементы переведены в более спокойный текстовый список;
  - на десктопе сделана двухколоночная подача: дата слева, заголовок справа;
  - ширина колонки даты на десктопе ужата до `40px`.

- Обновлена типографика homepage special block в `frontend/src/app/page.tsx`:
  - lead-заголовок и excerpt переведены на Lato-подачу;
  - secondary-карточки получили более спокойные category/meta и заголовки;
  - формат даты для правого news-sidebar упрощен до даты без времени.

- Добавлена и подключена Lato-типографика:
  - `frontend/src/app/layout.tsx` — добавлена поддержка `lato` в `resolveFontFamily`, обновлены fallback-настройки typography vars;
  - `frontend/src/app/globals.css` — добавлен `@font-face` для `Lato`, базовые CSS typography variables переведены на Lato там, где это нужно.

- Под новый тон приведены:
  - `frontend/src/components/infinite-archive-page-list.tsx`;
  - `frontend/src/components/sidebar-panel.tsx`.

### Что намеренно не делалось

- Пункт 7 не выполнялся.
- `COMMENTS_REDESIGN_CHANGES_2026-05-07.md` не изменялся.
