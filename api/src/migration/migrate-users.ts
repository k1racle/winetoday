import { Pool } from 'pg';
import { PrismaClient, Role } from '@prisma/client';

const strapiDbUrl =
  process.env.STRAPI_DATABASE_URL ||
  process.env.DATABASE_URL?.replace(/\/[^/]*$/, '/vino_portal');

if (!strapiDbUrl) {
  throw new Error('STRAPI_DATABASE_URL or DATABASE_URL must be set');
}

const strapi = new Pool({ connectionString: strapiDbUrl });
const prisma = new PrismaClient();

function slugify(value: string) {
  return (value || 'author')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Replays ETL slug assignment: Strapi author id → API author uuid */
async function buildAuthorIdMap(): Promise<Map<number, string>> {
  const rows = await strapi.query(`
    SELECT id, name, slug
    FROM authors
    ORDER BY id
  `);

  const usedSlugs = new Set<string>();
  const map = new Map<number, string>();

  for (const row of rows.rows) {
    let slug = row.slug || slugify(row.name);
    if (usedSlugs.has(slug)) {
      let suffix = 2;
      while (usedSlugs.has(`${slug}-${suffix}`)) suffix++;
      slug = `${slug}-${suffix}`;
    }
    usedSlugs.add(slug);

    const apiAuthor = await prisma.author.findUnique({ where: { slug } });
    if (!apiAuthor) {
      console.warn(`API author not found for Strapi author ${row.id} (${row.name}, slug=${slug})`);
      continue;
    }
    map.set(row.id, apiAuthor.id);
  }

  return map;
}

type StrapiUserRow = {
  user_id: number;
  username: string;
  email: string;
  password: string | null;
  blocked: boolean | null;
  display_name: string | null;
  strapi_author_id: number | null;
  role_type: string | null;
};

async function loadStrapiUsers(): Promise<StrapiUserRow[]> {
  const res = await strapi.query(`
    SELECT
      u.id AS user_id,
      u.username,
      u.email,
      u.password,
      u.blocked,
      mp.display_name,
      mal.author_id AS strapi_author_id,
      r.type AS role_type
    FROM up_users u
    LEFT JOIN member_profiles_user_lnk mul ON mul.user_id = u.id
    LEFT JOIN member_profiles mp ON mp.id = mul.member_profile_id
    LEFT JOIN member_profiles_author_lnk mal ON mal.member_profile_id = mp.id
    LEFT JOIN up_users_role_lnk url ON url.user_id = u.id
    LEFT JOIN up_roles r ON r.id = url.role_id
    WHERE COALESCE(u.blocked, false) = false
    ORDER BY u.id, mal.author_id
  `);
  return res.rows;
}

function groupByUser(rows: StrapiUserRow[]): Map<number, StrapiUserRow[]> {
  const grouped = new Map<number, StrapiUserRow[]>();
  for (const row of rows) {
    const list = grouped.get(row.user_id) ?? [];
    list.push(row);
    grouped.set(row.user_id, list);
  }
  return grouped;
}

async function pickAuthorId(
  rows: StrapiUserRow[],
  authorIdMap: Map<number, string>,
): Promise<string | null> {
  const candidates = rows
    .map((r) => r.strapi_author_id)
    .filter((id): id is number => id != null);

  if (!candidates.length) return null;

  let bestApiId: string | null = null;
  let bestCount = -1;

  for (const strapiId of candidates) {
    const apiId = authorIdMap.get(strapiId);
    if (!apiId) continue;
    const count = await prisma.contentItem.count({ where: { authorId: apiId } });
    if (count > bestCount) {
      bestCount = count;
      bestApiId = apiId;
    }
  }

  if (bestApiId) return bestApiId;

  const first = authorIdMap.get(candidates[0]);
  return first ?? null;
}

function resolveRole(rows: StrapiUserRow[], authorId: string | null): Role {
  const roleType = rows.find((r) => r.role_type)?.role_type;
  if (roleType === 'editor') return Role.editor;
  if (authorId) return Role.author;
  return Role.member;
}

async function migrateUsers() {
  const authorIdMap = await buildAuthorIdMap();
  const grouped = groupByUser(await loadStrapiUsers());

  let created = 0;
  let skipped = 0;

  for (const [, rows] of grouped) {
    const base = rows[0];
    if (!base.email) {
      console.warn(`Skip user ${base.user_id}: no email`);
      skipped++;
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: base.email } });
    if (existing) {
      console.log(`Skip existing: ${base.email}`);
      skipped++;
      continue;
    }

    if (base.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: base.username },
      });
      if (existingUsername) {
        console.warn(`Skip ${base.email}: username ${base.username} taken`);
        skipped++;
        continue;
      }
    }

    const authorId = await pickAuthorId(rows, authorIdMap);
    const role = resolveRole(rows, authorId);

    if (authorId) {
      const linked = await prisma.memberProfile.findFirst({
        where: { authorId },
      });
      if (linked) {
        console.warn(
          `Author ${authorId} already linked to another user, skip link for ${base.email}`,
        );
      }
    }

    const safeAuthorId =
      authorId &&
      !(await prisma.memberProfile.findFirst({ where: { authorId } }))
        ? authorId
        : null;

    await prisma.user.create({
      data: {
        email: base.email,
        username: base.username || null,
        passwordHash: base.password || null,
        role,
        memberProfile: {
          create: {
            displayName: base.display_name || base.username || base.email.split('@')[0],
            authorId: safeAuthorId,
          },
        },
      },
    });

    console.log(`Created: ${base.email} (${role})${safeAuthorId ? ` → author ${safeAuthorId}` : ''}`);
    created++;
  }

  console.log(`Done. Created ${created}, skipped ${skipped}.`);
}

migrateUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await strapi.end();
    await prisma.$disconnect();
  });
