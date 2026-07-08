import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'vino_viewer_id';

export function useViewerId(): string {
  if (import.meta.server) {
    return '';
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const id = uuidv4();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage может быть недоступен (приватный режим, блокировка и т.д.)
    return uuidv4();
  }
}
