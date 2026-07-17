<script setup lang="ts">
import {
  SOCIAL_PLATFORMS,
  resolveSavedSocialIcon,
  resolveSocialIconKey,
} from '~/utils/social-icons';

interface SocialLink {
  label: string;
  href: string;
  icon: string;
  platform: string;
}

const { user, isAuthenticated } = useAuth();
const { getSocialLinks, updateSocialLinks } = useApi();

const title = ref('');
const links = ref<SocialLink[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const message = ref('');

function inferPlatform(icon: string, label: string, href: string): string {
  if (icon && icon !== 'link' && !icon.includes('<svg')) {
    return icon;
  }
  return resolveSocialIconKey(null, label, href) || '';
}

async function fetchLinks() {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await getSocialLinks();
    title.value = res?.title || '';
    links.value = Array.isArray(res?.links)
      ? res.links.map((l: any) => {
          const icon = typeof l.icon === 'string' ? l.icon : '';
          return {
            label: l.label || '',
            href: l.href || '',
            icon,
            platform: inferPlatform(icon, l.label || '', l.href || ''),
          };
        })
      : [];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки соцсетей';
  } finally {
    loading.value = false;
  }
}

function addLink() {
  links.value.push({ label: '', href: '', icon: '', platform: '' });
}

function removeLink(index: number) {
  links.value.splice(index, 1);
}

function setPlatform(index: number, platformId: string) {
  const link = links.value[index];
  link.platform = platformId;
  if (platformId) {
    link.icon = platformId;
    const preset = SOCIAL_PLATFORMS.find((item) => item.id === platformId);
    if (preset && !link.label.trim()) {
      link.label = preset.label;
    }
  }
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const payload = {
      title: title.value.trim(),
      links: links.value
        .map((l) => ({
          label: l.label.trim(),
          href: l.href.trim(),
          icon: resolveSavedSocialIcon(l.icon, l.label, l.href, l.platform),
        }))
        .filter((l) => l.label && l.href && l.icon && l.icon !== 'link'),
    };
    await updateSocialLinks(payload);
    message.value = 'Соцсети сохранены';
    await fetchLinks();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения соцсетей';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchLinks();
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 border-b border-foreground/10 pb-4">
      <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Администрирование</p>
      <h1 class="mt-2 font-heading text-2xl font-bold">Социальные сети</h1>
    </div>

    <NuxtLink to="/account" class="text-sm text-accent hover:underline">← Назад в кабинет</NuxtLink>

    <AdminTabs class="mt-6" />

    <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

    <div v-if="!loading" class="mt-6 space-y-6">
      <div>
        <label class="mb-1 block text-xs font-normal text-foreground/70">Заголовок блока</label>
        <input v-model="title" type="text" class="w-full max-w-md border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Например, Мы в соцсетях">
      </div>

      <p class="text-sm text-foreground/60">
        Логотипы берутся из папки <code class="rounded bg-foreground/5 px-1 py-0.5">winetoday/icons</code> (файлы вида <code class="rounded bg-foreground/5 px-1 py-0.5">telegram-1.svg</code>).
      </p>

      <div class="space-y-4">
        <div v-for="(link, index) in links" :key="index" class="flex flex-col gap-4 rounded border border-foreground/10 bg-foreground/5 p-4 md:flex-row md:items-end">
          <div class="w-full md:w-56">
            <label class="mb-1 block text-xs font-normal text-foreground/70">Платформа</label>
            <select
              :value="link.platform"
              class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              @change="setPlatform(index, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Выберите платформу</option>
              <option v-for="platform in SOCIAL_PLATFORMS" :key="platform.id" :value="platform.id">
                {{ platform.label }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="mb-1 block text-xs font-normal text-foreground/70">Название</label>
            <input v-model="link.label" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="YouTube">
          </div>
          <div class="flex-[2]">
            <label class="mb-1 block text-xs font-normal text-foreground/70">Ссылка</label>
            <input v-model="link.href" type="url" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="https://youtube.com/@channel">
          </div>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-foreground/10 bg-[#0B3D2E] p-1">
              <SocialIcon
                v-if="link.platform"
                :name="link.platform"
                :label="link.label"
                :href="link.href"
                variant="white"
                class="h-full w-full"
              />
            </div>
            <button class="text-sm text-red-600 hover:underline" @click="removeLink(index)">Удалить</button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button class="btn-primary" @click="addLink">＋ Добавить соцсеть</button>
        <button class="btn-secondary" :disabled="saving" @click="save">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-normal text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
</style>
