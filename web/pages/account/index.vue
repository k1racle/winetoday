<script setup lang="ts">
const { user, isAuthenticated } = useAuth();

const canCreate = computed(() => ['admin', 'editor', 'author'].includes(user.value?.role || ''));

const activeType = ref('article');
const editingId = ref('');
const sidebarRef = ref<any>(null);

function selectType(type: string) {
  activeType.value = type;
  editingId.value = '';
}

function newMaterial() {
  editingId.value = '';
}

function selectMaterial(item: any) {
  activeType.value = item.type;
  editingId.value = item.id;
}

function onSaved(id: string) {
  editingId.value = id;
  sidebarRef.value?.load();
}

onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/');
  }
});
</script>

<template>
  <div class="mx-auto max-w-[1600px] px-4 py-10">
    <div v-if="user" class="space-y-8">
      <!-- Editor workspace -->
      <div v-if="canCreate" class="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
        <EditorSidebar
          ref="sidebarRef"
          :active-type="activeType"
          @select-type="selectType"
          @new-material="newMaterial"
          @select-material="selectMaterial"
        />
        <section class="border border-foreground/10 bg-card p-4 shadow-sm md:p-6">
          <EditorPanel :type="activeType" :draft-id="editingId" @saved="onSaved" />
        </section>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <!-- Profile -->
        <section class="border border-foreground/10 bg-card p-6 shadow-sm md:col-span-2">
          <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Настройки
          </p>
          <h2 class="mt-2 font-heading text-xl font-bold">Профиль</h2>
          <div class="mt-4 space-y-3 text-sm">
            <p>
              <span class="text-foreground/60">Email:</span>
              {{ user.email }}
            </p>
            <p v-if="user.username">
              <span class="text-foreground/60">Логин:</span>
              {{ user.username }}
            </p>
            <p v-if="user.displayName">
              <span class="text-foreground/60">Отображаемое имя:</span>
              {{ user.displayName }}
            </p>
          </div>
        </section>

        <!-- Admin panel -->
        <section
          v-if="user.role === 'admin'"
          class="border border-foreground/10 bg-card p-6 shadow-sm"
        >
          <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Администрирование
          </p>
          <h2 class="mt-2 font-heading text-xl font-bold">Пользователи</h2>
          <p class="mt-2 text-sm text-foreground/70">
            Управляйте ролями пользователей.
          </p>
          <div class="mt-4">
            <NuxtLink
              to="/account/admin"
              class="inline-block bg-accent px-5 py-2.5 text-sm font-medium text-black transition hover:bg-accent/90"
            >
              Управление пользователями
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
