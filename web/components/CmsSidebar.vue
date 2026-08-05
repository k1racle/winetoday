<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const route = useRoute();
const { user } = useAuth();
const { sections } = useCmsNavigation();

const userLabel = computed(
  () => user.value?.displayName || user.value?.username || user.value?.email || 'Пользователь',
);

const roleLabelMap: Record<string, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  author: 'Автор',
};

const roleLabel = computed(() => {
  const role = user.value?.role || '';
  return roleLabelMap[role] || 'Команда';
});

function isActive(to: string) {
  if (to === '/cms') {
    return route.path === to;
  }
  return route.path === to || route.path.startsWith(`${to}/`);
}

function closeSidebar() {
  emit('update:modelValue', false);
}
</script>

<template>
  <div>
    <div
      v-if="modelValue"
      class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
    />

    <aside
      class="fixed left-0 top-0 z-40 flex h-screen w-[320px] flex-col border-r border-white/10 bg-[#08131d]/95 text-white shadow-[24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform lg:translate-x-0"
      :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="border-b border-white/10 px-5 pb-5 pt-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-[11px] uppercase tracking-[0.24em] text-white/45">
              Редакционная CMS
            </div>
            <div class="mt-2 font-heading text-[26px] font-bold leading-none text-white">
              Виноделие Сегодня
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span class="rounded-full border border-accent/20 bg-accent/15 px-2.5 py-1 text-accent">
                {{ roleLabel }}
              </span>
              <span class="rounded-full border border-white/10 px-2.5 py-1 text-white/55">
                Основной сайт
              </span>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-white/70 transition hover:border-white/20 hover:text-white lg:hidden"
            @click="closeSidebar"
          >
            ×
          </button>
        </div>

        <div class="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.18em] text-white/35">Профиль</div>
          <div class="mt-1 truncate text-sm text-white">{{ userLabel }}</div>
          <div class="mt-3 flex items-center gap-2 text-xs">
            <NuxtLink
              to="/account"
              class="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 text-white/65 transition hover:border-white/20 hover:text-white"
              @click="closeSidebar"
            >
              Аккаунт
            </NuxtLink>
            <NuxtLink
              to="/"
              class="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 text-white/65 transition hover:border-white/20 hover:text-white"
              @click="closeSidebar"
            >
              Сайт
            </NuxtLink>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <section v-for="section in sections" :key="section.label">
          <div class="mb-2 px-3 text-[11px] uppercase tracking-[0.2em] text-white/30">
            {{ section.label }}
          </div>

          <div class="space-y-1.5">
            <div v-for="item in section.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="group flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition"
                :class="isActive(item.to)
                  ? 'bg-accent text-black shadow-[0_12px_30px_rgba(204,244,79,0.2)]'
                  : 'text-white/74 hover:bg-white/6 hover:text-white'"
                @click="closeSidebar"
              >
                <span class="font-medium">{{ item.label }}</span>
                <span
                  class="h-2 w-2 rounded-full transition"
                  :class="isActive(item.to) ? 'bg-black/75' : 'bg-white/15 group-hover:bg-accent/70'"
                />
              </NuxtLink>

              <div
                v-if="item.children?.length"
                class="ml-3 mt-2 space-y-1 border-l border-white/10 pl-4"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="block rounded-xl px-3 py-2 text-xs transition"
                  :class="isActive(child.to)
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'"
                  @click="closeSidebar"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>
      </nav>

      <div class="border-t border-white/10 px-5 py-4 text-xs text-white/45">
        Редакционный интерфейс и служебные настройки сайта.
      </div>
    </aside>
  </div>
</template>
