import sharp from 'sharp';
import path from 'path';
const DEFAULT_SETTINGS = {
    opacity: 0.85,
    sizePercent: 18,
    position: 'bottom-right',
    offsetTopPercent: 4,
    offsetRightPercent: 4,
    offsetBottomPercent: 4,
    offsetLeftPercent: 4,
    minSizePx: 48,
    maxSizePx: 220,
};
function resolveUploadsPath(filePath, uploadsDir) {
    // Map /uploads/... or uploads/... paths to the configured uploads directory
    const relative = filePath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
    if (relative !== filePath || !path.isAbsolute(filePath)) {
        return path.join(uploadsDir, relative);
    }
    return filePath;
}
function makeOutputPath(sourcePath) {
    const ext = path.extname(sourcePath);
    const base = sourcePath.slice(0, -ext.length) || sourcePath;
    return `${base}_wm${ext}`;
}
export async function applyWatermark(request, uploadsDir) {
    const settings = { ...DEFAULT_SETTINGS, ...request.settings };
    const sourceFile = resolveUploadsPath(request.sourcePath, uploadsDir);
    const watermarkFile = resolveUploadsPath(request.watermarkPath, uploadsDir);
    const outputFile = request.outputPath
        ? resolveUploadsPath(request.outputPath, uploadsDir)
        : makeOutputPath(sourceFile);
    const [sourceMeta, watermarkMeta] = await Promise.all([
        sharp(sourceFile).metadata(),
        sharp(watermarkFile).metadata(),
    ]);
    const originalWidth = sourceMeta.width || 1200;
    // Crop/resize source to the rendered 16:9 block dimensions. The watermark is
    // sized and positioned relative to this block, not the original photo.
    const TARGET_ASPECT = 16 / 9;
    const targetWidth = request.targetWidth
        ? Math.min(request.targetWidth, originalWidth)
        : originalWidth;
    const outputWidth = targetWidth;
    const outputHeight = Math.max(1, Math.round(outputWidth / TARGET_ASPECT));
    const sourceWidth = outputWidth;
    const sourceHeight = outputHeight;
    const watermarkOriginalWidth = watermarkMeta.width || 200;
    const watermarkOriginalHeight = watermarkMeta.height || 200;
    // Calculate desired watermark width as percentage of the rendered block width
    let watermarkTargetWidth = Math.round((targetWidth * settings.sizePercent) / 100);
    watermarkTargetWidth = Math.max(settings.minSizePx, Math.min(settings.maxSizePx, watermarkTargetWidth));
    // Keep aspect ratio
    const ratio = watermarkTargetWidth / watermarkOriginalWidth;
    const watermarkTargetHeight = Math.round(watermarkOriginalHeight * ratio);
    // Resize watermark and apply opacity
    const resizedWatermark = await sharp(watermarkFile, {
        animated: watermarkMeta.pages ? true : false,
    })
        .resize(watermarkTargetWidth, watermarkTargetHeight, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    // Apply opacity by multiplying alpha channel
    const { data, info } = resizedWatermark;
    const opacity = Math.max(0, Math.min(1, settings.opacity));
    for (let i = 3; i < data.length; i += 4) {
        data[i] = Math.round(data[i] * opacity);
    }
    const watermarkBuffer = await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4,
        },
    })
        .png()
        .toBuffer();
    // Calculate position based on per-side offsets
    const topOffset = Math.round((sourceHeight * settings.offsetTopPercent) / 100);
    const rightOffset = Math.round((sourceWidth * settings.offsetRightPercent) / 100);
    const bottomOffset = Math.round((sourceHeight * settings.offsetBottomPercent) / 100);
    const leftOffset = Math.round((sourceWidth * settings.offsetLeftPercent) / 100);
    let left = 0;
    let top = 0;
    switch (settings.position) {
        case 'top-left':
            left = leftOffset;
            top = topOffset;
            break;
        case 'top-right':
            left = sourceWidth - info.width - rightOffset;
            top = topOffset;
            break;
        case 'bottom-left':
            left = leftOffset;
            top = sourceHeight - info.height - bottomOffset;
            break;
        case 'bottom-right':
            left = sourceWidth - info.width - rightOffset;
            top = sourceHeight - info.height - bottomOffset;
            break;
        case 'center':
            left = Math.round((sourceWidth - info.width) / 2);
            top = Math.round((sourceHeight - info.height) / 2);
            break;
        default:
            left = sourceWidth - info.width - rightOffset;
            top = sourceHeight - info.height - bottomOffset;
    }
    // Ensure non-negative coordinates
    left = Math.max(0, left);
    top = Math.max(0, top);
    await sharp(sourceFile)
        .resize(outputWidth, outputHeight, { fit: 'cover', position: 'centre' })
        .composite([
        {
            input: watermarkBuffer,
            left,
            top,
        },
    ])
        .toFile(outputFile);
    // Return path in /uploads/ format
    return `/uploads/${path.basename(outputFile)}`;
}
