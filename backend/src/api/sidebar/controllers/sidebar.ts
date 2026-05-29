import { factories } from '@strapi/strapi';

function collectArchiveBlockIds(entry: any, accumulator: Set<number>) {
  for (const block of entry?.archiveBlocks ?? []) {
    if (block?.__component === 'sidebar.archive-block' && typeof block.id === 'number') {
      accumulator.add(block.id);
    }
  }
}

async function loadArchiveBlockCategories(strapi: any, archiveBlockIds: number[]) {
  if (!archiveBlockIds.length) {
    return new Map<number, Array<{ documentId: string | null; name: string; slug: string | null }>>();
  }

  const rows = await strapi.db.connection('components_sidebar_archive_blocks_categories_lnk as link')
    .leftJoin('categories as category', 'category.id', 'link.category_id')
    .select(
      'link.archive_block_id as archiveBlockId',
      'link.category_ord as categoryOrder',
      'category.document_id as documentId',
      'category.name as name',
      'category.slug as slug',
    )
    .whereIn('link.archive_block_id', archiveBlockIds)
    .whereNotNull('category.id')
    .orderBy('link.archive_block_id', 'asc')
    .orderBy('link.category_ord', 'asc');

  return rows.reduce((accumulator: Map<number, Array<{ documentId: string | null; name: string; slug: string | null }>>, row: Record<string, any>) => {
    const archiveBlockId = Number(row.archiveBlockId);

    if (!Number.isFinite(archiveBlockId) || !row.name) {
      return accumulator;
    }

    const categories = accumulator.get(archiveBlockId) ?? [];
    categories.push({
      documentId: typeof row.documentId === 'string' ? row.documentId : null,
      name: row.name,
      slug: typeof row.slug === 'string' ? row.slug : null,
    });
    accumulator.set(archiveBlockId, categories);

    return accumulator;
  }, new Map());
}

function attachArchiveBlockCategories(entry: any, categoriesByBlockId: Map<number, Array<{ documentId: string | null; name: string; slug: string | null }>>) {
  if (!Array.isArray(entry?.archiveBlocks)) {
    return entry;
  }

  return {
    ...entry,
    archiveBlocks: entry.archiveBlocks.map((block: any) => {
      if (block?.__component !== 'sidebar.archive-block' || typeof block.id !== 'number') {
        return block;
      }

      return {
        ...block,
        categories: categoriesByBlockId.get(block.id) ?? [],
      };
    }),
  };
}

async function hydrateArchiveBlockCategories(strapi: any, response: any) {
  const entries = Array.isArray(response?.data) ? response.data : response?.data ? [response.data] : [];
  const archiveBlockIds = new Set<number>();

  for (const entry of entries) {
    collectArchiveBlockIds(entry, archiveBlockIds);
  }

  const categoriesByBlockId = await loadArchiveBlockCategories(strapi, [...archiveBlockIds]);

  if (Array.isArray(response?.data)) {
    return {
      ...response,
      data: response.data.map((entry: any) => attachArchiveBlockCategories(entry, categoriesByBlockId)),
    };
  }

  if (response?.data) {
    return {
      ...response,
      data: attachArchiveBlockCategories(response.data, categoriesByBlockId),
    };
  }

  return response;
}

export default factories.createCoreController('api::sidebar.sidebar' as any, ({ strapi }) => ({
  async find(ctx: any) {
    const response = await super.find(ctx);
    return hydrateArchiveBlockCategories(strapi, response);
  },

  async findOne(ctx: any) {
    const response = await super.findOne(ctx);
    return hydrateArchiveBlockCategories(strapi, response);
  },
}));
