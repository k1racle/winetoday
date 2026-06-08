const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const jobsDir = process.env.JOBS_DIR || '/app/jobs';
const inputDir = process.env.INPUT_DIR || '/app/input';
const outputDir = process.env.OUTPUT_DIR || '/app/output';
const watermarkPath = process.env.WATERMARK_LOGO_PATH || '/app/assets/logo1.png';
const logLevel = (process.env.WATERMARK_LOG_LEVEL || 'info').toLowerCase();
const shouldLogPolls = process.env.WATERMARK_LOG_POLLS === '1' || process.env.WATERMARK_LOG_POLLS === 'true';
const markerTtlHours = Math.max(1, Number(process.env.WATERMARK_MARKER_TTL_HOURS) || 24);
const fileTtlHours = Math.max(1, Number(process.env.WATERMARK_FILE_TTL_HOURS) || markerTtlHours);
const markerCleanupIntervalMs = Math.max(5 * 60 * 1000, (Number(process.env.WATERMARK_MARKER_CLEANUP_INTERVAL_HOURS) || 1) * 60 * 60 * 1000);
const pollIntervalMs = Math.max(250, Number(process.env.WATERMARK_POLL_INTERVAL_MS) || 1000);
const workerStartedAt = Date.now();
let lastMarkerCleanupAt = 0;
const processingJobs = new Set();

function isPendingWatermarkJobFile(fileName) {
  return fileName.endsWith('.json')
    && !fileName.endsWith('.json.done')
    && !fileName.endsWith('.json.error')
    && !fileName.endsWith('.json.processing');
}

sharp.cache(false);
sharp.concurrency(Math.max(1, Number(process.env.SHARP_CONCURRENCY) || 1));

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function log(level, message, details) {
  const levels = { debug: 10, info: 20, warn: 30, error: 40 };
  const activeLevel = levels[logLevel] ?? levels.debug;
  const messageLevel = levels[level] ?? levels.info;

  if (messageLevel < activeLevel) {
    return;
  }

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

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

async function pathStats(targetPath) {
  try {
    const stat = await fs.promises.stat(targetPath);
    return {
      exists: true,
      path: targetPath,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      size: stat.size,
      mtime: stat.mtime.toISOString(),
    };
  } catch (error) {
    return {
      exists: false,
      path: targetPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function ensureDir(dir) {
  log('debug', 'ensure directory started', { dir });
  await fs.promises.mkdir(dir, { recursive: true });
  log('info', 'ensure directory completed', { dir, stats: await pathStats(dir) });
}

function summarizeJobDirectory(files, jobFiles) {
  const doneFiles = files.filter((name) => name.endsWith('.json.done') || name.endsWith('.json.processing.done'));
  const errorFiles = files.filter((name) => name.endsWith('.json.error') || name.endsWith('.json.processing.error'));

  return {
    totalFileCount: files.length,
    jobFileCount: jobFiles.length,
    doneFileCount: doneFiles.length,
    errorFileCount: errorFiles.length,
    otherFileCount: files.length - jobFiles.length - doneFiles.length - errorFiles.length,
    jobFilesPreview: jobFiles.slice(0, 10),
    doneFilesPreview: doneFiles.slice(0, 5),
    errorFilesPreview: errorFiles.slice(0, 5),
  };
}

async function cleanupOldMarkers(reason = 'scheduled') {
  const startedAt = Date.now();
  const cutoffTime = Date.now() - markerTtlHours * 60 * 60 * 1000;
  log('info', 'old watermark markers cleanup started', {
    reason,
    jobsDir,
    markerTtlHours,
    cutoffTime: new Date(cutoffTime).toISOString(),
  });

  const files = await fs.promises.readdir(jobsDir);
  const markerFiles = files.filter((name) => (
    name.endsWith('.json.done')
    || name.endsWith('.json.error')
    || name.endsWith('.json.processing')
    || name.endsWith('.json.processing.done')
    || name.endsWith('.json.processing.error')
  ));
  let deletedCount = 0;
  let keptCount = 0;
  let failedCount = 0;
  const deletedPreview = [];
  const failedPreview = [];

  for (const file of markerFiles) {
    const fullPath = path.join(jobsDir, file);
    try {
      const stat = await fs.promises.stat(fullPath);
      if (stat.mtimeMs >= cutoffTime) {
        keptCount += 1;
        continue;
      }

      await fs.promises.unlink(fullPath);
      deletedCount += 1;
      if (deletedPreview.length < 20) {
        deletedPreview.push({ file, mtime: stat.mtime.toISOString(), size: stat.size });
      }
    } catch (error) {
      failedCount += 1;
      if (failedPreview.length < 10) {
        failedPreview.push({ file, error: serializeError(error) });
      }
    }
  }

  log(failedCount ? 'warn' : 'info', 'old watermark markers cleanup completed', {
    reason,
    markerTtlHours,
    markerFileCount: markerFiles.length,
    deletedCount,
    keptCount,
    failedCount,
    deletedPreview,
    failedPreview,
    durationMs: Date.now() - startedAt,
  });
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
    log('error', 'old watermark markers cleanup failed', { reason, error: serializeError(error) });
  }
}

async function cleanupDirectoryByAge(dir, reason, options = {}) {
  const {
    includeErrorSuffix = false,
    excludeExtensions = [],
  } = options;
  const startedAt = Date.now();
  const cutoffTime = Date.now() - fileTtlHours * 60 * 60 * 1000;
  let deletedCount = 0;
  let keptCount = 0;
  let failedCount = 0;

  let files = [];
  try {
    files = await fs.promises.readdir(dir);
  } catch (error) {
    log('warn', 'stale watermark files cleanup skipped: directory unreadable', { dir, reason, error: serializeError(error) });
    return { deletedCount, keptCount, failedCount };
  }

  for (const file of files) {
    if (excludeExtensions.some((suffix) => file.endsWith(suffix))) {
      continue;
    }

    const fullPath = path.join(dir, file);
    const isErrorMarker = file.endsWith('.error');
    if (!includeErrorSuffix && isErrorMarker) {
      continue;
    }

    try {
      const stat = await fs.promises.stat(fullPath);
      if (!stat.isFile() || stat.mtimeMs >= cutoffTime) {
        keptCount += 1;
        continue;
      }

      await fs.promises.unlink(fullPath);
      deletedCount += 1;
    } catch (error) {
      failedCount += 1;
      log('warn', 'stale watermark file cleanup failed', { dir, file, reason, error: serializeError(error) });
    }
  }

  if (deletedCount || failedCount) {
    log(failedCount ? 'warn' : 'info', 'stale watermark files cleanup completed', {
      dir,
      reason,
      fileTtlHours,
      deletedCount,
      keptCount,
      failedCount,
      durationMs: Date.now() - startedAt,
    });
  }

  return { deletedCount, keptCount, failedCount };
}

async function cleanupStaleFiles(reason = 'scheduled') {
  await cleanupDirectoryByAge(inputDir, reason);
  await cleanupDirectoryByAge(outputDir, reason, {
    includeErrorSuffix: true,
    excludeExtensions: ['.meta.json', '.finalized.json'],
  });
}


async function applyWatermark(job) {
  const startedAt = Date.now();
  log('info', 'apply watermark started', { job });

  if (!job || typeof job !== 'object') {
    log('error', 'apply watermark rejected: invalid job payload', { jobType: typeof job, job });
    throw new Error('Invalid job payload.');
  }

  if (typeof job.inputFile !== 'string' || !job.inputFile.trim()) {
    log('error', 'apply watermark rejected: missing inputFile', { job });
    throw new Error('Job is missing inputFile.');
  }

  const inputPath = path.join(inputDir, job.inputFile);
  const outputPath = path.join(outputDir, job.outputFile || job.inputFile);
  log('debug', 'resolved watermark paths', {
    inputDir,
    outputDir,
    watermarkPath,
    inputFile: job.inputFile,
    outputFile: job.outputFile || job.inputFile,
    inputPath,
    outputPath,
  });
  log('debug', 'input/logo/output preflight stats', {
    input: await pathStats(inputPath),
    logo: await pathStats(watermarkPath),
    outputDir: await pathStats(outputDir),
  });

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  log('info', 'source image metadata read', {
    inputPath,
    metadata: meta,
    width,
    height,
  });

  const blockWidth = Number(job.blockWidth) > 0 ? Number(job.blockWidth) : 0;
  const blockHeight = Number(job.blockHeight) > 0 ? Number(job.blockHeight) : 0;
  const hasBlockFrame = job.blockKind === 'archive-cover' && blockWidth > 0 && blockHeight > 0 && width > 0 && height > 0;
  const frameMatchesImageRatio = job.blockKind === 'archive-cover' && hasBlockFrame && Math.abs((blockWidth / blockHeight) - (width / height)) < 0.02;
  const coverScale = hasBlockFrame ? (frameMatchesImageRatio ? blockWidth / width : Math.max(blockWidth / width, blockHeight / height)) : 1;
  const referenceWidth = hasBlockFrame ? Math.min(width, Math.round(blockWidth / coverScale)) : width;
  const referenceHeight = hasBlockFrame ? Math.min(height, Math.round(blockHeight / coverScale)) : height;
  const referenceLeft = hasBlockFrame ? Math.max(0, Math.round((width - referenceWidth) / 2)) : 0;
  const referenceTop = hasBlockFrame ? Math.max(0, Math.round((height - referenceHeight) / 2)) : 0;
  const watermarkSizeBase = Math.min(referenceWidth || 0, referenceHeight || 0);
  const watermarkScale = job.blockKind === 'cover' || job.blockKind === 'blocks.image-highlight' ? 0.3 : 0.42;
  const watermarkWidth = Math.max(job.blockKind === 'cover' || job.blockKind === 'blocks.image-highlight' ? 120 : 160, Math.round(watermarkSizeBase * watermarkScale));
  log('info', 'watermark geometry calculated', {
    blockKind: job.blockKind,
    blockWidth,
    blockHeight,
    hasBlockFrame,
    frameMatchesImageRatio,
    coverScale,
    referenceWidth,
    referenceHeight,
    referenceLeft,
    referenceTop,
    watermarkSizeBase,
    watermarkScale,
    watermarkWidth,
  });

  const logo = sharp(watermarkPath)
    .trim()
    .resize({
      width: watermarkWidth,
      withoutEnlargement: true,
    });
  const logoBuffer = await logo.png().toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const marginX = Math.max(16, Math.round(referenceWidth * 0.04));
  const marginY = Math.max(16, Math.round(referenceHeight * 0.04));
  const safeTop = Math.max(referenceTop, referenceTop + referenceHeight - (logoMeta.height || 0) - marginY);
  const left = referenceLeft + marginX;
  const top = safeTop;
  log('info', 'logo prepared and final position calculated', {
    logoMeta,
    logoBufferBytes: logoBuffer.length,
    marginX,
    marginY,
    left,
    top,
  });

  log('debug', 'writing watermarked output started', { outputPath });
  await image.composite([{ input: logoBuffer, left, top }]).toFile(outputPath);
  log('info', 'writing watermarked output completed', {
    outputPath,
    output: await pathStats(outputPath),
    durationMs: Date.now() - startedAt,
  });

  return outputPath;
}

async function processJobFile(file) {
  if (processingJobs.has(file)) {
    return;
  }

  const fullPath = path.join(jobsDir, file);
  const processingPath = `${fullPath}.processing`;

  try {
    await fs.promises.rename(fullPath, processingPath);
  } catch {
    return;
  }

  processingJobs.add(file);
  const startedAt = Date.now();
  log('info', 'job file processing started', { file, fullPath: processingPath, stats: await pathStats(processingPath) });
  let raw = '';
  let parsedJob = null;

  try {
    raw = await fs.promises.readFile(processingPath, 'utf8');
    log('debug', 'job file read completed', { file, fullPath, rawBytes: Buffer.byteLength(raw), rawPreview: raw.slice(0, 2000) });
    parsedJob = JSON.parse(raw);
    log('info', 'job json parsed', { file, job: parsedJob });
    const result = await applyWatermark(parsedJob);
    const donePayload = { ok: true, result, processedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
    await fs.promises.writeFile(processingPath + '.done', JSON.stringify(donePayload, null, 2));
    log('info', 'job done marker written', { file, donePath: processingPath + '.done', donePayload });
    await fs.promises.unlink(processingPath);
    log('info', 'job file removed after success', { file, fullPath: processingPath, durationMs: Date.now() - startedAt });
  } catch (error) {
    const errorPath = processingPath + '.error';
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errorPayload = {
      ok: false,
      error: message,
      errorDetails: serializeError(error),
      raw,
      failedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
    let outputErrorPath = null;
    try {
      const parsedJob = JSON.parse(raw);
      const outputFile = typeof parsedJob.outputFile === 'string' && parsedJob.outputFile.trim()
        ? parsedJob.outputFile
        : parsedJob.inputFile;
      if (typeof outputFile === 'string' && outputFile.trim()) {
        outputErrorPath = path.join(outputDir, outputFile) + '.error';
      }
    } catch {
      outputErrorPath = null;
    }

    log('error', 'job processing failed', { file, fullPath, errorPath, outputErrorPath, error: serializeError(error), rawPreview: raw.slice(0, 2000) });
    await fs.promises.writeFile(errorPath, JSON.stringify(errorPayload, null, 2));
    log('warn', 'job error marker written', { file, errorPath, errorPayload });
    if (outputErrorPath) {
      try {
        await fs.promises.writeFile(outputErrorPath, JSON.stringify(errorPayload, null, 2));
        log('warn', 'output error marker written for backend waiter', { file, outputErrorPath });
      } catch (writeOutputError) {
        log('error', 'output error marker write failed', { file, outputErrorPath, error: serializeError(writeOutputError) });
      }
    }
    await fs.promises.unlink(processingPath).catch(() => null);
    log('warn', 'job file removed after failure', { file, fullPath: processingPath, durationMs: Date.now() - startedAt });
  } finally {
    processingJobs.delete(file);
  }
}

async function main() {
  log('info', 'vino watermark worker starting', {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    pid: process.pid,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      JOBS_DIR: jobsDir,
      INPUT_DIR: inputDir,
      OUTPUT_DIR: outputDir,
      WATERMARK_LOGO_PATH: watermarkPath,
      WATERMARK_LOG_LEVEL: logLevel,
      WATERMARK_LOG_POLLS: shouldLogPolls,
      WATERMARK_MARKER_TTL_HOURS: markerTtlHours,
      WATERMARK_MARKER_CLEANUP_INTERVAL_HOURS: markerCleanupIntervalMs / 60 / 60 / 1000,
    },
  });
  await ensureDir(jobsDir);
  await ensureDir(inputDir);
  await ensureDir(outputDir);
  log('info', 'vino watermark worker ready', {
    jobsDir: await pathStats(jobsDir),
    inputDir: await pathStats(inputDir),
    outputDir: await pathStats(outputDir),
    watermark: await pathStats(watermarkPath),
  });
  await cleanupOldMarkersIfDue('startup');

  process.on('unhandledRejection', (error) => {
    log('error', 'unhandled rejection in watermark worker', { error: serializeError(error) });
  });

  process.on('uncaughtException', (error) => {
    log('error', 'uncaught exception in watermark worker', { error: serializeError(error) });
    process.exit(1);
  });

  while (true) {
    try {
      const pollStartedAt = Date.now();
      const files = await fs.promises.readdir(jobsDir);
      const jobFiles = files.filter((name) => isPendingWatermarkJobFile(name));
      if (shouldLogPolls || jobFiles.length) {
        log('debug', 'jobs directory polled', {
          jobsDir,
          ...summarizeJobDirectory(files, jobFiles),
          durationMs: Date.now() - pollStartedAt,
        });
      }
      for (const file of jobFiles) {
        await processJobFile(file);
      }
      await cleanupOldMarkersIfDue('scheduled');
    } catch (error) {
      log('error', 'polling loop failed', { error: serializeError(error) });
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

main().catch((error) => {
  log('error', 'vino watermark worker fatal startup error', { error: serializeError(error) });
  process.exit(1);
});
