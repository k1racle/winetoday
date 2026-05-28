import { Box, Flex, Typography } from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
import { useEffect, useMemo, useState } from 'react';

type AuthorStatsRecord = {
  type: 'article' | 'news' | 'video' | 'gallery';
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

type AuthorStatsResponse = {
  author?: {
    name?: string | null;
    slug?: string | null;
  };
  totals?: {
    allRecords?: number;
    publishedRecords?: number;
    views?: number;
  };
  records?: AuthorStatsRecord[];
};

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatViews(value?: number | null) {
  const numberValue = Number(value) || 0;
  return numberValue.toLocaleString('ru-RU');
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <Box background="neutral100" borderColor="neutral200" hasRadius padding={3}>
      <Typography textColor="neutral600" variant="pi">
        {label}
      </Typography>
      <Typography fontWeight="bold" textColor="neutral900" variant="delta">
        {formatViews(value)}
      </Typography>
    </Box>
  );
}

export default function AuthorStatsPanel() {
  const context = useContentManagerContext() as {
    slug?: string;
    id?: string | null;
    isCreatingEntry?: boolean;
  } | undefined;
  const { slug, id, isCreatingEntry } = context ?? {};
  const authorDocumentId = typeof id === 'string' ? id.trim() : '';
  const isAuthorEditView = slug === 'api::author.author' && !isCreatingEntry && Boolean(authorDocumentId);

  const [payload, setPayload] = useState<AuthorStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorEditView || !authorDocumentId) {
      return undefined;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    void fetch(`/api/editor/author-stats/${encodeURIComponent(authorDocumentId)}`, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unexpected response: ${response.status}`);
        }

        return response.json() as Promise<AuthorStatsResponse>;
      })
      .then((data) => {
        if (!active) {
          return;
        }

        setPayload(data);
        setError(null);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPayload(null);
        setError('Не удалось загрузить статистику автора.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authorDocumentId, isAuthorEditView]);

  const totals = useMemo(
    () => ({
      allRecords: payload?.totals?.allRecords ?? 0,
      publishedRecords: payload?.totals?.publishedRecords ?? 0,
      views: payload?.totals?.views ?? 0,
    }),
    [payload],
  );

  if (!isAuthorEditView) {
    return null;
  }

  return (
    <details>
      <summary style={{ listStyle: 'none', cursor: 'pointer' }}>
        <Box background="neutral0" borderColor="neutral200" hasRadius padding={6} shadow="tableShadow">
          <Flex direction="column" gap={3} alignItems="stretch">
            <Flex direction="column" gap={1} alignItems="stretch">
              <Typography variant="beta">Статистика автора</Typography>
              <Typography textColor="neutral600" variant="omega">
                {payload?.author?.name ? `Автор: ${payload.author.name}` : 'Откройте блок, чтобы увидеть сводку по записям и просмотрам.'}
              </Typography>
            </Flex>

            <Flex gap={3} wrap="wrap" alignItems="stretch">
              <div style={{ flex: '1 1 120px', minWidth: 120 }}>
                <SummaryMetric label="Всего записей" value={totals.allRecords} />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: 120 }}>
                <SummaryMetric label="Опубликовано" value={totals.publishedRecords} />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: 120 }}>
                <SummaryMetric label="Просмотры" value={totals.views} />
              </div>
            </Flex>

            {isLoading ? (
              <Typography textColor="neutral600" variant="pi">
                Загружаем данные…
              </Typography>
            ) : null}

            {error ? (
              <Typography textColor="danger600" variant="pi">
                {error}
              </Typography>
            ) : null}

            <Typography textColor="neutral600" variant="pi">
              Нажмите, чтобы раскрыть подробный список записей.
            </Typography>
          </Flex>
        </Box>
      </summary>

      <Box background="neutral0" borderColor="neutral200" hasRadius marginTop={4} padding={6} shadow="tableShadow">
        <Flex direction="column" gap={3} alignItems="stretch">
          <Typography variant="beta">Записи автора</Typography>

          {payload?.records?.length ? (
            <Flex direction="column" gap={3} alignItems="stretch">
              {payload.records.map((record) => (
                <Box key={record.documentId} background="neutral100" borderColor="neutral200" hasRadius padding={4}>
                  <Flex direction="column" gap={2} alignItems="stretch">
                    <Flex justifyContent="space-between" gap={3} alignItems="flex-start">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight="bold" textColor="neutral900" variant="omega">
                          {record.title}
                        </Typography>
                        <Typography textColor="neutral600" variant="pi">
                          {record.typeLabel} · {record.status === 'published' ? 'Опубликовано' : 'Черновик'}
                        </Typography>
                      </div>

                      <Typography textColor="neutral800" variant="omega">
                        {formatViews(record.views)} просмотров
                      </Typography>
                    </Flex>

                    <Flex wrap="wrap" gap={3} alignItems="center">
                      <Typography textColor="neutral600" variant="pi">
                        Обновлено: {formatDate(record.updatedAt)}
                      </Typography>
                      <Typography textColor="neutral600" variant="pi">
                        Опубликовано: {formatDate(record.publishedAt)}
                      </Typography>
                      {record.slug ? (
                        <Typography textColor="neutral600" variant="pi">
                          Слаг: {record.slug}
                        </Typography>
                      ) : null}
                      {record.href ? (
                        <Typography variant="pi">
                          <a href={record.href} target="_blank" rel="noreferrer" style={{ color: 'var(--strapi.colors.primary600)' }}>
                            Открыть на сайте
                          </a>
                        </Typography>
                      ) : null}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          ) : (
            <Typography textColor="neutral600" variant="pi">
              У этого автора пока нет записей.
            </Typography>
          )}
        </Flex>
      </Box>
    </details>
  );
}
