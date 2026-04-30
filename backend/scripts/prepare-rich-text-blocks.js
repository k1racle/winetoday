const { Client } = require('pg');

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value) {
  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|section|article)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildParagraphBlock(text) {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

function sanitizeTiptapNode(node) {
  if (!isPlainObject(node)) {
    return null;
  }

  if (node.type === 'text') {
    const text = typeof node.text === 'string' ? node.text : '';

    if (!text.length) {
      return null;
    }

    return {
      ...node,
      text,
    };
  }

  if (Array.isArray(node.content)) {
    const content = node.content.map(sanitizeTiptapNode).filter(Boolean);

    if (node.type !== 'doc' && content.length === 0) {
      return null;
    }

    return {
      ...node,
      content,
    };
  }

  if (Array.isArray(node.children)) {
    const children = node.children.map(sanitizeTiptapNode).filter(Boolean);

    if (children.length === 0) {
      return null;
    }

    return {
      ...node,
      children,
    };
  }

  return node;
}

function sanitizeTiptapDocument(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeTiptapNode).filter(Boolean);
  }

  if (isPlainObject(value)) {
    return sanitizeTiptapNode(value) ?? { type: 'doc', content: [] };
  }

  return value;
}

function blocksFromLegacyText(value) {
  const normalized = stripHtml(String(value ?? ''));

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(buildParagraphBlock);
}

function normalizeRichTextContent(value) {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return sanitizeTiptapDocument(value);
  }

  if (typeof value !== 'string') {
    return blocksFromLegacyText(String(value));
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed) || isPlainObject(parsed)) {
      return sanitizeTiptapDocument(parsed);
    }

    if (typeof parsed === 'string') {
      return blocksFromLegacyText(parsed);
    }
  } catch {
    return blocksFromLegacyText(trimmed);
  }

  return blocksFromLegacyText(trimmed);
}

async function main() {
  console.log('[prepare-rich-text-blocks] Starting legacy rich text normalization');

  const clientName = process.env.DATABASE_CLIENT || 'sqlite';

  if (clientName !== 'postgres') {
    console.log(`[prepare-rich-text-blocks] Skip: DATABASE_CLIENT=${clientName}`);
    return;
  }

  const schema = process.env.DATABASE_SCHEMA || 'public';
  const tableNames = ['components_blocks_rich_texts', 'components_blocks_html_editors'];
  const connectionString = process.env.DATABASE_URL;
  const sslEnabled = String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true';

  const client = new Client(
    connectionString
      ? {
          connectionString,
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.DATABASE_HOST || 'localhost',
          port: Number(process.env.DATABASE_PORT || 5432),
          database: process.env.DATABASE_NAME || 'strapi',
          user: process.env.DATABASE_USERNAME || 'strapi',
          password: process.env.DATABASE_PASSWORD || 'strapi',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        }
  );

  await client.connect();

  try {
    let totalRows = 0;
    let updatedCount = 0;

    for (const tableName of tableNames) {
      const tableResult = await client.query(
        'select exists (select 1 from information_schema.tables where table_schema = $1 and table_name = $2) as exists',
        [schema, tableName]
      );

      if (!tableResult.rows[0]?.exists) {
        console.log(`[prepare-rich-text-blocks] Skip: ${schema}.${tableName} not found`);
        continue;
      }

      const rowsResult = await client.query(`select id, content from "${schema}"."${tableName}" where content is not null`);
      totalRows += rowsResult.rowCount ?? 0;

      for (const row of rowsResult.rows) {
        const normalized = normalizeRichTextContent(row.content);
        const nextValue = JSON.stringify(normalized);
        const currentValue = typeof row.content === 'string' ? row.content.trim() : JSON.stringify(row.content);

        if (currentValue === nextValue) {
          continue;
        }

        await client.query(`update "${schema}"."${tableName}" set content = $1 where id = $2`, [nextValue, row.id]);
        updatedCount += 1;
      }
    }

    if (!totalRows) {
      console.log('[prepare-rich-text-blocks] No rich text rows to inspect');
      return;
    }

    console.log(`[prepare-rich-text-blocks] Processed ${totalRows} rows, normalized ${updatedCount} rich text value(s)`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('[prepare-rich-text-blocks] Failed to prepare rich text blocks');
  console.error(error);
  process.exit(1);
});
