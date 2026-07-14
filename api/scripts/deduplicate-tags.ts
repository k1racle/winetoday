import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN === 'true';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function main() {
  if (DRY_RUN) {
    console.log('DRY RUN: no database rows will be changed');
  }

  const allTags = await prisma.tag.findMany({
    select: { id: true, name: true, slug: true },
  });

  const duplicatePattern = /^(.*)-(\d+)$/;
  const duplicates = allTags.filter((t) => duplicatePattern.test(t.slug));

  console.log(`Found ${duplicates.length} duplicate tag(s) with numeric suffix`);

  const slugToCanonical = new Map<string, typeof allTags[0]>();
  for (const t of allTags) {
    if (!duplicatePattern.test(t.slug)) {
      slugToCanonical.set(t.slug, t);
    }
  }

  for (const dup of duplicates) {
    const match = dup.slug.match(duplicatePattern);
    if (!match) continue;
    const canonicalSlug = match[1];
    const canonical = slugToCanonical.get(canonicalSlug);

    if (!canonical) {
      console.log(`No canonical tag for ${dup.slug} (${dup.name}), skipping`);
      continue;
    }

    console.log(`Merging ${dup.slug} (${dup.name}) into ${canonical.slug} (${canonical.name})`);

    if (!DRY_RUN) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_ContentItemToTag" ("A", "B")
         SELECT $1::uuid, "B"
         FROM "_ContentItemToTag"
         WHERE "A" = $2::uuid
         ON CONFLICT ("A", "B") DO NOTHING`,
        canonical.id,
        dup.id,
      );

      await prisma.$executeRawUnsafe(
        `DELETE FROM "_ContentItemToTag" WHERE "A" = $1::uuid`,
        dup.id,
      );

      await prisma.tag.delete({ where: { id: dup.id } });

      console.log(` -> merged and deleted ${dup.slug}`);
    } else {
      console.log(` -> WOULD merge and delete ${dup.slug}`);
    }
  }

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
