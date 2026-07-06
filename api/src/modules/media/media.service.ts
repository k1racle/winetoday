import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly BLOCK_WIDTH_PX = 1200;
  private readonly AVIF_QUALITY = 80;
  private readonly AVIF_EFFORT = 4;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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

  async createCoverFromUpload(file: Express.Multer.File, applyWatermark = false) {
    const media = await this.createFromUpload(file);

    if (!applyWatermark) {
      return media;
    }

    const watermarkResult = await this.applyWatermark(media.path, { targetWidth: this.BLOCK_WIDTH_PX });
    if (!watermarkResult) {
      return media;
    }

    return this.prisma.mediaAsset.update({
      where: { id: media.id },
      data: { path: watermarkResult },
    });
  }

  async ensureWatermark(
    mediaId: string,
    options?: { targetWidth?: number },
  ): Promise<string | null> {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (!media?.path) return null;

    const ext = media.path.match(/\.[^.]+$/)?.[0] || '';
    if (media.path.endsWith(`_wm${ext}`)) return media.path;

    const watermarkResult = await this.applyWatermark(media.path, {
      targetWidth: options?.targetWidth ?? this.BLOCK_WIDTH_PX,
    });
    if (!watermarkResult) return null;

    await this.prisma.mediaAsset.update({
      where: { id: media.id },
      data: { path: watermarkResult },
    });

    return watermarkResult;
  }

  private async applyWatermark(
    sourcePath: string,
    options?: { targetWidth?: number },
  ): Promise<string | null> {
    const watermarkUrl = this.config.get<string>('WATERMARK_SERVICE_URL');
    if (!watermarkUrl) {
      this.logger.warn('WATERMARK_SERVICE_URL is not set, skipping watermark');
      return null;
    }

    const WATERMARK_PATH = '/uploads/56c7826c-a463-4423-a34f-fe59226023f6.png';
    const settings = {
      opacity: 0.85,
      sizePercent: 24,
      position: 'bottom-left',
      offsetTopPercent: 4,
      offsetRightPercent: 4,
      offsetBottomPercent: 8,
      offsetLeftPercent: 4,
      minSizePx: 48,
      maxSizePx: 500,
    };

    try {
      const response = await fetch(`${watermarkUrl}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath,
          watermarkPath: WATERMARK_PATH,
          settings,
          targetWidth: options?.targetWidth ?? this.BLOCK_WIDTH_PX,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Watermark service responded ${response.status}: ${text}`);
      }

      const result = (await response.json()) as { path: string };
      return result.path;
    } catch (err: any) {
      this.logger.error('Failed to apply watermark:', err?.message || err);
      return null;
    }
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
