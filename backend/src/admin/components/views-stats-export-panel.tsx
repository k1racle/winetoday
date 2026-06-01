import { Box, Flex, Typography } from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
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

function formatViews(value?: number | null) {
  return (Number(value) || 0).toLocaleString('ru-RU');
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

export default function ViewsStatsExportPanel() {
  const context = useContentManagerContext() as { slug?: string } | undefined;
  const isHomepageEditView = context?.slug === 'api::homepage.homepage';
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setMessage(null);
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

      const payload = (await response.json()) as ViewsStatsResponse;
      downloadCsv(payload);
      setMessage(
        `CSV скачан: ${formatViews(payload.totals?.records)} материалов, ${formatViews(payload.totals?.views)} просмотров.`,
      );
    } catch {
      setError('Не удалось скачать статистику просмотров. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isHomepageEditView) {
    return null;
  }

  return (
    <Box background="neutral0" borderColor="neutral200" hasRadius padding={6} shadow="tableShadow">
      <Flex direction="column" gap={3} alignItems="stretch">
        <Flex direction="column" gap={1} alignItems="stretch">
          <Typography variant="beta">Статистика просмотров</Typography>
          <Typography textColor="neutral600" variant="pi">
            Скачивает CSV со всеми видео, новостями и статьями без изменения текущих счётчиков.
          </Typography>
        </Flex>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isLoading}
          style={{
            border: '1px solid var(--strapi.colors.primary600)',
            borderRadius: 4,
            background: isLoading ? 'var(--strapi.colors.neutral200)' : 'var(--strapi.colors.primary600)',
            color: isLoading ? 'var(--strapi.colors.neutral600)' : 'var(--strapi.colors.neutral0)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            padding: '0.5rem 0.75rem',
          }}
        >
          {isLoading ? 'Готовим CSV…' : 'Скачать CSV'}
        </button>

        {message ? (
          <Typography textColor="success600" variant="pi">
            {message}
          </Typography>
        ) : null}

        {error ? (
          <Typography textColor="danger600" variant="pi">
            {error}
          </Typography>
        ) : null}
      </Flex>
    </Box>
  );
}
