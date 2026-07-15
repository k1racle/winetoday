import { Pool } from 'pg';
import { PrismaClient, ContentStatus, ContentType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const sourceApiDbUrl =
  process.env.SOURCE_API_DATABASE_URL ||
  process.env.DATABASE_URL?.replace(/\/[^/]*$/, '/winetoday_api');

const sourceStrapiDbUrl =
  process.env.SOURCE_STRAPI_DATABASE_URL ||
  process.env.DATABASE_URL?.replace(/\/[^/]*$/, '/vino_portal');

if (!sourceApiDbUrl || !sourceStrapiDbUrl) {
  throw new Error('SOURCE_API_DATABASE_URL and SOURCE_STRAPI_DATABASE_URL or DATABASE_URL must be set');
}

const api = new Pool({ connectionString: sourceApiDbUrl });
const strapi = new Pool({ connectionString: sourceStrapiDbUrl });
const prisma = new PrismaClient();

const idMaps = {
  user: new Map<string, string>(),
  author: new Map<string, string>(),
  category: new Map<string, string>(),
  tag: new Map<string, string>(),
  media: new Map<string, string>(),
  content: new Map<string, string>(),
};

const contentTypeUidMap: Record<string, ContentType> = {
  'api::article.article': ContentType.article,
  'api::news.news': ContentType.news,
  'api::video.video': ContentType.video,
  'api::gallery.gallery': ContentType.gallery,
};

const strapiTypeToTable: Record<ContentType, string> = {
  [ContentType.article]: 'articles',
  [ContentType.news]: 'news_items',
  [ContentType.video]: 'videos',
  [ContentType.gallery]: 'galleries',
  [ContentType.page]: '',
};

function logMap(label: string, map: Map<any, any>) {
  console.log(`${label}: ${map.size}`);
}

async function resetTarget() {
  const tables = [
    'content_view_events',
    'content_view_daily',
    'content_view_totals',
    'author_view_daily',
    'author_subscriptions',
    '_ContentItemToTag',
    '_CategoryToContentItem',
    'comments',
    'reactions',
    'content_items',
    'media_assets',
    'tags',
    'categories',
    'authors',
    'member_profiles',
    'oauth_accounts',
    'users',
    'site_settings',
    'site_seo',
    'site_header',
    'site_footer',
    'homepage',
    'sidebars',
    'archive_settings',
    'community_settings',
    'social_auth_settings',
    'static_pages',
  ];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (e) {
      // table may not exist
    }
  }
  console.log('Target tables truncated.');
}

async function migrateUsers() {
  const rows = await api.query('SELECT id, email, username, "passwordHash", role, created_at, updated_at FROM users ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.user.create({
      data: {
        id: row.id,
        email: row.email,
        username: row.username,
        passwordHash: row.passwordHash,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.user.set(row.email, row.id);
  }

  const strapiRows = await strapi.query('SELECT id, document_id, username, email, provider, password, confirmed, blocked, created_at, updated_at FROM up_users ORDER BY id');
  for (const row of strapiRows.rows) {
    if (idMaps.user.has(row.email)) {
      idMaps.user.set(`strapi:${row.id}`, idMaps.user.get(row.email)!);
      continue;
    }
    const id = randomUUID();
    await prisma.user.create({
      data: {
        id,
        email: row.email,
        username: row.username,
        passwordHash: row.password,
        role: 'member',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.user.set(row.email, id);
    idMaps.user.set(`strapi:${row.id}`, id);
  }
  console.log(`Migrated ${rows.rowCount} API users + ${strapiRows.rowCount} Strapi users.`);
}

async function migrateAuthors() {
  const rows = await api.query('SELECT id, name, slug, position, bio, "memberProfileId", "avatarMediaId", created_at, updated_at FROM authors ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.author.create({
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        position: row.position,
        bio: row.bio,
        memberProfileId: row.memberProfileId,
        avatarMediaId: row.avatarMediaId,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.author.set(row.slug, row.id);
  }

  const strapiRows = await strapi.query('SELECT id, document_id, name, slug, position, bio, email, telegram, website, created_at, updated_at FROM authors ORDER BY id');
  for (const row of strapiRows.rows) {
    if (idMaps.author.has(row.slug)) {
      idMaps.author.set(`strapi:${row.id}`, idMaps.author.get(row.slug)!);
      continue;
    }
    const id = randomUUID();
    await prisma.author.create({
      data: {
        id,
        name: row.name,
        slug: row.slug,
        position: row.position,
        bio: row.bio,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.author.set(row.slug, id);
    idMaps.author.set(`strapi:${row.id}`, id);
  }
  console.log(`Migrated ${rows.rowCount} API authors + ${strapiRows.rowCount} Strapi authors.`);
}

async function migrateMemberProfiles() {
  const rows = await api.query('SELECT id, "userId", display_name, account_type, "authorId", created_at, updated_at FROM member_profiles ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.memberProfile.create({
      data: {
        id: row.id,
        userId: row.userId,
        displayName: row.display_name,
        accountType: row.account_type,
        authorId: row.authorId,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }
  console.log(`Migrated ${rows.rowCount} member profiles.`);
}

async function migrateCategories() {
  const rows = await api.query('SELECT id, name, slug, "parentId", created_at, updated_at FROM categories ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.category.create({
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        parentId: row.parentId,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.category.set(row.slug, row.id);
  }

  const strapiRows = await strapi.query('SELECT id, document_id, name, slug, description, created_at, updated_at FROM categories ORDER BY id');
  for (const row of strapiRows.rows) {
    if (idMaps.category.has(row.slug)) {
      idMaps.category.set(`strapi:${row.id}`, idMaps.category.get(row.slug)!);
      continue;
    }
    const id = randomUUID();
    await prisma.category.create({
      data: {
        id,
        name: row.name,
        slug: row.slug,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.category.set(row.slug, id);
    idMaps.category.set(`strapi:${row.id}`, id);
  }
  console.log(`Migrated ${rows.rowCount} API categories + ${strapiRows.rowCount} Strapi categories.`);
}

async function migrateTags() {
  const rows = await api.query('SELECT id, name, slug, created_at, updated_at FROM tags ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.tag.create({
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.tag.set(row.slug, row.id);
  }

  const strapiRows = await strapi.query('SELECT id, document_id, name, slug, created_at, updated_at FROM tags ORDER BY id');
  for (const row of strapiRows.rows) {
    if (idMaps.tag.has(row.slug)) {
      idMaps.tag.set(`strapi:${row.id}`, idMaps.tag.get(row.slug)!);
      continue;
    }
    const id = randomUUID();
    await prisma.tag.create({
      data: {
        id,
        name: row.name,
        slug: row.slug,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
    idMaps.tag.set(row.slug, id);
    idMaps.tag.set(`strapi:${row.id}`, id);
  }
  console.log(`Migrated ${rows.rowCount} API tags + ${strapiRows.rowCount} Strapi tags.`);
}

async function migrateMediaAssets() {
  const rows = await api.query('SELECT id, path, mime, width, height, alt_text, size_bytes, created_at FROM media_assets ORDER BY created_at');
  for (const row of rows.rows) {
    await prisma.mediaAsset.create({
      data: {
        id: row.id,
        path: row.path,
        mime: row.mime,
        width: row.width,
        height: row.height,
        altText: row.alt_text,
        sizeBytes: row.size_bytes ? BigInt(row.size_bytes) : null,
        createdAt: row.created_at,
      },
    });
    idMaps.media.set(row.path, row.id);
  }

  const strapiRows = await strapi.query('SELECT id, document_id, name, alternative_text, caption, width, height, mime, size, url, created_at, updated_at FROM files ORDER BY id');
  for (const row of strapiRows.rows) {
    const path = row.url;
    if (idMaps.media.has(path)) {
      idMaps.media.set(`strapi:${row.id}`, idMaps.media.get(path)!);
      continue;
    }
    const id = randomUUID();
    await prisma.mediaAsset.create({
      data: {
        id,
        path,
        mime: row.mime,
        width: row.width,
        height: row.height,
        altText: row.alternative_text,
        sizeBytes: row.size ? BigInt(Math.round(row.size)) : null,
        createdAt: row.created_at,
      },
    });
    idMaps.media.set(path, id);
    idMaps.media.set(`strapi:${row.id}`, id);
  }
  console.log(`Migrated ${rows.rowCount} API media + ${strapiRows.rowCount} Strapi files.`);
}

async function migrateApiContentItems() {
  const rows = await api.query(`
    SELECT id, type, title, slug, excerpt, status, published_at, published_at_custom,
           "coverMediaId", "archiveCoverMediaId", cover_source, featured, pinned,
           homepage_lead, homepage_special_block, material_label, reading_time, preview,
           content_blocks, sources, tasting_note, video_url, duration, seo, views_total,
           "authorId", created_at, updated_at, submitted_at, reviewed_at, review_comment
    FROM content_items
    ORDER BY created_at
  `);

  for (const row of rows.rows) {
    await prisma.contentItem.create({
      data: {
        id: row.id,
        type: row.type,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        status: row.status,
        publishedAt: row.published_at,
        publishedAtCustom: row.published_at_custom,
        coverMediaId: row.coverMediaId,
        archiveCoverMediaId: row.archiveCoverMediaId,
        coverSource: row.cover_source,
        featured: row.featured,
        pinned: row.pinned,
        homepageLead: row.homepage_lead,
        homepageSpecialBlock: row.homepage_special_block,
        materialLabel: row.material_label,
        readingTime: row.reading_time,
        preview: row.preview,
        contentBlocks: row.content_blocks ?? [],
        sources: row.sources,
        tastingNote: row.tasting_note,
        videoUrl: row.video_url,
        duration: row.duration,
        seo: row.seo,
        viewsTotal: row.views_total ?? 0,
        authorId: row.authorId,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        reviewComment: row.review_comment,
      },
    });
    idMaps.content.set(`${row.type}:${row.slug}`, row.id);
  }
  console.log(`Migrated ${rows.rowCount} API content items.`);
}

async function resolveFileForComponent(relatedType: string, relatedId: number, field: string) {
  const res = await strapi.query(
    `SELECT file_id FROM files_related_mph WHERE related_type = $1 AND related_id = $2 AND field = $3 ORDER BY "order" ASC`,
    [relatedType, relatedId, field],
  );
  return res.rows.map((r) => idMaps.media.get(`strapi:${r.file_id}`)).filter(Boolean) as string[];
}

async function buildContentBlocks(table: string, entityId: number) {
  const cmpRows = await strapi.query(
    `SELECT cmp_id, component_type, field, "order" FROM ${table}_cmps WHERE entity_id = $1 ORDER BY COALESCE("order", 9999) ASC, id ASC`,
    [entityId],
  );

  const blocks: any[] = [];
  const sources: any[] = [];
  let seo: any = null;

  for (const cmp of cmpRows.rows) {
    const type = cmp.component_type as string;
    const cmpId = cmp.cmp_id as number;

    if (type === 'shared.seo') {
      const r = await strapi.query(
        `SELECT meta_title, meta_description, keywords, canonical_url, no_index, no_follow FROM components_shared_seos WHERE id = $1`,
        [cmpId],
      );
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
      if (s) sources.push({ name: s.name, url: s.url });
      continue;
    }

    let block: any = { id: randomUUID() };

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
        block.categoryIds = catRes.rows.map((c) => idMaps.category.get(`strapi:${c.category_id}`)).filter(Boolean);
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

async function migrateStrapiContentItems() {
  const entityIdColumn: Record<string, string> = {
    articles: 'article_id',
    news_items: 'news_id',
    videos: 'video_id',
    galleries: 'gallery_id',
  };

  for (const [strapiType, table] of Object.entries(strapiTypeToTable).filter(([t]) => t !== 'page')) {
    const type = strapiType as ContentType;
    const idCol = entityIdColumn[table];

    const rows = await strapi.query(`
      SELECT id, document_id, title, slug, excerpt, created_at, updated_at, published_at,
             published_at_custom, cover_source, preview, views
             ${type === 'article' ? ', featured, pinned, homepage_lead, homepage_special_block, reading_time, material_label, editorial_status, submitted_at, reviewed_at, review_comment' : ''}
             ${type === 'news' ? ', featured, pinned, homepage_lead, homepage_special_block, material_label, source_name, source_url' : ''}
             ${type === 'video' ? ', pinned, homepage_lead, homepage_special_block, material_label, video_url, duration' : ''}
      FROM ${table}
      ORDER BY id
    `);

    const bySlug = new Map<string, any>();
    for (const row of rows.rows) {
      const existing = bySlug.get(row.slug);
      if (!existing) {
        bySlug.set(row.slug, row);
      } else {
        const existingPublished = !!existing.published_at || existing.editorial_status === 'published';
        const rowPublished = !!row.published_at || row.editorial_status === 'published';
        if (
          (!existingPublished && rowPublished) ||
          (existingPublished === rowPublished && new Date(row.updated_at) > new Date(existing.updated_at))
        ) {
          bySlug.set(row.slug, row);
        }
      }
    }
    const selected = Array.from(bySlug.values());

    for (const row of selected) {
      if (idMaps.content.has(`${type}:${row.slug}`)) {
        continue;
      }

      const id = randomUUID();
      idMaps.content.set(`${type}:${row.slug}`, id);
      idMaps.content.set(`strapi:${type}:${row.document_id}`, id);

      const { blocks, sources, seo } = await buildContentBlocks(table, row.id);

      const authorRes = await strapi.query(`SELECT author_id FROM ${table}_author_lnk WHERE ${idCol} = $1`, [row.id]);
      const authorId = authorRes.rows[0]?.author_id ? idMaps.author.get(`strapi:${authorRes.rows[0].author_id}`) : null;

      const catRes = await strapi.query(`SELECT category_id FROM ${table}_categories_lnk WHERE ${idCol} = $1`, [row.id]);
      const categoryIds = catRes.rows.map((c) => idMaps.category.get(`strapi:${c.category_id}`)).filter(Boolean) as string[];

      let tagIds: string[] = [];
      const tagTableExists = await strapi.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [`${table}_tags_lnk`],
      );
      if (tagTableExists.rowCount && tagTableExists.rowCount > 0) {
        const tagRes = await strapi.query(`SELECT tag_id FROM ${table}_tags_lnk WHERE ${idCol} = $1`, [row.id]);
        tagIds = tagRes.rows.map((t) => idMaps.tag.get(`strapi:${t.tag_id}`)).filter(Boolean) as string[];
      }

      const relatedTypeForCover = `api::${type === 'news' ? 'news.news' : type === 'video' ? 'video.video' : type === 'gallery' ? 'gallery.gallery' : 'article.article'}`;
      const coverRes = await strapi.query(
        `SELECT file_id FROM files_related_mph WHERE related_type = $1 AND related_id = $2 AND field = 'cover'`,
        [relatedTypeForCover, row.id],
      );
      const coverMediaId = coverRes.rows[0]?.file_id ? idMaps.media.get(`strapi:${coverRes.rows[0].file_id}`) : null;

      if (row.source_name || row.source_url) {
        sources.push({ name: row.source_name, url: row.source_url });
      }

      if (row.video_url) {
        blocks.unshift({ id: randomUUID(), type: 'video-player', videoUrl: row.video_url, duration: row.duration });
      }

      const status = row.published_at ? ContentStatus.published : ContentStatus.draft;

      await prisma.contentItem.create({
        data: {
          id,
          type,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          status,
          publishedAt: row.published_at,
          publishedAtCustom: row.published_at_custom,
          coverMediaId,
          coverSource: row.cover_source,
          featured: row.featured ?? false,
          pinned: row.pinned ?? false,
          homepageLead: row.homepage_lead ?? false,
          homepageSpecialBlock: row.homepage_special_block ?? false,
          materialLabel: row.material_label,
          readingTime: row.reading_time,
          preview: row.preview ?? false,
          contentBlocks: blocks,
          sources: sources.length ? sources : null,
          seo,
          videoUrl: row.video_url || null,
          viewsTotal: row.views ?? 0,
          authorId,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          submittedAt: row.submitted_at,
          reviewedAt: row.reviewed_at,
          reviewComment: row.review_comment,
          categories: categoryIds.length ? { connect: categoryIds.map((cid) => ({ id: cid })) } : undefined,
          tags: tagIds.length ? { connect: tagIds.map((tid) => ({ id: tid })) } : undefined,
        },
      });
    }

    console.log(`Migrated ${selected.length} Strapi ${type}s (${rows.rowCount} raw rows).`);
  }
}

async function migrateApiContentRelations() {
  const catRows = await api.query('SELECT "A", "B" FROM "_CategoryToContentItem" ORDER BY "A"');
  for (const row of catRows.rows) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_CategoryToContentItem" ("A", "B") VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
        row.A,
        row.B,
      );
    } catch (e) {
      console.warn('Category relation failed:', e.message);
    }
  }

  const tagRows = await api.query('SELECT "A", "B" FROM "_ContentItemToTag" ORDER BY "A"');
  for (const row of tagRows.rows) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_ContentItemToTag" ("A", "B") VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
        row.A,
        row.B,
      );
    } catch (e) {
      console.warn('Tag relation failed:', e.message);
    }
  }
  console.log(`Migrated ${catRows.rowCount} category relations + ${tagRows.rowCount} tag relations.`);
}

async function migrateCommentsAndReactions() {
  const commentRows = await strapi.query(`
    SELECT c.id, c.content_type_uid, c.target_document_id, c.target_slug, c.guest_name, c.guest_email,
           c.body, c.status, c.created_at, c.updated_at, l.user_id
    FROM comments c
    LEFT JOIN comments_author_user_lnk l ON l.comment_id = c.id
    ORDER BY c.id
  `);

  for (const row of commentRows.rows) {
    const type = contentTypeUidMap[row.content_type_uid];
    if (!type) continue;
    const contentItemId = idMaps.content.get(`strapi:${type}:${row.target_document_id}`);
    if (!contentItemId) {
      console.warn(`Comment ${row.id}: content item not found`);
      continue;
    }
    const userId = row.user_id ? idMaps.user.get(`strapi:${row.user_id}`) : null;
    await prisma.comment.create({
      data: {
        id: randomUUID(),
        contentItemId,
        userId,
        body: row.body,
        status: row.status ?? 'pending',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }
  console.log(`Migrated ${commentRows.rowCount} comments.`);

  const reactionRows = await strapi.query(`
    SELECT r.id, r.type, r.content_type_uid, r.target_document_id, r.guest_id, r.created_at, l.user_id
    FROM reactions r
    LEFT JOIN reactions_user_lnk l ON l.reaction_id = r.id
    ORDER BY r.id
  `);

  for (const row of reactionRows.rows) {
    const type = contentTypeUidMap[row.content_type_uid];
    if (!type) continue;
    const contentItemId = idMaps.content.get(`strapi:${type}:${row.target_document_id}`) || idMaps.content.get(`${type}:${row.target_slug}`);
    if (!contentItemId) {
      console.warn(`Reaction ${row.id}: content item not found`);
      continue;
    }
    const userId = row.user_id ? idMaps.user.get(`strapi:${row.user_id}`) : null;
    const reactionType = row.type === 'dislike' ? 'dislike' : 'like';
    await prisma.reaction.create({
      data: {
        id: randomUUID(),
        contentItemId,
        userId,
        viewerId: row.guest_id,
        type: reactionType as any,
        createdAt: row.created_at,
      },
    });
  }
  console.log(`Migrated ${reactionRows.rowCount} reactions.`);
}

async function migrateStats() {
  const totals = await api.query('SELECT content_type, "contentId", views_total, unique_viewers, last_viewed_at FROM content_view_totals');
  for (const row of totals.rows) {
    try {
      await prisma.contentViewTotal.create({
        data: {
          contentType: row.content_type,
          contentId: row.contentId,
          viewsTotal: row.views_total,
          uniqueViewers: row.unique_viewers,
          lastViewedAt: row.last_viewed_at,
        },
      });
    } catch (e) {
      console.warn('content_view_totals insert failed:', e.message);
    }
  }
  console.log(`Migrated ${totals.rowCount} view totals.`);

  const daily = await api.query('SELECT date, content_type, "contentId", "authorId", views, unique_viewers FROM content_view_daily');
  for (const row of daily.rows) {
    try {
      await prisma.contentViewDaily.create({
        data: {
          date: row.date,
          contentType: row.content_type,
          contentId: row.contentId,
          authorId: row.authorId,
          views: row.views,
          uniqueViewers: row.unique_viewers,
        },
      });
    } catch (e) {
      console.warn('content_view_daily insert failed:', e.message);
    }
  }
  console.log(`Migrated ${daily.rowCount} daily views.`);

  const events = await api.query('SELECT id, content_type, "contentId", slug, "authorId", viewer_id, viewed_at, ip_hash, user_agent, referrer FROM content_view_events');
  for (const row of events.rows) {
    try {
      await prisma.contentViewEvent.create({
        data: {
          id: row.id,
          contentType: row.content_type,
          contentId: row.contentId,
          slug: row.slug,
          authorId: row.authorId,
          viewerId: row.viewer_id,
          viewedAt: row.viewed_at,
          ipHash: row.ip_hash,
          userAgent: row.user_agent,
          referrer: row.referrer,
        },
      });
    } catch (e) {
      console.warn('content_view_event insert failed:', e.message);
    }
  }
  console.log(`Migrated ${events.rowCount} view events.`);

  const authorDaily = await api.query('SELECT date, "authorId", article_views, news_views, video_views, gallery_views, total_views FROM author_view_daily');
  for (const row of authorDaily.rows) {
    try {
      await prisma.authorViewDaily.create({
        data: {
          date: row.date,
          authorId: row.authorId,
          articleViews: row.article_views,
          newsViews: row.news_views,
          videoViews: row.video_views,
          galleryViews: row.gallery_views,
          totalViews: row.total_views,
        },
      });
    } catch (e) {
      console.warn('author_view_daily insert failed:', e.message);
    }
  }
  console.log(`Migrated ${authorDaily.rowCount} author daily views.`);
}

async function migrateOAuthAccounts() {
  const rows = await api.query('SELECT id, "userId", provider, provider_account_id, created_at FROM oauth_accounts');
  for (const row of rows.rows) {
    try {
      await prisma.oAuthAccount.create({
        data: {
          id: row.id,
          userId: row.userId,
          provider: row.provider,
          providerAccountId: row.provider_account_id,
          createdAt: row.created_at,
        },
      });
    } catch (e) {
      console.warn('oauth_account insert failed:', e.message);
    }
  }
  console.log(`Migrated ${rows.rowCount} OAuth accounts.`);
}

async function migrateApiCommentsAndReactions() {
  const comments = await api.query('SELECT id, "contentItemId", "userId", body, status, created_at, updated_at FROM comments');
  for (const row of comments.rows) {
    try {
      await prisma.comment.create({
        data: {
          id: row.id,
          contentItemId: row.contentItemId,
          userId: row.userId,
          body: row.body,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      });
    } catch (e) {
      console.warn('comment insert failed:', e.message);
    }
  }
  console.log(`Migrated ${comments.rowCount} API comments.`);

  const reactions = await api.query('SELECT id, "contentItemId", "userId", type, created_at, viewer_id FROM reactions');
  for (const row of reactions.rows) {
    try {
      await prisma.reaction.create({
        data: {
          id: row.id,
          contentItemId: row.contentItemId,
          userId: row.userId,
          viewerId: row.viewer_id,
          type: row.type,
          createdAt: row.created_at,
        },
      });
    } catch (e) {
      console.warn('reaction insert failed:', e.message);
    }
  }
  console.log(`Migrated ${reactions.rowCount} API reactions.`);
}

async function migrateSingletons() {
  const homepage = await api.query('SELECT id, title, description, infographic_cards, blocks, created_at, updated_at FROM homepage LIMIT 1');
  for (const row of homepage.rows) {
    await prisma.homepage.create({
      data: {
        id: row.id,
        title: row.title,
        description: row.description,
        infographicCards: row.infographic_cards,
        blocks: row.blocks,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const header = await api.query('SELECT id, menu, "lightLogoMediaId", "darkLogoMediaId", sticky_desktop, sticky_tablet, sticky_mobile, created_at, updated_at FROM site_header LIMIT 1');
  for (const row of header.rows) {
    await prisma.siteHeader.create({
      data: {
        id: row.id,
        menu: row.menu,
        lightLogoMediaId: row.lightLogoMediaId,
        darkLogoMediaId: row.darkLogoMediaId,
        stickyDesktop: row.sticky_desktop,
        stickyTablet: row.sticky_tablet,
        stickyMobile: row.sticky_mobile,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const footer = await api.query('SELECT id, columns, created_at, updated_at FROM site_footer LIMIT 1');
  for (const row of footer.rows) {
    await prisma.siteFooter.create({
      data: {
        id: row.id,
        columns: row.columns,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const seo = await api.query('SELECT id, default_seo, "openGraphImageMediaId", "twitterImageMediaId", robots_enabled, robots_rules, robots_host, robots_additional_sitemaps, sitemap_enabled, sitemap_exclude_paths, sitemap_include_articles, sitemap_include_news, sitemap_include_videos, sitemap_include_pages, sitemap_include_galleries, created_at, updated_at FROM site_seo LIMIT 1');
  for (const row of seo.rows) {
    await prisma.siteSeo.create({
      data: {
        id: row.id,
        defaultSeo: row.default_seo,
        openGraphImageMediaId: row.openGraphImageMediaId,
        twitterImageMediaId: row.twitterImageMediaId,
        robotsEnabled: row.robots_enabled,
        robotsRules: row.robots_rules,
        robotsHost: row.robots_host,
        robotsAdditionalSitemaps: row.robots_additional_sitemaps,
        sitemapEnabled: row.sitemap_enabled,
        sitemapExcludePaths: row.sitemap_exclude_paths,
        sitemapIncludeArticles: row.sitemap_include_articles,
        sitemapIncludeNews: row.sitemap_include_news,
        sitemapIncludeVideos: row.sitemap_include_videos,
        sitemapIncludePages: row.sitemap_include_pages,
        sitemapIncludeGalleries: row.sitemap_include_galleries,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const sidebars = await api.query('SELECT id, title, path, paths, links, sections, archive_blocks, created_at, updated_at FROM sidebars');
  for (const row of sidebars.rows) {
    await prisma.sidebar.create({
      data: {
        id: row.id,
        title: row.title,
        path: row.path,
        paths: row.paths,
        links: row.links,
        sections: row.sections,
        archiveBlocks: row.archive_blocks,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const archive = await api.query('SELECT id, settings, created_at, updated_at FROM archive_settings LIMIT 1');
  for (const row of archive.rows) {
    await prisma.archiveSettings.create({
      data: {
        id: row.id,
        settings: row.settings,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const community = await api.query('SELECT id, moderation_enabled, stop_words, share_networks, created_at, updated_at FROM community_settings LIMIT 1');
  for (const row of community.rows) {
    await prisma.communitySettings.create({
      data: {
        id: row.id,
        moderationEnabled: row.moderation_enabled,
        stopWords: row.stop_words,
        shareNetworks: row.share_networks,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const social = await api.query('SELECT id, providers, created_at, updated_at FROM social_auth_settings LIMIT 1');
  for (const row of social.rows) {
    await prisma.socialAuthSettings.create({
      data: {
        id: row.id,
        providers: row.providers,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  const pages = await api.query('SELECT id, title, slug, content_blocks, seo, created_at, updated_at FROM static_pages');
  for (const row of pages.rows) {
    await prisma.staticPage.create({
      data: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        contentBlocks: row.content_blocks,
        seo: row.seo,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }

  console.log('Migrated singletons and static pages.');
}

async function migrateSubscriptionsAndSettings() {
  const subs = await api.query('SELECT id, "userId", "authorId", created_at FROM author_subscriptions');
  for (const row of subs.rows) {
    try {
      await prisma.authorSubscription.create({
        data: {
          id: row.id,
          userId: row.userId,
          authorId: row.authorId,
          createdAt: row.created_at,
        },
      });
    } catch (e) {
      console.warn('author_subscription insert failed:', e.message);
    }
  }
  console.log(`Migrated ${subs.rowCount} author subscriptions.`);

  const settings = await api.query('SELECT id, site_name, site_description, "logoMediaId", typography, social_links, created_at, updated_at FROM site_settings LIMIT 1');
  for (const row of settings.rows) {
    await prisma.siteSettings.create({
      data: {
        id: row.id,
        siteName: row.site_name,
        siteDescription: row.site_description,
        logoMediaId: row.logoMediaId,
        typography: row.typography,
        socialLinks: row.social_links,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  }
  console.log(`Migrated ${settings.rowCount} site settings.`);
}

async function main() {
  console.log('Connecting to sources...');
  console.log('API DB:', sourceApiDbUrl.replace(/:\/\/.*@/, '://***@'));
  console.log('Strapi DB:', sourceStrapiDbUrl.replace(/:\/\/.*@/, '://***@'));

  await resetTarget();
  await migrateUsers();
  await migrateAuthors();
  await migrateMemberProfiles();
  await migrateCategories();
  await migrateTags();
  await migrateMediaAssets();
  await migrateApiContentItems();
  await migrateStrapiContentItems();
  await migrateApiContentRelations();
  await migrateApiCommentsAndReactions();
  await migrateCommentsAndReactions();
  await migrateStats();
  await migrateOAuthAccounts();
  await migrateSingletons();
  await migrateSubscriptionsAndSettings();

  logMap('content map', idMaps.content);
  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await api.end();
    await strapi.end();
    await prisma.$disconnect();
  });
