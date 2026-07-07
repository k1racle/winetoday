import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const AVIF_QUALITY = 75;
const AVIF_EFFORT = 4;
const MAX_WIDTH = 1920;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.jpe', '.png', '.webp', '.jfif']);

export function createMediaAvifMiddleware(uploadsDirs: string[]) {
  const logger = new Logger('MediaAvifMiddleware');
  const normalizedDirs = uploadsDirs.map((d) => path.resolve(d));

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const rawUrl = decodeURIComponent(req.originalUrl || req.url);
    const urlPath = rawUrl.split('?')[0];
    const ext = path.extname(urlPath).toLowerCase();

    if (!IMAGE_EXTENSIONS.has(ext)) {
      return next();
    }

    const relativePath = urlPath.replace(/^\//, '').replace(/^uploads\//, '');
    const normalizedRelative = path.normalize(relativePath);
    if (path.isAbsolute(normalizedRelative) || normalizedRelative.startsWith('..')) {
      return next();
    }

    const baseName = ext ? normalizedRelative.slice(0, -ext.length) : normalizedRelative;
    const avifRelativePath = `${baseName}.avif`;

    try {
      for (const uploadsDir of normalizedDirs) {
        const originalFile = path.join(uploadsDir, normalizedRelative);
        const avifFile = path.join(uploadsDir, avifRelativePath);

        try {
          const avifStats = await fs.stat(avifFile);
          if (avifStats.isFile()) {
            return serveAvif(res, avifFile);
          }
        } catch {
          // AVIF variant not found in this dir, continue
        }

        try {
          const originalStats = await fs.stat(originalFile);
          if (!originalStats.isFile()) {
            continue;
          }

          logger.log(`Generating AVIF on-the-fly: ${urlPath}`);
          await sharp(originalFile, { animated: false })
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
            .toFile(avifFile);

          return serveAvif(res, avifFile);
        } catch {
          // Original not in this dir, try next
        }
      }
    } catch (err: any) {
      logger.warn(`AVIF conversion failed for ${urlPath}: ${err?.message || err}`);
    }

    return next();
  };
}

function serveAvif(res: Response, filePath: string) {
  res.setHeader('Content-Type', 'image/avif');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(filePath);
}
