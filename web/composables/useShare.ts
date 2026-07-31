import type { ComponentPublicInstance } from 'vue';

interface ShareState {
  active: boolean;
  url: string;
  title: string;
}

const state = reactive<ShareState>({
  active: false,
  url: '',
  title: '',
});

export function buildShareUtmUrl(url: string, source: string, medium: string): string {
  const withUtm = appendUtm(url, source, medium, 'share');
  try {
    const u = new URL(withUtm);
    u.searchParams.set('utm_content', 'share_button');
    return u.toString();
  } catch {
    return withUtm;
  }
}

export function buildShareCopyUrl(url: string): string {
  return appendUtm(url, 'copy', 'referral', 'share');
}

export function useShare() {
  const { goal } = useYm();

  function open(url: string, title: string = '') {
    state.url = url;
    state.title = title;
    state.active = true;
    goal('share');
  }

  function close() {
    state.active = false;
  }

  return {
    active: toRef(state, 'active'),
    url: toRef(state, 'url'),
    title: toRef(state, 'title'),
    open,
    close,
  };
}
