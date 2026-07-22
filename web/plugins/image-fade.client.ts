export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  function markLoaded(img: HTMLImageElement) {
    img.classList.add('is-loaded');
  }

  function initImage(img: HTMLImageElement) {
    if (img.complete) {
      markLoaded(img);
    } else {
      img.addEventListener('load', () => markLoaded(img), { once: true });
      img.addEventListener('error', () => markLoaded(img), { once: true });
    }
  }

  document.querySelectorAll('img').forEach(initImage);

  document.addEventListener(
    'load',
    (event) => {
      if (event.target instanceof HTMLImageElement) {
        markLoaded(event.target);
      }
    },
    true,
  );

  document.addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) {
        markLoaded(event.target);
      }
    },
    true,
  );
});
