import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

const UPLOADS_DIRS = ['/app/uploads', '/app/public/uploads'];
const RASTER_EXTS = new Set(['.jpg', '.jpeg', '.jpe', '.png', '.webp', '.jfif']);
const AVIF_QUALITY = 75;
const AVIF_EFFORT = 4;
const MAX_WIDTH = 1920;

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

interface Conversion {
  originalPublicPath: string;
  avifPublicPath: string;
  originalAbsolutePath: string;
  avifAbsolutePath: string;
  converted: boolean;
}

async function main() {
  const dryRun = process.env.DRY_RUN === 'true';
  const skipExisting = process.env.SKIP_EXISTING === 'true';

  if (dryRun) {
    console.log('DRY RUN: no files or database rows will be changed');
  }

  const conversions: Conversion[] = [];

  for (const uploadsDir of UPLOADS_DIRS) {
    await fs.mkdir(uploadsDir, { recursive: true });
    const files = await collectRasterImages(uploadsDir);
    console.log(`Found ${files.length} raster image(s) in ${uploadsDir}`);

    for (const absolutePath of files) {
      const relativePath = path.relative(uploadsDir, absolutePath);
      const ext = path.extname(relativePath).toLowerCase();
      const baseRelativePath = relativePath.slice(0, -ext.length);
      const avifRelativePath = `${baseRelativePath}.avif`;

      const originalPublicPath = `/uploads/${relativePath.replace(/\\/g, '/')}`;
      const avifPublicPath = `/uploads/${avifRelativePath.replace(/\\/g, '/')}`;

      const avifAbsolutePath = path.join(uploadsDir, avifRelativePath);

      let converted = false;

      try {
        const outputExists = await fileExists(avifAbsolutePath);
        if (skipExisting && outputExists) {
          console.log(`SKIP (exists): ${originalPublicPath}`);
        } else {
          if (!dryRun) {
            console.log(`Converting: ${originalPublicPath}`);
            await sharp(absolutePath, { animated: false })
              .resize({ width: MAX_WIDTH, withoutEnlargement: true })
              .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
              .toFile(avifAbsolutePath);

            await fs.unlink(absolutePath);
            converted = true;
            console.log(` -> ${avifPublicPath}`);
          } else {
            console.log(`WOULD convert: ${originalPublicPath} -> ${avifPublicPath}`);
          }
        }
      } catch (err: any) {
        console.error(`Failed to convert ${originalPublicPath}: ${err?.message || err}`);
        continue;
      }

      conversions.push({
        originalPublicPath,
        avifPublicPath,
        originalAbsolutePath: absolutePath,
        avifAbsolutePath,
        converted,
      });

      if (!dryRun) {
        await updateMediaAsset(originalPublicPath, avifPublicPath, avifAbsolutePath);
      }
    }
  }

  console.log(`Total conversions recorded: ${conversions.length}`);

  if (!dryRun && conversions.length > 0) {
    await updateJsonContent(conversions);
  }

  await prisma.$disconnect();
  console.log('Done.');
}

async function collectRasterImages(dir: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await collectRasterImages(absolutePath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (RASTER_EXTS.has(ext)) {
        result.push(absolutePath);
      }
    }
  }

  return result;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function updateMediaAsset(originalPublicPath: string, avifPublicPath: string, avifAbsolutePath: string) {
  const assets = await prisma.mediaAsset.findMany({
    where: { path: originalPublicPath },
  });

  if (assets.length === 0) {
    return;
  }

  let sizeBytes: bigint | null = null;
  let width: number | null = null;
  let height: number | null = null;

  try {
    const stats = await fs.stat(avifAbsolutePath);
    sizeBytes = BigInt(stats.size);
    const metadata = await sharp(avifAbsolutePath).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
  } catch (err: any) {
    console.warn(`Could not read AVIF metadata for ${avifPublicPath}: ${err?.message || err}`);
  }

  for (const asset of assets) {
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        path: avifPublicPath,
        mime: 'image/avif',
        sizeBytes,
        width,
        height,
      },
    });
    console.log(`Updated MediaAsset ${asset.id}: ${originalPublicPath} -> ${avifPublicPath}`);
  }
}

async function updateJsonContent(conversions: Conversion[]) {
  const sortedMappings = [...conversions].sort(
    (a, b) => b.originalPublicPath.length - a.originalPublicPath.length,
  );

  const replaceInValue = (value: any): any => {
    if (typeof value === 'string') {
      let result = value;
      for (const { originalPublicPath, avifPublicPath } of sortedMappings) {
        result = result.split(originalPublicPath).join(avifPublicPath);
      }
      return result;
    }
    if (Array.isArray(value)) {
      return value.map(replaceInValue);
    }
    if (value && typeof value === 'object') {
      const next: any = {};
      for (const [key, val] of Object.entries(value)) {
        next[key] = replaceInValue(val);
      }
      return next;
    }
    return value;
  };

  type JsonColumn = { table: string; column: string };

  const jsonColumns: JsonColumn[] = [
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
    await processTable(table, column, replaceInValue);
  }
}

async function processTable(tableName: string, column: string, replaceInValue: (value: any) => any) {
  const model = (prisma as any)[tableName];
  if (!model || typeof model.findMany !== 'function') {
    console.warn(`Model ${tableName} not found, skipping`);
    return;
  }

  const records = await model.findMany({});
  let updatedCount = 0;

  for (const record of records) {
    const originalValue = record[column];
    if (originalValue == null) {
      continue;
    }

    const newValue = replaceInValue(originalValue);
    if (JSON.stringify(originalValue) === JSON.stringify(newValue)) {
      continue;
    }

    await model.update({
      where: { id: record.id },
      data: { [column]: newValue },
    });
    updatedCount++;
  }

  if (updatedCount > 0) {
    console.log(`Updated ${updatedCount} row(s) in ${tableName}.${column}`);
  }
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
