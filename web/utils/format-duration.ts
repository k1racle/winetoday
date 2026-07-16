export function formatDuration(totalSeconds?: number | null): string {
  if (totalSeconds == null || totalSeconds <= 0) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')];
  if (hours > 0) {
    parts.unshift(hours.toString());
  }
  return parts.join(':');
}

export function parseDuration(value?: string | null): number | null {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim().replace(/,/g, '.');
  // H:MM:SS, HH:MM:SS, MM:SS
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(cleaned)) {
    const [h, m, s] = cleaned.split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }
  if (/^\d{1,3}:\d{2}$/.test(cleaned)) {
    const [m, s] = cleaned.split(':').map(Number);
    return (m || 0) * 60 + (s || 0);
  }
  const n = Number(cleaned);
  if (!isNaN(n) && n >= 0) return Math.round(n);
  return null;
}
