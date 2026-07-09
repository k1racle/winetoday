<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

function close() {
  isOpen.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" @click.self="close">
        <Transition name="slide">
          <div v-if="isOpen" class="relative mt-8 w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-foreground/10 bg-card shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <h2 class="flex items-center gap-3 text-xl font-bold">
                <span class="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-bold text-white">?</span>
                Справка по редактору материалов
              </h2>
              <button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/5 hover:text-red-600" @click="close">✕</button>
            </div>

            <!-- Body -->
            <div class="overflow-y-auto p-6">
              <div class="mb-6 rounded border border-accent/30 bg-accent/5 px-4 py-3 text-sm leading-relaxed">
                Этот редактор позволяет создавать и редактировать материалы для сайта <b>ВИНОДЕЛИЕ СЕГОДНЯ</b>. Слева — описание поля, справа — пример того, как оно выглядит на сайте.
              </div>

              <!-- Section -->
              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Основная информация</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Заголовок</span>
                        <span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">обязательно</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Главный заголовок материала. Отображается крупным шрифтом на странице и в превью на главной.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-sm font-bold">Сергей Левожинский: «Виноделы все меньше готовы инвестировать в продвижение»</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Ссылка (slug)</span>
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">URL</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Часть адреса страницы. Латиница, без пробелов, через дефис. Если пусто — генерируется автоматически из заголовка.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример URL</p>
                      <p class="text-xs text-foreground/60">winemaking-today.ru › news ›</p>
                      <p class="text-sm text-accent">sergej-levozhinskij-vinodely-menshe</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Краткое описание</span>
                        <span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">обязательно</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Краткое вступление (лид). Отображается под заголовком в превью на главной. 150–200 символов.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs leading-relaxed text-foreground/70">Руководитель винной категории сети «Магнит» в рамках выставки рассказал о доле на полке и противоречиях с виноделами...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Настройки публикации</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Статус</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Определяет видимость материала. Черновик — только редактору. Опубликовано — всем.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs"><span class="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500" />Черновик · <span class="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />Опубликовано</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Дата публикации</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Дата и время, когда материал станет доступен читателям.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-sm font-semibold text-accent">2 июня · 09:45</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Метка материала</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Выделяет материал особым бейджем в списке новостей: Важно, Горячая новость, Эксклюзив, Видео.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs">Gunko Winery расширит линейку <span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Эксклюзив</span></p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Автор</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Автор материала. Для admin можно выбрать из списка, для редакторов подставляется автоматически.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs text-foreground/70">Андрей Маленков · Редактор</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Обложка и медиа</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Обложка</span>
                        <span class="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">важно</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Главное изображение. Превью на главной, в списке новостей и соцсетях. Рекомендуется 1200×630 px.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <div class="h-20 w-full rounded bg-accent/10" />
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Источник видео</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Ссылка на видео YouTube, Vimeo или другой внешний источник, если тип материала — видео.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример</p>
                      <p class="text-xs text-accent">https://www.youtube.com/watch?v=...</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Продолжительность</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Длительность видео в формате чч:мм:сс. Например, 1:05:30 означает 1 час 5 минут 30 секунд.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример</p>
                      <p class="text-xs text-accent">0:05:30</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Блоки материала</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Текстовый блок</span>
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">rich-text</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Основной блок для текста. Поддерживает жирный, курсив, заголовки, списки, ссылки, выравнивание, цитаты.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs leading-relaxed">Виноделие как <b>искусство</b> и наука объединяет в себе традиции и инновации.</p>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Галерея / Слайдер</span>
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">media</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Несколько изображений. Галерея — сетка, слайдер — карусель.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <div class="flex gap-1">
                        <div class="h-12 w-16 rounded bg-foreground/10" />
                        <div class="h-12 w-16 rounded bg-foreground/10" />
                        <div class="h-12 w-16 rounded bg-foreground/10" />
                      </div>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Embed HTML</span>
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">код</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Вставка стороннего HTML: YouTube, Яндекс.Карты, Telegram-посты, iframe.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <div class="space-y-1 text-xs text-foreground/70">
                        <p>📺 Видео с YouTube</p>
                        <p>🗺 Яндекс.Карты</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Рубрики, теги и источники</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Рубрики и темы</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Рубрики определяют раздел сайта. Темы — узкие метки для связанных материалов.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <div class="flex flex-wrap gap-1">
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">Российское виноделие</span>
                        <span class="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">Игристые вина</span>
                      </div>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Источники</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Ссылки на источники информации. Отображаются в конце материала.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример на сайте</p>
                      <p class="text-xs text-accent">• Wine Spectator — winespectator.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">SEO</h3>
                <div class="space-y-3">
                  <div class="grid gap-4 rounded border border-foreground/10 bg-muted sm:grid-cols-2">
                    <div class="border-b border-foreground/10 p-4 sm:border-b-0 sm:border-r">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="h-4 w-1 rounded bg-accent" />
                        <span class="text-sm font-semibold">Meta Title / Description</span>
                      </div>
                      <p class="text-xs leading-relaxed text-foreground/70">Заголовок и описание для поисковиков. Если пусто — берутся из основного заголовка и лида.</p>
                    </div>
                    <div class="p-4">
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">Пример в Google</p>
                      <p class="text-sm text-accent">Виноделие 2026: тренды и новости отрасли</p>
                      <p class="text-xs text-foreground/60">Актуальные новости виноделия, обзоры выставок...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
                <b>Горячие клавиши:</b> <b>Ctrl+B</b> — жирный · <b>Ctrl+I</b> — курсив · <b>Ctrl+U</b> — подчёркивание
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-15px); }
</style>
