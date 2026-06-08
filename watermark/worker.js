const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const jobsDir = process.env.JOBS_DIR || '/app/jobs';
const inputDir = process.env.INPUT_DIR || '/app/input';
const outputDir = process.env.OUTPUT_DIR || '/app/output';
const uploadsDir = process.env.UPLOADS_DIR || '/app/shared/uploads';
const watermarkPath = process.env.WATERMARK_LOGO_PATH || '/app/assets/logo1.png';
const logLevel = (process.env.WATERMARK_LOG_LEVEL || 'warn').toLowerCase();
const shouldLogPolls = process.env.WATERMARK_LOG_POLLS === '1' || process.env.WATERMARK_LOG_POLLS === 'true';
const markerTtlHours = Math.max(1, Number(process.env.WATERMARK_MARKER_TTL_HOURS) || 24);
const fileTtlHours = Math.max(1, Number(process.env.WATERMARK_FILE_TTL_HOURS) || 6);
const markerCleanupIntervalMs = Math.max(5 * 60 * 1000, (Number(process.env.WATERMARK_MARKER_CLEANUP_INTERVAL_HOURS) || 1) * 60 * 60 * 1000);
const pollIntervalMs = Math.max(500, Number(process.env.WATERMARK_POLL_INTERVAL_MS) || 3000);
const idlePollIntervalMs = Math.max(pollIntervalMs, Number(process.env.WATERMARK_IDLE_POLL_INTERVAL_MS) || 5000);
const maxDimension = Math.max(640, Number(process.env.WATERMARK_MAX_DIMENSION) || 1600);
const archiveMaxWidth = Math.max(320, Number(process.env.WATERMARK_ARCHIVE_MAX_WIDTH) || 720);
const jpegQuality = Math.min(95, Math.max(60, Number(process.env.WATERMARK_JPEG_QUALITY) || 82));
const maxInputBytes = Math.max(1024 * 1024, Number(process.env.WATERMARK_MAX_INPUT_BYTES) || 15 * 1024 * 1024);
const workerStartedAt = Date.now();
let lastMarkerCleanupAt = 0;
const processingJobs = new Set();
const logoCache = new Map();

sharp.cache(false);
sharp.concurrency(1);

function isPendingWatermarkJobFile(fileName) {
  return fileName.endsWith('.json')
    && !fileName.endsWith('.json.done')
    && !fileName.endsWith('.json.error')
    && !fileName.endsWith('.json.processing');
}

function serializeError(error) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

function log(level, message, details) {
  const levels = { debug: 10, info: 20, warn: 30, error: 40 };
  const activeLevel = levels[logLevel] ?? levels.warn;
  const messageLevel = levels[level] ?? levels.info;
  if (messageLevel < activeLevel) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    service: 'vino-watermark',
    pid: process.pid,
    uptimeMs: Date.now() - workerStartedAt,
    message,
    ...(details && typeof details === 'object' ? details : {}),
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function resolveInputPath(job) {
  if (typeof job.sourceRelativePath === 'string' && job.sourceRelativePath.trim()) {
    return path.join(uploadsDir, job.sourceRelativePath.trim());
  }
  if (typeof job.inputFile === 'string' && job.inputFile.trim()) {
    return path.join(inputDir, job.inputFile);
  }
  throw new Error('Job is missing source path.');
}

function resolveTargetMaxDimension(blockKind) {
  if (blockKind === 'archive-cover' || blockKind === 'cover-and-archive') {
    return archiveMaxWidth;
  }
  return maxDimension;
}

async function getLogoBuffer(watermarkWidth) {
  const cacheKey = String(watermarkWidth);
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey);
  }

  const logoBuffer = await sharp(watermarkPath)
    .trim()
    .resize({ width: watermarkWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  if (logoCache.size >= 8) {
    const oldestKey = logoCache.keys().next().value;
    logoCache.delete(oldestKey);
  }
  logoCache.set(cacheKey, logoBuffer);
  return logoBuffer;
}

function calculateGeometry(job, width, height) {
  const blockWidth = Number(job.blockWidth) > 0 ? Number(job.blockWidth) : 0;
  const blockHeight = Number(job.blockHeight) > 0 ? Number(job.blockHeight) : 0;
  const usesArchiveFrame = job.blockKind === 'archive-cover' || job.blockKind === 'cover-and-archive';
  const hasBlockFrame = usesArchiveFrame && blockWidth > 0 && blockHeight > 0 && width > 0 && height > 0;
  const frameMatchesImageRatio = usesArchiveFrame && hasBlockFrame && Math.abs((blockWidth / blockHeight) - (width / height)) < 0.02;
  const coverScale = hasBlockFrame ? (frameMatchesImageRatio ? blockWidth / width : Math.max(blockWidth / width, blockHeight / height)) : 1;
  const referenceWidth = hasBlockFrame ? Math.min(width, Math.round(blockWidth / coverScale)) : width;
  const referenceHeight = hasBlockFrame ? Math.min(height, Math.round(blockHeight / coverScale)) : height;
  const referenceLeft = hasBlockFrame ? Math.max(0, Math.round((width - referenceWidth) / 2)) : 0;
  const referenceTop = hasBlockFrame ? Math.max(0, Math.round((height - referenceHeight) / 2)) : 0;
  const watermarkSizeBase = Math.min(referenceWidth || 0, referenceHeight || 0);
  const watermarkScale = job.blockKind === 'cover' || job.blockKind === 'blocks.image-highlight' || job.blockKind === 'cover-and-archive' ? 0.3 : 0.42;
  const minLogoWidth = job.blockKind === 'cover' || job.blockKind === 'blocks.image-highlight' || job.blockKind === 'cover-and-archive' ? 120 : 160;
  const watermarkWidth = Math.max(minLogoWidth, Math.round(watermarkSizeBase * watermarkScale));
  const marginX = Math.max(16, Math.round(referenceWidth * 0.04));
  const marginY = Math.max(16, Math.round(referenceHeight * 0.04));

  return {
    watermarkWidth,
    referenceTop,
    referenceHeight,
    marginY,
    left: referenceLeft + marginX,
  };
}

async function applyWatermark(job) {
  const startedAt = Date.now();
  if (!job || typeof job.inputFile !== 'string' && typeof job.sourceRelativePath !== 'string') {
    throw new Error('Invalid job payload.');
  }

  const inputPath = resolveInputPath(job);
  const outputPath = path.join(outputDir, job.outputFile || job.inputFile);
  const inputStat = await fs.promises.stat(inputPath);
  if (inputStat.size > maxInputBytes) {
    throw new Error(`Image is too large (${inputStat.size} bytes).`);
  }

  const targetMax = resolveTargetMaxDimension(job.blockKind);
  const baseImage = sharp(inputPath, { limitInputPixels: 268435456, failOn: 'none' }).rotate();
  const meta = await baseImage.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (!width || !height) {
    throw new Error('Unsupported image dimensions.');
  }

  const needsResize = width > targetMax || height > targetMax;
  const resizedImage = needsResize
    ? baseImage.resize({ width: targetMax, height: targetMax, fit: 'inside', withoutEnlargement: true })
    : baseImage;
  const workingMeta = needsResize ? await resizedImage.clone().metadata() : meta;
  const workingWidth = workingMeta.width || width;
  const workingHeight = workingMeta.height || height;
  const geometry = calculateGeometry(job, workingWidth, workingHeight);
  const logoBuffer = await getLogoBuffer(geometry.watermarkWidth);
  const logoMeta = await sharp(logoBuffer).metadata();
  const top = Math.max(
    geometry.referenceTop,
    geometry.referenceTop + geometry.referenceHeight - (logoMeta.height || 0) - geometry.marginY,
  );

  const composited = resizedImage.composite([{ input: logoBuffer, left: geometry.left, top }]);
  const outputExtension = path.extname(outputPath).toLowerCase();
  const watermarkedBuffer = outputExtension === '.png'
    ? await composited.png({ compressionLevel: 8 }).toBuffer()
    : await composited.jpeg({ quality: jpegQuality, mozjpeg: true }).toBuffer();

  await fs.promises.writeFile(outputPath, watermarkedBuffer);

  if (job.blockKind === 'cover-and-archive' && typeof job.archiveOutputFile === 'string' && job.archiveOutputFile.trim()) {
    const archiveWidth = Number(job.blockWidth) > 0 ? Number(job.blockWidth) : archiveMaxWidth;
    const archiveHeight = Number(job.blockHeight) > 0 ? Number(job.blockHeight) : Math.round(archiveWidth * 0.62);
    const archivePath = path.join(outputDir, job.archiveOutputFile);
    await sharp(watermarkedBuffer)
      .resize(archiveWidth, archiveHeight, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toFile(archivePath);
  }

  log('info', 'watermark completed', {
    blockKind: job.blockKind,
    inputPath,
    outputPath,
    inputBytes: inputStat.size,
    outputBytes: watermarkedBuffer.length,
    durationMs: Date.now() - startedAt,
  });

  return outputPath;
}

async function cleanupOldMarkers(reason = 'scheduled') {
  const cutoffTime = Date.now() - markerTtlHours * 60 * 60 * 1000;
  const files = await fs.promises.readdir(jobsDir);
  const markerFiles = files.filter((name) => (
    name.endsWith('.json.done')
    || name.endsWith('.json.error')
    || name.endsWith('.json.processing')
    || name.endsWith('.json.processing.done')
    || name.endsWith('.json.processing.error')
  ));

  for (const file of markerFiles) {
    const fullPath = path.join(jobsDir, file);
    try {
      const stat = await fs.promises.stat(fullPath);
      if (stat.mtimeMs < cutoffTime) {
        await fs.promises.unlink(fullPath);
      }
    } catch {
      // ignore cleanup errors
    }
  }

  log('debug', 'marker cleanup completed', { reason, markerFileCount: markerFiles.length });
}

async function cleanupStaleFiles(reason = 'scheduled') {
  const cutoffTime = Date.now() - fileTtlHours * 60 * 60 * 1000;

  for (const dir of [inputDir, outputDir]) {
    let files = [];
    try {
      files = await fs.promises.readdir(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (file.endsWith('.meta.json') || file.endsWith('.finalized.json')) {
        continue;
      }

      const fullPath = path.join(dir, file);
      try {
        const stat = await fs.promises.stat(fullPath);
        if (stat.isFile() && stat.mtimeMs < cutoffTime) {
          await fs.promises.unlink(fullPath);
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }

  log('debug', 'stale file cleanup completed', { reason });
}

async function cleanupOldMarkersIfDue(reason = 'scheduled') {
  const now = Date.now();
  if (lastMarkerCleanupAt && now - lastMarkerCleanupAt < markerCleanupIntervalMs) {
    return;
  }

  lastMarkerCleanupAt = now;
  try {
    await cleanupOldMarkers(reason);
    await cleanupStaleFiles(reason);
  } catch (error) {
    log('error', 'cleanup failed', { reason, error: serializeError(error) });
  }
}

async function processJobFile(file) {
  if (processingJobs.has(file)) return;

  const fullPath = path.join(jobsDir, file);
  const processingPath = `${fullPath}.processing`;
  try {
    await fs.promises.rename(fullPath, processingPath);
  } catch {
    return;
  }

  processingJobs.add(file);
  const startedAt = Date.now();
  let raw = '';

  try {
    raw = await fs.promises.readFile(processingPath, 'utf8');
    const job = JSON.parse(raw);
    log('info', 'job started', { file, blockKind: job.blockKind, outputFile: job.outputFile });
    const result = await applyWatermark(job);
    await fs.promises.writeFile(processingPath + '.done', JSON.stringify({ ok: true, result, durationMs: Date.now() - startedAt }));
    await fs.promises.unlink(processingPath);
    log('info', 'job completed', { file, durationMs: Date.now() - startedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errorPayload = { ok: false, error: message, errorDetails: serializeError(error), failedAt: new Date().toISOString() };
    let outputErrorPath = null;

    try {
      const parsedJob = JSON.parse(raw);
      const outputFile = parsedJob.outputFile || parsedJob.inputFile;
      if (typeof outputFile === 'string' && outputFile.trim()) {
        outputErrorPath = path.join(outputDir, outputFile) + '.error';
      }
    } catch {
      outputErrorPath = null;
    }

    await fs.promises.writeFile(processingPath + '.error', JSON.stringify(errorPayload, null, 2));
    if (outputErrorPath) {
      await fs.promises.writeFile(outputErrorPath, JSON.stringify(errorPayload, null, 2)).catch(() => null);
    }
    await fs.promises.unlink(processingPath).catch(() => null);
    log('error', 'job failed', { file, error: serializeError(error) });
  } finally {
    processingJobs.delete(file);
  }
}

async function main() {
  log('info', 'vino watermark worker starting', {
    jobsDir,
    uploadsDir,
    maxDimension,
    archiveMaxWidth,
    jpegQuality,
    pollIntervalMs,
    idlePollIntervalMs,
  });

  await fs.promises.mkdir(jobsDir, { recursive: true });
  await fs.promises.mkdir(inputDir, { recursive: true });
  await fs.promises.mkdir(outputDir, { recursive: true });
  await cleanupOldMarkersIfDue('startup');

  process.on('unhandledRejection', (error) => {
    log('error', 'unhandled rejection', { error: serializeError(error) });
  });

  while (true) {
    let hadJobs = false;
    try {
      const files = await fs.promises.readdir(jobsDir);
      const jobFiles = files.filter((name) => isPendingWatermarkJobFile(name));
      hadJobs = jobFiles.length > 0;
      if (shouldLogPolls && hadJobs) {
        log('debug', 'jobs polled', { jobFileCount: jobFiles.length });
      }
      for (const file of jobFiles) {
        await processJobFile(file);
      }
      if (!hadJobs) {
        await cleanupOldMarkersIfDue('scheduled');
      }
    } catch (error) {
      log('error', 'polling loop failed', { error: serializeError(error) });
    }

    await new Promise((resolve) => setTimeout(resolve, hadJobs ? pollIntervalMs : idlePollIntervalMs));
  }
}

main().catch((error) => {
  log('error', 'fatal startup error', { error: serializeError(error) });
  process.exit(1);
});
