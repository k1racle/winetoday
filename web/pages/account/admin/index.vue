<script setup lang="ts">
import type { AuthUser } from '~/composables/useAuth';

interface AdminUser extends AuthUser {
  createdAt: string;
  authorId?: string | null;
}

interface Material {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt?: string | null;
}

const { user, isAuthenticated } = useAuth();
const { getUsers, createUser, updateUser, deleteUser, updateUserRole, getEditorMaterials } = useApi();

const users = ref<AdminUser[]>([]);
const loading = ref(false);
const error = ref('');
const message = ref('');

const roles = ['member', 'editor', 'author', 'admin'];
const roleLabels: Record<string, string> = {
  member: 'Читатель',
  author: 'Автор',
  editor: 'Редактор',
  admin: 'Админ',
};

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  in_review: 'На проверке',
  published: 'Опубликовано',
  rejected: 'Отклонено',
};

const typeLabels: Record<string, string> = {
  article: 'Статья',
  news: 'Новость',
  video: 'Видео',
  gallery: 'Галерея',
};

// Create / edit modal
const showUserModal = ref(false);
const editingUser = ref<AdminUser | null>(null);
const userForm = reactive({
  email: '',
  username: '',
  displayName: '',
  role: 'member',
  password: '',
});

// Materials modal
const showMaterialsModal = ref(false);
const materialsUser = ref<AdminUser | null>(null);
const materials = ref<Material[]>([]);
const materialsLoading = ref(false);

async function fetchUsers() {
  loading.value = true;
  error.value = '';
  try {
    users.value = await getUsers() as AdminUser[];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки пользователей';
  } finally {
    loading.value = false;
  }
}

function openCreateUser() {
  editingUser.value = null;
  userForm.email = '';
  userForm.username = '';
  userForm.displayName = '';
  userForm.role = 'member';
  userForm.password = '';
  showUserModal.value = true;
}

function openEditUser(u: AdminUser) {
  editingUser.value = u;
  userForm.email = u.email || '';
  userForm.username = u.username || '';
  userForm.displayName = u.displayName || '';
  userForm.role = u.role;
  userForm.password = '';
  showUserModal.value = true;
}

async function saveUser() {
  error.value = '';
  message.value = '';
  try {
    const body: Record<string, string> = {
      email: userForm.email,
      role: userForm.role,
    };
    if (userForm.username.trim()) body.username = userForm.username.trim();
    if (userForm.displayName.trim()) body.displayName = userForm.displayName.trim();
    if (userForm.password) body.password = userForm.password;

    if (editingUser.value) {
      await updateUser(editingUser.value.id, body);
      message.value = 'Пользователь обновлён';
    } else {
      if (!userForm.password) {
        error.value = 'Укажите пароль для нового пользователя';
        return;
      }
      await createUser({ ...body, password: userForm.password });
      message.value = 'Пользователь создан';
    }
    showUserModal.value = false;
    await fetchUsers();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения пользователя';
  }
}

async function removeUser(u: AdminUser) {
  if (!confirm(`Удалить пользователя ${u.username || u.email}? Это действие необратимо.`)) return;
  error.value = '';
  message.value = '';
  try {
    await deleteUser(u.id);
    message.value = 'Пользователь удалён';
    await fetchUsers();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка удаления пользователя';
  }
}

async function changeRole(userId: string, newRole: string) {
  message.value = '';
  error.value = '';
  try {
    await updateUserRole(userId, newRole);
    message.value = 'Роль обновлена';
    await fetchUsers();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка обновления роли';
  }
}

async function openMaterials(u: AdminUser) {
  materialsUser.value = u;
  showMaterialsModal.value = true;
  materialsLoading.value = true;
  materials.value = [];
  try {
    if (!u.authorId) {
      materials.value = [];
    } else {
      const res: any = await getEditorMaterials({ authorId: u.authorId, limit: 10000 });
      materials.value = Array.isArray(res?.items) ? res.items : [];
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки материалов';
  } finally {
    materialsLoading.value = false;
  }
}

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchUsers();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-medium uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Пользователи</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <div class="mt-6 flex items-center justify-between">
      <div class="flex gap-4">
        <button class="btn-primary" @click="openCreateUser">＋ Добавить пользователя</button>
      </div>
      <button class="text-sm text-accent hover:underline" @click="fetchUsers">Обновить</button>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading && users.length" class="mt-6 overflow-x-auto">
      <table class="w-full border-collapse border border-foreground/10 text-sm">
        <thead class="bg-foreground/10">
          <tr>
            <th class="border border-foreground/10 px-4 py-2 text-left">Логин</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Email</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Имя</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Роль</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Создан</th>
            <th class="border border-foreground/10 px-4 py-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="bg-foreground/5">
            <td class="border border-foreground/10 px-4 py-2">{{ u.username || '—' }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ u.email }}</td>
            <td class="border border-foreground/10 px-4 py-2">{{ u.displayName || '—' }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              <select
                :value="u.role"
                class="border border-foreground/10 bg-card px-2 py-1 outline-none focus:border-accent"
                @change="changeRole(u.id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="role in roles" :key="role" :value="role">
                  {{ roleLabels[role] || role }}
                </option>
              </select>
            </td>
            <td class="border border-foreground/10 px-4 py-2">{{ new Date(u.createdAt).toLocaleDateString('ru-RU') }}</td>
            <td class="border border-foreground/10 px-4 py-2">
              <div class="flex flex-wrap gap-2">
                <NuxtLink :to="`/account/admin/users/${u.id}`" class="text-xs text-accent hover:underline">Профиль</NuxtLink>
                <button class="text-xs text-foreground/70 hover:underline" @click="openEditUser(u)">Изменить</button>
                <button class="text-xs text-red-600 hover:underline" @click="removeUser(u)">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !users.length" class="mt-6 text-sm text-foreground/60">Нет пользователей</p>

    <!-- User create/edit modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" @click.self="showUserModal = false">
          <Transition name="slide">
            <div v-if="showUserModal" class="relative mt-8 w-full max-w-md overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl">
              <div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <h2 class="text-lg font-bold">{{ editingUser ? 'Редактировать пользователя' : 'Добавить пользователя' }}</h2>
                <button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" @click="showUserModal = false">✕</button>
              </div>
              <div class="space-y-4 p-6">
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Email <span class="text-red-600">*</span></label>
                  <input v-model="userForm.email" type="email" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="user@example.com">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Логин</label>
                  <input v-model="userForm.username" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="username">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Отображаемое имя</label>
                  <input v-model="userForm.displayName" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Иван Иванов">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Роль</label>
                  <select v-model="userForm.role" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                    <option v-for="role in roles" :key="role" :value="role">{{ roleLabels[role] || role }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-foreground/70">Пароль {{ editingUser ? '(оставьте пустым, чтобы не менять)' : '*' }}</label>
                  <input v-model="userForm.password" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Минимум 6 символов">
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button class="btn-secondary" @click="showUserModal = false">Отмена</button>
                  <button class="btn-primary" @click="saveUser">Сохранить</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Materials modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showMaterialsModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" @click.self="showMaterialsModal = false">
          <Transition name="slide">
            <div v-if="showMaterialsModal" class="relative mt-8 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 shadow-2xl">
              <div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <h2 class="text-lg font-bold">Материалы: {{ materialsUser?.username || materialsUser?.email }}</h2>
                <button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" @click="showMaterialsModal = false">✕</button>
              </div>
              <div class="overflow-y-auto p-6">
                <p v-if="materialsLoading" class="text-sm text-foreground/60">Загрузка...</p>
                <div v-else-if="!materials.length" class="text-sm text-foreground/60">Нет материалов</div>
                <table v-else class="w-full border-collapse border border-foreground/10 text-sm">
                  <thead class="bg-foreground/10">
                    <tr>
                      <th class="border border-foreground/10 px-3 py-2 text-left">Тип</th>
                      <th class="border border-foreground/10 px-3 py-2 text-left">Заголовок</th>
                      <th class="border border-foreground/10 px-3 py-2 text-left">Статус</th>
                      <th class="border border-foreground/10 px-3 py-2 text-left">Обновлено</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="m in materials" :key="m.id" class="bg-foreground/5">
                      <td class="border border-foreground/10 px-3 py-2">{{ typeLabels[m.type] || m.type }}</td>
                      <td class="border border-foreground/10 px-3 py-2">{{ m.title }}</td>
                      <td class="border border-foreground/10 px-3 py-2">{{ statusLabels[m.status] || m.status }}</td>
                      <td class="border border-foreground/10 px-3 py-2">{{ formatDate(m.updatedAt) }}</td>
                    </tr>
                  </tbody>
                </table>
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
