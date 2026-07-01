import { v4 as uuidv4 } from 'uuid';

export function useViewerId(): string {
  if (import.meta.server) {
    return '';
  }

  const stored = localStorage.getItem('vino_viewer_id');
  if (stored) {
    return stored;
  }

  const id = uuidv4();
  localStorage.setItem('vino_viewer_id', id);
  return id;
}
