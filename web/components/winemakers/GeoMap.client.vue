<script setup lang="ts">
import type { WinemakersMapPoint } from '~/types/winemakers';

declare global {
  interface Window {
    L?: any;
    __winemakersLeafletPromise?: Promise<any>;
  }
}

const props = withDefaults(
  defineProps<{
    points: WinemakersMapPoint[];
    title?: string;
    description?: string;
    heightClass?: string;
    focusLat?: number | null;
    focusLng?: number | null;
    focusZoom?: number;
    emptyLabel?: string;
  }>(),
  {
    title: '',
    description: '',
    heightClass: 'h-[420px]',
    focusLat: null,
    focusLng: null,
    focusZoom: 7,
    emptyLabel: 'Карта появится после добавления координат в админке.',
  },
);

const mapElement = ref<HTMLElement | null>(null);
const loadFailed = ref(false);

let map: any = null;
let leaflet: any = null;
let markersLayer: any = null;

const validPoints = computed(() =>
  props.points.filter(
    (point) =>
      Number.isFinite(point?.lat) &&
      Number.isFinite(point?.lng),
  ),
);

function escapeHtml(value?: string | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pointLink(point: WinemakersMapPoint) {
  return point.kind === 'region' ? `/regions/${point.slug}` : `/terroirs/${point.slug}`;
}

function pointMeta(point: WinemakersMapPoint) {
  const bits: string[] = [];
  if (point.kind === 'region' && point.wineryCount) bits.push(`${point.wineryCount} виноделен`);
  if (point.kind === 'region' && point.terroirCount) bits.push(`${point.terroirCount} терруаров`);
  if (point.wineCount) bits.push(`${point.wineCount} вин`);
  return bits.join(' · ');
}

function popupHtml(point: WinemakersMapPoint) {
  const persons = point.persons.length
    ? `<div class="winemakers-map-popup__persons">${point.persons
        .map(
          (person) =>
            `<a href="/winemakers/${escapeHtml(person.slug)}">${escapeHtml(person.name)}</a>`,
        )
        .join('')}${point.persons.length >= 3 ? '' : ''}</div>`
    : '';
  const meta = pointMeta(point);
  const regionLabel =
    point.kind === 'terroir' && point.region?.name
      ? `<p class="winemakers-map-popup__region">${escapeHtml(point.region.name)}</p>`
      : '';

  return `
    <div class="winemakers-map-popup">
      <p class="winemakers-map-popup__eyebrow">${point.kind === 'region' ? 'Регион' : 'Терруар'}</p>
      <a class="winemakers-map-popup__title" href="${escapeHtml(pointLink(point))}">
        ${escapeHtml(point.name)}
      </a>
      ${regionLabel}
      ${point.summary ? `<p class="winemakers-map-popup__summary">${escapeHtml(point.summary)}</p>` : ''}
      ${meta ? `<p class="winemakers-map-popup__meta">${escapeHtml(meta)}</p>` : ''}
      ${persons}
    </div>
  `;
}

function markerStyle(point: WinemakersMapPoint) {
  return point.kind === 'region'
    ? {
        color: '#d7ff4f',
        fillColor: '#d7ff4f',
        radius: 8,
        weight: 2,
        fillOpacity: 0.9,
      }
    : {
        color: '#8eb4ff',
        fillColor: '#8eb4ff',
        radius: 5,
        weight: 1,
        fillOpacity: 0.85,
      };
}

function ensureLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (window.__winemakersLeafletPromise) {
    return window.__winemakersLeafletPromise;
  }

  window.__winemakersLeafletPromise = new Promise((resolve, reject) => {
    const existingCss = document.querySelector('link[data-winemakers-leaflet]');
    if (!existingCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-winemakers-leaflet', 'true');
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector('script[data-winemakers-leaflet]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-winemakers-leaflet', 'true');
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window.__winemakersLeafletPromise;
}

function renderMap() {
  if (!leaflet || !mapElement.value || !validPoints.value.length) {
    return;
  }

  if (!map) {
    map = leaflet.map(mapElement.value, {
      scrollWheelZoom: false,
      zoomControl: true,
    });

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      })
      .addTo(map);
  }

  if (markersLayer) {
    markersLayer.remove();
  }

  markersLayer = leaflet.featureGroup();

  for (const point of validPoints.value) {
    const marker = leaflet
      .circleMarker([point.lat, point.lng], markerStyle(point))
      .bindPopup(popupHtml(point), {
        className: 'winemakers-map-leaflet-popup',
        closeButton: false,
        maxWidth: 280,
      });

    marker.on('mouseover', () => marker.openPopup());
    marker.on('mouseout', () => marker.closePopup());
    markersLayer.addLayer(marker);
  }

  markersLayer.addTo(map);

  if (Number.isFinite(props.focusLat) && Number.isFinite(props.focusLng)) {
    map.setView([props.focusLat, props.focusLng], props.focusZoom);
    return;
  }

  const bounds = markersLayer.getBounds?.();
  if (bounds?.isValid?.()) {
    map.fitBounds(bounds, { padding: [32, 32] });
    if (validPoints.value.length === 1) {
      map.setZoom(props.focusZoom);
    }
  }
}

onMounted(async () => {
  if (!validPoints.value.length) {
    return;
  }

  try {
    leaflet = await ensureLeaflet();
    renderMap();
  } catch {
    loadFailed.value = true;
  }
});

watch(
  () => [
    validPoints.value,
    props.focusLat,
    props.focusLng,
    props.focusZoom,
  ],
  () => {
    if (leaflet) {
      renderMap();
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
  markersLayer = null;
});
</script>

<template>
  <section class="border border-foreground/10 bg-card/50 p-5 md:p-6">
    <div v-if="title || description" class="mb-5 max-w-3xl">
      <h2 v-if="title" class="font-heading text-2xl font-bold">{{ title }}</h2>
      <p v-if="description" class="mt-3 text-sm leading-6 text-foreground/65">
        {{ description }}
      </p>
    </div>

    <div
      v-if="validPoints.length"
      ref="mapElement"
      :class="['w-full overflow-hidden border border-foreground/10 bg-background', heightClass]"
    />
    <div
      v-else
      class="flex min-h-[220px] items-center justify-center border border-dashed border-foreground/15 px-6 text-center text-sm text-foreground/55"
    >
      {{ emptyLabel }}
    </div>

    <p v-if="loadFailed" class="mt-3 text-sm text-foreground/55">
      Не удалось загрузить карту. Проверьте доступ к CDN Leaflet и OpenStreetMap.
    </p>
  </section>
</template>

<style scoped>
:global(.winemakers-map-leaflet-popup .leaflet-popup-content-wrapper) {
  border-radius: 0;
  background: rgba(8, 15, 24, 0.96);
  color: #f3f5f7;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

:global(.winemakers-map-leaflet-popup .leaflet-popup-tip) {
  background: rgba(8, 15, 24, 0.96);
}

:global(.winemakers-map-popup) {
  display: grid;
  gap: 0.45rem;
  min-width: 210px;
}

:global(.winemakers-map-popup__eyebrow) {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(243, 245, 247, 0.52);
}

:global(.winemakers-map-popup__title) {
  color: #f3f5f7;
  font-weight: 700;
  text-decoration: none;
}

:global(.winemakers-map-popup__title:hover) {
  color: #d7ff4f;
}

:global(.winemakers-map-popup__region),
:global(.winemakers-map-popup__summary),
:global(.winemakers-map-popup__meta) {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: rgba(243, 245, 247, 0.78);
}

:global(.winemakers-map-popup__persons) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  padding-top: 0.2rem;
}

:global(.winemakers-map-popup__persons a) {
  color: #d7ff4f;
  font-size: 0.75rem;
  text-decoration: none;
}

:global(.winemakers-map-popup__persons a:hover) {
  text-decoration: underline;
}
</style>
