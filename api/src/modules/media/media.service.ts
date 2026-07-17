import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

export type MediaTypeFilter = 'image' | 'video' | 'document' | 'other';

export type MediaUsage = {
  type: string;
  id?: string;
  title?: string;
  name?: string;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly AVIF_QUALITY = 75;
  private readonly AVIF_EFFORT = 4;
  private readonly MAX_WIDTH = 1920;

  constructor(private readonly prisma: PrismaService) {}

  async createFromUpload(file: Express.Multer.File) {
    const compressed = await this.tryCompressToAvif(file);

    return this.prisma.mediaAsset.create({
      data: {
        path: `/uploads/${path.basename(compressed.path)}`,
        mime: compressed.mime,
        sizeBytes: BigInt(compressed.sizeBytes),
      },
    });
  }

  async createCoverFromUpload(file: Express.Multer.File) {
    return this.createFromUpload(file);
  }

  private async tryCompressToAvif(
    file: Express.Multer.File,
  ): Promise<{ path: string; mime: string; sizeBytes: number }> {
    const isRasterImage =
      file.mimetype.startsWith('image/') &&
      !file.mimetype.includes('svg') &&
      !file.mimetype.includes('gif');

    if (!isRasterImage) {
      return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
    }

    try {
      const ext = path.extname(file.path);
      const base = ext ? file.path.slice(0, -ext.length) : file.path;
      const outputPath = `${base}.avif`;

      const transformer = sharp(file.path, { animated: false });
      const metadata = await transformer.metadata();

      if (!metadata.width || !metadata.height) {
        return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
      }

      await transformer
        .resize({ width: this.MAX_WIDTH, withoutEnlargement: true })
        .avif({ quality: this.AVIF_QUALITY, effort: this.AVIF_EFFORT })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      await fs.unlink(file.path);

      return { path: outputPath, mime: 'image/avif', sizeBytes: stats.size };
    } catch (err: any) {
      this.logger.warn(`AVIF compression failed for ${file.path}: ${err?.message || err}`);
      return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
    }
  }

  async findAll(
    limit = 50,
    offset = 0,
    options?: { type?: MediaTypeFilter; search?: string },
  ) {
    const where: any = {};

    if (options?.type) {
      if (options.type === 'image') {
        where.mime = { startsWith: 'image/' };
      } else if (options.type === 'video') {
        where.mime = { startsWith: 'video/' };
      } else if (options.type === 'document') {
        where.OR = [
          { mime: { startsWith: 'application/' } },
          { mime: { startsWith: 'text/' } },
        ];
      } else {
        where.AND = [
          { mime: { not: { startsWith: 'image/' } } },
          { mime: { not: { startsWith: 'video/' } } },
          { mime: { not: { startsWith: 'audio/' } } },
          { mime: { not: { startsWith: 'application/' } } },
          { mime: { not: { startsWith: 'text/' } } },
        ];
      }
    }

    if (options?.search?.trim()) {
      const term = options.search.trim();
      where.OR = [
        { id: { contains: term, mode: 'insensitive' } },
        { path: { contains: term, mode: 'insensitive' } },
        { mime: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);
    return { items, total, limit, offset };
  }

  async findById(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }

  async getUsage(id: string): Promise<MediaUsage[]> {
    const media = await this.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const usage: MediaUsage[] = [];

    const [coverItems, archiveCoverItems, authors, siteSettings, siteHeaders, siteSeos] =
      await Promise.all([
        this.prisma.contentItem.findMany({
          where: { coverMediaId: id },
          select: { id: true, title: true, type: true },
        }),
        this.prisma.contentItem.findMany({
          where: { archiveCoverMediaId: id },
          select: { id: true, title: true, type: true },
        }),
        this.prisma.author.findMany({
          where: { avatarMediaId: id },
          select: { id: true, name: true },
        }),
        this.prisma.siteSettings.findMany({
          where: { logoMediaId: id },
          select: { id: true },
        }),
        this.prisma.siteHeader.findMany({
          where: { OR: [{ lightLogoMediaId: id }, { darkLogoMediaId: id }] },
          select: { id: true },
        }),
        this.prisma.siteSeo.findMany({
          where: { OR: [{ openGraphImageMediaId: id }, { twitterImageMediaId: id }] },
          select: { id: true },
        }),
      ]);

    for (const item of coverItems) {
      usage.push({ type: 'content-cover', id: item.id, title: item.title });
    }
    for (const item of archiveCoverItems) {
      usage.push({ type: 'content-archive-cover', id: item.id, title: item.title });
    }
    for (const author of authors) {
      usage.push({ type: 'author-avatar', id: author.id, name: author.name });
    }
    if (siteSettings.length) {
      usage.push({ type: 'site-logo' });
    }
    if (siteHeaders.length) {
      usage.push({ type: 'site-header' });
    }
    if (siteSeos.length) {
      usage.push({ type: 'site-seo' });
    }

    // Search inside contentBlocks JSON for the media id
    const contentBlocksMatches = await this.prisma.$queryRaw<
      Array<{ id: string; title: string; type: string }>
    >`
      SELECT id, title, type
      FROM content_items
      WHERE content_blocks::text ILIKE ${`%${id}%`}
      LIMIT 50
    `;

    for (const item of contentBlocksMatches) {
      usage.push({ type: 'content-block', id: item.id, title: item.title });
    }

    return usage;
  }

  async delete(id: string) {
    const media = await this.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const usage = await this.getUsage(id);
    if (usage.length > 0) {
      throw new BadRequestException('Нельзя удалить файл, он используется в материалах');
    }

    try {
      const filePath = path.join(process.cwd(), media.path);
      await fs.unlink(filePath);
    } catch (err: any) {
      this.logger.warn(`Failed to delete file ${media.path}: ${err?.message || err}`);
    }

    await this.prisma.mediaAsset.delete({ where: { id } });
    return { deleted: true };
  }
}
