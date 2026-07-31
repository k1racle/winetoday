declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

export function useYm() {
  const config = useRuntimeConfig();
  const route = useRoute();
  const ymId = Number(config.public.ymId) || 108722624;

  function goal(name: string) {
    if (import.meta.server) return;
    if (route.path.startsWith('/account')) return;
    try {
      if (typeof window.ym === 'function') {
        window.ym(ymId, 'reachGoal', name);
      }
    } catch {
      // ignore
    }
  }

  function event(name: string, params?: Record<string, unknown>) {
    if (import.meta.server) return;
    if (route.path.startsWith('/account')) return;
    try {
      if (typeof window.ym === 'function') {
        window.ym(ymId, 'reachGoal', name, params);
      }
    } catch {
      // ignore
    }
  }

  return { ymId, goal, event };
}
