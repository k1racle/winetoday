"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DRY_RUN = process.env.DRY_RUN === 'true';
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function main() {
    if (DRY_RUN) {
        console.log('DRY RUN: no database rows will be changed');
    }
    const allCategories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true, parentId: true },
    });
    const duplicatePattern = /^(.*)-(\d+)$/;
    const duplicates = allCategories.filter((c) => duplicatePattern.test(c.slug));
    console.log(`Found ${duplicates.length} duplicate categor(y/ies) with numeric suffix`);
    const slugToCanonical = new Map();
    for (const c of allCategories) {
        if (!duplicatePattern.test(c.slug)) {
            slugToCanonical.set(c.slug, c);
        }
    }
    for (const dup of duplicates) {
        const match = dup.slug.match(duplicatePattern);
        if (!match)
            continue;
        const canonicalSlug = match[1];
        const canonical = slugToCanonical.get(canonicalSlug);
        if (!canonical) {
            console.log(`No canonical category for ${dup.slug} (${dup.name}), skipping`);
            continue;
        }
        console.log(`Merging ${dup.slug} (${dup.name}) into ${canonical.slug} (${canonical.name})`);
        if (!DRY_RUN) {
            await prisma.$executeRawUnsafe(`INSERT INTO "_CategoryToContentItem" ("A", "B")
         SELECT $1::uuid, "B"
         FROM "_CategoryToContentItem"
         WHERE "A" = $2::uuid
         ON CONFLICT ("A", "B") DO NOTHING`, canonical.id, dup.id);
            await prisma.$executeRawUnsafe(`DELETE FROM "_CategoryToContentItem" WHERE "A" = $1::uuid`, dup.id);
            await prisma.category.updateMany({
                where: { parentId: dup.id },
                data: { parentId: canonical.id },
            });
            await prisma.category.delete({ where: { id: dup.id } });
            console.log(` -> merged and deleted ${dup.slug}`);
        }
        else {
            console.log(` -> WOULD merge and delete ${dup.slug}`);
        }
    }
    const slugReplacements = duplicates
        .map((dup) => {
        const match = dup.slug.match(duplicatePattern);
        if (!match)
            return null;
        const canonical = slugToCanonical.get(match[1]);
        if (!canonical)
            return null;
        return { from: dup.slug, to: canonical.slug };
    })
        .filter(Boolean);
    if (slugReplacements.length > 0 && !DRY_RUN) {
        await replaceSlugsInJsonFields(slugReplacements);
    }
    await prisma.$disconnect();
    console.log('Done.');
}
async function replaceSlugsInJsonFields(replacements) {
    const sorted = [...replacements].sort((a, b) => b.from.length - a.from.length);
    const replaceInValue = (value) => {
        if (typeof value === 'string') {
            let result = value;
            for (const { from, to } of sorted) {
                result = result.split(from).join(to);
            }
            return result;
        }
        if (Array.isArray(value)) {
            return value.map(replaceInValue);
        }
        if (value && typeof value === 'object') {
            const next = {};
            for (const [key, val] of Object.entries(value)) {
                next[key] = replaceInValue(val);
            }
            return next;
        }
        return value;
    };
    const jsonColumns = [
        { table: 'ContentItem', column: 'contentBlocks' },
        { table: 'ContentItem', column: 'sources' },
        { table: 'ContentItem', column: 'tastingNote' },
        { table: 'ContentItem', column: 'seo' },
        { table: 'StaticPage', column: 'contentBlocks' },
        { table: 'StaticPage', column: 'seo' },
        { table: 'Homepage', column: 'infographicCards' },
        { table: 'Homepage', column: 'blocks' },
        { table: 'Sidebar', column: 'archiveBlocks' },
        { table: 'Sidebar', column: 'sections' },
        { table: 'Sidebar', column: 'links' },
        { table: 'Sidebar', column: 'paths' },
        { table: 'SiteSettings', column: 'typography' },
        { table: 'SiteSettings', column: 'socialLinks' },
        { table: 'SiteHeader', column: 'menu' },
        { table: 'SiteFooter', column: 'columns' },
        { table: 'SiteSeo', column: 'defaultSeo' },
        { table: 'SiteSeo', column: 'robotsRules' },
        { table: 'CommunitySettings', column: 'shareNetworks' },
        { table: 'SocialAuthSettings', column: 'providers' },
        { table: 'ArchiveSettings', column: 'settings' },
    ];
    for (const { table, column } of jsonColumns) {
        const model = prisma[table];
        if (!model || typeof model.findMany !== 'function') {
            continue;
        }
        const records = await model.findMany({});
        let updated = 0;
        for (const record of records) {
            const original = record[column];
            if (original == null)
                continue;
            const replaced = replaceInValue(original);
            if (JSON.stringify(original) === JSON.stringify(replaced))
                continue;
            await model.update({ where: { id: record.id }, data: { [column]: replaced } });
            updated++;
        }
        if (updated > 0) {
            console.log(`Updated ${updated} row(s) in ${table}.${column}`);
        }
    }
}
main().catch((err) => {
    console.error(err);
    prisma.$disconnect().finally(() => process.exit(1));
});
//# sourceMappingURL=deduplicate-categories.js.map