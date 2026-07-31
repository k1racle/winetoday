import type { Ref } from 'vue';

type ReadingEventsOptions = {
  articleId: string;
  author?: string;
  rubric?: string;
  contentType: string;
  wordCount?: number;
  contentEl: Ref<HTMLElement | null>;
};

// Активность пользователя (любое из событий ниже) считается «живой»
// в течение этого окна — только оно идёт в активное время чтения.
const ACTIVITY_WINDOW_MS = 10_000;
const ENGAGED_SECONDS = 60;

export function useReadingEvents(options: ReadingEventsOptions) {
  if (import.meta.server) return;

  const { event } = useYm();

  const baseParams: Record<string, unknown> = {
    article_id: options.articleId,
    author: options.author,
    rubric: options.rubric,
    content_type: options.contentType,
  };

  let activeSeconds = 0;
  let lastActivityAt = 0;
  let engagedSent = false;
  let scroll75Sent = false;
  let scroll100Sent = false;

  function markActivity() {
    lastActivityAt = Date.now();
  }

  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastActivityAt > ACTIVITY_WINDOW_MS) return;
    activeSeconds += 1;
    if (!engagedSent && activeSeconds >= ENGAGED_SECONDS) {
      engagedSent = true;
      event('engaged_read_60', { ...baseParams, word_count: options.wordCount });
    }
  }, 1000);

  function onScroll() {
    markActivity();
    if (scroll75Sent && scroll100Sent) return;
    const el = options.contentEl.value;
    if (!el) return;
    const height = el.offsetHeight;
    if (!height) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const ratio = (window.scrollY + window.innerHeight - top) / height;
    if (!scroll75Sent && ratio >= 0.75) {
      scroll75Sent = true;
      event('scroll_75', { ...baseParams });
    }
    if (!scroll100Sent && ratio >= 0.98) {
      scroll100Sent = true;
      event('scroll_100', { ...baseParams });
    }
  }

  const listenerOptions: AddEventListenerOptions = { passive: true };
  window.addEventListener('scroll', onScroll, listenerOptions);
  window.addEventListener('mousemove', markActivity, listenerOptions);
  window.addEventListener('keydown', markActivity, listenerOptions);
  window.addEventListener('touchstart', markActivity, listenerOptions);

  onBeforeUnmount(() => {
    clearInterval(timer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('mousemove', markActivity);
    window.removeEventListener('keydown', markActivity);
    window.removeEventListener('touchstart', markActivity);
  });
}
