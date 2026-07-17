export function truncateTitle(title: string, maxLength = 75): string {
  if (!title) return '';
  if (title.length <= maxLength) return title;

  const cut = title.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return trimmed.replace(/[\s.,!?;:]$/, '') + '…';
}
