<script setup lang="ts">
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

const { user, isAuthenticated } = useAuth();
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = useApi();

const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref('');
const message = ref('');
const showModal = ref(false);
const editing = ref<Category | null>(null);
const form = reactive({
  name: '',
  slug: '',
  parentId: '',
});

async function fetchCategories() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminCategories() as Category[];
    categories.value = Array.isArray(res) ? res : [];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки рубрик';
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.name = '';
  form.slug = '';
  form.parentId = '';
  showModal.value = true;
}

function openEdit(item: Category) {
  editing.value = item;
  form.name = item.name;
  form.slug = item.slug;
  form.parentId = item.parentId || '';
  showModal.value = true;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fillSlug() {
  if (!editing.value && !form.slug && form.name) {
    form.slug = slugify(form.name);
  }
}

async function save() {
  error.value = '';
  message.value = '';
  try {
    const body: Record<string, any> = {
      name: form.name.trim(),
      slug: form.slug.trim(),
    };
    if (form.parentId) body.parentId = form.parentId;

    if (editing.value) {
      await updateCategory(editing.value.id, body);
      message.value = 'Рубрика обновлена';
    } else {
      await createCategory(body);
      message.value = 'Рубрика создана';
    }
    showModal.value = false;
    await fetchCategories();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения рубрики';
  }
}

async function remove(item: Category) {
  if (!confirm(`Удалить рубрику «${item.name}»?`)) return;
  error.value = '';
  message.value = '';
  try {
    await deleteCategory(item.id);
    message.value = 'Рубрика удалена';
    await fetchCategories();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка удаления рубрики';
  }
}

function parentName(id?: string | null) {
  if (!id) return '—';
  const parent = categories.value.find((c) => c.id === id);
  return parent ? parent.name : '—';
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchCategories();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Рубрики</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 flex items-center justify-between">
      <button class="btn-primary" @click="openCreate">＋ Добавить рубрику</button>
      <button class="text-sm text-accent hover:underline" @click="fetchCategories">Обновить</button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading && categories.length" class="mt-6 overflow-x-auto">
      <table class="w-full border-collapse border border-foreground/10 text-sm">
        <thead class="bg-foreground/10">
          <tr>
            <th class="border border-foreground/10 px-4 py-2 text-left">Название</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Slug</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Родитель</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in categories" :key="item.id" class="bg-foreground/5">
            <td class="border border-foreground/10 px-4 py-2">{{ item.name }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ item.slug }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ parentName(item.parentId) }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              <div class="flex flex-wrap gap-2">
                <button class="text-xs text-foreground/70 hover:underline" @click="openEdit(item)">Изменить</button>
                <button class="text-xs text-red-600 hover:underline" @click="remove(item)">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !categories.length" class="mt-6 text-sm text-foreground/60">Нет рубрик</p>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" @click.self="showModal = false">
          <Transition name="slide">
            <div v-if="showModal" class="relative mt-8 w-full max-w-md overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl">
              <div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <h2 class="text-lg font-bold">{{ editing ? 'Редактировать рубрику' : 'Добавить рубрику' }}</h2>
                <button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" @click="showModal = false">✕</button>
              </div>
              <div class="space-y-4 p-6">
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Название <span class="text-red-600">*</span></label>
                  <input v-model="form.name" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Например, Российское виноделие" @input="fillSlug">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Slug <span class="text-red-600">*</span></label>
                  <input v-model="form.slug" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="rossiyskoe-vinodelie">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Родительская рубрика</label>
                  <select v-model="form.parentId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                    <option value="">— нет —</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id" :disabled="editing && c.id === editing.id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button class="btn-secondary" @click="showModal = false">Отмена</button>
                  <button class="btn-primary" @click="save">Сохранить</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-15px); }
</style>
