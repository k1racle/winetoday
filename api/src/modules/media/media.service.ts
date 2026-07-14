import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(limit = 50, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.mediaAsset.count(),
    ]);
    return { items, total, limit, offset };
  }

  async findById(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }
}
