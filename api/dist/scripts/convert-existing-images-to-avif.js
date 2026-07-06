"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../uploads');
const AVIF_QUALITY = 80;
const AVIF_EFFORT = 4;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(`Scanning uploads directory: ${UPLOADS_DIR}`);
    const entries = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });
    const imageFiles = entries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
    });
    console.log(`Found ${imageFiles.length} image files to convert`);
    let converted = 0;
    let skipped = 0;
    let failed = 0;
    for (const filename of imageFiles) {
        const inputPath = path.join(UPLOADS_DIR, filename);
        const ext = path.extname(filename);
        const baseName = filename.slice(0, -ext.length);
        const outputFilename = `${baseName}.avif`;
        const outputPath = path.join(UPLOADS_DIR, outputFilename);
        try {
            const existing = await fs.stat(outputPath).catch(() => null);
            if (existing?.isFile()) {
                console.log(`  SKIP ${filename} (AVIF already exists)`);
                skipped++;
                continue;
            }
            const metadata = await (0, sharp_1.default)(inputPath, { animated: false }).metadata();
            if (!metadata.width || !metadata.height) {
                console.log(`  SKIP ${filename} (not a raster image)`);
                skipped++;
                continue;
            }
            await (0, sharp_1.default)(inputPath, { animated: false })
                .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
                .toFile(outputPath);
            console.log(`  OK   ${filename} -> ${outputFilename}`);
            converted++;
        }
        catch (err) {
            console.error(`  FAIL ${filename}: ${err?.message || err}`);
            failed++;
        }
    }
    console.log(`\nConversion complete: ${converted} converted, ${skipped} skipped, ${failed} failed`);
    console.log('\nUpdating MediaAsset records...');
    const assets = await prisma.mediaAsset.findMany();
    let updated = 0;
    for (const asset of assets) {
        const assetPath = asset.path || '';
        if (!assetPath.startsWith('/uploads/'))
            continue;
        const filename = path.basename(assetPath);
        const ext = path.extname(filename).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext))
            continue;
        const baseName = filename.slice(0, -ext.length);
        const newFilename = `${baseName}.avif`;
        const newPath = `/uploads/${newFilename}`;
        if (newPath === assetPath)
            continue;
        try {
            const avifFilePath = path.join(UPLOADS_DIR, newFilename);
            const avifStats = await fs.stat(avifFilePath);
            if (!avifStats.isFile())
                continue;
            await prisma.mediaAsset.update({
                where: { id: asset.id },
                data: {
                    path: newPath,
                    mime: 'image/avif',
                    sizeBytes: BigInt(avifStats.size),
                },
            });
            console.log(`  UPDATED ${assetPath} -> ${newPath}`);
            updated++;
        }
        catch (err) {
            console.error(`  FAIL update ${assetPath}: ${err?.message || err}`);
        }
    }
    console.log(`\nMediaAsset records updated: ${updated}`);
    await prisma.$disconnect();
}
main().catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=convert-existing-images-to-avif.js.map