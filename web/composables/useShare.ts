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

export function useShare() {
  function open(url: string, title: string = '') {
    state.url = url;
    state.title = title;
    state.active = true;
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
