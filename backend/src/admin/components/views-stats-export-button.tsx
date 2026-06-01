import { useState } from 'react';

type ViewsStatsRecord = {
  type: 'article' | 'news' | 'video';
  typeLabel: string;
  documentId: string;
  title: string;
  slug?: string | null;
  href?: string | null;
  status: 'draft' | 'published';
  publishedAt?: string | null;
  updatedAt?: string | null;
  views: number;
};

type ViewsStatsResponse = {
  generatedAt?: string;
  totals?: {
    records?: number;
    views?: number;
  };
  records?: ViewsStatsRecord[];
};

const VIEWS_STATS_MODELS = new Set(['api::article.article', 'api::news.news', 'api::video.video']);

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildViewsStatsCsv(payload: ViewsStatsResponse) {
  const rows = [
    ['Статистика просмотров', payload.generatedAt ?? new Date().toISOString(), '', '', '', '', '', '', ''],
    ['Всего материалов', payload.totals?.records ?? 0, 'Всего просмотров', payload.totals?.views ?? 0, '', '', '', '', ''],
    [],
    ['Тип', 'Статус', 'Название', 'Слаг', 'Просмотры', 'Опубликовано', 'Обновлено', 'URL', 'Document ID'],
    ...(payload.records ?? []).map((record) => [
      record.typeLabel,
      record.status === 'published' ? 'Опубликовано' : 'Черновик',
      record.title,
      record.slug ?? '',
      Number(record.views) || 0,
      record.publishedAt ?? '',
      record.updatedAt ?? '',
      record.href ?? '',
      record.documentId,
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
}

function downloadCsv(payload: ViewsStatsResponse) {
  const csv = buildViewsStatsCsv(payload);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `views-all-content-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getModelFromLocation() {
  if (typeof window === 'undefined') {
    return null;
  }

  const match = window.location.pathname.match(/\/content-manager\/collection-types\/([^/]+)/i);
  const encodedModel = match?.[1];

  if (!encodedModel) {
    return null;
  }

  try {
    return decodeURIComponent(encodedModel);
  } catch {
    return encodedModel;
  }
}

export default function ViewsStatsExportButton({ model }: { model?: string }) {
  const currentModel = model || getModelFromLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/editor/views-stats', {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Unexpected response: ${response.status}`);
      }

      downloadCsv((await response.json()) as ViewsStatsResponse);
    } catch {
      setError('Не удалось скачать CSV.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!currentModel || !VIEWS_STATS_MODELS.has(currentModel)) {
    return null;
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        title="Скачать CSV со всеми видео, новостями и статьями без изменения текущих счётчиков."
        style={{
          border: '1px solid var(--strapi.colors.primary600)',
          borderRadius: 4,
          background: isLoading ? 'var(--strapi.colors.neutral200)' : 'var(--strapi.colors.primary600)',
          color: isLoading ? 'var(--strapi.colors.neutral600)' : 'var(--strapi.colors.neutral0)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          minHeight: 32,
          padding: '0.45rem 0.75rem',
        }}
      >
        {isLoading ? 'Готовим CSV…' : 'Скачать CSV статистику по просмотрам'}
      </button>

      {error ? <span style={{ color: 'var(--strapi.colors.danger600)', fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
