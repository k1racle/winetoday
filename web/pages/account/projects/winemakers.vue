<script setup lang="ts">
import type { WinemakersHomeConfig } from '~/types/winemakers';
import type { MediaAsset } from '~/types/media';
import { defaultWinemakersHomeConfig, normalizeWinemakersHomeConfig } from '~/utils/winemakersHome';

type EntityType = 'person' | 'wine' | 'region' | 'terroir' | 'winery';
type ProjectSection = 'home' | EntityType;

interface EntityOption {
  id: string;
  slug: string;
  name: string;
  status: string;
}

interface ListItem {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  status: string;
  updatedAt?: string;
  featured?: boolean;
  photo?: MediaAsset | null;
  logo?: MediaAsset | null;
  winery?: EntityOption | null;
  region?: EntityOption | null;
  parent?: EntityOption | null;
}

interface EntityOptionsPayload {
  persons: EntityOption[];
  wines: EntityOption[];
  regions: EntityOption[];
  terroirs: EntityOption[];
  wineries: EntityOption[];
}

const {
  getAdminSiteSettings,
  updateSiteSettings,
  getAdminWinemakersOptions,
  getAdminWinemakersPersons,
  getAdminWinemakersPerson,
  createAdminWinemakersPerson,
  updateAdminWinemakersPerson,
  deleteAdminWinemakersPerson,
  getAdminWinemakersWines,
  getAdminWinemakersWine,
  createAdminWinemakersWine,
  updateAdminWinemakersWine,
  deleteAdminWinemakersWine,
  getAdminWinemakersRegions,
  getAdminWinemakersRegion,
  createAdminWinemakersRegion,
  updateAdminWinemakersRegion,
  deleteAdminWinemakersRegion,
  getAdminWinemakersTerroirs,
  getAdminWinemakersTerroir,
  createAdminWinemakersTerroir,
  updateAdminWinemakersTerroir,
  deleteAdminWinemakersTerroir,
  getAdminWinemakersWineries,
  getAdminWinemakersWinery,
  createAdminWinemakersWinery,
  updateAdminWinemakersWinery,
  deleteAdminWinemakersWinery,
} = useApi();

const { user, isAuthenticated } = useAuth();
const route = useRoute();
const { isCmsRoute } = useUiContext();
const config = useRuntimeConfig();
const mediaBaseUrl = (config.public.mediaBaseUrl || (config.public.apiUrl as string).replace('/api', '') || '').replace(/\/$/, '');

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mediaUrl(path?: string | null) {
  if (!path) return '';
  return `${mediaBaseUrl}${path}`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU');
}

function createEditor(entity: EntityType = 'person') {
  return {
    entity,
    id: '',
    name: '',
    slug: '',
    summary: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    photoId: '',
    photoPath: '',
    birthYear: null as number | null,
    deathYear: null as number | null,
    wineryId: '',
    featured: false,
    sortOrder: 0,
    bioBlocks: [] as any[],
    career: [] as Array<{ from: string; to: string; role: string; place: string; note: string }>,
    relations: [] as Array<{ relatedId: string; type: string }>,
    wineType: '',
    style: '',
    vintage: null as number | null,
    grapes: '',
    regionId: '',
    terroirId: '',
    description: [] as any[],
    winemakers: [] as Array<{ personId: string; role: string }>,
    parentId: '',
    climate: '',
    soil: '',
    lat: null as number | null,
    lng: null as number | null,
    exposition: '',
    elevationM: null as number | null,
    foundedYear: null as number | null,
    logoId: '',
    logoPath: '',
  };
}

const entityTabs: Array<{ key: EntityType; label: string }> = [
  { key: 'person', label: 'Виноделы' },
  { key: 'wine', label: 'Вина' },
  { key: 'region', label: 'Регионы' },
  { key: 'terroir', label: 'Терруары' },
  { key: 'winery', label: 'Винодельни' },
];

const projectTabs: Array<{ key: ProjectSection; label: string }> = [
  { key: 'home', label: 'Главная' },
  ...entityTabs,
];

const relationTypeOptions = [
  { value: 'parent', label: 'Родитель / ребенок' },
  { value: 'spouse', label: 'Супруги' },
  { value: 'sibling', label: 'Сиблинги' },
  { value: 'founder', label: 'Основатель / преемник' },
];

const statusOptions = [
  { value: 'draft', label: 'Черновик' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'scheduled', label: 'Запланировано' },
  { value: 'rejected', label: 'Отклонено' },
];

const entityLabels: Record<EntityType, string> = {
  person: 'винодела',
  wine: 'вино',
  region: 'регион',
  terroir: 'терруар',
  winery: 'винодельню',
};

entityTabs.splice(
  0,
  entityTabs.length,
  { key: 'person', label: 'Виноделы' },
  { key: 'wine', label: 'Вина' },
  { key: 'region', label: 'Регионы' },
  { key: 'terroir', label: 'Терруары' },
  { key: 'winery', label: 'Винодельни' },
);

Object.assign(entityLabels, {
  person: 'винодела',
  wine: 'вино',
  region: 'регион',
  terroir: 'терруар',
  winery: 'винодельню',
});

const currentSection = ref<ProjectSection>('home');
const currentEntity = ref<EntityType>('person');
const options = ref<EntityOptionsPayload>({
  persons: [],
  wines: [],
  regions: [],
  terroirs: [],
  wineries: [],
});

const persons = ref<ListItem[]>([]);
const wines = ref<ListItem[]>([]);
const regions = ref<ListItem[]>([]);
const terroirs = ref<ListItem[]>([]);
const wineries = ref<ListItem[]>([]);

const loading = ref(false);
const error = ref('');
const message = ref('');
const featureForm = ref({
  winemakersEnabled: false,
});
const homeConfig = ref<WinemakersHomeConfig>(defaultWinemakersHomeConfig);
const savingHomeConfig = ref(false);
const showModal = ref(false);
const loadingEditor = ref(false);
const saving = ref(false);
const deleting = ref(false);
const photoPickerOpen = ref(false);
const logoPickerOpen = ref(false);
const editor = reactive(createEditor());

const currentItems = computed(() => {
  switch (currentEntity.value) {
    case 'wine':
      return wines.value;
    case 'region':
      return regions.value;
    case 'terroir':
      return terroirs.value;
    case 'winery':
      return wineries.value;
    default:
      return persons.value;
  }
});

const isHomeSection = computed(() => currentSection.value === 'home');

const publicPath = computed(() => {
  if (!editor.slug) return '';
  switch (editor.entity) {
    case 'wine':
      return `/wines/${editor.slug}`;
    case 'region':
      return `/regions/${editor.slug}`;
    case 'terroir':
      return `/terroirs/${editor.slug}`;
    case 'winery':
      return `/wineries/${editor.slug}`;
    default:
      return `/winemakers/${editor.slug}`;
  }
});

function setSection(section: ProjectSection) {
  currentSection.value = section;
  if (section !== 'home') {
    currentEntity.value = section;
  }
}

function setEntity(entity: EntityType) {
  currentSection.value = entity;
  currentEntity.value = entity;
}

function resetEditor(entity: EntityType) {
  Object.assign(editor, createEditor(entity));
}

function ensureSlug() {
  if (!editor.slug && editor.name) {
    editor.slug = slugify(editor.name);
  }
}

function applySeo(seo?: Record<string, any> | null) {
  editor.seoTitle = seo?.title || '';
  editor.seoDescription = seo?.description || '';
  editor.seoKeywords = seo?.keywords || '';
}

function addCareerItem() {
  editor.career.push({ from: '', to: '', role: '', place: '', note: '' });
}

function addRelationItem() {
  editor.relations.push({ relatedId: '', type: 'founder' });
}

function addWinemakerItem() {
  editor.winemakers.push({ personId: '', role: '' });
}

async function fetchAll() {
  loading.value = true;
  error.value = '';
  try {
    const [
      settingsRes,
      optionsRes,
      personsRes,
      winesRes,
      regionsRes,
      terroirsRes,
      wineriesRes,
    ] = await Promise.all([
      getAdminSiteSettings(),
      getAdminWinemakersOptions(),
      getAdminWinemakersPersons(),
      getAdminWinemakersWines(),
      getAdminWinemakersRegions(),
      getAdminWinemakersTerroirs(),
      getAdminWinemakersWineries(),
    ]);

    homeConfig.value = normalizeWinemakersHomeConfig((settingsRes as any)?.winemakersHomeConfig);
    featureForm.value.winemakersEnabled = !!(settingsRes as any)?.winemakersEnabled;
    options.value = optionsRes as EntityOptionsPayload;
    persons.value = Array.isArray(personsRes) ? personsRes as ListItem[] : [];
    wines.value = Array.isArray(winesRes) ? winesRes as ListItem[] : [];
    regions.value = Array.isArray(regionsRes) ? regionsRes as ListItem[] : [];
    terroirs.value = Array.isArray(terroirsRes) ? terroirsRes as ListItem[] : [];
    wineries.value = Array.isArray(wineriesRes) ? wineriesRes as ListItem[] : [];
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки раздела';
  } finally {
    loading.value = false;
  }
}

async function saveHomePageConfig() {
  savingHomeConfig.value = true;
  error.value = '';
  message.value = '';
  try {
    await updateSiteSettings({
      winemakersHomeConfig: homeConfig.value as unknown as Record<string, unknown>,
    });
    homeConfig.value = normalizeWinemakersHomeConfig(homeConfig.value);
    message.value = 'Настройки витрины сохранены';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения витрины';
  } finally {
    savingHomeConfig.value = false;
  }
}

async function saveProjectSettings() {
  savingHomeConfig.value = true;
  error.value = '';
  message.value = '';
  try {
    await updateSiteSettings({
      winemakersEnabled: featureForm.value.winemakersEnabled,
      winemakersHomeConfig: homeConfig.value as unknown as Record<string, unknown>,
    });
    homeConfig.value = normalizeWinemakersHomeConfig(homeConfig.value);
    message.value = featureForm.value.winemakersEnabled
      ? 'Спецпроект открыт для всех посетителей, настройки сохранены'
      : 'Спецпроект скрыт для посетителей, настройки сохранены';
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения настроек спецпроекта';
  } finally {
    savingHomeConfig.value = false;
  }
}

function openCreate(entity: EntityType) {
  currentSection.value = entity;
  currentEntity.value = entity;
  message.value = '';
  error.value = '';
  resetEditor(entity);
  showModal.value = true;
}

async function openEdit(entity: EntityType, id: string) {
  currentSection.value = entity;
  currentEntity.value = entity;
  showModal.value = true;
  loadingEditor.value = true;
  error.value = '';
  message.value = '';
  resetEditor(entity);
  try {
    let detail: any;
    if (entity === 'person') detail = await getAdminWinemakersPerson(id);
    else if (entity === 'wine') detail = await getAdminWinemakersWine(id);
    else if (entity === 'region') detail = await getAdminWinemakersRegion(id);
    else if (entity === 'terroir') detail = await getAdminWinemakersTerroir(id);
    else detail = await getAdminWinemakersWinery(id);

    editor.id = detail.id;
    editor.entity = entity;
    editor.name = detail.name || '';
    editor.slug = detail.slug || '';
    editor.summary = detail.summary || '';
    editor.status = detail.status || 'draft';
    applySeo(detail.seo || null);

    if (entity === 'person') {
      editor.photoId = detail.photoId || detail.photo?.id || '';
      editor.photoPath = detail.photo?.path || '';
      editor.birthYear = detail.birthYear ?? null;
      editor.deathYear = detail.deathYear ?? null;
      editor.wineryId = detail.wineryId || detail.winery?.id || '';
      editor.featured = Boolean(detail.featured);
      editor.sortOrder = detail.sortOrder ?? 0;
      editor.bioBlocks = Array.isArray(detail.bioBlocks) ? detail.bioBlocks : [];
      editor.career = Array.isArray(detail.career)
        ? detail.career.map((item: any) => ({
            from: item?.from?.toString?.() || '',
            to: item?.to?.toString?.() || '',
            role: item?.role || '',
            place: item?.place || '',
            note: item?.note || '',
          }))
        : [];
      editor.relations = Array.isArray(detail.relationsFrom)
        ? detail.relationsFrom.map((item: any) => ({
            relatedId: item.relatedId || item.related?.id || '',
            type: item.type || 'founder',
          }))
        : [];
    } else if (entity === 'wine') {
      editor.wineType = detail.type || '';
      editor.style = detail.style || '';
      editor.vintage = detail.vintage ?? null;
      editor.grapes = Array.isArray(detail.grapes) ? detail.grapes.join(', ') : '';
      editor.wineryId = detail.wineryId || detail.winery?.id || '';
      editor.regionId = detail.regionId || detail.region?.id || '';
      editor.terroirId = detail.terroirId || detail.terroir?.id || '';
      editor.description = Array.isArray(detail.description) ? detail.description : [];
      editor.winemakers = Array.isArray(detail.winemakers)
        ? detail.winemakers.map((item: any) => ({
            personId: item.personId || item.person?.id || '',
            role: item.role || '',
          }))
        : [];
    } else if (entity === 'region') {
      editor.parentId = detail.parentId || detail.parent?.id || '';
      editor.description = Array.isArray(detail.description) ? detail.description : [];
      editor.climate = detail.climate || '';
      editor.soil = detail.soil || '';
      editor.lat = detail.lat ?? null;
      editor.lng = detail.lng ?? null;
    } else if (entity === 'terroir') {
      editor.regionId = detail.regionId || detail.region?.id || '';
      editor.exposition = detail.exposition || '';
      editor.elevationM = detail.elevationM ?? null;
      editor.soil = detail.soil || '';
      editor.description = Array.isArray(detail.description) ? detail.description : [];
      editor.lat = detail.lat ?? null;
      editor.lng = detail.lng ?? null;
    } else {
      editor.logoId = detail.logoId || detail.logo?.id || '';
      editor.logoPath = detail.logo?.path || '';
      editor.foundedYear = detail.foundedYear ?? null;
      editor.regionId = detail.regionId || detail.region?.id || '';
      editor.description = Array.isArray(detail.description) ? detail.description : [];
      editor.lat = detail.lat ?? null;
      editor.lng = detail.lng ?? null;
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка загрузки сущности';
  } finally {
    loadingEditor.value = false;
  }
}

function buildSeo() {
  return {
    title: editor.seoTitle.trim() || undefined,
    description: editor.seoDescription.trim() || undefined,
    keywords: editor.seoKeywords.trim() || undefined,
  };
}

function buildPayload() {
  if (editor.entity === 'person') {
    return {
      name: editor.name.trim(),
      slug: editor.slug.trim(),
      summary: editor.summary.trim() || undefined,
      status: editor.status,
      seo: buildSeo(),
      photoId: editor.photoId || undefined,
      birthYear: editor.birthYear ?? undefined,
      deathYear: editor.deathYear ?? undefined,
      wineryId: editor.wineryId || undefined,
      featured: editor.featured,
      sortOrder: editor.sortOrder || 0,
      bioBlocks: editor.bioBlocks,
      career: editor.career
        .filter((item) => item.from || item.to || item.role || item.place || item.note)
        .map((item) => ({
          from: item.from || undefined,
          to: item.to || undefined,
          role: item.role || undefined,
          place: item.place || undefined,
          note: item.note || undefined,
        })),
      relations: editor.relations
        .filter((item) => item.relatedId)
        .map((item) => ({
          relatedId: item.relatedId,
          type: item.type || 'founder',
        })),
    };
  }

  if (editor.entity === 'wine') {
    return {
      name: editor.name.trim(),
      slug: editor.slug.trim(),
      summary: editor.summary.trim() || undefined,
      status: editor.status,
      seo: buildSeo(),
      type: editor.wineType.trim() || undefined,
      style: editor.style.trim() || undefined,
      vintage: editor.vintage ?? undefined,
      grapes: editor.grapes.split(',').map((item) => item.trim()).filter(Boolean),
      wineryId: editor.wineryId || undefined,
      regionId: editor.regionId || undefined,
      terroirId: editor.terroirId || undefined,
      description: editor.description,
      winemakers: editor.winemakers
        .filter((item) => item.personId)
        .map((item) => ({
          personId: item.personId,
          role: item.role.trim() || undefined,
        })),
    };
  }

  if (editor.entity === 'region') {
    return {
      name: editor.name.trim(),
      slug: editor.slug.trim(),
      summary: editor.summary.trim() || undefined,
      status: editor.status,
      seo: buildSeo(),
      parentId: editor.parentId || undefined,
      description: editor.description,
      climate: editor.climate.trim() || undefined,
      soil: editor.soil.trim() || undefined,
      lat: editor.lat ?? undefined,
      lng: editor.lng ?? undefined,
    };
  }

  if (editor.entity === 'terroir') {
    return {
      name: editor.name.trim(),
      slug: editor.slug.trim(),
      summary: editor.summary.trim() || undefined,
      status: editor.status,
      seo: buildSeo(),
      regionId: editor.regionId || undefined,
      exposition: editor.exposition.trim() || undefined,
      elevationM: editor.elevationM ?? undefined,
      soil: editor.soil.trim() || undefined,
      description: editor.description,
      lat: editor.lat ?? undefined,
      lng: editor.lng ?? undefined,
    };
  }

  return {
    name: editor.name.trim(),
    slug: editor.slug.trim(),
    summary: editor.summary.trim() || undefined,
    status: editor.status,
    seo: buildSeo(),
    foundedYear: editor.foundedYear ?? undefined,
    regionId: editor.regionId || undefined,
    logoId: editor.logoId || undefined,
    description: editor.description,
    lat: editor.lat ?? undefined,
    lng: editor.lng ?? undefined,
  };
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const payload = buildPayload();
    if (editor.entity === 'person') {
      if (editor.id) await updateAdminWinemakersPerson(editor.id, payload);
      else await createAdminWinemakersPerson(payload);
    } else if (editor.entity === 'wine') {
      if (editor.id) await updateAdminWinemakersWine(editor.id, payload);
      else await createAdminWinemakersWine(payload);
    } else if (editor.entity === 'region') {
      if (editor.id) await updateAdminWinemakersRegion(editor.id, payload);
      else await createAdminWinemakersRegion(payload);
    } else if (editor.entity === 'terroir') {
      if (editor.id) await updateAdminWinemakersTerroir(editor.id, payload);
      else await createAdminWinemakersTerroir(payload);
    } else {
      if (editor.id) await updateAdminWinemakersWinery(editor.id, payload);
      else await createAdminWinemakersWinery(payload);
    }
    message.value = editor.id ? 'Сущность обновлена' : 'Сущность создана';
    showModal.value = false;
    await fetchAll();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}

async function removeItem(item: ListItem) {
  const label = item.name || item.slug;
  if (!confirm(`Удалить ${entityLabels[currentEntity.value]} «${label}»?`)) return;
  deleting.value = true;
  error.value = '';
  message.value = '';
  try {
    if (currentEntity.value === 'person') await deleteAdminWinemakersPerson(item.id);
    else if (currentEntity.value === 'wine') await deleteAdminWinemakersWine(item.id);
    else if (currentEntity.value === 'region') await deleteAdminWinemakersRegion(item.id);
    else if (currentEntity.value === 'terroir') await deleteAdminWinemakersTerroir(item.id);
    else await deleteAdminWinemakersWinery(item.id);
    message.value = 'Сущность удалена';
    await fetchAll();
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Ошибка удаления';
  } finally {
    deleting.value = false;
  }
}

function onPhotoSelected(media: MediaAsset) {
  editor.photoId = media.id;
  editor.photoPath = media.path;
}

function onLogoSelected(media: MediaAsset) {
  editor.logoId = media.id;
  editor.logoPath = media.path;
}

onMounted(() => {
  if (route.path === '/account/projects/winemakers') {
    navigateTo('/cms/projects/winemakers');
    return;
  }
  if (!isAuthenticated.value || user.value?.role !== 'admin') {
    navigateTo('/account');
    return;
  }
  fetchAll();
});
</script>

<template>
  <div class="w-full px-4 py-8 lg:px-0">
    <template v-if="isCmsRoute">
      <CmsPageHeader
        eyebrow="Спецпроект"
        title="Виноделы России"
        description="Управление доступом, витриной и каталогом сущностей спецпроекта."
      />
    </template>
    <template v-else>
      <div class="mb-6 border-b border-foreground/10 pb-4">
        <p class="text-xs font-normal uppercase tracking-wider text-foreground/50">Спецпроекты</p>
        <h1 class="mt-2 font-heading text-2xl font-bold">Виноделы России</h1>
      </div>

      <NuxtLink to="/account/projects" class="text-sm text-accent hover:underline">← Назад к спецпроектам</NuxtLink>
      <AccountTabs class="mt-6" />
      <ProjectTabs class="mt-6" />
    </template>

    <div class="mt-6 rounded border border-foreground/10 bg-card p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="w-full">
          <h2 class="text-lg font-normal">Доступ и публикация проекта</h2>
          <p class="mt-2 text-sm leading-6 text-foreground/65">
            Здесь лежат только настройки спецпроекта. Они не пересекаются с общей админкой «Виноделие Сегодня».
          </p>
        </div>
        <button
          type="button"
          class="bg-accent px-5 py-2.5 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50"
          :disabled="savingHomeConfig"
          @click="saveProjectSettings"
        >
          {{ savingHomeConfig ? 'Сохранение...' : 'Сохранить настройки проекта' }}
        </button>
      </div>

      <label class="mt-5 flex items-start gap-3 text-sm">
        <input
          v-model="featureForm.winemakersEnabled"
          type="checkbox"
          class="mt-0.5 h-4 w-4 accent-accent"
        >
        <span>
          <span class="block font-normal text-foreground">Открыть раздел для всех посетителей</span>
          <span class="mt-1 block text-foreground/60">
            Пока флаг выключен, сам раздел и кнопка входа в хедере скрыты для всех, кроме администраторов сайта.
          </span>
        </span>
      </label>
    </div>

    <div class="mt-6 flex flex-wrap gap-2 border-b border-foreground/10 pb-4">
      <button
        v-for="tab in projectTabs"
        :key="tab.key"
        type="button"
        class="px-4 py-2 text-sm transition"
        :class="currentSection === tab.key ? 'bg-accent text-black' : 'border border-foreground/10 bg-foreground/5 hover:bg-foreground/10'"
        @click="setSection(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <AdminWinemakersHomeConfigEditor
      v-if="isHomeSection"
      v-model="homeConfig"
      class="mt-6"
      :saving="savingHomeConfig"
      @save="saveHomePageConfig"
    />

    <template v-else>
      <div class="mt-6 flex items-center justify-between gap-3">
        <button class="btn-primary" @click="openCreate(currentEntity)">Добавить</button>
        <button class="text-sm text-accent hover:underline" @click="fetchAll">Обновить</button>
      </div>

      <p v-if="loading" class="mt-6 text-sm text-foreground/60">Загрузка...</p>
      <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
      <p v-if="message" class="mt-6 text-sm text-green-600">{{ message }}</p>

      <div v-if="!loading && currentItems.length" class="mt-6 overflow-x-auto">
        <table class="w-full border-collapse border border-foreground/10 text-sm">
          <thead class="bg-foreground/10">
            <tr>
              <th class="border border-foreground/10 px-4 py-2 text-left">Название</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Slug</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Статус</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Связи</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Обновлено</th>
              <th class="border border-foreground/10 px-4 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentItems" :key="item.id" class="bg-foreground/5">
              <td class="border border-foreground/10 px-4 py-2">
                <div class="flex items-center gap-3">
                  <img v-if="currentEntity === 'person' && item.photo?.path" :src="mediaUrl(item.photo.path)" alt="" class="h-10 w-10 rounded-full object-cover">
                  <img v-else-if="currentEntity === 'winery' && item.logo?.path" :src="mediaUrl(item.logo.path)" alt="" class="h-10 w-10 object-contain">
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td class="border border-foreground/10 px-4 py-2 font-mono text-xs">{{ item.slug }}</td>
              <td class="border border-foreground/10 px-4 py-2">{{ item.status }}</td>
              <td class="border border-foreground/10 px-4 py-2">
                <span v-if="currentEntity === 'person'">{{ item.winery?.name || '—' }}</span>
                <span v-else-if="currentEntity === 'wine'">{{ item.winery?.name || item.region?.name || '—' }}</span>
                <span v-else-if="currentEntity === 'region'">{{ item.parent?.name || '—' }}</span>
                <span v-else>{{ item.region?.name || '—' }}</span>
              </td>
              <td class="border border-foreground/10 px-4 py-2">{{ formatDate(item.updatedAt) }}</td>
              <td class="border border-foreground/10 px-4 py-2">
                <div class="flex flex-wrap gap-2">
                  <button class="text-xs text-accent hover:underline" @click="openEdit(currentEntity, item.id)">Изменить</button>
                  <button class="text-xs text-red-600 hover:underline" :disabled="deleting" @click="removeItem(item)">Удалить</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading && !currentItems.length" class="mt-6 text-sm text-foreground/60">Список пока пуст.</p>
    </template>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4" @click.self="showModal = false">
          <Transition name="slide">
            <div v-if="showModal" class="relative mt-6 max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg border border-foreground/10 bg-background shadow-2xl">
              <div class="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <div>
                  <h2 class="text-lg font-normal">{{ editor.id ? 'Редактирование' : 'Создание' }}: {{ entityLabels[editor.entity] }}</h2>
                  <p v-if="publicPath" class="mt-1 text-xs text-foreground/50">{{ publicPath }}</p>
                </div>
                <button class="flex h-8 w-8 items-center justify-center rounded text-foreground/60 transition hover:bg-foreground/10 hover:text-red-600" @click="showModal = false">✕</button>
              </div>

              <div class="max-h-[calc(92vh-72px)] overflow-y-auto p-6">
                <p v-if="loadingEditor" class="text-sm text-foreground/60">Загрузка сущности...</p>

                <div v-else class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  <div class="space-y-6">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="sm:col-span-2">
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Название</label>
                        <input v-model="editor.name" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" @input="ensureSlug">
                      </div>
                      <div>
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Slug</label>
                        <input v-model="editor.slug" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                      </div>
                      <div>
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Статус</label>
                        <select v-model="editor.status" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                        </select>
                      </div>
                      <div class="sm:col-span-2">
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Краткое описание</label>
                        <textarea v-model="editor.summary" rows="3" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" />
                      </div>
                    </div>

                    <div v-if="editor.entity === 'person'" class="space-y-6">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Год рождения</label>
                          <input v-model.number="editor.birthYear" type="number" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Год смерти</label>
                          <input v-model.number="editor.deathYear" type="number" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Винодельня</label>
                          <select v-model="editor.wineryId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.wineries" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Порядок сортировки</label>
                          <input v-model.number="editor.sortOrder" type="number" min="0" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                      </div>

                      <label class="inline-flex items-center gap-2 text-sm">
                        <input v-model="editor.featured" type="checkbox" class="h-4 w-4">
                        Избранный винодел
                      </label>

                      <WinemakersBlocksEditor v-model="editor.bioBlocks" label="Биография и основной текст" />

                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-normal">Карьерный таймлайн</h3>
                          <button type="button" class="btn-secondary text-xs" @click="addCareerItem">Добавить строку</button>
                        </div>
                        <div v-if="editor.career.length" class="space-y-3">
                          <div v-for="(item, index) in editor.career" :key="index" class="grid gap-3 border border-foreground/10 bg-card p-3 sm:grid-cols-2">
                            <input v-model="item.from" type="text" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="С">
                            <input v-model="item.to" type="text" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="По">
                            <input v-model="item.role" type="text" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Роль">
                            <input v-model="item.place" type="text" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Место">
                            <textarea v-model="item.note" rows="2" class="sm:col-span-2 border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Комментарий" />
                            <div class="sm:col-span-2 flex justify-end">
                              <button type="button" class="text-xs text-red-600 hover:underline" @click="editor.career.splice(index, 1)">Удалить</button>
                            </div>
                          </div>
                        </div>
                        <p v-else class="text-sm text-foreground/50">Пока нет записей.</p>
                      </div>

                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-normal">Родственные и проектные связи</h3>
                          <button type="button" class="btn-secondary text-xs" @click="addRelationItem">Добавить связь</button>
                        </div>
                        <div v-if="editor.relations.length" class="space-y-3">
                          <div v-for="(item, index) in editor.relations" :key="index" class="grid gap-3 border border-foreground/10 bg-card p-3 sm:grid-cols-[1fr_220px_auto]">
                            <select v-model="item.relatedId" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                              <option value="">Выберите персону</option>
                              <option v-for="option in options.persons.filter((person) => person.id !== editor.id)" :key="option.id" :value="option.id">{{ option.name }}</option>
                            </select>
                            <select v-model="item.type" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                              <option v-for="option in relationTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                            </select>
                            <button type="button" class="text-xs text-red-600 hover:underline" @click="editor.relations.splice(index, 1)">Удалить</button>
                          </div>
                        </div>
                        <p v-else class="text-sm text-foreground/50">Связи пока не заданы.</p>
                      </div>
                    </div>

                    <div v-else-if="editor.entity === 'wine'" class="space-y-6">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Тип вина</label>
                          <input v-model="editor.wineType" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="red / white / sparkling">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Стиль</label>
                          <input v-model="editor.style" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="dry / semi-dry">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Винтаж</label>
                          <input v-model.number="editor.vintage" type="number" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Сорта винограда</label>
                          <input v-model="editor.grapes" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent" placeholder="каберне, мерло">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Винодельня</label>
                          <select v-model="editor.wineryId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.wineries" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Регион</label>
                          <select v-model="editor.regionId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.regions" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div class="sm:col-span-2">
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Терруар</label>
                          <select v-model="editor.terroirId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.terroirs" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                      </div>

                      <WinemakersBlocksEditor v-model="editor.description" label="Основной текст карточки вина" />

                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-normal">Связанные виноделы</h3>
                          <button type="button" class="btn-secondary text-xs" @click="addWinemakerItem">Добавить винодела</button>
                        </div>
                        <div v-if="editor.winemakers.length" class="space-y-3">
                          <div v-for="(item, index) in editor.winemakers" :key="index" class="grid gap-3 border border-foreground/10 bg-card p-3 sm:grid-cols-[1fr_220px_auto]">
                            <select v-model="item.personId" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                              <option value="">Выберите персону</option>
                              <option v-for="option in options.persons" :key="option.id" :value="option.id">{{ option.name }}</option>
                            </select>
                            <input v-model="item.role" type="text" class="border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Главный винодел">
                            <button type="button" class="text-xs text-red-600 hover:underline" @click="editor.winemakers.splice(index, 1)">Удалить</button>
                          </div>
                        </div>
                        <p v-else class="text-sm text-foreground/50">Связанные виноделы пока не заданы.</p>
                      </div>
                    </div>

                    <div v-else-if="editor.entity === 'region'" class="space-y-6">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Родительский регион</label>
                          <select v-model="editor.parentId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.regions.filter((region) => region.id !== editor.id)" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Климат</label>
                          <input v-model="editor.climate" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Почва</label>
                          <input v-model="editor.soil" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Широта</label>
                          <input v-model.number="editor.lat" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Долгота</label>
                          <input v-model.number="editor.lng" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                      </div>
                      <WinemakersBlocksEditor v-model="editor.description" label="Основной текст карточки региона" />
                    </div>

                    <div v-else-if="editor.entity === 'terroir'" class="space-y-6">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Регион</label>
                          <select v-model="editor.regionId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">Выберите регион</option>
                            <option v-for="option in options.regions" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Экспозиция</label>
                          <input v-model="editor.exposition" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Высота, м</label>
                          <input v-model.number="editor.elevationM" type="number" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Почва</label>
                          <input v-model="editor.soil" type="text" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Широта</label>
                          <input v-model.number="editor.lat" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Долгота</label>
                          <input v-model.number="editor.lng" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                      </div>
                      <WinemakersBlocksEditor v-model="editor.description" label="Основной текст карточки терруара" />
                    </div>

                    <div v-else class="space-y-6">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Год основания</label>
                          <input v-model.number="editor.foundedYear" type="number" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Регион</label>
                          <select v-model="editor.regionId" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                            <option value="">— нет —</option>
                            <option v-for="option in options.regions" :key="option.id" :value="option.id">{{ option.name }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Широта</label>
                          <input v-model.number="editor.lat" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                        <div>
                          <label class="mb-1 block text-xs font-normal text-foreground/70">Долгота</label>
                          <input v-model.number="editor.lng" type="number" step="0.000001" class="w-full border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent">
                        </div>
                      </div>
                      <WinemakersBlocksEditor v-model="editor.description" label="Основной текст карточки винодельни" />
                    </div>

                    <div class="space-y-4 border border-foreground/10 bg-card p-4">
                      <h3 class="text-sm font-normal">SEO</h3>
                      <div>
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Title</label>
                        <input v-model="editor.seoTitle" type="text" class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                      </div>
                      <div>
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Description</label>
                        <textarea v-model="editor.seoDescription" rows="3" class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label class="mb-1 block text-xs font-normal text-foreground/70">Keywords</label>
                        <input v-model="editor.seoKeywords" type="text" class="w-full border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div v-if="editor.entity === 'person'" class="border border-foreground/10 bg-card p-4">
                      <h3 class="mb-3 text-sm font-normal">Фото винодела</h3>
                      <img v-if="editor.photoPath" :src="mediaUrl(editor.photoPath)" alt="" class="mb-3 h-56 w-full object-cover">
                      <div v-else class="mb-3 flex h-56 items-center justify-center border border-dashed border-foreground/10 text-sm text-foreground/50">Фото не выбрано</div>
                      <div class="flex gap-2">
                        <button type="button" class="btn-secondary flex-1 text-xs" @click="photoPickerOpen = true">Выбрать</button>
                        <button type="button" class="btn-danger text-xs" :disabled="!editor.photoId" @click="editor.photoId = ''; editor.photoPath = ''">Удалить</button>
                      </div>
                    </div>

                    <div v-if="editor.entity === 'winery'" class="border border-foreground/10 bg-card p-4">
                      <h3 class="mb-3 text-sm font-normal">Логотип винодельни</h3>
                      <img v-if="editor.logoPath" :src="mediaUrl(editor.logoPath)" alt="" class="mb-3 h-40 w-full object-contain">
                      <div v-else class="mb-3 flex h-40 items-center justify-center border border-dashed border-foreground/10 text-sm text-foreground/50">Логотип не выбран</div>
                      <div class="flex gap-2">
                        <button type="button" class="btn-secondary flex-1 text-xs" @click="logoPickerOpen = true">Выбрать</button>
                        <button type="button" class="btn-danger text-xs" :disabled="!editor.logoId" @click="editor.logoId = ''; editor.logoPath = ''">Удалить</button>
                      </div>
                    </div>

                    <div class="border border-foreground/10 bg-card p-4">
                      <h3 class="mb-2 text-sm font-normal">Подсказки</h3>
                      <ul class="list-disc space-y-2 pl-5 text-xs text-foreground/60">
                        <li>Slug лучше сразу делать латиницей без пробелов.</li>
                        <li>Для публичного каталога достаточно `draft` и `published`, остальные статусы можно использовать как редакционные.</li>
                        <li>Фото и логотип берутся из общей медиабиблиотеки.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex items-center justify-end gap-2">
                  <button class="btn-secondary" @click="showModal = false">Отмена</button>
                  <button class="btn-primary" :disabled="saving" @click="save">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <MediaPicker v-model="photoPickerOpen" @select="onPhotoSelected" />
    <MediaPicker v-model="logoPickerOpen" @select="onLogoSelected" />
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-normal text-black transition hover:bg-accent/90 disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-normal text-foreground transition hover:bg-foreground/10 disabled:opacity-50;
}
.btn-danger {
  @apply inline-flex items-center gap-1.5 border border-red-600/30 bg-red-50 px-4 py-2 text-sm font-normal text-red-700 transition hover:bg-red-100 disabled:opacity-50;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-15px); }
</style>
