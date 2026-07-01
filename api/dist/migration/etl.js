"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const strapiDbUrl = process.env.STRAPI_DATABASE_URL ||
    process.env.DATABASE_URL?.replace(/\/[^/]*$/, '/vino_portal');
if (!strapiDbUrl) {
    throw new Error('STRAPI_DATABASE_URL or DATABASE_URL must be set');
}
const strapi = new pg_1.Pool({ connectionString: strapiDbUrl });
const prisma = new client_1.PrismaClient();
const idMaps = {
    media: new Map(),
    author: new Map(),
    category: new Map(),
    tag: new Map(),
    content: new Map(),
};
const entityIdColumn = {
    articles: 'article_id',
    news_items: 'news_id',
    videos: 'video_id',
    galleries: 'gallery_id',
};
async function resetTarget() {
    const tables = [
        'content_view_events',
        'content_view_daily',
        'content_view_totals',
        'author_view_daily',
        '_ContentItemToTag',
        '_CategoryToContentItem',
        'comments',
        'reactions',
        'content_items',
        'media_assets',
        'tags',
        'categories',
        'authors',
        'static_pages',
    ];
    for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
    console.log('Target tables truncated.');
}
async function migrateMedia() {
    const rows = await strapi.query(`
    SELECT id, name, alternative_text, caption, width, height, mime, size, url
    FROM files
    ORDER BY id
  `);
    for (const row of rows.rows) {
        const id = (0, crypto_1.randomUUID)();
        idMaps.media.set(row.id, id);
        await prisma.mediaAsset.create({
            data: {
                id,
                path: row.url,
                mime: row.mime,
                width: row.width,
                height: row.height,
                altText: row.alternative_text,
                sizeBytes: row.size ? BigInt(Math.round(row.size)) : null,
            },
        });
    }
    console.log(`Migrated ${rows.rowCount} media assets.`);
}
async function migrateAuthors() {
    const rows = await strapi.query(`
    SELECT id, name, slug, position, bio
    FROM authors
    ORDER BY id
  `);
    const usedSlugs = new Set();
    for (const row of rows.rows) {
        const id = (0, crypto_1.randomUUID)();
        idMaps.author.set(row.id, id);
        let slug = row.slug || slugify(row.name);
        if (usedSlugs.has(slug)) {
            let suffix = 2;
            while (usedSlugs.has(`${slug}-${suffix}`))
                suffix++;
            slug = `${slug}-${suffix}`;
        }
        usedSlugs.add(slug);
        await prisma.author.create({
            data: {
                id,
                name: row.name,
                slug,
                position: row.position,
                bio: row.bio,
            },
        });
    }
    console.log(`Migrated ${rows.rowCount} authors.`);
}
function slugify(value) {
    return (value || 'author')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
async function migrateCategories() {
    const rows = await strapi.query(`
    SELECT id, name, slug
    FROM categories
    ORDER BY id
  `);
    const usedSlugs = new Set();
    for (const row of rows.rows) {
        const id = (0, crypto_1.randomUUID)();
        idMaps.category.set(row.id, id);
        let slug = row.slug || slugify(row.name);
        if (usedSlugs.has(slug)) {
            let suffix = 2;
            while (usedSlugs.has(`${slug}-${suffix}`))
                suffix++;
            slug = `${slug}-${suffix}`;
        }
        usedSlugs.add(slug);
        await prisma.category.create({
            data: {
                id,
                name: row.name,
                slug,
            },
        });
    }
    console.log(`Migrated ${rows.rowCount} categories.`);
}
async function migrateTags() {
    const rows = await strapi.query(`
    SELECT id, name, slug
    FROM tags
    ORDER BY id
  `);
    const usedSlugs = new Set();
    for (const row of rows.rows) {
        const id = (0, crypto_1.randomUUID)();
        idMaps.tag.set(row.id, id);
        let slug = row.slug || slugify(row.name);
        if (usedSlugs.has(slug)) {
            let suffix = 2;
            while (usedSlugs.has(`${slug}-${suffix}`))
                suffix++;
            slug = `${slug}-${suffix}`;
        }
        usedSlugs.add(slug);
        await prisma.tag.create({
            data: {
                id,
                name: row.name,
                slug,
            },
        });
    }
    console.log(`Migrated ${rows.rowCount} tags.`);
}
async function resolveFileForComponent(relatedType, relatedId, field) {
    const res = await strapi.query(`
    SELECT file_id FROM files_related_mph
    WHERE related_type = $1 AND related_id = $2 AND field = $3
    ORDER BY "order" ASC
  `, [relatedType, relatedId, field]);
    return res.rows.map((r) => idMaps.media.get(r.file_id)).filter(Boolean);
}
async function buildContentBlocks(table, entityId) {
    const cmpRows = await strapi.query(`
    SELECT cmp_id, component_type, field, "order"
    FROM ${table}_cmps
    WHERE entity_id = $1
    ORDER BY COALESCE("order", 9999) ASC, id ASC
  `, [entityId]);
    const blocks = [];
    const sources = [];
    let seo = null;
    for (const cmp of cmpRows.rows) {
        const type = cmp.component_type;
        const cmpId = cmp.cmp_id;
        if (type === 'shared.seo') {
            const r = await strapi.query(`SELECT meta_title, meta_description, keywords, canonical_url, no_index, no_follow
         FROM components_shared_seos WHERE id = $1`, [cmpId]);
            const s = r.rows[0];
            if (s) {
                seo = {
                    metaTitle: s.meta_title,
                    metaDescription: s.meta_description,
                    keywords: s.keywords,
                    canonicalUrl: s.canonical_url,
                    noIndex: s.no_index,
                    noFollow: s.no_follow,
                };
            }
            continue;
        }
        if (type === 'shared.source-link') {
            const r = await strapi.query(`SELECT name, url FROM components_shared_source_links WHERE id = $1`, [cmpId]);
            const s = r.rows[0];
            if (s)
                sources.push({ name: s.name, url: s.url });
            continue;
        }
        let block = { id: (0, crypto_1.randomUUID)() };
        switch (type) {
            case 'blocks.html-editor': {
                const r = await strapi.query(`SELECT title, content FROM components_blocks_html_editors WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'html-editor';
                block.title = row?.title;
                block.content = row?.content;
                break;
            }
            case 'blocks.rich-text': {
                const r = await strapi.query(`SELECT title, content FROM components_blocks_rich_texts WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'rich-text';
                block.title = row?.title;
                block.content = row?.content;
                break;
            }
            case 'blocks.image-highlight': {
                const r = await strapi.query(`SELECT caption, credit FROM components_blocks_image_highlights WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'image-highlight';
                block.caption = row?.caption;
                block.credit = row?.credit;
                const imageIds = await resolveFileForComponent('blocks.image-highlight', cmpId, 'image');
                block.imageId = imageIds[0] || null;
                break;
            }
            case 'blocks.image-gallery': {
                const r = await strapi.query(`SELECT title, description FROM components_blocks_image_galleries WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'image-gallery';
                block.title = row?.title;
                block.description = row?.description;
                block.imageIds = await resolveFileForComponent('blocks.image-gallery', cmpId, 'images');
                break;
            }
            case 'blocks.image-slider': {
                const r = await strapi.query(`SELECT title, description, photo_source FROM components_blocks_image_sliders WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'image-slider';
                block.title = row?.title;
                block.description = row?.description;
                block.photoSource = row?.photo_source;
                block.imageIds = await resolveFileForComponent('blocks.image-slider', cmpId, 'images');
                break;
            }
            case 'blocks.quote': {
                const r = await strapi.query(`SELECT text, author, role FROM components_blocks_quotes WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'quote';
                block.text = row?.text;
                block.author = row?.author;
                block.role = row?.role;
                break;
            }
            case 'blocks.embed': {
                const r = await strapi.query(`SELECT title, html FROM components_blocks_embeds WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'embed';
                block.title = row?.title;
                block.html = row?.html;
                break;
            }
            case 'blocks.cta': {
                const r = await strapi.query(`SELECT eyebrow, title, description, theme FROM components_blocks_ctas WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'cta';
                block.eyebrow = row?.eyebrow;
                block.title = row?.title;
                block.description = row?.description;
                block.theme = row?.theme;
                break;
            }
            case 'blocks.hero': {
                const r = await strapi.query(`SELECT eyebrow, title, description, theme FROM components_blocks_heroes WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'hero';
                block.eyebrow = row?.eyebrow;
                block.title = row?.title;
                block.description = row?.description;
                block.theme = row?.theme;
                const imageIds = await resolveFileForComponent('blocks.hero', cmpId, 'backgroundImage');
                block.imageId = imageIds[0] || null;
                break;
            }
            case 'blocks.archive-feed': {
                const r = await strapi.query(`SELECT title, description, content_type, "limit" FROM components_blocks_archive_feeds WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'archive-feed';
                block.title = row?.title;
                block.description = row?.description;
                block.contentType = row?.content_type;
                block.limit = row?.limit;
                const catRes = await strapi.query(`SELECT category_id FROM components_blocks_archive_feeds_categories_lnk WHERE archive_feed_id = $1`, [cmpId]);
                block.categoryIds = catRes.rows
                    .map((c) => idMaps.category.get(c.category_id))
                    .filter(Boolean);
                break;
            }
            case 'blocks.link-grid': {
                const r = await strapi.query(`SELECT title, description FROM components_blocks_link_grids WHERE id = $1`, [cmpId]);
                const row = r.rows[0];
                block.type = 'link-grid';
                block.title = row?.title;
                block.description = row?.description;
                break;
            }
            default:
                console.warn(`Unknown component type: ${type}`);
                continue;
        }
        blocks.push(block);
    }
    return { blocks, sources, seo };
}
async function migrateContentItem(type, table, fieldsSql, rowMapper) {
    const idCol = entityIdColumn[table];
    const rows = await strapi.query(`
    SELECT id, document_id, title, slug, excerpt, created_at, updated_at, published_at,
           published_at_custom, cover_source, preview, views
           ${fieldsSql ? `, ${fieldsSql}` : ''}
    FROM ${table}
    ORDER BY id
  `);
    const bySlug = new Map();
    for (const row of rows.rows) {
        const existing = bySlug.get(row.slug);
        if (!existing) {
            bySlug.set(row.slug, row);
        }
        else {
            const existingPublished = !!existing.published_at || existing.editorial_status === 'published';
            const rowPublished = !!row.published_at || row.editorial_status === 'published';
            if ((!existingPublished && rowPublished) ||
                (existingPublished === rowPublished && new Date(row.updated_at) > new Date(existing.updated_at))) {
                bySlug.set(row.slug, row);
            }
        }
    }
    const selected = Array.from(bySlug.values());
    for (const row of selected) {
        const id = (0, crypto_1.randomUUID)();
        idMaps.content.set(`${type}:${row.id}`, id);
        const { blocks, sources, seo } = await buildContentBlocks(table, row.id);
        const authorRes = await strapi.query(`SELECT author_id FROM ${table}_author_lnk WHERE ${idCol} = $1`, [row.id]);
        const authorId = authorRes.rows[0]?.author_id
            ? idMaps.author.get(authorRes.rows[0].author_id)
            : null;
        const catRes = await strapi.query(`SELECT category_id FROM ${table}_categories_lnk WHERE ${idCol} = $1`, [row.id]);
        const categoryIds = catRes.rows
            .map((c) => idMaps.category.get(c.category_id))
            .filter(Boolean);
        let tagIds = [];
        const tagTableExists = await strapi.query(`SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`, [`${table}_tags_lnk`]);
        if (tagTableExists.rowCount && tagTableExists.rowCount > 0) {
            const tagRes = await strapi.query(`SELECT tag_id FROM ${table}_tags_lnk WHERE ${idCol} = $1`, [row.id]);
            tagIds = tagRes.rows
                .map((t) => idMaps.tag.get(t.tag_id))
                .filter(Boolean);
        }
        const relatedTypeForCover = type === 'article'
            ? 'api::article.article'
            : type === 'news'
                ? 'api::news.news'
                : type === 'video'
                    ? 'api::video.video'
                    : `api::${type}.${type}`;
        const coverRes = await strapi.query(`SELECT file_id FROM files_related_mph WHERE related_type = $1 AND related_id = $2 AND field = 'cover'`, [relatedTypeForCover, row.id]);
        const coverMediaId = coverRes.rows[0]?.file_id
            ? idMaps.media.get(coverRes.rows[0].file_id)
            : null;
        const mapped = rowMapper(row);
        if (row.source_name || row.source_url) {
            sources.push({ name: row.source_name, url: row.source_url });
        }
        if (row.video_url) {
            blocks.unshift({
                id: (0, crypto_1.randomUUID)(),
                type: 'video-player',
                videoUrl: row.video_url,
                duration: row.duration,
            });
        }
        await prisma.contentItem.create({
            data: {
                id,
                type,
                title: row.title,
                slug: row.slug,
                excerpt: row.excerpt,
                status: mapped.status,
                publishedAt: row.published_at,
                publishedAtCustom: row.published_at_custom,
                coverMediaId,
                coverSource: row.cover_source,
                featured: mapped.featured ?? false,
                pinned: mapped.pinned ?? false,
                homepageLead: mapped.homepageLead ?? false,
                homepageSpecialBlock: mapped.homepageSpecialBlock ?? false,
                materialLabel: mapped.materialLabel,
                readingTime: mapped.readingTime,
                preview: row.preview ?? false,
                contentBlocks: blocks,
                sources: sources.length ? sources : null,
                seo,
                videoUrl: row.video_url || null,
                viewsTotal: row.views ?? 0,
                authorId,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                submittedAt: mapped.submittedAt,
                reviewedAt: mapped.reviewedAt,
                reviewComment: mapped.reviewComment,
                categories: categoryIds.length
                    ? { connect: categoryIds.map((id) => ({ id })) }
                    : undefined,
                tags: tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
            },
        });
    }
    console.log(`Migrated ${selected.length} ${type}s (${rows.rowCount} raw rows).`);
}
async function migrateArticles() {
    await migrateContentItem(client_1.ContentType.article, 'articles', 'featured, pinned, homepage_lead, homepage_special_block, reading_time, material_label, editorial_status, submitted_at, reviewed_at, review_comment', (row) => ({
        status: row.editorial_status === 'published' ? client_1.ContentStatus.published : client_1.ContentStatus.draft,
        featured: row.featured,
        pinned: row.pinned,
        homepageLead: row.homepage_lead,
        homepageSpecialBlock: row.homepage_special_block,
        readingTime: row.reading_time,
        materialLabel: row.material_label,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        reviewComment: row.review_comment,
    }));
}
async function migrateNews() {
    await migrateContentItem(client_1.ContentType.news, 'news_items', 'featured, pinned, homepage_lead, homepage_special_block, material_label, source_name, source_url', (row) => ({
        status: row.published_at ? client_1.ContentStatus.published : client_1.ContentStatus.draft,
        featured: row.featured,
        pinned: row.pinned,
        homepageLead: row.homepage_lead,
        homepageSpecialBlock: row.homepage_special_block,
        materialLabel: row.material_label,
    }));
}
async function migrateVideos() {
    await migrateContentItem(client_1.ContentType.video, 'videos', 'pinned, homepage_lead, homepage_special_block, material_label, video_url, duration', (row) => ({
        status: row.published_at ? client_1.ContentStatus.published : client_1.ContentStatus.draft,
        pinned: row.pinned,
        homepageLead: row.homepage_lead,
        homepageSpecialBlock: row.homepage_special_block,
        materialLabel: row.material_label,
    }));
}
async function migrateGalleries() {
    await migrateContentItem(client_1.ContentType.gallery, 'galleries', '', (row) => ({
        status: row.published_at ? client_1.ContentStatus.published : client_1.ContentStatus.draft,
    }));
}
async function main() {
    console.log('Connecting to Strapi DB:', strapiDbUrl.replace(/:\/\/.*@/, '://***@'));
    await resetTarget();
    await migrateMedia();
    await migrateAuthors();
    await migrateCategories();
    await migrateTags();
    await migrateArticles();
    await migrateNews();
    await migrateVideos();
    await migrateGalleries();
    console.log('ETL complete.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await strapi.end();
    await prisma.$disconnect();
});
//# sourceMappingURL=etl.js.map