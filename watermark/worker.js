const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const jobsDir = process.env.JOBS_DIR || '/app/jobs';
const inputDir = process.env.INPUT_DIR || '/app/input';
const outputDir = process.env.OUTPUT_DIR || '/app/output';
const watermarkPath = process.env.WATERMARK_LOGO_PATH || '/app/assets/logo1.png';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function applyWatermark(job) {
  if (!job || typeof job !== 'object') {
    throw new Error('Invalid job payload.');
  }

  if (typeof job.inputFile !== 'string' || !job.inputFile.trim()) {
    throw new Error('Job is missing inputFile.');
  }

  const inputPath = path.join(inputDir, job.inputFile);
  const outputPath = path.join(outputDir, job.outputFile || job.inputFile);
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  const blockWidth = Number(job.blockWidth) > 0 ? Number(job.blockWidth) : width;
  const blockHeight = Number(job.blockHeight) > 0 ? Number(job.blockHeight) : height;
  const pos = typeof job.position === 'string' ? job.position : 'bottom-left';
  const referenceWidth = blockWidth > 0 ? blockWidth : width;
  const referenceHeight = blockHeight > 0 ? blockHeight : height;
  const watermarkSizeBase = Math.min(referenceWidth || width || 0, referenceHeight || height || 0);
  const watermarkWidth = Math.max(160, Math.round(watermarkSizeBase * 0.42));
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
  const safeLeft = Math.max(0, referenceWidth - (logoMeta.width || 0) - marginX);
  const safeTop = Math.max(0, referenceHeight - (logoMeta.height || 0) - marginY);
  const left = pos.includes('left') ? marginX : safeLeft;
  const top = pos.includes('bottom') ? safeTop : marginY;
  await image.composite([{ input: logoBuffer, left, top }]).toFile(outputPath);
  return outputPath;
}

async function processJobFile(file) {
  const fullPath = path.join(jobsDir, file);
  const raw = await fs.promises.readFile(fullPath, 'utf8');

  try {
    const job = JSON.parse(raw);
    const result = await applyWatermark(job);
    await fs.promises.writeFile(fullPath + '.done', JSON.stringify({ ok: true, result }, null, 2));
    await fs.promises.unlink(fullPath);
  } catch (error) {
    const errorPath = fullPath + '.error';
    const message = error instanceof Error ? error.message : 'Unknown error';
    await fs.promises.writeFile(errorPath, JSON.stringify({ ok: false, error: message, raw }, null, 2));
    await fs.promises.unlink(fullPath).catch(() => null);
  }
}

async function main() {
  await ensureDir(jobsDir);
  await ensureDir(inputDir);
  await ensureDir(outputDir);
  setInterval(async () => {
    try {
      const files = await fs.promises.readdir(jobsDir);
      for (const file of files.filter((name) => name.endsWith('.json'))) {
        await processJobFile(file);
      }
    } catch (error) {
      console.error(error);
    }
  }, 1000);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
