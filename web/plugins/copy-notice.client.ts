export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  const footer = '\n\nМатериал с сайта ВИНОДЕЛИЕ СЕГОДНЯ — федеральное отраслевое медиа. https://winemaking-today.ru/';

  document.addEventListener('copy', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !event.clipboardData) return;

    // Skip native inputs and editable elements to keep their default copy behaviour
    const tagName = target.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) return;

    const selection = window.getSelection()?.toString();
    if (!selection?.trim()) return;

    event.preventDefault();
    event.clipboardData.setData('text/plain', selection + footer);
  });
});
