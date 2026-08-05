<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const route = useRoute();
const { user } = useAuth();
const { items } = useCmsNavigation();

const userLabel = computed(
  () => user.value?.displayName || user.value?.username || user.value?.email || 'Пользователь',
);

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
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="closeSidebar"
    />

    <aside
      class="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col border-r border-foreground/10 bg-background transition-transform lg:translate-x-0"
      :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="border-b border-foreground/10 px-5 py-4">
        <div class="text-[11px] font-normal uppercase tracking-[0.2em] text-foreground/45">
          CMS
        </div>
        <div class="mt-2 font-heading text-xl font-bold">Виноделие Сегодня</div>
        <div class="mt-2 text-sm text-foreground/60">{{ userLabel }}</div>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <div v-for="item in items" :key="item.to" class="mb-2">
          <NuxtLink
            :to="item.to"
            class="flex items-center justify-between rounded px-3 py-2.5 text-sm transition"
            :class="isActive(item.to) ? 'bg-accent text-black' : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground'"
            @click="closeSidebar"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>

          <div
            v-if="item.children?.length"
            class="mt-1 space-y-1 border-l border-foreground/10 pl-3"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="block rounded px-3 py-2 text-xs transition"
              :class="isActive(child.to) ? 'bg-foreground/8 text-foreground' : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'"
              @click="closeSidebar"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="border-t border-foreground/10 px-4 py-4 text-xs text-foreground/55">
        <NuxtLink to="/account" class="hover:text-foreground">Личный кабинет</NuxtLink>
      </div>
    </aside>
  </div>
</template>
