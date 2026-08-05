<script setup lang="ts">
const { user } = useAuth();
const route = useRoute();
const { isCmsRoute } = useUiContext();

const canCreate = computed(() => ['admin', 'editor', 'author'].includes(user.value?.role || ''));

const activeType = ref('all');
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
  if (route.path === '/account/editor') {
    navigateTo({ path: '/cms/editor', query: route.query });
    return;
  }
  if (!canCreate.value) {
    navigateTo('/account');
    return;
  }
  const editId = route.query.id;
  if (editId && typeof editId === 'string') {
    editingId.value = editId;
  }
  const editType = route.query.type;
  if (editType && typeof editType === 'string') {
    activeType.value = editType;
  }
});
</script>

<template>
  <div class="w-full overflow-x-hidden py-8">
    <div v-if="user" class="space-y-8">
      <div>
        <template v-if="isCmsRoute">
          <CmsPageHeader
            eyebrow="CMS"
            title="Материалы"
            description="Редактор материалов, список последних записей и быстрый доступ к созданию и правке."
          />
        </template>
        <template v-else>
          <h1 class="mb-2 font-heading text-2xl font-bold">Личный кабинет</h1>
          <AccountTabs class="mb-6" />
        </template>
      </div>
      <div v-if="canCreate" class="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <EditorSidebar
          ref="sidebarRef"
          class="min-w-0"
          :active-type="activeType"
          @select-type="selectType"
          @new-material="newMaterial"
          @select-material="selectMaterial"
        />
        <section class="min-w-0 overflow-x-hidden border border-foreground/10 bg-card p-4 shadow-sm md:p-6">
          <EditorPanel :type="activeType === 'all' ? undefined : activeType" :draft-id="editingId" @saved="onSaved" />
        </section>
      </div>
    </div>
  </div>
</template>
